import React from 'react';
import { clsx } from 'clsx';

interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  title?: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fadeIn">
      <div
        className={clsx(
          'relative w-full max-w-md p-6 sm:p-8 rounded-3xl glass-panel border border-white/15 shadow-2xl animate-cell-pop text-center'
        )}
      >
        {children}
      </div>
    </div>
  );
};
