import React from 'react';
import { Room } from '../types';
import { ImageWithFallback } from './ImageWithFallback';
import { ArrowUpRight, Star } from 'lucide-react';
import { ScrollReveal, StaggerContainer, StaggerItem } from './ScrollReveal';

interface FeaturedRoomsProps {
  rooms: Room[];
  onSelectRoom: (room: Room) => void;
}

export const FeaturedRooms: React.FC<FeaturedRoomsProps> = ({ rooms, onSelectRoom }) => {
  // Grab the 3 featured rooms shown in the uploaded screenshot
  const featured = rooms.filter((r) => r.featured).slice(0, 3);

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header with Scroll Reveal */}
      <ScrollReveal animation="fade-up" className="flex items-end justify-between mb-8">
        <div>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#1A1F1D] dark:text-[#F5F5F0] tracking-tight font-medium">
            Featured rooms
          </h2>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            Handpicked coastal sanctuaries curated for tranquility and comfort
          </p>
        </div>
      </ScrollReveal>

      {/* 3-Column Grid with Staggered Scroll Animation */}
      <StaggerContainer
        staggerDelay={0.16}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
      >
        {featured.map((room) => (
          <StaggerItem key={room.id} animation="fade-up">
            <div
              onClick={() => onSelectRoom(room)}
              className="group cursor-pointer bg-white dark:bg-[#101C18] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-stone-200/80 dark:border-[#1F332C] transition-all duration-300 flex flex-col h-full transform-gpu"
            >
              {/* Image Container with 4:3 / 16:10 aspect ratio */}
              <div className="relative aspect-[16/10] overflow-hidden bg-stone-100 dark:bg-[#0A1210]">
                <ImageWithFallback
                  src={room.images[0]}
                  alt={room.name}
                  fallbackTitle={room.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                {/* Live Vacancy Badge */}
                {(() => {
                  const total = room.totalRooms ?? 5;
                  const avail = room.availableRooms ?? total;
                  const isFull = avail <= 0 || room.status === 'maintenance';
                  return (
                    <div
                      className={`absolute top-3 left-3 px-2.5 py-1 rounded-md text-[11px] font-semibold backdrop-blur-md shadow-sm ${
                        isFull
                          ? 'bg-rose-600/90 text-white'
                          : avail <= 2
                          ? 'bg-amber-500/95 text-stone-950'
                          : 'bg-[#0D4739]/90 text-white'
                      }`}
                    >
                      {isFull ? 'Sold Out · 0 Vacant' : `${avail} of ${total} Rooms Vacant`}
                    </div>
                  );
                })()}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="w-9 h-9 rounded-full bg-white/90 dark:bg-[#101C18]/90 backdrop-blur-md text-[#0D4739] dark:text-[#C2A26F] flex items-center justify-center shadow-md">
                    <ArrowUpRight className="w-4 h-4" />
                  </span>
                </div>
              </div>

              {/* Bottom Row: Title on left, LKR Price on right */}
              <div className="p-5 flex items-center justify-between flex-1">
                <div>
                  <h3 className="font-serif text-xl font-medium text-[#1A1F1D] dark:text-[#F5F5F0] group-hover:text-[#0D4739] dark:group-hover:text-[#D4B683] transition-colors">
                    {room.type === 'standard' ? 'Standard' : room.type === 'deluxe' ? 'Deluxe' : 'Suite'}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      {room.rating}
                    </span>
                    <span>·</span>
                    <span>{room.beds}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-serif font-medium text-base sm:text-lg text-[#1A1F1D] dark:text-[#F5F5F0] tabular-nums">
                    LKR {room.pricePerNight.toLocaleString()}
                  </span>
                  <span className="text-xs text-stone-500 dark:text-stone-400 block">/ night</span>
                </div>
              </div>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </section>
  );
};
