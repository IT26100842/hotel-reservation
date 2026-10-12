import React from 'react';
import { AdminTab, UserProfile } from '../types';
import { Menu, RefreshCw } from 'lucide-react';
import { getAvatarUrl, NO_DP_AVATAR } from '../utils/avatar';

interface AdminHeaderProps {
  currentTab: AdminTab;
  onOpenMobile: () => void;
  adminUser: UserProfile | null;
  onRefresh: () => void;
  isRefreshing?: boolean;
  onSelectTab?: (tab: AdminTab) => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  currentTab,
  onOpenMobile,
  adminUser,
  onRefresh,
  isRefreshing = false,
  onSelectTab
}) => {
  const titles: Record<AdminTab, { title: string; subtitle: string }> = {
    overview: {
      title: 'Operations Dashboard',
      subtitle: 'Live occupancy metrics, financial summary, and recent guest reservations'
    },
    rooms: {
      title: 'Rooms & Accommodations',
      subtitle: 'Manage hotel catalog, real-time pricing, capacity, and room availability'
    },
    bookings: {
      title: 'Reservations & Stays',
      subtitle: 'Track check-ins, guest vouchers, cancellations, and reservation statuses'
    },
    admins: {
      title: 'Administrative Staff & Access Control',
      subtitle: 'Add, update, or revoke administrator accounts and staff permissions'
    },
    guests: {
      title: 'Customer & Guest Directory',
      subtitle: 'Guest profiles, booking history, contact info, and preferences'
    },
    reviews: {
      title: 'Guest Reviews & Ratings',
      subtitle: 'Moderate verified feedback, ratings, and featured testimonials'
    },
    promos: {
      title: 'Promo Codes & Special Offers',
      subtitle: 'Create seasonal discount coupons and promotional campaigns'
    },
    profile: {
      title: 'My Administrator Profile',
      subtitle: 'Manage your profile photo, personal details, and account password'
    }
  };

  const current = titles[currentTab] || { title: 'Admin Console', subtitle: 'Serene Stay Management' };

  return (
    <header className="sticky top-0 z-20 bg-white/90 dark:bg-[#0D1815]/90 backdrop-blur-md border-b border-stone-200 dark:border-[#1C2F29] px-4 sm:px-6 lg:px-8 py-3.5 transition-colors">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle + Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobile}
            className="lg:hidden p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#162A24] cursor-pointer"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
              {current.title}
            </h2>
            <p className="hidden sm:block text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              {current.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Actions, Refresh, Status, Admin Badge */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Cloud Database Connected indicator */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[11px] font-medium text-emerald-800 dark:text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>AWS RDS MySQL Live</span>
          </div>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            title="Refresh latest data from database"
            disabled={isRefreshing}
            className="p-2 sm:px-3 sm:py-2 rounded-xl border border-stone-200 dark:border-[#1C2F29] bg-white dark:bg-[#12221D] hover:bg-stone-50 dark:hover:bg-[#182E27] text-stone-700 dark:text-stone-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sync Data</span>
          </button>

          {/* User profile capsule */}
          {adminUser && (
            <button
              type="button"
              onClick={() => onSelectTab?.('profile')}
              title="Open My Profile"
              className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-stone-200 dark:border-[#1C2F29] hover:opacity-85 transition-opacity cursor-pointer"
            >
              <img
                src={getAvatarUrl(adminUser.avatar)}
                alt={adminUser.fullName}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = NO_DP_AVATAR;
                }}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/30 bg-stone-200 dark:bg-stone-800"
              />
              <div className="hidden xl:block text-left">
                <span className="block text-xs font-semibold text-stone-800 dark:text-stone-100 leading-tight">
                  {adminUser.fullName}
                </span>
                <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                  {adminUser.role === 'super_admin' ? 'Super Admin' : 'Staff Admin'}
                </span>
              </div>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
