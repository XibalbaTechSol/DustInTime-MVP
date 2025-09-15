import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import type { User, Booking, ClientProfile, CleanerProfile } from './types';
import { CLEANERS_DATA, BOOKINGS_DATA } from './constants';
import HomePage from './components/HomePage';

// Statically import all page components to resolve module loading errors.
import CleanerProfilePage from './components/CleanerProfilePage';
import BookingPage from './components/BookingPage';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import JobTrackingPage from './components/JobTrackingPage';
import MessagesPage from './components/MessagesPage';
import CleanerNavigationPage from './components/CleanerNavigationPage';

// Create a mock user since authentication has been removed.
const mockClientProfile: ClientProfile = {
  address: '123 Main St, Milwaukee, WI',
  propertyType: 'Apartment',
  bedrooms: 2,
  bathrooms: 1,
  location: { lat: 43.05, lng: -87.95 },
};

const mockClientUser: User = {
  id: 'client-alex-doe',
  name: 'Alex Doe',
  email: 'alex.doe@example.com',
  picture: 'https://picsum.photos/id/237/100/100',
  role: 'client',
  profile: mockClientProfile,
};

// New mockCleanerUser
const mockCleaner = CLEANERS_DATA.find(c => c.id === 1)!; // Maria Rodriguez, ID 1
const mockCleanerProfile: CleanerProfile = {
    hourlyRate: mockCleaner.hourlyRate,
    bio: mockCleaner.bio,
    services: mockCleaner.services,
    serviceArea: 'Milwaukee, WI',
};
const mockCleanerUser: User = {
    id: mockCleaner.id,
    name: mockCleaner.name,
    email: 'maria.rodriguez@example.com',
    picture: mockCleaner.imageUrl,
    role: 'cleaner',
    profile: mockCleanerProfile,
};


const App: React.FC = () => {
  const user = mockClientUser; // Use client user for booking context
  
  const [pageState, setPageState] = useState<{ page: string; props?: any }>({ page: 'home' });
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [bookings, setBookings] = useState<Booking[]>(BOOKINGS_DATA);
  const [searchTerm, setSearchTerm] = useState('');


  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'light' ? 'dark' : 'light');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const toggleDashboard = () => setIsDashboardOpen(prev => !prev);

  // Custom event listener for navigation from other components if ever needed
  useEffect(() => {
    const handleNav = (e: Event) => {
      const { page, props } = (e as CustomEvent).detail;
      setPageState({ page, props });
    };
    window.addEventListener('navigate', handleNav);
    return () => window.removeEventListener('navigate', handleNav);
  }, []);

  const handleNavigate = (page: string, props: any = {}) => {
    if (page === 'dashboard') {
      setIsDashboardOpen(true);
      // Ensure the underlying page is the map/home
      if (pageState.page !== 'home') {
        setPageState({ page: 'home' });
      }
      return;
    }

    setIsDashboardOpen(false); // Close dashboard when navigating elsewhere
    setPageState({ page, props });
    window.scrollTo(0, 0); // Scroll to top on page change
  };
  
  const handleBookingCreate = (bookingDetails: Booking) => {
    setBookings(prev => [...prev, bookingDetails]);
    console.log("Booking Created:", bookingDetails);
    // Navigate to dashboard after a slight delay to show confirmation
    setTimeout(() => {
        handleNavigate('dashboard');
    }, 1500);
  }

  const handleUpdateBookingStatus = (bookingId: string, status: 'upcoming' | 'active' | 'completed') => {
    setBookings(prevBookings => 
      prevBookings.map(b => 
        b.id === bookingId ? { ...b, status: status } : b
      )
    );
  };
  
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };
  
  const renderContent = () => {
    const { page, props } = pageState;
    const currentBooking = props?.booking ? bookings.find(b => b.id === props.booking.id) || props.booking : undefined;

    switch(page) {
        case 'home':
            return <HomePage 
                onNavigate={handleNavigate}
                searchTerm={searchTerm}
                onBookingCreate={handleBookingCreate}
                bookings={bookings}
                user={mockClientUser}
            />;
        case 'cleanerProfile':
            if (!props.cleanerId) {
                handleNavigate('home'); // Cleaner not found, go home
                return null;
            }
            return <CleanerProfilePage cleanerId={props.cleanerId} onNavigate={handleNavigate} from={props.from} />;
        case 'booking':
            if (!props.cleanerId || !user) {
                handleNavigate('home');
                return null;
            }
            return <BookingPage cleanerId={props.cleanerId} user={mockClientUser} onBookingComplete={handleBookingCreate} onBack={() => handleNavigate('cleanerProfile', { cleanerId: props.cleanerId })} />;
        case 'settings':
            return <div className="container mx-auto px-4 py-8 md:py-12"><Settings user={user} /></div>;
        case 'jobTracking':
            if (!currentBooking || !user) {
                handleNavigate('dashboard');
                return null;
            }
            return <JobTrackingPage booking={currentBooking} user={mockClientUser} onBack={() => handleNavigate('dashboard')} onUpdateStatus={handleUpdateBookingStatus} />;
        case 'messages':
             if (!user) {
                handleNavigate('home');
                return null;
            }
            return <MessagesPage user={user} onNavigate={handleNavigate} initialConversationId={props.conversationId} />;
        case 'cleanerNavigation':
            if (!currentBooking || !user || user.role !== 'cleaner') {
                handleNavigate('dashboard');
                return null;
            }
            return <CleanerNavigationPage booking={currentBooking} onBack={() => handleNavigate('dashboard')} onUpdateStatus={handleUpdateBookingStatus} />;
        default:
            return <HomePage 
                onNavigate={handleNavigate}
                searchTerm={searchTerm}
                onBookingCreate={handleBookingCreate}
                bookings={bookings}
                user={mockClientUser}
             />;
    }
  }

  const isFullScreenPage = ['jobTracking', 'messages', 'cleanerNavigation'].includes(pageState.page);
  const showFooter = !isFullScreenPage && pageState.page !== 'home';

  return (
    <div className="flex flex-col min-h-screen bg-base-200 dark:bg-neutral-focus font-sans">
      
      {/* Main App Content Wrapper - Hidden when dashboard is open */}
      <div className={`flex flex-col flex-grow ${isDashboardOpen ? 'hidden' : ''}`}>
        {!isFullScreenPage && <Header user={user} onNavigate={(page) => handleNavigate(page)} onToggleDashboard={toggleDashboard} theme={theme} onToggleTheme={toggleTheme} onSearch={handleSearch} />}
        
        <main className="flex-grow">
          {renderContent()}
        </main>
        
        {!isFullScreenPage && showFooter && <Footer />}
      </div>
      
      {/* Dashboard Overlay */}
      <div 
        className={`fixed inset-0 bg-base-100 dark:bg-neutral z-50 transform transition-transform duration-300 ease-in-out ${isDashboardOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <Dashboard user={user} onNavigate={handleNavigate} onClose={() => setIsDashboardOpen(false)} bookings={bookings} />
      </div>
    </div>
  );
};

export default App;