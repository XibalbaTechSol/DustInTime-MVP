import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import { BASE_URL } from './constants';
import LoginPage from './components/LoginPage';
import SplashScreen from './components/SplashScreen';
import CleanerOnboarding from './components/CleanerOnboarding';

// Statically import all page components to resolve module loading errors.
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import MessagesPage from './components/MessagesPage';
import CleanerNavigationPage from './components/CleanerNavigationPage';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [page, setPage] = useState('login');
  const [pageState, setPageState] = useState<{ page: string; props?: any }>({ page: 'dashboard' });
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
          setPage('dashboard');
        } else {
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          setPage('login');
        }
      } catch (error) {
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
      const fetchData = async () => {
        try {
          const bookingsResponse = await fetch(`${BASE_URL}/api/bookings`,
          {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
          const bookingsData = await bookingsResponse.json();
          setBookings(bookingsData);
        } catch (error) {
          console.error("Failed to fetch initial data", error);
        }
      };

      fetchData();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'light' ? 'dark' : 'light');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // const toggleTheme = () => {
  //   setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  // };

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
      if (pageState.page !== 'dashboard') {
        setPageState({ page: 'dashboard' });
      }
      return;
    }

    setIsDashboardOpen(false); // Close dashboard when navigating elsewhere
    setPageState({ page, props });
    window.scrollTo(0, 0); // Scroll to top on page change
  };

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



  if (isLoading) {
    return <SplashScreen />;
  }

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} onNavigateToRegister={() => {}} />;
  }

  const renderContent = () => {
    const { page, props } = pageState;
    const currentBooking = props?.booking ? bookings.find(b => b.id === props.booking.id) || props.booking : undefined;

    switch(page) {
        case 'dashboard':
            return <Dashboard user={user!} onNavigate={handleNavigate} onClose={() => setIsDashboardOpen(false)} bookings={bookings} onLogout={handleLogout} />;
        case 'settings':
            return <div className="container mx-auto px-4 py-8 md:py-12"><Settings user={user!} onNavigate={handleNavigate} /></div>;
        case 'messages':
             if (!user) {
                handleNavigate('dashboard');
                return null;
            }
            return <MessagesPage user={user} onNavigate={handleNavigate} initialConversationId={props.conversationId} />;
        case 'cleanerNavigation':
            if (!currentBooking || !user || user.role !== 'cleaner') {
                handleNavigate('dashboard');
                return null;
            }
            return <CleanerNavigationPage booking={currentBooking} onBack={() => handleNavigate('dashboard')} onUpdateStatus={handleUpdateBookingStatus} />;
        case 'cleanerOnboarding':
            if (!user) {
                handleNavigate('dashboard');
                return null;
            }
            return <CleanerOnboarding user={user} onOnboardingComplete={() => handleNavigate('dashboard')} />;

        default:
            return <Dashboard user={user!} onNavigate={handleNavigate} onClose={() => setIsDashboardOpen(false)} bookings={bookings} onLogout={handleLogout} />;
    }
  };

  const isFullScreenPage = ['cleanerNavigation'].includes(pageState.page);

  return (
    <div className="flex flex-col min-h-screen bg-base-200 dark:bg-neutral-focus font-sans">

      {/* Main App Content Wrapper - Hidden when dashboard is open */}
      <div className={`flex flex-col flex-grow ${isDashboardOpen ? 'hidden' : ''}`}>
        {!isFullScreenPage && <Header user={user} onNavigate={(page) => handleNavigate(page)} onToggleDashboard={toggleDashboard} theme={theme} /*onToggleTheme={toggleTheme}*/ onSearch={() => {}} onLogout={handleLogout} />}

        <main className="flex-grow">
          {renderContent()}
        </main>

      </div>

      {/* Dashboard Overlay */}
      <div
        className={`fixed inset-0 bg-base-100 dark:bg-neutral z-50 transform transition-transform duration-300 ease-in-out ${isDashboardOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <Dashboard user={user!} onNavigate={handleNavigate} onClose={() => setIsDashboardOpen(false)} bookings={bookings} onLogout={handleLogout} />
      </div>
    </div>
  );
};

export default App;
