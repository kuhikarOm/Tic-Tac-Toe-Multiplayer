import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Game } from '../models/Game.js';

export interface LeaderboardPlayer {
  username: string;
  wins: number;
  losses: number;
  draws: number;
  gamesPlayed: number;
  points: number;
}

// In-memory fallback if MongoDB is not connected
const inMemoryUsers = new Map<string, LeaderboardPlayer>();

function isMongoConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

export async function recordGameResult(data: {
  roomId: string;
  players: { username: string; symbol: 'X' | 'O'; id: string }[];
  winnerSymbol: 'X' | 'O' | 'draw';
  moves: { player: string; symbol: 'X' | 'O'; cellIndex: number; timestamp: number }[];
  startedAt: number;
  endedAt: number;
}): Promise<void> {
  const isDraw = data.winnerSymbol === 'draw';
  const winnerPlayer = isDraw
    ? null
    : data.players.find((p) => p.symbol === data.winnerSymbol);
  const loserPlayer = isDraw
    ? null
    : data.players.find((p) => p.symbol !== data.winnerSymbol);

  // In-memory update
  for (const p of data.players) {
    const existing = inMemoryUsers.get(p.username) || {
      username: p.username,
      wins: 0,
      losses: 0,
      draws: 0,
      gamesPlayed: 0,
      points: 0,
    };

    existing.gamesPlayed += 1;
    if (isDraw) {
      existing.draws += 1;
      existing.points += 1;
    } else if (winnerPlayer && p.username === winnerPlayer.username) {
      existing.wins += 1;
      existing.points += 3;
    } else {
      existing.losses += 1;
    }
    inMemoryUsers.set(p.username, existing);
  }

  // MongoDB update if connected
  if (isMongoConnected()) {
    try {
      // 1. Save match history
      await Game.create({
        roomId: data.roomId,
        players: data.players,
        winner: winnerPlayer ? winnerPlayer.username : null,
        moves: data.moves.map((m) => ({
          player: m.player,
          symbol: m.symbol,
          cellIndex: m.cellIndex,
          timestamp: new Date(m.timestamp),
        })),
        result: isDraw ? 'draw' : 'win',
        startedAt: new Date(data.startedAt),
        endedAt: new Date(data.endedAt),
      });

      // 2. Update player statistics
      if (isDraw) {
        for (const p of data.players) {
          await User.findOneAndUpdate(
            { username: p.username },
            {
              $inc: { draws: 1, gamesPlayed: 1, points: 1 },
              $setOnInsert: { wins: 0, losses: 0 },
            },
            { upsert: true, returnDocument: 'after' }
          );
        }
      } else if (winnerPlayer && loserPlayer) {
        await User.findOneAndUpdate(
          { username: winnerPlayer.username },
          {
            $inc: { wins: 1, gamesPlayed: 1, points: 3 },
            $setOnInsert: { losses: 0, draws: 0 },
          },
          { upsert: true, returnDocument: 'after' }
        );

        await User.findOneAndUpdate(
          { username: loserPlayer.username },
          {
            $inc: { losses: 1, gamesPlayed: 1 },
            $setOnInsert: { wins: 0, draws: 0, points: 0 },
          },
          { upsert: true, returnDocument: 'after' }
        );
      }
    } catch (err) {
      console.error('Error saving game record to MongoDB:', err);
    }
  }
}

export async function getTopPlayers(limit: number = 50): Promise<LeaderboardPlayer[]> {
  if (isMongoConnected()) {
    try {
      const users = await User.find()
        .sort({ points: -1, wins: -1, gamesPlayed: 1 })
        .limit(limit)
        .lean();

      return users.map((u) => ({
        username: u.username,
        wins: u.wins,
        losses: u.losses,
        draws: u.draws,
        gamesPlayed: u.gamesPlayed,
        points: u.points,
      }));
    } catch (err) {
      console.error('Error fetching leaderboard from MongoDB:', err);
    }
  }

  // Fallback to in-memory
  return Array.from(inMemoryUsers.values())
    .sort((a, b) => b.points - a.points || b.wins - a.wins)
    .slice(0, limit);
}

export async function getPlayerStats(username: string): Promise<LeaderboardPlayer | null> {
  if (isMongoConnected()) {
    try {
      const user = await User.findOne({ username }).lean();
      if (user) {
        return {
          username: user.username,
          wins: user.wins,
          losses: user.losses,
          draws: user.draws,
          gamesPlayed: user.gamesPlayed,
          points: user.points,
        };
      }
    } catch (err) {
      console.error('Error fetching player stats from MongoDB:', err);
    }
  }

  return inMemoryUsers.get(username) || null;
}
