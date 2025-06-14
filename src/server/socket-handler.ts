import { Server as NetServer } from "http";
import { NextApiRequest, NextApiResponse } from "next";
import { Server as ServerIO } from "socket.io";
import {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from "@/types/socket";
import { GameLogic } from "./game-logic";

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io: ServerIO<
        ClientToServerEvents,
        ServerToClientEvents,
        InterServerEvents,
        SocketData
      >;
    };
  };
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function SocketHandler(
  req: NextApiRequest,
  res: NextApiResponseServerIO
) {
  // Se já existe um servidor Socket.IO, não cria outro
  if (res.socket.server.io) {
    console.log("Socket.IO já está rodando");
    res.end();
    return;
  }

  console.log("Inicializando Socket.IO...");

  const io = new ServerIO<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(res.socket.server, {
    path: "/api/socket",
    addTrailingSlash: false,
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  res.socket.server.io = io;

  // Configurar eventos do Socket.IO
  io.on("connection", (socket) => {
    console.log(`Cliente conectado: ${socket.id}`);

    // Evento: Entrar na sala
    socket.on("entrar-sala", ({ codigo, nome, isHost }) => {
      console.log(
        `${nome} tentando entrar na sala ${codigo} (host: ${isHost})`
      );

      const sala = GameLogic.entrarSala(codigo, nome, socket.id, isHost);

      if (!sala) {
        socket.emit(
          "erro",
          "Não foi possível entrar na sala. Verifique o código ou tente outro nome."
        );
        return;
      }

      // Adiciona o socket à room da sala
      socket.join(codigo);

      // Armazena dados no socket
      socket.data.codigoSala = codigo;
      socket.data.jogadorId =
        sala.jogadores.find((j) => j.socketId === socket.id)?.id || "";

      // Notifica todos na sala sobre a atualização
      io.to(codigo).emit("sala-atualizada", sala);

      // Notifica sobre o novo jogador (exceto para ele mesmo)
      const novoJogador = sala.jogadores.find((j) => j.socketId === socket.id);
      if (novoJogador) {
        socket.to(codigo).emit("jogador-entrou", novoJogador);
      }

      console.log(
        `${nome} entrou na sala ${codigo}. Total de jogadores: ${sala.jogadores.length}`
      );
    });

    // Evento: Iniciar jogo
    socket.on("iniciar-jogo", (codigo) => {
      console.log(`Tentativa de iniciar jogo na sala ${codigo}`);

      const sala = GameLogic.iniciarJogo(codigo, socket.id);

      if (!sala) {
        socket.emit(
          "erro",
          "Não foi possível iniciar o jogo. Verifique se você é o host e se há jogadores suficientes."
        );
        return;
      }

      // Notifica todos na sala que o jogo começou
      io.to(codigo).emit("jogo-iniciado", sala);
      io.to(codigo).emit("sala-atualizada", sala);

      console.log(
        `Jogo iniciado na sala ${codigo}. Local: ${sala.local}, Espião: ${sala.espiao}`
      );
    });

    // Evento: Revelar carta
    socket.on("revelar-carta", (codigo) => {
      const { sala, jogador } = GameLogic.revelarCarta(codigo, socket.id);

      if (!sala || !jogador) {
        socket.emit("erro", "Não foi possível revelar a carta.");
        return;
      }

      // Notifica todos na sala sobre a carta revelada
      io.to(codigo).emit("carta-revelada", jogador.id);
      io.to(codigo).emit("sala-atualizada", sala);

      console.log(`${jogador.nome} revelou sua carta na sala ${codigo}`);
    });

    // Evento: Sair da sala
    socket.on("sair-sala", (codigo) => {
      handleLeaveRoom(socket, codigo);
    });

    // Evento: Desconexão
    socket.on("disconnect", () => {
      console.log(`Cliente desconectado: ${socket.id}`);

      if (socket.data.codigoSala) {
        handleLeaveRoom(socket, socket.data.codigoSala);
      }
    });

    // Função auxiliar para lidar com saída da sala
    function handleLeaveRoom(
      socket: import("socket.io").Socket<
        ClientToServerEvents,
        ServerToClientEvents,
        InterServerEvents,
        SocketData
      >,
      codigo: string
    ) {
      const { sala, jogadorRemovido } = GameLogic.sairSala(codigo, socket.id);

      socket.leave(codigo);

      if (jogadorRemovido) {
        if (sala) {
          // Notifica os outros jogadores
          io.to(codigo).emit("jogador-saiu", jogadorRemovido.id);
          io.to(codigo).emit("sala-atualizada", sala);
        }

        console.log(`${jogadorRemovido.nome} saiu da sala ${codigo}`);
      }
    }
  });

  // Limpeza periódica de salas antigas (executa a cada hora)
  setInterval(() => {
    GameLogic.limparSalasAntigas();
  }, 60 * 60 * 1000);

  console.log("Socket.IO configurado com sucesso");
  res.end();
}
