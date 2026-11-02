import React from 'react';
import { AppView } from '../types';
import { MapPin, Phone, Mail, Instagram, Facebook, Globe } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';

interface FooterProps {
  onNavigate: (view: AppView) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#072B23] text-stone-300 pt-16 pb-12 border-t border-[#0D4739] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal animation="fade-up" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#C2A26F]/20 flex items-center justify-center text-[#C2A26F]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-4 h-4"
                >
                  <circle cx="12" cy="12" r="2.5" />
                  <path d="M12 2a4 4 0 0 0-4 4c0 2 2 3.5 4 6 2-2.5 4-4 4-6a4 4 0 0 0-4-4z" />
                  <path d="M12 22a4 4 0 0 0 4-4c0-2-2-3.5-4-6-2 2.5-4 4-4 6a4 4 0 0 0 4 4z" />
                </svg>
              </div>
              <span className="font-serif text-2xl tracking-tight text-white font-medium">
                Serene Stay
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-300/80 max-w-sm leading-relaxed">
              A secluded oceanfront boutique sanctuary along the Bentota coast of Sri Lanka. 
              Restorative architecture, handcrafted teak timber, and genuine Ceylon hospitality.
            </p>
            <div className="flex items-center gap-4 text-stone-400 pt-2">
              <span className="hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#C2A26F]" /> Galle Road, Bentota 80500, Sri Lanka
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-300/80">
              <li>
                <button
                  onClick={() => onNavigate('search')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Suites & Oceanfront Rooms
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('search')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Coconut Grove Villa
                </button>
              </li>
              <li>
                <a href="#amenities-section" className="hover:text-white transition-colors">
                  Ayurveda Spa & Wellness
                </a>
              </li>
              <li>
                <a href="#amenities-section" className="hover:text-white transition-colors">
                  Artisanal Ceylon Dining
                </a>
              </li>
            </ul>
          </div>

          {/* Guest Services */}
          <div>
            <h4 className="font-serif text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Guest Services
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-300/80">
              <li>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Manage My Reservations
                </button>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  Airport Chauffeur Transfer
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  Direct Booking Guarantee
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  PayHere & Local Gateways
                </span>
              </li>
            </ul>
          </div>

          {/* Contact & Hours */}
          <div>
            <h4 className="font-serif text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Direct Inquiries
            </h4>
            <ul className="space-y-2 text-xs text-stone-300/80">
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#C2A26F]" />
                <span>+94 (34) 227 5000</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#C2A26F]" />
                <span>reservations@serenestay.lk</span>
              </li>
              <li className="text-[11px] text-stone-400 pt-2">
                Front desk available 24 hours daily.
              </li>
            </ul>
          </div>

        </ScrollReveal>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 gap-4">
          <p>© 2026 Serene Stay Resort & Spa. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="text-stone-300">Currency: <strong>LKR (Sri Lankan Rupee)</strong></span>
            <span>·</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
