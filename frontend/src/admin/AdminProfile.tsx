import React, { useState, useEffect, useRef } from 'react';
import {
  UserIcon,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  ShieldCheckIcon,
  CameraIcon,
  UploadIcon,
  TrashIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  XIcon,
  SaveIcon
} from 'lucide-react';
import { UserProfile } from '../types';
import { getAvatarUrl, hasCustomAvatar, resizeImageForUpload, NO_DP_AVATAR } from '../utils/avatar';
import { validateFullName, validateEmail, validatePhoneNumber } from '../utils/validation';

interface AdminProfileProps {
  adminUser: UserProfile;
  onUpdateProfile: (profileData: Partial<UserProfile>) => Promise<UserProfile>;
  onUploadAvatar: (base64Image: string) => Promise<UserProfile>;
  onRemoveAvatar: () => Promise<UserProfile>;
  onChangePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  notify: (msg: string, type?: 'success' | 'error') => void;
}

export function AdminProfile({
  adminUser,
  onUpdateProfile,
  onUploadAvatar,
  onRemoveAvatar,
  onChangePassword,
  notify
}: AdminProfileProps) {
  // Personal Profile Form State
  const [profileForm, setProfileForm] = useState({
    fullName: adminUser.fullName || '',
    email: adminUser.email || '',
    phone: adminUser.phone || '',
    city: adminUser.city || '',
    country: adminUser.country || 'Sri Lanka'
  });
  const [profileTouched, setProfileTouched] = useState({
    fullName: false,
    email: false,
    phone: false,
    city: false,
    country: false
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password Change Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordTouched, setPasswordTouched] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Avatar Upload Modal State
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarSizeKB, setAvatarSizeKB] = useState<number | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setProfileForm({
      fullName: adminUser.fullName || '',
      email: adminUser.email || '',
      phone: adminUser.phone || '',
      city: adminUser.city || '',
      country: adminUser.country || 'Sri Lanka'
    });
  }, [adminUser]);

  // Real-time Validation for Personal Profile Details
  const validateCityOrCountry = (value: string, label: string): string | null => {
    const trimmed = (value || '').trim();
    if (!trimmed) {
      return `${label} is required.`;
    }
    if (/\d/.test(trimmed)) {
      return `${label} cannot contain numbers.`;
    }
    if (!/^[\p{L}\p{M}\s.'-]+$/u.test(trimmed)) {
      return `${label} can only contain letters and spaces.`;
    }
    if (trimmed.replace(/[^\p{L}\p{M}]/gu, '').length < 2) {
      return `Please enter a valid ${label.toLowerCase()} (at least 2 letters).`;
    }
    return null;
  };

  const profileErrors = {
    fullName: validateFullName(profileForm.fullName),
    email: validateEmail(profileForm.email),
    phone: validatePhoneNumber(profileForm.phone),
    city: validateCityOrCountry(profileForm.city, 'City'),
    country: validateCityOrCountry(profileForm.country, 'Country')
  };

  const isProfileFormValid =
    !profileErrors.fullName &&
    !profileErrors.email &&
    !profileErrors.phone &&
    !profileErrors.city &&
    !profileErrors.country;

  // Real-time Validation for Password Update
  const validateCurrentPassword = (val: string): string | null => {
    if (!val || !val.trim()) {
      return 'Current password is required.';
    }
    return null;
  };

  const validateNewPassword = (val: string, currentVal: string): string | null => {
    if (!val || !val.trim()) {
      return 'New password is required.';
    }
    if (val.trim().length < 6) {
      return 'New password must be at least 6 characters long.';
    }
    if (currentVal.trim() && val.trim() === currentVal.trim()) {
      return 'New password must be different from your current password.';
    }
    return null;
  };

  const validateConfirmPassword = (confirmVal: string, newVal: string): string | null => {
    if (!confirmVal || !confirmVal.trim()) {
      return 'Please confirm your new password.';
    }
    if (confirmVal.trim() !== newVal.trim()) {
      return 'Passwords do not match. Please enter the same new password twice.';
    }
    return null;
  };

  const passwordErrors = {
    currentPassword: validateCurrentPassword(passwordForm.currentPassword),
    newPassword: validateNewPassword(passwordForm.newPassword, passwordForm.currentPassword),
    confirmPassword: validateConfirmPassword(passwordForm.confirmPassword, passwordForm.newPassword)
  };

  const isPasswordFormValid =
    !passwordErrors.currentPassword &&
    !passwordErrors.newPassword &&
    !passwordErrors.confirmPassword;

  // Handlers
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileTouched({
      fullName: true,
      email: true,
      phone: true,
      city: true,
      country: true
    });
    if (!isProfileFormValid) {
      notify('Please fix the highlighted errors before saving your profile.', 'error');
      return;
    }

    setIsSavingProfile(true);
    try {
      await onUpdateProfile({
        fullName: profileForm.fullName.trim(),
        email: profileForm.email.trim().toLowerCase(),
        phone: profileForm.phone.trim(),
        city: profileForm.city.trim(),
        country: profileForm.country.trim()
      });
      setProfileTouched({
        fullName: false,
        email: false,
        phone: false,
        city: false,
        country: false
      });
      notify('Administrator profile details updated successfully!');
    } catch (err: any) {
      notify(err.message || 'Failed to update profile details.', 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordTouched({
      currentPassword: true,
      newPassword: true,
      confirmPassword: true
    });
    if (!isPasswordFormValid) {
      notify('Please fix the password errors highlighted in red.', 'error');
      return;
    }

    setIsSavingPassword(true);
    try {
      await onChangePassword(passwordForm.currentPassword.trim(), passwordForm.newPassword.trim());
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setPasswordTouched({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false
      });
      notify('Your password has been updated successfully!');
    } catch (err: any) {
      notify(err.message || 'Failed to update password. Please verify your current password.', 'error');
    } finally {
      setIsSavingPassword(false);
    }
  };

  // Avatar Handlers
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarError(null);
    setIsProcessingImage(true);
    try {
      const resized = await resizeImageForUpload(file, 360, 0.78);
      setAvatarPreview(resized.base64DataUrl);
      setAvatarSizeKB(resized.compressedSizeKB);
    } catch (err: any) {
      setAvatarError(err.message || 'Failed to process selected image.');
    } finally {
      setIsProcessingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleConfirmAvatarUpload = async () => {
    if (!avatarPreview) return;
    setAvatarError(null);
    setIsUploadingAvatar(true);
    try {
      await onUploadAvatar(avatarPreview);
      setAvatarPreview(null);
      setAvatarSizeKB(null);
      setShowAvatarModal(false);
      notify('Profile photo uploaded to ImgBB and saved successfully!');
    } catch (err: any) {
      setAvatarError(err.message || 'Failed to upload profile photo.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleRemoveAvatarClick = async () => {
    setAvatarError(null);
    setIsUploadingAvatar(true);
    try {
      await onRemoveAvatar();
      setAvatarPreview(null);
      setAvatarSizeKB(null);
      setShowAvatarModal(false);
      notify('Profile photo removed successfully.');
    } catch (err: any) {
      setAvatarError(err.message || 'Failed to remove profile photo.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const hasPhoto = hasCustomAvatar(adminUser.avatar);

  return (
    <div className="space-y-6">
      {/* Top Admin Profile Banner & Avatar Controls */}
      <div className="bg-white dark:bg-[#101F1A] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative group">
              <img
                src={getAvatarUrl(adminUser.avatar)}
                alt={adminUser.fullName}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = NO_DP_AVATAR;
                }}
                className="w-24 h-24 rounded-2xl object-cover ring-4 ring-amber-500/20 border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
              />
              <button
                type="button"
                onClick={() => {
                  setAvatarPreview(null);
                  setAvatarSizeKB(null);
                  setAvatarError(null);
                  setShowAvatarModal(true);
                }}
                title="Change or Remove Profile Photo"
                className="absolute -bottom-2 -right-2 w-9 h-9 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center justify-center shadow-lg transition-transform hover:scale-105"
              >
                <CameraIcon className="w-4 h-4" />
              </button>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {adminUser.fullName}
                </h2>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  <ShieldCheckIcon className="w-3.5 h-3.5" />
                  {(adminUser.role || 'admin').replace('_', ' ')}
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{adminUser.email}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                {hasPhoto ? 'Custom profile photo active' : 'No profile photo uploaded'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setAvatarPreview(null);
                setAvatarSizeKB(null);
                setAvatarError(null);
                setShowAvatarModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-sm shadow-md shadow-amber-500/10 transition-all"
            >
              <CameraIcon className="w-4 h-4" />
              {hasPhoto ? 'Change Photo' : 'Upload Photo'}
            </button>

            {hasPhoto && (
              <button
                type="button"
                disabled={isUploadingAvatar}
                onClick={handleRemoveAvatarClick}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 font-semibold text-sm transition-all disabled:opacity-50"
              >
                <TrashIcon className="w-4 h-4" />
                Remove Photo
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Personal Profile Details & Change Password */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Edit Personal Profile Details */}
        <div className="lg:col-span-7 bg-white dark:bg-[#101F1A] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-amber-500" />
              Personal Profile Details
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Update your administrator profile information. All fields are validated before saving.
            </p>
          </div>

          <form onSubmit={handleSaveProfile} noValidate className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Full Name *
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={profileForm.fullName}
                    onChange={(e) => {
                      setProfileForm({ ...profileForm, fullName: e.target.value });
                      setProfileTouched((prev) => ({ ...prev, fullName: true }));
                    }}
                    onBlur={() => setProfileTouched((prev) => ({ ...prev, fullName: true }))}
                    placeholder="Enter your full name (letters only)"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800/90 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition-all ${
                      (profileTouched.fullName || profileForm.fullName !== adminUser.fullName) && profileErrors.fullName
                        ? 'border-red-500 dark:border-red-500 focus:ring-red-500/30 bg-red-50/40 dark:bg-red-950/20'
                        : 'border-slate-200 dark:border-slate-700 focus:ring-amber-500/40'
                    }`}
                  />
                </div>
                {(profileTouched.fullName || profileForm.fullName !== adminUser.fullName) && profileErrors.fullName && (
                  <p className="text-xs font-medium text-red-600 dark:text-red-400 mt-1.5 flex items-center gap-1">
                    <AlertCircleIcon className="w-3.5 h-3.5 shrink-0" />
                    {profileErrors.fullName}
                  </p>
                )}
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Email Address *
                </label>
                <div className="relative">
                  <MailIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => {
                      setProfileForm({ ...profileForm, email: e.target.value });
                      setProfileTouched((prev) => ({ ...prev, email: true }));
                    }}
                    onBlur={() => setProfileTouched((prev) => ({ ...prev, email: true }))}
                    placeholder="admin@serenestay.com"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800/90 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition-all ${
                      (profileTouched.email || profileForm.email !== adminUser.email) && profileErrors.email
                        ? 'border-red-500 dark:border-red-500 focus:ring-red-500/30 bg-red-50/40 dark:bg-red-950/20'
                        : 'border-slate-200 dark:border-slate-700 focus:ring-amber-500/40'
                    }`}
                  />
                </div>
                {(profileTouched.email || profileForm.email !== adminUser.email) && profileErrors.email && (
                  <p className="text-xs font-medium text-red-600 dark:text-red-400 mt-1.5 flex items-center gap-1">
                    <AlertCircleIcon className="w-3.5 h-3.5 shrink-0" />
                    {profileErrors.email}
                  </p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Phone Number *
                </label>
                <div className="relative">
                  <PhoneIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => {
                      setProfileForm({ ...profileForm, phone: e.target.value });
                      setProfileTouched((prev) => ({ ...prev, phone: true }));
                    }}
                    onBlur={() => setProfileTouched((prev) => ({ ...prev, phone: true }))}
                    placeholder="+94 77 123 4567"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800/90 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition-all ${
                      (profileTouched.phone || profileForm.phone !== adminUser.phone) && profileErrors.phone
                        ? 'border-red-500 dark:border-red-500 focus:ring-red-500/30 bg-red-50/40 dark:bg-red-950/20'
                        : 'border-slate-200 dark:border-slate-700 focus:ring-amber-500/40'
                    }`}
                  />
                </div>
                {(profileTouched.phone || profileForm.phone !== adminUser.phone) && profileErrors.phone && (
                  <p className="text-xs font-medium text-red-600 dark:text-red-400 mt-1.5 flex items-center gap-1">
                    <AlertCircleIcon className="w-3.5 h-3.5 shrink-0" />
                    {profileErrors.phone}
                  </p>
                )}
              </div>

              {/* City */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  City *
                </label>
                <div className="relative">
                  <MapPinIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={profileForm.city}
                    onChange={(e) => {
                      setProfileForm({ ...profileForm, city: e.target.value });
                      setProfileTouched((prev) => ({ ...prev, city: true }));
                    }}
                    onBlur={() => setProfileTouched((prev) => ({ ...prev, city: true }))}
                    placeholder="Bentota"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800/90 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition-all ${
                      (profileTouched.city || profileForm.city !== adminUser.city) && profileErrors.city
                        ? 'border-red-500 dark:border-red-500 focus:ring-red-500/30 bg-red-50/40 dark:bg-red-950/20'
                        : 'border-slate-200 dark:border-slate-700 focus:ring-amber-500/40'
                    }`}
                  />
                </div>
                {(profileTouched.city || profileForm.city !== adminUser.city) && profileErrors.city && (
                  <p className="text-xs font-medium text-red-600 dark:text-red-400 mt-1.5 flex items-center gap-1">
                    <AlertCircleIcon className="w-3.5 h-3.5 shrink-0" />
                    {profileErrors.city}
                  </p>
                )}
              </div>

              {/* Country */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Country *
                </label>
                <div className="relative">
                  <MapPinIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={profileForm.country}
                    onChange={(e) => {
                      setProfileForm({ ...profileForm, country: e.target.value });
                      setProfileTouched((prev) => ({ ...prev, country: true }));
                    }}
                    onBlur={() => setProfileTouched((prev) => ({ ...prev, country: true }))}
                    placeholder="Sri Lanka"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800/90 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition-all ${
                      (profileTouched.country || profileForm.country !== adminUser.country) && profileErrors.country
                        ? 'border-red-500 dark:border-red-500 focus:ring-red-500/30 bg-red-50/40 dark:bg-red-950/20'
                        : 'border-slate-200 dark:border-slate-700 focus:ring-amber-500/40'
                    }`}
                  />
                </div>
                {(profileTouched.country || profileForm.country !== adminUser.country) && profileErrors.country && (
                  <p className="text-xs font-medium text-red-600 dark:text-red-400 mt-1.5 flex items-center gap-1">
                    <AlertCircleIcon className="w-3.5 h-3.5 shrink-0" />
                    {profileErrors.country}
                  </p>
                )}
              </div>
            </div>

            {!isProfileFormValid && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-xs font-medium text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertCircleIcon className="w-4 h-4 shrink-0" />
                <span>Please correct the highlighted fields in red before saving your profile.</span>
              </div>
            )}

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                disabled={isSavingProfile || !isProfileFormValid}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md ${
                  isProfileFormValid
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/20'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none'
                }`}
              >
                <SaveIcon className="w-4 h-4" />
                {isSavingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Right 5 Cols: Update Password Section */}
        <div className="lg:col-span-5 bg-white dark:bg-[#101F1A] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <LockIcon className="w-5 h-5 text-amber-500" />
              Change Password
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Enter your current password and confirm your new password twice to update your login credentials.
            </p>
          </div>

          <form onSubmit={handleSavePassword} noValidate className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Current Password *
              </label>
              <div className="relative">
                <LockIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showCurrentPw ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={(e) => {
                    setPasswordForm({ ...passwordForm, currentPassword: e.target.value });
                    setPasswordTouched((prev) => ({ ...prev, currentPassword: true }));
                  }}
                  onBlur={() => setPasswordTouched((prev) => ({ ...prev, currentPassword: true }))}
                  placeholder="Enter your current password"
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800/90 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition-all ${
                    passwordTouched.currentPassword && passwordErrors.currentPassword
                      ? 'border-red-500 dark:border-red-500 focus:ring-red-500/30 bg-red-50/40 dark:bg-red-950/20'
                      : 'border-slate-200 dark:border-slate-700 focus:ring-amber-500/40'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showCurrentPw ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
              {passwordTouched.currentPassword && passwordErrors.currentPassword && (
                <p className="text-xs font-medium text-red-600 dark:text-red-400 mt-1.5 flex items-center gap-1">
                  <AlertCircleIcon className="w-3.5 h-3.5 shrink-0" />
                  {passwordErrors.currentPassword}
                </p>
              )}
            </div>

            {/* New Password (1st Entry) */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                New Password *
              </label>
              <div className="relative">
                <LockIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showNewPw ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(e) => {
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value });
                    setPasswordTouched((prev) => ({ ...prev, newPassword: true }));
                  }}
                  onBlur={() => setPasswordTouched((prev) => ({ ...prev, newPassword: true }))}
                  placeholder="Minimum 6 characters"
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800/90 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition-all ${
                    passwordTouched.newPassword && passwordErrors.newPassword
                      ? 'border-red-500 dark:border-red-500 focus:ring-red-500/30 bg-red-50/40 dark:bg-red-950/20'
                      : 'border-slate-200 dark:border-slate-700 focus:ring-amber-500/40'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw(!showNewPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showNewPw ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
              {passwordTouched.newPassword && passwordErrors.newPassword && (
                <p className="text-xs font-medium text-red-600 dark:text-red-400 mt-1.5 flex items-center gap-1">
                  <AlertCircleIcon className="w-3.5 h-3.5 shrink-0" />
                  {passwordErrors.newPassword}
                </p>
              )}
            </div>

            {/* Confirm New Password (2nd Entry) */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Confirm New Password *
              </label>
              <div className="relative">
                <LockIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showConfirmPw ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => {
                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value });
                    setPasswordTouched((prev) => ({ ...prev, confirmPassword: true }));
                  }}
                  onBlur={() => setPasswordTouched((prev) => ({ ...prev, confirmPassword: true }))}
                  placeholder="Re-enter your new password"
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800/90 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition-all ${
                    passwordTouched.confirmPassword && passwordErrors.confirmPassword
                      ? 'border-red-500 dark:border-red-500 focus:ring-red-500/30 bg-red-50/40 dark:bg-red-950/20'
                      : 'border-slate-200 dark:border-slate-700 focus:ring-amber-500/40'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPw(!showConfirmPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showConfirmPw ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
              {passwordTouched.confirmPassword && passwordErrors.confirmPassword && (
                <p className="text-xs font-medium text-red-600 dark:text-red-400 mt-1.5 flex items-center gap-1">
                  <AlertCircleIcon className="w-3.5 h-3.5 shrink-0" />
                  {passwordErrors.confirmPassword}
                </p>
              )}
              {passwordTouched.confirmPassword && !passwordErrors.confirmPassword && passwordForm.confirmPassword && (
                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-1.5 flex items-center gap-1">
                  <CheckCircleIcon className="w-3.5 h-3.5 shrink-0" />
                  New passwords match.
                </p>
              )}
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={isSavingPassword || !isPasswordFormValid}
                className={`w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md ${
                  isPasswordFormValid
                    ? 'bg-slate-900 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-600 text-white dark:text-slate-950'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none'
                }`}
              >
                <LockIcon className="w-4 h-4" />
                {isSavingPassword ? 'Updating Password...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Profile Photo Upload / Edit Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => !isUploadingAvatar && setShowAvatarModal(false)}
          />
          <div className="relative w-full max-w-md bg-white dark:bg-[#101F1A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Administrator Profile Photo
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Automatically compressed in browser & uploaded to ImgBB
                </p>
              </div>
              <button
                type="button"
                disabled={isUploadingAvatar}
                onClick={() => setShowAvatarModal(false)}
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col items-center py-4">
              <div className="relative">
                <img
                  src={avatarPreview || getAvatarUrl(adminUser.avatar)}
                  alt={adminUser.fullName}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = NO_DP_AVATAR;
                  }}
                  className="w-32 h-32 rounded-full object-cover ring-4 ring-amber-500/20 border-2 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
                />
                {avatarPreview && (
                  <span className="absolute -bottom-1 right-0 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-600 text-white shadow">
                    New {avatarSizeKB ? `(~${avatarSizeKB} KB)` : ''}
                  </span>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="flex flex-wrap items-center justify-center gap-2.5 mt-5 w-full">
                <button
                  type="button"
                  disabled={isProcessingImage || isUploadingAvatar}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  <UploadIcon className="w-4 h-4 text-amber-500" />
                  {isProcessingImage ? 'Optimizing...' : 'Choose Image'}
                </button>

                {hasPhoto && !avatarPreview && (
                  <button
                    type="button"
                    disabled={isUploadingAvatar}
                    onClick={handleRemoveAvatarClick}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 text-sm font-semibold transition-colors disabled:opacity-50"
                  >
                    <TrashIcon className="w-4 h-4" />
                    Remove Current Photo
                  </button>
                )}
              </div>

              <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center mt-3">
                Selected images are automatically resized to 360x360 px in React before uploading to the backend and ImgBB.
              </p>

              {avatarError && (
                <div className="mt-3 w-full p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-xs font-medium text-red-600 dark:text-red-400 text-center">
                  {avatarError}
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                disabled={isUploadingAvatar}
                onClick={() => {
                  setAvatarPreview(null);
                  setShowAvatarModal(false);
                }}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!avatarPreview || isUploadingAvatar || isProcessingImage}
                onClick={handleConfirmAvatarUpload}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-sm transition-colors disabled:opacity-50"
              >
                {isUploadingAvatar ? 'Uploading to ImgBB...' : 'Save Photo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
