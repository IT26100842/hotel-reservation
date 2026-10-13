import React, { useState } from 'react';
import { Booking } from '../types';
import {
  CalendarCheck,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Trash2,
  Filter,
  DollarSign,
  UserCheck,
  CreditCard,
  X,
  ShieldCheck,
  FileText,
  Loader2
} from 'lucide-react';

interface AdminBookingsProps {
  bookings: Booking[];
  onUpdateStatus: (id: string, status: string) => Promise<void>;
  onDeleteBooking: (id: string) => Promise<void>;
  onShowToast: (msg: string, type?: 'success' | 'info') => void;
  isLoading?: boolean;
}

export const AdminBookings: React.FC<AdminBookingsProps> = ({
  bookings,
  onUpdateStatus,
  onDeleteBooking,
  onShowToast,
  isLoading = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'checked_in' | 'completed' | 'cancelled'>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const filtered = bookings.filter((b) => {
    const matchStatus = statusFilter === 'all' || b.status.toLowerCase() === statusFilter;
    const matchSearch =
      b.bookingReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.guestInfo.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.guestInfo.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.room.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleStatusChange = async (booking: Booking, newStatus: string) => {
    setIsUpdating(true);
    try {
      await onUpdateStatus(booking.id, newStatus);
      if (selectedBooking && selectedBooking.id === booking.id) {
        setSelectedBooking({ ...selectedBooking, status: newStatus as any });
      }
      onShowToast(`Booking #${booking.bookingReference} status changed to ${newStatus}`);
    } catch (err: any) {
      onShowToast(`Failed to update status: ${err.message}`, 'info');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (booking: Booking) => {
    if (window.confirm(`Delete reservation #${booking.bookingReference} for ${booking.guestInfo.fullName}?`)) {
      try {
        await onDeleteBooking(booking.id);
        if (selectedBooking?.id === booking.id) setSelectedBooking(null);
        onShowToast(`Reservation #${booking.bookingReference} deleted.`);
      } catch (err: any) {
        onShowToast(`Failed to delete booking: ${err.message}`, 'info');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header controls: Search and Status tabs */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#101F1A] border border-stone-200 dark:border-[#1C2F29] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by #Ref, guest name, email, room..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-stone-50 dark:bg-[#142621] border border-stone-200 dark:border-[#223B33] rounded-xl text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: `All (${bookings.length})` },
            { id: 'confirmed', label: 'Confirmed' },
            { id: 'checked_in', label: 'Checked In' },
            { id: 'completed', label: 'Completed' },
            { id: 'cancelled', label: 'Cancelled' }
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === st.id
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#162A24]'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Bookings Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#101F1A] border border-stone-200 dark:border-[#1C2F29] shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-stone-500 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-spin mb-3" />
            <h4 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100">
              Loading Reservations...
            </h4>
            <p className="text-xs text-stone-400 mt-1">
              Fetching guest booking records and vouchers from database
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-stone-500">
            <FileText className="w-10 h-10 mx-auto text-stone-300 dark:text-stone-600 mb-2" />
            <p className="text-sm font-semibold">No reservations found matching criteria</p>
            <p className="text-xs text-stone-400 mt-1">Try relaxing filters or search term</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200 dark:border-[#1C2F29] text-stone-500 dark:text-stone-400 uppercase text-[10px] font-semibold">
                  <th className="py-3 px-3">Reference</th>
                  <th className="py-3 px-3">Guest Contact</th>
                  <th className="py-3 px-3">Room / Dates</th>
                  <th className="py-3 px-3">Guests</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Payment</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-[#1C2F29]/60">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-stone-50 dark:hover:bg-[#142621]/40 transition-colors">
                    <td className="py-3.5 px-3">
                      <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        #{b.bookingReference}
                      </span>
                      <span className="block text-[10px] text-stone-400 mt-0.5">{b.bookedAt || 'Recent'}</span>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-stone-900 dark:text-stone-100">{b.guestInfo.fullName}</div>
                      <div className="text-[11px] text-stone-500">{b.guestInfo.email}</div>
                      <div className="text-[10px] text-stone-400">{b.guestInfo.phone}</div>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-stone-800 dark:text-stone-200">{b.room.name}</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-mono text-[10px] font-bold">
                          Room #{b.roomNumber || '101'}
                        </span>
                      </div>
                      <div className="text-[11px] text-stone-500 mt-0.5">
                        {b.checkIn} &rarr; {b.checkOut}
                      </div>
                      <div className="text-[10px] text-stone-400">
                        {b.nights} night{b.nights > 1 ? 's' : ''}
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-stone-700 dark:text-stone-300">
                      <div>{b.totalGuests} Guests</div>
                      <div className="text-[10px] text-stone-400">({b.adults} Ad, {b.children} Ch)</div>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100">
                        LKR {b.totalAmount.toLocaleString()}
                      </div>
                      {b.discountAmount > 0 && (
                        <span className="text-[10px] text-emerald-600 font-medium block">
                          Saved LKR {b.discountAmount.toLocaleString()}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="text-[11px] font-medium capitalize text-stone-600 dark:text-stone-300">
                        {b.paymentMethod.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider inline-flex items-center gap-1 ${
                        b.status === 'confirmed'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : b.status === 'checked_in'
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                          : b.status === 'completed'
                          ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                          : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                      }`}>
                        {b.status === 'confirmed' && <CheckCircle2 className="w-3 h-3" />}
                        {b.status === 'cancelled' && <XCircle className="w-3 h-3" />}
                        {b.status === 'checked_in' && <UserCheck className="w-3 h-3" />}
                        <span>{b.status.replace('_', ' ')}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedBooking(b)}
                          className="px-2.5 py-1 rounded-lg border border-stone-200 dark:border-[#223B33] text-stone-700 dark:text-stone-300 hover:bg-emerald-50 dark:hover:bg-[#162A24] hover:text-emerald-600 transition-colors cursor-pointer flex items-center gap-1"
                          title="View details"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View</span>
                        </button>

                        <button
                          onClick={() => handleDelete(b)}
                          className="p-1.5 rounded-lg border border-stone-200 dark:border-[#223B33] text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          title="Delete booking"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 3. Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#101F1A] border border-stone-200 dark:border-[#1C2F29] rounded-2xl w-full max-w-2xl my-8 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-stone-200 dark:border-[#1C2F29] flex items-center justify-between bg-stone-50 dark:bg-[#142621]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Reservation Voucher
                </span>
                <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100">
                  #{selectedBooking.bookingReference}
                </h3>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Status Update Quick Bar */}
              <div className="p-4 rounded-xl bg-stone-50 dark:bg-[#142621] border border-stone-200 dark:border-[#223B33] flex flex-wrap items-center justify-between gap-3">
                <span className="font-semibold text-stone-700 dark:text-stone-300">
                  Change Status:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    disabled={isUpdating || selectedBooking.status === 'confirmed'}
                    onClick={() => handleStatusChange(selectedBooking, 'confirmed')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white font-medium hover:bg-emerald-600 transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    Confirm
                  </button>
                  <button
                    disabled={isUpdating || selectedBooking.status === 'checked_in'}
                    onClick={() => handleStatusChange(selectedBooking, 'checked_in')}
                    className="px-3 py-1.5 rounded-lg bg-blue-700 text-white font-medium hover:bg-blue-600 transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    Check In
                  </button>
                  <button
                    disabled={isUpdating || selectedBooking.status === 'completed'}
                    onClick={() => handleStatusChange(selectedBooking, 'completed')}
                    className="px-3 py-1.5 rounded-lg bg-purple-700 text-white font-medium hover:bg-purple-600 transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    Check Out / Complete
                  </button>
                  <button
                    disabled={isUpdating || selectedBooking.status === 'cancelled'}
                    onClick={() => handleStatusChange(selectedBooking, 'cancelled')}
                    className="px-3 py-1.5 rounded-lg bg-rose-700 text-white font-medium hover:bg-rose-600 transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    Cancel Booking
                  </button>
                </div>
              </div>

              {/* Guest Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-stone-200 dark:border-[#223B33]">
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400">Guest Name</span>
                  <p className="font-semibold text-stone-900 dark:text-stone-100 text-sm mt-0.5">
                    {selectedBooking.guestInfo.fullName}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400">Email Address</span>
                  <p className="font-medium text-stone-800 dark:text-stone-200 mt-0.5">
                    {selectedBooking.guestInfo.email}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400">Phone Number</span>
                  <p className="font-medium text-stone-800 dark:text-stone-200 mt-0.5">
                    {selectedBooking.guestInfo.phone}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400">NIC / Passport</span>
                  <p className="font-medium text-stone-800 dark:text-stone-200 mt-0.5">
                    {selectedBooking.guestInfo.nicPassport || 'Not specified'}
                  </p>
                </div>
              </div>

              {/* Stay & Room Specs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl border border-stone-200 dark:border-[#223B33]">
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400">Selected Room</span>
                  <p className="font-semibold text-stone-900 dark:text-stone-100 text-sm mt-0.5">
                    {selectedBooking.room.name}
                  </p>
                  <p className="text-[11px] text-stone-400">{selectedBooking.room.type} category</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400">Assigned Room Number</span>
                  <p className="font-mono font-bold text-emerald-700 dark:text-emerald-400 text-base mt-0.5">
                    Room #{selectedBooking.roomNumber || '101'}
                  </p>
                  <p className="text-[11px] text-stone-400">Allocated Physical Unit</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400">Stay Duration</span>
                  <p className="font-medium text-stone-800 dark:text-stone-200 mt-0.5">
                    {selectedBooking.checkIn} to {selectedBooking.checkOut}
                  </p>
                  <p className="text-[11px] text-stone-400">{selectedBooking.nights} nights total</p>
                </div>
              </div>

              {/* Special Requests */}
              {selectedBooking.guestInfo.specialRequests && (
                <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 text-amber-900 dark:text-amber-200">
                  <span className="text-[10px] uppercase font-bold block mb-1">Special Guest Request:</span>
                  <p className="italic">“{selectedBooking.guestInfo.specialRequests}”</p>
                </div>
              )}

              {/* Financial Breakdown */}
              <div className="p-4 rounded-xl bg-stone-50 dark:bg-[#142621] border border-stone-200 dark:border-[#223B33] space-y-2">
                <div className="flex justify-between text-stone-600 dark:text-stone-400">
                  <span>Room Subtotal ({selectedBooking.nights} nights)</span>
                  <span>LKR {selectedBooking.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-stone-600 dark:text-stone-400">
                  <span>Service Charge (10%)</span>
                  <span>LKR {selectedBooking.serviceCharge.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-stone-600 dark:text-stone-400">
                  <span>Government Tourism Taxes</span>
                  <span>LKR {selectedBooking.taxes.toLocaleString()}</span>
                </div>
                {selectedBooking.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount Applied ({selectedBooking.promoCodeApplied || 'Promo'})</span>
                    <span>- LKR {selectedBooking.discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-stone-200 dark:border-[#223B33] flex justify-between font-serif text-base font-bold text-stone-900 dark:text-stone-100">
                  <span>Total Amount Paid / Due:</span>
                  <span>LKR {selectedBooking.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-stone-200 dark:border-[#1C2F29] flex items-center justify-end">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
