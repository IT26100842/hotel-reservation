import React, { useState, useEffect } from 'react';
import { Room } from '../types';
import { ImageWithFallback } from './ImageWithFallback';
import {
  Star,
  Users,
  Maximize2,
  Calendar,
  Check,
  ShieldCheck,
  ArrowLeft,
  ChevronRight,
  Sparkles,
  Coffee,
  Wifi,
  Wind,
  Bath,
  Tv,
  Lock,
  Heart,
  Share2,
  Info
} from 'lucide-react';
import { ScrollReveal, StaggerContainer, StaggerItem } from './ScrollReveal';

interface RoomDetailViewProps {
  room: Room;
  onBack: () => void;
  onBookNow: (bookingDetails: {
    room: Room;
    checkIn: string;
    checkOut: string;
    nights: number;
    adults: number;
    children: number;
  }) => void;
  isSaved: boolean;
  onToggleSave: () => void;
  isLoggedIn?: boolean;
  onRequireLogin?: () => void;
}

export const RoomDetailView: React.FC<RoomDetailViewProps> = ({
  room,
  onBack,
  onBookNow,
  isSaved,
  onToggleSave,
  isLoggedIn = false,
  onRequireLogin
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [checkIn, setCheckIn] = useState('2026-10-18');
  const [checkOut, setCheckOut] = useState('2026-10-21');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [copiedShare, setCopiedShare] = useState(false);
  const [loginWarning, setLoginWarning] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      setLoginWarning(false);
    }
  }, [isLoggedIn]);

  // Preload all room gallery images immediately on mount so thumbnails are instant
  useEffect(() => {
    room.images.forEach((url) => {
      const img = new window.Image();
      img.src = url;
    });
  }, [room.images]);

  // Calculate nights
  const nights = React.useMemo(() => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.max(1, end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
  }, [checkIn, checkOut]);

  // Pricing math
  const subtotal = room.pricePerNight * nights;
  const serviceCharge = Math.round(subtotal * 0.10);
  const taxes = Math.round(subtotal * 0.025);
  const total = subtotal + serviceCharge + taxes;

  const handleShare = () => {
    const fullUrl = `${window.location.origin}/rooms/${room.slug}`;
    navigator.clipboard?.writeText(fullUrl);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const totalRoomsCount = room.totalRooms ?? 5;
  const availableRoomsCount = room.availableRooms ?? totalRoomsCount;
  const isRoomSoldOut = availableRoomsCount <= 0 || room.status === 'maintenance';
  const availableRoomNumbers = room.availableRoomNumbers && room.availableRoomNumbers.length > 0
    ? room.availableRoomNumbers
    : Array.from({ length: availableRoomsCount }, (_, i) => String((room.baseRoomNumber ?? 101) + i));

  const handleProceedBooking = () => {
    if (isRoomSoldOut) return;
    if (!isLoggedIn) {
      setLoginWarning(true);
      if (onRequireLogin) {
        onRequireLogin();
      }
      return;
    }
    setLoginWarning(false);
    onBookNow({
      room,
      checkIn,
      checkOut,
      nights,
      adults,
      children
    });
  };

  return (
    <div className="min-h-screen bg-[#FBFBF9] dark:bg-[#0A1210] py-6 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto transition-colors duration-300">
      {/* Top Navigation & Breadcrumbs */}
      <ScrollReveal animation="fade-up">
        <div className="flex flex-wrap items-center justify-between pb-6 mb-6 border-b border-stone-200 dark:border-[#1F332C] gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (window.history.state && window.history.length > 1) {
                  window.history.back();
                } else {
                  onBack();
                }
              }}
              className="flex items-center gap-2 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:text-[#0D4739] dark:hover:text-[#C2A26F] transition-colors py-1.5 px-3 rounded-lg border border-stone-200 dark:border-[#1F332C] bg-white dark:bg-[#101C18] shadow-sm cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to All Rooms</span>
            </button>
            <span className="text-stone-300 dark:text-stone-700">/</span>
            <span className="text-xs text-stone-500 dark:text-stone-400 hidden sm:inline">{room.name}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 text-xs font-medium text-stone-700 dark:text-stone-300 bg-white dark:bg-[#101C18] border border-stone-200 dark:border-[#1F332C] px-3 py-1.5 rounded-lg hover:bg-stone-50 dark:hover:bg-[#172A24] transition-colors shadow-sm cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedShare ? 'Link Copied!' : 'Share'}</span>
            </button>
            <button
              onClick={onToggleSave}
              className="flex items-center gap-1.5 text-xs font-medium text-stone-700 dark:text-stone-300 bg-white dark:bg-[#101C18] border border-stone-200 dark:border-[#1F332C] px-3 py-1.5 rounded-lg hover:bg-stone-50 dark:hover:bg-[#172A24] transition-colors shadow-sm cursor-pointer"
            >
              <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        </div>

        {/* Main Title Header */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs uppercase tracking-widest text-[#0D4739] dark:text-[#C2A26F] font-semibold">
              {room.location}
            </span>
            <span className="text-stone-300 dark:text-stone-700">·</span>
            <span className="text-xs text-stone-500 dark:text-stone-400">{room.view}</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium text-stone-900 dark:text-stone-100 tracking-tight">
            {room.name}
          </h1>
          <div className="flex items-center gap-3 text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-2">
            <div className="flex items-center gap-1 font-bold text-stone-900 dark:text-stone-100">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span>{room.rating}</span>
              <span className="text-stone-400 dark:text-stone-500 font-normal">({room.reviewCount} verified guest reviews)</span>
            </div>
            <span>·</span>
            <span>Serene Stay Ocean Wing</span>
          </div>
        </div>
      </ScrollReveal>

      {/* Image Gallery Layout with Scroll Reveal */}
      <ScrollReveal animation="fade-up" delay={0.1}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-10">
          {/* Main Large Image */}
          <div className="lg:col-span-8 rounded-2xl overflow-hidden aspect-[16/10] bg-stone-100 dark:bg-stone-900 shadow-sm relative">
            <ImageWithFallback
              key={selectedImageIndex}
              src={room.images[selectedImageIndex] || room.images[0]}
              alt={room.name}
              fallbackTitle={room.name}
              loading="eager"
              className="w-full h-full object-cover transition-opacity duration-300"
            />
          </div>

          {/* Thumbnail Selector Grid - Immediate full visibility & eager preload */}
          <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-3">
            {room.images.map((imgUrl, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setSelectedImageIndex(index)}
                className={`relative rounded-xl overflow-hidden aspect-[16/9] lg:aspect-[16/8] border-2 transition-all cursor-pointer group/thumb ${
                  selectedImageIndex === index
                    ? 'border-[#0D4739] dark:border-[#C2A26F] ring-2 ring-[#0D4739]/30 dark:ring-[#C2A26F]/30 shadow-md scale-[0.99]'
                    : 'border-stone-200/90 dark:border-[#1F332C] hover:border-[#0D4739]/60 dark:hover:border-[#C2A26F]/60'
                }`}
              >
                <ImageWithFallback
                  src={imgUrl}
                  alt={`${room.name} preview ${index + 1}`}
                  fallbackTitle={`${room.name} ${index + 1}`}
                  loading="eager"
                  className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                />
                {/* Photo preview label badge */}
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/65 backdrop-blur-sm text-[10px] text-white font-medium">
                  {selectedImageIndex === index ? `Active · Photo ${index + 1}` : `Photo ${index + 1}`}
                </div>
              </button>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* 2-Column Layout: Left Content & Right Contiguous Booking Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Room Description, Specs, Amenities */}
        <div className="lg:col-span-7 space-y-10">
          {/* Quick Specifications Bar */}
          <ScrollReveal animation="fade-up">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-white dark:bg-[#101C18] rounded-2xl border border-stone-200/80 dark:border-[#1F332C] shadow-sm">
              <div>
                <span className="block text-[11px] uppercase tracking-wider text-stone-500 dark:text-stone-400 font-medium">Guests</span>
                <p className="font-serif text-lg text-stone-900 dark:text-stone-100 font-medium mt-0.5">Up to {room.maxGuests}</p>
              </div>
              <div>
                <span className="block text-[11px] uppercase tracking-wider text-stone-500 dark:text-stone-400 font-medium">Bedding</span>
                <p className="font-serif text-lg text-stone-900 dark:text-stone-100 font-medium mt-0.5">{room.beds}</p>
              </div>
              <div>
                <span className="block text-[11px] uppercase tracking-wider text-stone-500 dark:text-stone-400 font-medium">Room Size</span>
                <p className="font-serif text-lg text-stone-900 dark:text-stone-100 font-medium mt-0.5">{room.sizeSqFt} sq ft</p>
              </div>
              <div>
                <span className="block text-[11px] uppercase tracking-wider text-stone-500 dark:text-stone-400 font-medium">Bathroom</span>
                <p className="font-serif text-lg text-stone-900 dark:text-stone-100 font-medium mt-0.5">{room.baths} Private</p>
              </div>
            </div>
          </ScrollReveal>

          {/* Detailed Editorial Narrative */}
          <ScrollReveal animation="fade-up">
            <div>
              <h2 className="font-serif text-2xl font-medium text-stone-900 dark:text-stone-100 mb-3">
                The Living Space
              </h2>
              <p className="text-sm sm:text-base text-stone-700 dark:text-stone-300 leading-relaxed font-light">
                {room.detailedDescription}
              </p>
            </div>
          </ScrollReveal>

          {/* Room Amenities Grid */}
          <ScrollReveal animation="fade-up">
            <div>
              <h2 className="font-serif text-2xl font-medium text-stone-900 dark:text-stone-100 mb-4">
                Room Amenities & Luxuries
              </h2>
              <StaggerContainer staggerDelay={0.08} className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {room.amenities.map((amenity, idx) => (
                  <StaggerItem key={idx} animation="fade-up">
                    <div className="flex items-center gap-3 p-3.5 bg-white dark:bg-[#101C18] rounded-xl border border-stone-200/70 dark:border-[#1F332C] shadow-2xs h-full">
                      <div className="w-8 h-8 rounded-lg bg-[#0D4739]/10 dark:bg-[#C2A26F]/15 text-[#0D4739] dark:text-[#C2A26F] flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4" />
                      </div>
                      <span className="text-sm text-stone-800 dark:text-stone-200 font-medium">{amenity}</span>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          </ScrollReveal>

          {/* House Rules & Policies */}
          <ScrollReveal animation="fade-up">
            <div className="p-6 bg-[#F4F4F0] dark:bg-[#12201C] rounded-2xl border border-stone-200 dark:border-[#1F332C] space-y-3">
              <h3 className="font-serif text-lg font-medium text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#0D4739] dark:text-[#C2A26F]" />
                Stay Policies & Guarantee
              </h3>
              <ul className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0D4739] dark:bg-[#C2A26F]" />
                  <strong>Check-in:</strong> 2:00 PM · <strong>Check-out:</strong> 11:00 AM (flexible upon request)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0D4739] dark:bg-[#C2A26F]" />
                  <strong>Cancellation:</strong> {room.cancellationPolicy}
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0D4739] dark:bg-[#C2A26F]" />
                  <strong>Smoke-free sanctuary:</strong> Dedicated outdoor garden smoking pavilions available
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0D4739] dark:bg-[#C2A26F]" />
                  <strong>Payment Guarantee:</strong> Real-time PayHere, PayPal, and Card checkout with 0% booking fees
                </li>
              </ul>
            </div>
          </ScrollReveal>
        </div>

        {/* Right Column: Sticky Contiguous Booking Card */}
        <div className="lg:col-span-5 sticky top-28">
          <ScrollReveal animation="fade-left">
            <div className="bg-white dark:bg-[#101C18] rounded-3xl p-6 sm:p-7 border border-stone-200 dark:border-[#1F332C] shadow-xl space-y-6">
            
            {/* Price Header */}
            <div className="flex items-baseline justify-between pb-4 border-b border-stone-100 dark:border-[#1F332C]">
              <div>
                <span className="font-serif text-3xl font-bold text-stone-900 dark:text-stone-100 tabular-nums">
                  LKR {room.pricePerNight.toLocaleString()}
                </span>
                <span className="text-xs text-stone-500 dark:text-stone-400 ml-1">/ night</span>
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-stone-800 dark:text-stone-200">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>{room.rating}</span>
              </div>
            </div>

            {/* Live Room Inventory & Vacancy Status Banner */}
            <div
              className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${
                isRoomSoldOut
                  ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-200'
                  : 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200'
              }`}
            >
              <div className="flex items-center justify-between font-semibold">
                <span>Category Availability:</span>
                <span className="font-bold">
                  {room.status === 'maintenance'
                    ? 'Under Maintenance'
                    : isRoomSoldOut
                    ? `0 of ${totalRoomsCount} Vacant (Fully Booked)`
                    : `${availableRoomsCount} of ${totalRoomsCount} Rooms Vacant`}
                </span>
              </div>
              {!isRoomSoldOut && availableRoomNumbers.length > 0 && (
                <div className="flex flex-wrap items-center gap-1 pt-1">
                  <span className="text-[11px] opacity-80 mr-1">Vacant Room Numbers:</span>
                  {availableRoomNumbers.map((rNum) => (
                    <span
                      key={rNum}
                      className="px-1.5 py-0.5 rounded bg-white dark:bg-[#101C18] border border-emerald-300 dark:border-emerald-700 font-mono text-[10px] font-bold text-[#0D4739] dark:text-[#C2A26F]"
                    >
                      #{rNum}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Date Pickers */}
            <div className="border border-stone-200 dark:border-[#1F332C] rounded-2xl overflow-hidden divide-y divide-stone-200 dark:divide-[#1F332C]">
              <div className="grid grid-cols-2 divide-x divide-stone-200 dark:divide-[#1F332C]">
                <div className="p-3 bg-stone-50/50 dark:bg-[#172A24]/40">
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                    Check-in
                  </label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full text-xs sm:text-sm font-semibold text-stone-900 dark:text-stone-100 bg-transparent focus:outline-none cursor-pointer mt-0.5"
                  />
                </div>
                <div className="p-3 bg-stone-50/50 dark:bg-[#172A24]/40">
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                    Check-out
                  </label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full text-xs sm:text-sm font-semibold text-stone-900 dark:text-stone-100 bg-transparent focus:outline-none cursor-pointer mt-0.5"
                  />
                </div>
              </div>

              {/* Guest Count */}
              <div className="p-3 bg-stone-50/50 dark:bg-[#172A24]/40 flex items-center justify-between">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                    Guests
                  </label>
                  <span className="text-xs sm:text-sm font-semibold text-stone-900 dark:text-stone-100">
                    {adults + children} {adults + children === 1 ? 'Guest' : 'Guests'} ({adults} Adults, {children} Kids)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAdults(Math.max(1, adults - 1))}
                    className="w-7 h-7 rounded-full border border-stone-300 dark:border-stone-600 flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-xs font-bold text-stone-900 dark:text-stone-100 tabular-nums w-4 text-center">
                    {adults}
                  </span>
                  <button
                    type="button"
                    onClick={() => setAdults(Math.min(room.maxGuests, adults + 1))}
                    className="w-7 h-7 rounded-full border border-stone-300 dark:border-stone-600 flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Price Calculations */}
            <div className="space-y-2.5 text-xs sm:text-sm text-stone-600 dark:text-stone-300 pt-2">
              <div className="flex justify-between">
                <span>LKR {room.pricePerNight.toLocaleString()} × {nights} {nights === 1 ? 'night' : 'nights'}</span>
                <span className="tabular-nums font-medium text-stone-900 dark:text-stone-100">LKR {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-1">
                  10% Service Charge
                  <Info className="w-3 h-3 text-stone-400 dark:text-stone-500" />
                </span>
                <span className="tabular-nums font-medium text-stone-900 dark:text-stone-100">LKR {serviceCharge.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>SSCL & Local Government Taxes (2.5%)</span>
                <span className="tabular-nums font-medium text-stone-900 dark:text-stone-100">LKR {taxes.toLocaleString()}</span>
              </div>

              <div className="border-t border-stone-200 dark:border-[#1F332C] pt-3 flex justify-between items-baseline font-semibold text-stone-900 dark:text-stone-100">
                <span className="text-base font-serif">Total Payable</span>
                <span className="text-xl font-serif text-[#0D4739] dark:text-[#C2A26F] tabular-nums">
                  LKR {total.toLocaleString()}
                </span>
              </div>
            </div>

            {loginWarning && !isLoggedIn && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 shrink-0" />
                  <span>Please log in to your account to book this room.</span>
                </div>
                {onRequireLogin && (
                  <button
                    type="button"
                    onClick={onRequireLogin}
                    className="font-semibold underline hover:no-underline shrink-0 cursor-pointer"
                  >
                    Log in
                  </button>
                )}
              </div>
            )}

            {/* Book Now Button */}
            <button
              onClick={handleProceedBooking}
              disabled={isRoomSoldOut}
              className={`w-full py-4 font-medium rounded-2xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-base ${
                isRoomSoldOut
                  ? 'bg-stone-300 dark:bg-stone-800 text-stone-500 dark:text-stone-400 cursor-not-allowed'
                  : 'bg-[#0D4739] hover:bg-[#083329] active:scale-[0.98] text-white cursor-pointer'
              }`}
            >
              <span>
                {room.status === 'maintenance'
                  ? 'Room Under Maintenance'
                  : isRoomSoldOut
                  ? 'Fully Booked — No Vacant Rooms'
                  : `Book Now (Room #${availableRoomNumbers[0] || '101'})`}
              </span>
              {!isRoomSoldOut && <ChevronRight className="w-4 h-4" />}
            </button>

            <p className="text-center text-[11px] text-stone-400 dark:text-stone-500">
              You won't be charged yet until the payment confirmation step.
            </p>
          </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
};
