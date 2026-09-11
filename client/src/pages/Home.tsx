import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Gamepad2, User, Hash, Play, Sparkles, Monitor } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { getOrCreatePlayerId, getSavedUsername, saveUsername } from '../utils/gameLogic';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [roomError, setRoomError] = useState('');

  useEffect(() => {
    // Ensure player ID exists
    getOrCreatePlayerId();
    const saved = getSavedUsername();
    if (saved) {
      setUsername(saved);
    }
  }, []);

  const validate = (): boolean => {
    let isValid = true;
    const trimmedUser = username.trim();
    const trimmedRoom = roomId.trim().toUpperCase();

    if (!trimmedUser) {
      setUsernameError('Username is required');
      isValid = false;
    } else if (trimmedUser.length < 2) {
      setUsernameError('Username must be at least 2 characters');
      isValid = false;
    } else if (trimmedUser.length > 20) {
      setUsernameError('Username must be under 20 characters');
      isValid = false;
    } else if (!/^[a-zA-Z0-9_-]+$/.test(trimmedUser)) {
      setUsernameError('Letters, numbers, dashes and underscores only');
      isValid = false;
    } else {
      setUsernameError('');
    }

    if (!trimmedRoom) {
      setRoomError('Room ID is required');
      isValid = false;
    } else if (trimmedRoom.length < 3) {
      setRoomError('Room ID must be at least 3 characters');
      isValid = false;
    } else if (trimmedRoom.length > 20) {
      setRoomError('Room ID must be under 20 characters');
      isValid = false;
    } else if (!/^[a-zA-Z0-9_-]+$/.test(trimmedRoom)) {
      setRoomError('Alphanumeric and dashes only');
      isValid = false;
    } else {
      setRoomError('');
    }

    return isValid;
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const cleanUser = username.trim();
      const cleanRoom = roomId.trim().toUpperCase();
      saveUsername(cleanUser);
      navigate(`/game/${cleanRoom}`);
    }
  };

  const handleGenerateRoom = () => {
    const randomCode = 'ROOM-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    setRoomId(randomCode);
    setRoomError('');
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 w-72 h-72 bg-neon-cyan/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 w-72 h-72 bg-neon-magenta/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Main card */}
      <div className="relative w-full max-w-md glass-panel p-6 sm:p-8 rounded-3xl border border-white/15 shadow-glass animate-fadeIn">
        {/* Header Branding */}
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-gray-300 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-neon-cyan animate-pulse" />
            <span>Multiplayer Online</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight flex items-center justify-center gap-2 text-white">
            <span className="text-neon-cyan">TIC</span>
            <span className="text-gray-400">·</span>
            <span className="text-neon-magenta">TAC</span>
            <span className="text-gray-400">·</span>
            <span className="text-neon-yellow">TOE</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">
            Compete live, climb the ranks, and prove your strategy.
          </p>
        </div>

        {/* Join form */}
        <form onSubmit={handleJoin} className="space-y-4">
          <Input
            id="username-input"
            label="Player Username"
            placeholder="e.g. CyberHero"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              if (usernameError) setUsernameError('');
            }}
            error={usernameError}
            maxLength={20}
            leftIcon={<User className="w-4 h-4" />}
          />

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="room-input"
                className="block text-xs font-semibold uppercase tracking-wider text-gray-400"
              >
                Room ID
              </label>
              <button
                type="button"
                onClick={handleGenerateRoom}
                className="text-[11px] font-bold text-neon-cyan hover:underline tracking-wide transition-all"
              >
                + Generate Code
              </button>
            </div>
            <Input
              id="room-input"
              placeholder="e.g. MATRIX-1"
              value={roomId}
              onChange={(e) => {
                setRoomId(e.target.value.toUpperCase());
                if (roomError) setRoomError('');
              }}
              error={roomError}
              maxLength={20}
              leftIcon={<Hash className="w-4 h-4" />}
            />
          </div>

          <div className="pt-2 space-y-2.5">
            <Button
              type="submit"
              variant="cyan"
              size="lg"
              className="w-full"
              leftIcon={<Play className="w-4 h-4 fill-current" />}
            >
              Enter Match
            </Button>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button
                type="button"
                variant="glass"
                size="sm"
                onClick={() => navigate('/local')}
                leftIcon={<Monitor className="w-3.5 h-3.5 text-neon-magenta" />}
              >
                Pass & Play
              </Button>

              <Button
                type="button"
                variant="gold"
                size="sm"
                onClick={() => navigate('/leaderboard')}
                leftIcon={<Trophy className="w-3.5 h-3.5" />}
              >
                Leaderboard
              </Button>
            </div>
          </div>
        </form>

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-white/5 text-center flex items-center justify-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1.5">
            <Gamepad2 className="w-3.5 h-3.5 text-neon-cyan" /> 2 Players
          </span>
          {/* <span>•</span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-neon-magenta" /> Real-time Sync
          </span> */}
        </div>
      </div>
    </div>
  );
};
