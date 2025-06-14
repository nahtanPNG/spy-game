"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { GAME_LOCATIONS } from "@/data/locations";
import { useSocket } from "@/contexts/socket-context";

export default function SalaPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const codigoSala = params?.code as string;
  const nomeJogador = searchParams?.get("nome") || "";
  const isHost = searchParams?.get("host") === "true";

  const [mostrarCarta, setMostrarCarta] = useState(false);
  const [mostrarLocais, setMostrarLocais] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const {
    conectado,
    sala,
    jogadorAtual,
    erro,
    entrarSala,
    iniciarJogo,
    revelarCarta,
    sairSala,
    limparErro,
  } = useSocket();

  // Entrar na sala quando carregar a página
  useEffect(() => {
    if (!nomeJogador) {
      router.push("/");
      return;
    }

    // Só tenta entrar na sala quando estiver conectado
    if (conectado && codigoSala && nomeJogador && !sala) {
      console.log("Tentando entrar na sala:", {
        codigoSala,
        nomeJogador,
        isHost,
      });
      entrarSala(codigoSala, nomeJogador, isHost);
    }
  }, [conectado, codigoSala, nomeJogador, isHost, sala, entrarSala, router]);

  // Log para debug
  useEffect(() => {
    console.log("Estado atual:", {
      conectado,
      sala: sala
        ? {
            codigo: sala.codigo,
            status: sala.status,
            jogadores: sala.jogadores.length,
          }
        : null,
      jogadorAtual: jogadorAtual
        ? { nome: jogadorAtual.nome, carta: jogadorAtual.carta }
        : null,
      erro,
    });
  }, [conectado, sala, jogadorAtual, erro]);

  // Reset da carta quando o jogo reinicia
  useEffect(() => {
    if (sala?.status === "aguardando") {
      setMostrarCarta(false);
    }
  }, [sala?.status]);

  const handleIniciarJogo = () => {
    if (!sala || sala.jogadores.length < 3) {
      alert("Mínimo de 3 jogadores para iniciar!");
      return;
    }

    setCarregando(true);
    iniciarJogo(codigoSala);

    // Remove o carregando após um tempo (vai ser atualizado pelo WebSocket)
    setTimeout(() => setCarregando(false), 2000);
  };

  const handleRevelarCarta = () => {
    setMostrarCarta(true);
    revelarCarta(codigoSala);
  };

  const handleVoltarHome = () => {
    sairSala(codigoSala);
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-zinc-900 rounded-2xl p-6 mb-6 shadow-xl border border-zinc-800">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Sala {codigoSala}
              </h1>
              <p className="text-gray-400">
                {sala?.jogadores.length || 0} jogador(es) • Status:{" "}
                {sala?.status === "aguardando"
                  ? "Aguardando"
                  : sala?.status === "em-jogo"
                  ? "Em jogo"
                  : "Finalizada"}
              </p>

              {/* Status de conexão */}
              <div className="mt-2">
                <div
                  className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                    conectado
                      ? "bg-green-900/30 text-green-400"
                      : "bg-red-900/30 text-red-400"
                  }`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                      conectado ? "bg-green-400" : "bg-red-400"
                    }`}
                  ></div>
                  {conectado ? "Conectado" : "Desconectado"}
                </div>
              </div>
            </div>
            <button
              onClick={handleVoltarHome}
              className="px-4 py-2 bg-zinc-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-all"
            >
              Sair
            </button>
          </div>
        </div>

        {/* Mostrar erros */}
        {erro && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-800 rounded-lg">
            <p className="text-red-300 text-sm">{erro}</p>
            <button
              onClick={limparErro}
              className="mt-2 text-xs text-red-400 hover:text-red-300"
            >
              Fechar
            </button>
          </div>
        )}

        {/* Loading state */}
        {!sala && conectado && (
          <div className="text-center py-8">
            <p className="text-gray-400">Carregando sala...</p>
          </div>
        )}

        {sala && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Coluna Esquerda - Jogadores */}
            <div className="bg-zinc-900 rounded-2xl p-6 shadow-xl border border-zinc-800">
              <h2 className="text-xl font-bold text-white mb-4">Jogadores</h2>

              <div className="space-y-3">
                {sala.jogadores.map((jogador) => (
                  <div
                    key={jogador.id}
                    className={`p-4 rounded-lg border transition-all ${
                      jogador.id === jogadorAtual?.id
                        ? "bg-white text-black border-gray-300"
                        : "bg-zinc-800 border-zinc-700 text-gray-300"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        {jogador.nome}
                        {jogador.isHost && " (host)"}
                        {jogador.id === jogadorAtual?.id && " (você)"}
                      </span>
                      <span className="text-sm">
                        {sala.status === "em-jogo" && jogador.cartaRevelada
                          ? "Revelou"
                          : "Aguardando"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Botão Iniciar Jogo - só para host */}
              {sala.status === "aguardando" && jogadorAtual?.isHost && (
                <div className="mt-6">
                  <button
                    onClick={handleIniciarJogo}
                    disabled={sala.jogadores.length < 3 || carregando}
                    className="w-full py-4 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {carregando
                      ? "Iniciando..."
                      : `Iniciar Jogo (${sala.jogadores.length}/15)`}
                  </button>
                  {sala.jogadores.length < 3 && (
                    <p className="text-gray-500 text-sm mt-2 text-center">
                      Mínimo de 3 jogadores necessário
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Coluna Direita - Jogo */}
            <div className="space-y-6">
              {/* Sua Carta */}
              <div className="bg-zinc-900 rounded-2xl p-6 shadow-xl border border-zinc-800">
                <h2 className="text-xl font-bold text-white mb-4">Sua Carta</h2>

                {sala.status === "aguardando" && (
                  <div className="text-center py-8">
                    <p className="text-gray-400">
                      Aguardando o jogo começar...
                    </p>
                  </div>
                )}

                {sala.status === "em-jogo" && !mostrarCarta && (
                  <div className="text-center py-8">
                    <div className="mb-4">
                      <div className="w-32 h-48 mx-auto bg-zinc-800 rounded-lg flex items-center justify-center shadow-xl border border-zinc-700 hover:bg-gray-700 transition-all cursor-pointer">
                        <span className="text-4xl text-gray-400">?</span>
                      </div>
                    </div>
                    <button
                      onClick={handleRevelarCarta}
                      className="px-8 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-all"
                    >
                      Revelar Carta
                    </button>
                  </div>
                )}

                {sala.status === "em-jogo" && mostrarCarta && jogadorAtual && (
                  <div className="text-center py-4">
                    <div className="mb-4">
                      <div
                        className={`w-32 h-48 mx-auto rounded-lg flex items-center justify-center shadow-xl border ${
                          jogadorAtual.carta === "espiao"
                            ? "bg-zinc-800 border-red-500"
                            : "bg-zinc-800 border-green-500"
                        }`}
                      >
                        <div className="text-center text-white">
                          <div className="text-2xl mb-2 font-bold">
                            {jogadorAtual.carta === "espiao"
                              ? "ESPIÃO"
                              : jogadorAtual.carta}
                          </div>
                        </div>
                      </div>
                    </div>

                    {jogadorAtual.carta === "espiao" ? (
                      <div className="bg-red-900/30 border border-red-800 rounded-lg p-4">
                        <p className="text-red-300 font-medium">
                          Você é o espião!
                          <br />
                          Descubra o local sem ser descoberto
                        </p>
                      </div>
                    ) : (
                      <div className="bg-green-900/30 border border-green-800 rounded-lg p-4">
                        <p className="text-green-300 font-medium">
                          Você está em: <strong>{jogadorAtual.carta}</strong>
                          <br />
                          Descubra quem é o espião
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Lista de Locais */}
              {sala.status === "em-jogo" && (
                <div className="bg-zinc-900 rounded-2xl p-6 shadow-xl border border-zinc-800">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">
                      Locais Possíveis
                    </h2>
                    <button
                      onClick={() => setMostrarLocais(!mostrarLocais)}
                      className="px-4 py-2 bg-zinc-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-all"
                    >
                      {mostrarLocais ? "Ocultar" : "Mostrar"}
                    </button>
                  </div>

                  {mostrarLocais && (
                    <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                      {GAME_LOCATIONS.map((local, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg text-sm transition-all ${
                            local === sala.local &&
                            jogadorAtual?.carta !== "espiao"
                              ? "bg-green-900/50 text-green-300 border border-green-800"
                              : "bg-zinc-800 text-gray-300 hover:bg-gray-700"
                          }`}
                        >
                          {local}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
