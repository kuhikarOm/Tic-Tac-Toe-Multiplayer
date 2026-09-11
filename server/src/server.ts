import http from 'node:http';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import { createApp } from './app.js';
import { setupSocket } from './socket/socket.js';

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tictactoe';
const CLIENT_URL = process.env.CLIENT_URL || '*';

async function bootstrap() {
  const app = createApp();
  const server = http.createServer(app);

  // Configure Socket.IO
  const io = new Server(server, {
    cors: {
      origin: CLIENT_URL === '*' ? true : CLIENT_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingInterval: 10000,
    pingTimeout: 5000,
  });

  // Attach socket handlers
  setupSocket(io);

  // Connect to MongoDB
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log('✅ Connected to MongoDB successfully.');
  } catch (error) {
    console.warn(
      '⚠️  MongoDB connection failed or not running. Operating in in-memory fallback mode (game and stats will remain active).'
    );
  }

  server.listen(PORT, () => {
    console.log(`🚀 Tic-Tac-Toe Game Server running at http://localhost:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('Fatal server boot error:', err);
});
