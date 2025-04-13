// app/hooks/useAppColors.js
'use client'
import { useMemo } from 'react';
import useDarkModeStatus from './useDarkMode';

export default function useAppColors() {
    const [isDarkMode, _] = useDarkModeStatus();

    const colors = useMemo(() => {
        return {
            textPrimary: isDarkMode ? 'rgb(var(--text-primary))' : 'rgb(var(--text-primary))',
            textSecondary: isDarkMode ? 'rgb(var(--text-secondary))' : 'rgb(var(--text-secondary))',
            backgroundPrimary: isDarkMode ? 'rgb(var(--background-primary))' : 'rgb(var(--background-primary))',
            backgroundSecondary: isDarkMode ? 'rgb(var(--background-secondary))' : 'rgb(var(--background-secondary))',
            accentPrimary: isDarkMode ? 'rgb(var(--accent-primary))' : 'rgb(var(--accent-primary))',
            successPrimary: isDarkMode ? 'rgb(var(--success-primary))' : 'rgb(var(--success-primary))',
            dangerPrimary: isDarkMode ? 'rgb(var(--danger-primary))' : 'rgb(var(--danger-primary))',
        };
    }, [isDarkMode]);

    return colors;
}