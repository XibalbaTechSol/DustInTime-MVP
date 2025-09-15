import React from 'react';
import type { Cleaner } from '../types';
import StarRating from './StarRating';
import BadgeDisplay from './BadgeDisplay';

interface CleanerListRowProps {
  cleaner: Cleaner;
  onSelect: () => void;
  onQuickBook: () => void;
  isFavorited: boolean;
  onToggleFavorite: () => void;
}

const CleanerListRow: React.FC<CleanerListRowProps> = ({ cleaner, onSelect, onQuickBook, isFavorited, onToggleFavorite }) => {
  return (
    <div
      onClick={onSelect}
      className="flex items-center space-x-4 p-3 bg-base-100 dark:bg-neutral rounded-xl shadow-md hover:shadow-lg hover:ring-2 hover:ring-primary/50 transition-all duration-300 cursor-pointer"
    >
      <img
        className="w-20 h-20 md:w-24 md:h-24 rounded-lg object-cover flex-shrink-0"
        src={cleaner.imageUrl}
        alt={`Profile of ${cleaner.name}`}
      />
      <div className="flex-grow min-w-0">
        <div className="flex justify-between items-start gap-2">
            <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-neutral-focus dark:text-base-100 truncate">{cleaner.name}</h3>
                {cleaner.badge && <BadgeDisplay badge={cleaner.badge} />}
            </div>
            <p className="font-bold text-lg text-primary flex-shrink-0">${cleaner.hourlyRate}<span className="text-sm font-normal text-slate-500">/hr</span></p>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 truncate mt-1">{cleaner.tagline}</p>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 my-2 text-sm text-slate-600 dark:text-slate-300">
          <div className="flex items-center space-x-1">
            <StarRating rating={cleaner.rating} />
            <span className="font-semibold">{cleaner.rating.toFixed(1)}</span>
            <span className="text-xs text-slate-400">({cleaner.reviewsCount})</span>
          </div>
          {cleaner.distance !== undefined && (
            <div className="flex items-center text-xs">
              <svg className="w-4 h-4 mr-1 text-slate-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path></svg>
              <span>{cleaner.distance.toFixed(1)} mi away</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 mt-2">
            {cleaner.services.slice(0, 3).map(service => (
                <span key={service} className="text-xs font-medium bg-primary/10 text-primary-focus px-2 py-1 rounded-full">
                    {service}
                </span>
            ))}
            {cleaner.services.length > 3 && (
                <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                    +{cleaner.services.length - 3} more
                </span>
            )}
        </div>
      </div>
      <div className="flex flex-col items-center space-y-3 pl-2">
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite();
                }}
                className="p-2 rounded-full text-slate-400 hover:bg-red-100 dark:hover:bg-neutral-focus group/heart transition-colors duration-200"
                aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-6 w-6 transition-all duration-200 transform group-hover/heart:text-red-500 ${isFavorited ? 'text-red-500 scale-110' : ''}`}
                    fill={isFavorited ? 'currentColor' : 'none'}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
            </button>
             <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickBook();
                }}
                className="w-full bg-primary text-primary-content font-semibold py-2 px-4 rounded-lg hover:bg-primary-focus transition duration-300 text-sm whitespace-nowrap">
                Quick Book
            </button>
      </div>
    </div>
  );
};

export default CleanerListRow;