import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trophy, Users, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import { RoomInfo } from '../components/RoomInfo';
import { PlayerCard } from '../components/PlayerCard';
import { Board } from '../components/Board';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { useSocket } from '../hooks/useSocket';
import type { Room, MovePayload, JoinRoomPayload, RematchPayload } from '../types/game';
import type { Player } from '../types/player';
import { getOrCreatePlayerId, getSavedUsername } from '../utils/gameLogic';

export const Game: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();

  const [room, setRoom] = useState<Room | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [opponentDisconnected, setOpponentDisconnected] = useState<boolean>(false);
  const [disconnectTimer, setDisconnectTimer] = useState<number>(30);

  const playerId = useMemo(() => getOrCreatePlayerId(), []);
  const username = useMemo(() => getSavedUsername(), []);

  // Check if player has username; if not redirect to home
  useEffect(() => {
    if (!username) {
      navigate('/', { replace: true });
    }
  }, [username, navigate]);

  // Join room on mount or reconnection
  useEffect(() => {
    if (!socket || !roomId || !username) return;

    const payload: JoinRoomPayload = {
      roomId: roomId.toUpperCase(),
      username,
      playerId,
    };

    socket.emit('join_room', payload);

    const handleRoomState = (updatedRoom: Room) => {
      setRoom(updatedRoom);
      setOpponentDisconnected(false);
      setErrorMessage(null);
    };

    const handleErrorMessage = (msg: { message: string }) => {
      setErrorMessage(msg.message);
    };

    const handlePlayerDisconnected = () => {
      setOpponentDisconnected(true);
      setDisconnectTimer(30);
    };

    const handlePlayerReconnected = () => {
      setOpponentDisconnected(false);
    };

    socket.on('room_state', handleRoomState);
    socket.on('error_message', handleErrorMessage);
    socket.on('player_disconnected', handlePlayerDisconnected);
    socket.on('player_reconnected', handlePlayerReconnected);

    return () => {
      socket.off('room_state', handleRoomState);
      socket.off('error_message', handleErrorMessage);
      socket.off('player_disconnected', handlePlayerDisconnected);
      socket.off('player_reconnected', handlePlayerReconnected);
    };
  }, [socket, roomId, username, playerId]);

  // Countdown timer for disconnected opponent
  useEffect(() => {
    if (!opponentDisconnected) return;
    const interval = setInterval(() => {
      setDisconnectTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [opponentDisconnected]);

  // Identify players
  const playerX: Player | undefined = room?.players.find((p) => p.symbol === 'X');
  const playerO: Player | undefined = room?.players.find((p) => p.symbol === 'O');
  const currentPlayer: Player | undefined = room?.players.find((p) => p.id === playerId);

  const isMyTurn = useMemo(() => {
    if (!room || room.status !== 'playing' || !currentPlayer) return false;
    return room.currentTurn === currentPlayer.symbol;
  }, [room, currentPlayer]);

  const handleCellClick = (cellIndex: number) => {
    if (!room || !isMyTurn || room.board[cellIndex] !== null || room.status !== 'playing') {
      return;
    }

    const payload: MovePayload = {
      roomId: room.roomId,
      cellIndex,
    };
    socket.emit('make_move', payload);
  };

  const handleRequestRematch = () => {
    if (!room) return;
    const payload: RematchPayload = {
      roomId: room.roomId,
      playerId,
    };
    socket.emit('request_rematch', payload);
  };

  const handleLeaveRoom = () => {
    if (socket && room) {
      socket.emit('leave_room', { roomId: room.roomId, playerId });
    }
    navigate('/');
  };

  if (errorMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full glass-panel p-8 rounded-3xl border border-red-500/30 text-center space-y-4 shadow-glass animate-fadeIn">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">Notice</h2>
          <p className="text-sm text-gray-300">{errorMessage}</p>
          <Button variant="cyan" size="md" onClick={() => navigate('/')} className="w-full">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 space-y-4">
        <div className="w-12 h-12 border-4 border-neon-cyan/20 border-t-neon-cyan rounded-full animate-spin" />
        <p className="text-sm font-semibold tracking-wider text-gray-400 animate-pulse">
          CONNECTING TO MATCH...
        </p>
      </div>
    );
  }

  const isWinnerSelf = room.winner && currentPlayer && room.winner === currentPlayer.symbol;
  const isWinnerOpponent = room.winner && currentPlayer && room.winner !== 'draw' && room.winner !== currentPlayer.symbol;
  const isDraw = room.winner === 'draw';
  const hasRequestedRematch = room.rematchRequestedBy.includes(playerId);

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-4 sm:p-6 max-w-4xl mx-auto select-none">
      {/* Header bar */}
      <RoomInfo
        roomId={room.roomId}
        isConnected={isConnected}
        onLeave={handleLeaveRoom}
      />

      {/* Opponent disconnected notification banner */}
      {opponentDisconnected && (
        <div className="w-full max-w-2xl bg-amber-500/20 border border-amber-500/40 text-amber-200 px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold flex items-center justify-between gap-2 mb-3 animate-pulse">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>Opponent disconnected! Waiting for reconnection...</span>
          </div>
          <span className="font-mono bg-amber-500/30 px-2 py-0.5 rounded text-amber-100">
            {disconnectTimer}s
          </span>
        </div>
      )}

      {/* Players cards */}
      <div className="w-full max-w-2xl flex items-center justify-center gap-3 sm:gap-6 my-2">
        <PlayerCard
          player={playerX}
          symbol="X"
          isCurrentTurn={room.status === 'playing' && room.currentTurn === 'X'}
          isSelf={currentPlayer?.symbol === 'X'}
          isWinner={room.winner === 'X'}
          waiting={!playerX}
        />

        <div className="text-xs font-black tracking-widest text-gray-500 px-1 uppercase">
          VS
        </div>

        <PlayerCard
          player={playerO}
          symbol="O"
          isCurrentTurn={room.status === 'playing' && room.currentTurn === 'O'}
          isSelf={currentPlayer?.symbol === 'O'}
          isWinner={room.winner === 'O'}
          waiting={!playerO}
        />
      </div>

      {/* Waiting screen when player 2 is missing */}
      {room.status === 'waiting' && (
        <div className="w-full max-w-md my-8 p-6 rounded-3xl glass-panel border border-white/10 text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center text-neon-cyan animate-bounce">
            <Users className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white">Waiting for Opponent</h2>
          <p className="text-xs sm:text-sm text-gray-400">
            Share this room code with your friend to play together!
          </p>
          <div className="p-3 bg-surface rounded-xl border border-surface-border font-mono text-lg font-bold text-neon-cyan tracking-wider select-all">
            {room.roomId}
          </div>
        </div>
      )}

      {/* Game Board */}
      {room.status !== 'waiting' && (
        <main className="my-auto py-4 w-full flex flex-col items-center justify-center">
          {/* Status banner */}
          <div className="mb-3 text-center">
            {isMyTurn ? (
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan text-xs font-bold uppercase tracking-wider animate-pulse">
                <Sparkles className="w-3.5 h-3.5" /> Your Turn to Move
              </span>
            ) : (
              <span className="text-xs font-semibold text-gray-400 tracking-wide">
                Waiting for opponent move...
              </span>
            )}
          </div>

          <Board
            board={room.board}
            onCellClick={handleCellClick}
            disabled={!isMyTurn || room.status !== 'playing'}
            winningLine={room.winningLine}
            previewSymbol={isMyTurn && currentPlayer ? currentPlayer.symbol : null}
          />
        </main>
      )}

      {/* Winner / Draw Game Over Modal */}
      <Modal isOpen={room.status === 'finished' && room.winner !== null}>
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-white/5 border border-white/15 flex items-center justify-center shadow-inner">
            {isDraw ? (
              <span className="text-3xl">🤝</span>
            ) : isWinnerSelf ? (
              <Trophy className="w-8 h-8 text-neon-yellow animate-bounce" />
            ) : (
              <span className="text-3xl">💀</span>
            )}
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-1">
              {isDraw && "It's a Draw!"}
              {isWinnerSelf && (
                <span className="text-gradient-cyan">Victory is Yours!</span>
              )}
              {isWinnerOpponent && (
                <span className="text-neon-magenta">Opponent Wins!</span>
              )}
            </h2>
            <p className="text-xs text-gray-400">
              {isDraw
                ? 'Stalemate! Both played a solid match.'
                : isWinnerSelf
                ? 'Outstanding tactics and board control!'
                : 'Hard luck, rematch to settle the score!'}
            </p>
          </div>

          {/* Rematch status indicator */}
          {room.rematchRequestedBy.length > 0 && (
            <div className="text-xs text-neon-yellow font-semibold py-1">
              {room.rematchRequestedBy.length === 1 && hasRequestedRematch
                ? 'Waiting for opponent to accept rematch...'
                : 'Opponent wants a rematch!'}
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <Button
              variant="cyan"
              size="md"
              className="flex-1"
              disabled={hasRequestedRematch}
              onClick={handleRequestRematch}
              leftIcon={<RefreshCw className={`w-4 h-4 ${hasRequestedRematch ? 'animate-spin' : ''}`} />}
            >
              {hasRequestedRematch ? 'Rematch Requested' : 'Rematch'}
            </Button>
            <Button
              variant="glass"
              size="md"
              className="flex-1"
              onClick={handleLeaveRoom}
            >
              Exit Match
            </Button>
          </div>
        </div>
      </Modal>

      {/* Bottom helper */}
      <footer className="w-full text-center text-[11px] text-gray-500 mt-4">
        Multiplayer powered by Node.js & Socket.IO
      </footer>
    </div>
  );
};
