import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { searchAirports, findAirport, AIRPORTS } from '../data/airports';
import { TripType, CabinClass } from '../types/flight';
import { searchFlightsAPI } from '../services/api';
import { PlaneTakeoff, PlaneLanding, Calendar, Users, ArrowRightLeft, Search, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';

export const SearchForm: React.FC = () => {
  const { searchParams, setSearchParams, setSearchResults, setSearchMeta, setView, showToast } = useApp();
  const [loading, setLoading] = useState(false);
  const [passengerDropdownOpen, setPassengerDropdownOpen] = useState(false);
  const [originSearch, setOriginSearch] = useState('');
  const [destSearch, setDestSearch] = useState('');
  const [originDropdownOpen, setOriginDropdownOpen] = useState(false);
  const [destDropdownOpen, setDestDropdownOpen] = useState(false);

  const originAirport = findAirport(searchParams.origin);
  const destAirport = findAirport(searchParams.destination);

  const filteredOrigins = searchAirports(originSearch);
  const filteredDests = searchAirports(destSearch);

  const swapAirports = () => {
    setSearchParams(prev => ({
      ...prev,
      origin: prev.destination,
      destination: prev.origin
    }));
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchParams.origin === searchParams.destination) {
      showToast('Origin and destination cannot be the same airport.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const data = await searchFlightsAPI(searchParams);
      setSearchResults(data.offers || []);
      setSearchMeta({
        supplierId: data.supplierId,
        isDemo: data.isDemo,
        disclaimer: data.disclaimer
      });
      setView('results');
    } catch (err: any) {
      showToast(err.message || 'Flight search failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const selectPopularRoute = (origin: string, dest: string, trip: TripType = 'one-way') => {
    setSearchParams(prev => ({
      ...prev,
      origin,
      destination: dest,
      tripType: trip
    }));
  };

  const totalPassengers = searchParams.adults + searchParams.children + searchParams.infants;

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-5 sm:p-7 transition-all">
      {/* Trip Type and Cabin Class Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-100">
        
        {/* Trip Type Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          {(['one-way', 'round-trip', 'multi-city'] as TripType[]).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setSearchParams(prev => ({ ...prev, tripType: t }))}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap capitalize ${
                searchParams.tripType === t
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Cabin Class Selector */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-500 whitespace-nowrap">Class:</label>
          <select
            value={searchParams.cabinClass}
            onChange={e => setSearchParams(prev => ({ ...prev, cabinClass: e.target.value as CabinClass }))}
            className="text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border-0 rounded-md px-3 py-1.5 cursor-pointer focus:ring-2 focus:ring-sky-600"
          >
            <option value="economy">Economy</option>
            <option value="premium_economy">Premium Economy</option>
            <option value="business">Business Class</option>
            <option value="first">First Class</option>
          </select>
        </div>
      </div>

      {/* Main Search Form Inputs */}
      <form onSubmit={handleSearch} className="mt-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          
          {/* Origin Airport */}
          <div className="relative md:col-span-3">
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Departure From
            </label>
            <div
              onClick={() => {
                setOriginDropdownOpen(true);
                setDestDropdownOpen(false);
              }}
              className="flex items-center gap-2 p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer transition-colors"
            >
              <PlaneTakeoff className="w-5 h-5 text-sky-600 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900 text-base">{searchParams.origin}</span>
                  <span className="text-xs text-slate-600 truncate">{originAirport?.city}</span>
                </div>
                <div className="text-[11px] text-slate-600 truncate">{originAirport?.name}</div>
              </div>
            </div>

            {/* Origin Dropdown */}
            {originDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-72 sm:w-80 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 p-2 max-h-72 overflow-y-auto">
                <input
                  type="text"
                  placeholder="Type city or airport code (e.g. KHI)..."
                  value={originSearch}
                  onChange={e => setOriginSearch(e.target.value)}
                  autoFocus
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-sky-600"
                />
                <div className="text-[10px] font-semibold text-slate-600 uppercase px-2 py-1">
                  Pakistan & International Hubs
                </div>
                {filteredOrigins.map(a => (
                  <button
                    key={a.code}
                    type="button"
                    onClick={() => {
                      setSearchParams(prev => ({ ...prev, origin: a.code }));
                      setOriginDropdownOpen(false);
                      setOriginSearch('');
                    }}
                    className="w-full text-left p-2 rounded-lg hover:bg-slate-100 flex items-center justify-between text-xs transition-colors"
                  >
                    <div>
                      <span className="font-bold text-slate-900 mr-2">{a.code}</span>
                      <span className="text-slate-700">{a.city}</span>
                      <div className="text-[11px] text-slate-600 truncate">{a.name}</div>
                    </div>
                    {a.isDomesticPakistan && (
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-1.5 py-0.5 rounded">
                        Pakistan
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Swap Button */}
          <div className="md:col-span-1 flex justify-center py-1 md:py-0">
            <button
              type="button"
              onClick={swapAirports}
              aria-label="Swap origin and destination"
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-transform hover:rotate-180 focus:outline-none focus:ring-2 focus:ring-sky-600"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Destination Airport */}
          <div className="relative md:col-span-3">
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Destination To
            </label>
            <div
              onClick={() => {
                setDestDropdownOpen(true);
                setOriginDropdownOpen(false);
              }}
              className="flex items-center gap-2 p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer transition-colors"
            >
              <PlaneLanding className="w-5 h-5 text-amber-500 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900 text-base">{searchParams.destination}</span>
                  <span className="text-xs text-slate-600 truncate">{destAirport?.city}</span>
                </div>
                <div className="text-[11px] text-slate-600 truncate">{destAirport?.name}</div>
              </div>
            </div>

            {/* Destination Dropdown */}
            {destDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-72 sm:w-80 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 p-2 max-h-72 overflow-y-auto">
                <input
                  type="text"
                  placeholder="Search city or airport code..."
                  value={destSearch}
                  onChange={e => setDestSearch(e.target.value)}
                  autoFocus
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-sky-600"
                />
                <div className="text-[10px] font-semibold text-slate-600 uppercase px-2 py-1">
                  Popular Destinations
                </div>
                {filteredDests.map(a => (
                  <button
                    key={a.code}
                    type="button"
                    onClick={() => {
                      setSearchParams(prev => ({ ...prev, destination: a.code }));
                      setDestDropdownOpen(false);
                      setDestSearch('');
                    }}
                    className="w-full text-left p-2 rounded-lg hover:bg-slate-100 flex items-center justify-between text-xs transition-colors"
                  >
                    <div>
                      <span className="font-bold text-slate-900 mr-2">{a.code}</span>
                      <span className="text-slate-700">{a.city}</span>
                      <div className="text-[11px] text-slate-600 truncate">{a.name}</div>
                    </div>
                    {a.isDomesticPakistan && (
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-1.5 py-0.5 rounded">
                        Pakistan
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dates Section */}
          <div className="md:col-span-3 grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Departure
              </label>
              <div className="flex items-center gap-1.5 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={searchParams.departureDate}
                  onChange={e => setSearchParams(prev => ({ ...prev, departureDate: e.target.value }))}
                  className="w-full bg-transparent text-xs font-semibold text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            {searchParams.tripType === 'round-trip' ? (
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Return
                </label>
                <div className="flex items-center gap-1.5 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="date"
                    min={searchParams.departureDate}
                    value={searchParams.returnDate || ''}
                    onChange={e => setSearchParams(prev => ({ ...prev, returnDate: e.target.value }))}
                    className="w-full bg-transparent text-xs font-semibold text-slate-800 focus:outline-none"
                  />
                </div>
              </div>
            ) : (
              <div className="opacity-50">
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Return
                </label>
                <button
                  type="button"
                  onClick={() => setSearchParams(prev => ({ ...prev, tripType: 'round-trip', returnDate: prev.departureDate }))}
                  className="w-full p-3 text-left text-xs text-slate-600 bg-slate-100 border border-dashed border-slate-300 rounded-xl hover:bg-slate-200 transition-colors"
                >
                  + Add Return
                </button>
              </div>
            )}
          </div>

          {/* Passengers Selector */}
          <div className="relative md:col-span-2">
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Travelers
            </label>
            <button
              type="button"
              onClick={() => setPassengerDropdownOpen(!passengerDropdownOpen)}
              className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-colors"
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-bold text-slate-900">
                  {totalPassengers} Traveler{totalPassengers > 1 ? 's' : ''}
                </span>
              </div>
            </button>

            {/* Passenger Dropdown Steppers */}
            {passengerDropdownOpen && (
              <div className="absolute top-full right-0 mt-1 w-64 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Adults</div>
                    <div className="text-[11px] text-slate-600">Age 12+</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={searchParams.adults <= 1}
                      onClick={() => setSearchParams(p => ({ ...p, adults: Math.max(1, p.adults - 1) }))}
                      className="w-7 h-7 rounded-lg border border-slate-200 text-slate-700 disabled:opacity-40 hover:bg-slate-100 font-bold"
                    >
                      -
                    </button>
                    <span className="w-5 text-center text-xs font-bold tabular-nums">{searchParams.adults}</span>
                    <button
                      type="button"
                      disabled={searchParams.adults >= 9}
                      onClick={() => setSearchParams(p => ({ ...p, adults: p.adults + 1 }))}
                      className="w-7 h-7 rounded-lg border border-slate-200 text-slate-700 disabled:opacity-40 hover:bg-slate-100 font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Children</div>
                    <div className="text-[11px] text-slate-600">Age 2-11</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={searchParams.children <= 0}
                      onClick={() => setSearchParams(p => ({ ...p, children: Math.max(0, p.children - 1) }))}
                      className="w-7 h-7 rounded-lg border border-slate-200 text-slate-700 disabled:opacity-40 hover:bg-slate-100 font-bold"
                    >
                      -
                    </button>
                    <span className="w-5 text-center text-xs font-bold tabular-nums">{searchParams.children}</span>
                    <button
                      type="button"
                      disabled={searchParams.children >= 6}
                      onClick={() => setSearchParams(p => ({ ...p, children: p.children + 1 }))}
                      className="w-7 h-7 rounded-lg border border-slate-200 text-slate-700 disabled:opacity-40 hover:bg-slate-100 font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Infants</div>
                    <div className="text-[11px] text-slate-600">Under 2 (on lap)</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={searchParams.infants <= 0}
                      onClick={() => setSearchParams(p => ({ ...p, infants: Math.max(0, p.infants - 1) }))}
                      className="w-7 h-7 rounded-lg border border-slate-200 text-slate-700 disabled:opacity-40 hover:bg-slate-100 font-bold"
                    >
                      -
                    </button>
                    <span className="w-5 text-center text-xs font-bold tabular-nums">{searchParams.infants}</span>
                    <button
                      type="button"
                      disabled={searchParams.infants >= searchParams.adults}
                      onClick={() => setSearchParams(p => ({ ...p, infants: p.infants + 1 }))}
                      className="w-7 h-7 rounded-lg border border-slate-200 text-slate-700 disabled:opacity-40 hover:bg-slate-100 font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setPassengerDropdownOpen(false)}
                  className="w-full py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
                >
                  Apply
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Bottom Actions Row: Filters and Search CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={searchParams.directOnly}
                onChange={e => setSearchParams(prev => ({ ...prev, directOnly: e.target.checked }))}
                className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300"
              />
              <span>Direct flights only</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Searching Live GDS Feeds...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Find Flights</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Quick Route Shortcuts for Pakistan Travelers */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs text-slate-600">
        <span className="font-semibold text-slate-700">Trending Routes:</span>
        <button
          type="button"
          onClick={() => selectPopularRoute('KHI', 'ISB')}
          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-md text-slate-700 transition-colors font-medium"
        >
          Karachi → Islamabad
        </button>
        <button
          type="button"
          onClick={() => selectPopularRoute('LHE', 'DXB')}
          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-md text-slate-700 transition-colors font-medium"
        >
          Lahore → Dubai
        </button>
        <button
          type="button"
          onClick={() => selectPopularRoute('ISB', 'LHR')}
          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-md text-slate-700 transition-colors font-medium"
        >
          Islamabad → London
        </button>
        <button
          type="button"
          onClick={() => selectPopularRoute('KHI', 'JED')}
          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-md text-slate-700 transition-colors font-medium"
        >
          Karachi → Jeddah (Umrah)
        </button>
        <button
          type="button"
          onClick={() => selectPopularRoute('ISB', 'KDU')}
          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-md text-slate-700 transition-colors font-medium"
        >
          Islamabad → Skardu
        </button>
      </div>
    </div>
  );
};
