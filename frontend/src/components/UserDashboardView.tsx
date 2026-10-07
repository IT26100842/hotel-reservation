import React, { useState, useRef } from 'react';
import { Booking, UserProfile, Room } from '../types';
import { ImageWithFallback } from './ImageWithFallback';
import {
  Calendar,
  Clock,
  MapPin,
  XCircle,
  AlertTriangle,
  User,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Edit3,
  Save,
  Heart,
  ChevronRight,
  Receipt,
  Star,
  MessageSquare,
  Sparkles,
  X,
  Camera,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { ScrollReveal, StaggerContainer, StaggerItem } from './ScrollReveal';

interface UserDashboardViewProps {
  user: UserProfile;
  bookings: Booking[];
  rooms: Room[];
  onCancelBooking: (bookingId: string, reason: string) => void;
  onUpdateProfile: (updatedProfile: Partial<UserProfile>) => void;
  onSelectRoom: (room: Room) => void;
  onExploreRooms: () => void;
  onRateBooking?: (bookingId: string, rating: number, comment?: string) => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80'
];

export const UserDashboardView: React.FC<UserDashboardViewProps> = ({
  user,
  bookings,
  rooms,
  onCancelBooking,
  onUpdateProfile,
  onSelectRoom,
  onExploreRooms,
  onRateBooking
}) => {
  const [activeTab, setActiveTab] = useState<'active' | 'history' | 'profile' | 'saved'>('active');

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    city: user.city,
    country: user.country,
    preferredCurrency: user.preferredCurrency
  });
  const [profileSuccessMsg, setProfileSuccessMsg] = useState(false);

  // Avatar Edit & Upload State
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarDraft, setAvatarDraft] = useState(user.avatar);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cancellation Modal State
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);
  const [cancellationReason, setCancellationReason] = useState('Change of travel plans');

  // Rating Modal State
  const [ratingBooking, setRatingBooking] = useState<Booking | null>(null);
  const [selectedStars, setSelectedStars] = useState(5);
  const [hoverStars, setHoverStars] = useState(0);
  const [ratingComment, setRatingComment] = useState('');

  const activeBookings = bookings.filter((b) => b.status === 'confirmed');
  const pastBookings = bookings.filter((b) => b.status === 'completed' || b.status === 'cancelled');
  const savedRooms = rooms.filter((r) => user.savedRoomIds.includes(r.id));

  // Handle local file upload (images from computer/phone)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const dataUrl = event.target.result as string;
          setAvatarDraft(dataUrl);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAvatar = () => {
    onUpdateProfile({ avatar: avatarDraft });
    setShowAvatarModal(false);
    setProfileSuccessMsg(true);
    setTimeout(() => setProfileSuccessMsg(false), 3000);
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
    setIsEditingProfile(false);
    setProfileSuccessMsg(true);
    setTimeout(() => setProfileSuccessMsg(false), 3000);
  };

  const confirmCancellation = () => {
    if (cancellingBooking) {
      onCancelBooking(cancellingBooking.id, cancellationReason);
      setCancellingBooking(null);
    }
  };

  const handleOpenRating = (bk: Booking, defaultRating = 5) => {
    setRatingBooking(bk);
    setSelectedStars(defaultRating);
    setHoverStars(0);
    setRatingComment('');
  };

  const submitRating = (e: React.FormEvent) => {
    e.preventDefault();
    if (ratingBooking && onRateBooking) {
      onRateBooking(ratingBooking.id, selectedStars, ratingComment);
      setRatingBooking(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBF9] dark:bg-[#0A1210] py-6 sm:py-12 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto transition-colors duration-300 w-full overflow-hidden">
      {/* Hidden file input for uploading profile photo */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Header Profile Summary */}
      <ScrollReveal animation="fade-up">
        <div className="bg-white dark:bg-[#101C18] rounded-3xl p-4 sm:p-6 md:p-8 border border-stone-200 dark:border-[#1F332C] shadow-sm mb-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-5 sm:gap-6 w-full max-w-full overflow-hidden">
          <div className="flex items-center gap-4 sm:gap-6 text-center sm:text-left flex-col sm:flex-row w-full md:w-auto min-w-0 max-w-full justify-center sm:justify-start">
            
            {/* Avatar with Edit Camera Badge */}
            <div
              onClick={() => {
                setAvatarDraft(user.avatar);
                setShowAvatarModal(true);
              }}
              className="relative group cursor-pointer shrink-0"
              title="Click to change profile photo"
            >
              <img
                src={user.avatar}
                alt={user.fullName}
                className="w-18 h-18 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-[#0D4739]/30 dark:border-[#C2A26F]/40 shadow-md group-hover:brightness-95 transition-all"
              />
              <div className="absolute inset-0 rounded-full bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-medium">
                Change
              </div>
              <button
                type="button"
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#0D4739] text-white flex items-center justify-center shadow-md hover:bg-[#083329] transition-transform hover:scale-110 cursor-pointer"
                title="Change Profile Photo"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="min-w-0 max-w-full overflow-hidden">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h1 className="font-serif text-2xl sm:text-3xl font-medium text-stone-900 dark:text-stone-100 truncate max-w-full">
                  {user.fullName}
                </h1>
                <span className="text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full shrink-0">
                  Serene Member
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1 break-all sm:break-words max-w-full">
                {user.email} · {user.phone} · {user.city}, {user.country}
              </p>
              <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">
                Member since {user.memberSince}
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="w-full md:w-auto grid grid-cols-3 divide-x divide-stone-200 dark:divide-[#1F332C] bg-stone-50/80 dark:bg-[#0D1815] md:bg-transparent md:dark:bg-transparent rounded-2xl py-3 px-1 sm:px-3 md:py-0 md:px-0 md:border-l md:border-stone-100 md:dark:border-[#1F332C] md:pl-6 text-center max-w-full min-w-0">
            <div className="px-1 sm:px-3 min-w-0 flex flex-col items-center justify-center">
              <span className="font-serif text-lg sm:text-2xl font-bold text-[#0D4739] dark:text-[#C2A26F] block tabular-nums">
                {activeBookings.length}
              </span>
              <span className="text-[10px] sm:text-xs text-stone-500 dark:text-stone-400 block leading-tight mt-0.5 text-center break-words max-w-full">
                Active Bookings
              </span>
            </div>
            <div className="px-1 sm:px-3 min-w-0 flex flex-col items-center justify-center">
              <span className="font-serif text-lg sm:text-2xl font-bold text-stone-900 dark:text-stone-100 block tabular-nums">
                {pastBookings.length}
              </span>
              <span className="text-[10px] sm:text-xs text-stone-500 dark:text-stone-400 block leading-tight mt-0.5 text-center break-words max-w-full">
                Past & Completed
              </span>
            </div>
            <div className="px-1 sm:px-3 min-w-0 flex flex-col items-center justify-center">
              <span className="font-serif text-lg sm:text-2xl font-bold text-stone-900 dark:text-stone-100 block tabular-nums">
                {savedRooms.length}
              </span>
              <span className="text-[10px] sm:text-xs text-stone-500 dark:text-stone-400 block leading-tight mt-0.5 text-center break-words max-w-full">
                Saved Rooms
              </span>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Tabs Bar */}
      <ScrollReveal animation="fade-up">
        <div className="flex items-center gap-2 border-b border-stone-200 dark:border-[#1F332C] pb-px mb-8 overflow-x-auto">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'active'
              ? 'border-[#0D4739] dark:border-[#C2A26F] text-[#0D4739] dark:text-[#C2A26F] font-semibold'
              : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          Active Reservations ({activeBookings.length})
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'history'
              ? 'border-[#0D4739] dark:border-[#C2A26F] text-[#0D4739] dark:text-[#C2A26F] font-semibold'
              : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          Booking History ({pastBookings.length})
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'saved'
              ? 'border-[#0D4739] dark:border-[#C2A26F] text-[#0D4739] dark:text-[#C2A26F] font-semibold'
              : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          Saved Sanctuaries ({savedRooms.length})
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'profile'
              ? 'border-[#0D4739] dark:border-[#C2A26F] text-[#0D4739] dark:text-[#C2A26F] font-semibold'
              : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          Edit Profile
        </button>
      </div>
      </ScrollReveal>

      {/* Tab 1: Active Reservations */}
      {activeTab === 'active' && (
        <div className="space-y-6">
          {activeBookings.length === 0 ? (
            <div className="bg-white dark:bg-[#101C18] rounded-3xl p-12 text-center border border-stone-200 dark:border-[#1F332C] shadow-sm max-w-lg mx-auto">
              <Calendar className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
              <h3 className="font-serif text-2xl font-medium text-stone-900 dark:text-stone-100 mb-2">
                No active reservations
              </h3>
              <p className="text-sm text-stone-500 dark:text-stone-400 mb-6">
                You do not currently have any upcoming stays scheduled at Serene Stay.
              </p>
              <button
                onClick={onExploreRooms}
                className="px-6 py-3 bg-[#0D4739] text-white rounded-xl text-sm font-medium hover:bg-[#083329] transition-all cursor-pointer"
              >
                Browse & Reserve Rooms
              </button>
            </div>
          ) : (
            activeBookings.map((bk) => (
              <ScrollReveal key={bk.id} animation="fade-up">
              <div
                className="bg-white dark:bg-[#101C18] rounded-3xl border border-stone-200 dark:border-[#1F332C] shadow-sm overflow-hidden flex flex-col md:flex-row"
              >
                {/* Room Image */}
                <div className="md:w-4/12 relative aspect-[16/10] md:aspect-auto">
                  <ImageWithFallback
                    src={bk.room.images[0]}
                    alt={bk.room.name}
                    fallbackTitle={bk.room.name}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-3 left-3 bg-[#0D4739] text-white text-[11px] font-semibold px-2.5 py-1 rounded-md shadow-sm">
                    Confirmed
                  </span>
                </div>

                {/* Details */}
                <div className="md:w-8/12 p-6 sm:p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-center justify-between pb-3 border-b border-stone-100 dark:border-[#1F332C] gap-2">
                      <div>
                        <span className="text-[11px] uppercase tracking-wider text-stone-400 dark:text-stone-500 font-medium">
                          Reference
                        </span>
                        <p className="font-mono font-bold text-base text-[#0D4739] dark:text-[#C2A26F]">
                          {bk.bookingReference}
                        </p>
                      </div>
                      <span className="text-xs text-stone-500 dark:text-stone-400">
                        Booked on {bk.bookedAt}
                      </span>
                    </div>

                    <div className="mt-4">
                      <h3 className="font-serif text-2xl font-medium text-stone-900 dark:text-stone-100">
                        {bk.room.name}
                      </h3>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                        {bk.room.location} · {bk.room.view}
                      </p>
                    </div>

                    {/* Dates & Guests Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 p-4 bg-[#F8F8F5] dark:bg-[#12201C] rounded-2xl text-xs border border-stone-100 dark:border-[#1F332C]">
                      <div>
                        <span className="text-stone-400 dark:text-stone-500 block font-medium">Check-in</span>
                        <span className="font-semibold text-stone-900 dark:text-stone-100">{bk.checkIn}</span>
                      </div>
                      <div>
                        <span className="text-stone-400 dark:text-stone-500 block font-medium">Check-out</span>
                        <span className="font-semibold text-stone-900 dark:text-stone-100">{bk.checkOut}</span>
                      </div>
                      <div>
                        <span className="text-stone-400 dark:text-stone-500 block font-medium">Duration</span>
                        <span className="font-semibold text-stone-900 dark:text-stone-100">{bk.nights} Nights</span>
                      </div>
                      <div>
                        <span className="text-stone-400 dark:text-stone-500 block font-medium">Guests</span>
                        <span className="font-semibold text-stone-900 dark:text-stone-100">{bk.totalGuests} Guests</span>
                      </div>
                    </div>

                    {bk.guestInfo.specialRequests && (
                      <p className="text-xs text-stone-600 dark:text-stone-300 mt-3 italic">
                        <strong>Special Request:</strong> "{bk.guestInfo.specialRequests}"
                      </p>
                    )}
                  </div>

                  {/* Actions & Price */}
                  <div className="mt-6 pt-4 border-t border-stone-100 dark:border-[#1F332C] flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <span className="text-xs text-stone-400 dark:text-stone-500 block">Total Amount</span>
                      <span className="font-serif text-xl font-bold text-[#0D4739] dark:text-[#C2A26F] tabular-nums">
                        LKR {bk.totalAmount.toLocaleString()}
                      </span>
                      <span className="text-[11px] text-stone-500 dark:text-stone-400 ml-1">
                        ({bk.paymentMethod === 'payhere' ? 'PayHere Gateway' : bk.paymentMethod === 'pay_at_hotel' ? 'Pay at Hotel' : 'Card'})
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setCancellingBooking(bk)}
                        className="px-4 py-2 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Cancel Booking</span>
                      </button>
                      <button
                        onClick={() => onSelectRoom(bk.room)}
                        className="px-4 py-2 bg-stone-900 dark:bg-stone-200 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                      >
                        Room Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              </ScrollReveal>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Booking History */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {pastBookings.length === 0 ? (
            <div className="bg-white dark:bg-[#101C18] rounded-3xl p-10 text-center border border-stone-200 dark:border-[#1F332C]">
              <p className="text-sm text-stone-500 dark:text-stone-400">No past or cancelled bookings.</p>
            </div>
          ) : (
            pastBookings.map((bk) => (
              <ScrollReveal key={bk.id} animation="fade-up">
              <div
                className="bg-white dark:bg-[#101C18] rounded-2xl p-6 border border-stone-200 dark:border-[#1F332C] shadow-2xs flex flex-col gap-4 overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-14 rounded-xl overflow-hidden shrink-0 bg-stone-100 dark:bg-stone-800">
                      <ImageWithFallback
                        src={bk.room.images[0]}
                        alt={bk.room.name}
                        fallbackTitle={bk.room.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-serif font-medium text-lg text-stone-900 dark:text-stone-100">
                          {bk.room.name}
                        </h4>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            bk.status === 'completed'
                              ? 'bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300'
                              : 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                          }`}
                        >
                          {bk.status === 'completed' ? 'Stay Completed' : 'Cancelled'}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                        Ref: {bk.bookingReference} · {bk.checkIn} to {bk.checkOut} ({bk.nights} nights)
                      </p>
                      {bk.cancellationReason && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                          Reason: {bk.cancellationReason}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <span className="font-serif font-medium text-base text-stone-900 dark:text-stone-100 tabular-nums block">
                      LKR {bk.totalAmount.toLocaleString()}
                    </span>
                    <button
                      onClick={() => onSelectRoom(bk.room)}
                      className="text-xs text-[#0D4739] dark:text-[#C2A26F] hover:underline font-semibold mt-1 cursor-pointer"
                    >
                      Book Again →
                    </button>
                  </div>
                </div>

                {/* Rating Prompt / Status for Completed Stays */}
                {bk.status === 'completed' && (
                  bk.userRating ? (
                    /* ALREADY RATED: Do NOT ask again! Show rating and badge */
                    <div className="pt-3 border-t border-stone-100 dark:border-[#1F332C] flex flex-wrap items-center justify-between gap-2 bg-emerald-50/50 dark:bg-emerald-950/20 -mx-6 -mb-6 p-4 rounded-b-2xl border-t border-emerald-100 dark:border-emerald-900/30">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-4 h-4 ${
                                s <= bk.userRating!
                                  ? 'fill-amber-500 text-amber-500'
                                  : 'text-stone-300 dark:text-stone-600'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs font-semibold text-emerald-950 dark:text-emerald-200">
                          You rated this stay {bk.userRating}/5 Stars
                        </span>
                        {bk.userReviewComment && (
                          <span className="text-xs text-stone-600 dark:text-stone-400 italic hidden md:inline">
                            · "{bk.userReviewComment}"
                          </span>
                        )}
                      </div>

                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Rating Submitted
                      </span>
                    </div>
                  ) : (
                    /* NOT RATED YET: Ask for rating! */
                    <div className="pt-3 border-t border-stone-100 dark:border-[#1F332C] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF8F2] dark:bg-[#16241F] -mx-6 -mb-6 p-4 rounded-b-2xl border-t border-amber-200/60 dark:border-amber-900/40">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                          <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                            How was your stay in {bk.room.name}?
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-0.5">
                          Rate your room and hospitality experience to help us improve.
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => handleOpenRating(bk, star)}
                              className="p-1 hover:scale-125 transition-transform cursor-pointer text-stone-300 dark:text-stone-600 hover:text-amber-500"
                              title={`Rate ${star} Stars`}
                            >
                              <Star className="w-5 h-5 fill-current" />
                            </button>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleOpenRating(bk, 5)}
                          className="px-3 py-1.5 bg-[#0D4739] hover:bg-[#083329] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer whitespace-nowrap"
                        >
                          Rate Stay
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
              </ScrollReveal>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Saved Rooms */}
      {activeTab === 'saved' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedRooms.length === 0 ? (
            <div className="col-span-full bg-white dark:bg-[#101C18] rounded-3xl p-10 text-center border border-stone-200 dark:border-[#1F332C]">
              <Heart className="w-10 h-10 text-stone-300 dark:text-stone-600 mx-auto mb-2" />
              <p className="text-stone-700 dark:text-stone-300 font-medium">No saved rooms yet</p>
              <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">
                Click the heart icon on any room to bookmark your dream retreat.
              </p>
            </div>
          ) : (
            savedRooms.map((room) => (
              <ScrollReveal key={room.id} animation="fade-up">
              <div
                onClick={() => onSelectRoom(room)}
                className="bg-white dark:bg-[#101C18] rounded-2xl overflow-hidden border border-stone-200 dark:border-[#1F332C] shadow-sm hover:shadow-md transition-shadow cursor-pointer group h-full flex flex-col justify-between"
              >
                <div>
                <div className="aspect-[16/10] overflow-hidden relative">
                  <ImageWithFallback
                    src={room.images[0]}
                    alt={room.name}
                    fallbackTitle={room.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 dark:bg-black/80 p-1.5 rounded-full text-red-500 shadow-sm">
                    <Heart className="w-4 h-4 fill-red-500" />
                  </div>
                </div>
                <div className="p-5">
                  <h4 className="font-serif text-lg font-medium text-stone-900 dark:text-stone-100 group-hover:text-[#0D4739] dark:group-hover:text-[#C2A26F] transition-colors">
                    {room.name}
                  </h4>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">{room.beds} · {room.view}</p>
                  <div className="mt-3 pt-3 border-t border-stone-100 dark:border-[#1F332C] flex items-center justify-between">
                    <span className="font-serif font-bold text-stone-900 dark:text-stone-100 tabular-nums">
                      LKR {room.pricePerNight.toLocaleString()} / night
                    </span>
                    <span className="text-xs text-[#0D4739] dark:text-[#C2A26F] font-medium flex items-center gap-1">
                      View <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
                </div>
              </div>
              </ScrollReveal>
            ))
          )}
        </div>
      )}

      {/* Tab 4: Profile Settings */}
      {activeTab === 'profile' && (
        <ScrollReveal animation="fade-up">
        <div className="bg-white dark:bg-[#101C18] rounded-3xl p-6 sm:p-10 border border-stone-200 dark:border-[#1F332C] shadow-sm max-w-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-[#1F332C] mb-6">
            <div>
              <h3 className="font-serif text-2xl font-medium text-stone-900 dark:text-stone-100">
                Personal Profile
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Manage your contact details and reservation preferences
              </p>
            </div>
            {profileSuccessMsg && (
              <span className="text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/50 px-3 py-1 rounded-full flex items-center gap-1 font-semibold animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5" /> Profile Updated!
              </span>
            )}
          </div>

          {/* Profile Avatar Quick Editor */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-stone-50/80 dark:bg-[#12201C] rounded-2xl border border-stone-200/80 dark:border-[#1F332C] mb-6">
            <div className="relative group shrink-0">
              <img
                src={user.avatar}
                alt={user.fullName}
                className="w-16 h-16 rounded-full object-cover border-2 border-[#0D4739]/30 dark:border-[#C2A26F]/40 shadow-sm"
              />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h4 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                Profile Photo
              </h4>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Upload a picture from your device, paste a link, or pick an avatar preset.
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 bg-[#0D4739] hover:bg-[#083329] text-white text-xs font-semibold rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Image</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAvatarDraft(user.avatar);
                    setShowAvatarModal(true);
                  }}
                  className="px-3.5 py-1.5 bg-white dark:bg-[#172A24] border border-stone-300 dark:border-[#1F332C] hover:bg-stone-50 dark:hover:bg-[#1E362F] text-stone-700 dark:text-stone-200 text-xs font-semibold rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
                  <span>Choose Presets</span>
                </button>
              </div>
            </div>
          </div>

          <form onSubmit={handleProfileSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-[#172A24]/40 border border-stone-300 dark:border-[#1F332C] rounded-xl text-sm text-stone-900 dark:text-stone-100 focus:bg-white dark:focus:bg-[#12201C] focus:outline-none focus:ring-2 focus:ring-[#0D4739] dark:focus:ring-[#C2A26F]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-[#172A24]/40 border border-stone-300 dark:border-[#1F332C] rounded-xl text-sm text-stone-900 dark:text-stone-100 focus:bg-white dark:focus:bg-[#12201C] focus:outline-none focus:ring-2 focus:ring-[#0D4739] dark:focus:ring-[#C2A26F]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-[#172A24]/40 border border-stone-300 dark:border-[#1F332C] rounded-xl text-sm text-stone-900 dark:text-stone-100 focus:bg-white dark:focus:bg-[#12201C] focus:outline-none focus:ring-2 focus:ring-[#0D4739] dark:focus:ring-[#C2A26F]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-[#172A24]/40 border border-stone-300 dark:border-[#1F332C] rounded-xl text-sm text-stone-900 dark:text-stone-100 focus:bg-white dark:focus:bg-[#12201C] focus:outline-none focus:ring-2 focus:ring-[#0D4739] dark:focus:ring-[#C2A26F]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                  Country
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-[#172A24]/40 border border-stone-300 dark:border-[#1F332C] rounded-xl text-sm text-stone-900 dark:text-stone-100 focus:bg-white dark:focus:bg-[#12201C] focus:outline-none focus:ring-2 focus:ring-[#0D4739] dark:focus:ring-[#C2A26F]"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3">
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#0D4739] hover:bg-[#083329] text-white text-sm font-semibold rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </div>
        </ScrollReveal>
      )}

      {/* Cancellation Confirmation Dialog */}
      {cancellingBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#101C18] rounded-3xl p-5 sm:p-7 max-w-md w-full shadow-2xl border border-stone-200 dark:border-[#1F332C] relative animate-in fade-in zoom-in-95 my-auto max-h-[calc(100dvh-2rem)] sm:max-h-[85vh] flex flex-col overflow-hidden">
            <div className="overflow-y-auto min-h-0 flex-1 pr-1 overscroll-contain">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mb-4 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <h3 className="font-serif text-2xl font-medium text-stone-900 dark:text-stone-100 mb-2">
                Cancel Reservation?
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 mb-4 leading-relaxed">
                Are you sure you want to cancel booking <strong>{cancellingBooking.bookingReference}</strong> for{' '}
                {cancellingBooking.room.name}? As per policy, you are eligible for 100% full refund to your original payment method.
              </p>

              <div className="mb-6">
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                  Reason for cancellation
                </label>
                <select
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-[#172A24] border border-stone-300 dark:border-[#1F332C] rounded-xl text-xs sm:text-sm text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="Change of travel plans" className="dark:bg-[#101C18]">Change of travel plans</option>
                  <option value="Found alternative accommodation" className="dark:bg-[#101C18]">Found alternative accommodation</option>
                  <option value="Family or medical emergency" className="dark:bg-[#101C18]">Family or medical emergency</option>
                  <option value="Weather / flight rescheduling" className="dark:bg-[#101C18]">Weather / flight rescheduling</option>
                  <option value="Other personal reason" className="dark:bg-[#101C18]">Other personal reason</option>
                </select>
              </div>
            </div>

            <div className="shrink-0 pt-4 border-t border-stone-100 dark:border-[#1F332C] flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCancellingBooking(null)}
                className="flex-1 py-2.5 border border-stone-300 dark:border-[#1F332C] rounded-xl text-xs sm:text-sm font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-[#172A24] transition-colors cursor-pointer"
              >
                Keep Booking
              </button>
              <button
                type="button"
                onClick={confirmCancellation}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors shadow-sm cursor-pointer"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Star Rating Modal Dialog */}
      {ratingBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#101C18] rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl border border-stone-200 dark:border-[#1F332C] relative animate-in fade-in zoom-in-95 my-auto max-h-[calc(100dvh-2rem)] sm:max-h-[85vh] flex flex-col overflow-hidden">
            <button
              onClick={() => setRatingBooking(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 flex items-center justify-center transition-colors cursor-pointer z-10"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3.5 mb-4 shrink-0 pr-8">
              <div className="w-14 h-12 rounded-xl overflow-hidden shrink-0 bg-stone-100 dark:bg-stone-800">
                <ImageWithFallback
                  src={ratingBooking.room.images[0]}
                  alt={ratingBooking.room.name}
                  fallbackTitle={ratingBooking.room.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-semibold text-[#0D4739] dark:text-[#C2A26F] uppercase tracking-wider block">
                  Rate Your Stay
                </span>
                <h3 className="font-serif text-lg sm:text-xl font-medium text-stone-900 dark:text-stone-100 truncate">
                  {ratingBooking.room.name}
                </h3>
              </div>
            </div>

            <form onSubmit={submitRating} className="flex-1 min-h-0 flex flex-col">
              <div className="flex-1 min-h-0 overflow-y-auto pr-1 overscroll-contain space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                    Select Your Star Rating
                  </label>
                  <div className="flex items-center gap-2 justify-center py-2 bg-stone-50 dark:bg-[#172A24]/40 rounded-2xl border border-stone-200/80 dark:border-[#1F332C]">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverStars(star)}
                        onMouseLeave={() => setHoverStars(0)}
                        onClick={() => setSelectedStars(star)}
                        className="p-1 hover:scale-125 transition-transform cursor-pointer text-stone-300 dark:text-stone-600"
                      >
                        <Star
                          className={`w-7 h-7 sm:w-8 sm:h-8 ${
                            star <= (hoverStars || selectedStars)
                              ? 'fill-[#E68A00] text-[#E68A00]'
                              : 'text-stone-300 dark:text-stone-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <p className="text-center text-xs font-bold text-stone-800 dark:text-stone-200 mt-1">
                    {hoverStars || selectedStars} of 5 Stars ·{' '}
                    {(hoverStars || selectedStars) === 5
                      ? 'Exceptional Sanctuary'
                      : (hoverStars || selectedStars) === 4
                      ? 'Very Good'
                      : (hoverStars || selectedStars) === 3
                      ? 'Satisfactory'
                      : 'Needs Improvement'}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                    Comments / Highlight (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={ratingComment}
                    onChange={(e) => setRatingComment(e.target.value)}
                    placeholder="What made your stay special? (e.g. ocean view, four-poster bed, courteous butler service...)"
                    className="w-full px-3.5 py-2 bg-stone-50 dark:bg-[#172A24]/40 border border-stone-300 dark:border-[#1F332C] rounded-xl text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-600 focus:bg-white dark:focus:bg-[#12201C] focus:outline-none focus:ring-2 focus:ring-[#0D4739] dark:focus:ring-[#C2A26F]"
                  />
                </div>
              </div>

              <div className="shrink-0 pt-3 border-t border-stone-100 dark:border-[#1F332C] flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setRatingBooking(null)}
                  className="flex-1 py-2.5 border border-stone-300 dark:border-[#1F332C] rounded-xl text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-[#172A24] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#0D4739] hover:bg-[#083329] text-white rounded-xl text-xs font-semibold transition-colors shadow-sm cursor-pointer"
                >
                  Submit Rating
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Profile Photo Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#101C18] rounded-3xl p-4 sm:p-6 max-w-md w-full shadow-2xl border border-stone-200 dark:border-[#1F332C] relative animate-in fade-in zoom-in-95 my-auto max-h-[calc(100dvh-2rem)] sm:max-h-[85vh] flex flex-col overflow-hidden">
            <button
              onClick={() => setShowAvatarModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 flex items-center justify-center transition-colors cursor-pointer z-10"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header Lockup (Pinned at Top) */}
            <div className="shrink-0 text-center pb-2 border-b border-stone-100 dark:border-[#1F332C] pr-8 pl-8">
              <div className="w-8 h-8 rounded-full bg-[#0D4739]/10 dark:bg-[#C2A26F]/15 text-[#0D4739] dark:text-[#C2A26F] flex items-center justify-center mx-auto mb-1">
                <Camera className="w-4 h-4" />
              </div>
              <h3 className="font-serif text-lg sm:text-xl font-medium text-stone-900 dark:text-stone-100">
                Change Profile Photo
              </h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                Upload your picture or pick a vacation avatar
              </p>
            </div>

            {/* Scrollable Modal Content (Protected by min-h-0) */}
            <div className="flex-1 min-h-0 overflow-y-auto pr-1 py-3 space-y-3.5 overscroll-contain">
              {/* Active Preview */}
              <div className="flex flex-col items-center justify-center py-0.5">
                <img
                  src={avatarDraft}
                  alt="Avatar preview"
                  className="w-16 h-16 rounded-full object-cover border-3 border-[#0D4739]/20 dark:border-[#C2A26F]/30 shadow-md mb-1"
                />
                <span className="text-[10px] text-stone-400 dark:text-stone-500 font-medium">
                  Live Preview
                </span>
              </div>

              {/* Option 1: Upload from device */}
              <div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2 bg-stone-50 dark:bg-[#172A24] hover:bg-stone-100 dark:hover:bg-[#1E362F] border border-stone-300 dark:border-[#1F332C] rounded-xl text-xs font-semibold text-stone-800 dark:text-stone-200 flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs"
                >
                  <Upload className="w-3.5 h-3.5 text-[#0D4739] dark:text-[#C2A26F]" />
                  <span>Upload from Computer / Phone</span>
                </button>
              </div>

              {/* Option 2: Curated Presets */}
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5 text-center sm:text-left">
                  Or Select from Resort Avatars
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {PRESET_AVATARS.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatarDraft(url)}
                      className={`aspect-square rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                        avatarDraft === url
                          ? 'border-[#0D4739] dark:border-[#C2A26F] ring-2 ring-[#0D4739]/40 dark:ring-[#C2A26F]/40 scale-105 shadow-sm'
                          : 'border-transparent hover:scale-105 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Option 3: Image URL input */}
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                  Or Paste Image Link (URL)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://example.com/photo.jpg"
                    value={customUrlInput}
                    onChange={(e) => setCustomUrlInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-stone-50 dark:bg-[#172A24]/40 border border-stone-300 dark:border-[#1F332C] rounded-xl text-xs text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-600 focus:bg-white dark:focus:bg-[#12201C] focus:outline-none focus:ring-1 focus:ring-[#0D4739] dark:focus:ring-[#C2A26F]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customUrlInput.trim()) {
                        setAvatarDraft(customUrlInput.trim());
                        setCustomUrlInput('');
                      }
                    }}
                    className="px-3 py-1.5 bg-stone-900 dark:bg-stone-200 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 rounded-xl text-xs font-medium cursor-pointer"
                  >
                    Use
                  </button>
                </div>
              </div>
            </div>

            {/* Action buttons (Always visible at the bottom) */}
            <div className="shrink-0 pt-3 border-t border-stone-100 dark:border-[#1F332C] flex items-center gap-3 bg-white dark:bg-[#101C18]">
              <button
                type="button"
                onClick={() => setShowAvatarModal(false)}
                className="flex-1 py-2.5 border border-stone-300 dark:border-[#1F332C] rounded-xl text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-[#172A24] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAvatar}
                className="flex-1 py-2.5 bg-[#0D4739] hover:bg-[#083329] text-white rounded-xl text-xs font-semibold transition-colors shadow-sm cursor-pointer"
              >
                Save Photo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
