import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Trophy } from 'lucide-react';
import { Board } from '../components/Board';
import { Button } from '../components/Button';
import type { CellValue, PlayerSymbol } from '../types/game';
import { checkDraw, checkWinner, createEmptyBoard } from '../utils/gameLogic';
import { Modal } from '../components/Modal';

export const LocalGame: React.FC = () => {
  const navigate = useNavigate();
  const [startingTurn, setStartingTurn] = useState<PlayerSymbol>('X');
  const [board, setBoard] = useState<CellValue[]>(createEmptyBoard());
  const [currentTurn, setCurrentTurn] = useState<PlayerSymbol>('X');
  const [winner, setWinner] = useState<PlayerSymbol | 'draw' | null>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [score, setScore] = useState<{ X: number; O: number; draws: number }>({
    X: 0,
    O: 0,
    draws: 0,
  });

  const handleCellClick = (index: number) => {
    if (board[index] !== null || winner !== null) return;

    const newBoard = [...board];
    newBoard[index] = currentTurn;
    setBoard(newBoard);

    // Check win condition
    const winResult = checkWinner(newBoard);
    if (winResult.winner) {
      const winningSymbol = winResult.winner;
      setWinner(winningSymbol);
      setWinningLine(winResult.winningLine);
      setScore((prev) => ({
        ...prev,
        [winningSymbol]: prev[winningSymbol] + 1,
      }));
      return;
    }

    // Check draw condition
    if (checkDraw(newBoard)) {
      setWinner('draw');
      setScore((prev) => ({ ...prev, draws: prev.draws + 1 }));
      return;
    }

    // Switch turn
    setCurrentTurn((prev) => (prev === 'X' ? 'O' : 'X'));
  };

  const handleNextMatch = () => {
    const nextTurn = startingTurn === 'X' ? 'O' : 'X';
    setStartingTurn(nextTurn);
    setBoard(createEmptyBoard());
    setCurrentTurn(nextTurn);
    setWinner(null);
    setWinningLine(null);
  };

  const handleReset = () => {
    setBoard(createEmptyBoard());
    setCurrentTurn(startingTurn);
    setWinner(null);
    setWinningLine(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-4 sm:p-6 max-w-2xl mx-auto">
      {/* Top bar */}
      <header className="w-full flex items-center justify-between p-4 rounded-2xl glass-panel border border-white/10 mb-4">
        <Button
          variant="glass"
          size="sm"
          onClick={() => navigate('/')}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Menu
        </Button>

        <div className="text-center">
          <span className="text-xs uppercase font-bold tracking-widest text-neon-yellow">
            Pass & Play
          </span>
          <h2 className="text-base sm:text-lg font-black text-white">Local Match</h2>
        </div>

        <Button
          variant="glass"
          size="sm"
          onClick={handleReset}
          leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
        >
          Reset
        </Button>
      </header>

      {/* Score and Turn indicator */}
      <div className="w-full grid grid-cols-3 gap-2 sm:gap-4 my-2 text-center">
        {/* Player X */}
        <div
          className={`p-3 rounded-2xl transition-all ${
            currentTurn === 'X' && !winner
              ? 'glass-panel-glow-cyan scale-[1.02]'
              : 'glass-panel opacity-80'
          }`}
        >
          <div className="text-neon-cyan font-black text-xl mb-0.5">Player X</div>
          <div className="text-2xl font-extrabold text-white">{score.X}</div>
          {currentTurn === 'X' && !winner && (
            <span className="text-[10px] uppercase tracking-wider font-bold text-neon-cyan animate-pulse">
              Turn
            </span>
          )}
        </div>

        {/* Draws */}
        <div className="glass-panel p-3 rounded-2xl flex flex-col justify-center">
          <div className="text-gray-400 font-bold text-xs uppercase tracking-wider">Draws</div>
          <div className="text-2xl font-extrabold text-gray-200">{score.draws}</div>
        </div>

        {/* Player O */}
        <div
          className={`p-3 rounded-2xl transition-all ${
            currentTurn === 'O' && !winner
              ? 'glass-panel-glow-magenta scale-[1.02]'
              : 'glass-panel opacity-80'
          }`}
        >
          <div className="text-neon-magenta font-black text-xl mb-0.5">Player O</div>
          <div className="text-2xl font-extrabold text-white">{score.O}</div>
          {currentTurn === 'O' && !winner && (
            <span className="text-[10px] uppercase tracking-wider font-bold text-neon-magenta animate-pulse">
              Turn
            </span>
          )}
        </div>
      </div>

      {/* Game board */}
      <main className="my-auto py-4 w-full flex items-center justify-center">
        <Board
          board={board}
          onCellClick={handleCellClick}
          disabled={winner !== null}
          winningLine={winningLine}
          previewSymbol={!winner ? currentTurn : null}
        />
      </main>

      {/* Outcome Modal */}
      <Modal isOpen={winner !== null}>
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-white/5 border border-white/15 flex items-center justify-center shadow-inner">
            {winner === 'draw' ? (
              <span className="text-3xl">🤝</span>
            ) : (
              <Trophy className="w-8 h-8 text-neon-yellow animate-bounce" />
            )}
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-1">
              {winner === 'draw' ? (
                <span className="text-gray-200">It's a Draw!</span>
              ) : (
                <span className={winner === 'X' ? 'text-neon-cyan' : 'text-neon-magenta'}>
                  Player {winner} Wins!
                </span>
              )}
            </h2>
            <p className="text-xs text-gray-400">
              {winner === 'draw'
                ? 'Great defense from both players.'
                : `Victory achieved! Ready for another round?`}
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <Button variant="cyan" size="md" className="flex-1" onClick={handleNextMatch}>
              Play Again
            </Button>
            <Button
              variant="glass"
              size="md"
              className="flex-1"
              onClick={() => navigate('/')}
            >
              Exit to Menu
            </Button>
          </div>
        </div>
      </Modal>

      {/* Helper text */}
      <footer className="text-center text-xs text-gray-500 mt-4">
        Play locally taking turns on the same screen
      </footer>
    </div>
  );
};
