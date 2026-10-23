import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SearchForm } from './components/SearchForm';
import { ResultsView } from './components/ResultsView';
import { PassengerForm } from './components/PassengerForm';
import { CheckoutPayment } from './components/CheckoutPayment';
import { BookingConfirmation } from './components/BookingConfirmation';
import { CustomerDashboard } from './components/CustomerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { ManageBookingModal } from './components/ManageBookingModal';
import { SupportModal } from './components/SupportModal';
import { LegalModal } from './components/LegalModal';
import { FlightOffer } from './types/flight';
import { PassengerDetails, BookingContact } from './types/booking';
import { searchFlightsAPI } from './services/api';
import {
  ShieldCheck,
  Plane,
  Clock,
  CreditCard,
  Headphones,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Sparkles,
  X,
  AlertCircle
} from 'lucide-react';

const MainAppContent: React.FC = () => {
  const {
    view,
    setView,
    selectedOffer,
    setSelectedOffer,
    setSearchParams,
    setSearchResults,
    setSearchMeta,
    toasts,
    removeToast,
    showToast,
    formatPrice
  } = useApp();

  const [bookingPassengers, setBookingPassengers] = useState<PassengerDetails[]>([]);
  const [bookingContact, setBookingContact] = useState<BookingContact>({
    fullName: '',
    email: '',
    phoneCountryCode: '+92',
    phoneNumber: '',
    city: 'Karachi'
  });

  const handleSelectOffer = (offer: FlightOffer) => {
    setSelectedOffer(offer);
    setView('passengers');
  };

  const handlePassengerProceed = (passengers: PassengerDetails[], contact: BookingContact) => {
    setBookingPassengers(passengers);
    setBookingContact(contact);
    setView('checkout');
  };

  const quickSearchDestination = async (origin: string, destination: string) => {
    const depDate = new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0];
    const params = {
      tripType: 'one-way' as const,
      origin,
      destination,
      departureDate: depDate,
      adults: 1,
      children: 0,
      infants: 0,
      cabinClass: 'economy' as const,
      directOnly: false
    };
    setSearchParams(params);
    showToast(`Searching flights for ${origin} → ${destination}...`, 'info');

    try {
      const data = await searchFlightsAPI(params);
      setSearchResults(data.offers || []);
      setSearchMeta({
        supplierId: data.supplierId,
        isDemo: data.isDemo,
        disclaimer: data.disclaimer
      });
      setView('results');
    } catch (e: any) {
      showToast(e.message || 'Search failed', 'error');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Toast Notification Stack */}
      <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`pointer-events-auto p-3.5 rounded-xl border shadow-xl flex items-start gap-2.5 text-xs text-slate-900 animate-in fade-in slide-in-from-top-2 duration-150 ${
              t.type === 'success' ? 'bg-emerald-50 border-emerald-300 text-emerald-950' :
              t.type === 'error' ? 'bg-rose-50 border-rose-300 text-rose-950' :
              t.type === 'warning' ? 'bg-amber-50 border-amber-300 text-amber-950' :
              'bg-sky-50 border-sky-300 text-sky-950'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {t.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              {t.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600" />}
              {t.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-600" />}
              {t.type === 'info' && <ShieldCheck className="w-4 h-4 text-sky-600" />}
            </div>
            <div className="flex-1 font-medium leading-relaxed">{t.message}</div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-slate-700 p-0.5 shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Top Bar Navigation */}
      <Header />

      {/* Main View Router */}
      <main className="flex-1">
        {view === 'search' && (
          <div>
            {/* Hero Section */}
            <section className="relative bg-slate-950 text-white overflow-hidden py-14 sm:py-20 border-b border-slate-800">
              
              {/* Atmospheric Gradient Background with subtle airline paths */}
              <div className="absolute inset-0 bg-radial-[at_top_right] from-sky-900/40 via-slate-950 to-slate-950 pointer-events-none"></div>
              
              {/* Stylized Air Vector Overlay */}
              <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>

              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">
                
                {/* Hero Header Lockup */}
                <div className="text-center max-w-3xl mx-auto space-y-3.5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-amber-300 font-semibold shadow-xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>DTS Licensed Agency DTS-PK-KHI-4892 · Transparent Fees</span>
                  </div>

                  <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight sm:leading-none text-white text-balance">
                    Authorized Airline Booking & Transparent Fares
                  </h1>

                  <p className="text-sm sm:text-base text-slate-300 font-normal max-w-2xl mx-auto leading-relaxed text-balance">
                    Search and book confirmed flights from Pakistan across major international and domestic carriers with disclosed agency fees, instant PNRs, and secure local payments.
                  </p>
                </div>

                {/* Primary Flight Search Engine */}
                <div className="max-w-5xl mx-auto">
                  <SearchForm />
                </div>

              </div>
            </section>

            {/* Trust Markers Bar */}
            <section className="bg-white border-b border-slate-200 py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-xs text-slate-700">
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">Government DTS Licensed</div>
                      <div className="text-slate-500 text-[11px]">Travel Agency License 4892</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">Disclosed Agency Fees</div>
                      <div className="text-slate-500 text-[11px]">Itemized transparent invoice</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">Pakistan Payment Gateways</div>
                      <div className="text-slate-500 text-[11px]">JazzCash, EasyPaisa, PayFast, Raast</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                      <Headphones className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">24/7 Ticketing Desk</div>
                      <div className="text-slate-500 text-[11px] font-mono">+92 21 3452 8900</div>
                    </div>
                  </div>

                </div>
              </div>
            </section>

            {/* Popular Route Cards for Pakistan Travelers */}
            <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">Top Routes from Pakistan</span>
                  <h2 className="text-2xl font-extrabold text-slate-900 mt-1">Featured Flight Connections</h2>
                </div>
                <p className="text-xs text-slate-500 max-w-md">
                  Live indicative airfares based on verified airline schedules and consolidated supplier availability.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Route 1: Karachi to Islamabad */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-xs font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded">
                      Pakistan Domestic
                    </span>
                    <span className="text-xs text-slate-500">2h Direct Flight</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-bold text-slate-900">Karachi (KHI)</div>
                      <div className="text-xs text-slate-500">Jinnah International</div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400" />
                    <div className="text-right">
                      <div className="text-lg font-bold text-slate-900">Islamabad (ISB)</div>
                      <div className="text-xs text-slate-500">Islamabad Intl</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <div>
                      <div className="text-slate-500">Starting from</div>
                      <div className="text-base font-extrabold text-slate-900 tabular-nums">
                        {formatPrice(23500)}
                      </div>
                    </div>
                    <button
                      onClick={() => quickSearchDestination('KHI', 'ISB')}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors"
                    >
                      Book Flight
                    </button>
                  </div>
                </div>

                {/* Route 2: Lahore to Dubai */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-xs font-bold bg-sky-50 text-sky-800 px-2 py-0.5 rounded">
                      Middle East / UAE
                    </span>
                    <span className="text-xs text-slate-500">Emirates · Airblue · PIA</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-bold text-slate-900">Lahore (LHE)</div>
                      <div className="text-xs text-slate-500">Allama Iqbal Intl</div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400" />
                    <div className="text-right">
                      <div className="text-lg font-bold text-slate-900">Dubai (DXB)</div>
                      <div className="text-xs text-slate-500">Dubai International</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <div>
                      <div className="text-slate-500">Starting from</div>
                      <div className="text-base font-extrabold text-slate-900 tabular-nums">
                        {formatPrice(78000)}
                      </div>
                    </div>
                    <button
                      onClick={() => quickSearchDestination('LHE', 'DXB')}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors"
                    >
                      Book Flight
                    </button>
                  </div>
                </div>

                {/* Route 3: Karachi to Jeddah (Umrah) */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-xs font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded">
                      Saudi Arabia / Umrah
                    </span>
                    <span className="text-xs text-slate-500">Saudia · PIA Direct</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-bold text-slate-900">Karachi (KHI)</div>
                      <div className="text-xs text-slate-500">Jinnah International</div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400" />
                    <div className="text-right">
                      <div className="text-lg font-bold text-slate-900">Jeddah (JED)</div>
                      <div className="text-xs text-slate-500">King Abdulaziz Intl</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <div>
                      <div className="text-slate-500">Starting from</div>
                      <div className="text-base font-extrabold text-slate-900 tabular-nums">
                        {formatPrice(86000)}
                      </div>
                    </div>
                    <button
                      onClick={() => quickSearchDestination('KHI', 'JED')}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors"
                    >
                      Book Flight
                    </button>
                  </div>
                </div>

                {/* Route 4: Islamabad to London Heathrow */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-xs font-bold bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded">
                      United Kingdom / Europe
                    </span>
                    <span className="text-xs text-slate-500">British Airways · Qatar · Emirates</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-bold text-slate-900">Islamabad (ISB)</div>
                      <div className="text-xs text-slate-500">Islamabad Intl</div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400" />
                    <div className="text-right">
                      <div className="text-lg font-bold text-slate-900">London (LHR)</div>
                      <div className="text-xs text-slate-500">Heathrow Airport</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <div>
                      <div className="text-slate-500">Starting from</div>
                      <div className="text-base font-extrabold text-slate-900 tabular-nums">
                        {formatPrice(185000)}
                      </div>
                    </div>
                    <button
                      onClick={() => quickSearchDestination('ISB', 'LHR')}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors"
                    >
                      Book Flight
                    </button>
                  </div>
                </div>

                {/* Route 5: Islamabad to Skardu */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-xs font-bold bg-teal-50 text-teal-800 px-2 py-0.5 rounded">
                      Northern Pakistan Tourism
                    </span>
                    <span className="text-xs text-slate-500">Scenic Karakoram Flight</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-bold text-slate-900">Islamabad (ISB)</div>
                      <div className="text-xs text-slate-500">Islamabad Intl</div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400" />
                    <div className="text-right">
                      <div className="text-lg font-bold text-slate-900">Skardu (KDU)</div>
                      <div className="text-xs text-slate-500">Skardu Airport</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <div>
                      <div className="text-slate-500">Starting from</div>
                      <div className="text-base font-extrabold text-slate-900 tabular-nums">
                        {formatPrice(28000)}
                      </div>
                    </div>
                    <button
                      onClick={() => quickSearchDestination('ISB', 'KDU')}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors"
                    >
                      Book Flight
                    </button>
                  </div>
                </div>

                {/* Route 6: Lahore to Istanbul */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-xs font-bold bg-red-50 text-red-800 px-2 py-0.5 rounded">
                      Turkey / Eurasia Hub
                    </span>
                    <span className="text-xs text-slate-500">Turkish Airlines Direct</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-bold text-slate-900">Lahore (LHE)</div>
                      <div className="text-xs text-slate-500">Allama Iqbal Intl</div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400" />
                    <div className="text-right">
                      <div className="text-lg font-bold text-slate-900">Istanbul (IST)</div>
                      <div className="text-xs text-slate-500">Istanbul Airport</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <div>
                      <div className="text-slate-500">Starting from</div>
                      <div className="text-base font-extrabold text-slate-900 tabular-nums">
                        {formatPrice(124000)}
                      </div>
                    </div>
                    <button
                      onClick={() => quickSearchDestination('LHE', 'IST')}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors"
                    >
                      Book Flight
                    </button>
                  </div>
                </div>

              </div>
            </section>

            {/* Business Model & Consumer Transparency Section */}
            <section className="bg-slate-900 text-white py-16 border-t border-slate-800">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                <div className="max-w-2xl space-y-2">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Business Standard</span>
                  <h3 className="text-2xl font-extrabold tracking-tight">Built on Real Airline Transparency</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    AH Flight operates as an authorized travel booking business. We never claim a ticket has been issued until confirmed directly by the operating airline or GDS supplier.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                  <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                    <div className="font-bold text-white text-sm">Disclosed Service Margins</div>
                    <p className="text-slate-400 leading-relaxed">
                      Our revenues derive strictly from transparent service fees (PKR 1,500 domestic, PKR 4,500 international) and authorized supplier commissions. We never invent hidden markups.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                    <div className="font-bold text-white text-sm">Pre-Charge Fare Revalidation</div>
                    <p className="text-slate-400 leading-relaxed">
                      Before capturing customer payment, our backend re-validates real-time seat availability and fare rules with the carrier, eliminating post-payment cancellations.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                    <div className="font-bold text-white text-sm">Strict Data Protection</div>
                    <p className="text-slate-400 leading-relaxed">
                      Passport details and CNIC data are protected in transit with 256-bit TLS encryption, shared only with authorized airline departure control systems.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {view === 'results' && (
          <ResultsView
            onSelectOffer={handleSelectOffer}
            onBackToSearch={() => setView('search')}
          />
        )}

        {view === 'passengers' && (
          <PassengerForm
            onBack={() => setView('results')}
            onProceed={handlePassengerProceed}
          />
        )}

        {view === 'checkout' && (
          <CheckoutPayment
            passengers={bookingPassengers}
            contact={bookingContact}
            onBack={() => setView('passengers')}
          />
        )}

        {view === 'confirmation' && (
          <BookingConfirmation />
        )}

        {view === 'my_trips' && (
          <CustomerDashboard />
        )}

        {view === 'admin' && (
          <AdminDashboard />
        )}
      </main>

      {/* Global Modals */}
      <ManageBookingModal />
      <SupportModal />
      <LegalModal />

      {/* Footer */}
      <Footer />

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
