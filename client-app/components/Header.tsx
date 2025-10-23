import React, { useState, useEffect, useRef } from 'react';
import type { User } from '../types';

/**
 * Props for the Header component.
 * @interface HeaderProps
 */
interface HeaderProps {
    /** The currently authenticated user object, or null if no user is logged in. */
    user: User | null;
    /**
     * Callback function to handle navigation to different pages.
     * @param {'home' | 'dashboard' | 'settings' | 'messages'} page - The target page.
     */
    onNavigate: (page: 'home' | 'dashboard' | 'settings' | 'messages') => void;
    /** Callback function to toggle the visibility of the main dashboard. */
    onToggleDashboard: () => void;
    /** Callback function invoked with the search term as the user types. */
    onSearch: (term: string) => void;
    onLogout: () => void;
}

/**
 * The main header component for the application.
 * It includes the logo, a search bar, navigation controls, a theme toggle,
 * and a user profile dropdown menu for authenticated users.
 *
 * @param {HeaderProps} props The props for the component.
 * @returns {React.ReactElement} The rendered Header component.
 */
const Header: React.FC<HeaderProps> = ({ user, onNavigate, onToggleDashboard, onSearch, onLogout }) => {
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
    <header className="bg-base-100 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3 gap-4">
          {/* Logo and Search */}
          <div className="flex items-center flex-1 min-w-0">
            <div 
              className="flex-shrink-0 cursor-pointer flex items-center gap-2"
              onClick={() => handleNav('dashboard')}
              aria-label="Go to dashboard"
            >
              <img src="/logo.png" alt="Dust in Time Logo" className="h-10 w-10" />
              <span className="font-bold text-xl text-neutral-focus hidden sm:inline">Dust in Time - Client App</span>
            </div>
            
            <div className="flex-1 max-w-lg ml-4">
              <div className="relative">
                  <input 
                      type="text" 
                      placeholder="Search cleaners or services..." 
                      onChange={(e) => onSearch(e.target.value)}
                      className="w-full px-4 py-2 pl-10 text-sm bg-base-200 rounded-full border border-transparent focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
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
                    className="hidden sm:block text-neutral-focus font-semibold hover:text-primary transition-colors duration-200">
                    My Dashboard
                </button>
                 <button
                    onClick={() => handleNav('messages')}
                    className="p-2 rounded-full text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    aria-label="Open messages"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                </button>
                <button
                    onClick={() => handleNav('settings')}
                    className="p-2 rounded-full text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    aria-label="Open settings"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </button>
                <div className="relative" ref={dropdownRef}>
                  <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="rounded-full h-10 w-10 overflow-hidden ring-2 ring-primary/50 hover:ring-primary transition">
                    {user.picture ? (
                    <img src={user.picture} alt="User profile" className="h-full w-full object-cover" />
                ) : (
                    <div className="h-full w-full bg-gray-300 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                )}
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-base-100 rounded-lg shadow-xl py-2 z-[1100] animate-fade-in animate-scale-in origin-top-right">
                      <div 
                        onClick={() => handleNav('settings')}
                        className="px-4 py-2 border-b cursor-pointer hover:bg-base-200"
                      >
                        <p className="font-bold text-neutral-focus truncate">{user.name}</p>
                        <p className="text-sm text-gray-500 truncate">{user.email}</p>
                      </div>
                      <button onClick={() => handleNav('dashboard')} className="w-full text-left block px-4 py-2 text-gray-700 hover:bg-base-200">Dashboard</button>
                       <button onClick={() => handleNav('messages')} className="w-full text-left block px-4 py-2 text-gray-700 hover:bg-base-200">Messages</button>
                       <button onClick={onLogout} className="w-full text-left block px-4 py-2 text-gray-700 hover:bg-base-200">Logout</button>
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