import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-[60] w-12 h-12 rounded-full bg-surface0/80 backdrop-blur-md border border-surface1/20 shadow-lg flex items-center justify-center text-text transition-transform hover:scale-110 active:scale-95 group"
      aria-label={`Switch to ${theme === 'latte' ? 'Dark' : 'Light'} Theme`}
    >
      <i className={`fas ${theme === 'latte' ? 'fa-moon' : 'fa-sun'} text-xl group-hover:text-yellow transition-colors`}></i>
    </button>
  );
};

export default ThemeToggle;