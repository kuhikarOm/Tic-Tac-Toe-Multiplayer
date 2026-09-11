export type PlayerSymbol = 'X' | 'O';

export interface Player {
  id: string; // Persistent player ID or Socket ID
  socketId: string;
  username: string;
  symbol: PlayerSymbol;
  score?: number;
  connected: boolean;
  rematchRequested?: boolean;
}

export interface UserStats {
  username: string;
  wins: number;
  losses: number;
  draws: number;
  gamesPlayed: number;
  points: number;
  rank?: number;
  winRate?: string;
}
