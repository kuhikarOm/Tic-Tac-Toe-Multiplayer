import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home as HomeIcon, AlertTriangle } from 'lucide-react';
import { Button } from '../components/Button';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full glass-panel p-8 rounded-3xl border border-white/10 text-center space-y-4 shadow-glass animate-fadeIn">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-neon-yellow/10 border border-neon-yellow/30 flex items-center justify-center text-neon-yellow">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-black text-white tracking-tight">404</h1>
        <h2 className="text-lg font-bold text-gray-300">Page Not Found</h2>
        <p className="text-xs text-gray-400">
          The room or page you are trying to visit does not exist or has expired.
        </p>
        <Button
          variant="cyan"
          size="md"
          onClick={() => navigate('/')}
          className="w-full"
          leftIcon={<HomeIcon className="w-4 h-4" />}
        >
          Return Home
        </Button>
      </div>
    </div>
  );
};
