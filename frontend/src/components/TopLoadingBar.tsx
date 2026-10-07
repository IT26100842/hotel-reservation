import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface TopLoadingBarProps {
  isLoading: boolean;
  progress?: number;
}

export const TopLoadingBar: React.FC<TopLoadingBarProps> = ({ isLoading, progress = 0 }) => {
  return (
    <AnimatePresence>
      {isLoading && (
        <div className="fixed top-0 left-0 right-0 z-[100] h-[3px] bg-transparent pointer-events-none">
          <motion.div
            initial={{ width: '0%', opacity: 1 }}
            animate={{
              width: `${Math.max(progress, 20)}%`,
              opacity: 1
            }}
            exit={{
              width: '100%',
              opacity: 0,
              transition: { duration: 0.35, ease: 'easeOut' }
            }}
            transition={{
              duration: 0.4,
              ease: [0.16, 1, 0.3, 1]
            }}
            className="h-full bg-gradient-to-r from-[#0D4739] via-[#C2A26F] to-[#166534] shadow-[0_0_10px_rgba(194,162,111,0.8)] relative"
          >
            {/* Bright glowing leading light pip */}
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-white/70 shadow-[0_0_8px_#ffffff] transform rotate-12" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
