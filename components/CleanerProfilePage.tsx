import React, { useState } from 'react';
import type { Cleaner } from '../types';
import StarRating from './StarRating';
import BadgeDisplay from './BadgeDisplay';
import { getCleanerBadge } from '../utils';
import { CLEANERS_DATA } from '../constants';

/**
 * Props for the CleanerProfilePage component.
 */
interface CleanerProfilePageProps {
    /** The ID of the cleaner whose profile is being viewed. */
    cleanerId: number;
    /**
     * Callback function to handle navigation to other pages.
     * @param page The page to navigate to.
     * @param props Optional props to pass to the new page.
     */
    onNavigate: (page: string, props?: any) => void;
    /** The page the user navigated from. */
    from?: string;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/**
 * A page that displays the detailed profile of a cleaner.
 * @param {CleanerProfilePageProps} props The props for the component.
 * @returns {JSX.Element} The rendered component.
 */
const CleanerProfilePage: React.FC<CleanerProfilePageProps> = ({ cleanerId, onNavigate, from }) => {
    const [activeTab, setActiveTab] = useState('about');
    const [isFavorited, setIsFavorited] = useState(false);
    
    const cleaner = CLEANERS_DATA.find(c => c.id === cleanerId);

    if (!cleaner) {
        // Could show a "Cleaner not found" message
        return <div className="text-center p-12">Cleaner not found.</div>;
    }
    
    const badge = getCleanerBadge(cleaner);
    
    const toggleFavorite = () => {
        setIsFavorited(prev => !prev);
        // In a real app, this would also make an API call to save the user's preference.
    };

    const handleBookNow = () => {
        onNavigate('booking', { cleanerId: cleaner.id });
    };
    
    const handleMessage = () => {
      onNavigate('messages', { conversationId: `client-${cleaner.id}` });
    };

    return (
        <div className="bg-base-200">
            <div className="container mx-auto px-4 py-8 md:py-12 animate-fade-in-up">
                 {from === 'map' && (
                    <button
                        onClick={() => onNavigate('home')}
                        className="mb-4 flex items-center text-sm font-semibold text-slate-600 hover:text-primary dark:hover:text-primary-focus transition-colors"
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                        Back to Map
                    </button>
                )}
                <div className="bg-base-100 rounded-2xl shadow-xl overflow-hidden">
                    {/* Header Section */}
                    <div className="p-8 md:flex md:items-center md:space-x-8 bg-gradient-to-r from-slate-50 to-slate-100">
                        <img 
                            src={cleaner.imageUrl}
                            alt={`Profile of ${cleaner.name}`}
                            className="w-32 h-32 rounded-full object-cover mx-auto md:mx-0 ring-4 ring-white shadow-lg"
                        />
                        <div className="text-center md:text-left mt-4 md:mt-0 flex-grow">
                            <div className="flex items-center justify-center md:justify-start gap-3">
                                <h1 className="text-3xl md:text-4xl font-bold text-neutral-focus">{cleaner.name}</h1>
                                <button
                                    onClick={toggleFavorite}
                                    className="p-2 rounded-full text-slate-400 hover:bg-red-100 dark:hover:bg-neutral-focus group transition-colors duration-200"
                                    aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className={`h-7 w-7 transition-all duration-200 transform group-hover:text-red-500 ${isFavorited ? 'text-red-500 scale-110' : ''}`}
                                        fill={isFavorited ? 'currentColor' : 'none'}
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                </button>
                            </div>
                             {badge && (
                                <div className="mt-2 flex justify-center md:justify-start">
                                    <BadgeDisplay badge={badge} />
                                </div>
                            )}
                            <p className="text-lg text-slate-600 mt-2">{cleaner.tagline}</p>
                            <div className="flex items-center justify-center md:justify-start space-x-4 mt-3">
                                <div className="flex items-center space-x-1">
                                    <StarRating rating={cleaner.rating} />
                                    <span className="text-slate-600 font-semibold">{cleaner.rating.toFixed(1)}</span>
                                </div>
                                <span className="text-slate-500">({cleaner.reviewsCount} reviews)</span>
                            </div>
                        </div>
                        <div className="mt-6 md:mt-0 flex-shrink-0 flex flex-col items-stretch md:items-end space-y-3">
                             <button 
                                onClick={handleBookNow}
                                className="w-full bg-primary text-primary-content font-bold py-3 px-8 rounded-lg hover:bg-primary-focus transition-all duration-300 transform hover:scale-105 shadow-lg"
                            >
                                Book Now
                            </button>
                             <button 
                                onClick={handleMessage}
                                className="w-full bg-base-100 text-neutral-focus font-semibold py-2 px-6 rounded-lg hover:bg-base-200 border border-slate-300 transition-all duration-300 text-sm"
                            >
                                Message {cleaner.name.split(' ')[0]}
                            </button>
                            <p className="text-center md:text-right text-slate-600 mt-2 text-xl font-bold">${cleaner.hourlyRate}<span className="font-normal text-sm">/hr</span></p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-slate-200">
                        <nav className="flex space-x-6 px-8">
                            <button 
                                onClick={() => setActiveTab('about')} 
                                className={`py-4 px-1 font-semibold border-b-2 transition-colors ${activeTab === 'about' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                            >
                                About
                            </button>
                            <button 
                                onClick={() => setActiveTab('reviews')} 
                                className={`py-4 px-1 font-semibold border-b-2 transition-colors ${activeTab === 'reviews' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                            >
                                Reviews ({cleaner.reviewsCount})
                            </button>
                             <button 
                                onClick={() => setActiveTab('gallery')} 
                                className={`py-4 px-1 font-semibold border-b-2 transition-colors ${activeTab === 'gallery' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                            >
                                Gallery
                            </button>
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="p-8">
                        {activeTab === 'about' && (
                             <div className="space-y-12">
                                <div>
                                    <h2 className="text-2xl font-bold text-neutral-focus mb-4">About Me</h2>
                                    <p className="text-slate-600 whitespace-pre-line leading-relaxed">{cleaner.bio}</p>
                                </div>
                                
                                <div className="border-t pt-8">
                                    <h2 className="text-2xl font-bold text-neutral-focus mb-4">Services Offered</h2>
                                    <div className="flex flex-wrap gap-3">
                                        {cleaner.services.map(service => (
                                            <span key={service} className="bg-primary/10 text-primary-focus font-semibold px-4 py-2 rounded-full text-sm">
                                                {service}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                
                                {cleaner.specializedTasks && cleaner.specializedTasks.length > 0 && (
                                     <div className="border-t pt-8">
                                        <h2 className="text-2xl font-bold text-neutral-focus mb-4">Specialized Services</h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {cleaner.specializedTasks.map(task => (
                                                <div key={task.name} className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex justify-between items-center">
                                                    <div>
                                                        <p className="font-semibold text-neutral-focus">{task.name}</p>
                                                        <p className="text-sm text-slate-500">Additional service</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-primary">${task.rate}</p>
                                                        <p className="text-xs text-slate-500">{task.unit}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}


                                <div className="border-t pt-8">
                                    <h2 className="text-2xl font-bold text-neutral-focus mb-4">Weekly Availability</h2>
                                    <div className="bg-slate-50 p-6 rounded-lg border grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                                        {DAYS_OF_WEEK.map(day => {
                                            const slots = cleaner.availability[day] || [];
                                            return (
                                                <div key={day}>
                                                    <p className="font-semibold text-slate-800">{day}</p>
                                                    {slots.length > 0 ? (
                                                        <div className="flex flex-wrap gap-2 mt-1">
                                                            {slots.map(slot => (
                                                                <span key={slot} className="text-xs font-medium bg-green-100 text-green-800 px-2 py-1 rounded-full">{slot}</span>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-slate-400 italic mt-1">Unavailable</p>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'reviews' && (
                             <div>
                                <h2 className="text-2xl font-bold text-neutral-focus mb-6">Reviews</h2>
                                <div className="space-y-6">
                                    {cleaner.reviews.length > 0 ? cleaner.reviews.map(review => (
                                        <div key={review.id} className="flex space-x-4">
                                            <img src={review.authorImageUrl} alt={review.authorName} className="w-12 h-12 rounded-full object-cover"/>
                                            <div>
                                                <div className="flex items-center space-x-2">
                                                    <p className="font-bold text-neutral-focus">{review.authorName}</p>
                                                    <span className="text-slate-400">&bull;</span>
                                                    <p className="text-sm text-slate-500">{review.date}</p>
                                                </div>
                                                <div className="mt-1">
                                                    <StarRating rating={review.rating} />
                                                </div>
                                                <p className="mt-2 text-slate-600">{review.comment}</p>
                                            </div>
                                        </div>
                                    )) : (
                                        <p className="text-slate-500">This cleaner doesn't have any reviews yet.</p>
                                    )}
                                </div>
                            </div>
                        )}
                        {activeTab === 'gallery' && (
                            <div>
                                <h2 className="text-2xl font-bold text-neutral-focus mb-4">Photo Gallery</h2>
                                {cleaner.imageGallery.length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {cleaner.imageGallery.map((imgUrl, index) => (
                                            <img 
                                                key={index}
                                                src={imgUrl}
                                                alt={`Gallery image ${index + 1}`}
                                                className="rounded-lg object-cover w-full h-48 hover:opacity-90 transition-opacity cursor-pointer"
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-slate-500">This cleaner hasn't uploaded any photos yet.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CleanerProfilePage;