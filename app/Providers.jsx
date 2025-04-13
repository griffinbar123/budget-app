// app/Providers.jsx
'use client'

import { Provider } from 'react-redux';
import store from './store/store'; // Adjust path if needed
// import useDarkModeStatus from "./utils/hooks/useDarkMode"; // Import - NO LONGER NEEDED

//import ThemeToggle from '../components/buttons/theme-toggle'; // NO LONGER NEEDED HERE

export function Providers({ children }) {
    // const [isDarkMode, toggleDarkMode] = useDarkModeStatus(); //keep - NO LONGER NEEDED

    // useEffect(() => {  // NO LONGER NEEDED - Tailwind handles this
    //     if (isDarkMode) {
    //         document.documentElement.classList.add('dark');
    //     } else {
    //         document.documentElement.classList.remove('dark');
    //     }
    // }, [isDarkMode]);

    return (
        <Provider store={store}>
                {children}
        </Provider>
    );
}