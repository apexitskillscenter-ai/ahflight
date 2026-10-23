import React from 'react';
import { useApp } from '../context/AppContext';
import { getAirlineInfo } from '../data/airlines';
import { CheckCircle2, Printer, Download, Share2, Plane, Calendar, Clock, Luggage, ShieldCheck, ArrowRight, User } from 'lucide-react';

export const BookingConfirmation: React.FC = () => {
  const { activeBooking, formatPrice, setView, setManageBookingModalOpen } = useApp();

  if (!activeBooking) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <p className="text-slate-600">No active booking found.</p>
        <button
          onClick={() => setView('search')}
          className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold"
        >
          Search Flights
        </button>
      </div>
    );
  }

  const segment = activeBooking.offer.outboundSegments[0];
  const lastSegment = activeBooking.offer.outboundSegments[activeBooking.offer.outboundSegments.length - 1];
  const airline = getAirlineInfo(segment.airlineCode);

  const formatDateTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString([], {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      
      {/* Top Banner - Confirmation */}
      <div className="no-print bg-white rounded-2xl border border-emerald-200 p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Flight Booking Confirmed & Ticketed</h2>
            <p className="text-xs text-slate-600 mt-0.5">
              An electronic ticket receipt has been generated and dispatched to <span className="font-semibold text-slate-800">{activeBooking.contact.email}</span>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex-1 sm:flex-initial px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Print E-Ticket</span>
          </button>
          
          <button
            type="button"
            onClick={() => setManageBookingModalOpen(true)}
            className="flex-1 sm:flex-initial px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Manage Booking</span>
          </button>
        </div>
      </div>

      {/* Demo Warning Banner if Demo */}
      {activeBooking.isDemoBooking && (
        <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-center text-xs font-bold text-amber-900 tracking-wide uppercase">
          Demo Booking: Simulated Reservation (Not Valid for Airport Boarding)
        </div>
      )}

      {/* Printable E-Ticket Body (IATA Compliant Style) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden print:border-none print:shadow-none">
        
        {/* Ticket Header */}
        <div className="p-6 bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-white">AH <span className="text-sky-400">Flight</span></span>
              <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                ELECTRONIC TICKET RECEIPT
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Authorized Travel Agent DTS: DTS-PK-KHI-4892 · Karachi, Pakistan
            </div>
          </div>

          <div className="text-left sm:text-right">
            <div className="text-xs text-slate-400">Agency Booking Reference (PNR)</div>
            <div className="text-2xl font-black text-amber-400 font-mono tracking-widest tabular-nums">
              {activeBooking.pnr}
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Airline GDS Ref: {activeBooking.supplierBookingReference}
            </div>
          </div>
        </div>

        {/* Passenger Manifest Table */}
        <div className="p-6 border-b border-slate-100 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Passenger & E-Ticket Details</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-lg">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Passenger Name</th>
                  <th className="p-2.5">Type</th>
                  <th className="p-2.5">Passport / CNIC</th>
                  <th className="p-2.5">E-Ticket Number</th>
                  <th className="p-2.5">Meal / Seat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeBooking.passengers.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="p-2.5 font-bold text-slate-900 uppercase">
                      {p.title} {p.firstName} {p.lastName}
                    </td>
                    <td className="p-2.5 capitalize text-slate-600">{p.type}</td>
                    <td className="p-2.5 font-mono text-slate-700">
                      {p.passportNumber || p.cnicNumber || 'N/A'}
                    </td>
                    <td className="p-2.5 font-mono font-bold text-sky-800">
                      {p.ticketNumber || 'PENDING'}
                    </td>
                    <td className="p-2.5 text-slate-600">
                      {p.mealPreference || 'Standard'} · {p.assignedSeat || 'Check-in'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Flight Itinerary Table */}
        <div className="p-6 border-b border-slate-100 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Confirmed Flight Itinerary</h3>
          
          {activeBooking.offer.outboundSegments.map(seg => (
            <div key={seg.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="px-2 py-0.5 text-white text-xs font-bold rounded"
                    style={{ backgroundColor: airline.logoBg }}
                  >
                    {seg.airlineCode}
                  </span>
                  <span className="font-bold text-slate-900 text-sm">{seg.airlineName}</span>
                  <span className="text-xs text-slate-600 font-semibold">Flight {seg.flightNumber}</span>
                  <span className="text-xs text-slate-500">({seg.aircraft})</span>
                </div>
                <span className="text-xs font-bold uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Confirmed / HK
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="text-slate-500">Departing</div>
                  <div className="text-sm font-bold text-slate-900">{formatDateTime(seg.departureTime)}</div>
                  <div className="font-semibold text-slate-800">
                    {seg.departureCity} ({seg.departureAirport})
                  </div>
                  {seg.departureTerminal && <div className="text-slate-500">{seg.departureTerminal}</div>}
                </div>

                <div>
                  <div className="text-slate-500">Arriving</div>
                  <div className="text-sm font-bold text-slate-900">{formatDateTime(seg.arrivalTime)}</div>
                  <div className="font-semibold text-slate-800">
                    {seg.arrivalCity} ({seg.arrivalAirport})
                  </div>
                  {seg.arrivalTerminal && <div className="text-slate-500">{seg.arrivalTerminal}</div>}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center gap-4 text-xs text-slate-600">
                <div className="flex items-center gap-1">
                  <Luggage className="w-3.5 h-3.5 text-slate-400" />
                  <span>Baggage: {seg.checkedBaggage}</span>
                </div>
                <div>Cabin: {seg.cabinBaggage}</div>
                <div className="capitalize">Class: {seg.cabinClass.replace('_', ' ')}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Payment & Invoice Settlement Summary */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50">
          <div className="space-y-1.5 text-xs text-slate-600">
            <h4 className="font-bold uppercase tracking-wider text-slate-700">Billing & Payment</h4>
            <div>Method: <span className="font-semibold text-slate-900 uppercase">{activeBooking.payment.method.replace('_', ' ')}</span></div>
            <div>Transaction Reference: <span className="font-mono">{activeBooking.payment.transactionId}</span></div>
            <div>Payment Date: <span>{formatDateTime(activeBooking.payment.paidAt)}</span></div>
            <div>Payment Status: <span className="font-bold text-emerald-700 uppercase">{activeBooking.payment.status}</span></div>
          </div>

          <div className="space-y-1 text-xs text-right">
            <h4 className="font-bold uppercase tracking-wider text-slate-700">Financial Summary</h4>
            <div className="flex justify-between">
              <span className="text-slate-600">Airfare & Taxes:</span>
              <span className="font-mono tabular-nums">{formatPrice(activeBooking.financials.supplierNetRemittance + activeBooking.financials.taxesAndAirportCharges)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Agency Disclosed Service Fee:</span>
              <span className="font-mono tabular-nums">{formatPrice(activeBooking.financials.agencyServiceFee)}</span>
            </div>
            {activeBooking.financials.promoDiscount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Discount:</span>
                <span className="font-mono tabular-nums">-{formatPrice(activeBooking.financials.promoDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-1 border-t border-slate-200">
              <span>Total Paid:</span>
              <span className="font-mono tabular-nums text-slate-900">{formatPrice(activeBooking.payment.amount)}</span>
            </div>
          </div>
        </div>

        {/* Airport Check-in Instructions */}
        <div className="p-6 bg-white border-t border-slate-100 text-[11px] text-slate-500 space-y-1.5 leading-relaxed">
          <div className="font-bold text-slate-700 uppercase">Important Travel Notice</div>
          <p>
            Please present this electronic ticket receipt along with valid government photo identification (original Passport for international flights or original CNIC for domestic flights) at the airline check-in counter at least 3 hours prior to international departure (or 2 hours for domestic flights).
          </p>
          <p>
            For schedule modifications, baggage inquiries, or emergency travel assistance, contact AH Flight 24/7 hotline at <strong className="font-mono">+92 21 3452 8900</strong> or email <strong className="font-mono">support@ahflight.pk</strong> quoting your PNR <strong className="font-mono font-bold text-slate-800">{activeBooking.pnr}</strong>.
          </p>
        </div>

      </div>

      {/* Post-Booking Action Links */}
      <div className="no-print flex flex-wrap items-center justify-between gap-4 pt-4">
        <button
          type="button"
          onClick={() => setView('search')}
          className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2"
        >
          <span>Book Another Flight</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => setView('my_trips')}
          className="text-xs font-semibold text-sky-600 hover:text-sky-700 underline underline-offset-4"
        >
          View in My Trips Dashboard →
        </button>
      </div>

    </div>
  );
};
