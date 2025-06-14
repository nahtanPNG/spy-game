import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import {
  ClientToServerEvents,
  ServerToClientEvents,
  Sala,
  Jogador,
} from "@/types/socket";

type SocketType = Socket<ServerToClientEvents, ClientToServerEvents>;

export function useSocket() {
  const [socket, setSocket] = useState<SocketType | null>(null);
  const [conectado, setConectado] = useState(false);
  const [sala, setSala] = useState<Sala | null>(null);
  const [jogadorAtual, setJogadorAtual] = useState<Jogador | null>(null);
  const [erro, setErro] = useState<string>("");

  const socketRef = useRef<SocketType | null>(null);

  useEffect(() => {
    // Inicializa conexão Socket.IO
    const socketIO: SocketType = io({
      path: "/api/socket",
      addTrailingSlash: false,
    });

    socketRef.current = socketIO;
    setSocket(socketIO);

    // Eventos de conexão
    socketIO.on("connect", () => {
      console.log("Conectado ao servidor");
      setConectado(true);
      setErro("");
    });

    socketIO.on("disconnect", () => {
      console.log("Desconectado do servidor");
      setConectado(false);
    });

    // Eventos do jogo
    socketIO.on("sala-atualizada", (salaAtualizada) => {
      console.log("Sala atualizada:", salaAtualizada);
      setSala(salaAtualizada);

      // Encontra o jogador atual
      const jogador = salaAtualizada.jogadores.find(
        (j) => j.socketId === socketIO.id
      );
      if (jogador) {
        setJogadorAtual(jogador);
      }
    });

    socketIO.on("jogador-entrou", (jogador) => {
      console.log("Novo jogador entrou:", jogador.nome);
    });

    socketIO.on("jogador-saiu", (jogadorId) => {
      console.log("Jogador saiu:", jogadorId);
    });

    socketIO.on("jogo-iniciado", (salaAtualizada) => {
      console.log("Jogo iniciado!");
      setSala(salaAtualizada);

      // Encontra o jogador atual com a carta
      const jogador = salaAtualizada.jogadores.find(
        (j) => j.socketId === socketIO.id
      );
      if (jogador) {
        setJogadorAtual(jogador);
      }
    });

    socketIO.on("carta-revelada", (jogadorId) => {
      console.log("Carta revelada por jogador:", jogadorId);
    });

    socketIO.on("erro", (mensagem) => {
      console.error("Erro do servidor:", mensagem);
      setErro(mensagem);
    });

    socketIO.on("sala-nao-encontrada", () => {
      console.error("Sala não encontrada");
      setErro("Sala não encontrada");
    });

    // Cleanup na desmontagem
    return () => {
      socketIO.disconnect();
    };
  }, []);

  // Funções para interagir com o servidor
  const entrarSala = (
    codigo: string,
    nome: string,
    isHost: boolean = false
  ) => {
    if (socket) {
      setErro("");
      socket.emit("entrar-sala", { codigo, nome, isHost });
    }
  };

  const iniciarJogo = (codigo: string) => {
    if (socket) {
      setErro("");
      socket.emit("iniciar-jogo", codigo);
    }
  };

  const revelarCarta = (codigo: string) => {
    if (socket) {
      setErro("");
      socket.emit("revelar-carta", codigo);
    }
  };

  const sairSala = (codigo: string) => {
    if (socket) {
      socket.emit("sair-sala", codigo);
      setSala(null);
      setJogadorAtual(null);
    }
  };

  const limparErro = () => {
    setErro("");
  };

  return {
    socket,
    conectado,
    sala,
    jogadorAtual,
    erro,
    entrarSala,
    iniciarJogo,
    revelarCarta,
    sairSala,
    limparErro,
  };
}
