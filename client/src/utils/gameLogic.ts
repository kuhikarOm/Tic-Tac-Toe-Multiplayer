import type { CellValue, PlayerSymbol } from '../types/game';

export const WINNING_COMBINATIONS = [
  // Rows
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  // Columns
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  // Diagonals
  [0, 4, 8],
  [2, 4, 6],
];

export function createEmptyBoard(): CellValue[] {
  return Array(9).fill(null);
}

export function checkWinner(board: CellValue[]): {
  winner: PlayerSymbol | null;
  winningLine: number[] | null;
} {
  for (const combination of WINNING_COMBINATIONS) {
    const [a, b, c] = combination;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], winningLine: combination };
    }
  }
  return { winner: null, winningLine: null };
}

export function checkDraw(board: CellValue[]): boolean {
  return board.every((cell) => cell !== null);
}

export function getOrCreatePlayerId(): string {
  const STORAGE_KEY = 'tictactoe_player_id';
  let playerId = localStorage.getItem(STORAGE_KEY);
  if (!playerId) {
    playerId = 'player_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    localStorage.setItem(STORAGE_KEY, playerId);
  }
  return playerId;
}

export function getSavedUsername(): string {
  return localStorage.getItem('tictactoe_username') || '';
}

export function saveUsername(username: string): void {
  localStorage.setItem('tictactoe_username', username);
}
