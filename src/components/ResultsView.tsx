import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { FlightOffer } from '../types/flight';
import { FlightCard } from './FlightCard';
import { FlightFilters, FilterState } from './FlightFilters';
import { FlightDetailsModal } from './FlightDetailsModal';
import { ArrowLeft, ArrowUpDown, SlidersHorizontal, AlertCircle, Info, Sparkles, Clock, DollarSign, Award } from 'lucide-react';

interface ResultsViewProps {
  onSelectOffer: (offer: FlightOffer) => void;
  onBackToSearch: () => void;
}

type SortOption = 'cheapest' | 'fastest' | 'best_value';

export const ResultsView: React.FC<ResultsViewProps> = ({ onSelectOffer, onBackToSearch }) => {
  const { searchResults, searchMeta, searchParams, formatPrice } = useApp();
  const [detailModalOffer, setDetailModalOffer] = useState<FlightOffer | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('cheapest');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Derive min/max prices
  const prices = searchResults.map(o => o.pricing.totalAmount);
  const lowestPrice = prices.length ? Math.min(...prices) : 10000;
  const highestPrice = prices.length ? Math.max(...prices) : 250000;

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    maxPrice: highestPrice || 250000,
    stops: 'all',
    selectedAirlines: [],
    depTimeWindow: 'all',
    refundableOnly: false
  });

  // Calculate available airlines
  const availableAirlines = useMemo(() => {
    const map = new Map<string, { code: string; name: string; count: number }>();
    searchResults.forEach(o => {
      const seg = o.outboundSegments[0];
      if (seg) {
        const cur = map.get(seg.airlineCode) || { code: seg.airlineCode, name: seg.airlineName, count: 0 };
        cur.count++;
        map.set(seg.airlineCode, cur);
      }
    });
    return Array.from(map.values());
  }, [searchResults]);

  const resetFilters = () => {
    setFilters({
      maxPrice: highestPrice || 250000,
      stops: 'all',
      selectedAirlines: [],
      depTimeWindow: 'all',
      refundableOnly: false
    });
  };

  // Filter and sort offers
  const filteredAndSortedOffers = useMemo(() => {
    let result = searchResults.filter(offer => {
      // Price filter
      if (offer.pricing.totalAmount > filters.maxPrice) return false;

      // Stops filter
      if (filters.stops === 'direct' && offer.stopsOutbound > 0) return false;
      if (filters.stops === '1stop' && offer.stopsOutbound > 1) return false;

      // Airlines filter
      if (filters.selectedAirlines.length > 0) {
        const airlineCode = offer.outboundSegments[0]?.airlineCode;
        if (!filters.selectedAirlines.includes(airlineCode)) return false;
      }

      // Departure Window filter
      if (filters.depTimeWindow !== 'all') {
        const depHour = new Date(offer.outboundSegments[0].departureTime).getHours();
        if (filters.depTimeWindow === 'morning' && (depHour < 6 || depHour >= 12)) return false;
        if (filters.depTimeWindow === 'afternoon' && (depHour < 12 || depHour >= 18)) return false;
        if (filters.depTimeWindow === 'evening' && (depHour < 18 || depHour >= 24)) return false;
      }

      // Refundable filter
      if (filters.refundableOnly && !offer.fareConditions.refundable) return false;

      return true;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortOption === 'cheapest') {
        return a.pricing.totalAmount - b.pricing.totalAmount;
      }
      if (sortOption === 'fastest') {
        return a.totalOutboundDurationMinutes - b.totalOutboundDurationMinutes;
      }
      if (sortOption === 'best_value') {
        // Value score: duration factor + price factor
        const scoreA = a.pricing.totalAmount + a.totalOutboundDurationMinutes * 120 + a.stopsOutbound * 5000;
        const scoreB = b.pricing.totalAmount + b.totalOutboundDurationMinutes * 120 + b.stopsOutbound * 5000;
        return scoreA - scoreB;
      }
      return 0;
    });

    return result;
  }, [searchResults, filters, sortOption]);

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Route & Search Summary Strip */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToSearch}
            className="p-2 border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors"
            title="Modify Search"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                {searchParams.origin} → {searchParams.destination}
              </h2>
              <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold capitalize">
                {searchParams.tripType.replace('-', ' ')}
              </span>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span>{new Date(searchParams.departureDate).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</span>
              <span aria-hidden="true">·</span>
              <span>{searchParams.adults + searchParams.children + searchParams.infants} Traveler(s)</span>
              <span aria-hidden="true">·</span>
              <span className="capitalize">{searchParams.cabinClass.replace('_', ' ')}</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-800 font-bold tabular-nums">{filteredAndSortedOffers.length} available</span>
            </div>
          </div>
        </div>

        {/* Change Search Button */}
        <button
          type="button"
          onClick={onBackToSearch}
          className="px-4 py-2 text-xs font-semibold text-sky-700 hover:text-sky-800 bg-sky-50 hover:bg-sky-100 rounded-xl transition-colors"
        >
          Modify Search
        </button>
      </div>

      {/* Supplier & Sandbox Transparency Banner */}
      {searchMeta && (
        <div className={`p-4 rounded-2xl text-xs flex items-start gap-3 border ${
          searchMeta.isDemo
            ? 'bg-amber-50/90 border-amber-200 text-amber-900'
            : 'bg-emerald-50/90 border-emerald-200 text-emerald-900'
        }`}>
          <Info className={`w-4 h-4 shrink-0 mt-0.5 ${searchMeta.isDemo ? 'text-amber-600' : 'text-emerald-600'}`} />
          <div className="leading-relaxed">
            <strong className="font-bold">
              {searchMeta.isDemo ? 'Sandbox / Test Inventory Disclosure: ' : 'Live GDS Supplier Feed: '}
            </strong>
            <span>{searchMeta.disclaimer}</span>
          </div>
        </div>
      )}

      {/* Main Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Filters Column (Desktop) */}
        <div className="hidden lg:block lg:col-span-3">
          <FlightFilters
            filters={filters}
            setFilters={setFilters}
            availableAirlines={availableAirlines}
            highestPrice={highestPrice}
            lowestPrice={lowestPrice}
            onReset={resetFilters}
          />
        </div>

        {/* Right Offers List Column */}
        <div className="lg:col-span-9 space-y-4">
          
          {/* Sorting and Mobile Filter Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
            
            {/* Mobile Filter Button */}
            <button
              type="button"
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden px-3 py-1.5 bg-slate-100 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>

            {/* Sorting Segmented Buttons */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setSortOption('cheapest')}
                className={`px-3 py-1.5 font-semibold rounded-md transition-all flex items-center gap-1 ${
                  sortOption === 'cheapest'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span>Cheapest</span>
              </button>

              <button
                type="button"
                onClick={() => setSortOption('fastest')}
                className={`px-3 py-1.5 font-semibold rounded-md transition-all flex items-center gap-1 ${
                  sortOption === 'fastest'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-sky-600" />
                <span>Fastest</span>
              </button>

              <button
                type="button"
                onClick={() => setSortOption('best_value')}
                className={`px-3 py-1.5 font-semibold rounded-md transition-all flex items-center gap-1 ${
                  sortOption === 'best_value'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span>Best Value</span>
              </button>
            </div>

            <div className="text-xs text-slate-500 tabular-nums">
              Showing <span className="font-bold text-slate-800">{filteredAndSortedOffers.length}</span> of {searchResults.length} flights
            </div>

          </div>

          {/* Mobile Filter Drawer / Box */}
          {mobileFilterOpen && (
            <div className="lg:hidden mb-4">
              <FlightFilters
                filters={filters}
                setFilters={setFilters}
                availableAirlines={availableAirlines}
                highestPrice={highestPrice}
                lowestPrice={lowestPrice}
                onReset={resetFilters}
              />
            </div>
          )}

          {/* Empty State if filter yields zero */}
          {filteredAndSortedOffers.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="font-bold text-slate-900 text-sm">No flights match your filters</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try widening your budget, enabling 1-stop connecting flights, or selecting all airlines.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            /* Offers List */
            <div className="space-y-4">
              {filteredAndSortedOffers.map(offer => (
                <FlightCard
                  key={offer.id}
                  offer={offer}
                  onSelect={onSelectOffer}
                  onViewDetails={setDetailModalOffer}
                />
              ))}
            </div>
          )}

        </div>

      </div>

      {/* Flight Details Modal */}
      <FlightDetailsModal
        offer={detailModalOffer}
        onClose={() => setDetailModalOffer(null)}
        onSelect={offer => {
          setDetailModalOffer(null);
          onSelectOffer(offer);
        }}
      />

    </div>
  );
};
