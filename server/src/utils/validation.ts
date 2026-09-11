import { z } from 'zod';

export const JoinRoomSchema = z.object({
  username: z
    .string()
    .trim()
    .min(2, 'Username must be at least 2 characters')
    .max(20, 'Username must not exceed 20 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens and underscores'),
  roomId: z
    .string()
    .trim()
    .toUpperCase()
    .min(3, 'Room ID must be at least 3 characters')
    .max(20, 'Room ID must not exceed 20 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Room ID can only contain letters, numbers, hyphens and underscores'),
  playerId: z.string().trim().min(1).optional(),
});

export const MoveSchema = z.object({
  roomId: z.string().trim().toUpperCase(),
  cellIndex: z.number().int().min(0).max(8),
});

export const RematchSchema = z.object({
  roomId: z.string().trim().toUpperCase(),
  playerId: z.string().trim().min(1),
});

export const LeaveRoomSchema = z.object({
  roomId: z.string().trim().toUpperCase(),
  playerId: z.string().trim().min(1).optional(),
});
