import React, { useState, useEffect, useMemo } from 'react';
import type { User, ClientProfile, Booking } from '../types';
import JobTrackingMap from './JobTrackingMap';
import JobStatusTracker from './JobStatusTracker';
import { io } from 'socket.io-client';
import { BASE_URL } from '../constants';

/**
 * Props for the JobTrackingPage component.
 * @interface JobTrackingPageProps
 */
interface JobTrackingPageProps {
  /** The booking object containing all details for the job being tracked. */
  booking: Booking;
  /** The current user object, used to access the client's profile information. */
  user: User;
  /** Callback function to navigate back to the previous view. */
  onBack: () => void;
  /** Callback to update the booking status to 'completed'. */
  onUpdateStatus: (bookingId: string, status: 'completed') => void;
}

/**
 * Represents a geographical point with latitude and longitude.
 * @interface Point
 */
interface Point {
    /** The latitude of the point. */
    lat: number;
    /** The longitude of the point. */
    lng: number;
}

/**
 * A full-screen page component for clients to track a cleaner's journey to their location.
 * It uses a simulated animation to show the cleaner's movement on a map and updates
 * the job status in real-time.
 *
 * @param {JobTrackingPageProps} props The props for the component.
 * @returns {React.ReactElement} The rendered JobTrackingPage component.
 */
const JobTrackingPage: React.FC<JobTrackingPageProps> = ({ booking, user, onBack, onUpdateStatus }) => {
    const { cleaner } = booking;
    const clientProfile = user.profile as ClientProfile;

    const startPos = cleaner.startLocation;
    const endPos = clientProfile.location;

    const [cleanerPosition, setCleanerPosition] = useState(startPos);
    const [statusIndex, setStatusIndex] = useState(0);
    const [eta, setEta] = useState(0);
    const [showConfirmation, setShowConfirmation] = useState(false);

    const statuses = useMemo(() => [
        { text: 'Job Confirmed', progress: 0 },
        { text: `${cleaner.name.split(' ')[0]} is en route`, progress: 0.1 },
        { text: 'Arriving soon', progress: 0.8 },
        { text: 'Arrived at your location', progress: 0.99 },
        { text: 'Cleaning in Progress', progress: 1 },
    ], [cleaner.name]);
    
    const isCleaningInProgress = statusIndex === statuses.length - 1;

    const handleMarkComplete = () => {
        onUpdateStatus(booking.id, 'completed');
        setShowConfirmation(false);
        onBack(); // Go back to dashboard after completion
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        const socket = io(BASE_URL, { auth: { token } });

        socket.on('connect', () => {
            console.log('Connected to WebSocket service');
        });

        socket.on('cleanerLocationUpdate', (data) => {
            if (data.cleanerId === cleaner.id) {
                setCleanerPosition({ lat: data.lat, lng: data.lng });
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [cleaner.id]);

    if (!clientProfile || !clientProfile.location) {
        return (
            <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-100 p-4">
                <p className="text-lg text-slate-700 mb-4">Your location is not set. Please update your profile.</p>
                <button onClick={onBack} className="bg-primary text-primary-content font-semibold py-2 px-4 rounded-lg hover:bg-primary-focus">
                    Back to Dashboard
                </button>
            </div>
        );
    }
    
    return (
        <div className="relative w-full h-screen overflow-hidden animate-fade-in bg-slate-100">
            <JobTrackingMap
                route={[]}
                cleanerPosition={cleanerPosition}
                startPosition={startPos}
                endPosition={endPos}
            />
            <div className="absolute top-0 left-0 w-full p-4 z-10">
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
            <div className="absolute bottom-0 left-0 right-0 w-full p-4 z-10">
                <div className="container mx-auto max-w-md">
                    <JobStatusTracker 
                        cleaner={cleaner}
                        statuses={statuses.map(s => s.text)}
                        currentStatusIndex={statusIndex}
                        eta={eta}
                    />
                    {isCleaningInProgress && booking.status !== 'completed' && (
                        <div className="mt-4 animate-fade-in">
                            <button
                                onClick={() => setShowConfirmation(true)}
                                className="w-full bg-primary text-primary-content font-bold py-3 px-4 rounded-lg hover:bg-primary-focus transition-all duration-300 transform hover:scale-105 shadow-lg"
                            >
                                Mark Job as Complete
                            </button>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Confirmation Modal */}
            {showConfirmation && (
                 <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 animate-fade-in">
                    <div className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center animate-scale-in">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-neutral-focus mb-2">Confirm Completion</h2>
                        <p className="text-slate-600 mb-6">Are you sure the job is complete? This will finalize the process.</p>
                        <div className="flex justify-center gap-4">
                            <button 
                                onClick={() => setShowConfirmation(false)} 
                                className="w-full bg-transparent text-slate-700 font-semibold py-2 px-6 rounded-lg hover:bg-slate-100 border border-slate-300 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleMarkComplete}
                                className="w-full bg-primary text-primary-content font-bold py-2 px-6 rounded-lg hover:bg-primary-focus transition-colors"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default JobTrackingPage;
