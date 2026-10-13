import React from 'react';
import { Booking, Room, AdminStats, AdminTab, UserProfile } from '../types';
import {
  DollarSign,
  CalendarCheck,
  BedDouble,
  Users,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  ArrowRight,
  ShieldAlert,
  Percent,
  Sparkles,
  Loader2
} from 'lucide-react';

interface AdminOverviewProps {
  stats: AdminStats;
  bookings: Booking[];
  rooms: Room[];
  admins: UserProfile[];
  onNavigateTab: (tab: AdminTab) => void;
  onOpenAddRoom: () => void;
  onOpenAddAdmin: () => void;
  isLoading?: boolean;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  stats,
  bookings,
  rooms,
  admins,
  onNavigateTab,
  onOpenAddRoom,
  onOpenAddAdmin,
  isLoading = false
}) => {
  const recentBookings = bookings.slice(0, 5);

  const formatLKR = (num: number) => {
    return 'LKR ' + Math.round(num).toLocaleString('en-US');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Metric Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-white dark:bg-[#101F1A] border border-stone-200 dark:border-[#1C2F29] shadow-sm animate-pulse"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="h-3 w-24 bg-stone-200 dark:bg-stone-800 rounded"></div>
                <div className="w-10 h-10 rounded-xl bg-stone-200 dark:bg-stone-800"></div>
              </div>
              <div className="h-8 w-32 bg-stone-200 dark:bg-stone-800 rounded mb-2"></div>
              <div className="h-3 w-40 bg-stone-100 dark:bg-stone-900 rounded"></div>
            </div>
          ))}
        </div>

        {/* Loading Indicator */}
        <div className="p-16 rounded-2xl bg-white dark:bg-[#101F1A] border border-stone-200 dark:border-[#1C2F29] shadow-sm flex flex-col items-center justify-center text-center">
          <Loader2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-spin mb-3" />
          <h4 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100">
            Loading Operations Dashboard...
          </h4>
          <p className="text-xs text-stone-400 mt-1">
            Retrieving live occupancy metrics, room counts, and reservations
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Metric 1: Total Revenue */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#101F1A] border border-stone-200 dark:border-[#1C2F29] shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
            {formatLKR(stats.totalRevenue)}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Active transactions processed</span>
          </div>
        </div>

        {/* Metric 2: Total Reservations */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#101F1A] border border-stone-200 dark:border-[#1C2F29] shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Total Bookings
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
            {stats.totalBookings}
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{stats.confirmedBookings} confirmed</span>
            <span>·</span>
            <span className="text-rose-500">{stats.cancelledBookings} cancelled</span>
          </div>
        </div>

        {/* Metric 3: Active Rooms */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#101F1A] border border-stone-200 dark:border-[#1C2F29] shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Room Inventory
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <BedDouble className="w-5 h-5" />
            </div>
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
            {rooms.reduce((sum, r) => sum + (r.totalRooms ?? 5), 0)} Rooms
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
            <span>{rooms.reduce((sum, r) => sum + (r.availableRooms ?? (r.totalRooms ?? 5)), 0)} Vacant ({rooms.length} Categories)</span>
            <div className="w-16 h-1.5 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full"
                style={{ width: `${Math.min(100, stats.occupancyRate)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Metric 4: System Admins & Staff */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#101F1A] border border-stone-200 dark:border-[#1C2F29] shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Admins & Staff
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-800 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
            {admins.length} Staff
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
            <span>Active Admin Access</span>
            <button
              onClick={() => onNavigateTab('admins')}
              className="text-purple-600 dark:text-purple-400 font-semibold hover:underline cursor-pointer"
            >
              Manage &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* 2. Quick Action Command Center */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#0D4739] to-[#0A3329] text-white shadow-lg shadow-emerald-950/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-[#E9D8A6] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Quick Management Actions
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-bold mt-1">
              Direct Hotel Controls
            </h3>
            <p className="text-xs sm:text-sm text-stone-200 mt-0.5">
              Rapidly deploy new suites, invite administrative staff, or review reservations
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenAddRoom}
              className="px-4 py-2.5 bg-white text-[#0D4739] hover:bg-stone-100 rounded-xl text-xs font-semibold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Room</span>
            </button>

            <button
              onClick={onOpenAddAdmin}
              className="px-4 py-2.5 bg-emerald-700/80 hover:bg-emerald-600 text-white border border-emerald-500/30 rounded-xl text-xs font-semibold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Add Admin User</span>
            </button>

            <button
              onClick={() => onNavigateTab('bookings')}
              className="px-4 py-2.5 bg-emerald-800/60 hover:bg-emerald-700 text-white rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>View All Bookings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Rooms Overview Grid */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#101F1A] border border-stone-200 dark:border-[#1C2F29] shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100 dark:border-[#1C2F29]">
          <div>
            <h4 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
              Active Room Inventory ({rooms.length} Categories)
            </h4>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Current live suites & vacant room counts on Serene Stay coastal resort
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('rooms')}
            className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Full Catalog</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.slice(0, 6).map((room) => {
            const total = room.totalRooms ?? 5;
            const avail = room.availableRooms ?? total;
            return (
              <div
                key={room.id}
                className="p-3.5 rounded-xl border border-stone-200/80 dark:border-[#1E332D] hover:border-emerald-500/40 bg-stone-50/50 dark:bg-[#142621]/40 transition-all flex gap-3.5 items-center"
              >
                <img
                  src={room.images[0]}
                  alt={room.name}
                  className="w-16 h-16 rounded-xl object-cover shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 tracking-wider">
                      {room.type}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        avail > 0
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                          : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                      }`}
                    >
                      {avail}/{total} Vacant
                    </span>
                  </div>
                  <h5 className="font-serif text-sm font-semibold text-stone-900 dark:text-stone-100 truncate">
                    {room.name}
                  </h5>
                  <p className="text-xs font-medium text-stone-600 dark:text-stone-300 mt-0.5">
                    LKR {room.pricePerNight.toLocaleString()} <span className="text-[10px] text-stone-400">/ night</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Recent Bookings Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#101F1A] border border-stone-200 dark:border-[#1C2F29] shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100 dark:border-[#1C2F29]">
          <div>
            <h4 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
              Recent Reservations
            </h4>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Latest bookings booked across web and direct channels
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('bookings')}
            className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All ({bookings.length})</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {recentBookings.length === 0 ? (
          <div className="py-8 text-center text-xs text-stone-500">
            No bookings recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200 dark:border-[#1C2F29] text-stone-500 dark:text-stone-400 uppercase text-[10px] font-semibold">
                  <th className="py-2.5 px-3">Reference</th>
                  <th className="py-2.5 px-3">Guest</th>
                  <th className="py-2.5 px-3">Room & Number</th>
                  <th className="py-2.5 px-3">Dates</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-[#1C2F29]/60">
                {recentBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-stone-50 dark:hover:bg-[#142621]/50 transition-colors">
                    <td className="py-3 px-3 font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                      #{b.bookingReference}
                    </td>
                    <td className="py-3 px-3 font-medium text-stone-900 dark:text-stone-100">
                      <div>{b.guestInfo.fullName}</div>
                      <div className="text-[11px] text-stone-400">{b.guestInfo.email}</div>
                    </td>
                    <td className="py-3 px-3 text-stone-700 dark:text-stone-300">
                      <div>{b.room.name}</div>
                      <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-mono text-[10px] font-bold">
                        Room #{b.roomNumber || '101'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-stone-600 dark:text-stone-400">
                      <div>{b.checkIn} &rarr; {b.checkOut}</div>
                      <div className="text-[11px] text-stone-400">{b.nights} night{b.nights > 1 ? 's' : ''}</div>
                    </td>
                    <td className="py-3 px-3 font-serif font-bold text-stone-900 dark:text-stone-100">
                      LKR {b.totalAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider inline-flex items-center gap-1 ${
                        b.status === 'confirmed'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : b.status === 'cancelled'
                          ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                          : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                      }`}>
                        {b.status === 'confirmed' && <CheckCircle2 className="w-3 h-3" />}
                        {b.status === 'cancelled' && <XCircle className="w-3 h-3" />}
                        <span>{b.status}</span>
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onNavigateTab('bookings')}
                        className="px-2.5 py-1 rounded-lg border border-stone-200 dark:border-[#223B33] text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#1C332C] transition-colors cursor-pointer"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
