import React from 'react';
import { FlightOffer } from '../types/flight';
import { useApp } from '../context/AppContext';
import { getAirlineInfo } from '../data/airlines';
import { X, Plane, Clock, ShieldCheck, Luggage, Utensils, AlertTriangle, ArrowRight } from 'lucide-react';

interface FlightDetailsModalProps {
  offer: FlightOffer | null;
  onClose: () => void;
  onSelect: (offer: FlightOffer) => void;
}

export const FlightDetailsModal: React.FC<FlightDetailsModalProps> = ({ offer, onClose, onSelect }) => {
  const { formatPrice } = useApp();
  if (!offer) return null;

  const formatDateTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString([], {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return iso;
    }
  };

  const formatMins = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h} hr ${m > 0 ? `${m} min` : ''}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg">Itinerary & Fare Rules</h3>
            <div className="text-xs text-slate-500">
              Inventory Ref: <span className="font-mono">{offer.supplierOfferId}</span> · {offer.supplier.toUpperCase()}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Flight Segments Itinerary */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Flight Segments</h4>
            
            {offer.outboundSegments.map((seg, idx) => {
              const airline = getAirlineInfo(seg.airlineCode);
              const layover = offer.layoversOutbound[idx];

              return (
                <div key={seg.id} className="space-y-3">
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="px-2 py-0.5 text-white text-xs font-bold rounded"
                          style={{ backgroundColor: airline.logoBg }}
                        >
                          {seg.airlineCode}
                        </span>
                        <span className="font-bold text-slate-900 text-sm">{airline.name}</span>
                        <span className="text-xs text-slate-500">Flight {seg.flightNumber}</span>
                      </div>
                      <span className="text-xs font-semibold text-slate-600 capitalize bg-white px-2 py-0.5 rounded border border-slate-200">
                        {seg.cabinClass.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div>
                        <div className="text-xs text-slate-500">Departure</div>
                        <div className="text-sm font-bold text-slate-900">{formatDateTime(seg.departureTime)}</div>
                        <div className="text-xs text-slate-700 font-medium">
                          {seg.departureAirport} · {seg.departureCity}
                        </div>
                        {seg.departureTerminal && (
                          <div className="text-[11px] text-slate-500">{seg.departureTerminal}</div>
                        )}
                      </div>

                      <div>
                        <div className="text-xs text-slate-500">Arrival</div>
                        <div className="text-sm font-bold text-slate-900">{formatDateTime(seg.arrivalTime)}</div>
                        <div className="text-xs text-slate-700 font-medium">
                          {seg.arrivalAirport} · {seg.arrivalCity}
                        </div>
                        {seg.arrivalTerminal && (
                          <div className="text-[11px] text-slate-500">{seg.arrivalTerminal}</div>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center gap-4 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Duration: {formatMins(seg.durationMinutes)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Luggage className="w-3.5 h-3.5 text-slate-400" />
                        <span>Baggage: {seg.checkedBaggage}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Utensils className="w-3.5 h-3.5 text-slate-400" />
                        <span>Complimentary Meal</span>
                      </div>
                    </div>
                  </div>

                  {/* Layover Box if connecting */}
                  {layover && (
                    <div className="mx-6 p-2.5 bg-amber-50/80 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        Layover in <strong className="font-semibold">{layover.city} ({layover.airportCode})</strong>: {formatMins(layover.durationMinutes)}. Checked baggage automatically transferred.
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Transparent Price & Fee Breakdown */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Itemized Fare Breakdown</h4>
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 text-xs">
              <div className="flex justify-between text-slate-700">
                <span>Airline Base Airfare</span>
                <span className="font-mono tabular-nums font-semibold">{formatPrice(offer.pricing.baseFare)}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Airport Taxes, CAA & Passenger Security</span>
                <span className="font-mono tabular-nums font-semibold">{formatPrice(offer.pricing.taxesAirportCharges)}</span>
              </div>
              {offer.pricing.supplierSurcharges > 0 && (
                <div className="flex justify-between text-slate-700">
                  <span>Carrier Surcharges & Fuel</span>
                  <span className="font-mono tabular-nums font-semibold">{formatPrice(offer.pricing.supplierSurcharges)}</span>
                </div>
              )}
              <div className="flex justify-between text-sky-800 font-medium pt-1 border-t border-slate-100">
                <span>AH Flight Agency Service Fee (Disclosed)</span>
                <span className="font-mono tabular-nums font-bold">{formatPrice(offer.pricing.agencyServiceFee)}</span>
              </div>
              <div className="flex justify-between text-slate-900 text-sm font-extrabold pt-2 border-t border-slate-200">
                <span>Total Amount to Pay</span>
                <span className="font-mono tabular-nums text-sky-700">{formatPrice(offer.pricing.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Fare Conditions & Penalty Rules */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Airline Penalties & Conditions</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <div className="font-bold text-slate-900 mb-1">Cancellation / Refund</div>
                {offer.fareConditions.refundable ? (
                  <div className="text-slate-600">
                    Permitted prior to departure subject to airline penalty fee of <span className="font-bold font-mono">{formatPrice(offer.fareConditions.cancellationPenaltyPKR)}</span> plus PKR 1,500 agency processing fee.
                  </div>
                ) : (
                  <div className="text-rose-700 font-medium">
                    Strictly Non-Refundable fare. Only unutilized government taxes can be claimed upon cancellation.
                  </div>
                )}
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <div className="font-bold text-slate-900 mb-1">Date Changes</div>
                {offer.fareConditions.changeAllowed ? (
                  <div className="text-slate-600">
                    Permitted with penalty of <span className="font-bold font-mono">{formatPrice(offer.fareConditions.changePenaltyPKR)}</span> plus any applicable airfare difference at time of rebooking.
                  </div>
                ) : (
                  <div className="text-rose-700 font-medium">Flight dates cannot be altered on this promo class.</div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500">Final Total</div>
            <div className="text-xl font-extrabold text-slate-900 tabular-nums">
              {formatPrice(offer.pricing.totalAmount)}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onSelect(offer);
              }}
              className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <span>Book This Flight</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
