import React from 'react';
import { ThemeMode } from '../../types';

interface ThemeToggleProps {
  themeMode?: ThemeMode;
  onToggle?: (newMode: ThemeMode) => void;
  className?: string;
  showLabel?: boolean;
}

// Site is permanently locked to light mode; ThemeToggle is deprecated
export const ThemeToggle: React.FC<ThemeToggleProps> = () => {
  return null;
};
