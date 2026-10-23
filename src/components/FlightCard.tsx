import React from 'react';
import { FlightOffer } from '../types/flight';
import { useApp } from '../context/AppContext';
import { getAirlineInfo } from '../data/airlines';
import { Plane, Clock, Luggage, ShieldAlert, ArrowRight, CheckCircle2, ChevronRight, Info } from 'lucide-react';

interface FlightCardProps {
  offer: FlightOffer;
  onSelect: (offer: FlightOffer) => void;
  onViewDetails: (offer: FlightOffer) => void;
}

export const FlightCard: React.FC<FlightCardProps> = ({ offer, onSelect, onViewDetails }) => {
  const { formatPrice } = useApp();
  const segment = offer.outboundSegments[0];
  const lastSegment = offer.outboundSegments[offer.outboundSegments.length - 1];
  const airline = getAirlineInfo(segment?.airlineCode || 'PK');

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return iso;
    }
  };

  const formatDuration = (mins: number) => {
    const hours = Math.floor(mins / 60);
    const m = mins % 60;
    return `${hours}h ${m > 0 ? `${m}m` : ''}`;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 transition-all shadow-sm hover:shadow-md p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6">
      
      {/* Flight Left & Center Section */}
      <div className="flex-1 space-y-4">
        
        {/* Airline & Aircraft Header */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white shadow-xs shrink-0"
              style={{ backgroundColor: airline.logoBg }}
            >
              {airline.code}
            </div>
            <div>
              <span className="font-bold text-slate-900 text-sm">{airline.name}</span>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>{segment.flightNumber}</span>
                <span aria-hidden="true">·</span>
                <span>{segment.aircraft}</span>
                <span aria-hidden="true">·</span>
                <span className="capitalize">{segment.cabinClass.replace('_', ' ')}</span>
              </div>
            </div>
          </div>

          {/* Supplier Inventory Mode Marker */}
          <div className="text-right">
            {offer.isDemoData ? (
              <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Verified Sandbox Fare
              </span>
            ) : (
              <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Live GDS Direct
              </span>
            )}
          </div>
        </div>

        {/* Flight Schedule Times & Path */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center py-2 border-y border-slate-100">
          
          {/* Departure */}
          <div className="sm:col-span-4">
            <div className="text-xl font-extrabold text-slate-900 tabular-nums">
              {formatTime(segment.departureTime)}
            </div>
            <div className="text-sm font-semibold text-slate-700">{segment.departureAirport}</div>
            <div className="text-xs text-slate-500 truncate">{segment.departureCity}</div>
            {segment.departureTerminal && (
              <div className="text-[11px] text-slate-400">{segment.departureTerminal}</div>
            )}
          </div>

          {/* Journey Duration & Stops Line */}
          <div className="sm:col-span-4 flex flex-col items-center justify-center px-2 text-center">
            <span className="text-xs font-semibold text-slate-600 tabular-nums">
              {formatDuration(offer.totalOutboundDurationMinutes)}
            </span>
            <div className="w-full relative flex items-center justify-center my-1.5">
              <div className="w-full h-[2px] bg-slate-200"></div>
              {offer.stopsOutbound === 0 ? (
                <div className="absolute w-2 h-2 rounded-full bg-emerald-500"></div>
              ) : (
                <div className="absolute flex items-center gap-1">
                  {offer.layoversOutbound.map((l, i) => (
                    <div key={i} className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-white" title={`Layover in ${l.city} (${l.durationMinutes}m)`}></div>
                  ))}
                </div>
              )}
            </div>
            <span className="text-xs font-medium text-slate-600">
              {offer.stopsOutbound === 0 ? (
                <span className="text-emerald-700 font-semibold">Direct Flight</span>
              ) : (
                <span>{offer.stopsOutbound} Stop ({offer.layoversOutbound.map(l => l.airportCode).join(', ')})</span>
              )}
            </span>
          </div>

          {/* Arrival */}
          <div className="sm:col-span-4 text-left sm:text-right">
            <div className="text-xl font-extrabold text-slate-900 tabular-nums">
              {formatTime(lastSegment.arrivalTime)}
            </div>
            <div className="text-sm font-semibold text-slate-700">{lastSegment.arrivalAirport}</div>
            <div className="text-xs text-slate-500 truncate">{lastSegment.arrivalCity}</div>
            {lastSegment.arrivalTerminal && (
              <div className="text-[11px] text-slate-400">{lastSegment.arrivalTerminal}</div>
            )}
          </div>

        </div>

        {/* Clean Unboxed Metadata: Baggage, Refund Rules, Meals */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <Luggage className="w-3.5 h-3.5 text-slate-400" />
            <span>{segment.checkedBaggage}</span>
            <span aria-hidden="true">·</span>
            <span>{segment.cabinBaggage}</span>
          </div>
          
          <span aria-hidden="true" className="text-slate-300">|</span>

          <div>
            {offer.fareConditions.refundable ? (
              <span className="text-emerald-700 font-medium">Refundable (Fee applies)</span>
            ) : (
              <span className="text-amber-700 font-medium">Non-Refundable</span>
            )}
          </div>

          <span aria-hidden="true" className="text-slate-300">|</span>

          <button
            type="button"
            onClick={() => onViewDetails(offer)}
            className="text-sky-600 hover:text-sky-700 font-semibold underline underline-offset-2 flex items-center gap-1 cursor-pointer"
          >
            <Info className="w-3 h-3" />
            Flight details & fare rules
          </button>
        </div>

      </div>

      {/* Right Pricing & Booking CTA Area */}
      <div className="md:w-56 md:border-l md:border-slate-100 md:pl-6 flex flex-col justify-between items-start md:items-end text-left md:text-right border-t md:border-t-0 pt-4 md:pt-0">
        <div>
          <div className="text-xs text-slate-500">Total Price (incl. taxes & fee)</div>
          <div className="text-2xl font-extrabold text-slate-900 tabular-nums tracking-tight">
            {formatPrice(offer.pricing.totalAmount)}
          </div>
          <div className="text-[11px] text-slate-500 space-y-0.5 mt-1">
            <div>Base: {formatPrice(offer.pricing.baseFare)}</div>
            <div>Taxes & PCAA: {formatPrice(offer.pricing.taxesAirportCharges)}</div>
            <div className="text-slate-600 font-medium">Agency Fee: {formatPrice(offer.pricing.agencyServiceFee)}</div>
          </div>
        </div>

        <div className="w-full mt-4 space-y-2">
          <button
            type="button"
            onClick={() => onSelect(offer)}
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Select Flight</span>
            <ChevronRight className="w-4 h-4" />
          </button>
          
          <div className="text-[10px] text-slate-500 text-center">
            {offer.seatsRemaining <= 3 ? (
              <span className="text-rose-600 font-semibold">Only {offer.seatsRemaining} seats left at this price</span>
            ) : (
              <span>Instant Confirmation</span>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
