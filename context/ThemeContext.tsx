import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'macchiato' | 'latte';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('macchiato');

  useEffect(() => {
    // Initialize from local storage or document attribute set by blocking script
    const stored = localStorage.getItem('catppuccin-theme') as Theme;
    if (stored) {
      setTheme(stored);
    } else if (document.documentElement.getAttribute('data-theme') === 'latte') {
      setTheme('latte');
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('catppuccin-theme', theme);
    
    // Update PWA theme color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'latte' ? '#eff1f5' : '#24273a');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'macchiato' ? 'latte' : 'macchiato');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};