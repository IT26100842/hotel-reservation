import React, { useState } from 'react';
import { Review } from '../types';
import { Star, Trash2, Edit2, Search, CheckCircle2, Loader2, X, AlertCircle } from 'lucide-react';
import { getAvatarUrl, NO_DP_AVATAR } from '../utils/avatar';

interface AdminReviewsProps {
  reviews: Review[];
  onUpdateReview?: (id: string, review: Partial<Review>) => Promise<void>;
  onDeleteReview: (id: string) => Promise<void>;
  onShowToast: (msg: string, type?: 'success' | 'info') => void;
  isLoading?: boolean;
  currentAdmin?: any;
}

export const AdminReviews: React.FC<AdminReviewsProps> = ({
  reviews,
  onUpdateReview,
  onDeleteReview,
  onShowToast,
  isLoading = false,
  currentAdmin
}) => {
  const isStandardAdmin = (currentAdmin?.role || '').toLowerCase() === 'admin';
  const [searchTerm, setSearchTerm] = useState('');
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [editForm, setEditForm] = useState({
    guestName: '',
    location: '',
    rating: 5,
    comment: '',
    roomBooked: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openEditModal = (rev: Review) => {
    setEditingReview(rev);
    setEditForm({
      guestName: rev.guestName,
      location: rev.location || '',
      rating: rev.rating || 5,
      comment: rev.comment || '',
      roomBooked: rev.roomBooked || 'Deluxe Oceanfront'
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReview || !onUpdateReview) return;
    if (!editForm.guestName.trim()) {
      onShowToast('Guest name is required.', 'info');
      return;
    }
    if (!editForm.comment.trim()) {
      onShowToast('Review comment is required.', 'info');
      return;
    }

    setIsSubmitting(true);
    try {
      await onUpdateReview(editingReview.id, {
        guestName: editForm.guestName.trim(),
        location: editForm.location.trim(),
        rating: Number(editForm.rating),
        comment: editForm.comment.trim(),
        roomBooked: editForm.roomBooked.trim()
      });
      onShowToast(`Review from "${editForm.guestName}" updated!`);
      setEditingReview(null);
    } catch (err: any) {
      onShowToast(`Failed to update review: ${err.message}`, 'info');
    } finally {
      setIsSubmitting(false);
    }
  };

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
      {isStandardAdmin && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 text-amber-800 dark:text-amber-300">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-xs leading-relaxed">
            <strong>Standard Administrator Notice:</strong> You have <em>view-only</em> access to guest reviews. Editing ratings/comments or deleting reviews is restricted to Operations Managers and Super Administrators.
          </p>
        </div>
      )}

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
                  {Array.from({ length: Math.max(1, Math.min(5, Math.round(Number(rev.rating) || 5))) }).map((_, i) => (
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

              <div className="flex items-center gap-2">
                {isStandardAdmin ? (
                  <span className="text-[10px] text-stone-400 italic">View Only</span>
                ) : (
                  <>
                    <button
                      onClick={() => openEditModal(rev)}
                      className="px-2.5 py-1 text-xs text-stone-600 dark:text-stone-300 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors flex items-center gap-1 cursor-pointer border border-stone-200 dark:border-[#1C2F29]"
                      title="Edit Review"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(rev)}
                      className="px-2.5 py-1 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors flex items-center gap-1 cursor-pointer border border-stone-200 dark:border-[#1C2F29]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Edit Review Modal */}
      {editingReview && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#101F1A] border border-stone-200 dark:border-[#1C2F29] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-stone-200 dark:border-[#1C2F29] flex items-center justify-between bg-stone-50 dark:bg-[#142621]">
              <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                Edit Guest Review
              </h3>
              <button
                onClick={() => setEditingReview(null)}
                className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider text-[10px] mb-1.5">
                  Guest Name *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.guestName}
                  onChange={(e) => setEditForm({ ...editForm, guestName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#142621] border border-stone-200 dark:border-[#223B33] text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider text-[10px] mb-1.5">
                    Location
                  </label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    placeholder="e.g. Colombo, Sri Lanka"
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#142621] border border-stone-200 dark:border-[#223B33] text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider text-[10px] mb-1.5">
                    Rating (Stars)
                  </label>
                  <select
                    value={editForm.rating}
                    onChange={(e) => setEditForm({ ...editForm, rating: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#142621] border border-stone-200 dark:border-[#223B33] text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>{n} Stars</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider text-[10px] mb-1.5">
                  Room or Stay Experience
                </label>
                <input
                  type="text"
                  value={editForm.roomBooked}
                  onChange={(e) => setEditForm({ ...editForm, roomBooked: e.target.value })}
                  placeholder="e.g. Deluxe Oceanfront"
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#142621] border border-stone-200 dark:border-[#223B33] text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider text-[10px] mb-1.5">
                  Review Comment *
                </label>
                <textarea
                  rows={4}
                  required
                  value={editForm.comment}
                  onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#142621] border border-stone-200 dark:border-[#223B33] text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 dark:border-[#1C2F29] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingReview(null)}
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
