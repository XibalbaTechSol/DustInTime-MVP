import React, { useState, useEffect } from 'react';
import TaskLists from './TaskLists';
import type { Booking, User } from '../types';

/**
 * Props for the Dashboard component.
 * @interface DashboardProps
 */
interface DashboardProps {
    /** The currently logged-in user, or null if no user is logged in. */
    user: User | null;
    /**
     * Callback function to handle navigation to other pages.
     * @param {string} page - The target page name.
     * @param {any} [props] - Optional props to pass to the target page.
     */
    onNavigate: (page: string, props?: any) => void;
    /** Callback function to close the dashboard view. */
    onClose: () => void;
    /** An array of all relevant bookings to be displayed. */
    bookings: Booking[];
}

/**
 * A dashboard component that displays relevant information based on the user's role.
 * It serves as a central hub for both clients to manage their bookings and cleaners
 * to view their job schedule.
 *
 * @param {DashboardProps} props The props for the component.
 * @returns {React.ReactElement} The rendered Dashboard component.
 */
const Dashboard: React.FC<DashboardProps> = ({ user, onNavigate, onClose, bookings }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Update the current time every 10 seconds to check for active jobs
    const timer = setInterval(() => setCurrentTime(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  const welcomeMessage = user?.role === 'cleaner' 
    ? "Here's a summary of your jobs and schedule."
    : "Manage your bookings and view your cleaning history.";

  const ClientDashboard = () => {
    const now = currentTime.getTime();
    
    // An active job is one that started recently and is ongoing
    const activeBooking = bookings.find(b => {
      const jobStartTime = new Date(b.date).getTime();
      const jobEndTime = jobStartTime + b.hours * 60 * 60 * 1000; // job end time
      // Active if current time is between 10 mins before start and the end time
      return b.status === 'active' && now >= (jobStartTime - 10 * 60 * 1000) && now < jobEndTime;
    });

    const upcomingBookings = bookings.filter(b => b.status === 'upcoming' && new Date(b.date).getTime() > now && b.id !== activeBooking?.id);
    const pastBookings = bookings.filter(b => b.status === 'completed');

    return (
      <div className="space-y-8">
        {/* Active Job Section */}
        {activeBooking && (
            <div className="bg-gradient-to-br from-primary to-indigo-700 p-6 rounded-xl shadow-2xl text-white animate-fade-in-up mb-8 z-10">
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <span className="relative flex h-3 w-3 mr-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
                </span>
                Active Job
              </h2>
              <div className="space-y-4 bg-black/20 p-4 rounded-lg">
                <div className="flex items-center space-x-4">
                    <img src={activeBooking.cleaner.imageUrl} alt={activeBooking.cleaner.name} className="w-16 h-16 rounded-full object-cover border-2 border-accent"/>
                    <div className="flex-grow">
                        <p className="font-bold text-lg">{activeBooking.cleaner.name}</p>
                        <p className="text-sm opacity-90">{activeBooking.service}</p>
                    </div>
                </div>
                <button 
                    onClick={() => onNavigate('jobTracking', { booking: activeBooking })}
                    className="w-full bg-accent text-white font-bold py-3 px-4 rounded-lg hover:bg-accent-focus transition-all duration-300 transform hover:scale-105 shadow-lg">
                    Track Cleaner
                </button>
              </div>
            </div>
        )}
        
        {/* Upcoming Bookings */}
        <div>
            <h2 className="text-2xl font-bold text-neutral dark:text-base-100">Upcoming Bookings</h2>
            <div className="mt-4 space-y-4">
                {upcomingBookings.length > 0 ? (
                    upcomingBookings.map(booking => (
                        <BookingCard key={booking.id} booking={booking} onNavigate={onNavigate} />
                    ))
                ) : (
                    <p className="text-slate-500 dark:text-slate-400">No upcoming bookings. Time to schedule your next cleaning!</p>
                )}
            </div>
        </div>

        {/* Past Bookings */}
        <div>
            <h2 className="text-2xl font-bold text-neutral dark:text-base-100">Booking History</h2>
             <div className="mt-4 space-y-3">
                {pastBookings.map(booking => (
                     <BookingCard key={booking.id} booking={booking} onNavigate={onNavigate} isPast={true} />
                ))}
            </div>
        </div>
      </div>
    );
  }

  const CleanerDashboard = () => {
      if (!user) return null;
      
      const myBookings = bookings.filter(b => b.cleaner.id === user.id && b.status !== 'completed').sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-neutral dark:text-base-100">My Upcoming Jobs</h2>
                <div className="mt-4 space-y-4">
                    {myBookings.length > 0 ? (
                        myBookings.map(booking => (
                            <CleanerBookingCard key={booking.id} booking={booking} onNavigate={onNavigate} />
                        ))
                    ) : (
                        <p className="text-slate-500 dark:text-slate-400">You have no upcoming jobs. Your schedule is clear!</p>
                    )}
                </div>
            </div>
        </div>
      );
  };

  return (
    <div className="flex flex-col h-screen">
        {/* Dashboard Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 bg-base-200 dark:bg-neutral-focus border-b border-base-300 dark:border-slate-700">
            <h1 className="text-2xl font-bold text-neutral dark:text-base-200">My Dashboard</h1>
             <div className="flex items-center space-x-4">
                <button
                    onClick={() => onNavigate('messages')}
                    className="flex items-center space-x-2 text-sm font-semibold text-primary hover:text-primary-focus transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>Messages</span>
                </button>
                <button
                    onClick={onClose}
                    className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-base-300 dark:hover:bg-neutral focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    aria-label="Close dashboard"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex-grow overflow-y-auto p-4 sm:p-6 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6 animate-fade-in">
                    <h2 className="text-3xl font-bold text-neutral dark:text-base-100">Welcome back, {user?.name.split(' ')[0]}!</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">{welcomeMessage}</p>
                </div>

                <div className="mb-8">
                    {user?.role === 'client' && <ClientDashboard />}
                    {user?.role === 'cleaner' && <CleanerDashboard />}
                </div>

                {user?.role === 'client' && <TaskLists />}
            </div>
        </div>
    </div>
  );
};

/**
 * A card component for displaying a client's booking details.
 * It shows different actions based on whether the booking is in the past or upcoming.
 *
 * @param {object} props The props for the component.
 * @param {Booking} props.booking The booking data to display.
 * @param {(page: string, props: any) => void} props.onNavigate The navigation function.
 * @param {boolean} [props.isPast=false] Flag to indicate if the booking is in the past.
 * @returns {React.ReactElement} The rendered BookingCard component.
 */
const BookingCard: React.FC<{ booking: Booking, onNavigate: (page: string, props: any) => void, isPast?: boolean }> = ({ booking, onNavigate, isPast = false }) => {
    const { cleaner, date, service, costDetails, specializedTasks } = booking;
    const bookingDate = new Date(date);

    return (
        <div className={`bg-base-100 p-4 rounded-lg shadow-md flex items-center gap-4 ${isPast ? 'opacity-70' : ''}`}>
            <img src={cleaner.imageUrl} alt={cleaner.name} className="w-16 h-16 rounded-full object-cover hidden sm:block"/>
            <div className="flex-grow">
                <p className="font-bold text-neutral-focus dark:text-base-100">{service}</p>
                {specializedTasks && specializedTasks.length > 0 && (
                    <p className="text-xs text-primary dark:text-primary-focus/80 mt-1">
                        + {specializedTasks.map(t => t.name).join(', ')}
                    </p>
                )}
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">with {cleaner.name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{bookingDate.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
            </div>
            <div className="text-right flex-shrink-0">
                {isPast ? (
                    <>
                        <p className="font-bold text-lg text-neutral-focus dark:text-base-100">${costDetails.total.toFixed(2)}</p>
                        <button onClick={() => onNavigate('cleanerProfile', { cleanerId: cleaner.id })} className="text-xs font-semibold text-primary hover:underline">Rate & Rebook</button>
                    </>
                ) : (
                    <>
                        <p className="font-semibold text-neutral-focus dark:text-base-100">In {Math.ceil((bookingDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days</p>
                        <button onClick={() => onNavigate('messages', { conversationId: `client-${cleaner.id}` })} className="text-xs font-semibold text-primary hover:underline">Message</button>
                    </>
                )}
            </div>
        </div>
    );
};


/**
 * A card component for displaying a cleaner's job details.
 * It provides key information about the client, location, and time of the job,
 * with a primary action to navigate to the job.
 *
 * @param {object} props The props for the component.
 * @param {Booking} props.booking The booking data to display.
 * @param {(page: string, props: any) => void} props.onNavigate The navigation function.
 * @returns {React.ReactElement} The rendered CleanerBookingCard component.
 */
const CleanerBookingCard: React.FC<{ booking: Booking, onNavigate: (page: string, props: any) => void }> = ({ booking, onNavigate }) => {
    const jobDate = new Date(booking.date);
    const isToday = jobDate.toDateString() === new Date().toDateString();

    return (
        <div className="bg-base-100 p-4 rounded-lg shadow-md flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-grow space-y-2">
                <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${booking.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                        {booking.status === 'active' ? 'Active Now' : 'Upcoming'}
                    </span>
                    <div>
                        <p className="font-bold text-lg text-neutral-focus dark:text-base-100">{booking.service}</p>
                        {booking.specializedTasks && booking.specializedTasks.length > 0 && (
                            <p className="text-xs text-primary dark:text-primary-focus/80">
                                + {booking.specializedTasks.map(t => t.name).join(', ')}
                            </p>
                        )}
                    </div>
                </div>
                <div className="text-sm text-slate-500 space-y-1 sm:flex sm:space-y-0 sm:space-x-4">
                    <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-slate-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                        <span>{booking.clientName}</span>
                    </div>
                    <div className="flex items-center">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-slate-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                        <span>{booking.clientAddress}</span>
                    </div>
                </div>
                 <div className="text-sm text-slate-500 flex items-center pt-1">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-slate-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>
                    <span>{isToday ? `Today at ${jobDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : jobDate.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                </div>
            </div>
            <div className="w-full sm:w-auto flex-shrink-0">
                <button
                    onClick={() => onNavigate('cleanerNavigation', { booking })}
                    className="w-full bg-primary text-primary-content font-semibold py-2 px-4 rounded-lg hover:bg-primary-focus transition duration-300 text-sm flex items-center justify-center space-x-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    <span>Navigate to Job</span>
                </button>
            </div>
        </div>
    );
};

export default Dashboard;