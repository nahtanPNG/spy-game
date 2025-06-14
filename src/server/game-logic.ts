import { Sala, Jogador } from "@/types/socket";
import { GAME_LOCATIONS } from "@/data/locations";

// Armazenamento em memória das salas (em produção usaria Redis/Database)
export const salas = new Map<string, Sala>();

export class GameLogic {
  static criarSala(
    codigo: string,
    hostNome: string,
    hostSocketId: string
  ): Sala {
    const host: Jogador = {
      id: this.gerarId(),
      nome: hostNome,
      carta: "",
      cartaRevelada: false,
      isHost: true,
      socketId: hostSocketId,
    };

    const novaSala: Sala = {
      codigo,
      jogadores: [host],
      local: "",
      espiao: "",
      status: "aguardando",
      maxJogadores: 15,
      criadaEm: new Date(),
    };

    salas.set(codigo, novaSala);
    return novaSala;
  }

  static entrarSala(
    codigo: string,
    nomeJogador: string,
    socketId: string,
    isHost: boolean = false
  ): Sala | null {
    const sala = salas.get(codigo);

    // Se não existe e é host, cria a sala
    if (!sala && isHost) {
      return this.criarSala(codigo, nomeJogador, socketId);
    }

    // Se não existe e não é host, retorna null
    if (!sala) {
      return null;
    }

    // Verifica se o jogo já começou
    if (sala.status !== "aguardando") {
      return null;
    }

    // Verifica se a sala está cheia
    if (sala.jogadores.length >= sala.maxJogadores) {
      return null;
    }

    // Verifica se o nome já existe
    const nomeExiste = sala.jogadores.some(
      (j) => j.nome.toLowerCase() === nomeJogador.toLowerCase()
    );
    if (nomeExiste) {
      return null;
    }

    // Adiciona o jogador
    const novoJogador: Jogador = {
      id: this.gerarId(),
      nome: nomeJogador,
      carta: "",
      cartaRevelada: false,
      isHost: false,
      socketId,
    };

    sala.jogadores.push(novoJogador);
    salas.set(codigo, sala);

    return sala;
  }

  static sairSala(
    codigo: string,
    socketId: string
  ): { sala: Sala | null; jogadorRemovido: Jogador | null } {
    const sala = salas.get(codigo);
    if (!sala) {
      return { sala: null, jogadorRemovido: null };
    }

    const jogadorIndex = sala.jogadores.findIndex(
      (j) => j.socketId === socketId
    );
    if (jogadorIndex === -1) {
      return { sala, jogadorRemovido: null };
    }

    const jogadorRemovido = sala.jogadores[jogadorIndex];
    sala.jogadores.splice(jogadorIndex, 1);

    // Se não sobrou ninguém, remove a sala
    if (sala.jogadores.length === 0) {
      salas.delete(codigo);
      return { sala: null, jogadorRemovido };
    }

    // Se o host saiu, passa o host para outro jogador
    if (jogadorRemovido.isHost && sala.jogadores.length > 0) {
      sala.jogadores[0].isHost = true;
    }

    salas.set(codigo, sala);
    return { sala, jogadorRemovido };
  }

  static iniciarJogo(codigo: string, hostSocketId: string): Sala | null {
    const sala = salas.get(codigo);
    if (!sala) return null;

    // Verifica se quem está iniciando é o host
    const host = sala.jogadores.find(
      (j) => j.socketId === hostSocketId && j.isHost
    );
    if (!host) return null;

    // Verifica se há jogadores suficientes
    if (sala.jogadores.length < 3) return null;

    // Verifica se o jogo já começou
    if (sala.status !== "aguardando") return null;

    // Escolhe um local aleatório
    const localEscolhido =
      GAME_LOCATIONS[Math.floor(Math.random() * GAME_LOCATIONS.length)];

    // Escolhe um espião aleatório
    const espiaoIndex = Math.floor(Math.random() * sala.jogadores.length);
    const espiaoEscolhido = sala.jogadores[espiaoIndex];

    // Distribui as cartas
    sala.jogadores = sala.jogadores.map((jogador, index) => ({
      ...jogador,
      carta: index === espiaoIndex ? "espiao" : localEscolhido,
      cartaRevelada: false,
    }));

    // Atualiza o estado da sala
    sala.local = localEscolhido;
    sala.espiao = espiaoEscolhido.id;
    sala.status = "em-jogo";

    salas.set(codigo, sala);
    return sala;
  }

  static reiniciarJogo(codigo: string, hostSocketId: string): Sala | null {
    const sala = salas.get(codigo);
    if (!sala) {
      console.log(`Sala ${codigo} não encontrada`);
      return null;
    }

    // Verifica se quem está reiniciando é o host
    const host = sala.jogadores.find(
      (j) => j.socketId === hostSocketId && j.isHost
    );
    if (!host) {
      console.log(`Socket ${hostSocketId} não é host da sala ${codigo}`);
      return null;
    }

    if (sala.jogadores.length < 3) {
      console.log(`Sala ${codigo} não tem jogadores suficientes`);
      return null;
    }

    console.log(`Reiniciando jogo na sala ${codigo}...`);

    // NOVO JOGO: Escolhe um local aleatório
    const localEscolhido =
      GAME_LOCATIONS[Math.floor(Math.random() * GAME_LOCATIONS.length)];

    // Escolhe um espião aleatório
    const espiaoIndex = Math.floor(Math.random() * sala.jogadores.length);
    const espiaoEscolhido = sala.jogadores[espiaoIndex];

    // Distribui as novas cartas
    sala.jogadores = sala.jogadores.map((jogador, index) => ({
      ...jogador,
      carta: index === espiaoIndex ? "espiao" : localEscolhido,
      cartaRevelada: false,
    }));

    // Atualiza o estado da sala para o novo jogo
    sala.local = localEscolhido;
    sala.espiao = espiaoEscolhido.id;
    sala.status = "em-jogo";

    salas.set(codigo, sala);

    console.log(
      `Jogo reiniciado na sala ${codigo}. Novo local: ${sala.local}, Novo espião: ${sala.espiao}`
    );

    return sala;
  }

  static revelarCarta(
    codigo: string,
    socketId: string
  ): { sala: Sala | null; jogador: Jogador | null } {
    const sala = salas.get(codigo);
    if (!sala) return { sala: null, jogador: null };

    const jogadorIndex = sala.jogadores.findIndex(
      (j) => j.socketId === socketId
    );
    if (jogadorIndex === -1) return { sala, jogador: null };

    // Marca a carta como revelada
    sala.jogadores[jogadorIndex].cartaRevelada = true;

    salas.set(codigo, sala);
    return { sala, jogador: sala.jogadores[jogadorIndex] };
  }

  static obterSala(codigo: string): Sala | null {
    return salas.get(codigo) || null;
  }

  static obterJogadorPorSocket(
    codigo: string,
    socketId: string
  ): Jogador | null {
    const sala = salas.get(codigo);
    if (!sala) return null;

    return sala.jogadores.find((j) => j.socketId === socketId) || null;
  }

  private static gerarId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  // Limpar salas antigas (executar periodicamente)
  static limparSalasAntigas(): void {
    const agora = new Date();
    const TEMPO_LIMITE = 24 * 60 * 60 * 1000; // 24 horas

    for (const [codigo, sala] of salas.entries()) {
      const tempoDecorrido = agora.getTime() - sala.criadaEm.getTime();

      if (tempoDecorrido > TEMPO_LIMITE) {
        salas.delete(codigo);
        console.log(`Sala ${codigo} removida por inatividade`);
      }
    }
  }
}
