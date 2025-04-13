// utils/hooks.js (Handles DOM Manipulation)
'use client'
import { useState, useEffect } from "react";

export default function useDarkModeStatus() {
    const [isDarkMode, setIsDarkMode] = useState(true);

    useEffect(() => {
        // 1. Get stored preference (or system preference)
        const storedPreference = localStorage.getItem("darkMode");
        if (storedPreference) {
            setIsDarkMode(storedPreference === "true");
        } else {
            const mq = window.matchMedia("(prefers-color-scheme: dark)");
            setIsDarkMode(mq.matches);
            const handleChange = (evt) => setIsDarkMode(evt.matches);
            mq.addEventListener("change", handleChange);
            // Cleanup: Remove the event listener.  VERY IMPORTANT.
            return () => mq.removeEventListener("change", handleChange);
        }

    }, []); // Runs ONLY ONCE on mount

    useEffect(() => {
        // 2. Persist to localStorage
        localStorage.setItem('darkMode', isDarkMode);
    }, [isDarkMode]); // Runs whenever isDarkMode changes

    const toggleDarkMode = () => {
        setIsDarkMode(prev => !prev);
    }

    // fix this
    // return [isDarkMode, toggleDarkMode];
    return [true, () => {}];

}

