import React from 'react';
import { Waves, Sparkles, Utensils, Flower2, ShieldCheck, Clock } from 'lucide-react';
import { ScrollReveal, StaggerContainer, StaggerItem } from './ScrollReveal';

export const HotelHighlights: React.FC = () => {
  const highlights = [
    {
      icon: Waves,
      title: 'Bentota Oceanfront',
      description: 'Step directly from your terrace onto golden, secluded Sri Lankan coastline.'
    },
    {
      icon: Flower2,
      title: 'Ayurvedic Wellness Spa',
      description: 'Ancient healing therapies, customized herbal oils, and sunrise beach yoga.'
    },
    {
      icon: Utensils,
      title: 'Artisanal Coastal Cuisine',
      description: 'Fresh seafood catches and organic spices sourced daily from local markets.'
    },
    {
      icon: Clock,
      title: '24/7 Personalized Concierge',
      description: 'Curated river safaris, whale watching excursions, and private butler care.'
    }
  ];

  return (
    <section id="amenities-section" className="py-16 bg-[#F4F4F0] dark:bg-[#07100E] border-y border-stone-200/80 dark:border-[#1F332C] transition-colors duration-300 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal animation="fade-up" className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-widest text-[#0D4739] dark:text-[#C2A26F] font-semibold">
            The Serene Stay Experience
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#1A1F1D] dark:text-[#F5F5F0] font-medium tracking-tight mt-2">
            Restorative simplicity by the ocean
          </h2>
          <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 mt-2">
            Every detail is designed to soothe your senses and ground you in the gentle rhythms of Ceylon.
          </p>
        </ScrollReveal>

        <StaggerContainer
          staggerDelay={0.14}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {highlights.map((item, idx) => {
            const Icon = item.icon;
            return (
              <StaggerItem key={idx} animation="fade-up">
                <div className="bg-white dark:bg-[#101C18] rounded-2xl p-6 shadow-sm border border-stone-200/70 dark:border-[#1F332C] hover:shadow-md hover:-translate-y-1 transition-all duration-300 h-full flex flex-col transform-gpu">
                  <div className="w-12 h-12 rounded-xl bg-[#0D4739]/10 dark:bg-[#0D4739]/30 text-[#0D4739] dark:text-[#C2A26F] flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-lg font-medium text-[#1A1F1D] dark:text-[#F5F5F0] mb-1.5">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed flex-1">
                    {item.description}
                  </p>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
};
