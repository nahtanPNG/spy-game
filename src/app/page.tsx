"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [nomeJogador, setNomeJogador] = useState("");
  const [codigoSala, setCodigoSala] = useState("");
  const [modo, setModo] = useState<"criar" | "entrar" | null>(null);
  const router = useRouter();

  const criarSala = () => {
    if (!nomeJogador.trim()) {
      alert("Digite seu nome!");
      return;
    }

    // Gera código aleatório de 6 caracteres
    const codigo = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Redireciona para a sala
    router.push(
      `/room/${codigo}?nome=${encodeURIComponent(nomeJogador)}&host=true`
    );
  };

  const entrarSala = () => {
    if (!nomeJogador.trim()) {
      alert("Digite seu nome!");
      return;
    }

    if (!codigoSala.trim()) {
      alert("Digite o código da sala!");
      return;
    }

    router.push(
      `/room/${codigoSala.toUpperCase()}?nome=${encodeURIComponent(
        nomeJogador
      )}`
    );
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="bg-zinc-900 rounded-2xl p-8 w-full max-w-md shadow-2xl border border-zinc-800">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Espião</h1>
          <p className="text-gray-400">Descubra quem é o espião</p>
        </div>

        {/* Input Nome */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Seu nome
          </label>
          <input
            type="text"
            value={nomeJogador}
            onChange={(e) => setNomeJogador(e.target.value)}
            placeholder="Digite seu nome"
            className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all"
            maxLength={20}
          />
        </div>

        {/* Botões principais */}
        {!modo && (
          <div className="space-y-4">
            <button
              onClick={() => setModo("criar")}
              className="w-full py-4 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-all"
            >
              Criar Nova Sala
            </button>

            <button
              onClick={() => setModo("entrar")}
              className="w-full py-4 bg-zinc-800 text-white font-semibold rounded-lg hover:bg-gray-700 border border-zinc-700 transition-all"
            >
              Entrar em Sala
            </button>
          </div>
        )}

        {/* Criar sala */}
        {modo === "criar" && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-gray-400 mb-4">Você será o host da sala</p>
            </div>

            <button
              onClick={criarSala}
              disabled={!nomeJogador.trim()}
              className="w-full py-4 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Criar Sala
            </button>

            <button
              onClick={() => setModo(null)}
              className="w-full py-3 text-gray-500 hover:text-gray-300 transition-colors"
            >
              ← Voltar
            </button>
          </div>
        )}

        {/* Entrar em sala */}
        {modo === "entrar" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Código da sala
              </label>
              <input
                type="text"
                value={codigoSala}
                onChange={(e) => setCodigoSala(e.target.value.toUpperCase())}
                placeholder="Ex: ABC123"
                className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all uppercase"
                maxLength={6}
              />
            </div>

            <button
              onClick={entrarSala}
              disabled={!nomeJogador.trim() || !codigoSala.trim()}
              className="w-full py-4 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Entrar na Sala
            </button>

            <button
              onClick={() => setModo(null)}
              className="w-full py-3 text-gray-500 hover:text-gray-300 transition-colors"
            >
              ← Voltar
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>3-15 jogadores</p>
        </div>
      </div>
    </div>
  );
}
