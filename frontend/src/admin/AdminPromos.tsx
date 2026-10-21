import React, { useState } from 'react';
import { PromoCodeItem } from '../types';
import { Plus, Trash2, CheckCircle2, X, AlertCircle, Loader2 } from 'lucide-react';

interface AdminPromosProps {
  promos: PromoCodeItem[];
  onAddPromo: (promo: Partial<PromoCodeItem>) => Promise<void>;
  onDeletePromo: (id: number | string) => Promise<void>;
  onShowToast: (msg: string, type?: 'success' | 'info') => void;
  isLoading?: boolean;
}

export const AdminPromos: React.FC<AdminPromosProps> = ({
  promos,
  onAddPromo,
  onDeletePromo,
  onShowToast,
  isLoading = false
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountValue, setDiscountValue] = useState(15);
  const [minSpend, setMinSpend] = useState(15000);
  const [touched, setTouched] = useState({
    code: false,
    discountValue: false,
    minSpend: false,
    description: false
  });

  // Real-time English validation for Promo Code inputs
  const promoErrors = {
    code: (() => {
      const clean = code.trim().toUpperCase();
      if (!clean) return 'Coupon code is required.';
      if (!/^[A-Z0-9_-]{3,20}$/.test(clean)) {
        return 'Coupon code must be 3–20 uppercase letters or numbers (no spaces).';
      }
      if (promos.some((p) => p.code.toUpperCase() === clean)) {
        return 'This coupon code already exists.';
      }
      return null;
    })(),
    discountValue: (() => {
      const val = Number(discountValue);
      if (isNaN(val) || !Number.isInteger(val) || val < 1 || val > 90) {
        return 'Discount percentage must be a whole number between 1% and 90%.';
      }
      return null;
    })(),
    minSpend: (() => {
      const val = Number(minSpend);
      if (isNaN(val) || val < 0 || val > 5000000) {
        return 'Minimum spend must be 0 or a positive amount (max LKR 5,000,000).';
      }
      return null;
    })(),
    description: (() => {
      const clean = description.trim();
      if (!clean) return 'Description is required.';
      if (clean.length < 5) return 'Description must be at least 5 characters.';
      return null;
    })()
  };

  const isPromoFormValid =
    !promoErrors.code &&
    !promoErrors.discountValue &&
    !promoErrors.minSpend &&
    !promoErrors.description;

  const openModal = () => {
    setCode('');
    setDescription('');
    setDiscountValue(15);
    setMinSpend(15000);
    setTouched({ code: false, discountValue: false, minSpend: false, description: false });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      code: true,
      discountValue: true,
      minSpend: true,
      description: true
    });

    if (!isPromoFormValid) {
      onShowToast('Please fix the highlighted validation errors before saving.', 'info');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddPromo({
        code: code.trim().toUpperCase(),
        description: description.trim(),
        discountType: 'percentage',
        discountValue,
        minSpend,
        isActive: true
      });
      onShowToast(`Promo code "${code.trim().toUpperCase()}" created!`);
      setModalOpen(false);
      setCode('');
      setDescription('');
    } catch (err: any) {
      onShowToast(`Failed to create promo: ${err.message}`, 'info');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (promo: PromoCodeItem) => {
    if (window.confirm(`Delete coupon code "${promo.code}"?`)) {
      try {
        await onDeletePromo(promo.id || promo.code);
        onShowToast(`Promo code "${promo.code}" removed.`);
      } catch (err: any) {
        onShowToast(`Failed to delete promo: ${err.message}`, 'info');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#101F1A] border border-stone-200 dark:border-[#1C2F29] shadow-sm flex items-center justify-between">
        <div>
          <h4 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
            Promotional Coupons & Vouchers
          </h4>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Active discount codes valid at reservation checkout
          </p>
        </div>

        <button
          onClick={openModal}
          className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Promo Code</span>
        </button>
      </div>

      {/* Promos Cards Grid / Loading / Empty */}
      {isLoading ? (
        <div className="p-16 rounded-2xl bg-white dark:bg-[#101F1A] border border-stone-200 dark:border-[#1C2F29] shadow-sm flex flex-col items-center justify-center text-center">
          <Loader2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-spin mb-3" />
          <h4 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100">
            Loading Promo Codes...
          </h4>
          <p className="text-xs text-stone-400 mt-1">
            Fetching active discount coupons and promotions from database
          </p>
        </div>
      ) : promos.length === 0 ? (
        <div className="p-16 rounded-2xl bg-white dark:bg-[#101F1A] border border-stone-200 dark:border-[#1C2F29] shadow-sm flex flex-col items-center justify-center text-center">
          <p className="text-sm font-semibold text-stone-700 dark:text-stone-300">No promo codes found</p>
          <p className="text-xs text-stone-400 mt-1">Click &quot;New Promo Code&quot; to configure a promotion</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {promos.map((p) => (
          <div
            key={p.code}
            className="p-5 rounded-2xl bg-white dark:bg-[#101F1A] border border-stone-200 dark:border-[#1C2F29] shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono font-extrabold text-base tracking-wider px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300">
                  {p.code}
                </span>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-900">
                  {p.discountValue}% OFF
                </span>
              </div>

              <p className="text-xs text-stone-600 dark:text-stone-300 mb-3 leading-relaxed">
                {p.description}
              </p>

              {p.minSpend && p.minSpend > 0 && (
                <div className="text-[11px] text-stone-400">
                  Min spend: <span className="font-semibold text-stone-700 dark:text-stone-300">LKR {p.minSpend.toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-stone-100 dark:border-[#1C2F29] flex items-center justify-between text-xs">
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Active</span>
              </span>

              <button
                onClick={() => handleDelete(p)}
                className="p-1.5 rounded-lg border border-stone-200 dark:border-[#223B33] text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                title="Delete promo code"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Create Promo Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#101F1A] border border-stone-200 dark:border-[#1C2F29] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-stone-200 dark:border-[#1C2F29] flex items-center justify-between bg-stone-50 dark:bg-[#142621]">
              <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                Create Promo Code
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider text-[10px] mb-1.5">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  placeholder="e.g. SUMMER25"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.toUpperCase());
                    setTouched((prev) => ({ ...prev, code: true }));
                  }}
                  onBlur={() => setTouched((prev) => ({ ...prev, code: true }))}
                  className={`w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#142621] border text-stone-900 dark:text-stone-100 font-mono font-bold tracking-wider focus:outline-none focus:ring-2 ${
                    touched.code && promoErrors.code
                      ? 'border-red-500 dark:border-red-500 focus:ring-red-500/30 bg-red-50/40 dark:bg-red-950/20'
                      : 'border-stone-200 dark:border-[#223B33] focus:ring-emerald-600'
                  }`}
                />
                {touched.code && promoErrors.code && (
                  <p className="text-[11px] font-medium text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {promoErrors.code}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider text-[10px] mb-1.5">
                  Discount Percentage (1% - 90%) *
                </label>
                <input
                  type="number"
                  min={1}
                  max={90}
                  value={discountValue}
                  onChange={(e) => {
                    setDiscountValue(Number(e.target.value));
                    setTouched((prev) => ({ ...prev, discountValue: true }));
                  }}
                  onBlur={() => setTouched((prev) => ({ ...prev, discountValue: true }))}
                  className={`w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#142621] border text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 ${
                    touched.discountValue && promoErrors.discountValue
                      ? 'border-red-500 dark:border-red-500 focus:ring-red-500/30 bg-red-50/40 dark:bg-red-950/20'
                      : 'border-stone-200 dark:border-[#223B33] focus:ring-emerald-600'
                  }`}
                />
                {touched.discountValue && promoErrors.discountValue && (
                  <p className="text-[11px] font-medium text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {promoErrors.discountValue}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider text-[10px] mb-1.5">
                  Minimum Reservation Spend (LKR) *
                </label>
                <input
                  type="number"
                  min={0}
                  step={1000}
                  value={minSpend}
                  onChange={(e) => {
                    setMinSpend(Number(e.target.value));
                    setTouched((prev) => ({ ...prev, minSpend: true }));
                  }}
                  onBlur={() => setTouched((prev) => ({ ...prev, minSpend: true }))}
                  className={`w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#142621] border text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 ${
                    touched.minSpend && promoErrors.minSpend
                      ? 'border-red-500 dark:border-red-500 focus:ring-red-500/30 bg-red-50/40 dark:bg-red-950/20'
                      : 'border-stone-200 dark:border-[#223B33] focus:ring-emerald-600'
                  }`}
                />
                {touched.minSpend && promoErrors.minSpend && (
                  <p className="text-[11px] font-medium text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {promoErrors.minSpend}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider text-[10px] mb-1.5">
                  Description *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 25% Off Summer Coastal Stays"
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setTouched((prev) => ({ ...prev, description: true }));
                  }}
                  onBlur={() => setTouched((prev) => ({ ...prev, description: true }))}
                  className={`w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#142621] border text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 ${
                    touched.description && promoErrors.description
                      ? 'border-red-500 dark:border-red-500 focus:ring-red-500/30 bg-red-50/40 dark:bg-red-950/20'
                      : 'border-stone-200 dark:border-[#223B33] focus:ring-emerald-600'
                  }`}
                />
                {touched.description && promoErrors.description && (
                  <p className="text-[11px] font-medium text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {promoErrors.description}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-stone-200 dark:border-[#1C2F29] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 dark:border-[#223B33] text-stone-600 dark:text-stone-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !isPromoFormValid}
                  className={`px-5 py-2 rounded-xl font-semibold shadow-md transition-all ${
                    isPromoFormValid
                      ? 'bg-emerald-700 hover:bg-emerald-600 text-white cursor-pointer'
                      : 'bg-stone-200 dark:bg-stone-800 text-stone-400 dark:text-stone-500 cursor-not-allowed shadow-none'
                  }`}
                >
                  {isSubmitting ? 'Saving...' : 'Deploy Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
