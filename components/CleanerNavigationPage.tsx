import React, { useEffect, useState } from 'react';
import type { Booking, Point } from '../types';
import CleanerNavigationMap from './CleanerNavigationMap';
import { getRoute } from '../utils';

/**
 * Props for the CleanerNavigationPage component.
 * @interface CleanerNavigationPageProps
 */
interface CleanerNavigationPageProps {
  /** The booking object containing all job details. */
  booking: Booking;
  /** Callback function to navigate back to the previous view. */
  onBack: () => void;
  /**
   * Callback to update the status of the booking.
   * @param {string} bookingId - The ID of the booking to update.
   * @param {'upcoming' | 'active' | 'completed'} status - The new status.
   */
  onUpdateStatus: (bookingId: string, status: 'upcoming' | 'active' | 'completed') => void;
}

/**
 * A full-screen page component for cleaners to navigate to a job and manage its status.
 * It displays a map with the route, provides controls to start the job, and a modal
 * to confirm completion.
 *
 * @param {CleanerNavigationPageProps} props The props for the component.
 * @returns {React.ReactElement} The rendered CleanerNavigationPage component.
 */
const CleanerNavigationPage: React.FC<CleanerNavigationPageProps> = ({ booking, onBack, onUpdateStatus }) => {
    const { cleaner, clientLocation, clientAddress, clientName } = booking;
    
    const [jobState, setJobState] = useState<'navigating' | 'in_progress'>(booking.status === 'active' ? 'in_progress' : 'navigating');
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [route, setRoute] = useState<Point[]>([]);

    const startPos = cleaner.startLocation;
    const endPos = clientLocation;

    useEffect(() => {
        const fetchRoute = async () => {
            const newRoute = await getRoute(startPos, endPos);
            setRoute(newRoute);
        };

        fetchRoute();
    }, [startPos, endPos]);

    const handleMarkComplete = () => {
        onUpdateStatus(booking.id, 'completed');
        setShowConfirmation(false);
        onBack();
    };

    // A simulated ETA for display purposes
    const simulatedETA = Math.round(cleaner.distance ? cleaner.distance * 2.5 : 15); // Simple estimation

    return (
        <div className="relative w-full h-screen overflow-hidden animate-fade-in bg-slate-100">
            <CleanerNavigationMap
                route={route}
                startPosition={startPos}
                endPosition={endPos}
            />
            {/* Back Button */}
            <div className="absolute top-0 left-0 w-full p-4 z-[1000]">
                 <div className="container mx-auto">
                    <button 
                        onClick={onBack} 
                        className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg hover:bg-white transition text-slate-800 font-semibold"
                        aria-label="Go back to dashboard"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                        <span>Back</span>
                    </button>
                </div>
            </div>
            
            {/* Navigation Info Panel */}
            <div className="absolute bottom-0 left-0 right-0 w-full p-4 z-[1000]">
                <div className="container mx-auto max-w-lg">
                    <div className="bg-base-100 rounded-2xl shadow-2xl p-6 w-full mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s', opacity: 0 }}>
                        {jobState === 'navigating' && (
                            <>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm text-slate-500">Destination</p>
                                        <h3 className="font-bold text-lg text-neutral-focus">{clientAddress}</h3>
                                    </div>
                                    <div className="text-right flex-shrink-0 ml-4">
                                        <p className="text-primary font-bold text-xl">{simulatedETA} min</p>
                                        <p className="text-sm text-slate-500">ETA</p>
                                    </div>
                                </div>
                                <div className="mt-6">
                                    <button
                                        onClick={() => { 
                                            onUpdateStatus(booking.id, 'active');
                                            setJobState('in_progress');
                                        }}
                                        className="w-full bg-primary text-primary-content font-bold py-3 px-4 rounded-lg hover:bg-primary-focus transition-all duration-300 transform hover:scale-105 shadow-lg"
                                    >
                                        Start Job
                                    </button>
                                </div>
                            </>
                        )}

                        {jobState === 'in_progress' && (
                            <>
                                <div className="text-center">
                                    <h3 className="text-2xl font-bold text-neutral-focus">Job in Progress</h3>
                                    <p className="text-slate-500 mt-1">Cleaning for <span className="font-semibold">{clientName}</span> at <span className="font-semibold">{clientAddress}</span>.</p>
                                </div>
                                 <div className="mt-6">
                                    <button
                                        onClick={() => setShowConfirmation(true)}
                                        className="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
                                    >
                                        Mark as Complete
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

             {/* Confirmation Modal */}
            {showConfirmation && (
                 <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 animate-fade-in">
                    <div className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center animate-scale-in">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-500/10 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                               <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-neutral-focus mb-2">Mark as Complete?</h2>
                        <p className="text-slate-600 mb-6">This will notify the client that the cleaning is finished.</p>
                        <div className="flex justify-center gap-4">
                            <button 
                                onClick={() => setShowConfirmation(false)} 
                                className="w-full bg-transparent text-slate-700 font-semibold py-2 px-6 rounded-lg hover:bg-slate-100 border border-slate-300 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleMarkComplete}
                                className="w-full bg-green-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-600 transition-colors"
                            >
                                Mark Complete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CleanerNavigationPage;