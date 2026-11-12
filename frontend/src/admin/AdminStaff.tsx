import React, { useState } from 'react';
import { UserProfile } from '../types';
import {
  ShieldAlert,
  Plus,
  Trash2,
  Edit2,
  Search,
  CheckCircle2,
  X,
  KeyRound,
  Mail,
  User,
  Phone,
  ShieldCheck,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { getAvatarUrl, NO_DP_AVATAR } from '../utils/avatar';
import { validateFullName, validateEmail, validatePhoneNumber } from '../utils/validation';

interface AdminStaffProps {
  admins: UserProfile[];
  currentAdmin: UserProfile | null;
  onAddAdmin: (data: { fullName: string; email: string; password?: string; role?: string; phone?: string }) => Promise<void>;
  onUpdateAdmin: (id: string, data: Partial<UserProfile> & { password?: string }) => Promise<void>;
  onDeleteAdmin: (id: string) => Promise<void>;
  onShowToast: (msg: string, type?: 'success' | 'info') => void;
  openCreateModalDirectly?: boolean;
  onClearOpenModalDirectly?: () => void;
  isLoading?: boolean;
}

export const AdminStaff: React.FC<AdminStaffProps> = ({
  admins,
  currentAdmin,
  onAddAdmin,
  onUpdateAdmin,
  onDeleteAdmin,
  onShowToast,
  openCreateModalDirectly = false,
  onClearOpenModalDirectly,
  isLoading = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(openCreateModalDirectly);
  const [editingAdmin, setEditingAdmin] = useState<UserProfile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'super_admin' | 'admin' | 'manager'>('admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({
    fullName: false,
    email: false,
    phone: false,
    password: false
  });

  // Real-time English validation
  const staffErrors = {
    fullName: validateFullName(fullName),
    email: editingAdmin ? null : validateEmail(email),
    phone: validatePhoneNumber(phone),
    password: editingAdmin
      ? password.trim().length > 0 && password.trim().length < 6
        ? 'New password must be at least 6 characters long.'
        : null
      : !password.trim()
      ? 'Initial password is required.'
      : password.trim().length < 6
      ? 'Password must be at least 6 characters long.'
      : null
  };

  const isStaffFormValid =
    !staffErrors.fullName &&
    !staffErrors.email &&
    !staffErrors.phone &&
    !staffErrors.password;

  const openCreateModal = () => {
    setEditingAdmin(null);
    setFullName('');
    setEmail('');
    setPhone('');
    setRole('admin');
    setPassword('');
    setTouched({ fullName: false, email: false, phone: false, password: false });
    setModalOpen(true);
  };

  const openEditModal = (adm: UserProfile) => {
    setEditingAdmin(adm);
    setFullName(adm.fullName);
    setEmail(adm.email);
    setPhone(adm.phone || '+94 77 123 4567');
    setRole((adm.role as any) || 'admin');
    setPassword('');
    setTouched({ fullName: false, email: false, phone: false, password: false });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    if (onClearOpenModalDirectly) onClearOpenModalDirectly();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      fullName: true,
      email: true,
      phone: true,
      password: true
    });

    if (!isStaffFormValid) {
      onShowToast('Please fix the highlighted validation errors before saving.', 'info');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingAdmin) {
        await onUpdateAdmin(editingAdmin.id, {
          fullName: fullName.trim(),
          phone: phone.trim(),
          role,
          ...(password.trim() ? { password: password.trim() } : {})
        });
        onShowToast(`Admin account "${fullName.trim()}" updated!`);
      } else {
        await onAddAdmin({
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          password: password.trim(),
          role,
          phone: phone.trim()
        });
        onShowToast(`New administrator "${fullName.trim()}" successfully created!`);
      }
      handleCloseModal();
    } catch (err: any) {
      onShowToast(`Error saving admin: ${err.message || 'Failed'}`, 'info');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (adm: UserProfile) => {
    if (adm.email === 'admin@serenestay.com' || adm.role === 'super_admin') {
      onShowToast('The Primary Super Administrator cannot be removed.', 'info');
      return;
    }

    if (currentAdmin && currentAdmin.id === adm.id) {
      onShowToast('You cannot delete your own logged-in admin account.', 'info');
      return;
    }

    if (window.confirm(`Are you sure you want to remove administrator "${adm.fullName}" (${adm.email})?`)) {
      try {
        await onDeleteAdmin(adm.id);
        onShowToast(`Administrator "${adm.fullName}" removed.`);
      } catch (err: any) {
        onShowToast(`Failed to remove admin: ${err.message}`, 'info');
      }
    }
  };

  const filtered = admins.filter(
    (a) =>
      a.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.role && a.role.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* 1. Header controls: Search & Add New Admin button */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#101F1A] border border-stone-200 dark:border-[#1C2F29] shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search admins by name, email, role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-stone-50 dark:bg-[#142621] border border-stone-200 dark:border-[#223B33] rounded-xl text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        {/* Add Admin Button */}
        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-950/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Administrator</span>
        </button>
      </div>

      {/* 2. Admin List Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#101F1A] border border-stone-200 dark:border-[#1C2F29] shadow-sm overflow-hidden">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100 dark:border-[#1C2F29]">
          <div>
            <h4 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
              Authorized Administrators & Staff ({admins.length})
            </h4>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Users with administrative privileges to manage resort reservations and suites
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-stone-500 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-spin mb-3" />
            <h4 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100">
              Loading Administrative Staff...
            </h4>
            <p className="text-xs text-stone-400 mt-1">
              Retrieving staff profiles and privileges from database
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-stone-500">
            <ShieldAlert className="w-10 h-10 mx-auto text-stone-300 dark:text-stone-600 mb-2" />
            <p className="text-sm font-semibold">No administrators found</p>
            <p className="text-xs text-stone-400 mt-1">Try relaxing your search filter or add a new admin</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 dark:border-[#1C2F29] text-stone-500 dark:text-stone-400 uppercase text-[10px] font-semibold">
                <th className="py-3 px-3">Administrator</th>
                <th className="py-3 px-3">Contact</th>
                <th className="py-3 px-3">Role & Access</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-[#1C2F29]/60">
              {filtered.map((adm) => {
                const isYou = currentAdmin && currentAdmin.id === adm.id;
                const isPrimary = adm.email === 'admin@serenestay.com' || adm.role === 'super_admin';

                return (
                  <tr key={adm.id} className="hover:bg-stone-50 dark:hover:bg-[#142621]/40 transition-colors">
                    {/* Admin identity */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={getAvatarUrl(adm.avatar)}
                          alt={adm.fullName}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = NO_DP_AVATAR;
                          }}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/30 bg-stone-200 dark:bg-stone-800"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-stone-900 dark:text-stone-100 text-sm">
                              {adm.fullName}
                            </span>
                            {isYou && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                                You
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3 text-stone-400" />
                            {adm.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Contact Phone & City */}
                    <td className="py-3.5 px-3 text-stone-600 dark:text-stone-300">
                      <div>{adm.phone || '+94 77 123 4567'}</div>
                      <div className="text-[10px] text-stone-400">{adm.city || 'Bentota'}, {adm.country || 'Sri Lanka'}</div>
                    </td>

                    {/* Role badge */}
                    <td className="py-3.5 px-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider inline-flex items-center gap-1 ${
                        adm.role === 'super_admin'
                          ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                          : adm.role === 'manager'
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                          : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      }`}>
                        <ShieldCheck className="w-3 h-3" />
                        <span>
                          {adm.role === 'super_admin'
                            ? 'Super Administrator'
                            : adm.role === 'manager'
                            ? 'Operations Manager'
                            : 'Administrator'}
                        </span>
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        <span>Active</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(adm)}
                          className="p-1.5 rounded-lg border border-stone-200 dark:border-[#223B33] text-stone-700 dark:text-stone-300 hover:bg-emerald-50 dark:hover:bg-[#162A24] hover:text-emerald-600 transition-colors cursor-pointer"
                          title="Edit role & info"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          disabled={Boolean(isPrimary || isYou)}
                          onClick={() => handleDelete(adm)}
                          className="p-1.5 rounded-lg border border-stone-200 dark:border-[#223B33] text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                          title={isPrimary ? 'Primary super admin cannot be deleted' : isYou ? 'Cannot delete your own account' : 'Remove admin'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        )}
      </div>

      {/* 3. Add / Edit Admin Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#101F1A] border border-stone-200 dark:border-[#1C2F29] rounded-2xl w-full max-w-lg my-8 shadow-2xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-stone-200 dark:border-[#1C2F29] flex items-center justify-between bg-stone-50 dark:bg-[#142621]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                    {editingAdmin ? `Update Admin: ${editingAdmin.fullName}` : 'Add New Administrator'}
                  </h3>
                  <p className="text-xs text-stone-500">
                    Grant administrative credentials and permissions to staff member
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider text-[10px] mb-1.5">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g. Kasun Fernando"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      setTouched((prev) => ({ ...prev, fullName: true }));
                    }}
                    onBlur={() => setTouched((prev) => ({ ...prev, fullName: true }))}
                    className={`w-full pl-9 pr-3 py-2 rounded-xl bg-stone-50 dark:bg-[#142621] border text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 ${
                      touched.fullName && staffErrors.fullName
                        ? 'border-red-500 dark:border-red-500 focus:ring-red-500/30 bg-red-50/40 dark:bg-red-950/20'
                        : 'border-stone-200 dark:border-[#223B33] focus:ring-emerald-600'
                    }`}
                  />
                </div>
                {touched.fullName && staffErrors.fullName && (
                  <p className="text-[11px] font-medium text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {staffErrors.fullName}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider text-[10px] mb-1.5">
                  Official Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    disabled={Boolean(editingAdmin)}
                    placeholder="e.g. kasun@serenestay.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setTouched((prev) => ({ ...prev, email: true }));
                    }}
                    onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                    className={`w-full pl-9 pr-3 py-2 rounded-xl bg-stone-50 dark:bg-[#142621] border text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 disabled:opacity-60 ${
                      touched.email && staffErrors.email
                        ? 'border-red-500 dark:border-red-500 focus:ring-red-500/30 bg-red-50/40 dark:bg-red-950/20'
                        : 'border-stone-200 dark:border-[#223B33] focus:ring-emerald-600'
                    }`}
                  />
                </div>
                {touched.email && staffErrors.email && (
                  <p className="text-[11px] font-medium text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {staffErrors.email}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider text-[10px] mb-1.5">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      placeholder="+94 77 123 4567"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        setTouched((prev) => ({ ...prev, phone: true }));
                      }}
                      onBlur={() => setTouched((prev) => ({ ...prev, phone: true }))}
                      className={`w-full pl-9 pr-3 py-2 rounded-xl bg-stone-50 dark:bg-[#142621] border text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 ${
                        touched.phone && staffErrors.phone
                          ? 'border-red-500 dark:border-red-500 focus:ring-red-500/30 bg-red-50/40 dark:bg-red-950/20'
                          : 'border-stone-200 dark:border-[#223B33] focus:ring-emerald-600'
                      }`}
                    />
                  </div>
                  {touched.phone && staffErrors.phone && (
                    <p className="text-[11px] font-medium text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {staffErrors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider text-[10px] mb-1.5">
                    Administrative Role *
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#142621] border border-stone-200 dark:border-[#223B33] text-stone-900 dark:text-stone-100 cursor-pointer"
                  >
                    <option value="admin">Standard Administrator</option>
                    <option value="manager">Operations Manager</option>
                    <option value="super_admin">Super Administrator</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider text-[10px]">
                    {editingAdmin ? 'Reset Password (Optional)' : 'Initial Password *'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    {showPassword ? 'Hide' : 'Show password'}
                  </button>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={editingAdmin ? 'Leave blank to keep existing password' : 'Minimum 6 characters'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setTouched((prev) => ({ ...prev, password: true }));
                    }}
                    onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
                    className={`w-full pl-9 pr-3 py-2 rounded-xl bg-stone-50 dark:bg-[#142621] border text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 ${
                      touched.password && staffErrors.password
                        ? 'border-red-500 dark:border-red-500 focus:ring-red-500/30 bg-red-50/40 dark:bg-red-950/20'
                        : 'border-stone-200 dark:border-[#223B33] focus:ring-emerald-600'
                    }`}
                  />
                </div>
                {touched.password && staffErrors.password ? (
                  <p className="text-[11px] font-medium text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {staffErrors.password}
                  </p>
                ) : (
                  <p className="text-[10px] text-stone-400 mt-1">
                    {editingAdmin
                      ? 'Enter a new password (min 6 characters) only if you wish to reset it.'
                      : 'Provide a secure password (min 6 characters) for this staff member to sign in.'}
                  </p>
                )}
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-stone-200 dark:border-[#1C2F29] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 dark:border-[#223B33] text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#162A24] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !isStaffFormValid}
                  className={`px-5 py-2.5 rounded-xl font-semibold shadow-md flex items-center gap-1.5 transition-all ${
                    isStaffFormValid
                      ? 'bg-emerald-700 hover:bg-emerald-600 text-white cursor-pointer'
                      : 'bg-stone-200 dark:bg-stone-800 text-stone-400 dark:text-stone-500 cursor-not-allowed shadow-none'
                  }`}
                >
                  {isSubmitting ? 'Saving...' : editingAdmin ? 'Save Changes' : 'Create Administrator'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
