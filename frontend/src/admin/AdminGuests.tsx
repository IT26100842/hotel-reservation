import React, { useState } from 'react';
import { Booking, UserProfile } from '../types';
import { Users, Search, Mail, Phone, MapPin, Calendar, DollarSign, BedDouble, Loader2 } from 'lucide-react';
import { getAvatarUrl, NO_DP_AVATAR } from '../utils/avatar';

interface AdminGuestsProps {
  users: UserProfile[];
  bookings: Booking[];
  isLoading?: boolean;
}

export const AdminGuests: React.FC<AdminGuestsProps> = ({ users, bookings, isLoading = false }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Extract all unique guests from users list + bookings guestInfo
  const allGuestsMap = new Map<string, {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    city: string;
    country: string;
    avatar: string;
    totalBookings: number;
    totalSpend: number;
    memberSince: string;
  }>();

  // Populate from registered users
  users.forEach((u) => {
    if (u.role === 'guest' || !u.role) {
      allGuestsMap.set(u.email.toLowerCase(), {
        id: u.id,
        fullName: u.fullName,
        email: u.email,
        phone: u.phone || '+94 77 123 4567',
        city: u.city || 'Colombo',
        country: u.country || 'Sri Lanka',
        avatar: getAvatarUrl(u.avatar),
        totalBookings: 0,
        totalSpend: 0,
        memberSince: u.memberSince || '2025'
      });
    }
  });

  // Calculate bookings and spend from reservations
  bookings.forEach((b) => {
    const em = b.guestInfo.email.toLowerCase();
    const existing = allGuestsMap.get(em);
    if (existing) {
      existing.totalBookings += 1;
      if (b.status !== 'cancelled') {
        existing.totalSpend += b.totalAmount;
      }
    } else {
      allGuestsMap.set(em, {
        id: 'guest-' + em,
        fullName: b.guestInfo.fullName,
        email: b.guestInfo.email,
        phone: b.guestInfo.phone || '',
        city: 'Guest Traveler',
        country: 'Sri Lanka',
        avatar: NO_DP_AVATAR,
        totalBookings: 1,
        totalSpend: b.status !== 'cancelled' ? b.totalAmount : 0,
        memberSince: b.bookedAt || '2025'
      });
    }
  });

  const guestList = Array.from(allGuestsMap.values()).filter(
    (g) =>
      g.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#101F1A] border border-stone-200 dark:border-[#1C2F29] shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search guests by name, email, phone, city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-stone-50 dark:bg-[#142621] border border-stone-200 dark:border-[#223B33] rounded-xl text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>
        <div className="text-xs text-stone-500 font-medium">
          Total Guests: <strong className="text-emerald-700 dark:text-emerald-400">{guestList.length}</strong>
        </div>
      </div>

      {/* Guest Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#101F1A] border border-stone-200 dark:border-[#1C2F29] shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-stone-500 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-spin mb-3" />
            <h4 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100">
              Loading Guest Directory...
            </h4>
            <p className="text-xs text-stone-400 mt-1">
              Retrieving registered customers and booking histories
            </p>
          </div>
        ) : guestList.length === 0 ? (
          <div className="py-12 text-center text-stone-500">
            <Users className="w-10 h-10 mx-auto text-stone-300 dark:text-stone-600 mb-2" />
            <p className="text-sm font-semibold">No guests found</p>
            <p className="text-xs text-stone-400 mt-1">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 dark:border-[#1C2F29] text-stone-500 dark:text-stone-400 uppercase text-[10px] font-semibold">
                <th className="py-3 px-3">Guest Profile</th>
                <th className="py-3 px-3">Contact</th>
                <th className="py-3 px-3">Location</th>
                <th className="py-3 px-3">Reservations</th>
                <th className="py-3 px-3">Total Spend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-[#1C2F29]/60">
              {guestList.map((g) => (
                <tr key={g.id} className="hover:bg-stone-50 dark:hover:bg-[#142621]/40 transition-colors">
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={g.avatar}
                        alt={g.fullName}
                        onError={(e) => {
                          e.currentTarget.src = NO_DP_AVATAR;
                        }}
                        className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-500/20 bg-stone-800"
                      />
                      <div>
                        <span className="font-semibold text-stone-900 dark:text-stone-100 text-sm">
                          {g.fullName}
                        </span>
                        <span className="block text-[10px] text-stone-400">
                          Since {g.memberSince}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-3 text-stone-600 dark:text-stone-300">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3 h-3 text-stone-400" />
                      <span>{g.email}</span>
                    </div>
                    {g.phone && (
                      <div className="flex items-center gap-1.5 text-[11px] text-stone-400 mt-0.5">
                        <Phone className="w-3 h-3 text-stone-400" />
                        <span>{g.phone}</span>
                      </div>
                    )}
                  </td>

                  <td className="py-3.5 px-3 text-stone-700 dark:text-stone-300">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-stone-400" />
                      <span>{g.city}, {g.country}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      {g.totalBookings} stay{g.totalBookings === 1 ? '' : 's'}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 font-serif font-bold text-stone-900 dark:text-stone-100">
                    {g.totalSpend > 0 ? `LKR ${g.totalSpend.toLocaleString()}` : '—'}
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
