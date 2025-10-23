import React from 'react';

/**
 * Props for the ThemeToggle component.
 * @interface ThemeToggleProps
 */
interface ThemeToggleProps {
  /** The current theme ('light' or 'dark'). */
  theme: string;
  /** Function to call when the toggle is clicked. */
  onToggle: () => void;
}

/**
 * A button component that allows the user to toggle between light and dark themes.
 * It displays a moon icon for the light theme and a sun icon for the dark theme.
 *
 * @param {ThemeToggleProps} props The props for the component.
 * @returns {React.ReactElement} The rendered ThemeToggle component.
 */
const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-neutral-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        // Moon Icon
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ) : (
        // Sun Icon
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )}
    </button>
  );
};

export default ThemeToggle;
