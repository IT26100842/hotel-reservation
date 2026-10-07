import React, { useState, useEffect } from 'react';
import {
  motion,
  HTMLMotionProps,
  Variants,
  useScroll,
  useSpring,
  AnimatePresence
} from 'motion/react';
import { ArrowUp } from 'lucide-react';

export type AnimationType =
  | 'fade-up'
  | 'fade-down'
  | 'fade-left'
  | 'fade-right'
  | 'zoom-in'
  | 'fade'
  | 'blur-in';

interface ScrollRevealProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  animation?: AnimationType;
  delay?: number;
  duration?: number;
  className?: string;
  amount?: number | 'some' | 'all';
  once?: boolean;
}

const getVariants = (animation: AnimationType, duration: number, delay: number): Variants => {
  // Premium cubic-bezier easing with smooth luxury deceleration
  const transitions = {
    duration,
    delay,
    ease: [0.16, 1, 0.3, 1] as const
  };

  switch (animation) {
    case 'fade-up':
      return {
        hidden: { opacity: 0, y: 35 },
        visible: { opacity: 1, y: 0, transition: transitions }
      };
    case 'fade-down':
      return {
        hidden: { opacity: 0, y: -35 },
        visible: { opacity: 1, y: 0, transition: transitions }
      };
    case 'fade-left':
      return {
        hidden: { opacity: 0, x: -35 },
        visible: { opacity: 1, x: 0, transition: transitions }
      };
    case 'fade-right':
      return {
        hidden: { opacity: 0, x: 35 },
        visible: { opacity: 1, x: 0, transition: transitions }
      };
    case 'zoom-in':
      return {
        hidden: { opacity: 0, scale: 0.94, y: 20 },
        visible: { opacity: 1, scale: 1, y: 0, transition: transitions }
      };
    case 'blur-in':
      return {
        hidden: { opacity: 0, filter: 'blur(10px)', y: 25 },
        visible: { opacity: 1, filter: 'blur(0px)', y: 0, transition: transitions }
      };
    case 'fade':
    default:
      return {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: transitions }
      };
  }
};

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  animation = 'fade-up',
  delay = 0,
  duration = 0.6,
  className = '',
  amount = 0.08,
  once = true,
  ...rest
}) => {
  const variants = getVariants(animation, duration, delay);

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount, margin: '0px 0px -25px 0px' }}
      variants={variants}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
};

interface StaggerContainerProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  staggerDelay?: number;
  delayChildren?: number;
  className?: string;
  amount?: number | 'some' | 'all';
  once?: boolean;
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  staggerDelay = 0.12,
  delayChildren = 0.04,
  className = '',
  amount = 0.06,
  once = true,
  ...rest
}) => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren
      }
    }
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount, margin: '0px 0px -20px 0px' }}
      variants={containerVariants}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem: React.FC<{
  children: React.ReactNode;
  className?: string;
  animation?: 'fade-up' | 'zoom-in' | 'blur-in';
}> = ({ children, className = '', animation = 'fade-up' }) => {
  const itemVariants: Variants = {
    hidden:
      animation === 'zoom-in'
        ? { opacity: 0, scale: 0.93, y: 25 }
        : animation === 'blur-in'
        ? { opacity: 0, filter: 'blur(8px)', y: 25 }
        : { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
      y: 0,
      transition: {
        duration: 0.55,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
};

/**
 * Top Scroll Progress Bar:
 * Displays a thin, luxury gold & emerald gradient line tracking scroll position.
 */
export const ScrollProgressBar: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      style={{ scaleX, transformOrigin: '0%' }}
      className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#0D4739] via-[#C2A26F] to-[#125B49] z-[999] pointer-events-none"
    />
  );
};

/**
 * Floating Scroll-To-Top Button with Circular Progress:
 * Appears when scrolling down past 300px, showing percentage of page traversed.
 */
export const ScrollToTopButton: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [scrollPercent, setScrollPercent] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollPercent(Math.min(100, Math.max(0, progress)));
      setVisible(scrollTop > 260);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          initial={{ opacity: 0, scale: 0.7, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.7, y: 20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          onClick={scrollToTop}
          title="Scroll back to top"
          aria-label="Scroll back to top"
          className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-white dark:bg-[#101C18] text-[#0D4739] dark:text-[#C2A26F] shadow-xl border border-stone-200 dark:border-[#1F332C] flex items-center justify-center cursor-pointer group hover:scale-105 transition-transform"
        >
          {/* Circular progress SVG ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 48 48">
            <circle
              cx="24"
              cy="24"
              r="20"
              className="text-stone-200/50 dark:text-stone-800/80"
              strokeWidth="2.5"
              stroke="currentColor"
              fill="transparent"
            />
            <circle
              cx="24"
              cy="24"
              r="20"
              className="text-[#0D4739] dark:text-[#C2A26F] transition-all duration-100 ease-out"
              strokeWidth="2.5"
              strokeDasharray={2 * Math.PI * 20}
              strokeDashoffset={2 * Math.PI * 20 - (2 * Math.PI * 20 * scrollPercent) / 100}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>
          <ArrowUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

