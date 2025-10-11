import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import type { User, Booking, ClientProfile, CleanerProfile, Cleaner } from './types';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import SplashScreen from './components/SplashScreen';
import { supabase } from './utils';
import { Session } from '@supabase/supabase-js';

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

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [page, setPage] = useState('login');

  const [pageState, setPageState] = useState<{ page: string; props?: any }>({ page: 'home' });
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [cleaners, setCleaners] = useState<Cleaner[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        // In a real app, you would fetch the user profile here
        const mockClientUser: User = {
          id: session.user.id,
          name: session.user.user_metadata.full_name || 'Alex Doe',
          email: session.user.email || 'alex.doe@example.com',
          picture: 'https://picsum.photos/id/237/100/100',
          role: 'client',
          profile: mockClientProfile,
        };
        setUser(mockClientUser);
        setPage('home');
      }
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        // In a real app, you would fetch the user profile here
         const mockClientUser: User = {
          id: session.user.id,
          name: session.user.user_metadata.full_name || 'Alex Doe',
          email: session.user.email || 'alex.doe@example.com',
          picture: 'https://picsum.photos/id/237/100/100',
          role: 'client',
          profile: mockClientProfile,
        };
        setUser(mockClientUser);
        setPage('home');
      } else {
        setUser(null);
        setPage('login');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      const fetchData = async () => {
        try {
          const [cleanersResponse, bookingsResponse] = await Promise.all([
            fetch('http://localhost:3001/api/cleaners'),
            fetch('http://localhost:3001/api/bookings', {
              headers: { Authorization: `Bearer ${session.access_token}` },
            }),
          ]);
          const cleanersData = await cleanersResponse.json();
          const bookingsData = await bookingsResponse.json();
          setCleaners(cleanersData);
          setBookings(bookingsData);
        } catch (error) {
          console.error("Failed to fetch initial data", error);
        } finally {
          // Add a small delay to prevent splash screen from flashing too quickly
          setTimeout(() => setIsLoading(false), 500);
        }
      };

      fetchData();
    }
  }, [session]);

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
  
  const handleBookingCreate = async (bookingDetails: Omit<Booking, 'id'>) => {
    const response = await fetch('http://localhost:3001/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token}` || '',
      },
      body: JSON.stringify(bookingDetails),
    });
    const newBooking = await response.json();
    setBookings(prev => [...prev, newBooking]);
    console.log("Booking Created:", newBooking);
    // Navigate to dashboard after a slight delay to show confirmation
    setTimeout(() => {
        handleNavigate('dashboard');
    }, 1500);
  }

  const handleUpdateBookingStatus = async (bookingId: string, status: 'upcoming' | 'actice' | 'completed') => {
    const response = await fetch(`http://localhost:3001/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token}` || '',
        },
        body: JSON.stringify({ status }),
    });
    const updatedBooking = await response.json();
    setBookings(prevBookings => 
      prevBookings.map(b => 
        b.id === bookingId ? updatedBooking : b
      )
    );
  };
  
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  if (isLoading) {
    return <SplashScreen />;
  }
  
  if (!session) {
    if (page === 'login') {
      return <LoginPage onLoginSuccess={() => setPage('home')} onNavigateToRegister={() => setPage('register')} />;
    }
    if (page === 'register') {
      return <RegisterPage onRegisterSuccess={() => setPage('login')} onNavigateToLogin={() => setPage('login')} />;
    }
    return <LoginPage onLoginSuccess={() => setPage('home')} onNavigateToRegister={() => setPage('register')} />;
  }

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
                user={user!}
                cleaners={cleaners}
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
            return <BookingPage cleanerId={props.cleanerId} user={user} onBookingComplete={handleBookingCreate} onBack={() => handleNavigate('cleanerProfile', { cleanerId: props.cleanerId })} />;
        case 'settings':
            return <div className="container mx-auto px-4 py-8 md:py-12"><Settings user={user!} /></div>;
        case 'jobTracking':
            if (!currentBooking || !user) {
                handleNavigate('dashboard');
                return null;
            }
            return <JobTrackingPage booking={currentBooking} user={user} onBack={() => handleNavigate('dashboard')} onUpdateStatus={handleUpdateBookingStatus} />;
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
                user={user!}
                cleaners={cleaners}
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
        <Dashboard user={user!} onNavigate={handleNavigate} onClose={() => setIsDashboardOpen(false)} bookings={bookings} />
      </div>
    </div>
  );
};

export default App;