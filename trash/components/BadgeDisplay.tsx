import React from 'react';
import type { Badge } from '../types';

/**
 * Props for the BadgeDisplay component.
 * @interface BadgeDisplayProps
 */
interface BadgeDisplayProps {
    /** The specific badge to display. */
    badge: Badge;
    /** Optional additional CSS classes to apply to the component. */
    className?: string;
}

/**
 * A configuration object that maps badge names to their display properties,
 * including CSS styles, an SVG icon, and display text.
 * @const {object} badgeConfig
 */
const badgeConfig: { [key in Badge]: { style: string, icon: JSX.Element, text: string } } = {
    'Top Rated': {
        style: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200 border border-amber-300/50',
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>,
        text: 'Top Rated'
    },
    'Great Value': {
        style: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200 border border-green-300/50',
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a1 1 0 011-1h5a.997.997 0 01.707.293l7 7zM6 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>,
        text: 'Great Value'
    },
    'Rising Star': {
        style: 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-200 border border-sky-300/50',
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>,
        text: 'Rising Star'
    },
    'New to Platform': {
        style: 'bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-200 border border-violet-300/50',
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 3a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 3zM10 15a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 15zM4.636 4.636a.75.75 0 011.06 0l1.061 1.06a.75.75 0 01-1.06 1.061L4.636 5.697a.75.75 0 010-1.06zm9.193 9.193a.75.75 0 011.06 0l1.061 1.06a.75.75 0 01-1.06 1.061l-1.061-1.06a.75.75 0 010-1.061zM15.364 4.636a.75.75 0 010 1.06l-1.06 1.061a.75.75 0 01-1.061-1.06L14.303 4.636a.75.75 0 011.06 0zm-9.193 9.193a.75.75 0 010 1.06l-1.06 1.061a.75.75 0 11-1.061-1.06l1.06-1.06a.75.75 0 011.061 0zM17 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 0117 10zM5 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 015 10z" /></svg>,
        text: 'New'
    },
};

const BadgeDisplay: React.FC<BadgeDisplayProps> = ({ badge, className = '' }) => {
    if (!badge) return null;

    const config = badgeConfig[badge];

    return (
        <div className={`flex items-center space-x-1.5 text-xs font-bold px-2 py-1 rounded-full ${config.style} ${className}`}>
            {config.icon}
            <span>{config.text}</span>
        </div>
    );
};

export default BadgeDisplay;
