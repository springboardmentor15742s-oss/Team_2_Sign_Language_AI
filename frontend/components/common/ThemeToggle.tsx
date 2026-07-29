'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '@/store/themeStore';
import { Button } from '../ui/Button';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="p-2 rounded-lg text-slate-400 hover:text-white"
      aria-label="Toggle Theme"
    >
      {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
    </Button>
  );
};
