import React from 'react';
import type { Cleaner } from '../types';
import StarRating from './StarRating';

/**
 * Props for the MapCleanerCard component.
 * @interface MapCleanerCardProps
 */
interface MapCleanerCardProps {
  /** The cleaner data object to display in the card. */
  cleaner: Cleaner;
  /**
   * Callback function to handle navigation, typically to the cleaner's profile page.
   * @param {string} page - The target page name.
   * @param {any} props - Props to pass to the target page, e.g., { cleanerId: number }.
   */
  onNavigate: (page: string, props: any) => void;
}

/**
 * A compact card component designed to be used as a popup on the map.
 * It displays a cleaner's image, name, rating, and hourly rate, along with a
 * button to view their full profile.
 *
 * @param {MapCleanerCardProps} props The props for the component.
 * @returns {React.ReactElement} The rendered MapCleanerCard component.
 */
const MapCleanerCard: React.FC<MapCleanerCardProps> = ({ cleaner, onNavigate }) => {
  const handleViewProfile = () => {
    onNavigate('cleanerProfile', { cleanerId: cleaner.id, from: 'map' });
  };

  return (
    <div className="w-64 bg-base-100 dark:bg-neutral shadow-lg rounded-lg overflow-hidden animate-fade-in">
      <img
        className="w-full h-24 object-cover"
        src={cleaner.imageUrl}
        alt={cleaner.name}
      />
      <div className="p-3">
        <h3 className="font-bold text-md text-neutral-focus dark:text-base-200 truncate">{cleaner.name}</h3>
        <div className="flex justify-between items-center mt-2">
            <div className="flex items-center space-x-1">
                <StarRating rating={cleaner.rating} />
                <span className="text-xs text-slate-500 dark:text-slate-400">({cleaner.reviewsCount})</span>
            </div>
            <div className="font-bold text-primary text-md">
                ${cleaner.hourlyRate}<span className="font-normal text-xs text-slate-500 dark:text-slate-400">/hr</span>
            </div>
        </div>
        <button
          onClick={handleViewProfile}
          className="w-full mt-3 bg-primary text-primary-content font-semibold py-1.5 px-3 rounded-md hover:bg-primary-focus transition duration-300 text-sm"
        >
          View Profile
        </button>
      </div>
    </div>
  );
};

export default MapCleanerCard;