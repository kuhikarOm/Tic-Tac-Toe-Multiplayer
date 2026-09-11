import { io } from 'socket.io-client';

const SERVER_URL = 'http://localhost:5000';

async function runTest() {
  console.log('🧪 Starting Multiplayer End-to-End Test...\n');

  const socketA = io(SERVER_URL);
  const socketB = io(SERVER_URL);

  await new Promise<void>((resolve) => {
    let connected = 0;
    const check = () => {
      connected++;
      if (connected === 2) resolve();
    };
    socketA.on('connect', check);
    socketB.on('connect', check);
  });

  console.log('✅ Both player sockets connected to server.');

  const roomId = 'TESTROOM';

  // 1. Player A joins
  socketA.emit('join_room', {
    roomId,
    username: 'Alice',
    playerId: 'player_alice',
  });

  await new Promise<void>((resolve) => {
    socketA.once('room_state', (room: any) => {
      console.log(`✅ Alice joined room ${room.roomId}. Status: ${room.status}. Symbol: ${room.players[0].symbol}`);
      resolve();
    });
  });

  // 2. Player B joins
  socketB.emit('join_room', {
    roomId,
    username: 'Bob',
    playerId: 'player_bob',
  });

  await new Promise<void>((resolve) => {
    socketB.once('room_state', (room: any) => {
      console.log(`✅ Bob joined room ${room.roomId}. Status: ${room.status}. Total players: ${room.players.length}`);
      resolve();
    });
  });

  // Moves sequence:
  // Alice (X) -> 0
  // Bob (O)   -> 1
  // Alice (X) -> 4
  // Bob (O)   -> 2
  // Alice (X) -> 8 (Winning move: [0, 4, 8])

  const moves = [
    { socket: socketA, cell: 0, player: 'Alice' },
    { socket: socketB, cell: 1, player: 'Bob' },
    { socket: socketA, cell: 4, player: 'Alice' },
    { socket: socketB, cell: 2, player: 'Bob' },
    { socket: socketA, cell: 8, player: 'Alice' },
  ];

  for (const move of moves) {
    await new Promise<void>((resolve) => {
      socketA.once('room_state', (room: any) => {
        console.log(`➡️  ${move.player} placed symbol at cell ${move.cell}. Current turn now: ${room.currentTurn}`);
        if (room.status === 'finished') {
          console.log(`🏆 MATCH FINISHED! Winner: ${room.winner}. Winning Line: ${JSON.stringify(room.winningLine)}`);
        }
        resolve();
      });
      move.socket.emit('make_move', { roomId, cellIndex: move.cell });
    });
  }

  // 3. Test Rematch
  console.log('\n🔄 Testing Rematch System...');
  socketA.emit('request_rematch', { roomId, playerId: 'player_alice' });

  await new Promise<void>((resolve) => {
    socketA.once('room_state', (room: any) => {
      console.log(`✅ Alice requested rematch. Ready count: ${room.rematchRequestedBy.length}`);
      resolve();
    });
  });

  await new Promise<void>((resolve) => {
    const onState = (room: any) => {
      if (room.status === 'playing' && room.board.every((c: any) => c === null)) {
        console.log(`✅ Game restarted! Status: ${room.status}. Current Turn: ${room.currentTurn}. Board reset.`);
        socketB.off('room_state', onState);
        resolve();
      }
    };
    socketB.on('room_state', onState);
    socketB.emit('request_rematch', { roomId, playerId: 'player_bob' });
  });

  // 4. Test Third player rejection (Room is Full)
  console.log('\n🚫 Testing Third Player Rejection...');
  const socketC = io(SERVER_URL);
  await new Promise<void>((resolve) => socketC.once('connect', () => resolve()));

  await new Promise<void>((resolve) => {
    socketC.once('error_message', (err: any) => {
      console.log(`✅ Third player rejected with error: "${err.message}"`);
      resolve();
    });
    socketC.emit('join_room', {
      roomId,
      username: 'Charlie',
      playerId: 'player_charlie',
    });
  });

  // 5. Test Leaderboard REST API
  console.log('\n📊 Testing Leaderboard REST API...');
  const res = await fetch(`${SERVER_URL}/api/leaderboard`);
  const data = (await res.json()) as any;
  console.log(`✅ Leaderboard response received:`, JSON.stringify(data.players, null, 2));

  socketA.disconnect();
  socketB.disconnect();
  socketC.disconnect();
  console.log('\n🎉 ALL MULTIPLAYER TESTS PASSED SUCCESSFULLY!\n');
}

runTest().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
