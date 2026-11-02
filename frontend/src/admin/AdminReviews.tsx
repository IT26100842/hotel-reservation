import React, { useState } from 'react';
import { Review } from '../types';
import { Star, Trash2, Search, CheckCircle2, Loader2 } from 'lucide-react';
import { getAvatarUrl, NO_DP_AVATAR } from '../utils/avatar';

interface AdminReviewsProps {
  reviews: Review[];
  onDeleteReview: (id: string) => Promise<void>;
  onShowToast: (msg: string, type?: 'success' | 'info') => void;
  isLoading?: boolean;
}

export const AdminReviews: React.FC<AdminReviewsProps> = ({
  reviews,
  onDeleteReview,
  onShowToast,
  isLoading = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleDelete = async (rev: Review) => {
    if (window.confirm(`Delete review from "${rev.guestName}"?`)) {
      try {
        await onDeleteReview(rev.id);
        onShowToast('Review removed.');
      } catch (err: any) {
        onShowToast(`Failed to delete review: ${err.message}`, 'info');
      }
    }
  };

  const filtered = reviews.filter(
    (r) =>
      r.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.roomBooked.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(2)
    : '5.0';

  return (
    <div className="space-y-6">
      {/* Top Controls & Average Score */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#101F1A] border border-stone-200 dark:border-[#1C2F29] shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search reviews by guest, room, comment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-stone-50 dark:bg-[#142621] border border-stone-200 dark:border-[#223B33] rounded-xl text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span className="font-bold">{avgRating}</span>
            <span className="text-[11px] text-amber-700 dark:text-amber-400">({reviews.length} Total Reviews)</span>
          </div>
        </div>
      </div>

      {/* Reviews Grid / Loading / Empty */}
      {isLoading ? (
        <div className="p-16 rounded-2xl bg-white dark:bg-[#101F1A] border border-stone-200 dark:border-[#1C2F29] shadow-sm flex flex-col items-center justify-center text-center">
          <Loader2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-spin mb-3" />
          <h4 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100">
            Loading Guest Reviews...
          </h4>
          <p className="text-xs text-stone-400 mt-1">
            Retrieving verified guest feedback and ratings from database
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-16 rounded-2xl bg-white dark:bg-[#101F1A] border border-stone-200 dark:border-[#1C2F29] shadow-sm flex flex-col items-center justify-center text-center">
          <Star className="w-8 h-8 text-stone-300 dark:text-stone-600 mb-2" />
          <p className="text-sm font-semibold text-stone-700 dark:text-stone-300">No reviews found</p>
          <p className="text-xs text-stone-400 mt-1">Guest reviews will appear here once submitted</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((rev) => (
          <div
            key={rev.id}
            className="p-5 rounded-2xl bg-white dark:bg-[#101F1A] border border-stone-200 dark:border-[#1C2F29] shadow-sm flex flex-col justify-between"
          >
            <div>
              {/* Header: Guest info + Star rating */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <img
                    src={getAvatarUrl(rev.avatar)}
                    alt={rev.guestName}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = NO_DP_AVATAR;
                    }}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/20 bg-stone-200 dark:bg-stone-800"
                  />
                  <div>
                    <h5 className="font-semibold text-stone-900 dark:text-stone-100 text-sm">
                      {rev.guestName}
                    </h5>
                    <p className="text-[11px] text-stone-400">
                      {rev.location || 'Verified Guest'} · {rev.date}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: Math.round(rev.rating) }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                  ))}
                </div>
              </div>

              {/* Room badge */}
              <div className="mb-2.5">
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-stone-100 dark:bg-[#162A24] text-stone-600 dark:text-stone-300">
                  Room: {rev.roomBooked}
                </span>
              </div>

              {/* Comment text */}
              <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed italic">
                {rev.comment}
              </p>
            </div>

            {/* Bottom Row: Actions */}
            <div className="mt-4 pt-3 border-t border-stone-100 dark:border-[#1C2F29] flex items-center justify-between text-xs">
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Live on Public Site</span>
              </span>

              <button
                onClick={() => handleDelete(rev)}
                className="px-2.5 py-1 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
};
