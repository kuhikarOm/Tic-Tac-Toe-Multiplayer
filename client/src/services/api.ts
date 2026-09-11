import type { UserStats } from '../types/player';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

export interface LeaderboardResponse {
  players: UserStats[];
}

export async function fetchLeaderboard(): Promise<UserStats[]> {
  try {
    const res = await fetch(`${SERVER_URL}/api/leaderboard`);
    if (!res.ok) {
      throw new Error(`Error: ${res.statusText}`);
    }
    const data: LeaderboardResponse = await res.json();
    return data.players || [];
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error);
    return [];
  }
}

export async function fetchPlayerStats(username: string): Promise<UserStats | null> {
  try {
    const res = await fetch(`${SERVER_URL}/api/players/${encodeURIComponent(username)}`);
    if (!res.ok) {
      return null;
    }
    const data: UserStats = await res.json();
    return data;
  } catch (error) {
    console.error(`Failed to fetch stats for ${username}:`, error);
    return null;
  }
}
