import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PassengerDetails, BookingContact, PaymentMethod } from '../types/booking';
import { createBookingAPI } from '../services/api';
import { CreditCard, Smartphone, Building2, QrCode, ShieldCheck, Lock, AlertCircle, Loader2, ArrowLeft, CheckCircle2, Tag } from 'lucide-react';

interface CheckoutPaymentProps {
  passengers: PassengerDetails[];
  contact: BookingContact;
  onBack: () => void;
}

export const CheckoutPayment: React.FC<CheckoutPaymentProps> = ({ passengers, contact, onBack }) => {
  const {
    selectedOffer,
    setActiveBooking,
    addTripToStorage,
    setView,
    formatPrice,
    showToast,
    agencyConfig
  } = useApp();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('payfast_card');
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);

  // Card Inputs (Simulated secure payment tokenization form)
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [walletPhone, setWalletPhone] = useState(contact.phoneNumber || '3001234567');

  if (!selectedOffer) return null;

  const paxCount = passengers.length;
  const baseTotal = selectedOffer.pricing.baseFare * paxCount;
  const taxesTotal = selectedOffer.pricing.taxesAirportCharges * paxCount;
  const surchargesTotal = selectedOffer.pricing.supplierSurcharges * paxCount;
  const agencyFeeTotal = selectedOffer.pricing.agencyServiceFee * paxCount;
  const grossSubtotal = baseTotal + taxesTotal + surchargesTotal + agencyFeeTotal;
  const discountAmount = appliedPromo?.discount || 0;
  const finalPayable = Math.max(grossSubtotal - discountAmount, 0);

  const applyPromo = () => {
    if (!promoInput.trim()) return;
    setPromoLoading(true);
    const code = promoInput.toUpperCase().trim();
    if (code === 'AHWELCOME') {
      const discount = 2000;
      setAppliedPromo({ code, discount });
      showToast('Promo code AHWELCOME applied! PKR 2,000 discount.', 'success');
    } else if (code === 'FLYPAKISTAN') {
      const discount = Math.min(Math.round(grossSubtotal * 0.05), 4000);
      setAppliedPromo({ code, discount });
      showToast(`Promo code FLYPAKISTAN applied! PKR ${discount.toLocaleString()} discount.`, 'success');
    } else {
      showToast('Invalid or expired promotional code.', 'warning');
    }
    setPromoLoading(false);
  };

  const handlePayAndConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedTerms) {
      showToast('Please accept the Terms of Carriage and Travel Agency policies to continue.', 'warning');
      return;
    }

    setProcessing(true);
    // Generate client-side idempotency key
    const idempotencyKey = `IDEMP-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    try {
      const res = await createBookingAPI({
        offer: selectedOffer,
        passengers,
        contact,
        paymentMethod,
        promoCode: appliedPromo?.code,
        idempotencyKey
      });

      if (res.success && res.booking) {
        setActiveBooking(res.booking);
        addTripToStorage(res.booking);
        showToast('Payment captured and airline ticket issued!', 'success');
        setView('confirmation');
      } else {
        throw new Error(res.error || 'Booking reservation could not be completed.');
      }
    } catch (err: any) {
      showToast(err.message || 'Payment processing failed. Please check payment credentials.', 'error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      
      {/* Step Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Edit traveler details</span>
        </button>

        <div className="text-right">
          <span className="text-xs text-slate-500">Step 3 of 3</span>
          <h2 className="text-lg font-bold text-slate-900">Review & Secure Payment</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Payment Method Selection & Credentials Form */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Demo Sandbox Alert if demo mode */}
          {selectedOffer.isDemoData && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Sandbox Environment Active:</strong> No real bank account or credit card will be charged. This completes a high-fidelity simulation of authorized airline ticketing and PNR generation.
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Select Payment Provider (Pakistan)</h3>
              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>256-bit TLS Encrypted</span>
              </div>
            </div>

            {/* Payment Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* PayFast Cards */}
              <button
                type="button"
                onClick={() => setPaymentMethod('payfast_card')}
                className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                  paymentMethod === 'payfast_card'
                    ? 'border-sky-600 bg-sky-50/50 ring-1 ring-sky-600 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <CreditCard className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-slate-900">PayFast / Credit Card</div>
                  <div className="text-[11px] text-slate-500">Visa, Mastercard, UnionPay</div>
                </div>
              </button>

              {/* JazzCash */}
              <button
                type="button"
                onClick={() => setPaymentMethod('jazzcash')}
                className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                  paymentMethod === 'jazzcash'
                    ? 'border-red-600 bg-red-50/50 ring-1 ring-red-600 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Smartphone className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-slate-900">JazzCash Mobile</div>
                  <div className="text-[11px] text-slate-500">Account / Voucher</div>
                </div>
              </button>

              {/* EasyPaisa */}
              <button
                type="button"
                onClick={() => setPaymentMethod('easypaisa')}
                className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                  paymentMethod === 'easypaisa'
                    ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Smartphone className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-slate-900">EasyPaisa</div>
                  <div className="text-[11px] text-slate-500">Wallet / QR payment</div>
                </div>
              </button>

              {/* Raast / HBL Bank */}
              <button
                type="button"
                onClick={() => setPaymentMethod('raast_bank')}
                className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                  paymentMethod === 'raast_bank'
                    ? 'border-purple-600 bg-purple-50/50 ring-1 ring-purple-600 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <QrCode className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-slate-900">Raast Instant P2M</div>
                  <div className="text-[11px] text-slate-500">State Bank of Pakistan QR</div>
                </div>
              </button>

            </div>

            {/* Simulated Payment Credentials Fields */}
            <form onSubmit={handlePayAndConfirm} className="space-y-4 pt-3 border-t border-slate-100">
              {paymentMethod === 'payfast_card' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Card Number</label>
                    <input
                      type="text"
                      placeholder="4000 1234 5678 9010 (Sandbox card accepted)"
                      value={cardNumber}
                      onChange={e => setCardNumber(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600 font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">MM / YY</label>
                      <input
                        type="text"
                        placeholder="12/28"
                        value={cardExpiry}
                        onChange={e => setCardExpiry(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">CVV</label>
                      <input
                        type="password"
                        placeholder="•••"
                        maxLength={4}
                        value={cardCvv}
                        onChange={e => setCardCvv(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600 font-mono"
                      />
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Compliant payment tokenization. Raw card data is never stored on agency servers.
                  </div>
                </div>
              )}

              {(paymentMethod === 'jazzcash' || paymentMethod === 'easypaisa') && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {paymentMethod === 'jazzcash' ? 'JazzCash' : 'EasyPaisa'} Mobile Number
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 text-xs font-mono bg-slate-100 border border-r-0 border-slate-200 rounded-l-lg text-slate-600">
                        +92
                      </span>
                      <input
                        type="tel"
                        value={walletPhone}
                        onChange={e => setWalletPhone(e.target.value)}
                        placeholder="300 1234567"
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-sky-600"
                      />
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600">
                    You will receive an instant USSD authorization prompt on your mobile handset to enter your 4-digit MPIN.
                  </div>
                </div>
              )}

              {paymentMethod === 'raast_bank' && (
                <div className="p-4 bg-purple-50/80 border border-purple-200 rounded-xl space-y-2 text-xs text-purple-900">
                  <div className="font-bold flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-purple-700" />
                    <span>State Bank of Pakistan Raast Instant Settlement</span>
                  </div>
                  <p>
                    A dynamic Raast QR code will be generated upon confirmation, allowing direct settlement from any Pakistani bank mobile app without surcharge.
                  </p>
                </div>
              )}

              {/* Regulatory & Terms Agreement */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <label className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedTerms}
                    onChange={e => setAgreedTerms(e.target.checked)}
                    className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300 mt-0.5"
                  />
                  <span>
                    I accept the airline fare rules, cancellation terms, and AH Flight Travel & Tours Pvt Ltd terms of service. I confirm all passenger passport names match government identification.
                  </span>
                </label>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={processing || !agreedTerms}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                    <span>Authorizing & Issuing Airline PNR...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Pay {formatPrice(finalPayable)} & Issue E-Ticket</span>
                  </>
                )}
              </button>
            </form>
          </div>

        </div>

        {/* Right: Transparent Price Breakdown & Promo Code */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Promo Code Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
              <Tag className="w-3.5 h-3.5 text-amber-500" />
              <span>Have a Promo Code?</span>
            </div>
            
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Try AHWELCOME or FLYPAKISTAN"
                value={promoInput}
                onChange={e => setPromoInput(e.target.value)}
                className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600 uppercase font-mono"
              />
              <button
                type="button"
                onClick={applyPromo}
                disabled={promoLoading || !promoInput.trim()}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                Apply
              </button>
            </div>

            {appliedPromo && (
              <div className="text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg flex items-center justify-between">
                <span>Code {appliedPromo.code} active</span>
                <span className="font-mono font-bold">-{formatPrice(appliedPromo.discount)}</span>
              </div>
            )}
          </div>

          {/* Transparent Itemized Price Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
              Transparent Fare Breakdown
            </h3>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Base Airfare ({paxCount} passenger{paxCount > 1 ? 's' : ''})</span>
                <span className="font-mono tabular-nums font-medium">{formatPrice(baseTotal)}</span>
              </div>

              <div className="flex justify-between">
                <span>Airport Taxes, PCAA & Govt Security</span>
                <span className="font-mono tabular-nums font-medium">{formatPrice(taxesTotal)}</span>
              </div>

              {surchargesTotal > 0 && (
                <div className="flex justify-between">
                  <span>Airline Fuel & Supplier Surcharges</span>
                  <span className="font-mono tabular-nums font-medium">{formatPrice(surchargesTotal)}</span>
                </div>
              )}

              <div className="flex justify-between text-sky-800 font-semibold pt-1 border-t border-slate-100">
                <span>Agency Disclosed Service Fee</span>
                <span className="font-mono tabular-nums font-bold">{formatPrice(agencyFeeTotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Promotional Voucher Discount</span>
                  <span className="font-mono tabular-nums font-bold">-{formatPrice(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-900 text-base font-extrabold pt-3 border-t border-slate-200">
                <span>Total Amount Charged</span>
                <span className="font-mono tabular-nums text-slate-900">{formatPrice(finalPayable)}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
              <div>Includes applicable Federal Excise Duty (FED) and airport embarking fees.</div>
              <div>E-ticket will be issued instantaneously upon payment verification.</div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
