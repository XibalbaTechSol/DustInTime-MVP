import React, { useState, useEffect, useRef } from 'react';
import type { User } from '../types';
import ThemeToggle from './ThemeToggle';

/**
 * Props for the Header component.
 */
interface HeaderProps {
    /** The current user object, or null if not logged in. */
    user: User | null;
    /**
     * Callback function to handle navigation.
     * @param page The page to navigate to.
     */
    onNavigate: (page: 'home' | 'dashboard' | 'settings' | 'messages') => void;
    /** Callback function to toggle the dashboard visibility. */
    onToggleDashboard: () => void;
    /** The current theme ('light' or 'dark'). */
    theme: string;
    /** Callback function to toggle the theme. */
    onToggleTheme: () => void;
    /**
     * Callback function to handle search input.
     * @param term The search term.
     */
    onSearch: (term: string) => void;
}

/**
 * The main header component for the application.
 * @param {HeaderProps} props The props for the component.
 * @returns {JSX.Element} The rendered component.
 */
const Header: React.FC<HeaderProps> = ({ user, onNavigate, onToggleDashboard, theme, onToggleTheme, onSearch }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const handleNav = (page: 'home' | 'dashboard' | 'settings' | 'messages') => {
    onNavigate(page);
    setIsDropdownOpen(false);
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-base-100 dark:bg-neutral shadow-md sticky top-0 z-30">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3 gap-4">
          {/* Logo and Search */}
          <div className="flex items-center flex-1 min-w-0">
            <div 
              className="flex-shrink-0 cursor-pointer"
              onClick={() => handleNav('dashboard')}
              aria-label="Go to dashboard"
            >
              <svg
                  className="h-8 w-8 text-primary"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  xmlns="http://www.w3.org/2000/svg"
              >
                  {/* Clock Face */}
                  <circle cx="12" cy="12" r="10" />

                  {/* Minute Hand (Mop/Broom) pointing to 10 mins (2 o'clock) */}
                  <g transform="rotate(60 12 12)">
                      {/* Handle */}
                      <line x1="12" y1="12" x2="12" y2="4" />
                      {/* Head */}
                      <rect x="9.5" y="4" width="5" height="2" rx="0.5" fill="currentColor" stroke="none"/>
                  </g>

                  {/* Hour Hand (Spray Bottle) pointing to 10 o'clock */}
                  <g transform="rotate(-60 12 12)">
                      {/* Body */}
                      <line x1="12" y1="12" x2="12" y2="8.5" />
                      <rect x="10" y="6" width="4" height="3" rx="1" fill="currentColor" stroke="none" />
                      {/* Nozzle */}
                      <path d="M12 6 V 5 L 14 4.5" />
                  </g>
              </svg>
            </div>
            
            <div className="flex-1 max-w-lg ml-4">
              <div className="relative">
                  <input 
                      type="text" 
                      placeholder="Search cleaners or services..." 
                      onChange={(e) => onSearch(e.target.value)}
                      className="w-full px-4 py-2 pl-10 text-sm bg-base-200 dark:bg-neutral-focus rounded-full border border-transparent focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
              </div>
            </div>
          </div>
          
          {/* Nav items */}
          <nav className="flex items-center space-x-2 sm:space-x-4">
            {user ? (
              <>
                <button 
                    onClick={() => handleNav('dashboard')}
                    className="hidden sm:block text-neutral-focus dark:text-base-200 font-semibold hover:text-primary dark:hover:text-primary transition-colors duration-200">
                    My Dashboard
                </button>
                <ThemeToggle theme={theme} onToggle={onToggleTheme} />
                 <button
                    onClick={() => handleNav('messages')}
                    className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-neutral-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    aria-label="Open messages"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                </button>
                <button
                    onClick={() => handleNav('settings')}
                    className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-neutral-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    aria-label="Open settings"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </button>
                <div className="relative" ref={dropdownRef}>
                  <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="rounded-full h-10 w-10 overflow-hidden ring-2 ring-primary/50 hover:ring-primary transition">
                    <img src={user.picture} alt="User profile" className="h-full w-full object-cover" />
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-base-100 dark:bg-neutral rounded-lg shadow-xl py-2 z-40 animate-fade-in animate-scale-in origin-top-right">
                      <div 
                        onClick={() => handleNav('settings')}
                        className="px-4 py-2 border-b dark:border-slate-600 cursor-pointer hover:bg-base-200 dark:hover:bg-neutral-focus"
                      >
                        <p className="font-bold text-neutral-focus dark:text-base-200 truncate">{user.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                      </div>
                      <button onClick={() => handleNav('dashboard')} className="w-full text-left block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-base-200 dark:hover:bg-neutral-focus">Dashboard</button>
                       <button onClick={() => handleNav('messages')} className="w-full text-left block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-base-200 dark:hover:bg-neutral-focus">Messages</button>
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;