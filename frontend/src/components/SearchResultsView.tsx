import React, { useState, useMemo, useEffect } from 'react';
import { Room, RoomType, SearchFilters } from '../types';
import { ImageWithFallback } from './ImageWithFallback';
import {
  SlidersHorizontal,
  Star,
  Users,
  Maximize2,
  Check,
  RotateCcw,
  Search,
  ArrowRight,
  ShieldCheck,
  Heart
} from 'lucide-react';
import { ALL_AMENITIES } from '../data/mockData';
import { ScrollReveal, StaggerContainer, StaggerItem } from './ScrollReveal';

interface SearchResultsViewProps {
  rooms: Room[];
  initialFilters: SearchFilters;
  onSelectRoom: (room: Room) => void;
  savedRoomIds: string[];
  onToggleSaveRoom: (roomId: string) => void;
}

export const SearchResultsView: React.FC<SearchResultsViewProps> = ({
  rooms,
  initialFilters,
  onSelectRoom,
  savedRoomIds,
  onToggleSaveRoom
}) => {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Synchronize internal state whenever initialFilters prop updates
  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  // Robust room type handler that toggles and ensures no conflicting guest/price filter hides rooms
  const handleSelectRoomType = (newType: RoomType) => {
    const targetType = filters.roomType === newType ? 'all' : newType;

    setFilters((prev) => {
      let updatedGuests = prev.guests;
      let updatedMaxPrice = prev.maxPrice;
      let updatedMinRating = prev.minRating;

      if (targetType !== 'all') {
        const matching = rooms.filter(
          (r) => r.type.toLowerCase().trim() === targetType.toLowerCase().trim()
        );
        if (matching.length > 0) {
          const maxCap = Math.max(...matching.map((r) => r.maxGuests));
          if (updatedGuests > maxCap) {
            updatedGuests = maxCap;
          }
          const minPrice = Math.min(...matching.map((r) => r.pricePerNight));
          if (updatedMaxPrice < minPrice) {
            updatedMaxPrice = 60000;
          }
          const maxRating = Math.max(...matching.map((r) => r.rating));
          if (updatedMinRating > maxRating) {
            updatedMinRating = 0;
          }
        }
      }

      return {
        ...prev,
        roomType: targetType,
        guests: updatedGuests,
        maxPrice: updatedMaxPrice,
        minRating: updatedMinRating
      };
    });
  };

  // Filter and sort logic
  const filteredRooms = useMemo(() => {
    return rooms
      .filter((room) => {
        // Room type filter (case-insensitive)
        if (
          filters.roomType !== 'all' &&
          room.type.toLowerCase().trim() !== filters.roomType.toLowerCase().trim()
        ) {
          return false;
        }

        // Guests filter: only restrict if viewing 'all' or room has sufficient capacity
        if (filters.roomType === 'all' && room.maxGuests < filters.guests) {
          return false;
        }

        // Price range
        if (room.pricePerNight < filters.minPrice || room.pricePerNight > filters.maxPrice) {
          return false;
        }

        // Minimum rating
        if (room.rating < filters.minRating) {
          return false;
        }

        // Amenities filter
        if (filters.amenities.length > 0) {
          const hasAllSelected = filters.amenities.every((amenity) =>
            room.amenities.some((a) => a.toLowerCase().includes(amenity.toLowerCase()))
          );
          if (!hasAllSelected) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'price_asc') return a.pricePerNight - b.pricePerNight;
        if (filters.sortBy === 'price_desc') return b.pricePerNight - a.pricePerNight;
        if (filters.sortBy === 'rating') return b.rating - a.rating;
        return (b.popular ? 1 : 0) - (a.popular ? 1 : 0);
      });
  }, [rooms, filters]);

  const handleToggleAmenity = (amenity: string) => {
    setFilters((prev) => {
      const exists = prev.amenities.includes(amenity);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter((a) => a !== amenity)
          : [...prev.amenities, amenity]
      };
    });
  };

  const resetFilters = () => {
    setFilters({
      location: 'Bentota, Sri Lanka',
      checkIn: '2026-10-18',
      checkOut: '2026-10-22',
      guests: 1,
      roomType: 'all',
      minPrice: 10000,
      maxPrice: 60000,
      amenities: [],
      minRating: 0,
      sortBy: 'popular'
    });
  };

  return (
    <div className="min-h-screen bg-[#FBFBF9] dark:bg-[#0A1210] py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto transition-colors duration-300">
      {/* Top Banner / Breadcrumb with Scroll Reveal */}
      <ScrollReveal animation="fade-up">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-6 border-b border-stone-200 dark:border-[#1F332C] gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#0D4739] dark:text-[#C2A26F] font-medium">
              Serene Stay · Accommodations
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#1A1F1D] dark:text-[#F5F5F0] font-medium tracking-tight mt-1">
              Available Rooms & Suites
            </h1>
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
              Showing <strong className="text-stone-800 dark:text-stone-200">{filteredRooms.length}</strong> available options for{' '}
              <span className="text-stone-800 dark:text-stone-200 font-medium">{filters.guests} {filters.guests === 1 ? 'Guest' : 'Guests'}</span> · Bentota Coastline
            </p>
          </div>

          {/* Sort & Mobile Filter Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden px-4 py-2 bg-white dark:bg-[#101C18] border border-stone-200 dark:border-[#1F332C] rounded-xl text-sm font-medium text-stone-800 dark:text-stone-200 flex items-center gap-2 shadow-sm"
            >
              <SlidersHorizontal className="w-4 h-4 text-stone-600 dark:text-stone-400" />
              <span>Filters ({filters.amenities.length + (filters.roomType !== 'all' ? 1 : 0)})</span>
            </button>

            <div className="flex items-center gap-2 bg-white dark:bg-[#101C18] border border-stone-200 dark:border-[#1F332C] rounded-xl px-3 py-2 shadow-sm">
              <span className="text-xs text-stone-500 dark:text-stone-400 whitespace-nowrap">Sort by:</span>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                className="text-xs font-semibold text-stone-800 dark:text-stone-200 bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="popular" className="dark:bg-[#101C18]">Recommended / Most Popular</option>
                <option value="price_asc" className="dark:bg-[#101C18]">Price: Low to High</option>
                <option value="price_desc" className="dark:bg-[#101C18]">Price: High to Low</option>
                <option value="rating" className="dark:bg-[#101C18]">Top Rated (Stars)</option>
              </select>
            </div>
          </div>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Desktop Filter Sidebar with Scroll Reveal */}
        <ScrollReveal animation="fade-right" className="hidden lg:block sticky top-28">
          <aside className="bg-white dark:bg-[#101C18] rounded-2xl p-6 border border-stone-200/80 dark:border-[#1F332C] shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-[#1F332C]">
            <h3 className="font-serif text-lg font-medium text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#0D4739] dark:text-[#C2A26F]" />
              Smart Filters
            </h3>
            <button
              onClick={resetFilters}
              className="text-xs text-stone-500 hover:text-[#0D4739] dark:hover:text-[#C2A26F] flex items-center gap-1 font-medium transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>

          {/* Room Category */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-2.5">
              Room Category
            </label>
            <div className="space-y-1.5">
              {[
                { id: 'all', label: 'All Room Types' },
                { id: 'standard', label: 'Standard Room' },
                { id: 'deluxe', label: 'Deluxe Oceanfront' },
                { id: 'suite', label: 'Presidential Suite' },
                { id: 'villa', label: 'Coconut Grove Villa' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleSelectRoomType(opt.id as RoomType)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                    filters.roomType === opt.id
                      ? 'bg-[#0D4739] text-white shadow-sm'
                      : 'text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-[#172A24]'
                  }`}
                >
                  <span>{opt.label}</span>
                  {filters.roomType === opt.id && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                Max Price per Night
              </label>
              <span className="text-xs font-serif font-bold text-[#0D4739] dark:text-[#C2A26F] tabular-nums">
                LKR {filters.maxPrice.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min="10000"
              max="60000"
              step="2500"
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) })}
              className="w-full accent-[#0D4739] dark:accent-[#C2A26F] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-stone-400 dark:text-stone-500 mt-1">
              <span>LKR 10,000</span>
              <span>LKR 60,000</span>
            </div>
          </div>

          {/* Guest Count */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-2">
              Minimum Guests
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((g) => (
                <button
                  key={g}
                  onClick={() => setFilters({ ...filters, guests: filters.guests === g ? 1 : g })}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                    filters.guests === g
                      ? 'bg-[#0D4739] border-[#0D4739] text-white'
                      : 'border-stone-200 dark:border-[#1F332C] text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-[#172A24]'
                  }`}
                >
                  {g}+
                </button>
              ))}
            </div>
          </div>

          {/* Guest Rating */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-2">
              Guest Rating
            </label>
            <div className="space-y-1">
              {[
                { rating: 0, label: 'Any Rating' },
                { rating: 4.8, label: '4.8+ Exceptional' },
                { rating: 4.9, label: '4.9+ Outstanding' }
              ].map((opt) => (
                <button
                  key={opt.rating}
                  onClick={() => setFilters({ ...filters, minRating: filters.minRating === opt.rating ? 0 : opt.rating })}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between cursor-pointer ${
                    filters.minRating === opt.rating
                      ? 'bg-[#0D4739]/10 dark:bg-[#0D4739]/30 text-[#0D4739] dark:text-[#C2A26F] font-bold'
                      : 'text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-[#172A24]'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {opt.rating > 0 && <Star className="w-3 h-3 fill-amber-500 text-amber-500" />}
                    {opt.label}
                  </span>
                  {filters.minRating === opt.rating && <Check className="w-3 h-3" />}
                </button>
              ))}
            </div>
          </div>

          {/* Popular Amenities */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-2.5">
              Key Amenities
            </label>
            <div className="space-y-2">
              {ALL_AMENITIES.slice(0, 6).map((amenity) => {
                const checked = filters.amenities.includes(amenity);
                return (
                  <label
                    key={amenity}
                    className="flex items-center gap-2.5 text-xs text-stone-700 dark:text-stone-300 cursor-pointer hover:text-stone-900 dark:hover:text-stone-100 select-none"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleToggleAmenity(amenity)}
                      className="w-4 h-4 rounded border-stone-300 dark:border-[#2A443B] text-[#0D4739] focus:ring-[#0D4739] accent-[#0D4739]"
                    />
                    <span>{amenity}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </aside>
        </ScrollReveal>

        {/* Room Results List */}
        <main className="lg:col-span-3 space-y-6">
          {filteredRooms.length === 0 ? (
            <div className="bg-white dark:bg-[#101C18] rounded-2xl p-12 text-center border border-stone-200 dark:border-[#1F332C]">
              <Search className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
              <h3 className="font-serif text-2xl font-medium text-stone-900 dark:text-stone-100 mb-2">
                No rooms match your specific criteria
              </h3>
              <p className="text-sm text-stone-500 dark:text-stone-400 max-w-md mx-auto mb-6">
                Try widening your price range or clearing selected amenities to see all our coastal retreats.
              </p>
              <button
                onClick={resetFilters}
                className="px-5 py-2.5 bg-[#0D4739] text-white rounded-xl text-sm font-medium hover:bg-[#083329] transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <StaggerContainer key={filteredRooms.map((room) => room.id).join('-')} staggerDelay={0.12} className="space-y-6">
              {filteredRooms.map((room) => {
                const isSaved = savedRoomIds.includes(room.id);
                return (
                  <StaggerItem key={room.id} animation="fade-up">
                    <div
                      className="bg-white dark:bg-[#101C18] rounded-2xl border border-stone-200/80 dark:border-[#1F332C] shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col md:flex-row group transform-gpu"
                    >
                      {/* Image (Left on desktop) */}
                      <div className="md:w-5/12 relative aspect-[16/10] md:aspect-auto overflow-hidden bg-stone-100 dark:bg-[#0A1210]">
                        <ImageWithFallback
                          src={room.images[0]}
                          alt={room.name}
                          containerClassName="h-full w-full"
                          fallbackTitle={room.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        />

                        {/* Bookmark Heart */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleSaveRoom(room.id);
                          }}
                          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 dark:bg-[#101C18]/90 backdrop-blur-md flex items-center justify-center text-stone-700 dark:text-stone-200 hover:text-red-500 shadow-sm transition-colors cursor-pointer"
                          title={isSaved ? 'Remove from saved' : 'Save room'}
                        >
                          <Heart className={`w-4 h-4 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
                        </button>

                        {/* Badge */}
                        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
                          {room.popular && (
                            <div className="bg-[#0D4739] text-white text-[11px] font-medium px-2.5 py-1 rounded-md shadow-sm">
                              Guest Favorite
                            </div>
                          )}
                          {(() => {
                            const total = room.totalRooms ?? 5;
                            const avail = room.availableRooms ?? total;
                            const isFull = avail <= 0 || room.status === 'maintenance';
                            return (
                              <div
                                className={`text-[11px] font-semibold px-2.5 py-1 rounded-md shadow-sm backdrop-blur-md ${
                                  isFull
                                    ? 'bg-rose-600/95 text-white'
                                    : avail <= 2
                                    ? 'bg-amber-500/95 text-stone-950'
                                    : 'bg-emerald-800/90 text-white'
                                }`}
                              >
                                {isFull ? 'Fully Booked (0 Vacant)' : `${avail} of ${total} Rooms Available`}
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Content (Right on desktop) */}
                      <div className="md:w-7/12 p-6 flex flex-col justify-between">
                        <div>
                          {/* Top stats row */}
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                              {room.view}
                            </span>
                            <div className="flex items-center gap-1 text-xs font-bold text-stone-800 dark:text-stone-200">
                              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                              <span>{room.rating}</span>
                              <span className="text-stone-400 dark:text-stone-500 font-normal">({room.reviewCount})</span>
                            </div>
                          </div>

                          {/* Room Name */}
                          <h2
                            onClick={() => onSelectRoom(room)}
                            className="font-serif text-2xl font-medium text-stone-900 dark:text-stone-100 group-hover:text-[#0D4739] dark:group-hover:text-[#D4B683] transition-colors cursor-pointer"
                          >
                            {room.name}
                          </h2>

                          {/* Brief Description */}
                          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 line-clamp-2 mt-1.5 leading-relaxed">
                            {room.description}
                          </p>

                          {/* Key Specs */}
                          <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 dark:text-stone-400 mt-3 pt-3 border-t border-stone-100 dark:border-[#1F332C]">
                            <span className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5 text-stone-400" />
                              Up to {room.maxGuests} guests
                            </span>
                            <span>·</span>
                            <span>{room.beds}</span>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <Maximize2 className="w-3.5 h-3.5 text-stone-400" />
                              {room.sizeSqFt} sq ft
                            </span>
                            {room.availableRoomNumbers && room.availableRoomNumbers.length > 0 && (
                              <>
                                <span>·</span>
                                <span className="text-emerald-700 dark:text-emerald-400 font-mono font-semibold">
                                  Next Room: #{room.availableRoomNumbers[0]}
                                </span>
                              </>
                            )}
                          </div>

                          {/* Top Amenities tags */}
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {room.amenities.slice(0, 3).map((amenity) => (
                              <span
                                key={amenity}
                                className="text-[11px] text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-[#172A24] px-2 py-0.5 rounded"
                              >
                                {amenity}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Bottom Pricing & Action */}
                        <div className="mt-5 pt-4 border-t border-stone-100 dark:border-[#1F332C] flex items-end justify-between">
                          <div>
                            <div className="flex items-baseline gap-1">
                              <span className="font-serif font-semibold text-2xl text-stone-900 dark:text-stone-100 tabular-nums">
                                LKR {room.pricePerNight.toLocaleString()}
                              </span>
                              <span className="text-xs text-stone-500 dark:text-stone-400">/ night</span>
                            </div>
                            <span className="text-[11px] text-emerald-700 dark:text-emerald-400 flex items-center gap-1 font-medium mt-0.5">
                              <ShieldCheck className="w-3 h-3" />
                              {room.cancellationPolicy}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {(() => {
                              const total = room.totalRooms ?? 5;
                              const avail = room.availableRooms ?? total;
                              const isFull = avail <= 0 || room.status === 'maintenance';
                              return (
                                <button
                                  onClick={() => onSelectRoom(room)}
                                  className={`px-5 py-2.5 text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer ${
                                    isFull
                                      ? 'bg-stone-300 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                                      : 'bg-[#0D4739] hover:bg-[#083329] active:scale-[0.98] text-white'
                                  }`}
                                >
                                  <span>{isFull ? 'Sold Out (View Details)' : 'View & Reserve'}</span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          )}
        </main>
      </div>

      {/* Mobile Filters Drawer / Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-white dark:bg-[#101C18] h-full p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-[#1F332C]">
              <h3 className="font-serif text-xl font-medium text-stone-900 dark:text-stone-100">Filters</h3>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="text-stone-500 dark:text-stone-400 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Mobile Categories */}
            <div>
              <p className="text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase mb-2">Category</p>
              <div className="space-y-1">
                {[
                  { id: 'all', label: 'All Room Types' },
                  { id: 'standard', label: 'Standard Room' },
                  { id: 'deluxe', label: 'Deluxe Oceanfront' },
                  { id: 'suite', label: 'Presidential Suite' },
                  { id: 'villa', label: 'Coconut Grove Villa' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectRoomType(opt.id as RoomType)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium cursor-pointer ${
                      filters.roomType === opt.id
                        ? 'bg-[#0D4739] text-white'
                        : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#172A24]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Price */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-stone-800 dark:text-stone-200 mb-2">
                <span>Max Price</span>
                <span>LKR {filters.maxPrice.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="10000"
                max="60000"
                step="2500"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) })}
                className="w-full accent-[#0D4739] dark:accent-[#C2A26F]"
              />
            </div>

            <div className="space-y-2">
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full py-3 bg-[#0D4739] hover:bg-[#083329] text-white font-medium rounded-xl text-sm cursor-pointer shadow-md"
              >
                Apply Filters ({filteredRooms.length} rooms)
              </button>
              <button
                onClick={() => {
                  resetFilters();
                  setMobileFilterOpen(false);
                }}
                className="w-full py-2.5 bg-stone-100 dark:bg-[#162A24] text-stone-700 dark:text-stone-300 font-medium rounded-xl text-xs cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
