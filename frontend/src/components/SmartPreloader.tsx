import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface SmartPreloaderProps {
  onComplete: () => void;
}

export const SmartPreloader: React.FC<SmartPreloaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Welcome to Serene Stay...');

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev < 30) {
          setStatusText('Preparing your coastal sanctuary...');
          return prev + 6;
        } else if (prev < 70) {
          setStatusText('Curating oceanfront suites & villas...');
          return prev + 8;
        } else if (prev < 98) {
          setStatusText('Welcome to barefoot luxury...');
          return prev + 5;
        } else {
          clearInterval(timer);
          setTimeout(onComplete, 350);
          return 100;
        }
      });
    }, 45);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#072B23] text-white"
      >
        {/* Subtle background ambient glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(194,162,111,0.12)_0%,transparent_70%)] pointer-events-none" />

        <div className="relative flex flex-col items-center max-w-sm px-6 text-center">
          {/* Elegant geometric petal emblem */}
          <motion.div
            initial={{ scale: 0.8, rotate: -20, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="w-16 h-16 mb-6 relative flex items-center justify-center"
          >
            <div className="absolute inset-0 rounded-full border border-[#C2A26F]/30 animate-ping opacity-25" />
            <svg
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-12 h-12 text-[#C2A26F]"
            >
              <circle cx="24" cy="24" r="5" stroke="currentColor" strokeWidth="2" />
              <path
                d="M24 6C24 6 29 13 29 18C29 20.76 26.76 23 24 23C21.24 23 19 20.76 19 18C19 13 24 6 24 6Z"
                stroke="currentColor"
                strokeWidth="2"
                fill="currentColor"
                fillOpacity="0.2"
              />
              <path
                d="M24 42C24 42 19 35 19 30C19 27.24 21.24 25 24 25C26.76 25 29 27.24 29 30C29 35 24 42 24 42Z"
                stroke="currentColor"
                strokeWidth="2"
                fill="currentColor"
                fillOpacity="0.2"
              />
              <path
                d="M6 24C6 24 13 19 18 19C20.76 19 23 21.24 23 24C23 26.76 20.76 29 18 29C13 29 6 24 6 24Z"
                stroke="currentColor"
                strokeWidth="2"
                fill="currentColor"
                fillOpacity="0.2"
              />
              <path
                d="M42 24C42 24 35 29 30 29C27.24 29 25 26.76 25 24C25 21.24 27.24 19 30 19C35 19 42 24 42 24Z"
                stroke="currentColor"
                strokeWidth="2"
                fill="currentColor"
                fillOpacity="0.2"
              />
            </svg>
          </motion.div>

          {/* Hotel Name */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-3xl font-serif tracking-tight text-[#FAF9F5] mb-2"
          >
            Serene Stay
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-xs uppercase tracking-widest text-[#C2A26F] font-medium mb-8"
          >
            Boutique Resort & Spa · Sri Lanka
          </motion.p>

          {/* Progress bar */}
          <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden relative mb-4">
            <motion.div
              className="h-full bg-gradient-to-r from-[#C2A26F] to-[#E9D8A6] rounded-full"
              style={{ width: `${progress}%` }}
              transition={{ ease: 'linear' }}
            />
          </div>

          {/* Dynamic text */}
          <div className="h-5 flex items-center justify-center">
            <p className="text-xs text-white/70 font-light transition-all duration-300">
              {statusText}
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
