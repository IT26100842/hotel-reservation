import React, { useState } from 'react';
import { Room, Booking, PaymentMethodType, UserProfile } from '../types';
import { ImageWithFallback } from './ImageWithFallback';
import { ScrollReveal } from './ScrollReveal';
import {
  CreditCard,
  ShieldCheck,
  Lock,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  Users,
  MapPin,
  Tag,
  Download,
  Check,
  AlertCircle
} from 'lucide-react';

interface CheckoutViewProps {
  room: Room;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
  user: UserProfile | null;
  onBack: () => void;
  onBookingConfirmed: (newBooking: Booking) => void;
  onGoToDashboard: () => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  room,
  checkIn,
  checkOut,
  nights,
  adults,
  children,
  user,
  onBack,
  onBookingConfirmed,
  onGoToDashboard
}) => {
  // Form fields
  const [fullName, setFullName] = useState(user?.fullName || 'Thilina Kavishan');
  const [email, setEmail] = useState(user?.email || 'thilinakavishan42@gmail.com');
  const [phone, setPhone] = useState(user?.phone || '+94 77 123 4567');
  const [nicPassport, setNicPassport] = useState('200021394812');
  const [specialRequests, setSpecialRequests] = useState('Ocean-facing upper floor if available.');

  // Payment Selection
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('payhere');

  // Card fields (for direct card option)
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8829');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvc, setCardCvc] = useState('321');

  // Promo code
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoDiscountRate, setPromoDiscountRate] = useState<number>(0);
  const [promoError, setPromoError] = useState<string | null>(null);

  // Submission / Loading state
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // Financial calculations
  const subtotal = room.pricePerNight * nights;
  const serviceCharge = Math.round(subtotal * 0.10);
  const taxes = Math.round(subtotal * 0.025);
  const discountAmount = Math.round(subtotal * promoDiscountRate);
  const grandTotal = Math.max(0, subtotal + serviceCharge + taxes - discountAmount);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError(null);
    const code = promoCodeInput.trim().toUpperCase();
    if (!code) return;

    if (code === 'SERENE10') {
      setAppliedPromo('SERENE10');
      setPromoDiscountRate(0.10);
    } else if (code === 'WELCOME15') {
      setAppliedPromo('WELCOME15');
      setPromoDiscountRate(0.15);
    } else if (code === 'CEYLON20') {
      setAppliedPromo('CEYLON20');
      setPromoDiscountRate(0.20);
    } else {
      setPromoError('Invalid promo code. Try "SERENE10" for 10% off.');
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phone) return;

    setIsProcessing(true);

    // Simulate payment transaction with local gateways (PayHere / PayPal / Cards)
    setTimeout(() => {
      const randomRef = 'SS-LK-' + Math.floor(10000 + Math.random() * 90000);
      const newBooking: Booking = {
        id: 'bk-' + Date.now(),
        bookingReference: randomRef,
        roomId: room.id,
        room,
        checkIn,
        checkOut,
        nights,
        adults,
        children,
        totalGuests: adults + children,
        guestInfo: {
          fullName,
          email,
          phone,
          specialRequests,
          nicPassport
        },
        paymentMethod,
        subtotal,
        serviceCharge,
        taxes,
        discountAmount,
        promoCodeApplied: appliedPromo || undefined,
        totalAmount: grandTotal,
        currency: 'LKR',
        status: 'confirmed',
        bookedAt: new Date().toISOString().split('T')[0]
      };

      setConfirmedBooking(newBooking);
      onBookingConfirmed(newBooking);
      setIsProcessing(false);
    }, 1200);
  };

  // If confirmed, render pristine confirmation ticket receipt
  if (confirmedBooking) {
    return (
      <div className="min-h-screen bg-[#FBFBF9] dark:bg-[#0A1210] py-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto animate-in fade-in zoom-in-95 duration-500 transition-colors">
        <div className="bg-white dark:bg-[#101C18] rounded-3xl p-6 sm:p-10 border border-stone-200/90 dark:border-[#1F332C] shadow-2xl text-center">
          <div className="w-16 h-16 bg-[#0D4739]/10 dark:bg-[#C2A26F]/15 text-[#0D4739] dark:text-[#C2A26F] rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="text-xs uppercase tracking-widest text-[#0D4739] dark:text-[#C2A26F] font-semibold">
            Reservation Confirmed
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-stone-900 dark:text-stone-100 font-medium tracking-tight mt-1 mb-2">
            Your Sanctuary is Awaiting You
          </h1>
          <p className="text-sm text-stone-600 dark:text-stone-400 max-w-md mx-auto mb-6">
            We've sent your booking confirmation details and digital voucher to{' '}
            <strong className="text-stone-900 dark:text-stone-100">{confirmedBooking.guestInfo.email}</strong>.
          </p>

          {/* Booking Card Voucher */}
          <div className="bg-[#F8F8F5] dark:bg-[#12201C] rounded-2xl p-6 text-left border border-stone-200 dark:border-[#1F332C] mb-8 space-y-4">
            <div className="flex flex-wrap items-center justify-between pb-4 border-b border-stone-200 dark:border-[#1F332C] gap-2">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-stone-500 dark:text-stone-400 font-medium">
                  Booking Reference
                </span>
                <p className="font-mono font-bold text-lg text-[#0D4739] dark:text-[#C2A26F] tracking-wider">
                  {confirmedBooking.bookingReference}
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300">
                <Check className="w-3.5 h-3.5" />
                Guaranteed by Serene Stay
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-20 h-16 rounded-xl overflow-hidden shrink-0 bg-stone-100 dark:bg-stone-800">
                <ImageWithFallback
                  src={confirmedBooking.room.images[0]}
                  alt={confirmedBooking.room.name}
                  fallbackTitle={confirmedBooking.room.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-serif font-medium text-lg text-stone-900 dark:text-stone-100">
                  {confirmedBooking.room.name}
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {confirmedBooking.room.location} · {confirmedBooking.nights} Nights
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-stone-200 dark:border-[#1F332C] text-xs">
              <div>
                <span className="text-stone-500 dark:text-stone-400 block">Check-in</span>
                <span className="font-semibold text-stone-800 dark:text-stone-200">{confirmedBooking.checkIn}</span>
              </div>
              <div>
                <span className="text-stone-500 dark:text-stone-400 block">Check-out</span>
                <span className="font-semibold text-stone-800 dark:text-stone-200">{confirmedBooking.checkOut}</span>
              </div>
              <div>
                <span className="text-stone-500 dark:text-stone-400 block">Guests</span>
                <span className="font-semibold text-stone-800 dark:text-stone-200">{confirmedBooking.totalGuests} Guests</span>
              </div>
              <div>
                <span className="text-stone-500 dark:text-stone-400 block">Total Paid</span>
                <span className="font-serif font-bold text-[#0D4739] dark:text-[#C2A26F]">
                  LKR {confirmedBooking.totalAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onGoToDashboard}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#0D4739] hover:bg-[#083329] text-white text-sm font-semibold rounded-xl transition-all shadow-md cursor-pointer"
            >
              View in My Reservations Dashboard
            </button>
            <button
              onClick={() => window.print()}
              className="w-full sm:w-auto px-6 py-3.5 bg-white dark:bg-[#12201C] border border-stone-300 dark:border-[#1F332C] hover:bg-stone-50 dark:hover:bg-[#172A24] text-stone-800 dark:text-stone-200 text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-stone-500 dark:text-stone-400" />
              Print / Save Voucher
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBF9] dark:bg-[#0A1210] py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto transition-colors duration-300">
      {/* Top Bar */}
      <div className="flex items-center gap-3 pb-6 mb-8 border-b border-stone-200 dark:border-[#1F332C]">
        <button
          onClick={() => {
            if (window.history.state && window.history.length > 1) {
              window.history.back();
            } else {
              onBack();
            }
          }}
          className="flex items-center gap-2 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:text-[#0D4739] dark:hover:text-[#C2A26F] py-1.5 px-3 rounded-lg border border-stone-200 dark:border-[#1F332C] bg-white dark:bg-[#101C18] shadow-sm cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>
        <span className="text-stone-300 dark:text-stone-700">/</span>
        <h1 className="font-serif text-xl sm:text-2xl font-medium text-stone-900 dark:text-stone-100">
          Confirm Reservation & Payment
        </h1>
      </div>

      <form onSubmit={handleFormSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Guest Info & Payment Form */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Step 1: Customer Details */}
          <ScrollReveal animation="fade-up">
          <div className="bg-white dark:bg-[#101C18] rounded-3xl p-6 sm:p-8 border border-stone-200 dark:border-[#1F332C] shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-[#1F332C]">
              <h2 className="font-serif text-xl font-medium text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#0D4739] dark:bg-[#C2A26F] text-white dark:text-stone-950 text-xs flex items-center justify-center font-sans font-bold">
                  1
                </span>
                Primary Guest Information
              </h2>
              <span className="text-xs text-stone-400 dark:text-stone-500">All fields required</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Thilina Kavishan"
                  className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-[#172A24]/40 border border-stone-300 dark:border-[#1F332C] rounded-xl text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-600 focus:bg-white dark:focus:bg-[#12201C] focus:outline-none focus:ring-2 focus:ring-[#0D4739] dark:focus:ring-[#C2A26F]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-[#172A24]/40 border border-stone-300 dark:border-[#1F332C] rounded-xl text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-600 focus:bg-white dark:focus:bg-[#12201C] focus:outline-none focus:ring-2 focus:ring-[#0D4739] dark:focus:ring-[#C2A26F]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                  Contact Phone (+94 Sri Lanka)
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+94 77 123 4567"
                  className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-[#172A24]/40 border border-stone-300 dark:border-[#1F332C] rounded-xl text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-600 focus:bg-white dark:focus:bg-[#12201C] focus:outline-none focus:ring-2 focus:ring-[#0D4739] dark:focus:ring-[#C2A26F]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                  NIC / Passport Number
                </label>
                <input
                  type="text"
                  value={nicPassport}
                  onChange={(e) => setNicPassport(e.target.value)}
                  placeholder="200021394812 / N1234567"
                  className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-[#172A24]/40 border border-stone-300 dark:border-[#1F332C] rounded-xl text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-600 focus:bg-white dark:focus:bg-[#12201C] focus:outline-none focus:ring-2 focus:ring-[#0D4739] dark:focus:ring-[#C2A26F]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                Special Requests & Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="Airport pickup time, dietary preferences, celebratory wine, etc."
                className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-[#172A24]/40 border border-stone-300 dark:border-[#1F332C] rounded-xl text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-600 focus:bg-white dark:focus:bg-[#12201C] focus:outline-none focus:ring-2 focus:ring-[#0D4739] dark:focus:ring-[#C2A26F]"
              />
            </div>
          </div>
          </ScrollReveal>

          {/* Step 2: Payment Gateways (Local & Global) */}
          <ScrollReveal animation="fade-up" delay={0.1}>
          <div className="bg-white dark:bg-[#101C18] rounded-3xl p-6 sm:p-8 border border-stone-200 dark:border-[#1F332C] shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-[#1F332C]">
              <h2 className="font-serif text-xl font-medium text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#0D4739] dark:bg-[#C2A26F] text-white dark:text-stone-950 text-xs flex items-center justify-center font-sans font-bold">
                  2
                </span>
                Payment Method & Gateway
              </h2>
              <span className="text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-1 font-medium">
                <Lock className="w-3.5 h-3.5" /> 256-bit SSL Encrypted
              </span>
            </div>

            {/* Gateway Selection Tabs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* PayHere (Sri Lanka) */}
              <button
                type="button"
                onClick={() => setPaymentMethod('payhere')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  paymentMethod === 'payhere'
                    ? 'border-[#0D4739] dark:border-[#C2A26F] bg-[#0D4739]/5 dark:bg-[#C2A26F]/10 ring-2 ring-[#0D4739]/20 dark:ring-[#C2A26F]/20'
                    : 'border-stone-200 dark:border-[#1F332C] hover:border-stone-300 dark:hover:border-stone-700 bg-white dark:bg-[#12201C]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-serif font-bold text-stone-900 dark:text-stone-100 text-sm">
                    PayHere Sri Lanka
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300">
                    Popular in LK
                  </span>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Pay with Visa, Mastercard, FriMi, eZ Cash, mCash, Genie, Sampath Vishwa
                </p>
              </button>

              {/* PayPal (International) */}
              <button
                type="button"
                onClick={() => setPaymentMethod('paypal')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  paymentMethod === 'paypal'
                    ? 'border-[#0D4739] dark:border-[#C2A26F] bg-[#0D4739]/5 dark:bg-[#C2A26F]/10 ring-2 ring-[#0D4739]/20 dark:ring-[#C2A26F]/20'
                    : 'border-stone-200 dark:border-[#1F332C] hover:border-stone-300 dark:hover:border-stone-700 bg-white dark:bg-[#12201C]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-serif font-bold text-stone-900 dark:text-stone-100 text-sm">
                    PayPal
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300">
                    Global
                  </span>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Instant secure checkout with your PayPal balance or international bank
                </p>
              </button>

              {/* Credit / Debit Card Direct */}
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  paymentMethod === 'card'
                    ? 'border-[#0D4739] dark:border-[#C2A26F] bg-[#0D4739]/5 dark:bg-[#C2A26F]/10 ring-2 ring-[#0D4739]/20 dark:ring-[#C2A26F]/20'
                    : 'border-stone-200 dark:border-[#1F332C] hover:border-stone-300 dark:hover:border-stone-700 bg-white dark:bg-[#12201C]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-serif font-bold text-stone-900 dark:text-stone-100 text-sm flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-[#0D4739] dark:text-[#C2A26F]" />
                    Credit / Debit Card
                  </span>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Visa, MasterCard, American Express via 3D-Secure 2.0
                </p>
              </button>

              {/* Cash / Pay at Check-in */}
              <button
                type="button"
                onClick={() => setPaymentMethod('pay_at_hotel')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  paymentMethod === 'pay_at_hotel'
                    ? 'border-[#0D4739] dark:border-[#C2A26F] bg-[#0D4739]/5 dark:bg-[#C2A26F]/10 ring-2 ring-[#0D4739]/20 dark:ring-[#C2A26F]/20'
                    : 'border-stone-200 dark:border-[#1F332C] hover:border-stone-300 dark:hover:border-stone-700 bg-white dark:bg-[#12201C]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-serif font-bold text-stone-900 dark:text-stone-100 text-sm">
                    Pay at Hotel Check-in
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300">
                    No Prepayment
                  </span>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Reserve your room now and settle the balance upon arrival in Bentota
                </p>
              </button>
            </div>

            {/* Card Inputs if card is selected */}
            {paymentMethod === 'card' && (
              <div className="p-4 bg-stone-50 dark:bg-[#12201C] rounded-2xl border border-stone-200 dark:border-[#1F332C] space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-[#172A24] border border-stone-300 dark:border-[#1F332C] rounded-lg text-sm text-stone-900 dark:text-stone-100"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="MM/YY"
                      className="w-full px-3 py-2 bg-white dark:bg-[#172A24] border border-stone-300 dark:border-[#1F332C] rounded-lg text-sm text-stone-900 dark:text-stone-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                      CVV / CVC
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      placeholder="•••"
                      className="w-full px-3 py-2 bg-white dark:bg-[#172A24] border border-stone-300 dark:border-[#1F332C] rounded-lg text-sm text-stone-900 dark:text-stone-100"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'payhere' && (
              <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200 dark:border-emerald-800/40 text-xs text-emerald-900 dark:text-emerald-300 flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-[#0D4739] dark:text-[#C2A26F] shrink-0" />
                <span>
                  You will complete verification via PayHere's Central Bank authorized gateway. 
                  Zero merchant surcharge applies.
                </span>
              </div>
            )}
          </div>
          </ScrollReveal>
        </div>

        {/* Right Column: Order Summary & Instant Promo Code */}
        <ScrollReveal animation="fade-left" className="lg:col-span-5 sticky top-28 space-y-6">
          <div className="bg-white dark:bg-[#101C18] rounded-3xl p-6 sm:p-7 border border-stone-200 dark:border-[#1F332C] shadow-xl space-y-6">
            <h3 className="font-serif text-xl font-medium text-stone-900 dark:text-stone-100 pb-3 border-b border-stone-100 dark:border-[#1F332C]">
              Reservation Summary
            </h3>

            {/* Room Preview */}
            <div className="flex gap-4 items-center">
              <div className="w-24 h-20 rounded-xl overflow-hidden shrink-0 bg-stone-100 dark:bg-stone-800">
                <ImageWithFallback
                  src={room.images[0]}
                  alt={room.name}
                  fallbackTitle={room.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <h4 className="font-serif text-base font-semibold text-stone-900 dark:text-stone-100 truncate">
                  {room.name}
                </h4>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">{room.view}</p>
                <p className="text-xs font-semibold text-[#0D4739] dark:text-[#C2A26F] mt-1">
                  LKR {room.pricePerNight.toLocaleString()} / night
                </p>
              </div>
            </div>

            {/* Dates summary */}
            <div className="bg-stone-50 dark:bg-[#12201C] rounded-2xl p-4 border border-stone-200/80 dark:border-[#1F332C] space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500" /> Check-in:
                </span>
                <span className="font-semibold text-stone-900 dark:text-stone-100">{checkIn} (from 2:00 PM)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500" /> Check-out:
                </span>
                <span className="font-semibold text-stone-900 dark:text-stone-100">{checkOut} (until 11:00 AM)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500" /> Total Guests:
                </span>
                <span className="font-semibold text-stone-900 dark:text-stone-100">{adults + children} ({adults} Adults, {children} Kids)</span>
              </div>
            </div>

            {/* Promo Code Input */}
            <div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Promo code (e.g. SERENE10)"
                  value={promoCodeInput}
                  onChange={(e) => setPromoCodeInput(e.target.value)}
                  className="flex-1 px-3 py-2 bg-stone-50 dark:bg-[#12201C] border border-stone-300 dark:border-[#1F332C] rounded-xl text-xs uppercase font-semibold text-stone-800 dark:text-stone-200 placeholder:normal-case placeholder:font-normal focus:bg-white dark:focus:bg-[#172A24] focus:outline-none focus:ring-1 focus:ring-[#0D4739] dark:focus:ring-[#C2A26F]"
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  className="px-4 py-2 bg-stone-900 dark:bg-stone-200 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 rounded-xl text-xs font-medium transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </div>

              {appliedPromo && (
                <div className="mt-2 text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                  <Check className="w-3.5 h-3.5" />
                  Code "{appliedPromo}" applied! ({(promoDiscountRate * 100)}% off room rate)
                </div>
              )}
              {promoError && (
                <div className="mt-2 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {promoError}
                </div>
              )}
            </div>

            {/* Financial Ledger */}
            <div className="space-y-2 text-xs sm:text-sm text-stone-600 dark:text-stone-300 border-t border-stone-100 dark:border-[#1F332C] pt-4">
              <div className="flex justify-between">
                <span>Room Charges ({nights} {nights === 1 ? 'Night' : 'Nights'})</span>
                <span className="tabular-nums font-medium text-stone-900 dark:text-stone-100">LKR {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>10% Resort Service Charge</span>
                <span className="tabular-nums font-medium text-stone-900 dark:text-stone-100">LKR {serviceCharge.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>SSCL & Local Government Taxes (2.5%)</span>
                <span className="tabular-nums font-medium text-stone-900 dark:text-stone-100">LKR {taxes.toLocaleString()}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-medium">
                  <span>Special Promo Discount</span>
                  <span className="tabular-nums">- LKR {discountAmount.toLocaleString()}</span>
                </div>
              )}

              <div className="border-t border-stone-200 dark:border-[#1F332C] pt-3 flex justify-between items-baseline text-stone-900 dark:text-stone-100 font-semibold">
                <span className="text-base font-serif">Grand Total</span>
                <span className="text-2xl font-serif text-[#0D4739] dark:text-[#C2A26F] tabular-nums">
                  LKR {grandTotal.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Confirm & Pay Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-4 bg-[#0D4739] hover:bg-[#083329] active:scale-[0.98] disabled:opacity-75 text-white font-medium rounded-2xl shadow-lg transition-all text-base flex items-center justify-center gap-2 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Processing Guarantee with Gateway...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>
                    {paymentMethod === 'pay_at_hotel' ? 'Complete Reservation (Pay at Check-in)' : `Pay LKR ${grandTotal.toLocaleString()}`}
                  </span>
                </>
              )}
            </button>

            <p className="text-center text-[11px] text-stone-400 dark:text-stone-500">
              Free cancellation up to 48 hours prior to arrival date.
            </p>
          </div>
        </ScrollReveal>
      </form>
    </div>
  );
};
