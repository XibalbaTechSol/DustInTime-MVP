import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import { BASE_URL } from './constants';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import SplashScreen from './components/SplashScreen';
import ClientOnboarding from './components/ClientOnboarding';
import UserProfilePage from './components/UserProfilePage';

// Statically import all page components to resolve module loading errors.
import CleanerProfilePage from './components/CleanerProfilePage';
import BookingPage from './components/BookingPage';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import JobTrackingPage from './components/JobTrackingPage';
import MessagesPage from './components/MessagesPage';

import type { User, Booking, Cleaner } from './types';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [page, setPage] = useState('login');
  const [pageState, setPageState] = useState<{ page: string; props?: any }>({ page: 'home' });
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [cleaners, setCleaners] = useState<Cleaner[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  const handleLoginSuccess = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await fetch(`${BASE_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setIsAuthenticated(true);
          setPage('home');
        } else {
          setAuthError('Login failed');
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          setPage('login');
        }
      } catch (error) {
        setAuthError('An error occurred. Please try again.');
        console.error("Failed to fetch user profile", error);
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setPage('login');
      }
    }
  };

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        await handleLoginSuccess();
      }
      setIsLoading(false);
    };

    verifyToken();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchBookings = async () => {
        try {
          const bookingsResponse = await fetch(`${BASE_URL}/api/bookings`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
          const bookingsData = await bookingsResponse.json();
          setBookings(bookingsData);
        } catch (error) {
          console.error("Failed to fetch initial data", error);
        }
      };

      fetchBookings();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const fetchCleaners = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/search?q=${searchTerm}`);
        const data = await response.json();
        setCleaners(data);
      } catch (error) {
        console.error('Error searching for cleaners:', error);
      }
    };

    if (isAuthenticated) {
      fetchCleaners();
    }
  }, [searchTerm, isAuthenticated]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('dark');
    root.classList.add('light');
    localStorage.setItem('theme', 'light');
  }, []);

  const toggleDashboard = () => setIsDashboardOpen(prev => !prev);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
    setPage('login');
  };

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
    const response = await fetch(`${BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
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

  const handleUpdateBookingStatus = async (bookingId: string, status: 'upcoming' | 'active' | 'completed') => {
    const response = await fetch(`${BASE_URL}/api/bookings/${bookingId}`,
    {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
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

  const handleUpdateProfile = async (updatedUser: User) => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await fetch(`${BASE_URL}/api/auth/me`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedUser),
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          handleNavigate('dashboard');
        } else {
          console.error('Failed to update user profile');
        }
      } catch (error) {
        console.error("Failed to update user profile", error);
      }
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };



  if (isLoading) {
    return <SplashScreen />;
  }

  if (!isAuthenticated) {
    if (page === 'login') {
      return <LoginPage onLoginSuccess={handleLoginSuccess} onNavigateToRegister={() => setPage('register')} error={authError} />;
    }
    if (page === 'register') {
      return <RegisterPage onRegisterSuccess={handleLoginSuccess} onNavigateToLogin={() => setPage('login')} error={authError} />;
    }
    // Default to login if not authenticated and page is not login/register
    return <LoginPage onLoginSuccess={handleLoginSuccess} onNavigateToRegister={() => setPage('register')} error={authError} />;
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
            return <div className="container mx-auto px-4 py-8 md:py-12"><Settings user={user!} onNavigate={handleNavigate} /></div>;
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
        case 'clientOnboarding':
            if (!user) {
                handleNavigate('home');
                return null;
            }
            return <ClientOnboarding user={user} onOnboardingComplete={() => handleNavigate('home')} />;
        case 'userProfile':
            if (!user) {
                handleNavigate('home');
                return null;
            }
            return <UserProfilePage user={user} onUpdateProfile={handleUpdateProfile} onBack={() => handleNavigate('dashboard')} />;

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

  const isFullScreenPage = ['jobTracking', 'messages'].includes(pageState.page);
  const showFooter = !isFullScreenPage && pageState.page !== 'home';

  return (
    <div className="flex flex-col min-h-screen bg-base-200 font-sans">

      {/* Main App Content Wrapper - Hidden when dashboard is open */}
      <div className={`flex flex-col flex-grow ${isDashboardOpen ? 'hidden' : ''}`}>
        {!isFullScreenPage && <Header user={user} onNavigate={(page) => handleNavigate(page)} onToggleDashboard={toggleDashboard} onSearch={handleSearch} onLogout={handleLogout} />}

        <main className="flex-grow">
          {renderContent()}
        </main>

        {!isFullScreenPage && showFooter && <Footer />}
      </div>

      {/* Dashboard Overlay */}
      <div
        className={`fixed inset-0 bg-base-100 z-50 transform transition-transform duration-300 ease-in-out ${isDashboardOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <Dashboard user={user!} onNavigate={handleNavigate} onClose={() => setIsDashboardOpen(false)} bookings={bookings} onLogout={handleLogout} />
      </div>
    </div>
  );
};

export default App;
