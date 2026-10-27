/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  AppView,
  AuthModalType,
  Booking,
  Room,
  SearchFilters,
  UserProfile
} from './types';
import {
  INITIAL_ROOMS
} from './data/mockData';
import { roomApi, bookingApi, authApi } from './services/api';
import { saveUserSession, loadUserSession, clearUserSession } from './utils/cookies';
import { parseRoute, getUrlForView } from './utils/routes';
import { SmartPreloader } from './components/SmartPreloader';
import { TopLoadingBar } from './components/TopLoadingBar';
import { ScrollProgressBar, ScrollToTopButton } from './components/ScrollReveal';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { FeaturedRooms } from './components/FeaturedRooms';
import { GuestReviews } from './components/GuestReviews';
import { HotelHighlights } from './components/HotelHighlights';
import { SearchResultsView } from './components/SearchResultsView';
import { RoomDetailView } from './components/RoomDetailView';
import { CheckoutView } from './components/CheckoutView';
import { UserDashboardView } from './components/UserDashboardView';
import { AuthModal } from './components/AuthModal';
import { Footer } from './components/Footer';
import { AdminPortal } from './admin/AdminPortal';
import { ThemeProvider } from './context/ThemeContext';
import { CheckCircle2, Info, X } from 'lucide-react';
import CustomCursor from "./components/CustomCursor"

function AppContent() {
  // Synchronously parse current URL route on initial load before any render
  const initialRoute = useMemo(() => {
    if (typeof window !== 'undefined') {
      return parseRoute(
        window.location.pathname,
        window.location.hash,
        window.location.search,
        INITIAL_ROOMS
      );
    }
    return { view: 'home' as AppView, room: INITIAL_ROOMS[0] };
  }, []);

  // Preloader only shows when landing directly on homepage root '/'
  const [initialLoading, setInitialLoading] = useState(() => {
    if (typeof window !== 'undefined') {
      const cleanPath = window.location.pathname.replace(/^\/+/, '').replace(/\/+$/, '');
      const cleanHash = window.location.hash.replace(/^#\/?/, '').trim();
      // If user typed a direct path or hash, skip splash screen and load immediately
      if (cleanPath || cleanHash) {
        return false;
      }
    }
    return true;
  });

  // Top Loading Bar for view transitions
  const [isNavigating, setIsNavigating] = useState(false);
  const [navProgress, setNavProgress] = useState(0);

  // Active View State initialized immediately from URL path
  const [currentView, setCurrentView] = useState<AppView>(initialRoute.view);

  // Selected Room initialized immediately from URL if room slug or id was provided
  const [selectedRoom, setSelectedRoom] = useState<Room>(initialRoute.room || INITIAL_ROOMS[0]);
  const [checkoutParams, setCheckoutParams] = useState({
    room: initialRoute.room || INITIAL_ROOMS[0],
    checkIn: '2026-10-18',
    checkOut: '2026-10-21',
    nights: 3,
    adults: 2,
    children: 0
  });

  // Global App Data
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [user, setUser] = useState<UserProfile | null>(() => loadUserSession());
  const [authModal, setAuthModal] = useState<AuthModalType>(null);

  // Active search filters state with initial query params support
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    location: initialRoute.searchFilters?.location || 'Bentota, Sri Lanka',
    checkIn: '2026-10-18',
    checkOut: '2026-10-22',
    guests: initialRoute.searchFilters?.guests || 2,
    roomType: initialRoute.searchFilters?.roomType || 'all',
    minPrice: 10000,
    maxPrice: 60000,
    amenities: [],
    minRating: 0,
    sortBy: 'popular'
  });

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch rooms from backend MySQL API on mount
  useEffect(() => {
    roomApi.getAll().then((data) => {
      if (data && data.length > 0) {
        setRooms(data);
      }
    });
  }, []);

  // Fetch user reservations from backend MySQL API when user changes
  useEffect(() => {
    if (user?.email) {
      bookingApi.getUserBookings(user.email, user.id).then((bks) => {
        setBookings(bks || []);
      });
    } else {
      setBookings([]);
    }
  }, [user]);

  // Synchronize on mount and handle Browser Back/Forward buttons and Hash changes
  useEffect(() => {
    const handleUrlChange = () => {
      const resolved = parseRoute(
        window.location.pathname,
        window.location.hash,
        window.location.search,
        rooms
      );

      setIsNavigating(true);
      setNavProgress(40);

      const t1 = setTimeout(() => {
        setNavProgress(100);
        setCurrentView(resolved.view);
        if (resolved.room) {
          setSelectedRoom(resolved.room);
        }
        if (resolved.searchFilters && Object.keys(resolved.searchFilters).length > 0) {
          setSearchFilters((prev) => ({ ...prev, ...resolved.searchFilters }));
        }
        window.scrollTo({ top: 0, behavior: 'instant' });
      }, 100);

      const t2 = setTimeout(() => {
        setIsNavigating(false);
        setNavProgress(0);
      }, 250);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, [rooms]);

  // Top Loading Bar Page Switcher with History pushState
  const triggerNavigation = (targetView: AppView, targetRoom?: Room, callback?: () => void) => {
    setIsNavigating(true);
    setNavProgress(30);

    const roomToUse = targetRoom || (targetView === 'room-detail' ? selectedRoom : undefined);
    const targetPath = getUrlForView(targetView, roomToUse);

    // Update browser URL without reloading page
    if (window.location.pathname !== targetPath) {
      window.history.pushState(
        { view: targetView, roomSlug: roomToUse?.slug },
        '',
        targetPath
      );
    }

    const step1 = setTimeout(() => {
      setNavProgress(75);
    }, 100);

    const step2 = setTimeout(() => {
      setNavProgress(100);
      if (targetRoom) {
        setSelectedRoom(targetRoom);
      }
      if (callback) callback();
      setCurrentView(targetView);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 220);

    const step3 = setTimeout(() => {
      setIsNavigating(false);
      setNavProgress(0);
    }, 380);

    return () => {
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(step3);
    };
  };

  // Search handler from Hero Section
  const handleHeroSearch = (filters: Partial<SearchFilters>) => {
    setSearchFilters((prev) => ({
      ...prev,
      ...filters
    }));
    triggerNavigation('search');
  };

  // Room selected from Featured or Search list
  const handleSelectRoom = (room: Room) => {
    triggerNavigation('room-detail', room);
  };

  // Proceed to Checkout from Room Details (Requires User Login)
  const handleProceedToBooking = (details: {
    room: Room;
    checkIn: string;
    checkOut: string;
    nights: number;
    adults: number;
    children: number;
  }) => {
    if (!user) {
      showToast('Please log in to book this room.', 'info');
      setAuthModal('login');
      return;
    }
    setCheckoutParams(details);
    triggerNavigation('checkout');
  };

  // Refresh rooms from backend to keep availability counts & room numbers live
  const refreshRooms = () => {
    roomApi.getAll().then((data) => {
      if (data && data.length > 0) {
        setRooms(data);
        setSelectedRoom((prev) => data.find((r) => r.id === prev.id) || prev);
        setCheckoutParams((prev) => ({
          ...prev,
          room: data.find((r) => r.id === prev.room.id) || prev.room
        }));
      }
    });
  };

  // Handle successful reservation confirmation
  const handleBookingConfirmed = (newBooking: Booking) => {
    setBookings((prev) => [newBooking, ...prev]);
    refreshRooms();
    showToast(
      `Reservation #${newBooking.bookingReference} confirmed (Room #${newBooking.roomNumber || '101'})! Voucher sent to ${newBooking.guestInfo.email}`
    );
  };

  // Handle booking cancellation
  const handleCancelBooking = async (bookingId: string, reason: string) => {
    try {
      await bookingApi.cancel(bookingId, reason);
    } catch (err) {
      console.warn('Backend cancel failed, updating locally:', err);
    }
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? { ...b, status: 'cancelled', cancellationReason: reason }
          : b
      )
    );
    refreshRooms();
    showToast('Reservation successfully cancelled. Room returned to vacant inventory.', 'info');
  };

  // Handle Rating a past completed booking
  const handleRateBooking = async (bookingId: string, rating: number, comment?: string) => {
    try {
      await bookingApi.rate(bookingId, rating, comment);
    } catch (err) {
      console.warn('Backend rate failed, updating locally:', err);
    }
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? { ...b, userRating: rating, userReviewComment: comment }
          : b
      )
    );
    showToast(`Thank you! You rated your stay ${rating} stars.`);
  };

  // Handle Profile Update
  const handleUpdateProfile = async (updatedProfile: Partial<UserProfile>) => {
    if (user) {
      try {
        const saved = await authApi.updateProfile(user.id, updatedProfile);
        saveUserSession(saved);
        setUser(saved);
        showToast('Profile information successfully saved.');
      } catch (err: any) {
        showToast(err?.message || 'Failed to update profile.', 'info');
        throw err;
      }
    }
  };

  // Handle Profile Photo Upload (Frontend Resized -> Backend -> ImgBB -> MySQL DB)
  const handleUploadAvatar = async (base64Image: string): Promise<UserProfile> => {
    if (!user) throw new Error('Please sign in first.');
    const saved = await authApi.uploadAvatar(user.id, base64Image);
    saveUserSession(saved);
    setUser(saved);
    showToast('Profile photo uploaded!');
    return saved;
  };

  // Handle Profile Photo Removal
  const handleRemoveAvatar = async (): Promise<UserProfile> => {
    if (!user) throw new Error('Please sign in first.');
    const saved = await authApi.removeAvatar(user.id);
    saveUserSession(saved);
    setUser(saved);
    showToast('Profile photo removed.', 'info');
    return saved;
  };

  // Toggle Save / Bookmark Room
  const handleToggleSaveRoom = async (roomId: string) => {
    if (!user) {
      setAuthModal('login');
      return;
    }
    const isSaved = user.savedRoomIds.includes(roomId);
    const newSaved = isSaved
      ? user.savedRoomIds.filter((id) => id !== roomId)
      : [...user.savedRoomIds, roomId];
    const updated = { ...user, savedRoomIds: newSaved };
    saveUserSession(updated);
    setUser(updated);
    showToast(isSaved ? 'Removed from saved sanctuaries' : 'Saved to your favorites');
    try {
      await authApi.toggleSavedRoom(user.id, roomId);
    } catch (err) {
      console.warn('Backend toggle save room failed:', err);
    }
  };

  // 0. Dedicated Isolated Admin Portal (Never loads admin controls into client routes)
  if (currentView === 'admin') {
    return (
      <AdminPortal
        onGoToClientSite={() => triggerNavigation('home')}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBF9] dark:bg-[#0A1210] text-[#1A1F1D] dark:text-[#EDEDEB] transition-colors duration-300 overflow-x-hidden mainClass">
      {/* Top Animated Scroll Progress Bar Tracking Scroll Depth */}
      <ScrollProgressBar />
      <CustomCursor/>
      
      {/* 1. Smart Initial Preloader */}
      {initialLoading && (
        <SmartPreloader onComplete={() => setInitialLoading(false)} />
      )}

      {/* 2. Top Animated Progress Bar on Page Switches */}
      <TopLoadingBar isLoading={isNavigating} progress={navProgress} />

      {/* 3. Global Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'search') {
            setSearchFilters({
              location: 'Bentota, Sri Lanka',
              checkIn: '2026-10-18',
              checkOut: '2026-10-22',
              guests: 1,
              roomType: 'all',
              minPrice: 10000,
              maxPrice: 60000,
              amenities: [],
              minRating: 0,
              sortBy: 'popular'
            });
          }
          triggerNavigation(view);
        }}
        user={user}
        onOpenAuth={(type) => setAuthModal(type)}
        onLogout={() => {
          authApi.logout();
          clearUserSession();
          setUser(null);
          showToast('Successfully logged out', 'info');
        }}
        reservationsCount={bookings.filter((b) => b.status === 'confirmed').length}
      />

      {/* 4. Active Main Content with smooth fade */}
      <div className="flex-1 transition-opacity duration-200">
        {currentView === 'home' && (
          <main className="animate-in fade-in duration-300">
            {/* Hero Section matching screenshot */}
            <HeroSection onSearch={handleHeroSearch} />

            {/* Featured Rooms matching screenshot (Standard, Deluxe, Suite) */}
            <FeaturedRooms rooms={rooms} onSelectRoom={handleSelectRoom} />

            {/* Guest Reviews matching screenshot */}
            <GuestReviews
              user={user}
              onOpenAuth={() => setAuthModal('login')}
            />

            {/* Resort Barefoot Luxury Highlights */}
            <HotelHighlights />
          </main>
        )}

        {currentView === 'search' && (
          <div className="animate-in fade-in duration-300">
            <SearchResultsView
              rooms={rooms}
              initialFilters={searchFilters}
              onSelectRoom={handleSelectRoom}
              savedRoomIds={user?.savedRoomIds || []}
              onToggleSaveRoom={handleToggleSaveRoom}
            />
          </div>
        )}

        {currentView === 'room-detail' && (
          <div className="animate-in fade-in duration-300">
            <RoomDetailView
              room={selectedRoom}
              onBack={() => triggerNavigation('search')}
              onBookNow={handleProceedToBooking}
              isSaved={user?.savedRoomIds.includes(selectedRoom.id) || false}
              onToggleSave={() => handleToggleSaveRoom(selectedRoom.id)}
              isLoggedIn={Boolean(user)}
              onRequireLogin={() => {
                showToast('Please log in to book this room.', 'info');
                setAuthModal('login');
              }}
            />
          </div>
        )}

        {currentView === 'checkout' && (
          <div className="animate-in fade-in duration-300">
            <CheckoutView
              room={checkoutParams.room}
              checkIn={checkoutParams.checkIn}
              checkOut={checkoutParams.checkOut}
              nights={checkoutParams.nights}
              adults={checkoutParams.adults}
              children={checkoutParams.children}
              user={user}
              onBack={() => triggerNavigation('room-detail')}
              onBookingConfirmed={handleBookingConfirmed}
              onGoToDashboard={() => triggerNavigation('dashboard')}
            />
          </div>
        )}

        {currentView === 'dashboard' && (
          <div className="animate-in fade-in duration-300">
            {user ? (
              <UserDashboardView
                user={user}
                bookings={bookings}
                rooms={rooms}
                onCancelBooking={handleCancelBooking}
                onUpdateProfile={handleUpdateProfile}
                onUploadAvatar={handleUploadAvatar}
                onRemoveAvatar={handleRemoveAvatar}
                onSelectRoom={handleSelectRoom}
                onExploreRooms={() => triggerNavigation('search')}
                onRateBooking={handleRateBooking}
              />
            ) : (
              <div className="max-w-md mx-auto py-20 px-4 text-center">
                <h2 className="font-serif text-2xl font-medium text-stone-900 dark:text-stone-100 mb-2">
                  Please Sign In
                </h2>
                <p className="text-sm text-stone-600 dark:text-stone-400 mb-6">
                  Sign in to view and manage your reservations, past stays, and account settings.
                </p>
                <button
                  onClick={() => setAuthModal('login')}
                  className="px-6 py-3 bg-[#0D4739] text-white rounded-xl text-sm font-semibold hover:bg-[#09352B] transition-colors"
                >
                  Log In to Serene Stay
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. Global Footer */}
      <Footer onNavigate={(view) => triggerNavigation(view)} />

      {/* 6. Authentication Modal (Login / Register / Forgot Password) */}
      {authModal && (
        <AuthModal
          type={authModal}
          onClose={() => setAuthModal(null)}
          onLoginSuccess={(newUser) => {
            saveUserSession(newUser);
            setUser(newUser);
            showToast(`Welcome back, ${newUser.fullName}!`);
          }}
        />
      )}

      {/* 7. Action Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-[#072B23] dark:bg-[#0A1F19] text-white p-4 rounded-2xl shadow-2xl border border-[#C2A26F]/30 flex items-start gap-3 animate-in slide-in-from-bottom-5 fade-in">
          {toast.type === 'info' ? (
            <Info className="w-5 h-5 text-[#C2A26F] shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 text-xs sm:text-sm text-stone-200 leading-snug">
            {toast.message}
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-stone-400 hover:text-white p-0.5 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Floating Scroll To Top Button with Circular Scroll Progress */}
      <ScrollToTopButton />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

