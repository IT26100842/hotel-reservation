import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Laptop, Check } from 'lucide-react';
import { ThemeMode } from '../types';

interface ThemeToggleProps {
  className?: string;
  variant?: 'compact' | 'segmented';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  variant = 'compact'
}) => {
  const { theme, effectiveTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const options: { mode: ThemeMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { mode: 'light', label: 'Light', icon: Sun },
    { mode: 'dark', label: 'Dark', icon: Moon },
    { mode: 'system', label: 'System', icon: Laptop }
  ];

  if (variant === 'segmented') {
    return (
      <div className={`p-1 bg-stone-100 dark:bg-[#12201C] rounded-2xl flex items-center border border-stone-200 dark:border-[#1F332C] ${className}`}>
        {options.map(({ mode, label, icon: Icon }) => {
          const isActive = theme === mode;
          return (
            <button
              key={mode}
              type="button"
              onClick={() => setTheme(mode)}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                isActive
                  ? 'bg-white dark:bg-[#0D4739] text-[#0D4739] dark:text-emerald-100 shadow-sm'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{label}</span>
              {mode === 'system' && (
                <span className="text-[10px] opacity-70">
                  ({effectiveTheme === 'dark' ? 'Dark' : 'Light'})
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Compact Dropdown variant for header
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle display theme"
        title={`Theme: ${theme.toUpperCase()} (${effectiveTheme} active)`}
        className="w-9 h-9 rounded-full flex items-center justify-center border border-stone-200 dark:border-[#1F332C] bg-stone-50 dark:bg-[#101C18] text-stone-700 dark:text-stone-200 hover:text-[#0D4739] dark:hover:text-[#C2A26F] hover:border-[#0D4739]/40 dark:hover:border-[#C2A26F]/40 transition-all cursor-pointer shadow-2xs group"
      >
        {effectiveTheme === 'dark' ? (
          <Moon className="w-4 h-4 text-[#C2A26F] group-hover:scale-110 transition-transform" />
        ) : (
          <Sun className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-[#12201C] rounded-2xl shadow-xl border border-stone-200 dark:border-[#1F332C] py-1.5 z-50 animate-in fade-in slide-in-from-top-2">
          <div className="px-3 py-1.5 border-b border-stone-100 dark:border-[#1F332C] text-[10px] font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
            Appearance
          </div>
          {options.map(({ mode, label, icon: Icon }) => {
            const isSelected = theme === mode;
            return (
              <button
                key={mode}
                type="button"
                onClick={() => {
                  setTheme(mode);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 text-xs flex items-center justify-between text-left transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#0D4739]/10 dark:bg-[#0D4739]/40 text-[#0D4739] dark:text-[#C2A26F] font-semibold'
                    : 'text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-[#172A24]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{label}</span>
                  {mode === 'system' && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 dark:bg-[#0A1210] text-stone-500 dark:text-stone-400">
                      Auto
                    </span>
                  )}
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#0D4739] dark:text-[#C2A26F]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
