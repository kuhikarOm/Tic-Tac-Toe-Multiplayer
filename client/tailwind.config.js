/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#090a0f',
        surface: '#121420',
        'surface-hover': '#1a1d2e',
        'surface-border': '#252943',
        neon: {
          cyan: '#00f0ff',
          magenta: '#ff007f',
          purple: '#9d00ff',
          yellow: '#ffe600',
          green: '#00ff88',
        }
      },
      boxShadow: {
        'neon-cyan': '0 0 15px rgba(0, 240, 255, 0.45), 0 0 30px rgba(0, 240, 255, 0.2)',
        'neon-magenta': '0 0 15px rgba(255, 0, 127, 0.45), 0 0 30px rgba(255, 0, 127, 0.2)',
        'neon-purple': '0 0 20px rgba(157, 0, 255, 0.4)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'cell-pop': 'cellPop 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.02)' },
        },
        cellPop: {
          '0%': { transform: 'scale(0.5)', opacity: '0' },
          '70%': { transform: 'scale(1.08)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
