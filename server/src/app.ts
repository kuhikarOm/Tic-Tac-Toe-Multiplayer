import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import leaderboardRouter from './routes/leaderboard.js';

export function createApp(): Express {
  const app = express();

  const clientUrl = process.env.CLIENT_URL || '*';

  app.use(
    cors({
      origin: clientUrl === '*' ? true : clientUrl,
      credentials: true,
    })
  );

  app.use(express.json());

  // Health check endpoint
  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // REST API routes
  app.use('/api', leaderboardRouter);

  return app;
}
