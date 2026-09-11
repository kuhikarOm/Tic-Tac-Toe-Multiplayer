import React, { useState } from 'react';
import { Copy, Check, LogOut, Wifi, WifiOff } from 'lucide-react';
import { Button } from './Button';

interface RoomInfoProps {
  roomId: string;
  isConnected: boolean;
  onLeave: () => void;
}

export const RoomInfo: React.FC<RoomInfoProps> = ({
  roomId,
  isConnected,
  onLeave,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="w-full max-w-2xl mx-auto flex items-center justify-between p-3.5 sm:p-4 rounded-2xl glass-panel border border-white/10 shadow-glass mb-4">
      {/* Room code section */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="text-left">
          <span className="block text-[10px] sm:text-xs uppercase font-bold tracking-widest text-gray-400">
            Room Code
          </span>
          <span className="font-mono font-bold text-base sm:text-lg text-neon-cyan tracking-wider">
            {roomId}
          </span>
        </div>

        <button
          onClick={handleCopy}
          type="button"
          title="Copy Room ID"
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all border border-white/10 active:scale-95 flex items-center gap-1.5 text-xs font-semibold"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 hidden sm:inline">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-gray-400" />
              <span className="hidden sm:inline">Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Status & Exit action */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
          {isConnected ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Live</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-red-400" />
              <span className="text-red-400">Disconnected</span>
            </>
          )}
        </div>

        <Button
          variant="danger"
          size="sm"
          onClick={onLeave}
          leftIcon={<LogOut className="w-3.5 h-3.5" />}
        >
          Exit
        </Button>
      </div>
    </header>
  );
};
