import { Server, Socket } from 'socket.io';
import { gameService } from '../services/gameService.js';
import {
  JoinRoomSchema,
  MoveSchema,
  RematchSchema,
  LeaveRoomSchema,
} from '../utils/validation.js';

export function setupSocket(io: Server): void {
  io.on('connection', (socket: Socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // JOIN ROOM
    socket.on('join_room', (data: unknown) => {
      const validation = JoinRoomSchema.safeParse(data);
      if (!validation.success) {
        socket.emit('error_message', {
          message: validation.error.issues[0]?.message || 'Invalid room payload',
        });
        return;
      }

      const { roomId, username, playerId } = validation.data;
      const effectivePlayerId = playerId || socket.id;

      const result = gameService.joinRoom(
        roomId,
        username,
        effectivePlayerId,
        socket.id
      );

      if (!result.success || !result.room) {
        socket.emit('error_message', {
          message: result.error || 'Failed to join room',
        });
        return;
      }

      // Join socket room
      socket.join(result.room.roomId);

      // Broadcast room state to all clients in the room
      io.to(result.room.roomId).emit('room_state', result.room);

      if (result.reconnected) {
        socket.to(result.room.roomId).emit('player_reconnected', { username });
      }
    });

    // MAKE MOVE
    socket.on('make_move', (data: unknown) => {
      const validation = MoveSchema.safeParse(data);
      if (!validation.success) {
        socket.emit('error_message', {
          message: validation.error.issues[0]?.message || 'Invalid move payload',
        });
        return;
      }

      const { roomId, cellIndex } = validation.data;
      const playerMapping = gameService.getPlayerMapping(socket.id);

      if (!playerMapping || playerMapping.roomId !== roomId) {
        socket.emit('error_message', { message: 'Player is not active in this room' });
        return;
      }

      const result = gameService.makeMove(roomId, playerMapping.playerId, cellIndex);
      if (!result.success || !result.room) {
        socket.emit('error_message', {
          message: result.error || 'Invalid move',
        });
        return;
      }

      // Broadcast new state to both players
      io.to(result.room.roomId).emit('room_state', result.room);
    });

    // REQUEST REMATCH
    socket.on('request_rematch', (data: unknown) => {
      const validation = RematchSchema.safeParse(data);
      if (!validation.success) {
        socket.emit('error_message', {
          message: validation.error.issues[0]?.message || 'Invalid rematch payload',
        });
        return;
      }

      const { roomId, playerId } = validation.data;
      const result = gameService.requestRematch(roomId, playerId);

      if (!result.success || !result.room) {
        socket.emit('error_message', {
          message: result.error || 'Could not request rematch',
        });
        return;
      }

      io.to(result.room.roomId).emit('room_state', result.room);
    });

    // LEAVE ROOM
    socket.on('leave_room', (data: unknown) => {
      const validation = LeaveRoomSchema.safeParse(data);
      if (!validation.success) return;

      const { roomId, playerId } = validation.data;
      const playerMapping = gameService.getPlayerMapping(socket.id);
      const effectivePlayerId = playerId || playerMapping?.playerId;

      if (!effectivePlayerId) return;

      const result = gameService.leaveRoom(roomId, effectivePlayerId);
      socket.leave(roomId);

      if (result.room) {
        io.to(roomId).emit('room_state', result.room);
      }
    });

    // DISCONNECT
    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);

      const { room, player } = gameService.handleDisconnect(socket.id, (roomId, updatedRoom) => {
        io.to(roomId).emit('room_state', updatedRoom);
      });

      if (room && player) {
        socket.to(room.roomId).emit('player_disconnected', {
          username: player.username,
        });
        io.to(room.roomId).emit('room_state', room);
      }
    });
  });
}
