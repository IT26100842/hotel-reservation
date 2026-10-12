import React, { useState } from 'react';
import { AuthModalType, UserProfile } from '../types';
import { authApi } from '../services/api';
import { saveUserSession } from '../utils/cookies';
import { validateFullName, validateEmail, validatePhoneNumber } from '../utils/validation';
import { X, Lock, Mail, User, Phone, Eye, EyeOff, Check, Sparkles, AlertCircle } from 'lucide-react';

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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [regTouched, setRegTouched] = useState<{ fullName: boolean; phone: boolean }>({
    fullName: false,
    phone: false
  });
  const [resetSent, setResetSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  if (!type) return null;

  const regNameError = validateFullName(fullName);
  const regPhoneError = validatePhoneNumber(phone);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAuthError(null);
    try {
      const user = await authApi.login(email, password);
      saveUserSession(user);
      onLoginSuccess(user);
      onClose();
    } catch (err: any) {
      setAuthError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setRegTouched({ fullName: true, phone: true });

    const nameErr = validateFullName(fullName);
    if (nameErr) {
      setAuthError(nameErr);
      return;
    }
    const emailErr = validateEmail(email);
    if (emailErr) {
      setAuthError(emailErr);
      return;
    }
    const phoneErr = validatePhoneNumber(phone);
    if (phoneErr) {
      setAuthError(phoneErr);
      return;
    }
    if (password.trim().length < 6) {
      setAuthError('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await authApi.register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
        city: 'Colombo',
        country: 'Sri Lanka'
      });
      saveUserSession(user);
      onLoginSuccess(user);
      onClose();
    } catch (err: any) {
      setAuthError(err.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setAuthError('Please enter your email address.');
      return;
    }
    setAuthError(null);
    setResetSent(true);
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
              onClick={() => { setActiveTab('login'); setAuthError(null); }}
              className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'login'
                  ? 'border-[#0D4739] dark:border-[#C2A26F] text-[#0D4739] dark:text-[#C2A26F]'
                  : 'border-transparent text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
              }`}
            >
              Log in
            </button>
            <button
              onClick={() => { setActiveTab('register'); setAuthError(null); }}
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

        {authError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium">
            {authError}
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
                  autoComplete="username email"
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
                    setAuthError(null);
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
                  autoComplete="current-password"
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
              disabled={isSubmitting}
              className="w-full py-3 bg-[#0D4739] hover:bg-[#083329] text-white text-sm font-semibold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Signing In...' : 'Sign In to Serene Stay'}
            </button>
          </form>
        )}

        {/* Register Form */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                Your Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value.replace(/[0-9]/g, ''));
                    setRegTouched((prev) => ({ ...prev, fullName: true }));
                    setAuthError(null);
                  }}
                  onBlur={() => setRegTouched((prev) => ({ ...prev, fullName: true }))}
                  placeholder="e.g. Ruwan Wickramasinghe (Letters only)"
                  className={`w-full pl-9 pr-3.5 py-2.5 bg-stone-50 dark:bg-[#172A24]/40 border rounded-xl text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-600 focus:bg-white dark:focus:bg-[#12201C] focus:outline-none focus:ring-2 ${
                    regTouched.fullName && regNameError
                      ? 'border-rose-400 dark:border-rose-500/70 focus:ring-rose-500'
                      : 'border-stone-300 dark:border-[#1F332C] focus:ring-[#0D4739] dark:focus:ring-[#C2A26F]'
                  }`}
                />
                <User className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3 top-3.5" />
              </div>
              {regTouched.fullName && regNameError && (
                <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{regNameError}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setAuthError(null);
                  }}
                  placeholder="you@domain.com"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-stone-50 dark:bg-[#172A24]/40 border border-stone-300 dark:border-[#1F332C] rounded-xl text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-600 focus:bg-white dark:focus:bg-[#12201C] focus:outline-none focus:ring-2 focus:ring-[#0D4739] dark:focus:ring-[#C2A26F]"
                />
                <Mail className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value.replace(/[^0-9+\s()-]/g, ''));
                    setRegTouched((prev) => ({ ...prev, phone: true }));
                    setAuthError(null);
                  }}
                  onBlur={() => setRegTouched((prev) => ({ ...prev, phone: true }))}
                  placeholder="+94 77 123 4567 or 0771234567"
                  className={`w-full pl-9 pr-3.5 py-2.5 bg-stone-50 dark:bg-[#172A24]/40 border rounded-xl text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-600 focus:bg-white dark:focus:bg-[#12201C] focus:outline-none focus:ring-2 ${
                    regTouched.phone && regPhoneError
                      ? 'border-rose-400 dark:border-rose-500/70 focus:ring-rose-500'
                      : 'border-stone-300 dark:border-[#1F332C] focus:ring-[#0D4739] dark:focus:ring-[#C2A26F]'
                  }`}
                />
                <Phone className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3 top-3.5" />
              </div>
              {regTouched.phone && regPhoneError && (
                <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{regPhoneError}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                Create Password (Min 6 Characters)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
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
              disabled={isSubmitting}
              className="w-full py-3 bg-[#0D4739] hover:bg-[#083329] text-white text-sm font-semibold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Creating Account...' : 'Create Free Account'}
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
                      autoComplete="email"
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
