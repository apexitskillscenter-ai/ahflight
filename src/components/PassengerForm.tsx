import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PassengerDetails, BookingContact, PassengerTitle, Gender } from '../types/booking';
import { repriceOfferAPI } from '../services/api';
import { User, Mail, Phone, MapPin, ShieldAlert, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight, Loader2, Bookmark } from 'lucide-react';

interface PassengerFormProps {
  onBack: () => void;
  onProceed: (passengers: PassengerDetails[], contact: BookingContact) => void;
}

export const PassengerForm: React.FC<PassengerFormProps> = ({ onBack, onProceed }) => {
  const { selectedOffer, searchParams, savedTravelers, saveTraveler, showToast, formatPrice } = useApp();
  const [revalidating, setRevalidating] = useState(true);
  const [revalidationMessage, setRevalidationMessage] = useState('');

  // Primary Contact Info
  const [contact, setContact] = useState<BookingContact>({
    fullName: '',
    email: '',
    phoneCountryCode: '+92',
    phoneNumber: '',
    city: 'Karachi',
    specialRequests: ''
  });

  // Passengers list initialized to match search parameters
  const [passengers, setPassengers] = useState<PassengerDetails[]>([]);

  useEffect(() => {
    if (!selectedOffer) return;

    // Run price and seat revalidation before presenting form
    setRevalidating(true);
    repriceOfferAPI(selectedOffer.id, selectedOffer.validationToken, selectedOffer.supplier)
      .then(res => {
        if (!res.valid) {
          showToast(res.message || 'Fare has expired. Please re-search.', 'error');
        } else {
          setRevalidationMessage(res.message || 'Live fare and seat confirmed.');
        }
      })
      .catch(err => {
        showToast(err.message || 'Revalidation check failed', 'warning');
      })
      .finally(() => setRevalidating(false));

    // Initialize passengers array
    const initialList: PassengerDetails[] = [];
    let paxIndex = 1;

    for (let i = 0; i < searchParams.adults; i++) {
      initialList.push({
        id: `pax-${paxIndex++}`,
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
        cnicNumber: '',
        mealPreference: 'Standard Halal Meal'
      });
    }

    for (let i = 0; i < searchParams.children; i++) {
      initialList.push({
        id: `pax-${paxIndex++}`,
        type: 'child',
        title: 'Master',
        firstName: '',
        lastName: '',
        dateOfBirth: '2016-01-01',
        gender: 'male',
        nationality: 'PK',
        passportNumber: '',
        passportExpiry: '2029-01-01',
        passportIssuingCountry: 'PK',
        mealPreference: 'Child Meal'
      });
    }

    for (let i = 0; i < searchParams.infants; i++) {
      initialList.push({
        id: `pax-${paxIndex++}`,
        type: 'infant',
        title: 'Master',
        firstName: '',
        lastName: '',
        dateOfBirth: '2025-06-01',
        gender: 'male',
        nationality: 'PK',
        passportNumber: '',
        passportExpiry: '2028-01-01',
        passportIssuingCountry: 'PK',
        mealPreference: 'Infant Meal'
      });
    }

    setPassengers(initialList);
  }, [selectedOffer, searchParams]);

  if (!selectedOffer) return null;

  const isDomestic = selectedOffer.outboundSegments.every(s => 
    ['KHI', 'LHE', 'ISB', 'PEW', 'MUX', 'SKT', 'UET', 'FSD', 'KDU', 'GIL', 'GWD', 'RYK'].includes(s.departureAirport) &&
    ['KHI', 'LHE', 'ISB', 'PEW', 'MUX', 'SKT', 'UET', 'FSD', 'KDU', 'GIL', 'GWD', 'RYK'].includes(s.arrivalAirport)
  );

  const updatePassenger = (index: number, field: keyof PassengerDetails, val: any) => {
    setPassengers(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const applySavedTraveler = (index: number, saved: PassengerDetails) => {
    setPassengers(prev => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        title: saved.title,
        firstName: saved.firstName,
        lastName: saved.lastName,
        dateOfBirth: saved.dateOfBirth,
        gender: saved.gender,
        nationality: saved.nationality,
        passportNumber: saved.passportNumber,
        passportExpiry: saved.passportExpiry,
        passportIssuingCountry: saved.passportIssuingCountry,
        cnicNumber: saved.cnicNumber
      };
      return copy;
    });
    showToast(`Loaded profile for ${saved.firstName} ${saved.lastName}`, 'info');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate Contact
    if (!contact.fullName.trim() || !contact.email.trim() || !contact.phoneNumber.trim()) {
      showToast('Please fill in primary contact name, email, and phone number.', 'warning');
      return;
    }

    // Validate each passenger
    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      if (!p.firstName.trim() || !p.lastName.trim()) {
        showToast(`Passenger #${i + 1} requires both first and last name.`, 'warning');
        return;
      }

      if (!isDomestic) {
        if (!p.passportNumber.trim() || !p.passportExpiry) {
          showToast(`Passport number and expiry are mandatory for international traveler ${p.firstName} ${p.lastName}.`, 'warning');
          return;
        }

        const expDate = new Date(p.passportExpiry);
        const depDate = new Date(selectedOffer.outboundSegments[0].departureTime);
        const sixMonthsAhead = new Date(depDate.getTime() + 180 * 86400000);
        if (expDate < sixMonthsAhead) {
          showToast(`Passport for ${p.firstName} must be valid for at least 6 months beyond travel date (${p.passportExpiry}).`, 'warning');
          return;
        }
      } else {
        // Domestic: CNIC recommended
        if (!p.cnicNumber && !p.passportNumber && p.type === 'adult') {
          showToast(`Adult domestic passenger ${p.firstName} should provide CNIC or Passport number for airport security check.`, 'warning');
          return;
        }
      }

      // Save traveler to profile storage
      saveTraveler(p);
    }

    onProceed(passengers, contact);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      
      {/* Back button and page title */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to flight options</span>
        </button>
        
        <div className="text-right">
          <span className="text-xs text-slate-500">Step 2 of 3</span>
          <h2 className="text-lg font-bold text-slate-900">Traveler Information</h2>
        </div>
      </div>

      {/* Revalidation Banner */}
      {revalidating ? (
        <div className="p-4 bg-sky-50 border border-sky-200 rounded-xl flex items-center gap-3 text-xs text-sky-800">
          <Loader2 className="w-4 h-4 animate-spin text-sky-600 shrink-0" />
          <span>Contacting airline reservation engine to revalidate live price and seat availability...</span>
        </div>
      ) : (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{revalidationMessage || 'Fare locked and guaranteed for 15 minutes.'}</span>
        </div>
      )}

      {/* Selected Itinerary Summary Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-amber-400 font-semibold uppercase tracking-wider">Selected Itinerary</div>
          <div className="text-base font-bold flex items-center gap-2 mt-0.5">
            <span>{selectedOffer.outboundSegments[0].departureCity} ({selectedOffer.outboundSegments[0].departureAirport})</span>
            <span>→</span>
            <span>{selectedOffer.outboundSegments[selectedOffer.outboundSegments.length - 1].arrivalCity} ({selectedOffer.outboundSegments[selectedOffer.outboundSegments.length - 1].arrivalAirport})</span>
          </div>
          <div className="text-xs text-slate-300 mt-1">
            {selectedOffer.outboundSegments[0].airlineName} · {selectedOffer.outboundSegments[0].flightNumber} · {selectedOffer.outboundSegments[0].cabinClass.toUpperCase()}
          </div>
        </div>

        <div className="text-left sm:text-right">
          <div className="text-xs text-slate-300">Total payable (all passengers)</div>
          <div className="text-2xl font-extrabold text-amber-400 tabular-nums">
            {formatPrice(selectedOffer.pricing.totalAmount * (passengers.length || 1))}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Contact Details Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Mail className="w-4 h-4 text-sky-600" />
            <h3 className="text-sm font-bold text-slate-900">Primary Contact (For E-Ticket & SMS Updates)</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Tariq Mehmood"
                value={contact.fullName}
                onChange={e => setContact({ ...contact, fullName: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                placeholder="tariq@example.com"
                value={contact.email}
                onChange={e => setContact({ ...contact, email: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Phone *</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 text-xs font-mono bg-slate-100 border border-r-0 border-slate-200 rounded-l-lg text-slate-600">
                  +92
                </span>
                <input
                  type="tel"
                  required
                  placeholder="300 1234567"
                  value={contact.phoneNumber}
                  onChange={e => setContact({ ...contact, phoneNumber: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-sky-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Individual Passenger Cards */}
        {passengers.map((pax, index) => (
          <div key={pax.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-sky-600" />
                <h3 className="text-sm font-bold text-slate-900 capitalize">
                  Passenger {index + 1}: {pax.type}
                </h3>
              </div>

              {/* Quick load from saved travelers */}
              {savedTravelers.length > 0 && (
                <div className="flex items-center gap-1.5 text-xs">
                  <Bookmark className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-slate-500">Quick Fill:</span>
                  <select
                    onChange={e => {
                      const t = savedTravelers.find(st => st.id === e.target.value);
                      if (t) applySavedTraveler(index, t);
                    }}
                    defaultValue=""
                    className="text-xs bg-slate-100 border-0 rounded px-2 py-1 text-slate-700 cursor-pointer"
                  >
                    <option value="" disabled>Saved Profiles</option>
                    {savedTravelers.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.firstName} {t.lastName} ({t.passportNumber || t.cnicNumber || 'ID'})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
                <select
                  value={pax.title}
                  onChange={e => updatePassenger(index, 'title', e.target.value as PassengerTitle)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600"
                >
                  <option value="Mr">Mr</option>
                  <option value="Mrs">Mrs</option>
                  <option value="Ms">Ms</option>
                  <option value="Master">Master</option>
                  <option value="Miss">Miss</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">First & Middle Name *</label>
                <input
                  type="text"
                  required
                  placeholder="As on passport"
                  value={pax.firstName}
                  onChange={e => updatePassenger(index, 'firstName', e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600 uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Last / Family Name *</label>
                <input
                  type="text"
                  required
                  placeholder="As on passport"
                  value={pax.lastName}
                  onChange={e => updatePassenger(index, 'lastName', e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600 uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth *</label>
                <input
                  type="date"
                  required
                  value={pax.dateOfBirth}
                  onChange={e => updatePassenger(index, 'dateOfBirth', e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                <select
                  value={pax.gender}
                  onChange={e => updatePassenger(index, 'gender', e.target.value as Gender)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nationality</label>
                <input
                  type="text"
                  value={pax.nationality}
                  onChange={e => updatePassenger(index, 'nationality', e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600 uppercase"
                />
              </div>

              {!isDomestic ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Passport Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. BL829401"
                      value={pax.passportNumber}
                      onChange={e => updatePassenger(index, 'passportNumber', e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600 font-mono uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Passport Expiry *</label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={pax.passportExpiry}
                      onChange={e => updatePassenger(index, 'passportExpiry', e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Pakistan CNIC Number</label>
                    <input
                      type="text"
                      placeholder="42201-1234567-1"
                      value={pax.cnicNumber || ''}
                      onChange={e => updatePassenger(index, 'cnicNumber', e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Meal Preference</label>
                    <select
                      value={pax.mealPreference || 'Standard Halal Meal'}
                      onChange={e => updatePassenger(index, 'mealPreference', e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600"
                    >
                      <option value="Standard Halal Meal">Standard Halal Meal</option>
                      <option value="Asian Vegetarian">Asian Vegetarian</option>
                      <option value="Diabetic Meal">Diabetic Meal</option>
                      <option value="Child Meal">Child Meal</option>
                      <option value="Fruit Platter">Fruit Platter</option>
                    </select>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}

        {/* Notice of Data Protection */}
        <div className="p-4 bg-slate-100 rounded-xl text-xs text-slate-600 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <span>
            AH Flight complies with the Pakistan Personal Data Protection guidelines and airline reservation standards. Passport and national identification numbers are transmitted through encrypted channels solely for airline security screening and manifest generation.
          </span>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2.5 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-100 transition-colors"
          >
            Back
          </button>

          <button
            type="submit"
            disabled={revalidating}
            className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>Proceed to Checkout & Payment</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </form>

    </div>
  );
};
