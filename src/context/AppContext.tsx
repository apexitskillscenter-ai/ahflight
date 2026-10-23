import React, { createContext, useContext, useState, useEffect } from 'react';
import { FlightOffer, FlightSearchParams } from '../types/flight';
import { BookingRecord, PassengerDetails } from '../types/booking';
import { fetchAgencyConfigAPI } from '../services/api';

export type Currency = 'PKR' | 'USD' | 'AED' | 'SAR' | 'GBP' | 'EUR';

export type AppView = 'search' | 'results' | 'passengers' | 'checkout' | 'confirmation' | 'my_trips' | 'admin';

interface Toast {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

interface AppContextType {
  view: AppView;
  setView: (view: AppView) => void;
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (pkrAmount: number) => string;
  searchParams: FlightSearchParams;
  setSearchParams: React.Dispatch<React.SetStateAction<FlightSearchParams>>;
  searchResults: FlightOffer[];
  setSearchResults: (results: FlightOffer[]) => void;
  searchMeta: { supplierId: string; isDemo: boolean; disclaimer: string } | null;
  setSearchMeta: (meta: { supplierId: string; isDemo: boolean; disclaimer: string } | null) => void;
  selectedOffer: FlightOffer | null;
  setSelectedOffer: (offer: FlightOffer | null) => void;
  activeBooking: BookingRecord | null;
  setActiveBooking: (booking: BookingRecord | null) => void;
  userTrips: BookingRecord[];
  addTripToStorage: (booking: BookingRecord) => void;
  savedTravelers: PassengerDetails[];
  saveTraveler: (p: PassengerDetails) => void;
  // Modals
  manageBookingModalOpen: boolean;
  setManageBookingModalOpen: (open: boolean) => void;
  supportModalOpen: boolean;
  setSupportModalOpen: (open: boolean) => void;
  legalModal: { open: boolean; tab: 'terms' | 'privacy' | 'dts' | 'refund' };
  openLegalModal: (tab: 'terms' | 'privacy' | 'dts' | 'refund') => void;
  closeLegalModal: () => void;
  // Admin
  isAdminLoggedIn: boolean;
  setIsAdminLoggedIn: (logged: boolean) => void;
  adminRole: 'super_admin' | 'finance' | 'ticketing';
  setAdminRole: (role: 'super_admin' | 'finance' | 'ticketing') => void;
  // Notifications
  toasts: Toast[];
  showToast: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
  agencyConfig: any;
}

const defaultSearchParams: FlightSearchParams = {
  tripType: 'one-way',
  origin: 'KHI',
  destination: 'ISB',
  departureDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
  adults: 1,
  children: 0,
  infants: 0,
  cabinClass: 'economy',
  directOnly: false
};

const exchangeRates: Record<Currency, number> = {
  PKR: 1,
  USD: 280,
  AED: 76.2,
  SAR: 74.6,
  GBP: 365,
  EUR: 305
};

const currencySymbols: Record<Currency, string> = {
  PKR: 'PKR',
  USD: '$',
  AED: 'AED',
  SAR: 'SAR',
  GBP: '£',
  EUR: '€'
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [view, setView] = useState<AppView>('search');
  const [currency, setCurrency] = useState<Currency>('PKR');
  const [searchParams, setSearchParams] = useState<FlightSearchParams>(defaultSearchParams);
  const [searchResults, setSearchResults] = useState<FlightOffer[]>([]);
  const [searchMeta, setSearchMeta] = useState<{ supplierId: string; isDemo: boolean; disclaimer: string } | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<FlightOffer | null>(null);
  const [activeBooking, setActiveBooking] = useState<BookingRecord | null>(null);
  const [userTrips, setUserTrips] = useState<BookingRecord[]>([]);
  const [savedTravelers, setSavedTravelers] = useState<PassengerDetails[]>([]);

  // Modals
  const [manageBookingModalOpen, setManageBookingModalOpen] = useState(false);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [legalModal, setLegalModal] = useState<{ open: boolean; tab: 'terms' | 'privacy' | 'dts' | 'refund' }>({
    open: false,
    tab: 'terms'
  });

  // Admin
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminRole, setAdminRole] = useState<'super_admin' | 'finance' | 'ticketing'>('super_admin');

  // Notifications
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [agencyConfig, setAgencyConfig] = useState<any>(null);

  // Load trips & travelers from localStorage
  useEffect(() => {
    try {
      const storedTrips = localStorage.getItem('ah_flight_trips');
      if (storedTrips) setUserTrips(JSON.parse(storedTrips));

      const storedTravelers = localStorage.getItem('ah_flight_saved_travelers');
      if (storedTravelers) setSavedTravelers(JSON.parse(storedTravelers));
    } catch (e) {
      console.warn('Storage parse error:', e);
    }

    fetchAgencyConfigAPI().then(setAgencyConfig).catch(console.warn);
  }, []);

  const addTripToStorage = (booking: BookingRecord) => {
    setUserTrips(prev => {
      const updated = [booking, ...prev.filter(b => b.pnr !== booking.pnr)];
      localStorage.setItem('ah_flight_trips', JSON.stringify(updated));
      return updated;
    });
  };

  const saveTraveler = (traveler: PassengerDetails) => {
    setSavedTravelers(prev => {
      const updated = [traveler, ...prev.filter(t => t.id !== traveler.id)];
      localStorage.setItem('ah_flight_saved_travelers', JSON.stringify(updated));
      return updated;
    });
  };

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => removeToast(id), 5000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const formatPrice = (pkrAmount: number): string => {
    if (currency === 'PKR') {
      return `PKR ${Math.round(pkrAmount).toLocaleString()}`;
    }
    const rate = exchangeRates[currency];
    const converted = pkrAmount / rate;
    const symbol = currencySymbols[currency];
    return `${symbol} ${Math.round(converted).toLocaleString()}`;
  };

  const openLegalModal = (tab: 'terms' | 'privacy' | 'dts' | 'refund') => {
    setLegalModal({ open: true, tab });
  };

  const closeLegalModal = () => {
    setLegalModal(prev => ({ ...prev, open: false }));
  };

  return (
    <AppContext.Provider
      value={{
        view,
        setView,
        currency,
        setCurrency,
        formatPrice,
        searchParams,
        setSearchParams,
        searchResults,
        setSearchResults,
        searchMeta,
        setSearchMeta,
        selectedOffer,
        setSelectedOffer,
        activeBooking,
        setActiveBooking,
        userTrips,
        addTripToStorage,
        savedTravelers,
        saveTraveler,
        manageBookingModalOpen,
        setManageBookingModalOpen,
        supportModalOpen,
        setSupportModalOpen,
        legalModal,
        openLegalModal,
        closeLegalModal,
        isAdminLoggedIn,
        setIsAdminLoggedIn,
        adminRole,
        setAdminRole,
        toasts,
        showToast,
        removeToast,
        agencyConfig
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
}
