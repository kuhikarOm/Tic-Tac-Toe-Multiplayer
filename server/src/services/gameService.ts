import { RoomState, PlayerState } from '../models/Room.js';
import { checkDraw, checkWinner, createEmptyBoard, PlayerSymbol } from '../utils/gameLogic.js';
import { recordGameResult } from './leaderboardService.js';

export class GameService {
  private rooms = new Map<string, RoomState>();
  private socketToPlayer = new Map<string, { roomId: string; playerId: string }>();
  private disconnectTimers = new Map<string, NodeJS.Timeout>();

  public getRoom(roomId: string): RoomState | undefined {
    return this.rooms.get(roomId);
  }

  public getPlayerMapping(socketId: string) {
    return this.socketToPlayer.get(socketId);
  }

  public joinRoom(
    roomId: string,
    username: string,
    playerId: string,
    socketId: string
  ): { success: boolean; room?: RoomState; error?: string; reconnected?: boolean } {
    const cleanRoomId = roomId.toUpperCase();
    let room = this.rooms.get(cleanRoomId);

    // Cancel any pending disconnect timer for this playerId
    const timerKey = `${cleanRoomId}:${playerId}`;
    if (this.disconnectTimers.has(timerKey)) {
      clearTimeout(this.disconnectTimers.get(timerKey)!);
      this.disconnectTimers.delete(timerKey);
    }

    if (!room) {
      // Create new room
      const newPlayer: PlayerState = {
        id: playerId,
        socketId,
        username,
        symbol: 'X',
        connected: true,
      };

      room = {
        roomId: cleanRoomId,
        players: [newPlayer],
        board: createEmptyBoard(),
        currentTurn: 'X',
        startingTurn: 'X',
        status: 'waiting',
        winner: null,
        winningLine: null,
        rematchRequestedBy: [],
        moves: [],
        createdAt: Date.now(),
      };

      this.rooms.set(cleanRoomId, room);
      this.socketToPlayer.set(socketId, { roomId: cleanRoomId, playerId });
      return { success: true, room };
    }

    // Check if player is reconnecting (by playerId or username)
    const existingPlayer = room.players.find(
      (p) => p.id === playerId || p.username.toLowerCase() === username.toLowerCase()
    );

    if (existingPlayer) {
      existingPlayer.id = playerId;
      existingPlayer.socketId = socketId;
      existingPlayer.username = username;
      existingPlayer.connected = true;

      this.socketToPlayer.set(socketId, { roomId: cleanRoomId, playerId });
      return { success: true, room, reconnected: true };
    }

    // Check if room is full
    if (room.players.length >= 2) {
      return { success: false, error: 'Room is full. Maximum 2 players allowed.' };
    }

    // Add as second player (O)
    const secondPlayer: PlayerState = {
      id: playerId,
      socketId,
      username,
      symbol: 'O',
      connected: true,
    };

    room.players.push(secondPlayer);
    room.status = 'playing';
    room.startedAt = Date.now();

    this.socketToPlayer.set(socketId, { roomId: cleanRoomId, playerId });
    return { success: true, room };
  }

  public makeMove(
    roomId: string,
    playerId: string,
    cellIndex: number
  ): { success: boolean; room?: RoomState; error?: string } {
    const cleanRoomId = roomId.toUpperCase();
    const room = this.rooms.get(cleanRoomId);

    if (!room) {
      return { success: false, error: 'Room does not exist.' };
    }

    if (room.status !== 'playing') {
      return { success: false, error: 'Game is not currently active.' };
    }

    const player = room.players.find((p) => p.id === playerId);
    if (!player) {
      return { success: false, error: 'Player is not in this room.' };
    }

    if (room.currentTurn !== player.symbol) {
      return { success: false, error: 'Not your turn.' };
    }

    if (cellIndex < 0 || cellIndex > 8 || room.board[cellIndex] !== null) {
      return { success: false, error: 'Invalid move: cell is already occupied or out of bounds.' };
    }

    // Apply move
    room.board[cellIndex] = player.symbol;
    room.moves.push({
      player: player.username,
      symbol: player.symbol,
      cellIndex,
      timestamp: Date.now(),
    });

    // Check win condition
    const winResult = checkWinner(room.board);
    if (winResult.winner) {
      room.status = 'finished';
      room.winner = winResult.winner;
      room.winningLine = winResult.winningLine;
      room.endedAt = Date.now();

      // Persist to Leaderboard / Database
      recordGameResult({
        roomId: room.roomId,
        players: room.players.map((p) => ({
          username: p.username,
          symbol: p.symbol,
          id: p.id,
        })),
        winnerSymbol: winResult.winner,
        moves: room.moves,
        startedAt: room.startedAt || room.createdAt,
        endedAt: room.endedAt,
      });

      return { success: true, room };
    }

    // Check draw condition
    if (checkDraw(room.board)) {
      room.status = 'finished';
      room.winner = 'draw';
      room.winningLine = null;
      room.endedAt = Date.now();

      recordGameResult({
        roomId: room.roomId,
        players: room.players.map((p) => ({
          username: p.username,
          symbol: p.symbol,
          id: p.id,
        })),
        winnerSymbol: 'draw',
        moves: room.moves,
        startedAt: room.startedAt || room.createdAt,
        endedAt: room.endedAt,
      });

      return { success: true, room };
    }

    // Switch turns
    room.currentTurn = room.currentTurn === 'X' ? 'O' : 'X';
    return { success: true, room };
  }

  public requestRematch(
    roomId: string,
    playerId: string
  ): { success: boolean; room?: RoomState; error?: string; restarted?: boolean } {
    const cleanRoomId = roomId.toUpperCase();
    const room = this.rooms.get(cleanRoomId);

    if (!room) {
      return { success: false, error: 'Room does not exist.' };
    }

    if (room.status !== 'finished') {
      return { success: false, error: 'Cannot rematch while game is active.' };
    }

    if (!room.players.some((p) => p.id === playerId)) {
      return { success: false, error: 'Player is not in this room.' };
    }

    if (!room.rematchRequestedBy.includes(playerId)) {
      room.rematchRequestedBy.push(playerId);
    }

    // If both players have agreed to rematch
    if (room.rematchRequestedBy.length >= 2) {
      room.board = createEmptyBoard();
      const nextStartingTurn: PlayerSymbol = room.startingTurn === 'X' ? 'O' : 'X';
      room.startingTurn = nextStartingTurn;
      room.currentTurn = nextStartingTurn;
      room.status = 'playing';
      room.winner = null;
      room.winningLine = null;
      room.rematchRequestedBy = [];
      room.moves = [];
      room.startedAt = Date.now();

      return { success: true, room, restarted: true };
    }

    return { success: true, room, restarted: false };
  }

  public handleDisconnect(
    socketId: string,
    onGraceExpired?: (roomId: string, room: RoomState) => void
  ): { room?: RoomState; player?: PlayerState } {
    const mapping = this.socketToPlayer.get(socketId);
    if (!mapping) return {};

    const { roomId, playerId } = mapping;
    this.socketToPlayer.delete(socketId);

    const room = this.rooms.get(roomId);
    if (!room) return {};

    const player = room.players.find((p) => p.id === playerId);
    if (!player) return { room };

    player.connected = false;

    // Start a 30s grace period timer
    const timerKey = `${roomId}:${playerId}`;
    const timer = setTimeout(() => {
      this.disconnectTimers.delete(timerKey);
      // If player still disconnected
      if (!player.connected) {
        if (room.status === 'playing') {
          // Declare opponent winner by forfeit
          const opponent = room.players.find((p) => p.id !== playerId);
          if (opponent) {
            room.status = 'finished';
            room.winner = opponent.symbol;
            room.endedAt = Date.now();

            recordGameResult({
              roomId: room.roomId,
              players: room.players.map((p) => ({
                username: p.username,
                symbol: p.symbol,
                id: p.id,
              })),
              winnerSymbol: opponent.symbol,
              moves: room.moves,
              startedAt: room.startedAt || room.createdAt,
              endedAt: room.endedAt,
            });
          }
        }

        // If no one is connected in the room, remove it
        if (room.players.every((p) => !p.connected)) {
          this.rooms.delete(roomId);
        }

        if (onGraceExpired) {
          onGraceExpired(roomId, room);
        }
      }
    }, 30000);

    this.disconnectTimers.set(timerKey, timer);
    return { room, player };
  }

  public leaveRoom(roomId: string, playerId: string): { room?: RoomState; deleted?: boolean } {
    const cleanRoomId = roomId.toUpperCase();
    const room = this.rooms.get(cleanRoomId);
    if (!room) return {};

    // Remove player
    room.players = room.players.filter((p) => p.id !== playerId);

    // Cancel timer if any
    const timerKey = `${cleanRoomId}:${playerId}`;
    if (this.disconnectTimers.has(timerKey)) {
      clearTimeout(this.disconnectTimers.get(timerKey)!);
      this.disconnectTimers.delete(timerKey);
    }

    if (room.players.length === 0) {
      this.rooms.delete(cleanRoomId);
      return { deleted: true };
    }

    // If opponent is left and game was in progress, set status to finished
    if (room.status === 'playing' && room.players.length === 1) {
      room.status = 'finished';
      room.winner = room.players[0].symbol;
      room.endedAt = Date.now();
    }

    return { room, deleted: false };
  }
}

export const gameService = new GameService();
