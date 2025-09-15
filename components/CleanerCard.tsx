import React from 'react';
import type { Cleaner } from '../types';
import StarRating from './StarRating';
import BadgeDisplay from './BadgeDisplay';

interface CleanerCardProps {
  cleaner: Cleaner;
  onSelect: (cleaner: Cleaner) => void;
  onClick: () => void;
  isSelected: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  isFavorited: boolean;
  onToggleFavorite: (cleanerId: number) => void;
}

const CleanerCard: React.FC<CleanerCardProps> = ({ cleaner, onSelect, onClick, isSelected, onMouseEnter, onMouseLeave, isFavorited, onToggleFavorite }) => {
  return (
    <div
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`bg-base-100 rounded-xl shadow-lg overflow-hidden cursor-pointer group transform hover:-translate-y-1 transition-all duration-300 ease-in-out flex flex-col
                  ${isSelected ? 'ring-2 ring-primary shadow-2xl' : 'hover:shadow-xl'}`}
    >
      <div className="relative">
        <img
          className="w-full h-48 object-cover"
          src={cleaner.imageUrl}
          alt={`Profile of ${cleaner.name}`}
        />
        {cleaner.badge && <BadgeDisplay badge={cleaner.badge} className="absolute top-2 left-2" />}
        <div className="absolute top-0 right-0 bg-primary text-primary-content font-bold px-3 py-1 m-2 rounded-full text-sm">
          ${cleaner.hourlyRate}/hr
        </div>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-1">
            <h3 className="text-lg font-bold text-neutral-focus group-hover:text-primary transition-colors duration-300 pr-2">{cleaner.name}</h3>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(cleaner.id);
                }}
                className="p-1 rounded-full text-slate-400 hover:bg-red-100 dark:hover:bg-neutral-focus group/heart transition-colors duration-200 flex-shrink-0"
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
        </div>
        <p className="text-sm text-slate-500 mb-2">{cleaner.tagline}</p>
        
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-3">
          <div className="flex items-center space-x-1 text-slate-600">
            <StarRating rating={cleaner.rating} />
            <span className="text-xs">({cleaner.reviewsCount})</span>
          </div>
          {cleaner.distance !== undefined && (
            <div className="flex items-center text-xs text-slate-500">
              <svg className="w-4 h-4 mr-1 text-slate-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path></svg>
              <span>{cleaner.distance.toFixed(1)} mi away</span>
            </div>
          )}
        </div>
        
         <button 
            onClick={(e) => {
                e.stopPropagation(); // Prevent card's onClick from firing
                onSelect(cleaner);
            }}
            className="w-full mt-auto bg-primary text-primary-content font-semibold py-2 px-4 rounded-lg hover:bg-primary-focus transition duration-300 text-sm">
            View Profile
        </button>
      </div>
    </div>
  );
};

export default CleanerCard;