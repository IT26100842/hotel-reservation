import React, { useState } from 'react';
import { AppView, AuthModalType, UserProfile } from '../types';
import { Menu, X, Calendar, User, LogOut, ChevronDown, Compass } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { getAvatarUrl, NO_DP_AVATAR } from '../utils/avatar';

interface NavbarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  user: UserProfile | null;
  onOpenAuth: (type: AuthModalType) => void;
  onLogout: () => void;
  reservationsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  user,
  onOpenAuth,
  onLogout,
  reservationsCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleNavClick = (view: AppView) => {
    onNavigate(view);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FBFBF9]/95 dark:bg-[#0A1210]/95 backdrop-blur-md border-b border-[#EAEAE5] dark:border-[#1F332C] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Zone 1: Brand Wordmark with Flower Petal Icon (Matches Screenshot) */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 group text-left cursor-pointer focus:outline-none"
          >
            <div className="w-9 h-9 rounded-full bg-[#0D4739]/10 dark:bg-[#0D4739]/40 flex items-center justify-center text-[#0D4739] dark:text-[#C2A26F] group-hover:bg-[#0D4739] dark:group-hover:bg-[#C2A26F] group-hover:text-white dark:group-hover:text-stone-900 transition-all duration-300">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                <circle cx="12" cy="12" r="2.5" />
                <path d="M12 2a4 4 0 0 0-4 4c0 2 2 3.5 4 6 2-2.5 4-4 4-6a4 4 0 0 0-4-4z" />
                <path d="M12 22a4 4 0 0 0 4-4c0-2-2-3.5-4-6-2 2.5-4 4-4 6a4 4 0 0 0 4 4z" />
                <path d="M2 12a4 4 0 0 0 4 4c2 0 3.5-2 6-4-2.5-2-4-4-6-4a4 4 0 0 0-4 4z" />
                <path d="M22 12a4 4 0 0 0-4-4c-2 0-3.5 2-6 4 2.5 2 4 4 6 4a4 4 0 0 0 4-4z" />
              </svg>
            </div>
            <span className="font-serif text-2xl tracking-tight font-medium text-[#1A1F1D] dark:text-[#F5F5F0]">
              Serene Stay
            </span>
          </button>

          {/* Zone 2: Navigation Links (Matches Screenshot: Rooms, Reviews, My reservations) */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#4A5550] dark:text-stone-300">
            <button
              onClick={() => handleNavClick('search')}
              className={`hover:text-[#0D4739] dark:hover:text-[#C2A26F] transition-colors relative py-1 cursor-pointer ${
                currentView === 'search' ? 'text-[#0D4739] dark:text-[#C2A26F] font-semibold' : ''
              }`}
            >
              Rooms
              {currentView === 'search' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0D4739] dark:bg-[#C2A26F] rounded-full" />
              )}
            </button>

            <button
              onClick={() => {
                if (currentView !== 'home') {
                  onNavigate('home');
                }
                setTimeout(() => {
                  document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 150);
              }}
              className="hover:text-[#0D4739] dark:hover:text-[#C2A26F] transition-colors relative py-1 cursor-pointer"
            >
              Reviews
            </button>

            <button
              onClick={() => {
                if (user) {
                  handleNavClick('dashboard');
                } else {
                  onOpenAuth('login');
                }
              }}
              className={`hover:text-[#0D4739] dark:hover:text-[#C2A26F] transition-colors relative py-1 flex items-center gap-1.5 cursor-pointer ${
                currentView === 'dashboard' ? 'text-[#0D4739] dark:text-[#C2A26F] font-semibold' : ''
              }`}
            >
              <span>My reservations</span>
              {reservationsCount > 0 && (
                <span className="text-[11px] font-mono tabular-nums text-emerald-800 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/80 px-1.5 py-0.2 rounded">
                  {reservationsCount}
                </span>
              )}
              {currentView === 'dashboard' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0D4739] dark:bg-[#C2A26F] rounded-full" />
              )}
            </button>

            <button
              onClick={() => {
                if (currentView !== 'home') {
                  onNavigate('home');
                }
                setTimeout(() => {
                  document.getElementById('amenities-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 150);
              }}
              className="hover:text-[#0D4739] dark:hover:text-[#C2A26F] transition-colors relative py-1 cursor-pointer"
            >
              Experience
            </button>
          </nav>

          {/* Zone 3: Primary Actions + Theme Toggle (Desktop) */}
          <div className="hidden md:flex items-center gap-3.5">
            {/* Theme Toggle Button */}
            <ThemeToggle variant="compact" />

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <img
                    src={getAvatarUrl(user.avatar)}
                    alt={user.fullName}
                    onError={(e) => {
                      e.currentTarget.src = NO_DP_AVATAR;
                    }}
                    className="w-8 h-8 rounded-full object-cover border border-[#D5D8D5] dark:border-[#1F332C] bg-stone-800"
                  />
                  <span className="text-sm font-medium text-[#1A1F1D] dark:text-stone-200 max-w-[120px] truncate">
                    {user.fullName}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#12201C] rounded-xl shadow-xl border border-stone-100 dark:border-[#1F332C] py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-stone-100 dark:border-[#1F332C]">
                      <p className="text-xs text-stone-500 dark:text-stone-400">Signed in as</p>
                      <p className="text-sm font-semibold text-[#1A1F1D] dark:text-stone-100 truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={() => handleNavClick('dashboard')}
                      className="w-full text-left px-4 py-2 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-[#172A24] flex items-center gap-2 cursor-pointer"
                    >
                      <Calendar className="w-4 h-4 text-stone-400" />
                      <span>My Reservations</span>
                    </button>
                    <button
                      onClick={() => handleNavClick('dashboard')}
                      className="w-full text-left px-4 py-2 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-[#172A24] flex items-center gap-2 cursor-pointer"
                    >
                      <User className="w-4 h-4 text-stone-400" />
                      <span>Profile & Settings</span>
                    </button>
                    <div className="border-t border-stone-100 dark:border-[#1F332C] my-1" />
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={() => onOpenAuth('login')}
                  className="text-sm font-medium text-[#1A1F1D] dark:text-stone-200 hover:text-[#0D4739] dark:hover:text-[#C2A26F] transition-colors px-3 py-2 cursor-pointer"
                >
                  Log in
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-[#0D4739] hover:bg-[#09352B] active:scale-[0.98] rounded-lg transition-all duration-200 shadow-sm whitespace-nowrap cursor-pointer"
                >
                  Create account
                </button>
              </>
            )}
          </div>

          {/* Mobile Right Bar: Compact Theme Toggle + Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle variant="compact" />

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-[#162520] transition-colors cursor-pointer"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 dark:border-[#1F332C] bg-[#FBFBF9] dark:bg-[#0A1210] px-4 pt-3 pb-6 space-y-3 animate-in fade-in slide-in-from-top-2">
          <button
            onClick={() => handleNavClick('home')}
            className={`block w-full text-left px-3 py-2 rounded-lg text-base font-medium ${
              currentView === 'home'
                ? 'bg-[#0D4739]/10 dark:bg-[#0D4739]/30 text-[#0D4739] dark:text-[#C2A26F]'
                : 'text-stone-700 dark:text-stone-300'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => handleNavClick('search')}
            className={`block w-full text-left px-3 py-2 rounded-lg text-base font-medium ${
              currentView === 'search'
                ? 'bg-[#0D4739]/10 dark:bg-[#0D4739]/30 text-[#0D4739] dark:text-[#C2A26F]'
                : 'text-stone-700 dark:text-stone-300'
            }`}
          >
            Rooms & Suites
          </button>
          <button
            onClick={() => {
              handleNavClick('dashboard');
            }}
            className={`block w-full text-left px-3 py-2 rounded-lg text-base font-medium ${
              currentView === 'dashboard'
                ? 'bg-[#0D4739]/10 dark:bg-[#0D4739]/30 text-[#0D4739] dark:text-[#C2A26F]'
                : 'text-stone-700 dark:text-stone-300'
            }`}
          >
            My Reservations ({reservationsCount})
          </button>

          {/* Theme Selector inside Mobile Menu */}
          <div className="pt-2 pb-1">
            <span className="block text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2 px-1">
              Theme Mode
            </span>
            <ThemeToggle variant="segmented" />
          </div>

          <div className="pt-3 border-t border-stone-200 dark:border-[#1F332C] flex flex-col gap-2">
            {user ? (
              <>
                <div className="flex items-center gap-3 px-3 py-2">
                  <img
                    src={getAvatarUrl(user.avatar)}
                    alt={user.fullName}
                    onError={(e) => {
                      e.currentTarget.src = NO_DP_AVATAR;
                    }}
                    className="w-10 h-10 rounded-full object-cover border border-[#0D4739]/30 bg-stone-800"
                  />
                  <div>
                    <p className="font-medium text-sm text-stone-900 dark:text-stone-100">{user.fullName}</p>
                    <p className="text-xs text-stone-500 dark:text-stone-400">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('login');
                  }}
                  className="w-full py-2.5 text-center text-sm font-medium border border-stone-300 dark:border-[#2A443B] rounded-lg text-stone-800 dark:text-stone-200"
                >
                  Log in
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('register');
                  }}
                  className="w-full py-2.5 text-center text-sm font-medium bg-[#0D4739] text-white rounded-lg shadow-sm"
                >
                  Create account
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

