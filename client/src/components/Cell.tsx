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
  return (
    <button
      id={`cell-${index}`}
      type="button"
      onClick={onClick}
      disabled={disabled || value !== null}
      aria-label={`Cell ${index + 1}, ${value ? `Filled with ${value}` : 'Empty'}`}
      className={clsx(
        'group relative w-full aspect-square flex items-center justify-center rounded-2xl transition-all duration-300 select-none overflow-hidden',
        // Background and border
        isWinningCell
          ? 'bg-neon-yellow/15 border-2 border-neon-yellow shadow-[0_0_30px_rgba(255,230,0,0.5)] scale-[1.03] z-10'
          : value !== null
          ? 'bg-surface/90 border border-surface-border/80 shadow-md'
          : 'bg-surface/50 border border-surface-border/40 hover:bg-surface-hover/80 hover:border-gray-500/50 hover:shadow-lg',
        disabled && value === null && 'cursor-not-allowed opacity-70'
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

      {/* Hover preview if empty and enabled */}
      {!value && !disabled && previewSymbol && (
        <div className="opacity-0 group-hover:opacity-30 transition-opacity duration-200 flex items-center justify-center w-3/5 h-3/5">
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
