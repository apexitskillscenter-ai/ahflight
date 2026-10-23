import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BookingRecord, PassengerDetails } from '../types/booking';
import { Plane, Calendar, User, Trash2, Printer, Plus, ShieldCheck, ArrowRight } from 'lucide-react';

export const CustomerDashboard: React.FC = () => {
  const {
    userTrips,
    setActiveBooking,
    setView,
    formatPrice,
    savedTravelers,
    saveTraveler,
    setManageBookingModalOpen,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'trips' | 'travelers'>('trips');
  const [showAddTravelerModal, setShowAddTravelerModal] = useState(false);
  const [newTraveler, setNewTraveler] = useState<PassengerDetails>({
    id: '',
    type: 'adult',
    title: 'Mr',
    firstName: '',
    lastName: '',
    dateOfBirth: '1990-01-01',
    gender: 'male',
    nationality: 'PK',
    passportNumber: '',
    passportExpiry: '2030-01-01',
    passportIssuingCountry: 'PK',
    cnicNumber: ''
  });

  const handleAddTraveler = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTraveler.firstName || !newTraveler.lastName) {
      showToast('First and last name are required.', 'warning');
      return;
    }
    const traveler = {
      ...newTraveler,
      id: `saved-${Date.now()}`
    };
    saveTraveler(traveler);
    showToast(`Saved profile for ${traveler.firstName} ${traveler.lastName}`, 'success');
    setShowAddTravelerModal(false);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Customer Travel Portal</h2>
          <p className="text-xs text-slate-500">
            View active flight reservations, reprint e-tickets, and manage saved passenger passport profiles.
          </p>
        </div>

        <button
          onClick={() => setView('search')}
          className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-1.5"
        >
          <Plane className="w-4 h-4" />
          <span>Book New Flight</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('trips')}
          className={`py-2 px-4 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'trips'
              ? 'border-sky-600 text-sky-700 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Plane className="w-4 h-4" />
          <span>My Trips ({userTrips.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('travelers')}
          className={`py-2 px-4 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'travelers'
              ? 'border-sky-600 text-sky-700 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Saved Passenger Profiles ({savedTravelers.length})</span>
        </button>
      </div>

      {/* Tab 1: Trips List */}
      {activeTab === 'trips' && (
        <div className="space-y-4">
          {userTrips.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-4">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <Plane className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">No booked trips yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  When you search and book flights on AH Flight, your confirmed itineraries and electronic tickets will appear here.
                </p>
              </div>
              <button
                onClick={() => setView('search')}
                className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl transition-all shadow-sm"
              >
                Find Flights Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {userTrips.map(trip => {
                const seg = trip.offer.outboundSegments[0];
                const lastSeg = trip.offer.outboundSegments[trip.offer.outboundSegments.length - 1];

                return (
                  <div
                    key={trip.pnr}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-extrabold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded">
                          PNR: {trip.pnr}
                        </span>
                        <span className="text-xs font-bold uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {trip.status.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-slate-500">
                          Booked on {new Date(trip.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="text-base font-bold text-slate-900">
                        {seg.departureCity} ({seg.departureAirport}) → {lastSeg.arrivalCity} ({lastSeg.arrivalAirport})
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                        <span>{seg.airlineName} ({seg.flightNumber})</span>
                        <span aria-hidden="true">·</span>
                        <span>Departure: {new Date(seg.departureTime).toLocaleDateString()} at {new Date(seg.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span aria-hidden="true">·</span>
                        <span>{trip.passengers.length} Passenger{trip.passengers.length > 1 ? 's' : ''}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-start md:items-end justify-between border-t md:border-t-0 pt-3 md:pt-0">
                      <div className="text-sm font-extrabold text-slate-900 tabular-nums">
                        {formatPrice(trip.payment.amount)}
                      </div>
                      
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveBooking(trip);
                            setView('confirmation');
                          }}
                          className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>View E-Ticket</span>
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => setManageBookingModalOpen(true)}
                          className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 transition-colors"
                        >
                          Change / Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Saved Travelers */}
      {activeTab === 'travelers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Save frequent flyer and family passport details for quick 1-click booking without re-entering numbers each time.
            </p>
            <button
              onClick={() => setShowAddTravelerModal(true)}
              className="px-3.5 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Traveler Profile</span>
            </button>
          </div>

          {savedTravelers.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
              <p className="text-xs text-slate-500">No saved passenger profiles yet.</p>
              <button
                onClick={() => setShowAddTravelerModal(true)}
                className="text-xs font-bold text-sky-600 hover:text-sky-700 underline"
              >
                + Add First Traveler
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {savedTravelers.map(t => (
                <div key={t.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-2 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-bold text-slate-900 uppercase">
                      {t.title} {t.firstName} {t.lastName}
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase font-mono">{t.nationality}</span>
                  </div>
                  <div className="text-slate-600">DOB: <span className="font-mono">{t.dateOfBirth}</span></div>
                  {t.passportNumber && (
                    <div className="text-slate-600">
                      Passport: <span className="font-mono font-semibold">{t.passportNumber}</span> (Exp: {t.passportExpiry})
                    </div>
                  )}
                  {t.cnicNumber && (
                    <div className="text-slate-600">
                      CNIC: <span className="font-mono">{t.cnicNumber}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Traveler Modal */}
      {showAddTravelerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm">Add Traveler Profile</h3>
            <form onSubmit={handleAddTraveler} className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-600 mb-1">Title</label>
                  <select
                    value={newTraveler.title}
                    onChange={e => setNewTraveler({ ...newTraveler, title: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="Mr">Mr</option>
                    <option value="Mrs">Mrs</option>
                    <option value="Ms">Ms</option>
                    <option value="Master">Master</option>
                    <option value="Miss">Miss</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-slate-600 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={newTraveler.firstName}
                    onChange={e => setNewTraveler({ ...newTraveler, firstName: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Last Name *</label>
                <input
                  type="text"
                  required
                  value={newTraveler.lastName}
                  onChange={e => setNewTraveler({ ...newTraveler, lastName: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    required
                    value={newTraveler.dateOfBirth}
                    onChange={e => setNewTraveler({ ...newTraveler, dateOfBirth: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Passport Number</label>
                  <input
                    type="text"
                    placeholder="e.g. BL829410"
                    value={newTraveler.passportNumber}
                    onChange={e => setNewTraveler({ ...newTraveler, passportNumber: e.target.value.toUpperCase() })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 mb-1">Passport Expiry</label>
                  <input
                    type="date"
                    value={newTraveler.passportExpiry}
                    onChange={e => setNewTraveler({ ...newTraveler, passportExpiry: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">CNIC (Pakistan)</label>
                  <input
                    type="text"
                    placeholder="42201-1234567-1"
                    value={newTraveler.cnicNumber || ''}
                    onChange={e => setNewTraveler({ ...newTraveler, cnicNumber: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTravelerModal(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 text-white rounded-lg font-bold"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
