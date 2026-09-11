import mongoose, { Schema, Document } from 'mongoose';

export interface IGame extends Document {
  roomId: string;
  players: {
    username: string;
    symbol: 'X' | 'O';
    id: string;
  }[];
  winner: string | null; // username or 'draw'
  moves: {
    player: string;
    symbol: 'X' | 'O';
    cellIndex: number;
    timestamp: Date;
  }[];
  result: 'win' | 'draw';
  startedAt: Date;
  endedAt: Date;
}

const GameSchema: Schema = new Schema(
  {
    roomId: {
      type: String,
      required: true,
      index: true,
    },
    players: [
      {
        username: { type: String, required: true },
        symbol: { type: String, enum: ['X', 'O'], required: true },
        id: { type: String, required: true },
      },
    ],
    winner: {
      type: String,
      default: null,
    },
    moves: [
      {
        player: { type: String, required: true },
        symbol: { type: String, enum: ['X', 'O'], required: true },
        cellIndex: { type: Number, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    result: {
      type: String,
      enum: ['win', 'draw'],
      required: true,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    endedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const Game = mongoose.models.Game || mongoose.model<IGame>('Game', GameSchema);
