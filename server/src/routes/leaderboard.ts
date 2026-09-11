import { Router, Request, Response } from 'express';
import { getTopPlayers, getPlayerStats } from '../services/leaderboardService.js';

const router = Router();

router.get('/leaderboard', async (_req: Request, res: Response) => {
  try {
    const players = await getTopPlayers(50);
    res.json({ players });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve leaderboard' });
  }
});

router.get('/players/:username', async (req: Request, res: Response) => {
  try {
    const param = req.params.username;
    const username = Array.isArray(param) ? param[0] : param;
    if (!username) {
      res.status(400).json({ error: 'Username is required' });
      return;
    }
    const stats = await getPlayerStats(username);
    if (!stats) {
      res.status(404).json({ error: 'Player not found' });
      return;
    }
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve player stats' });
  }
});

export default router;
