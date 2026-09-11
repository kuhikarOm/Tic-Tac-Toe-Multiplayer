import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, ArrowLeft, Award, Flame, RefreshCw } from 'lucide-react';
import { Button } from '../components/Button';
import type { UserStats } from '../types/player';
import { fetchLeaderboard } from '../services/api';

export const Leaderboard: React.FC = () => {
  const navigate = useNavigate();
  const [players, setPlayers] = useState<UserStats[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadLeaderboard = async () => {
    setIsLoading(true);
    const data = await fetchLeaderboard();
    setPlayers(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadLeaderboard();
  }, []);

  return (
    <div className="min-h-screen p-4 sm:p-6 max-w-4xl mx-auto flex flex-col justify-between">
      <div>
        {/* Header */}
        <header className="flex items-center justify-between p-4 rounded-2xl glass-panel border border-white/10 mb-6">
          <Button
            variant="glass"
            size="sm"
            onClick={() => navigate('/')}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Menu
          </Button>

          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-neon-yellow" />
            <h1 className="text-lg sm:text-xl font-black tracking-wide text-white">
              Global Leaderboard
            </h1>
          </div>

          <Button
            variant="glass"
            size="sm"
            onClick={loadLeaderboard}
            disabled={isLoading}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
        </header>

        {/* Podium Top 3 (if at least 3 players exist) */}
        {players.length >= 3 && (
          <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-8 max-w-lg mx-auto items-end">
            {/* Rank 2 */}
            <div className="glass-panel p-4 rounded-2xl text-center border-t-4 border-slate-300 transform translate-y-2">
              <span className="text-2xl font-black text-slate-300">#2</span>
              <p className="font-bold text-sm text-gray-100 truncate mt-1">{players[1].username}</p>
              <span className="text-xs font-semibold text-neon-cyan">{players[1].points} pts</span>
            </div>

            {/* Rank 1 */}
            <div className="glass-panel p-5 rounded-2xl text-center border-t-4 border-neon-yellow shadow-[0_0_25px_rgba(255,230,0,0.2)]">
              <div className="text-3xl mb-1">👑</div>
              <span className="text-3xl font-black text-neon-yellow">#1</span>
              <p className="font-bold text-base text-white truncate mt-1">{players[0].username}</p>
              <span className="text-xs font-semibold text-neon-yellow">{players[0].points} pts</span>
            </div>

            {/* Rank 3 */}
            <div className="glass-panel p-4 rounded-2xl text-center border-t-4 border-amber-600 transform translate-y-4">
              <span className="text-2xl font-black text-amber-500">#3</span>
              <p className="font-bold text-sm text-gray-100 truncate mt-1">{players[2].username}</p>
              <span className="text-xs font-semibold text-neon-magenta">{players[2].points} pts</span>
            </div>
          </div>
        )}

        {/* Table / List */}
        <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-glass">
          <div className="p-4 sm:p-5 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-neon-magenta" />
              <h2 className="font-bold text-sm sm:text-base text-white">Top Competitors</h2>
            </div>
            <span className="text-xs text-gray-400">
              Win = +3 pts | Draw = +1 pt
            </span>
          </div>

          {isLoading ? (
            <div className="py-16 text-center text-gray-400 space-y-3">
              <div className="w-8 h-8 border-2 border-neon-cyan/20 border-t-neon-cyan rounded-full animate-spin mx-auto" />
              <p className="text-xs font-semibold uppercase tracking-wider">Loading rankings...</p>
            </div>
          ) : players.length === 0 ? (
            <div className="py-16 text-center text-gray-400 space-y-3">
              <Award className="w-12 h-12 text-gray-600 mx-auto" />
              <p className="text-sm font-semibold">No matches recorded yet!</p>
              <p className="text-xs text-gray-500">Play multiplayer matches to rank up on the leaderboard.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-[11px] uppercase font-bold tracking-wider text-gray-400">
                  <tr>
                    <th className="py-3 px-4 text-center">Rank</th>
                    <th className="py-3 px-4">Player</th>
                    <th className="py-3 px-3 text-center">Won</th>
                    <th className="py-3 px-3 text-center">Lost</th>
                    <th className="py-3 px-3 text-center">Draw</th>
                    <th className="py-3 px-4 text-right">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {players.map((p, idx) => (
                    <tr
                      key={p.username}
                      className="hover:bg-white/[0.03] transition-colors"
                    >
                      <td className="py-3.5 px-4 text-center font-bold">
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                        <span>{p.username}</span>
                      </td>
                      <td className="py-3.5 px-3 text-center text-emerald-400 font-semibold">{p.wins}</td>
                      <td className="py-3.5 px-3 text-center text-red-400 font-semibold">{p.losses}</td>
                      <td className="py-3.5 px-3 text-center text-gray-400 font-semibold">{p.draws}</td>
                      <td className="py-3.5 px-4 text-right font-black text-neon-cyan tracking-wide">
                        {p.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <footer className="text-center text-xs text-gray-500 py-6">
        Rankings updated automatically in real-time upon match completion
      </footer>
    </div>
  );
};
