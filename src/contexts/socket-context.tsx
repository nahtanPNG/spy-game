"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { io, Socket } from "socket.io-client";
import {
  ClientToServerEvents,
  ServerToClientEvents,
  Sala,
  Jogador,
} from "@/types/socket";

type SocketType = Socket<ServerToClientEvents, ClientToServerEvents>;

interface SocketContextType {
  socket: SocketType | null;
  conectado: boolean;
  sala: Sala | null;
  jogadorAtual: Jogador | null;
  erro: string;
  entrarSala: (codigo: string, nome: string, isHost?: boolean) => void;
  iniciarJogo: (codigo: string) => void;
  reiniciarJogo: (codigo: string) => void;
  revelarCarta: (codigo: string) => void;
  sairSala: (codigo: string) => void;
  limparErro: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<SocketType | null>(null);
  const [conectado, setConectado] = useState(false);
  const [sala, setSala] = useState<Sala | null>(null);
  const [jogadorAtual, setJogadorAtual] = useState<Jogador | null>(null);
  const [erro, setErro] = useState<string>("");

  const socketRef = useRef<SocketType | null>(null);

  useEffect(() => {
    // Previne múltiplas conexões
    if (socketRef.current) return;

    console.log("Inicializando conexão Socket.IO...");

    // Inicializa conexão Socket.IO
    const socketIO: SocketType = io({
      path: "/api/socket",
      addTrailingSlash: false,
    });

    socketRef.current = socketIO;
    setSocket(socketIO);

    // Eventos de conexão
    socketIO.on("connect", () => {
      console.log("✅ Conectado ao servidor Socket.IO:", socketIO.id);
      setConectado(true);
      setErro("");
    });

    socketIO.on("disconnect", (reason) => {
      console.log("❌ Desconectado do servidor:", reason);
      setConectado(false);
    });

    socketIO.on("connect_error", (error) => {
      console.error("❌ Erro de conexão:", error);
      setErro("Erro de conexão com o servidor");
    });

    // Eventos do jogo
    socketIO.on("sala-atualizada", (salaAtualizada) => {
      console.log("🔄 Sala atualizada:", salaAtualizada);
      setSala(salaAtualizada);

      // Encontra o jogador atual
      const jogador = salaAtualizada.jogadores.find(
        (j) => j.socketId === socketIO.id
      );
      if (jogador) {
        setJogadorAtual(jogador);
        console.log("👤 Jogador atual atualizado:", jogador);
      }
    });

    socketIO.on("jogador-entrou", (jogador) => {
      console.log("➕ Novo jogador entrou:", jogador.nome);
    });

    socketIO.on("jogador-saiu", (jogadorId) => {
      console.log("➖ Jogador saiu:", jogadorId);
    });

    socketIO.on("jogo-iniciado", (salaAtualizada) => {
      console.log("🎮 Jogo iniciado!");
      setSala(salaAtualizada);

      // Encontra o jogador atual com a carta
      const jogador = salaAtualizada.jogadores.find(
        (j) => j.socketId === socketIO.id
      );
      if (jogador) {
        setJogadorAtual(jogador);
        console.log("👤 Jogador atual com nova carta:", jogador);
      }
    });

    socketIO.on("jogo-reiniciado", (salaAtualizada) => {
      console.log("🔄 Jogo reiniciado! Nova sala:", salaAtualizada);
      setSala(salaAtualizada);

      // Encontra o jogador atual com a NOVA carta
      const jogador = salaAtualizada.jogadores.find(
        (j) => j.socketId === socketIO.id
      );

      if (jogador) {
        console.log("👤 Jogador atual com carta reiniciada:", {
          nome: jogador.nome,
          carta: jogador.carta,
          cartaRevelada: jogador.cartaRevelada,
        });
        setJogadorAtual(jogador);
      }
    });

    socketIO.on("carta-revelada", (jogadorId) => {
      console.log("🃏 Carta revelada por jogador:", jogadorId);
    });

    socketIO.on("erro", (mensagem) => {
      console.error("❌ Erro do servidor:", mensagem);
      setErro(mensagem);
    });

    socketIO.on("sala-nao-encontrada", () => {
      console.error("❌ Sala não encontrada");
      setErro("Sala não encontrada");
    });

    // Cleanup na desmontagem do provider
    return () => {
      console.log("🧹 Limpando conexão Socket.IO...");
      socketIO.disconnect();
      socketRef.current = null;
    };
  }, []);

  // Funções para interagir com o servidor
  const entrarSala = useCallback(
    (codigo: string, nome: string, isHost: boolean = false) => {
      if (socket && conectado) {
        console.log(
          `🚪 Tentando entrar na sala: ${codigo}, nome: ${nome}, host: ${isHost}`
        );
        setErro("");
        socket.emit("entrar-sala", { codigo, nome, isHost });
      } else {
        console.log("❌ Socket não conectado ainda");
        setErro("Não conectado ao servidor");
      }
    },
    [socket, conectado]
  );

  const iniciarJogo = useCallback(
    (codigo: string) => {
      if (socket && conectado) {
        console.log(`🎯 Iniciando jogo na sala: ${codigo}`);
        setErro("");
        socket.emit("iniciar-jogo", codigo);
      }
    },
    [socket, conectado]
  );

  const reiniciarJogo = useCallback(
    (codigo: string) => {
      if (socket && conectado) {
        console.log(`🔄 Reiniciando jogo na sala: ${codigo}`);
        setErro("");
        socket.emit("reiniciar-jogo", codigo);
      } else {
        console.log("❌ Não foi possível reiniciar - socket não conectado");
        setErro("Não conectado ao servidor");
      }
    },
    [socket, conectado]
  );

  const revelarCarta = useCallback(
    (codigo: string) => {
      if (socket && conectado) {
        console.log(`🃏 Revelando carta na sala: ${codigo}`);
        setErro("");
        socket.emit("revelar-carta", codigo);
      }
    },
    [socket, conectado]
  );

  const sairSala = useCallback(
    (codigo: string) => {
      if (socket) {
        console.log(`🚪 Saindo da sala: ${codigo}`);
        socket.emit("sair-sala", codigo);
        setSala(null);
        setJogadorAtual(null);
      }
    },
    [socket]
  );

  const limparErro = useCallback(() => {
    setErro("");
  }, []);

  const value: SocketContextType = {
    socket,
    conectado,
    sala,
    jogadorAtual,
    erro,
    entrarSala,
    iniciarJogo,
    reiniciarJogo,
    revelarCarta,
    sairSala,
    limparErro,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket deve ser usado dentro de um SocketProvider");
  }
  return context;
}
