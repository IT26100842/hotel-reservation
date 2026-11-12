import React, { useState } from 'react';
import { Booking, UserProfile } from '../types';
import { Users, Search, Mail, Phone, MapPin, Calendar, DollarSign, BedDouble, Loader2, Edit2, Trash2, X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { getAvatarUrl, NO_DP_AVATAR } from '../utils/avatar';

interface AdminGuestsProps {
  users: UserProfile[];
  bookings: Booking[];
  onUpdateGuest?: (id: string, data: Partial<UserProfile>) => Promise<void>;
  onDeleteGuest?: (id: string) => Promise<void>;
  onShowToast?: (msg: string, type?: 'success' | 'info') => void;
  currentAdmin?: any;
  isLoading?: boolean;
}

export const AdminGuests: React.FC<AdminGuestsProps> = ({
  users,
  bookings,
  onUpdateGuest,
  onDeleteGuest,
  onShowToast,
  currentAdmin,
  isLoading = false
}) => {
  const isStandardAdmin = currentAdmin?.role === 'admin';
  const [searchTerm, setSearchTerm] = useState('');
  const [editingGuest, setEditingGuest] = useState<{
    id: string;
    fullName: string;
    email: string;
    phone: string;
    city: string;
    country: string;
    status?: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extract all unique guests from users list + bookings guestInfo
  const allGuestsMap = new Map<string, {
    id: string;
    userId?: string;
    fullName: string;
    email: string;
    phone: string;
    city: string;
    country: string;
    avatar: string;
    totalBookings: number;
    totalSpend: number;
    memberSince: string;
    status: string;
    isRegistered: boolean;
  }>();

  // Populate from registered users
  users.forEach((u) => {
    if (u.role === 'guest' || !u.role) {
      allGuestsMap.set(u.email.toLowerCase(), {
        id: u.id,
        userId: u.id,
        fullName: u.fullName,
        email: u.email,
        phone: u.phone || '+94 77 123 4567',
        city: u.city || 'Colombo',
        country: u.country || 'Sri Lanka',
        avatar: getAvatarUrl(u.avatar),
        totalBookings: 0,
        totalSpend: 0,
        memberSince: u.memberSince || '2025',
        status: u.status || 'active',
        isRegistered: true
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
        userId: undefined,
        fullName: b.guestInfo.fullName,
        email: b.guestInfo.email,
        phone: b.guestInfo.phone || '',
        city: 'Guest Traveler',
        country: 'Sri Lanka',
        avatar: NO_DP_AVATAR,
        totalBookings: 1,
        totalSpend: b.status !== 'cancelled' ? b.totalAmount : 0,
        memberSince: b.bookedAt || '2025',
        status: 'active',
        isRegistered: false
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

  const openEditModal = (g: any) => {
    setEditingGuest({
      id: g.userId || g.id,
      fullName: g.fullName,
      email: g.email,
      phone: g.phone || '',
      city: g.city || '',
      country: g.country || 'Sri Lanka',
      status: g.status || 'active'
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGuest) return;
    if (!editingGuest.fullName.trim()) {
      if (onShowToast) onShowToast('Guest full name is required.', 'info');
      return;
    }
    if (!editingGuest.email.trim()) {
      if (onShowToast) onShowToast('Guest email is required.', 'info');
      return;
    }

    setIsSubmitting(true);
    try {
      if (onUpdateGuest) {
        await onUpdateGuest(editingGuest.id, {
          fullName: editingGuest.fullName.trim(),
          email: editingGuest.email.trim(),
          phone: editingGuest.phone.trim(),
          city: editingGuest.city.trim(),
          country: editingGuest.country.trim(),
          status: editingGuest.status
        });
      }
      if (onShowToast) onShowToast(`Guest profile "${editingGuest.fullName}" saved!`);
      setEditingGuest(null);
    } catch (err: any) {
      if (onShowToast) onShowToast(`Failed to update guest: ${err.message}`, 'info');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (g: any) => {
    if (g.totalBookings > 0) {
      if (onShowToast) {
        onShowToast('Cannot delete guest with active or past reservation history. Click edit to suspend this account instead.', 'info');
      }
      return;
    }
    if (window.confirm(`Delete guest record for "${g.fullName}"?`)) {
      try {
        if (onDeleteGuest && g.userId) {
          await onDeleteGuest(g.userId);
          if (onShowToast) onShowToast(`Guest account "${g.fullName}" removed.`);
        } else {
          if (onShowToast) onShowToast(`Guest record removed.`);
        }
      } catch (err: any) {
        if (onShowToast) onShowToast(`Failed to delete guest: ${err.message}`, 'info');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Role notice banner */}
      {isStandardAdmin && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Standard Administrator Mode:</span> You have view-only access to guest directory profiles. Guest account editing and removal privileges are restricted to Manager and Super Administrator tiers.
          </div>
        </div>
      )}

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
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Reservations</th>
                <th className="py-3 px-3">Total Spend</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-[#1C2F29]/60">
              {guestList.map((g) => {
                const hasHistory = g.totalBookings > 0;
                return (
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
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-stone-900 dark:text-stone-100 text-sm">
                            {g.fullName}
                          </span>
                          {g.status === 'suspended' && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                              Suspended
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-stone-400">
                            Since {g.memberSince}
                          </span>
                          {g.isRegistered && (
                            <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                              Registered
                            </span>
                          )}
                        </div>
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
                    {g.status === 'suspended' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                        <AlertTriangle className="w-3 h-3 text-rose-500" />
                        <span>Suspended</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        <span>Active</span>
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      {g.totalBookings} stay{g.totalBookings === 1 ? '' : 's'}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 font-serif font-bold text-stone-900 dark:text-stone-100">
                    {g.totalSpend > 0 ? `LKR ${g.totalSpend.toLocaleString()}` : '—'}
                  </td>

                  <td className="py-3.5 px-3 text-right">
                    {isStandardAdmin ? (
                      <span className="text-[10px] text-stone-400 italic">View Only</span>
                    ) : (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(g)}
                          className="p-1.5 rounded-lg border border-stone-200 dark:border-[#223B33] text-stone-600 dark:text-stone-300 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
                          title="Edit Guest Details & Status"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          disabled={hasHistory}
                          onClick={() => handleDelete(g)}
                          className={`p-1.5 rounded-lg border border-stone-200 dark:border-[#223B33] transition-colors ${
                            hasHistory
                              ? 'opacity-30 cursor-not-allowed text-stone-400 bg-stone-100 dark:bg-stone-900/60'
                              : 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer'
                          }`}
                          title={
                            hasHistory
                              ? 'Cannot delete guest with active or past reservation history. Click edit to suspend this account instead.'
                              : 'Delete Guest Account'
                          }
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        )}
      </div>

      {/* Edit Guest Modal */}
      {editingGuest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#101F1A] border border-stone-200 dark:border-[#1C2F29] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-stone-200 dark:border-[#1C2F29] flex items-center justify-between bg-stone-50 dark:bg-[#142621]">
              <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                Edit Guest Profile
              </h3>
              <button
                onClick={() => setEditingGuest(null)}
                className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider text-[10px] mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingGuest.fullName}
                  onChange={(e) => setEditingGuest({ ...editingGuest, fullName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#142621] border border-stone-200 dark:border-[#223B33] text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider text-[10px] mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={editingGuest.email}
                  onChange={(e) => setEditingGuest({ ...editingGuest, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#142621] border border-stone-200 dark:border-[#223B33] text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider text-[10px] mb-1.5">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={editingGuest.phone}
                  onChange={(e) => setEditingGuest({ ...editingGuest, phone: e.target.value })}
                  placeholder="+94 77 123 4567"
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#142621] border border-stone-200 dark:border-[#223B33] text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider text-[10px] mb-1.5">
                    City
                  </label>
                  <input
                    type="text"
                    value={editingGuest.city}
                    onChange={(e) => setEditingGuest({ ...editingGuest, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#142621] border border-stone-200 dark:border-[#223B33] text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider text-[10px] mb-1.5">
                    Country
                  </label>
                  <input
                    type="text"
                    value={editingGuest.country}
                    onChange={(e) => setEditingGuest({ ...editingGuest, country: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#142621] border border-stone-200 dark:border-[#223B33] text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider text-[10px] mb-1.5">
                  Account Status
                </label>
                <select
                  value={editingGuest.status}
                  onChange={(e) => setEditingGuest({ ...editingGuest, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#142621] border border-stone-200 dark:border-[#223B33] text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended / Deactivated</option>
                </select>
              </div>

              <div className="pt-3 border-t border-stone-200 dark:border-[#1C2F29] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingGuest(null)}
                  className="px-4 py-2 rounded-xl border border-stone-200 dark:border-[#223B33] text-stone-600 dark:text-stone-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl font-semibold bg-emerald-700 hover:bg-emerald-600 text-white shadow-md transition-all cursor-pointer"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
