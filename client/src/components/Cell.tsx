import React from 'react';
import { clsx } from 'clsx';
import type { CellValue, PlayerSymbol } from '../types/game';

interface CellProps {
  index: number;
  value: CellValue;
  onClick: () => void;
  disabled: boolean;
  isWinningCell: boolean;
  previewSymbol?: PlayerSymbol | null;
}

export const Cell: React.FC<CellProps> = ({
  index,
  value,
  onClick,
  disabled,
  isWinningCell,
  previewSymbol,
}) => {
  const isInteractive = !disabled && value === null;

  return (
    <button
      id={`cell-${index}`}
      type="button"
      onClick={onClick}
      disabled={disabled || value !== null}
      aria-label={`Cell ${index + 1}, ${value ? `Filled with ${value}` : 'Empty'}`}
      className={clsx(
        'group relative w-full aspect-square flex items-center justify-center rounded-2xl transition-all duration-200 select-none overflow-hidden outline-none',
        // Winning cell highlight
        isWinningCell &&
          'bg-neon-yellow/25 border-2 border-neon-yellow shadow-[0_0_35px_rgba(255,230,0,0.65)] scale-[1.04] z-20',
        // Filled cell (not winning)
        !isWinningCell &&
          value !== null &&
          'bg-[#161a2e] border-2 border-[#333a5e] shadow-[0_4px_16px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)]',
        // Empty cell during interactive player's turn
        !isWinningCell &&
          value === null &&
          isInteractive &&
          clsx(
            'bg-[#171b30] border-2 border-[#384069] shadow-[0_4px_12px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.08)] cursor-pointer',
            previewSymbol === 'X'
              ? 'hover:border-neon-cyan hover:bg-[#1e2442] hover:shadow-[0_0_24px_rgba(0,240,255,0.35)] hover:scale-[1.02]'
              : 'hover:border-neon-magenta hover:bg-[#1e2442] hover:shadow-[0_0_24px_rgba(255,0,127,0.35)] hover:scale-[1.02]'
          ),
        // Empty cell when disabled / waiting for opponent
        !isWinningCell &&
          value === null &&
          !isInteractive &&
          'bg-[#131627] border-2 border-[#2b3152] shadow-[0_2px_8px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.05)] cursor-not-allowed'
      )}
    >
      {/* Symbol: X */}
      {value === 'X' && (
        <div className="animate-cell-pop flex items-center justify-center w-3/5 h-3/5 text-neon-cyan drop-shadow-[0_0_12px_rgba(0,240,255,0.8)]">
          <svg viewBox="0 0 100 100" className="w-full h-full stroke-current stroke-[14] stroke-linecap-round">
            <line x1="20" y1="20" x2="80" y2="80" />
            <line x1="80" y1="20" x2="20" y2="80" />
          </svg>
        </div>
      )}

      {/* Symbol: O */}
      {value === 'O' && (
        <div className="animate-cell-pop flex items-center justify-center w-3/5 h-3/5 text-neon-magenta drop-shadow-[0_0_12px_rgba(255,0,127,0.8)]">
          <svg viewBox="0 0 100 100" className="w-full h-full stroke-current stroke-[14] stroke-linecap-round fill-none">
            <circle cx="50" cy="50" r="32" />
          </svg>
        </div>
      )}

      {/* Hover preview if empty and interactive */}
      {isInteractive && previewSymbol && (
        <div className="opacity-0 group-hover:opacity-40 transition-opacity duration-200 flex items-center justify-center w-3/5 h-3/5">
          {previewSymbol === 'X' ? (
            <svg viewBox="0 0 100 100" className="w-full h-full stroke-neon-cyan stroke-[12] stroke-linecap-round">
              <line x1="20" y1="20" x2="80" y2="80" />
              <line x1="80" y1="20" x2="20" y2="80" />
            </svg>
          ) : (
            <svg viewBox="0 0 100 100" className="w-full h-full stroke-neon-magenta stroke-[12] stroke-linecap-round fill-none">
              <circle cx="50" cy="50" r="32" />
            </svg>
          )}
        </div>
      )}
    </button>
  );
};
