import React, { useState, useEffect, useMemo } from 'react';
import type { User, ClientProfile, Booking } from '../types';
import JobTrackingMap from './JobTrackingMap';
import JobStatusTracker from './JobStatusTracker';

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

const SIMULATION_DURATION = 90000; // 90 seconds for the whole trip

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
 * Simulates a plausible city route between two points by generating a multi-segment path.
 * This creates a more realistic-looking route with turns for the map display.
 *
 * @param {Point} start The starting geographical point.
 * @param {Point} end The ending geographical point.
 * @param {number} [numPoints=50] The number of points to generate for the route polyline.
 * @returns {Point[]} An array of points representing the simulated route.
 */
const generateFastestRoute = (start: Point, end: Point, numPoints: number = 50): Point[] => {
    const routePoints: Point[] = [];
    // Create an intermediate waypoint to simulate a right-angle turn, typical for city grids.
    const waypoint = { lat: start.lat, lng: end.lng };

    // Calculate approximate "distance" to proportionally distribute points along each segment
    const dist1 = Math.abs(start.lng - waypoint.lng);
    const dist2 = Math.abs(waypoint.lat - end.lat);
    const totalDist = dist1 + dist2;

    // Handle edge case where there's no distance to travel
    if (totalDist === 0) {
        return [start, end];
    }

    const pointsForSeg1 = Math.round((dist1 / totalDist) * numPoints);
    const pointsForSeg2 = numPoints - pointsForSeg1;

    // Interpolate points for the first segment (start -> waypoint)
    for (let i = 0; i < pointsForSeg1; i++) {
        const t = i / pointsForSeg1;
        routePoints.push({
            lat: start.lat,
            lng: start.lng + (waypoint.lng - start.lng) * t
        });
    }

    // Interpolate points for the second segment (waypoint -> end)
    for (let i = 0; i < pointsForSeg2; i++) {
        const t = i / pointsForSeg2;
        routePoints.push({
            lat: waypoint.lat + (end.lat - waypoint.lat) * t,
            lng: waypoint.lng
        });
    }

    // Ensure the last point is exactly the end point
    routePoints.push(end);

    return routePoints;
};

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

    // The simulated route is generated once and memoized.
    const route = useMemo(() => generateFastestRoute(startPos, endPos), [startPos, endPos]);

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
        // If the job is already completed, don't run the simulation.
        if (booking.status === 'completed') {
            setStatusIndex(statuses.length - 1);
            setCleanerPosition(endPos);
            return;
        }

        let animationFrameId: number;
        const startTime = Date.now();

        const animate = () => {
            const elapsedTime = Date.now() - startTime;
            const progress = Math.min(elapsedTime / SIMULATION_DURATION, 1);

            // Update cleaner's position by finding the corresponding point on the route.
            const routeIndex = Math.min(Math.floor(progress * route.length), route.length - 1);
            setCleanerPosition(route[routeIndex]);


            const remainingTime = SIMULATION_DURATION * (1 - progress);
            setEta(Math.ceil(remainingTime / 1000 / 60)); // ETA in minutes

            const currentStatusIndex = statuses.findIndex((s, i) => {
                const nextStatus = statuses[i + 1];
                return progress >= s.progress && (!nextStatus || progress < nextStatus.progress);
            });
            
            // Use functional update to prevent useEffect feedback loop
            setStatusIndex(prevIndex => (currentStatusIndex !== prevIndex ? currentStatusIndex : prevIndex));
            
            if (progress < 1) {
                animationFrameId = requestAnimationFrame(animate);
            } else {
                 setStatusIndex(statuses.length - 1); // Ensure final status is set
            }
        };

        animationFrameId = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [route, statuses, booking.status, endPos]);

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
                route={route}
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