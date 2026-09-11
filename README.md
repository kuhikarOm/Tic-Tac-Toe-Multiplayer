# 🎮 Neon Tac Toe — Real-Time Multiplayer

A full-stack, server-authoritative multiplayer Tic-Tac-Toe application built with **React**, **TypeScript**, **TailwindCSS**, **Socket.IO**, **Express**, and **MongoDB**.

---

## ⚡ Highlights & Key Features

- **Server-Authoritative Game Architecture**: The client sends move requests; the Node.js server validates turns, moves, win/draw conditions, and prevents cheating.
- **Dynamic Neon Glassmorphism Aesthetics**: Cyberpunk-inspired dark UI with animated glowing SVG icons for X and O, real-time pulse indicators, and responsive layouts.
- **Room System & Matchmaking**: Create custom rooms, generate instant match codes, or join existing rooms with strict 2-player capacity enforcement.
- **Reconnection & Disconnect Resilience**: Grace period (30s timer) for players who lose connection, restoring game state seamlessly upon reconnecting.
- **Interactive Rematch Flow**: Both players can agree to an instant rematch on the spot.
- **Pass & Play (Local Mode)**: Play on a single device without internet access.
- **Global Leaderboard & Statistics**: Track wins, losses, draws, win rates, and points (+3 for win, +1 for draw). Powered by MongoDB with high-speed in-memory fallback.
- **Input Validation & Security**: All inputs and socket payloads validated with **Zod**.

---

## 📁 Project Structure

```text
TicTacToeMultiplayer/
├── client/                     # Frontend (React + TypeScript + Vite + TailwindCSS)
│   ├── src/
│   │   ├── components/         # Board, Cell, PlayerCard, RoomInfo, Button, Input, Modal
│   │   ├── hooks/              # useSocket hook
│   │   ├── pages/              # Home, Game, LocalGame, Leaderboard, NotFound
│   │   ├── services/           # socket.io-client, fetch API client
│   │   ├── types/              # TypeScript interfaces (Player, Room, Game)
│   │   ├── utils/              # Game logic, player persistence, helpers
│   │   ├── App.tsx             # Routes & Layout
│   │   ├── main.tsx
│   │   └── index.css           # Neon theme & custom utility styles
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── server/                     # Backend (Node.js + Express + TypeScript + Socket.IO)
│   ├── src/
│   │   ├── models/             # User (Mongoose), Game (Mongoose), Room (In-memory)
│   │   ├── routes/             # REST endpoints (/api/leaderboard, /api/players/:username)
│   │   ├── services/           # gameService (room state, moves), leaderboardService
│   │   ├── socket/             # Socket.IO connection & event handlers
│   │   ├── utils/              # Win/draw logic, Zod validation schemas
│   │   ├── app.ts              # Express setup & CORS middleware
│   │   └── server.ts           # Server bootstrap & MongoDB connection
│   ├── package.json
│   └── tsconfig.json
│
├── .gitignore
├── package.json                # Root package with concurrently
└── README.md
```

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
Run from the root directory:
```bash
npm install
npm --prefix client install
npm --prefix server install
```

### 2. Configure Environment (Optional)
Defaults are already pre-configured for local development. If needed:
- In `server/.env`:
  ```env
  PORT=5000
  MONGODB_URI=mongodb://127.0.0.1:27017/tictactoe
  CLIENT_URL=http://localhost:5173
  ```
- In `client/.env`:
  ```env
  VITE_SERVER_URL=http://localhost:5000
  ```
*(Note: If MongoDB is not running locally, the server automatically operates in in-memory fallback mode so the game and leaderboard continue working smoothly!)*

### 3. Start Frontend & Backend Concurrently
From the root directory:
```bash
npm run dev
```

- Frontend runs at: `http://localhost:5173`
- Backend runs at: `http://localhost:5000`

---

## 🧪 Testing the Multiplayer Experience

1. Open `http://localhost:5173` in **Browser Window A**.
2. Enter username (e.g. `Alice`) and click **+ Generate Code** or enter `ROOM-1`. Click **Enter Match**.
3. Open `http://localhost:5173` in **Browser Window B** (or Incognito).
4. Enter username (e.g. `Bob`), enter the same Room Code (`ROOM-1`), and click **Enter Match**.
5. Watch the room instantly transition to **Live Play**! Take turns moving `X` and `O`.
6. Notice the server validates moves, highlights winning lines, updates scores, and allows Rematches!
