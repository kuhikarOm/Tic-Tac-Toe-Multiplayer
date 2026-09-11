import type { CellValue, PlayerSymbol } from '../utils/gameLogic.js';

export type GameStatus = 'waiting' | 'playing' | 'finished';

export interface PlayerState {
  id: string; // Persistent client ID
  socketId: string;
  username: string;
  symbol: PlayerSymbol;
  connected: boolean;
  score?: number;
}

export interface MoveRecord {
  player: string; // username
  symbol: PlayerSymbol;
  cellIndex: number;
  timestamp: number;
}

export interface RoomState {
  roomId: string;
  players: PlayerState[];
  board: CellValue[];
  currentTurn: PlayerSymbol;
  status: GameStatus;
  winner: PlayerSymbol | 'draw' | null;
  winningLine: number[] | null;
  rematchRequestedBy: string[]; // Player IDs
  moves: MoveRecord[];
  createdAt: number;
  startedAt?: number;
  endedAt?: number;
}
