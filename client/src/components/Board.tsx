import React from 'react';
import { Cell } from './Cell';
import type { CellValue, PlayerSymbol } from '../types/game';

interface BoardProps {
  board: CellValue[];
  onCellClick: (index: number) => void;
  disabled: boolean;
  winningLine: number[] | null;
  previewSymbol?: PlayerSymbol | null;
}

export const Board: React.FC<BoardProps> = ({
  board,
  onCellClick,
  disabled,
  winningLine,
  previewSymbol,
}) => {
  return (
    <div className="relative w-full max-w-[360px] sm:max-w-[420px] aspect-square mx-auto p-3.5 sm:p-4 rounded-3xl glass-panel shadow-glass border border-white/10">
      {/* Background glow ambient */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-neon-cyan/5 via-transparent to-neon-magenta/5 pointer-events-none" />

      {/* Grid of 9 cells */}
      <div className="relative grid grid-cols-3 grid-rows-3 gap-2.5 sm:gap-3.5 w-full h-full">
        {board.map((cellValue, index) => (
          <Cell
            key={index}
            index={index}
            value={cellValue}
            onClick={() => onCellClick(index)}
            disabled={disabled}
            isWinningCell={winningLine !== null && winningLine.includes(index)}
            previewSymbol={previewSymbol}
          />
        ))}
      </div>
    </div>
  );
};
