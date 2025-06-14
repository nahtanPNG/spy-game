export interface Jogador {
  id: string;
  nome: string;
  carta: "espiao" | string;
  cartaRevelada: boolean;
}

export interface Sala {
  codigo: string;
  jogadores: Jogador[];
  local: string;
  espiao: string;
  status: "aguardando" | "em-jogo" | "finalizada";
  maxJogadores: number;
}

export interface EstadoJogo {
  sala: Sala | null;
  jogadorAtual: Jogador | null;
  conectado: boolean;
}
