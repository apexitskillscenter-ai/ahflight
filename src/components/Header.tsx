import React from 'react';
import { useApp, Currency } from '../context/AppContext';
import { Plane, Shield, Globe, User } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    view,
    setView,
    currency,
    setCurrency,
    setManageBookingModalOpen,
    setSupportModalOpen,
    userTrips,
    isAdminLoggedIn
  } = useApp();

  const currencies: Currency[] = ['PKR', 'USD', 'AED', 'SAR', 'GBP', 'EUR'];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        
        {/* Zone 1: Single text element wordmark with icon */}
        <button
          onClick={() => setView('search')}
          className="flex items-center gap-2.5 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 rounded-lg p-1"
        >
          <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center text-amber-400 group-hover:bg-slate-800 transition-colors shadow-sm">
            <Plane className="w-5 h-5 -rotate-45" />
          </div>
          <div className="leading-tight">
            <span className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-1">
              AH <span className="text-sky-600">Flight</span>
            </span>
            <span className="text-[10px] text-slate-500 font-medium block tracking-wide uppercase">
              Pakistan Authorized Agency
            </span>
          </div>
        </button>

        {/* Zone 2: 4-5 clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => setView('search')}
            className={`whitespace-nowrap transition-colors hover:text-slate-900 ${
              view === 'search' || view === 'results' ? 'text-sky-600 font-semibold' : ''
            }`}
          >
            Search Flights
          </button>
          
          <button
            onClick={() => setManageBookingModalOpen(true)}
            className="whitespace-nowrap transition-colors hover:text-slate-900"
          >
            Manage Booking
          </button>

          <button
            onClick={() => setView('my_trips')}
            className={`whitespace-nowrap transition-colors hover:text-slate-900 relative ${
              view === 'my_trips' ? 'text-sky-600 font-semibold' : ''
            }`}
          >
            My Trips
            {userTrips.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 text-[10px] bg-sky-100 text-sky-800 rounded font-semibold tabular-nums">
                {userTrips.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setSupportModalOpen(true)}
            className="whitespace-nowrap transition-colors hover:text-slate-900"
          >
            Support & DTS
          </button>
        </nav>

        {/* Zone 3: 1 primary action area */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Currency Selector */}
          <div className="relative inline-flex items-center">
            <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
            <select
              aria-label="Select Currency"
              value={currency}
              onChange={e => setCurrency(e.target.value as Currency)}
              className="pl-8 pr-2 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 border-0 rounded-md text-slate-800 cursor-pointer focus:ring-2 focus:ring-sky-600 transition-colors"
            >
              {currencies.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Admin / Agency Console Toggle */}
          <button
            onClick={() => setView(view === 'admin' ? 'search' : 'admin')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              view === 'admin'
                ? 'bg-amber-600 text-white hover:bg-amber-700 shadow-sm'
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-amber-300" />
            <span>{view === 'admin' ? 'Customer Portal' : 'Agency Desk'}</span>
          </button>
        </div>

      </div>
    </header>
  );
};
