import type { Player, PlayerSymbol } from './player';
export type { Player, PlayerSymbol } from './player';

export type CellValue = PlayerSymbol | null;

export type GameStatus = 'waiting' | 'playing' | 'finished';

export interface Room {
  roomId: string;
  players: Player[];
  board: CellValue[];
  currentTurn: PlayerSymbol;
  status: GameStatus;
  winner: PlayerSymbol | 'draw' | null;
  winningLine: number[] | null;
  rematchRequestedBy: string[]; // List of player IDs
  createdAt?: number;
}

export interface MovePayload {
  roomId: string;
  cellIndex: number;
}

export interface JoinRoomPayload {
  username: string;
  roomId: string;
  playerId?: string;
}

export interface RematchPayload {
  roomId: string;
  playerId: string;
}
