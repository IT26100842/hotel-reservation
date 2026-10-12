import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Users, BedDouble, Search, ChevronDown, Sparkles, Check, AlertCircle } from 'lucide-react';
import { RoomType, SearchFilters } from '../types';
import { ImageWithFallback } from './ImageWithFallback';
import { ScrollReveal } from './ScrollReveal';
import Hero_back_image from '../assets/images/hero_back_image.avif';

interface HeroSectionProps {
  onSearch: (filters: Partial<SearchFilters>) => void;
}

function formatLocalYMD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDaysToYMD(ymd: string, days: number): string {
  const [y, m, d] = ymd.split('-').map(Number);
  const dt = new Date(y, (m || 1) - 1, (d || 1) + days);
  return formatLocalYMD(dt);
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onSearch }) => {
  const todayStr = formatLocalYMD(new Date());
  // Check-in must be after today (minimum: tomorrow)
  const minCheckInDate = addDaysToYMD(todayStr, 1);

  const [checkIn, setCheckIn] = useState(() => minCheckInDate);
  const [checkOut, setCheckOut] = useState(() => addDaysToYMD(minCheckInDate, 2));
  const [adults, setAdults] = useState(2);
  const [roomType, setRoomType] = useState<RoomType>('all');
  const [dateError, setDateError] = useState<string>('');

  // Check-out must be after the selected check-in date
  const minCheckOutDate = checkIn && checkIn >= minCheckInDate
    ? addDaysToYMD(checkIn, 1)
    : addDaysToYMD(minCheckInDate, 1);

  const [activeDropdown, setActiveDropdown] = useState<'checkin' | 'checkout' | 'guests' | 'type' | null>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCheckInChange = (selectedDate: string) => {
    if (!selectedDate) {
      setCheckIn('');
      setDateError('Please select a valid check-in date.');
      return;
    }
    if (selectedDate <= todayStr) {
      setDateError('Check-in date must be after today. Past or finished dates cannot be selected.');
      setCheckIn(minCheckInDate);
      if (!checkOut || checkOut <= minCheckInDate) {
        setCheckOut(addDaysToYMD(minCheckInDate, 1));
      }
      return;
    }
    setDateError('');
    setCheckIn(selectedDate);
    if (!checkOut || checkOut <= selectedDate) {
      setCheckOut(addDaysToYMD(selectedDate, 1));
    }
    setActiveDropdown('checkout');
  };

  const handleCheckOutChange = (selectedDate: string) => {
    if (!selectedDate) {
      setCheckOut('');
      setDateError('Please select a valid check-out date.');
      return;
    }
    if (checkIn && selectedDate <= checkIn) {
      setDateError('Check-out date must be after the selected check-in date.');
      setCheckOut(addDaysToYMD(checkIn, 1));
      return;
    }
    setDateError('');
    setCheckOut(selectedDate);
    setActiveDropdown(null);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!checkIn || checkIn <= todayStr) {
      setDateError('Check-in date must be a date after today.');
      setActiveDropdown('checkin');
      return;
    }

    if (!checkOut || checkOut <= checkIn) {
      setDateError('Check-out date must be after the check-in date.');
      setActiveDropdown('checkout');
      return;
    }

    setDateError('');
    setActiveDropdown(null);
    onSearch({
      checkIn,
      checkOut,
      guests: adults,
      roomType,
    });
  };

  const roomTypeLabels: Record<RoomType, string> = {
    all: 'Any room type',
    standard: 'Standard Room',
    deluxe: 'Deluxe Oceanfront',
    suite: 'Presidential Suite',
    villa: 'Coconut Grove Villa'
  };

  return (
    <section className="relative w-full pb-8 md:pb-14">
      {/* 1. Full Width Edge-to-Edge Hero Image Visual Banner (Matches Screenshot web.webp) */}
      <div className="relative w-full h-[440px] sm:h-[490px] md:h-[540px] lg:h-[580px] overflow-hidden bg-stone-900">
        {/* Background Image: Luxury open-air tropical bedroom overlooking ocean */}
        <div className="absolute inset-0 z-0">
          <ImageWithFallback
            src={Hero_back_image}
            alt="Serene Stay tropical luxury bedroom with ocean view"
            containerClassName="w-full h-full"
            className="w-full h-full object-cover object-center"
          />
          {/* Subtle gradient scrim for typography contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/35 to-black/10 md:from-black/60 md:via-black/25 md:to-transparent" />
        </div>

        {/* Hero Copy (Top Left) */}
        <ScrollReveal
          animation="fade-up"
          duration={0.8}
          className="relative z-10 max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-start pt-12 sm:pt-16 md:pt-20 text-white"
        >
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase text-[#E9D8A6] mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Bentota Coastline · Sri Lanka
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight leading-[1.12] text-white text-balance drop-shadow-sm mb-4 max-w-xl">
            Find a room that feels right.
          </h1>
          <p className="text-base sm:text-lg text-white/90 font-normal leading-relaxed max-w-lg drop-shadow-sm">
            Search available rooms, reserve your dates, and manage your stay in one place.
          </p>
        </ScrollReveal>
      </div>

      {/* 2. Floating Search Bar with Scroll Reveal */}
      <ScrollReveal
        animation="zoom-in"
        delay={0.15}
        duration={0.7}
        className="relative z-30 -mt-10 sm:-mt-12 md:-mt-14 max-w-5xl mx-auto px-4 sm:px-6"
      >
        <div ref={searchBarRef} className="bg-white dark:bg-[#101C18] rounded-2xl p-2.5 sm:p-3 shadow-2xl border border-stone-200/90 dark:border-[#1F332C] transition-colors duration-300">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3 items-center">
            
            {/* Field 1: Check-in */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === 'checkin' ? null : 'checkin')}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-stone-50 dark:hover:bg-[#172A24] border border-transparent hover:border-stone-200 dark:hover:border-[#2A443B] transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-stone-500 dark:text-stone-400 shrink-0" />
                  <div>
                    <span className="block text-[11px] font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                      Check-in
                    </span>
                    <span className="block text-sm font-semibold text-stone-900 dark:text-stone-100">
                      {checkIn ? new Date(checkIn + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Select date'}
                    </span>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-stone-400 dark:text-stone-500" />
              </button>

              {activeDropdown === 'checkin' && (
                <div className="absolute left-0 top-full mt-2 z-50 bg-white dark:bg-[#12201C] rounded-2xl shadow-2xl border border-stone-200 dark:border-[#1F332C] p-4 w-72">
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-2">
                    Arrival Date (After Today)
                  </label>
                  <input
                    type="date"
                    min={minCheckInDate}
                    value={checkIn}
                    onChange={(e) => handleCheckInChange(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 dark:border-[#2A443B] bg-white dark:bg-[#0A1210] rounded-lg text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#0D4739]"
                  />
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        handleCheckInChange(minCheckInDate);
                      }}
                      className="text-xs text-[#0D4739] dark:text-[#C2A26F] hover:underline font-medium cursor-pointer"
                    >
                      Tomorrow
                    </button>
                    <span className="text-stone-300 dark:text-stone-600">·</span>
                    <button
                      type="button"
                      onClick={() => {
                        const nextSat = new Date();
                        const daysUntilSat = (6 - nextSat.getDay() + 7) % 7 || 7;
                        nextSat.setDate(nextSat.getDate() + daysUntilSat);
                        handleCheckInChange(formatLocalYMD(nextSat));
                      }}
                      className="text-xs text-[#0D4739] dark:text-[#C2A26F] hover:underline font-medium cursor-pointer"
                    >
                      This Weekend
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Field 2: Check-out */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === 'checkout' ? null : 'checkout')}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-stone-50 dark:hover:bg-[#172A24] border border-transparent hover:border-stone-200 dark:hover:border-[#2A443B] transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-stone-500 dark:text-stone-400 shrink-0" />
                  <div>
                    <span className="block text-[11px] font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                      Check-out
                    </span>
                    <span className="block text-sm font-semibold text-stone-900 dark:text-stone-100">
                      {checkOut ? new Date(checkOut + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Select date'}
                    </span>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-stone-400 dark:text-stone-500" />
              </button>

              {activeDropdown === 'checkout' && (
                <div className="absolute left-0 top-full mt-2 z-50 bg-white dark:bg-[#12201C] rounded-2xl shadow-2xl border border-stone-200 dark:border-[#1F332C] p-4 w-72">
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-2">
                    Departure Date
                  </label>
                  <input
                    type="date"
                    min={minCheckOutDate}
                    value={checkOut}
                    onChange={(e) => handleCheckOutChange(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 dark:border-[#2A443B] bg-white dark:bg-[#0A1210] rounded-lg text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#0D4739]"
                  />
                </div>
              )}
            </div>

            {/* Field 3: Guests */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === 'guests' ? null : 'guests')}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-stone-50 dark:hover:bg-[#172A24] border border-transparent hover:border-stone-200 dark:hover:border-[#2A443B] transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-stone-500 dark:text-stone-400 shrink-0" />
                  <div>
                    <span className="block text-[11px] font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                      Guests
                    </span>
                    <span className="block text-sm font-semibold text-stone-900 dark:text-stone-100">
                      {adults} {adults === 1 ? 'guest' : 'guests'}
                    </span>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-stone-400 dark:text-stone-500" />
              </button>

              {activeDropdown === 'guests' && (
                <div className="absolute left-0 top-full mt-2 z-50 bg-white dark:bg-[#12201C] rounded-2xl shadow-2xl border border-stone-200 dark:border-[#1F332C] p-4 w-64">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">Total Guests</p>
                      <p className="text-xs text-stone-500 dark:text-stone-400">Adults & children</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setAdults(Math.max(1, adults - 1))}
                        className="w-8 h-8 rounded-full border border-stone-300 dark:border-[#2A443B] flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#1B2F28] cursor-pointer"
                      >
                        -
                      </button>
                      <span className="text-sm font-bold text-stone-900 dark:text-stone-100 tabular-nums w-4 text-center">
                        {adults}
                      </span>
                      <button
                        type="button"
                        onClick={() => setAdults(Math.min(8, adults + 1))}
                        className="w-8 h-8 rounded-full border border-stone-300 dark:border-[#2A443B] flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#1B2F28] cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Field 4: Room type */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === 'type' ? null : 'type')}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-stone-50 dark:hover:bg-[#172A24] border border-transparent hover:border-stone-200 dark:hover:border-[#2A443B] transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <BedDouble className="w-5 h-5 text-stone-500 dark:text-stone-400 shrink-0" />
                  <div>
                    <span className="block text-[11px] font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                      Room type
                    </span>
                    <span className="block text-sm font-semibold text-stone-900 dark:text-stone-100 truncate max-w-[120px]">
                      {roomTypeLabels[roomType]}
                    </span>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-stone-400 dark:text-stone-500" />
              </button>

              {activeDropdown === 'type' && (
                <div className="absolute left-0 top-full mt-2 z-50 bg-white dark:bg-[#12201C] rounded-2xl shadow-2xl border border-stone-200 dark:border-[#1F332C] p-2.5 w-64 space-y-1">
                  {(Object.keys(roomTypeLabels) as RoomType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setRoomType(type);
                        setActiveDropdown(null);
                      }}
                      className={`w-full text-left px-3 py-2.5 text-xs font-medium rounded-xl transition-colors flex items-center justify-between cursor-pointer ${
                        roomType === type
                          ? 'bg-[#0D4739] text-white font-semibold'
                          : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#1B2F28]'
                      }`}
                    >
                      <span>{roomTypeLabels[type]}</span>
                      {roomType === type && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Action Button: Search rooms */}
            <div className="w-full">
              <button
                type="button"
                onClick={() => handleSearchSubmit()}
                className="w-full h-14 bg-[#0D4739] hover:bg-[#083329] active:scale-[0.98] text-white font-medium px-6 rounded-xl transition-all duration-200 shadow-md flex items-center justify-center gap-2 text-base cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>Search rooms</span>
              </button>
            </div>

          </div>

          {dateError && (
            <div className="mt-2.5 px-3.5 py-2 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-xs font-medium text-red-600 dark:text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{dateError}</span>
            </div>
          )}
        </div>
      </ScrollReveal>

      {/* 3. Direct Booking Perks Bar - Reveals on Scroll */}
      <ScrollReveal
        animation="fade-up"
        delay={0.1}
        className="max-w-5xl mx-auto px-4 sm:px-6 mt-6"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-3 px-5 rounded-2xl bg-white/70 dark:bg-[#101C18]/70 backdrop-blur-md border border-stone-200/60 dark:border-[#1F332C]/60 text-stone-600 dark:text-stone-300 text-xs shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0D4739] dark:bg-[#C2A26F] shrink-0" />
            <span className="font-medium truncate">Secluded Oceanfront</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0D4739] dark:bg-[#C2A26F] shrink-0" />
            <span className="font-medium truncate">Free 48h Cancellation</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0D4739] dark:bg-[#C2A26F] shrink-0" />
            <span className="font-medium truncate">Best Rate Guarantee</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0D4739] dark:bg-[#C2A26F] shrink-0" />
            <span className="font-medium truncate">Organic Ceylon Breakfast</span>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
};

