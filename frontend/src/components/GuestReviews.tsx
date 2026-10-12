import React, { useState, useEffect } from 'react';
import { INITIAL_REVIEWS } from '../data/mockData';
import { Review, UserProfile } from '../types';
import { reviewApi } from '../services/api';
import { Star, Heart, ThumbsUp, MessageSquarePlus, Check, User, X, AlertCircle, BadgeCheck } from 'lucide-react';
import { ScrollReveal, StaggerContainer, StaggerItem } from './ScrollReveal';
import { getAvatarUrl, NO_DP_AVATAR } from '../utils/avatar';
import {
  getMyReviewIdsFromCookie,
  addMyReviewIdToCookie,
  getLikedReviewIdsFromCookie,
  saveLikedReviewIdsToCookie,
  getHeartedReviewIdsFromCookie,
  saveHeartedReviewIdsToCookie,
} from '../utils/cookies';
import { validateFullName } from '../utils/validation';

interface GuestReviewsProps {
  user?: UserProfile | null;
  onOpenAuth?: () => void;
}

interface ReviewWithReactions extends Review {
  likes: number;
  hearts: number;
  userReactedLike?: boolean;
  userReactedHeart?: boolean;
}

export const GuestReviews: React.FC<GuestReviewsProps> = ({ user }) => {
  const [myReviewIds, setMyReviewIds] = useState<string[]>(() => getMyReviewIdsFromCookie());
  const [reviewsList, setReviewsList] = useState<ReviewWithReactions[]>(() => {
    const likedIds = getLikedReviewIdsFromCookie();
    const heartedIds = getHeartedReviewIdsFromCookie();
    return INITIAL_REVIEWS.slice(0, 3).map((r) => ({
      ...r,
      likes: typeof r.likes === 'number' ? r.likes : 0,
      hearts: typeof r.hearts === 'number' ? r.hearts : 0,
      userReactedLike: likedIds.includes(String(r.id)),
      userReactedHeart: heartedIds.includes(String(r.id)),
    }));
  });

  // Load reviews from MySQL backend API on mount
  useEffect(() => {
    const likedIds = getLikedReviewIdsFromCookie();
    const heartedIds = getHeartedReviewIdsFromCookie();
    setMyReviewIds(getMyReviewIdsFromCookie());

    reviewApi.getAll().then((data) => {
      if (data && data.length > 0) {
        setReviewsList(
          data.map((r) => {
            const rid = String(r.id);
            return {
              ...r,
              id: rid,
              likes: typeof r.likes === 'number' ? r.likes : 0,
              hearts: typeof r.hearts === 'number' ? r.hearts : 0,
              userReactedLike: likedIds.includes(rid),
              userReactedHeart: heartedIds.includes(rid),
            };
          })
        );
      }
    });
  }, []);

  // Review Form States
  const [showForm, setShowForm] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [roomBooked, setRoomBooked] = useState('Deluxe Oceanfront');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Toggle reactions & persist to MySQL database + cookies
  const handleToggleLike = async (id: string) => {
    const target = reviewsList.find((r) => r.id === id);
    if (!target) return;
    const reacted = !target.userReactedLike;

    // Persist in browser cookie
    const currentLiked = getLikedReviewIdsFromCookie();
    const updatedLiked = reacted
      ? Array.from(new Set([...currentLiked, id]))
      : currentLiked.filter((item) => item !== id);
    saveLikedReviewIdsToCookie(updatedLiked);

    // Optimistic UI update
    setReviewsList((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              userReactedLike: reacted,
              likes: reacted ? r.likes + 1 : Math.max(0, r.likes - 1),
            }
          : r
      )
    );

    // Save to database and sync count
    const updatedFromDb = await reviewApi.toggleLike(id, reacted);
    if (updatedFromDb) {
      setReviewsList((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                likes: typeof updatedFromDb.likes === 'number' ? updatedFromDb.likes : r.likes,
                hearts: typeof updatedFromDb.hearts === 'number' ? updatedFromDb.hearts : r.hearts,
              }
            : r
        )
      );
    }
  };

  const handleToggleHeart = async (id: string) => {
    const target = reviewsList.find((r) => r.id === id);
    if (!target) return;
    const reacted = !target.userReactedHeart;

    // Persist in browser cookie
    const currentHearted = getHeartedReviewIdsFromCookie();
    const updatedHearted = reacted
      ? Array.from(new Set([...currentHearted, id]))
      : currentHearted.filter((item) => item !== id);
    saveHeartedReviewIdsToCookie(updatedHearted);

    // Optimistic UI update
    setReviewsList((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              userReactedHeart: reacted,
              hearts: reacted ? r.hearts + 1 : Math.max(0, r.hearts - 1),
            }
          : r
      )
    );

    // Save to database and sync count
    const updatedFromDb = await reviewApi.toggleHeart(id, reacted);
    if (updatedFromDb) {
      setReviewsList((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                likes: typeof updatedFromDb.likes === 'number' ? updatedFromDb.likes : r.likes,
                hearts: typeof updatedFromDb.hearts === 'number' ? updatedFromDb.hearts : r.hearts,
              }
            : r
        )
      );
    }
  };

  // Submit Feedback
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Auto-detect name if logged in, otherwise validate typed input
    const finalName = user?.fullName ? user.fullName.trim() : guestName.trim();
    if (!user) {
      const nameErr = validateFullName(finalName);
      if (nameErr) {
        setFormError(nameErr);
        return;
      }
    }
    if (!comment.trim()) {
      setFormError('Please enter your review comment.');
      return;
    }

    try {
      const saved = await reviewApi.submit({
        guestName: finalName,
        rating,
        comment: `“${comment.trim()}”`,
        roomBooked,
        avatar: user?.avatar || '',
      });

      const savedId = String(saved.id);
      const updatedMyReviews = addMyReviewIdToCookie(savedId);
      setMyReviewIds(updatedMyReviews);

      const newReview: ReviewWithReactions = {
        ...saved,
        id: savedId,
        likes: 0,
        hearts: 0,
        userReactedLike: false,
        userReactedHeart: false,
      };

      setReviewsList((prev) => [newReview, ...prev]);
    } catch {
      const fallbackId = 'rev-' + Date.now();
      const updatedMyReviews = addMyReviewIdToCookie(fallbackId);
      setMyReviewIds(updatedMyReviews);

      const newReview: ReviewWithReactions = {
        id: fallbackId,
        guestName: finalName,
        location: '',
        avatar: user?.avatar || '',
        rating,
        comment: `“${comment.trim()}”`,
        date: 'Just now',
        roomBooked,
        likes: 0,
        hearts: 0,
        userReactedLike: false,
        userReactedHeart: false,
      };
      setReviewsList((prev) => [newReview, ...prev]);
    }

    setComment('');
    setGuestName('');
    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
      setShowForm(false);
    }, 2000);
  };

  return (
    <section id="reviews-section" className="py-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
      {/* Section Title matching screenshot + Action button */}
      <ScrollReveal animation="fade-up" className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#1A1F1D] dark:text-[#F5F5F0] tracking-tight font-medium">
            What our guests say
          </h2>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            Authentic stories from guests who found rest and rejuvenation with us
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0D4739] hover:bg-[#083329] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
        >
          <MessageSquarePlus className="w-4 h-4" />
          <span>{showForm ? 'Close Form' : 'Write a Review'}</span>
        </button>
      </ScrollReveal>

      {/* Write a Review Modal / Collapsible Form */}
      {showForm && (
        <div className="mb-10 bg-white dark:bg-[#101C18] rounded-3xl p-6 sm:p-8 border border-stone-200 dark:border-[#1F332C] shadow-lg animate-in fade-in slide-in-from-top-3">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-[#1F332C] mb-6">
            <div>
              <h3 className="font-serif text-xl font-medium text-stone-900 dark:text-stone-100">
                Share Your Experience
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Tell fellow travelers about your stay at Serene Stay
              </p>
            </div>
            <button
              onClick={() => setShowForm(false)}
              className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {submitSuccess ? (
            <div className="py-8 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-[#0D4739] dark:text-emerald-400 flex items-center justify-center mx-auto mb-2">
                <Check className="w-6 h-6" />
              </div>
              <p className="font-serif text-lg font-medium text-stone-900 dark:text-stone-100">
                Thank you for your feedback!
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Your review has been published to Serene Stay.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmitReview} className="space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 rounded-xl flex items-center gap-2 text-xs text-red-700 dark:text-red-300 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{formError}</span>
                </div>
              )}

              {/* User Identity: Auto-fill if logged in, else text input */}
              {user ? (
                <div className="flex items-center gap-3 p-3 bg-[#0D4739]/5 dark:bg-[#0D4739]/20 rounded-2xl border border-[#0D4739]/15 dark:border-[#0D4739]/30">
                  <img
                    src={getAvatarUrl(user.avatar)}
                    alt={user.fullName}
                    onError={(e) => {
                      e.currentTarget.src = NO_DP_AVATAR;
                    }}
                    className="w-10 h-10 rounded-full object-cover border border-[#0D4739]/20 bg-stone-800"
                  />
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#0D4739] dark:text-[#C2A26F] block">
                      Signed in as
                    </span>
                    <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                      {user.fullName}
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                    Your Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => {
                        setGuestName(e.target.value.replace(/[0-9]/g, ''));
                        setFormError(null);
                      }}
                      placeholder="e.g. Ruwan Perera (Letters only)"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-stone-50 dark:bg-[#0A1210] border border-stone-300 dark:border-[#2A443B] rounded-xl text-sm text-stone-900 dark:text-stone-100 focus:bg-white dark:focus:bg-[#0A1210] focus:outline-none focus:ring-2 focus:ring-[#0D4739]"
                    />
                    <User className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
                  </div>
                </div>
              )}

              {/* Star Rating Selector */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                  Your Rating
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 text-stone-300 dark:text-stone-600 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= (hoverRating || rating)
                            ? 'fill-[#E68A00] text-[#E68A00]'
                            : 'text-stone-300 dark:text-stone-600'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-stone-700 dark:text-stone-300 ml-2">
                    {hoverRating || rating} / 5 Stars
                  </span>
                </div>
              </div>

              {/* Room or Stay Type */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                  Room or Stay Experience
                </label>
                <select
                  value={roomBooked}
                  onChange={(e) => setRoomBooked(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-[#0A1210] border border-stone-300 dark:border-[#2A443B] rounded-xl text-xs sm:text-sm text-stone-900 dark:text-stone-100 focus:bg-white dark:focus:bg-[#0A1210] focus:outline-none focus:ring-2 focus:ring-[#0D4739]"
                >
                  <option value="Deluxe Oceanfront">Deluxe Oceanfront</option>
                  <option value="Standard Room">Standard Room</option>
                  <option value="Presidential Ocean Suite">Presidential Ocean Suite</option>
                  <option value="Royal Coconut Grove Villa">Royal Coconut Grove Villa</option>
                  <option value="Ayurveda Spa & Dining">Ayurveda Spa & Dining</option>
                </select>
              </div>

              {/* Review Text Area */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                  Your Review / Feedback
                </label>
                <textarea
                  required
                  rows={3}
                  value={comment}
                  onChange={(e) => {
                    setComment(e.target.value);
                    setFormError(null);
                  }}
                  placeholder="Tell us what you enjoyed most about your stay at Serene Stay..."
                  className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-[#0A1210] border border-stone-300 dark:border-[#2A443B] rounded-xl text-sm text-stone-900 dark:text-stone-100 focus:bg-white dark:focus:bg-[#0A1210] focus:outline-none focus:ring-2 focus:ring-[#0D4739]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 border border-stone-300 dark:border-[#2A443B] text-stone-700 dark:text-stone-300 text-xs font-semibold rounded-xl hover:bg-stone-50 dark:hover:bg-[#172A24] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#0D4739] hover:bg-[#083329] text-white text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Post Review
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Testimonial Cards with Staggered Scroll Animation */}
      <StaggerContainer
        staggerDelay={0.16}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
      >
        {reviewsList.map((rev) => {
          const isMyReview = myReviewIds.includes(String(rev.id));
          return (
          <StaggerItem key={rev.id} animation="fade-up">
            <div
              className={`bg-white dark:bg-[#101C18] rounded-2xl p-6 sm:p-7 shadow-sm border transition-all duration-300 flex flex-col justify-between h-full transform-gpu ${
                isMyReview
                  ? 'border-[#0D4739] dark:border-[#C2A26F] ring-1 ring-[#0D4739]/20 dark:ring-[#C2A26F]/25 shadow-md'
                  : 'border-stone-200/80 dark:border-[#1F332C] hover:shadow-md'
              }`}
            >
              <div>
                {isMyReview && (
                  <div className="mb-3 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#0D4739]/10 dark:bg-[#C2A26F]/15 text-[#0D4739] dark:text-[#C2A26F] border border-[#0D4739]/25 dark:border-[#C2A26F]/30">
                      <BadgeCheck className="w-3.5 h-3.5" />
                      Your Review
                    </span>
                  </div>
                )}

                {/* Top Row: Avatar & Stars */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="shrink-0">
                    <img
                      src={getAvatarUrl(rev.avatar)}
                      alt={rev.guestName}
                      onError={(e) => {
                        e.currentTarget.src = NO_DP_AVATAR;
                      }}
                      className="w-14 h-14 rounded-full object-cover border border-stone-200 dark:border-[#1F332C] shadow-sm bg-stone-800"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* 5 Stars */}
                    <div className="flex items-center gap-1 mb-1">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-[#E68A00] text-[#E68A00]" />
                      ))}
                    </div>

                    {/* Guest Name ONLY (Address removed as requested!) */}
                    <p className="text-sm font-semibold text-[#1A1F1D] dark:text-[#F5F5F0] truncate">
                      {rev.guestName}
                    </p>
                    <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-0.5">
                      {rev.date} · {rev.roomBooked}
                    </p>
                  </div>
                </div>

                {/* Quote */}
                <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed italic mb-4">
                  {rev.comment}
                </p>
              </div>

              {/* Bottom Reactions Bar (Hearts & Helpful Likes) */}
              <div className="pt-3 border-t border-stone-100 dark:border-[#1F332C] flex items-center justify-between">
                <span className="text-[11px] text-stone-400 dark:text-stone-500">
                  Was this review helpful?
                </span>

                <div className="flex items-center gap-2">
                  {/* Heart Reaction */}
                  <button
                    type="button"
                    onClick={() => handleToggleHeart(rev.id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      rev.userReactedHeart
                        ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 scale-105'
                        : 'bg-stone-50 dark:bg-[#172A24] hover:bg-stone-100 dark:hover:bg-[#1F3830] text-stone-600 dark:text-stone-300'
                    }`}
                    title="Love this review"
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        rev.userReactedHeart ? 'fill-red-500 text-red-500' : 'text-stone-400 dark:text-stone-500'
                      }`}
                    />
                    <span className="tabular-nums">{rev.hearts}</span>
                  </button>

                  {/* Thumbs Up Reaction */}
                  <button
                    type="button"
                    onClick={() => handleToggleLike(rev.id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      rev.userReactedLike
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-[#0D4739] dark:text-emerald-300 scale-105'
                        : 'bg-stone-50 dark:bg-[#172A24] hover:bg-stone-100 dark:hover:bg-[#1F3830] text-stone-600 dark:text-stone-300'
                    }`}
                    title="Helpful review"
                  >
                    <ThumbsUp
                      className={`w-3.5 h-3.5 ${
                        rev.userReactedLike ? 'fill-[#0D4739] dark:fill-emerald-400 text-[#0D4739] dark:text-emerald-400' : 'text-stone-400 dark:text-stone-500'
                      }`}
                    />
                    <span className="tabular-nums">{rev.likes}</span>
                  </button>
                </div>
              </div>
            </div>
          </StaggerItem>
          );
        })}
      </StaggerContainer>
    </section>
  );
};

