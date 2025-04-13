// components/buttons/ThemeToggle.js (Simplified - CORRECT)
'use client'
import React from 'react';
import { FaMoon, FaSun } from 'react-icons/fa';
import useDarkModeStatus from '@/app/utils/hooks/useDarkMode';

const ThemeToggle = () => { // No props needed

  const [isDarkMode, toggleDarkMode] = useDarkModeStatus(); // Use the hook directly

  return (
    <button
      onClick={toggleDarkMode}
      className="p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
      aria-label="Toggle Dark Mode"
    >
      {isDarkMode ? (
        <FaSun className="text-yellow-500 text-2xl" />
      ) : (
        <FaMoon className="text-gray-500 text-2xl" />
      )}
    </button>
  );
};

export default ThemeToggle;