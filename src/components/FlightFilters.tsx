import React from 'react';
import { useApp } from '../context/AppContext';
import { RotateCcw, Filter } from 'lucide-react';

export interface FilterState {
  maxPrice: number;
  stops: 'all' | 'direct' | '1stop' | '2plus';
  selectedAirlines: string[];
  depTimeWindow: 'all' | 'morning' | 'afternoon' | 'evening';
  refundableOnly: boolean;
}

interface FlightFiltersProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  availableAirlines: { code: string; name: string; count: number }[];
  highestPrice: number;
  lowestPrice: number;
  onReset: () => void;
}

export const FlightFilters: React.FC<FlightFiltersProps> = ({
  filters,
  setFilters,
  availableAirlines,
  highestPrice,
  lowestPrice,
  onReset
}) => {
  const { formatPrice } = useApp();

  const toggleAirline = (code: string) => {
    setFilters(prev => {
      const exists = prev.selectedAirlines.includes(code);
      if (exists) {
        return { ...prev, selectedAirlines: prev.selectedAirlines.filter(c => c !== code) };
      } else {
        return { ...prev, selectedAirlines: [...prev.selectedAirlines, code] };
      }
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-6 shadow-sm">
      
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-sky-600" />
          <h3 className="text-sm font-bold text-slate-900">Filter Itineraries</h3>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Max Price Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-700">Max Budget</span>
          <span className="text-slate-900 font-bold tabular-nums">
            {formatPrice(filters.maxPrice)}
          </span>
        </div>
        <input
          type="range"
          min={lowestPrice}
          max={highestPrice || 250000}
          step={1000}
          value={filters.maxPrice}
          onChange={e => setFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) }))}
          className="w-full accent-sky-600 cursor-pointer"
        />
        <div className="flex justify-between text-[11px] text-slate-400 font-mono">
          <span>{formatPrice(lowestPrice)}</span>
          <span>{formatPrice(highestPrice)}</span>
        </div>
      </div>

      {/* Stops */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Stops</h4>
        <div className="space-y-1.5 text-xs text-slate-700">
          {[
            { id: 'all', label: 'All Itineraries' },
            { id: 'direct', label: 'Direct flights only' },
            { id: '1stop', label: 'Up to 1 Stop' }
          ].map(opt => (
            <label key={opt.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="stopsFilter"
                checked={filters.stops === opt.id}
                onChange={() => setFilters(prev => ({ ...prev, stops: opt.id as any }))}
                className="w-3.5 h-3.5 text-sky-600 focus:ring-sky-500 border-slate-300"
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Airlines Multi-Select */}
      {availableAirlines.length > 0 && (
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Airlines</h4>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {availableAirlines.map(a => {
              const isChecked = filters.selectedAirlines.length === 0 || filters.selectedAirlines.includes(a.code);
              return (
                <label key={a.code} className="flex items-center justify-between text-xs text-slate-700 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleAirline(a.code)}
                      className="w-3.5 h-3.5 rounded text-sky-600 focus:ring-sky-500 border-slate-300"
                    />
                    <span className="truncate max-w-[140px]">{a.name}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 tabular-nums">({a.count})</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Departure Window */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Departure Time</h4>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { id: 'all', label: 'Anytime' },
            { id: 'morning', label: 'Morning (06-12)' },
            { id: 'afternoon', label: 'Afternoon (12-18)' },
            { id: 'evening', label: 'Evening (18-24)' }
          ].map(w => (
            <button
              key={w.id}
              type="button"
              onClick={() => setFilters(prev => ({ ...prev, depTimeWindow: w.id as any }))}
              className={`p-2 rounded-lg text-[11px] font-medium border text-center transition-colors ${
                filters.depTimeWindow === w.id
                  ? 'bg-sky-50 border-sky-300 text-sky-900 font-semibold'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {w.label}
            </button>
          ))}
        </div>
      </div>

      {/* Fare Rules */}
      <div className="space-y-2.5 pt-2 border-t border-slate-100">
        <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.refundableOnly}
            onChange={e => setFilters(prev => ({ ...prev, refundableOnly: e.target.checked }))}
            className="w-3.5 h-3.5 rounded text-sky-600 focus:ring-sky-500 border-slate-300"
          />
          <span className="font-medium">Refundable fares only</span>
        </label>
      </div>

    </div>
  );
};
