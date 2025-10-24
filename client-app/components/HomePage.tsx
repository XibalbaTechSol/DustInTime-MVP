import React, { useState, useEffect, useMemo } from 'react';
import CleanerCard from './CleanerCard';
import LocationPromptModal from './LocationPromptModal';
import AdvancedFilters from './AdvancedFilters';
import CleanerListRow from './CleanerListRow';
import InstantBookModal from './InstantBookModal'; // New
import { getCleanerBadge, calculateAvailableSlots } from '../utils'; // New
import type { Cleaner, Booking, User } from '../types'; // New
import axios from 'axios';

/**
 * Calculates the distance between two geographical points using the Haversine formula.
 *
 * @param {number} lat1 Latitude of the first point.
 * @param {number} lon1 Longitude of the first point.
 * @param {number} lat2 Latitude of the second point.
 * @param {number} lon2 Longitude of the second point.
 * @returns {number} The distance in miles.
 */
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 3959; // Radius of the Earth in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Props for the HomePage component.
 * @interface HomePageProps
 */
interface HomePageProps {
    /** Function to handle navigation to other pages. */
    onNavigate: (page: string, props?: any) => void;
    /** The current search term entered by the user. */
    searchTerm: string;
    /** Callback function invoked when a new booking is created. */
    onBookingCreate: (booking: Booking) => void;
    /** An array of existing bookings, used for availability checks. */
    bookings: Booking[];
    /** The currently authenticated user. */
    user: User;
    /** The list of all cleaners to be displayed and filtered. */
    cleaners: Cleaner[];
}

/**
 * The main page of the application for finding and booking cleaners.
 * It features a list view, advanced filtering, sorting, and handles
 * user location for proximity-based results.
 *
 * @param {HomePageProps} props The props for the component.
 * @returns {React.ReactElement} The rendered HomePage component.
 */
const HomePage: React.FC<HomePageProps> = ({ onNavigate, searchTerm, onBookingCreate, bookings, user, cleaners }) => {
  console.log('HomePage user:', user);
  const [locationStatus, setLocationStatus] = useState<string>('loading');
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [favoritedCleanerIds, setFavoritedCleanerIds] = useState<Set<string>>(() => new Set());

  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [filters, setFilters] = useState({
    services: [] as string[],
    priceRange: [10, 50] as [number, number],
    minRating: 0,
    showFavoritesOnly: false,
    availabilityDate: null as string | null, // New
  });
  const [sortBy, setSortBy] = useState('distance');

  const [bookingModalCleaner, setBookingModalCleaner] = useState<Cleaner | null>(null);
  const [isBannerOpen, setIsBannerOpen] = useState(true);


  const allServices = useMemo(() => {
    const servicesSet = new Set<string>();
    cleaners.forEach(cleaner => {
        cleaner.services.forEach(service => servicesSet.add(service));
    });
    return Array.from(servicesSet).sort();
  }, [cleaners]);

  useEffect(() => {
    if (user) {
      axios.get(`/api/favorites/${user.id}`).then(res => {
        setFavoritedCleanerIds(new Set(res.data));
      });
    }
  }, [user]);

  const requestLocation = () => {
    setLocationStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        setUserLocation({ lat: userLat, lng: userLng });
        setLocationStatus('success');
      },
      (error) => {
        setLocationStatus(error.code === error.PERMISSION_DENIED ? 'denied' : 'error');
      }
    );
  }

  useEffect(() => {
    console.log('useEffect for user location, user:', user);
    if (user?.profile && 'location' in user.profile && user.profile.location) {
      console.log('Setting user location from profile:', user.profile.location);
      setUserLocation(user.profile.location);
      setLocationStatus('success');
    } else {
      console.log('User profile location not found, using geolocation.');
      if (!navigator.geolocation) {
        setLocationStatus('unsupported');
        return;
      }

      navigator.permissions?.query({ name: 'geolocation' }).then((permissionStatus) => {
          if (permissionStatus.state === 'granted') {
              requestLocation();
          } else if (permissionStatus.state === 'prompt') {
              setIsLocationModalOpen(true);
          } else if (permissionStatus.state === 'denied') {
              setLocationStatus('denied');
              setSortBy('rating'); // Default sort if no location
          }
      }).catch(() => {
          setIsLocationModalOpen(true);
      });
    }
  }, [user]);

  const handleSelectCleaner = (cleaner: Cleaner) => {
    onNavigate('cleanerProfile', { cleanerId: cleaner.id });
  };

  const handleAllowLocation = () => {
    setIsLocationModalOpen(false);
    requestLocation();
  };

  const handleDenyLocation = () => {
    setIsLocationModalOpen(false);
    setLocationStatus('denied');
    setSortBy('rating'); // Default sort if no location
  };

  const handleToggleFavorite = (cleanerId: string) => {
    const newFavorites = new Set(favoritedCleanerIds);
    if (newFavorites.has(cleanerId)) {
      newFavorites.delete(cleanerId);
      axios.delete(`/api/favorites/${user.id}/${cleanerId}`);
    } else {
      newFavorites.add(cleanerId);
      axios.post('/api/favorites', { userId: user.id, cleanerId });
    }
    setFavoritedCleanerIds(newFavorites);
  };

  const LocationStatusBanner: React.FC<{ onRetry: () => void }> = ({ onRetry }) => {
    if (!isBannerOpen) {
      return null;
    }

    let message = '';
    let icon = '';
    let bgColor = '';
    let showRetryButton = false;

    switch (locationStatus) {
      case 'loading':
        message = 'Finding cleaners near you...';
        icon = 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z';
        bgColor = 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200';
        break;
      case 'success':
        message = 'Showing cleaners nearest to you.';
        icon = 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z';
        bgColor = 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200';
        break;
      case 'denied':
        message = "Location permission denied. Sorting by proximity is disabled.";
        icon = 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636';
        bgColor = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200';
        showRetryButton = true;
        break;
      case 'error':
        message = "Could not access your location.";
        icon = 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636';
        bgColor = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200';
        showRetryButton = true;
        break;
      case 'unsupported':
        message = "Geolocation is not supported by your browser.";
        icon = 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z';
        bgColor = 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
        break;
      default:
        return null;
    }

    return (
      <div className={`p-3 rounded-lg flex items-center text-sm font-medium ${bgColor} shadow-md`}>
        <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon}></path></svg>
        <span className="flex-grow text-center sm:text-left">{message}</span>
        {showRetryButton && (
            <button
                onClick={onRetry}
                className="ml-4 flex-shrink-0 bg-white/70 dark:bg-slate-600 dark:text-yellow-100 dark:border-yellow-500/50 text-yellow-900 font-semibold py-1 px-3 rounded-md border border-yellow-800/50 hover:bg-white dark:hover:bg-slate-500 transition duration-200"
            >
                Try Again
            </button>
        )}
        <button onClick={() => setIsBannerOpen(false)} className="ml-4 flex-shrink-0 p-1 rounded-full hover:bg-black/10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    );
  };

  return (
    <div className="w-full h-[calc(100vh-70px)] bg-base-200 flex flex-col">
        {/* Top section for controls */}
        <div className="flex-shrink-0 z-10 p-4 pt-2 space-y-3 bg-base-200 border-b border-base-300">
            <div className="w-full max-w-lg mx-auto">
                <LocationStatusBanner onRetry={handleAllowLocation} />
            </div>
             <div className="flex items-center justify-between gap-4">
                <button onClick={() => setIsFilterPanelOpen(true)} className="flex items-center space-x-2 font-semibold text-neutral-focus bg-base-100 px-4 py-2 rounded-lg shadow-sm hover:bg-base-200 transition">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100 4m0-4a2 2 0 110 4m0-4v-4m0 4h.01M18 20V10m0 10a2 2 0 100-4m0 4a2 2 0 110 4m0 4h.01M6 20V10m0 10a2 2 0 100-4m0 4a2 2 0 110 4m0 4H6.01" />
                    </svg>
                    <span>Filters</span>
                </button>
                <div className="flex items-center space-x-2">
                    <label htmlFor="sort-by" className="text-sm font-medium text-slate-600">Sort by</label>
                    <select
                        id="sort-by"
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value)}
                        className="bg-base-100 text-sm font-semibold rounded-lg border-slate-300 shadow-sm focus:ring-primary focus:border-primary"
                    >
                        <option value="distance" disabled={!userLocation}>Nearest First</option>
                        <option value="rating">Highest Rating</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                    </select>
                </div>
            </div>
        </div>

        {/* List section */}
        <div className="flex-grow relative">
            <div className="absolute inset-0 p-4 pt-2 h-full overflow-y-auto">
                <div className="space-y-3 max-w-4xl mx-auto">
                    {cleaners.map((cleaner) => (
                        <CleanerListRow
                            key={cleaner.id}
                            cleaner={cleaner}
                            onSelect={() => handleSelectCleaner(cleaner)}
                            onQuickBook={() => setBookingModalCleaner(cleaner)}
                            isFavorited={favoritedCleanerIds.has(cleaner.id)}
                            onToggleFavorite={() => handleToggleFavorite(cleaner.id)}
                        />
                    ))}
                </div>

            </div>
        </div>

       <LocationPromptModal
        isOpen={isLocationModalOpen}
        onAllow={handleAllowLocation}
        onDeny={handleDenyLocation}
      />
      <AdvancedFilters
        isOpen={isFilterPanelOpen}
        onClose={() => setIsFilterPanelOpen(false)}
        currentFilters={filters}
        onApplyFilters={setFilters}
        allServices={allServices}
        resultsCount={cleaners.length}
      />
      {bookingModalCleaner && (
        <InstantBookModal
          isOpen={!!bookingModalCleaner}
          onClose={() => setBookingModalCleaner(null)}
          cleaner={bookingModalCleaner}
          user={user}
          existingBookings={bookings}
          onBookingComplete={onBookingCreate}
        />
      )}
    </div>
  );
}

export default HomePage;
