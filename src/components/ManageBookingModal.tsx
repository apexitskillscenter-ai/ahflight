import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { lookupBookingAPI, requestRefundAPI, requestChangeAPI } from '../services/api';
import { BookingRecord } from '../types/booking';
import { X, Search, Calendar, RefreshCw, AlertCircle, CheckCircle2, Loader2, Printer, ArrowRight } from 'lucide-react';

export const ManageBookingModal: React.FC = () => {
  const {
    manageBookingModalOpen,
    setManageBookingModalOpen,
    setActiveBooking,
    setView,
    formatPrice,
    showToast
  } = useApp();

  const [pnrInput, setPnrInput] = useState('');
  const [queryInput, setQueryInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [foundBooking, setFoundBooking] = useState<BookingRecord | null>(null);

  // Sub-actions: change date or cancel
  const [activeTab, setActiveTab] = useState<'details' | 'change' | 'refund'>('details');
  const [newDate, setNewDate] = useState('');
  const [changeReason, setChangeReason] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  if (!manageBookingModalOpen) return null;

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pnrInput.trim()) {
      showToast('Please enter your 6-character PNR reference code.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const res = await lookupBookingAPI(pnrInput.trim(), queryInput.trim());
      if (res.success && res.booking) {
        setFoundBooking(res.booking);
        setActiveTab('details');
        showToast('Booking record retrieved successfully.', 'success');
      } else {
        showToast('Booking not found with provided reference.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Could not find booking. Please verify PNR and last name.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foundBooking) return;
    setSubmittingAction(true);
    try {
      const res = await requestRefundAPI(foundBooking.pnr, refundReason);
      if (res.success && res.booking) {
        setFoundBooking(res.booking);
        setActiveBooking(res.booking);
        showToast(res.message, 'success');
        setActiveTab('details');
      }
    } catch (err: any) {
      showToast(err.message || 'Refund request failed', 'error');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleRequestChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foundBooking || !newDate) {
      showToast('Please select a target travel date.', 'warning');
      return;
    }
    setSubmittingAction(true);
    try {
      const res = await requestChangeAPI(foundBooking.pnr, newDate, changeReason);
      if (res.success && res.booking) {
        setFoundBooking(res.booking);
        setActiveBooking(res.booking);
        showToast(res.message, 'success');
        setActiveTab('details');
      }
    } catch (err: any) {
      showToast(err.message || 'Date change request failed', 'error');
    } finally {
      setSubmittingAction(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg">Manage Flight Booking</h3>
            <p className="text-xs text-slate-500">
              Lookup itinerary, request date modifications, or submit cancellation
            </p>
          </div>
          <button
            onClick={() => setManageBookingModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Lookup Form */}
          <form onSubmit={handleLookup} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Booking Reference (PNR) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AH89QK or PK49Q2"
                  value={pnrInput}
                  onChange={e => setPnrInput(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600 font-mono uppercase font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Passenger Last Name or Email
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ahmed or ahmed@example.com"
                  value={queryInput}
                  onChange={e => setQueryInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Searching PNR in GDS Database...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Find My Booking</span>
                </>
              )}
            </button>
          </form>

          {/* Found Booking Details */}
          {foundBooking && (
            <div className="space-y-4 pt-2">
              
              {/* Tabs for Details / Change / Refund */}
              <div className="flex border-b border-slate-200 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveTab('details')}
                  className={`py-2 px-4 border-b-2 transition-colors ${
                    activeTab === 'details'
                      ? 'border-sky-600 text-sky-700 font-bold'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Itinerary & Status
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('change')}
                  className={`py-2 px-4 border-b-2 transition-colors ${
                    activeTab === 'change'
                      ? 'border-sky-600 text-sky-700 font-bold'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Request Date Change
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('refund')}
                  className={`py-2 px-4 border-b-2 transition-colors ${
                    activeTab === 'refund'
                      ? 'border-sky-600 text-sky-700 font-bold'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Request Cancellation / Refund
                </button>
              </div>

              {activeTab === 'details' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div>
                      <div className="text-xs text-slate-500">PNR Reference</div>
                      <div className="text-lg font-bold font-mono text-slate-900">{foundBooking.pnr}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Booking Status</div>
                      <span className="text-xs font-bold uppercase text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded">
                        {foundBooking.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Gross Paid</div>
                      <div className="text-sm font-bold font-mono text-slate-900">
                        {formatPrice(foundBooking.payment.amount)}
                      </div>
                    </div>
                  </div>

                  {/* Flight Info */}
                  <div className="p-3.5 border border-slate-200 rounded-xl space-y-2 text-xs">
                    <div className="font-bold text-slate-900">
                      {foundBooking.offer.outboundSegments[0].departureCity} ({foundBooking.offer.outboundSegments[0].departureAirport}) → {foundBooking.offer.outboundSegments[foundBooking.offer.outboundSegments.length - 1].arrivalCity} ({foundBooking.offer.outboundSegments[foundBooking.offer.outboundSegments.length - 1].arrivalAirport})
                    </div>
                    <div className="text-slate-600">
                      Airline: {foundBooking.offer.outboundSegments[0].airlineName} ({foundBooking.offer.outboundSegments[0].flightNumber})
                    </div>
                    <div className="text-slate-600">
                      Departure: {new Date(foundBooking.offer.outboundSegments[0].departureTime).toLocaleString()}
                    </div>
                  </div>

                  {/* Passengers */}
                  <div className="space-y-1.5 text-xs">
                    <div className="font-bold text-slate-700">Passenger Manifest</div>
                    {foundBooking.passengers.map(p => (
                      <div key={p.id} className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between">
                        <span className="font-semibold text-slate-900 uppercase">
                          {p.title} {p.firstName} {p.lastName}
                        </span>
                        <span className="font-mono text-sky-800 font-bold">
                          E-Ticket: {p.ticketNumber}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveBooking(foundBooking);
                        setManageBookingModalOpen(false);
                        setView('confirmation');
                      }}
                      className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 flex items-center gap-1.5"
                    >
                      <Printer className="w-4 h-4" />
                      <span>View & Print E-Ticket</span>
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'change' && (
                <form onSubmit={handleRequestChange} className="space-y-4">
                  <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-900 leading-relaxed">
                    Flight date changes are subject to airline seat availability and fare differences. The airline change penalty of <strong className="font-bold">{formatPrice(foundBooking.offer.fareConditions.changePenaltyPKR)}</strong> plus PKR 1,000 agency re-issuance fee will apply.
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Select New Travel Date *</label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={newDate}
                      onChange={e => setNewDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Rescheduling</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Personal schedule change, visa update..."
                      value={changeReason}
                      onChange={e => setChangeReason(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingAction}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                  >
                    {submittingAction ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Submit Date Change Request</span>}
                  </button>
                </form>
              )}

              {activeTab === 'refund' && (
                <form onSubmit={handleRequestRefund} className="space-y-4">
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 leading-relaxed">
                    <strong className="font-bold">Cancellation Terms:</strong> Standard airline cancellation penalty of <span className="font-bold">{formatPrice(foundBooking.offer.fareConditions.cancellationPenaltyPKR)}</span> will be deducted. Net refundable balance will be credited to your original payment method within 5-7 business days.
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Cancellation</label>
                    <textarea
                      rows={2}
                      required
                      placeholder="e.g. Travel plan cancelled due to personal emergency..."
                      value={refundReason}
                      onChange={e => setRefundReason(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingAction}
                    className="w-full py-2.5 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                  >
                    {submittingAction ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Confirm Cancellation & Request Refund</span>}
                  </button>
                </form>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
