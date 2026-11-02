import React from 'react';
import { AdminTab, UserProfile } from '../types';
import {
  LayoutDashboard,
  BedDouble,
  CalendarCheck,
  ShieldAlert,
  Users,
  MessageSquare,
  TicketPercent,
  UserCog,
  ExternalLink,
  LogOut,
  Moon,
  Sun,
  Hotel
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { getAvatarUrl, NO_DP_AVATAR } from '../utils/avatar';

interface AdminSidebarProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  adminUser: UserProfile | null;
  onLogout: () => void;
  onGoToSite: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentTab,
  onSelectTab,
  adminUser,
  onLogout,
  onGoToSite,
  mobileOpen,
  onCloseMobile
}) => {
  const { theme, toggleTheme } = useTheme();

  const menuItems: { id: AdminTab; label: string; icon: React.FC<{ className?: string }>; badge?: string }[] = [
    { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'rooms', label: 'Rooms & Suites', icon: BedDouble },
    { id: 'bookings', label: 'Reservations', icon: CalendarCheck },
    { id: 'admins', label: 'Admin & Staff', icon: ShieldAlert, badge: 'Role Access' },
    { id: 'guests', label: 'Guest Directory', icon: Users },
    { id: 'reviews', label: 'Reviews Moderation', icon: MessageSquare },
    { id: 'promos', label: 'Promo Discounts', icon: TicketPercent },
    { id: 'profile', label: 'My Profile', icon: UserCog, badge: 'Account' }
  ];

  const handleTabClick = (tab: AdminTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  const content = (
    <div className="flex flex-col h-full bg-[#0D1815] text-stone-200 border-r border-[#1C2F29]">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#1C2F29] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10B981] to-[#0D4739] flex items-center justify-center text-white shadow-lg shadow-emerald-950/40">
            <Hotel className="w-5 h-5 text-emerald-200" />
          </div>
          <div>
            <h1 className="font-serif text-lg font-bold tracking-wide text-stone-100 flex items-center gap-1.5">
              Serene Stay
            </h1>
            <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-semibold px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/60">
              Admin Console
            </span>
          </div>
        </div>
      </div>

      {/* Admin User Chip */}
      {adminUser && (
        <button
          type="button"
          onClick={() => handleTabClick('profile')}
          title="Open My Profile"
          className="px-4 py-3 mx-3 my-3 rounded-xl bg-[#142621] hover:bg-[#193029] border border-[#203D34] flex items-center gap-3 text-left transition-colors cursor-pointer"
        >
          <img
            src={getAvatarUrl(adminUser.avatar)}
            alt={adminUser.fullName}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = NO_DP_AVATAR;
            }}
            className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-500/40 bg-stone-800"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-stone-100 truncate">{adminUser.fullName}</p>
            <span className="inline-block text-[10px] font-medium text-emerald-400 capitalize">
              {adminUser.role === 'super_admin' ? 'Super Administrator' : adminUser.role || 'Administrator'}
            </span>
          </div>
        </button>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-stone-500 mb-2">
          Management
        </p>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md shadow-emerald-950/50 font-semibold'
                  : 'text-stone-300 hover:text-white hover:bg-[#152722]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-stone-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                  isActive ? 'bg-white/20 text-white' : 'bg-emerald-900/40 text-emerald-300 border border-emerald-700/40'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Controls */}
      <div className="p-4 border-t border-[#1C2F29] space-y-2">
        {/* Switch to Client Site */}
        <a
          href="./"
          target="_blank"
          className="w-full flex items-center justify-between px-3 py-2 text-xs text-stone-300 hover:text-white hover:bg-[#152722] rounded-xl transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <ExternalLink className="w-4 h-4 text-emerald-400" />
            <span>View Public Site</span>
          </div>
          <span className="text-[10px] text-stone-500">/</span>
        </a>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-3 py-2 text-xs text-stone-300 hover:text-white hover:bg-[#152722] rounded-xl transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-blue-400" />
            )}
            <span>Theme Mode</span>
          </div>
          <span className="text-[10px] text-stone-400 uppercase font-mono">{theme}</span>
        </button>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-300 hover:text-white hover:bg-rose-950/60 rounded-xl transition-colors cursor-pointer border border-rose-900/30"
        >
          <LogOut className="w-4 h-4 text-rose-400" />
          <span>Sign Out Admin</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 left-0 z-30 shadow-xl">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[80vw] h-full z-10 shadow-2xl">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
