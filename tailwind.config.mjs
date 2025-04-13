/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      spacing: {
        18: '4.5rem', // 72px for collapsed sidebar
      },
      colors: {
        background: {
          primary: 'rgb(var(--background-primary) / <alpha-value>)',
          secondary: 'rgb(var(--background-secondary) / <alpha-value>)',
        },
        text: {
          primary: 'rgb(var(--text-primary) / <alpha-value>)',
          secondary: 'rgb(var(--text-secondary) / <alpha-value>)',
        },
        accent: {
          primary: 'rgb(var(--accent-primary) / <alpha-value>)',
        },
        success: {
          primary: 'rgb(var(--success-primary) / <alpha-value>)',
        },
        danger: {
          primary: 'rgb(var(--danger-primary) / <alpha-value>)',
        },
        progress: {
          DEFAULT: 'rgb(var(--progress-background) / <alpha-value>)',
        },
        neutral: {
          DEFAULT: 'rgb(var(--neutral-primary) / <alpha-value>)', // Or whatever you name it
          hover: 'rgb(var(--neutral-hover) / <alpha-value>)',
        },
      }
    }
  },
  plugins: [],
};

