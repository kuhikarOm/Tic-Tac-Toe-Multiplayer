import React from 'react';
import { clsx } from 'clsx';
import type { Player } from '../types/player';

interface PlayerCardProps {
  player?: Player;
  symbol: 'X' | 'O';
  isCurrentTurn: boolean;
  isSelf: boolean;
  isWinner: boolean;
  waiting?: boolean;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  symbol,
  isCurrentTurn,
  isSelf,
  isWinner,
  waiting = false,
}) => {
  const isX = symbol === 'X';

  if (waiting || !player) {
    return (
      <div className="flex-1 min-w-[140px] max-w-[220px] p-3.5 sm:p-4 rounded-2xl glass-panel border border-dashed border-gray-700/60 flex flex-col items-center justify-center text-center">
        <div
          className={clsx(
            'w-10 h-10 rounded-xl flex items-center justify-center font-black text-xl mb-2 opacity-40',
            isX ? 'text-neon-cyan bg-neon-cyan/10' : 'text-neon-magenta bg-neon-magenta/10'
          )}
        >
          {symbol}
        </div>
        <p className="text-xs text-gray-400 font-medium animate-pulse">Waiting for player...</p>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        'relative flex-1 min-w-[140px] max-w-[240px] p-3.5 sm:p-4 rounded-2xl transition-all duration-300 select-none overflow-hidden',
        isCurrentTurn
          ? isX
            ? 'glass-panel-glow-cyan scale-[1.02]'
            : 'glass-panel-glow-magenta scale-[1.02]'
          : 'glass-panel border-white/5 opacity-80',
        isWinner && 'ring-2 ring-neon-yellow shadow-[0_0_25px_rgba(255,230,0,0.3)]'
      )}
    >
      {/* Turn indicator glow line */}
      {isCurrentTurn && (
        <div
          className={clsx(
            'absolute top-0 left-0 right-0 h-1',
            isX ? 'bg-neon-cyan shadow-[0_0_10px_#00f0ff]' : 'bg-neon-magenta shadow-[0_0_10px_#ff007f]'
          )}
        />
      )}

      <div className="flex items-center gap-3">
        {/* Symbol badge */}
        <div
          className={clsx(
            'w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center font-black text-xl shrink-0 shadow-inner',
            isX
              ? 'bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/30'
              : 'bg-neon-magenta/15 text-neon-magenta border border-neon-magenta/30'
          )}
        >
          {symbol}
        </div>

        {/* Player details */}
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="font-bold text-sm sm:text-base text-gray-100 truncate tracking-wide">
              {player.username}
            </h3>
            {isSelf && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-white/10 text-gray-300">
                You
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-0.5">
            {/* Online / Offline status */}
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <span
                className={clsx(
                  'w-2 h-2 rounded-full',
                  player.connected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
                )}
              />
              {player.connected ? 'Online' : 'Offline'}
            </span>

            {player.rematchRequested && (
              <span className="text-[10px] text-neon-yellow font-bold animate-pulse">
                Ready for rematch!
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Turn status caption */}
      {isCurrentTurn && (
        <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-xs font-semibold">
          <span className={isX ? 'text-neon-cyan' : 'text-neon-magenta'}>
            {isSelf ? "Your Turn" : "Opponent's Turn"}
          </span>
          <span className="animate-pulse">●</span>
        </div>
      )}
    </div>
  );
};
