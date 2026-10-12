import React, { useState, useEffect } from 'react';
import { AdminTab, Booking, Room, UserProfile, AdminStats, PromoCodeItem, Review } from '../types';
import { INITIAL_ROOMS, INITIAL_BOOKINGS, INITIAL_REVIEWS } from '../data/mockData';
import { roomApi, bookingApi, adminApi, promoApi, reviewApi, authApi } from '../services/api';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { AdminOverview } from './AdminOverview';
import { AdminRooms } from './AdminRooms';
import { AdminBookings } from './AdminBookings';
import { AdminStaff } from './AdminStaff';
import { AdminGuests } from './AdminGuests';
import { AdminReviews } from './AdminReviews';
import { AdminPromos } from './AdminPromos';
import { AdminProfile } from './AdminProfile';
import { Hotel, KeyRound, Mail, ShieldAlert, CheckCircle2, ArrowRight, AlertCircle } from 'lucide-react';
import { saveAdminSession, loadAdminSession, clearAdminSession } from '../utils/cookies';
import { validateEmail } from '../utils/validation';

interface AdminPortalProps {
  onGoToClientSite: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onGoToClientSite }) => {
  // 1. Admin Authentication State with Cookie & LocalStorage persistence
  const [adminUser, setAdminUser] = useState<UserProfile | null>(() => loadAdminSession());

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginTouched, setLoginTouched] = useState({ email: false, password: false });
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // 2. Active Tab State
  const [currentTab, setCurrentTab] = useState<AdminTab>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // 3. Live Data State
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [admins, setAdmins] = useState<UserProfile[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [promos, setPromos] = useState<PromoCodeItem[]>([
    { id: 1, code: 'SERENE10', description: '10% Coastal discount', discountType: 'percentage', discountValue: 10, minSpend: 10000, isActive: true },
    { id: 2, code: 'WELCOME15', description: '15% Welcome special', discountType: 'percentage', discountValue: 15, minSpend: 15000, isActive: true },
    { id: 3, code: 'CEYLON20', description: '20% Villa discount', discountType: 'percentage', discountValue: 20, minSpend: 25000, isActive: true }
  ]);
  const [stats, setStats] = useState<AdminStats>({
    totalRevenue: 345000,
    totalBookings: 6,
    confirmedBookings: 5,
    cancelledBookings: 1,
    totalRooms: 6,
    totalUsers: 8,
    totalAdmins: 2,
    totalReviews: 4,
    occupancyRate: 85
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Shortcut triggers from overview
  const [directAddRoom, setDirectAddRoom] = useState(false);
  const [directAddAdmin, setDirectAddAdmin] = useState(false);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // 4. Fetch All Admin Data
  const refreshAllData = async () => {
    setIsRefreshing(true);
    try {
      const [roomsData, bookingsData, adminsData, usersData, reviewsData, promosData, statsData] = await Promise.all([
        roomApi.getAll().catch(() => INITIAL_ROOMS),
        bookingApi.getAll().catch(() => INITIAL_BOOKINGS),
        adminApi.getAdmins().catch(() => []),
        adminApi.getAllUsers().catch(() => []),
        reviewApi.getAll().catch(() => INITIAL_REVIEWS),
        promoApi.getAll().catch(() => promos),
        adminApi.getStats().catch(() => stats)
      ]);

      if (roomsData) setRooms(roomsData);
      if (bookingsData) setBookings(bookingsData);
      if (adminsData && adminsData.length > 0) {
        setAdmins(adminsData);
        if (adminUser) {
          const matched =
            adminsData.find((a) => a.id === adminUser.id) ||
            adminsData.find((a) => a.email.toLowerCase() === adminUser.email.toLowerCase());
          if (matched && (matched.id !== adminUser.id || matched.avatar !== adminUser.avatar)) {
            setAdminUser(matched);
            saveAdminSession(matched);
          }
        }
      }
      if (usersData) setUsers(usersData);
      if (reviewsData) setReviews(reviewsData);
      if (promosData) setPromos(promosData);
      if (statsData) setStats(statsData);
    } catch (err) {
      console.warn('Admin portal background sync error:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Initial fetch when logged in
  useEffect(() => {
    if (adminUser?.id) {
      refreshAllData();
    }
  }, [adminUser?.id]);

  // Real-time validation for Admin Login
  const loginFieldErrors = {
    email: validateEmail(loginEmail),
    password: !loginPassword.trim()
      ? 'Password is required.'
      : loginPassword.trim().length < 4
      ? 'Password must be at least 4 characters.'
      : null
  };
  const isLoginFormValid = !loginFieldErrors.email && !loginFieldErrors.password;

  // 5. Admin Login Handler
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginTouched({ email: true, password: true });
    setLoginError('');

    if (!isLoginFormValid) {
      setLoginError('Please enter a valid administrator email and password.');
      return;
    }

    setIsLoggingIn(true);

    try {
      const email = loginEmail.trim().toLowerCase();
      const password = loginPassword.trim();

      // Authenticate against real backend API & MySQL database
      const userProfile = await authApi.login(email, password);

      if (userProfile.role === 'admin' || userProfile.role === 'super_admin' || userProfile.role === 'manager') {
        setAdminUser(userProfile);
        saveAdminSession(userProfile);
        showToast(`Welcome back, Administrator ${userProfile.fullName}!`);
      } else {
        setLoginError('Access denied. This account does not possess administrator privileges.');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Invalid administrator credentials.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleAdminLogout = () => {
    setAdminUser(null);
    clearAdminSession();
    showToast('Admin session signed out successfully', 'info');
  };

  // 6. Room CRUD Handlers
  const handleAddRoom = async (roomData: Partial<Room>) => {
    const created = await roomApi.create(roomData);
    setRooms((prev) => [created, ...prev]);
    refreshAllData();
  };

  const handleUpdateRoom = async (id: string, roomData: Partial<Room>) => {
    const updated = await roomApi.update(id, roomData);
    setRooms((prev) => prev.map((r) => (r.id === id ? updated : r)));
    refreshAllData();
  };

  const handleDeleteRoom = async (id: string) => {
    await roomApi.delete(id);
    setRooms((prev) => prev.filter((r) => r.id !== id));
    refreshAllData();
  };

  // 7. Booking Handlers
  const handleUpdateBookingStatus = async (id: string, status: string) => {
    const updated = await bookingApi.updateStatus(id, status);
    setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)));
    refreshAllData();
  };

  const handleDeleteBooking = async (id: string) => {
    await bookingApi.delete(id);
    setBookings((prev) => prev.filter((b) => b.id !== id));
    refreshAllData();
  };

  // 8. Admin & Staff Handlers
  const handleAddAdmin = async (adminData: { fullName: string; email: string; password?: string; role?: string; phone?: string }) => {
    const created = await adminApi.createAdmin(adminData);
    setAdmins((prev) => [...prev, created]);
    refreshAllData();
  };

  const handleUpdateAdmin = async (id: string, data: Partial<UserProfile> & { password?: string }) => {
    const updated = await adminApi.updateAdmin(id, data);
    setAdmins((prev) => prev.map((a) => (a.id === id ? updated : a)));
    if (adminUser && adminUser.id === id) {
      setAdminUser(updated);
      saveAdminSession(updated);
    }
    refreshAllData();
  };

  const handleDeleteAdmin = async (id: string) => {
    await adminApi.deleteAdmin(id);
    setAdmins((prev) => prev.filter((a) => a.id !== id));
    refreshAllData();
  };

  // 9. Promo Handlers
  const handleAddPromo = async (promoData: Partial<PromoCodeItem>) => {
    const created = await promoApi.create(promoData);
    setPromos((prev) => [...prev, created]);
  };

  const handleDeletePromo = async (id: number | string) => {
    await promoApi.delete(id);
    setPromos((prev) => prev.filter((p) => p.id !== id && p.code !== id));
  };

  // 10. Review Handlers
  const handleDeleteReview = async (id: string) => {
    await reviewApi.delete(id);
    setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  // 11. Admin Own Profile, Avatar & Password Handlers
  const handleUpdateMyProfile = async (profileData: Partial<UserProfile>): Promise<UserProfile> => {
    if (!adminUser) throw new Error('Not signed in');
    const updated = await authApi.updateProfile(adminUser.id, profileData);
    const merged: UserProfile = {
      ...adminUser,
      ...updated,
      role: updated.role || adminUser.role
    };
    setAdminUser(merged);
    saveAdminSession(merged);
    setAdmins((prev) => prev.map((a) => (a.id === merged.id ? merged : a)));
    setUsers((prev) => prev.map((u) => (u.id === merged.id ? merged : u)));
    return merged;
  };

  const handleUploadMyAvatar = async (base64Image: string): Promise<UserProfile> => {
    if (!adminUser) throw new Error('Not signed in');
    const updated = await authApi.uploadAvatar(adminUser.id, base64Image);
    const merged: UserProfile = {
      ...adminUser,
      ...updated,
      role: updated.role || adminUser.role
    };
    setAdminUser(merged);
    saveAdminSession(merged);
    setAdmins((prev) => prev.map((a) => (a.id === merged.id ? merged : a)));
    setUsers((prev) => prev.map((u) => (u.id === merged.id ? merged : u)));
    return merged;
  };

  const handleRemoveMyAvatar = async (): Promise<UserProfile> => {
    if (!adminUser) throw new Error('Not signed in');
    const updated = await authApi.removeAvatar(adminUser.id);
    const merged: UserProfile = {
      ...adminUser,
      ...updated,
      avatar: '',
      role: updated.role || adminUser.role
    };
    setAdminUser(merged);
    saveAdminSession(merged);
    setAdmins((prev) => prev.map((a) => (a.id === merged.id ? merged : a)));
    setUsers((prev) => prev.map((u) => (u.id === merged.id ? merged : u)));
    return merged;
  };

  const handleChangeMyPassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    if (!adminUser) throw new Error('Not signed in');
    await authApi.changePassword(adminUser.id, currentPassword, newPassword);
  };

  // If NOT authenticated as Admin: Render Dedicated Admin Sign In Screen
  if (!adminUser) {
    return (
      <div className="min-h-screen bg-[#070D0B] text-stone-100 flex flex-col justify-center items-center p-4">
        {/* Floating Toast Notification */}
        {toast && (
          <div className="fixed top-6 z-50 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-medium text-xs shadow-2xl animate-in fade-in flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toast.message}</span>
          </div>
        )}

        <div className="w-full max-w-md bg-[#0F1E19] border border-[#1C2F29] rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle Glow Accent */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Brand Wordmark & Emblem */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#10B981] to-[#0D4739] text-white flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-950/60 ring-2 ring-emerald-500/40">
              <Hotel className="w-7 h-7 text-emerald-100" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-stone-100 tracking-tight">
              Serene Stay Admin Portal
            </h1>
            <p className="text-xs text-stone-400 mt-1">
              Management & Operations Control Console
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleAdminLogin} noValidate className="space-y-4 text-xs">
            {loginError && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block font-semibold text-stone-300 uppercase tracking-wider text-[10px] mb-1.5">
                Staff Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  autoComplete="username email"
                  placeholder="admin@serenestay.com"
                  value={loginEmail}
                  onChange={(e) => {
                    setLoginEmail(e.target.value);
                    setLoginTouched((prev) => ({ ...prev, email: true }));
                  }}
                  onBlur={() => setLoginTouched((prev) => ({ ...prev, email: true }))}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#08120F] border text-stone-100 placeholder-stone-600 focus:outline-none focus:ring-2 ${
                    loginTouched.email && loginFieldErrors.email
                      ? 'border-red-500 focus:ring-red-500/40'
                      : 'border-[#1C2F29] focus:ring-emerald-500'
                  }`}
                />
              </div>
              {loginTouched.email && loginFieldErrors.email && (
                <p className="text-[11px] font-medium text-red-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {loginFieldErrors.email}
                </p>
              )}
            </div>

            <div>
              <label className="block font-semibold text-stone-300 uppercase tracking-wider text-[10px] mb-1.5">
                Admin Password *
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => {
                    setLoginPassword(e.target.value);
                    setLoginTouched((prev) => ({ ...prev, password: true }));
                  }}
                  onBlur={() => setLoginTouched((prev) => ({ ...prev, password: true }))}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#08120F] border text-stone-100 placeholder-stone-600 focus:outline-none focus:ring-2 ${
                    loginTouched.password && loginFieldErrors.password
                      ? 'border-red-500 focus:ring-red-500/40'
                      : 'border-[#1C2F29] focus:ring-emerald-500'
                  }`}
                />
              </div>
              {loginTouched.password && loginFieldErrors.password && (
                <p className="text-[11px] font-medium text-red-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {loginFieldErrors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-emerald-950/50 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span>{isLoggingIn ? 'Authenticating...' : 'Sign In to Admin Console'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Return to Public Site */}
          <div className="mt-6 pt-4 border-t border-[#1C2F29] text-center">
            <button
              onClick={onGoToClientSite}
              className="text-xs text-stone-400 hover:text-emerald-400 transition-colors cursor-pointer"
            >
              &larr; Back to Serene Stay Public Website
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Admin Dashboard Layout
  return (
    <div className="min-h-screen bg-[#FBFBF9] dark:bg-[#070D0B] text-stone-900 dark:text-stone-100 transition-colors flex">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl text-white font-medium text-xs shadow-2xl animate-in fade-in flex items-center gap-2 ${
            toast.type === 'info' ? 'bg-rose-600' : 'bg-emerald-600'
          }`}
        >
          {toast.type === 'info' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* 1. Sidebar */}
      <AdminSidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        adminUser={adminUser}
        onLogout={handleAdminLogout}
        onGoToSite={onGoToClientSite}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Header */}
        <AdminHeader
          currentTab={currentTab}
          onOpenMobile={() => setMobileSidebarOpen(true)}
          adminUser={adminUser}
          onRefresh={refreshAllData}
          isRefreshing={isRefreshing}
          onSelectTab={setCurrentTab}
        />

        {/* Tab Viewport */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1">
          {currentTab === 'overview' && (
            <AdminOverview
              stats={stats}
              bookings={bookings}
              rooms={rooms}
              admins={admins}
              onNavigateTab={setCurrentTab}
              onOpenAddRoom={() => {
                setCurrentTab('rooms');
                setDirectAddRoom(true);
              }}
              onOpenAddAdmin={() => {
                setCurrentTab('admins');
                setDirectAddAdmin(true);
              }}
            />
          )}

          {currentTab === 'rooms' && (
            <AdminRooms
              rooms={rooms}
              onAddRoom={handleAddRoom}
              onUpdateRoom={handleUpdateRoom}
              onDeleteRoom={handleDeleteRoom}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'bookings' && (
            <AdminBookings
              bookings={bookings}
              onUpdateStatus={handleUpdateBookingStatus}
              onDeleteBooking={handleDeleteBooking}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'admins' && (
            <AdminStaff
              admins={admins}
              currentAdmin={adminUser}
              onAddAdmin={handleAddAdmin}
              onUpdateAdmin={handleUpdateAdmin}
              onDeleteAdmin={handleDeleteAdmin}
              onShowToast={showToast}
              openCreateModalDirectly={directAddAdmin}
              onClearOpenModalDirectly={() => setDirectAddAdmin(false)}
            />
          )}

          {currentTab === 'guests' && (
            <AdminGuests
              users={users}
              bookings={bookings}
            />
          )}

          {currentTab === 'reviews' && (
            <AdminReviews
              reviews={reviews}
              onDeleteReview={handleDeleteReview}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'promos' && (
            <AdminPromos
              promos={promos}
              onAddPromo={handleAddPromo}
              onDeletePromo={handleDeletePromo}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'profile' && (
            <AdminProfile
              adminUser={adminUser}
              onUpdateProfile={handleUpdateMyProfile}
              onUploadAvatar={handleUploadMyAvatar}
              onRemoveAvatar={handleRemoveMyAvatar}
              onChangePassword={handleChangeMyPassword}
              notify={(msg, type) => showToast(msg, type === 'error' ? 'info' : 'success')}
            />
          )}
        </main>
      </div>
    </div>
  );
};
