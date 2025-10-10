import React, { useState, useEffect, useMemo } from 'react';
import CleanerCard from './CleanerCard';
import LocationPromptModal from './LocationPromptModal';
import Map from './Map';
import AdvancedFilters from './AdvancedFilters';
import CleanerListRow from './CleanerListRow';
import InstantBookModal from './InstantBookModal'; // New
import { getCleanerBadge, calculateAvailableSlots } from '../utils'; // New
import type { Cleaner, Booking, User } from '../types'; // New

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
 * It features a map and list view, advanced filtering, sorting, and handles
 * user location for proximity-based results.
 *
 * @param {HomePageProps} props The props for the component.
 * @returns {React.ReactElement} The rendered HomePage component.
 */
const HomePage: React.FC<HomePageProps> = ({ onNavigate, searchTerm, onBookingCreate, bookings, user, cleaners }) => {
  const [locationStatus, setLocationStatus] = useState<string>('loading');
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [hoveredCleanerId, setHoveredCleanerId] = useState<number | null>(null);
  const [selectedCleanerId, setSelectedCleanerId] = useState<number | null>(null);
  const [view, setView] = useState<'map' | 'list'>('map');
  const [favoritedCleanerIds, setFavoritedCleanerIds] = useState<Set<number>>(() => new Set(JSON.parse(localStorage.getItem('favoritedCleaners') || '[]')));
  
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


  const allServices = useMemo(() => {
    const servicesSet = new Set<string>();
    cleaners.forEach(cleaner => {
        cleaner.services.forEach(service => servicesSet.add(service));
    });
    return Array.from(servicesSet).sort();
  }, [cleaners]);

  const filteredAndSortedCleaners = useMemo(() => {
    let filteredCleaners = cleaners.map(cleaner => ({
        ...cleaner,
        distance: userLocation ? calculateDistance(userLocation.lat, userLocation.lng, cleaner.location.lat, cleaner.location.lng) : undefined,
        badge: getCleanerBadge(cleaner),
    }));
    
    const lowercasedSearchTerm = searchTerm.toLowerCase();

    // Apply filters
    filteredCleaners = filteredCleaners.filter(c => {
        // Search term
        if (lowercasedSearchTerm) {
            const nameMatch = c.name.toLowerCase().includes(lowercasedSearchTerm);
            const serviceMatch = c.services.some(s => s.toLowerCase().includes(lowercasedSearchTerm));
            if (!nameMatch && !serviceMatch) {
                return false;
            }
        }
        // Price range
        if (c.hourlyRate < filters.priceRange[0] || c.hourlyRate > filters.priceRange[1]) {
            return false;
        }
        // Rating
        if (c.rating < filters.minRating) {
            return false;
        }
        // Services
        if (filters.services.length > 0 && !filters.services.every(s => c.services.includes(s))) {
            return false;
        }
        // Favorites
        if (filters.showFavoritesOnly && !favoritedCleanerIds.has(c.id)) {
            return false;
        }
        // Availability Date
        if (filters.availabilityDate) {
            // Create a date object at the beginning of the selected day in local timezone
            const checkDate = new Date(filters.availabilityDate + 'T00:00:00');
            const availableSlots = calculateAvailableSlots(checkDate, c, bookings);
            if (availableSlots.length === 0) {
                return false;
            }
        }
        return true;
    });

    // Apply sorting
    filteredCleaners.sort((a, b) => {
        switch (sortBy) {
            case 'price_asc':
                return a.hourlyRate - b.hourlyRate;
            case 'price_desc':
                return b.hourlyRate - a.hourlyRate;
            case 'rating':
                return b.rating - a.rating;
            case 'distance':
            default:
                if (a.distance === undefined || b.distance === undefined) return 0;
                return a.distance - b.distance;
        }
    });

    return filteredCleaners;
  }, [userLocation, filters, sortBy, favoritedCleanerIds, searchTerm, bookings, cleaners]);

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
  }, []);
  
  const selectedCleaner = useMemo(() => {
    return filteredAndSortedCleaners.find(c => c.id === selectedCleanerId) || null;
  }, [selectedCleanerId, filteredAndSortedCleaners]);

  const handleSelectCleaner = (cleaner: Cleaner) => {
    onNavigate('cleanerProfile', { cleanerId: cleaner.id });
  };
  
  const handleCleanerCardClick = (cleaner: Cleaner) => {
    setSelectedCleanerId(cleaner.id);
    if (view === 'list') {
      setView('map');
    }
  }
  
  const handleAllowLocation = () => {
    setIsLocationModalOpen(false);
    requestLocation();
  };

  const handleDenyLocation = () => {
    setIsLocationModalOpen(false);
    setLocationStatus('denied');
    setSortBy('rating'); // Default sort if no location
  };

  const handleToggleFavorite = (cleanerId: number) => {
    setFavoritedCleanerIds(prev => {
        const newFavorites = new Set(prev);
        if (newFavorites.has(cleanerId)) {
            newFavorites.delete(cleanerId);
        } else {
            newFavorites.add(cleanerId);
        }
        localStorage.setItem('favoritedCleaners', JSON.stringify(Array.from(newFavorites)));
        return newFavorites;
    });
  };

  const LocationStatusBanner: React.FC<{ onRetry: () => void }> = ({ onRetry }) => {
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
      </div>
    );
  };
  
  const ViewToggleButton = () => (
    <button
        onClick={() => setView(v => v === 'map' ? 'list' : 'map')}
        className="absolute bottom-6 right-6 z-[900] bg-primary text-primary-content rounded-full p-4 shadow-lg hover:bg-primary-focus transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-focus"
        aria-label={`Switch to ${view === 'map' ? 'list' : 'map'} view`}
    >
        {view === 'map' ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
        ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13v-6m0-6V7m0 6h6m-6 0L3.553 7.276A1 1 0 013 6.382V5.618a1 1 0 011.447-.894L9 7m6 13l5.447-2.724A1 1 0 0021 16.382V5.618a1 1 0 00-1.447-.894L15 7m0 13v-6m0-6V7m0 6h-6" />
            </svg>
        )}
    </button>
  );

  return (
    <div className="w-full h-[calc(100vh-70px)] bg-base-200 dark:bg-neutral-focus flex flex-col">
        {/* Top section for controls */}
        <div className="flex-shrink-0 z-10 p-4 pt-2 space-y-3 bg-base-200 dark:bg-neutral-focus border-b border-base-300 dark:border-slate-700/50">
            <div className="w-full max-w-lg mx-auto">
                <LocationStatusBanner onRetry={handleAllowLocation} />
            </div>
             <div className="flex items-center justify-between gap-4">
                <button onClick={() => setIsFilterPanelOpen(true)} className="flex items-center space-x-2 font-semibold text-neutral-focus dark:text-base-200 bg-base-100 dark:bg-neutral px-4 py-2 rounded-lg shadow-sm hover:bg-base-200 dark:hover:bg-neutral-focus transition">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100 4m0-4a2 2 0 110 4m0-4v-4m0 4h.01M18 20V10m0 10a2 2 0 100-4m0 4a2 2 0 110-4m0 4h.01M6 20V10m0 10a2 2 0 100-4m0 4a2 2 0 110-4m0 4H6.01" />
                    </svg>
                    <span>Filters</span>
                </button>
                <div className="flex items-center space-x-2">
                    <label htmlFor="sort-by" className="text-sm font-medium text-slate-600 dark:text-slate-300">Sort by</label>
                    <select 
                        id="sort-by"
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value)}
                        className="bg-base-100 dark:bg-neutral text-sm font-semibold rounded-lg border-slate-300 dark:border-slate-600 shadow-sm focus:ring-primary focus:border-primary"
                    >
                        <option value="distance" disabled={!userLocation}>Nearest First</option>
                        <option value="rating">Highest Rating</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                    </select>
                </div>
            </div>
        </div>

        {/* Map/List section */}
        <div className="flex-grow relative">
            <div className="absolute inset-0">
                {view === 'map' && (
                    <Map 
                        cleaners={filteredAndSortedCleaners}
                        userLocation={userLocation}
                        selectedCleaner={selectedCleaner}
                        hoveredCleanerId={hoveredCleanerId}
                        onMarkerClick={(id) => setSelectedCleanerId(id === selectedCleanerId ? null : id)}
                        onMarkerHover={(id) => setHoveredCleanerId(id)}
                        onNavigate={onNavigate}
                    />
                )}
                {view === 'list' && (
                    <div className="p-4 pt-2 h-full overflow-y-auto">
                        <div className="space-y-3 max-w-4xl mx-auto">
                            {filteredAndSortedCleaners.map((cleaner) => (
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
                        {filteredAndSortedCleaners.length === 0 && (
                            <div className="text-center py-20">
                                <h3 className="text-xl font-semibold text-neutral-focus dark:text-base-200">No Cleaners Found</h3>
                                <p className="text-slate-500 dark:text-slate-400 mt-2">Try adjusting your filters or search term to see more results.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <ViewToggleButton />
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
        resultsCount={filteredAndSortedCleaners.length}
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