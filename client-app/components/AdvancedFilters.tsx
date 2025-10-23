import React, { useState, useEffect, useMemo } from 'react';

/**
 * Defines the shape of the filters object used throughout the component.
 * @interface Filters
 */
interface Filters {
    /** An array of selected service names. */
    services: string[];
    /** A tuple representing the minimum and maximum price range. */
    priceRange: [number, number];
    /** The minimum star rating selected by the user. */
    minRating: number;
    /** A boolean indicating whether to show only favorited cleaners. */
    showFavoritesOnly: boolean;
    /** The selected availability date, or null if not set. */
    availabilityDate: string | null;
}

/**
 * Props for the AdvancedFilters component.
 * @interface AdvancedFiltersProps
 */
interface AdvancedFiltersProps {
    /** Whether the filter panel is currently open. */
    isOpen: boolean;
    /** Function to call when the panel should be closed. */
    onClose: () => void;
    /** The currently active filters. */
    currentFilters: Filters;
    /** Function to call when the user applies new filters. */
    onApplyFilters: (filters: Filters) => void;
    /** A list of all available services to display as options. */
    allServices: string[];
    /** The number of results that match the current filters. */
    resultsCount: number;
}

const RATING_OPTIONS = [
    { label: '4.5 ★ & up', value: 4.5 },
    { label: '4.0 ★ & up', value: 4.0 },
    { label: '3.0 ★ & up', value: 3.0 },
];

/**
 * A slide-out panel component that allows users to apply advanced filters
 * to a list of cleaners. It includes options for availability, price range,
 * rating, favorites, and specific services.
 *
 * @param {AdvancedFiltersProps} props The props for the component.
 * @returns {React.ReactElement} The rendered AdvancedFilters component.
 */
const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({ isOpen, onClose, currentFilters, onApplyFilters, allServices, resultsCount }) => {
    const [localFilters, setLocalFilters] = useState<Filters>(currentFilters);
    const today = useMemo(() => new Date().toISOString().split('T')[0], []);

    useEffect(() => {
        setLocalFilters(currentFilters);
    }, [currentFilters, isOpen]);
    
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => { document.body.style.overflow = 'auto' };
    }, [isOpen]);

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, index: 0 | 1) => {
        const value = parseInt(e.target.value, 10);
        const newRange = [...localFilters.priceRange] as [number, number];
        newRange[index] = value;
        // Ensure min is not greater than max
        if (index === 0 && newRange[0] > newRange[1]) newRange[1] = newRange[0];
        if (index === 1 && newRange[1] < newRange[0]) newRange[0] = newRange[1];
        setLocalFilters(prev => ({ ...prev, priceRange: newRange }));
    };
    
    const handleServiceToggle = (service: string) => {
        setLocalFilters(prev => {
            const newServices = prev.services.includes(service)
                ? prev.services.filter(s => s !== service)
                : [...prev.services, service];
            return { ...prev, services: newServices };
        });
    };
    
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalFilters(prev => ({ ...prev, availabilityDate: e.target.value || null }));
    };

    const handleApply = () => {
        onApplyFilters(localFilters);
        onClose();
    };

    const handleClear = () => {
        const defaultFilters = {
            services: [],
            priceRange: [10, 50] as [number, number],
            minRating: 0,
            showFavoritesOnly: false,
            availabilityDate: null,
        };
        setLocalFilters(defaultFilters);
        onApplyFilters(defaultFilters); // Apply clear immediately
        onClose();
    };

    return (
        <>
            {/* Overlay */}
            <div 
                className={`fixed inset-0 bg-black/50 z-40 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            ></div>
            {/* Panel */}
            <div className={`fixed top-0 right-0 h-full w-full max-w-sm bg-base-100 dark:bg-neutral z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-base-300 dark:border-slate-700">
                        <h2 className="text-xl font-bold">Filters</h2>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-base-200 dark:hover:bg-neutral-focus">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-grow p-6 overflow-y-auto space-y-8">
                        {/* Availability */}
                        <div>
                             <h3 className="font-semibold mb-3">Availability</h3>
                             <label htmlFor="availability-date" className="sr-only">Check availability for a date</label>
                             <input
                                type="date"
                                id="availability-date"
                                value={localFilters.availabilityDate || ''}
                                onChange={handleDateChange}
                                min={today}
                                className="w-full px-3 py-2 bg-white dark:bg-neutral-focus border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                             />
                        </div>

                        {/* Price Range */}
                        <div>
                            <h3 className="font-semibold mb-3">Price per hour</h3>
                            <div className="relative">
                                <input type="range" min="10" max="50" value={localFilters.priceRange[0]} onChange={(e) => handlePriceChange(e, 0)} className="absolute w-full h-1 appearance-none bg-transparent pointer-events-none z-10" />
                                <input type="range" min="10" max="50" value={localFilters.priceRange[1]} onChange={(e) => handlePriceChange(e, 1)} className="absolute w-full h-1 appearance-none bg-transparent pointer-events-none z-10" />
                                <div className="h-1 bg-slate-200 dark:bg-slate-600 rounded-full">
                                    <div className="h-1 bg-primary rounded-full" style={{ marginLeft: `${((localFilters.priceRange[0] - 10) / 40) * 100}%`, width: `${((localFilters.priceRange[1] - localFilters.priceRange[0]) / 40) * 100}%` }}></div>
                                </div>
                            </div>
                            <div className="flex justify-between items-center mt-3 text-sm">
                                <span>${localFilters.priceRange[0]}</span>
                                <span>${localFilters.priceRange[1]}</span>
                            </div>
                        </div>

                        {/* Rating */}
                        <div>
                            <h3 className="font-semibold mb-3">Rating</h3>
                            <div className="flex items-center space-x-2">
                                {RATING_OPTIONS.map(opt => (
                                    <button key={opt.value} onClick={() => setLocalFilters(prev => ({ ...prev, minRating: prev.minRating === opt.value ? 0 : opt.value }))} className={`px-3 py-2 text-sm font-semibold rounded-lg border transition-colors ${localFilters.minRating === opt.value ? 'bg-primary/10 border-primary text-primary-focus' : 'border-slate-300 dark:border-slate-600 hover:bg-base-200'}`}>
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        {/* Favorites */}
                        <div>
                             <label className="flex items-center justify-between cursor-pointer">
                                <span className="font-semibold">Show favorites only</span>
                                <input type="checkbox" checked={localFilters.showFavoritesOnly} onChange={e => setLocalFilters(prev => ({...prev, showFavoritesOnly: e.target.checked}))} className="toggle toggle-primary" />
                             </label>
                        </div>

                        {/* Services */}
                        <div>
                            <h3 className="font-semibold mb-3">Services</h3>
                            <div className="flex flex-wrap gap-2">
                                {allServices.map(service => (
                                    <button key={service} onClick={() => handleServiceToggle(service)} className={`px-3 py-1.5 text-sm font-medium rounded-full border transition-colors ${localFilters.services.includes(service) ? 'bg-primary/10 border-primary text-primary-focus' : 'border-slate-300 dark:border-slate-600 hover:bg-base-200'}`}>
                                        {service}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex-shrink-0 flex items-center justify-between p-4 border-t border-base-300 dark:border-slate-700">
                        <button onClick={handleClear} className="font-semibold hover:underline">Clear all</button>
                        <button onClick={handleApply} className="bg-primary text-primary-content font-bold py-2 px-6 rounded-lg hover:bg-primary-focus transition">
                           Show {resultsCount} results
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdvancedFilters;