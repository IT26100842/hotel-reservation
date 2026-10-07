import React, { useState } from 'react';
import { AuthModalType, UserProfile } from '../types';
import { X, Lock, Mail, User, Eye, EyeOff, Check, ArrowRight, Sparkles } from 'lucide-react';

interface AuthModalProps {
  type: AuthModalType;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  type,
  onClose,
  onLoginSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot'>(
    type === 'register' ? 'register' : type === 'forgot-password' ? 'forgot' : 'login'
  );

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('thilinakavishan42@gmail.com');
  const [password, setPassword] = useState('••••••••••');
  const [fullName, setFullName] = useState('Thilina Kavishan');
  const [resetSent, setResetSent] = useState(false);

  if (!type) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const demoUser: UserProfile = {
      id: 'usr-' + Date.now(),
      fullName: fullName || 'Thilina Kavishan',
      email: email || 'thilinakavishan42@gmail.com',
      phone: '+94 77 123 4567',
      city: 'Colombo',
      country: 'Sri Lanka',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      preferredCurrency: 'LKR',
      memberSince: 'October 2026',
      savedRoomIds: ['room-2', 'room-3']
    };
    onLoginSuccess(demoUser);
    onClose();
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResetSent(true);
  };

  const handleQuickDemo = () => {
    const demoUser: UserProfile = {
      id: 'usr-demo',
      fullName: 'Thilina Kavishan',
      email: 'thilinakavishan42@gmail.com',
      phone: '+94 77 123 4567',
      city: 'Colombo',
      country: 'Sri Lanka',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      preferredCurrency: 'LKR',
      memberSince: 'January 2025',
      savedRoomIds: ['room-2', 'room-3']
    };
    onLoginSuccess(demoUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#101C18] rounded-3xl p-5 sm:p-8 max-w-md w-full shadow-2xl border border-stone-200 dark:border-[#1F332C] relative animate-in fade-in zoom-in-95 my-auto max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain transition-colors">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Brand Lockup */}
        <div className="text-center mb-6">
          <div className="w-10 h-10 rounded-full bg-[#0D4739]/10 dark:bg-[#C2A26F]/15 text-[#0D4739] dark:text-[#C2A26F] flex items-center justify-center mx-auto mb-2">
            <Sparkles className="w-5 h-5" />
          </div>
          <h2 className="font-serif text-2xl font-medium text-stone-900 dark:text-stone-100">
            Serene Stay
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Your private key to Sri Lanka's barefoot luxury
          </p>
        </div>

        {/* Tab Switcher */}
        {activeTab !== 'forgot' && (
          <div className="flex border-b border-stone-200 dark:border-[#1F332C] mb-6">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'login'
                  ? 'border-[#0D4739] dark:border-[#C2A26F] text-[#0D4739] dark:text-[#C2A26F]'
                  : 'border-transparent text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
              }`}
            >
              Log in
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'register'
                  ? 'border-[#0D4739] dark:border-[#C2A26F] text-[#0D4739] dark:text-[#C2A26F]'
                  : 'border-transparent text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
              }`}
            >
              Create account
            </button>
          </div>
        )}

        {/* Login Form */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-stone-50 dark:bg-[#172A24]/40 border border-stone-300 dark:border-[#1F332C] rounded-xl text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-600 focus:bg-white dark:focus:bg-[#12201C] focus:outline-none focus:ring-2 focus:ring-[#0D4739] dark:focus:ring-[#C2A26F]"
                />
                <Mail className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3 top-3.5" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('forgot');
                    setResetSent(false);
                  }}
                  className="text-xs text-[#0D4739] dark:text-[#C2A26F] hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 bg-stone-50 dark:bg-[#172A24]/40 border border-stone-300 dark:border-[#1F332C] rounded-xl text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-600 focus:bg-white dark:focus:bg-[#12201C] focus:outline-none focus:ring-2 focus:ring-[#0D4739] dark:focus:ring-[#C2A26F]"
                />
                <Lock className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#0D4739] hover:bg-[#083329] text-white text-sm font-semibold rounded-xl shadow-md transition-all cursor-pointer"
            >
              Sign In to Serene Stay
            </button>

            {/* Quick Demo Login Helper */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleQuickDemo}
                className="w-full py-2.5 bg-stone-100 dark:bg-[#172A24] hover:bg-stone-200 dark:hover:bg-[#1E362F] text-stone-800 dark:text-stone-200 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#0D4739] dark:text-[#C2A26F]" />
                <span>Quick Demo Sign-in (1-Click)</span>
              </button>
            </div>
          </form>
        )}

        {/* Register Form */}
        {activeTab === 'register' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                Your Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Thilina Kavishan"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-stone-50 dark:bg-[#172A24]/40 border border-stone-300 dark:border-[#1F332C] rounded-xl text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-600 focus:bg-white dark:focus:bg-[#12201C] focus:outline-none focus:ring-2 focus:ring-[#0D4739] dark:focus:ring-[#C2A26F]"
                />
                <User className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-stone-50 dark:bg-[#172A24]/40 border border-stone-300 dark:border-[#1F332C] rounded-xl text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-600 focus:bg-white dark:focus:bg-[#12201C] focus:outline-none focus:ring-2 focus:ring-[#0D4739] dark:focus:ring-[#C2A26F]"
                />
                <Mail className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                Create Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full pl-9 pr-10 py-2.5 bg-stone-50 dark:bg-[#172A24]/40 border border-stone-300 dark:border-[#1F332C] rounded-xl text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-600 focus:bg-white dark:focus:bg-[#12201C] focus:outline-none focus:ring-2 focus:ring-[#0D4739] dark:focus:ring-[#C2A26F]"
                />
                <Lock className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              By creating an account, you agree to Serene Stay's Terms of Hospitality and Privacy Policy.
            </p>

            <button
              type="submit"
              className="w-full py-3 bg-[#0D4739] hover:bg-[#083329] text-white text-sm font-semibold rounded-xl shadow-md transition-all cursor-pointer"
            >
              Create Free Account
            </button>
          </form>
        )}

        {/* Forgot Password Flow */}
        {activeTab === 'forgot' && (
          <div className="space-y-4">
            {!resetSent ? (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                  Enter your registered email address below. We will send a secure password reset link to your inbox.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@domain.com"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-stone-50 dark:bg-[#172A24]/40 border border-stone-300 dark:border-[#1F332C] rounded-xl text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-600 focus:bg-white dark:focus:bg-[#12201C] focus:outline-none focus:ring-2 focus:ring-[#0D4739] dark:focus:ring-[#C2A26F]"
                    />
                    <Mail className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3 top-3.5" />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#0D4739] hover:bg-[#083329] text-white text-sm font-semibold rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Send Reset Link
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('login')}
                    className="text-xs text-[#0D4739] dark:text-[#C2A26F] font-medium hover:underline cursor-pointer"
                  >
                    ← Back to Log in
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-4 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-[#0D4739] dark:text-emerald-300 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-lg font-medium text-stone-900 dark:text-stone-100">
                  Password Reset Email Sent
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-300 max-w-xs mx-auto">
                  We've dispatched recovery instructions to <strong className="text-stone-900 dark:text-stone-100">{email}</strong>. Please check your inbox or spam folder.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="px-6 py-2 bg-stone-900 dark:bg-stone-200 text-white dark:text-stone-900 rounded-xl text-xs font-semibold hover:bg-stone-800 dark:hover:bg-white transition-colors cursor-pointer"
                >
                  Return to Sign In
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
