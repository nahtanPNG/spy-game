"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { GAME_LOCATIONS } from "@/data/locations";

interface Jogador {
  id: string;
  nome: string;
  carta: "espiao" | string;
  cartaRevelada: boolean;
  isHost: boolean;
}

interface EstadoSala {
  codigo: string;
  jogadores: Jogador[];
  local: string;
  espiao: string;
  status: "aguardando" | "em-jogo" | "finalizada";
  maxJogadores: number;
}

export default function SalaPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const codigoSala = params.codigo as string;
  const nomeJogador = searchParams.get("nome") || "";
  const isHost = searchParams.get("host") === "true";

  const [sala, setSala] = useState<EstadoSala>({
    codigo: codigoSala,
    jogadores: [],
    local: "",
    espiao: "",
    status: "aguardando",
    maxJogadores: 15,
  });

  const [jogadorAtual, setJogadorAtual] = useState<Jogador | null>(null);
  const [mostrarCarta, setMostrarCarta] = useState(false);
  const [mostrarLocais, setMostrarLocais] = useState(false);

  // Simular entrada na sala (depois será substituído pelo WebSocket)
  useEffect(() => {
    if (!nomeJogador) {
      router.push("/");
      return;
    }

    // Simular jogador atual
    const novoJogador: Jogador = {
      id: Math.random().toString(36).substring(7),
      nome: nomeJogador,
      carta: "",
      cartaRevelada: false,
      isHost: isHost,
    };

    setJogadorAtual(novoJogador);

    // Simular alguns jogadores na sala (para teste)
    setSala((prev) => ({
      ...prev,
      jogadores: [
        novoJogador,
        // Jogadores fictícios para teste
        {
          id: "2",
          nome: "Ana",
          carta: "",
          cartaRevelada: false,
          isHost: false,
        },
        {
          id: "3",
          nome: "Carlos",
          carta: "",
          cartaRevelada: false,
          isHost: false,
        },
      ],
    }));
  }, [nomeJogador, isHost, router]);

  const iniciarJogo = () => {
    if (sala.jogadores.length < 3) {
      alert("Mínimo de 3 jogadores para iniciar!");
      return;
    }

    // Escolher local aleatório
    const localEscolhido =
      GAME_LOCATIONS[Math.floor(Math.random() * GAME_LOCATIONS.length)];

    // Escolher espião aleatório
    const espiaoEscolhido =
      sala.jogadores[Math.floor(Math.random() * sala.jogadores.length)];

    // Distribuir cartas
    const jogadoresComCartas = sala.jogadores.map((jogador) => ({
      ...jogador,
      carta: jogador.id === espiaoEscolhido.id ? "espiao" : localEscolhido,
    }));

    setSala((prev) => ({
      ...prev,
      status: "em-jogo",
      local: localEscolhido,
      espiao: espiaoEscolhido.id,
      jogadores: jogadoresComCartas,
    }));

    // Atualizar jogador atual
    const jogadorAtualizadao = jogadoresComCartas.find(
      (j) => j.id === jogadorAtual?.id
    );
    if (jogadorAtualizadao) {
      setJogadorAtual(jogadorAtualizadao);
    }
  };

  const revelarCarta = () => {
    setMostrarCarta(true);
    // Marcar carta como revelada
    if (jogadorAtual) {
      setSala((prev) => ({
        ...prev,
        jogadores: prev.jogadores.map((j) =>
          j.id === jogadorAtual.id ? { ...j, cartaRevelada: true } : j
        ),
      }));
    }
  };

  const voltarHome = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gray-900 rounded-2xl p-6 mb-6 shadow-xl border border-gray-800">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Sala {codigoSala}
              </h1>
              <p className="text-gray-400">
                {sala.jogadores.length} jogador(es) • Status:{" "}
                {sala.status === "aguardando"
                  ? "Aguardando"
                  : sala.status === "em-jogo"
                  ? "Em jogo"
                  : "Finalizada"}
              </p>
            </div>
            <button
              onClick={voltarHome}
              className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-all"
            >
              Sair
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Coluna Esquerda - Jogadores */}
          <div className="bg-gray-900 rounded-2xl p-6 shadow-xl border border-gray-800">
            <h2 className="text-xl font-bold text-white mb-4">Jogadores</h2>

            <div className="space-y-3">
              {sala.jogadores.map((jogador) => (
                <div
                  key={jogador.id}
                  className={`p-4 rounded-lg border transition-all ${
                    jogador.id === jogadorAtual?.id
                      ? "bg-white text-black border-gray-300"
                      : "bg-gray-800 border-gray-700 text-gray-300"
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
                  onClick={iniciarJogo}
                  disabled={sala.jogadores.length < 3}
                  className="w-full py-4 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Iniciar Jogo ({sala.jogadores.length}/15)
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
            <div className="bg-gray-900 rounded-2xl p-6 shadow-xl border border-gray-800">
              <h2 className="text-xl font-bold text-white mb-4">Sua Carta</h2>

              {sala.status === "aguardando" && (
                <div className="text-center py-8">
                  <p className="text-gray-400">Aguardando o jogo começar...</p>
                </div>
              )}

              {sala.status === "em-jogo" && !mostrarCarta && (
                <div className="text-center py-8">
                  <div className="mb-4">
                    <div className="w-32 h-48 mx-auto bg-gray-800 rounded-lg flex items-center justify-center shadow-xl border border-gray-700 hover:bg-gray-700 transition-all cursor-pointer">
                      <span className="text-4xl text-gray-400">?</span>
                    </div>
                  </div>
                  <button
                    onClick={revelarCarta}
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
                          ? "bg-gray-800 border-red-500"
                          : "bg-gray-800 border-green-500"
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
              <div className="bg-gray-900 rounded-2xl p-6 shadow-xl border border-gray-800">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-white">
                    Locais Possíveis
                  </h2>
                  <button
                    onClick={() => setMostrarLocais(!mostrarLocais)}
                    className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-all"
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
                            : "bg-gray-800 text-gray-300 hover:bg-gray-700"
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
      </div>
    </div>
  );
}
