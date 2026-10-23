import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  fetchAdminMetricsAPI,
  fetchAdminBookingsAPI,
  updateBookingStatusAPI
} from '../services/api';
import { BookingRecord } from '../types/booking';
import { ServiceFeeRule, PromoCode, AuditLogEntry, AdminMetrics } from '../../server/types';
import {
  Shield,
  DollarSign,
  TrendingUp,
  Search,
  Users,
  Settings,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  Lock,
  RefreshCw,
  Sliders,
  Tag,
  History,
  Download,
  Printer
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    isAdminLoggedIn,
    setIsAdminLoggedIn,
    adminRole,
    setAdminRole,
    formatPrice,
    showToast,
    setActiveBooking,
    setView
  } = useApp();

  const [pinInput, setPinInput] = useState('');
  const [selectedRole, setSelectedRole] = useState<'super_admin' | 'finance' | 'ticketing'>('super_admin');
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'fees' | 'promos' | 'audit'>('overview');

  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [feeRules, setFeeRules] = useState<ServiceFeeRule[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Fee Rules edit state
  const [domesticFee, setDomesticFee] = useState('1500');
  const [intlFee, setIntlFee] = useState('4500');

  // New promo state
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoDiscount, setNewPromoDiscount] = useState('2500');
  const [newPromoType, setNewPromoType] = useState<'fixed' | 'percentage'>('fixed');

  const loadData = async () => {
    setLoading(true);
    try {
      const [m, b, f, p, l] = await Promise.all([
        fetchAdminMetricsAPI(),
        fetchAdminBookingsAPI(),
        fetch('/api/admin/fee-rules').then(r => r.json()),
        fetch('/api/admin/promo-codes').then(r => r.json()),
        fetch('/api/admin/audit-logs').then(r => r.json())
      ]);

      setMetrics(m);
      if (b.success) setBookings(b.bookings);
      if (f.rules) {
        setFeeRules(f.rules);
        const dom = f.rules.find((r: any) => r.appliesTo === 'domestic');
        const intl = f.rules.find((r: any) => r.appliesTo === 'international');
        if (dom) setDomesticFee(dom.amount.toString());
        if (intl) setIntlFee(intl.amount.toString());
      }
      if (p.promoCodes) setPromoCodes(p.promoCodes);
      if (l.logs) setAuditLogs(l.logs);
    } catch (e: any) {
      showToast(e.message || 'Failed to load admin data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdminLoggedIn) {
      loadData();
    }
  }, [isAdminLoggedIn]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default PIN: 1234 or 9999 for agency staff demonstration
    if (pinInput === '1234' || pinInput === '9999' || pinInput.length >= 4) {
      setIsAdminLoggedIn(true);
      setAdminRole(selectedRole);
      showToast(`Logged in as ${selectedRole.replace('_', ' ').toUpperCase()}`, 'success');
    } else {
      showToast('Invalid PIN. Use 1234 for demo login.', 'warning');
    }
  };

  const handleUpdateStatus = async (pnr: string, newStatus: string) => {
    try {
      const res = await updateBookingStatusAPI(pnr, newStatus, `Updated by ${adminRole}`);
      if (res.success) {
        showToast(`PNR ${pnr} status updated to ${newStatus}`, 'success');
        loadData();
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  const handleSaveFeeRules = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = [
      {
        id: 'rule-domestic-fixed',
        name: 'Pakistan Domestic Flights Service Fee',
        type: 'fixed' as const,
        amount: Number(domesticFee) || 1500,
        appliesTo: 'domestic' as const,
        isActive: true,
        updatedAt: new Date().toISOString()
      },
      {
        id: 'rule-intl-fixed',
        name: 'International Flights Service Fee',
        type: 'fixed' as const,
        amount: Number(intlFee) || 4500,
        appliesTo: 'international' as const,
        isActive: true,
        updatedAt: new Date().toISOString()
      }
    ];

    try {
      const res = await fetch('/api/admin/fee-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rules: updated })
      }).then(r => r.json());

      if (res.success) {
        showToast('Service fee rules updated successfully.', 'success');
        setFeeRules(res.rules);
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  const handleAddPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromoCode) return;
    try {
      const res = await fetch('/api/admin/promo-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newPromoCode,
          discountType: newPromoType,
          discountValue: Number(newPromoDiscount),
          minBookingValuePKR: 15000,
          maxDiscountPKR: 5000
        })
      }).then(r => r.json());

      if (res.success) {
        showToast(`Promo ${newPromoCode.toUpperCase()} activated.`, 'success');
        setPromoCodes(prev => [res.promo, ...prev]);
        setNewPromoCode('');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.pnr.toLowerCase().includes(q) ||
      b.contact.email.toLowerCase().includes(q) ||
      b.passengers.some(p => p.firstName.toLowerCase().includes(q) || p.lastName.toLowerCase().includes(q))
    );
  });

  // If not logged in, render PIN authorization gate
  if (!isAdminLoggedIn) {
    return (
      <div className="max-w-md mx-auto py-16 px-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center mx-auto">
              <Shield className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-extrabold text-slate-900">AH Flight Agency Staff Portal</h2>
            <p className="text-xs text-slate-500">
              Role-based management console for ticketing agents, finance officers, and agency supervisors.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Access Role</label>
              <select
                value={selectedRole}
                onChange={e => setSelectedRole(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600 font-medium"
              >
                <option value="super_admin">Super Administrator (Full Controls)</option>
                <option value="finance">Finance Staff (Revenue & Fee Rules)</option>
                <option value="ticketing">Ticketing Staff (Bookings & Manifest)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Security PIN Code</label>
              <input
                type="password"
                placeholder="Enter 4-digit PIN (demo: 1234)"
                value={pinInput}
                onChange={e => setPinInput(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600 font-mono text-center tracking-widest text-lg"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4 text-amber-400" />
              <span>Authenticate Staff Session</span>
            </button>
          </form>

          <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 text-center">
            Demo credentials: Any 4-digit PIN (e.g. <strong>1234</strong>) will authenticate for verification.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-extrabold text-slate-900">AH Flight Agency Console</span>
            <span className="text-[11px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded uppercase">
              {adminRole.replace('_', ' ')}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            DTS Licensed Ticketing Desk · Real-time GDS Bookings & Revenue Reconciliation
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setIsAdminLoggedIn(false)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-semibold overflow-x-auto pb-1">
        {[
          { id: 'overview', label: 'Financials & KPI', icon: TrendingUp },
          { id: 'bookings', label: `Manage Bookings (${bookings.length})`, icon: Users },
          { id: 'fees', label: 'Service Fee Rules', icon: Sliders },
          { id: 'promos', label: 'Promo Vouchers', icon: Tag },
          { id: 'audit', label: 'Audit Trail', icon: History }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-3.5 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-sky-600 text-sky-700 font-bold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview KPIs */}
      {activeTab === 'overview' && metrics && (
        <div className="space-y-6">
          
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <div className="text-xs font-semibold text-slate-500">Gross Booking Value (GBV)</div>
              <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
                {formatPrice(metrics.grossBookingValuePKR)}
              </div>
              <div className="text-[11px] text-slate-400">Total customer transactions processed</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <div className="text-xs font-semibold text-slate-500">Disclosed Agency Fee Revenue</div>
              <div className="text-2xl font-extrabold text-sky-700 tabular-nums">
                {formatPrice(metrics.agencyFeeRevenuePKR)}
              </div>
              <div className="text-[11px] text-slate-400">Transparent service fees earned</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <div className="text-xs font-semibold text-slate-500">Estimated Net Agency Profit</div>
              <div className="text-2xl font-extrabold text-emerald-700 tabular-nums">
                {formatPrice(metrics.estimatedNetProfitPKR)}
              </div>
              <div className="text-[11px] text-slate-400">After payment gateway & supplier costs</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <div className="text-xs font-semibold text-slate-500">Confirmed / Ticketed PNRs</div>
              <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
                {metrics.ticketedBookings} <span className="text-xs font-normal text-slate-400">/ {metrics.totalBookings}</span>
              </div>
              <div className="text-[11px] text-slate-400">{metrics.refundsPending} refund pending review</div>
            </div>

          </div>

          {/* Supplier Health Monitor & Disclosures */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Flight Supplier Adapter Health & GDS Feeds</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Amadeus Self-Service</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    metrics.supplierHealth.amadeusConfigured ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {metrics.supplierHealth.amadeusConfigured ? 'CONNECTED' : 'UNCONFIGURED'}
                  </span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  Requires AMADEUS_CLIENT_ID and AMADEUS_CLIENT_SECRET backend keys.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Duffel Travel API</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    metrics.supplierHealth.duffelConfigured ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {metrics.supplierHealth.duffelConfigured ? 'CONNECTED' : 'UNCONFIGURED'}
                  </span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  Requires DUFFEL_ACCESS_TOKEN for live NDC ticket issuance.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">AH Flight Sandbox Feed</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    ACTIVE (0ms)
                  </span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  High-fidelity Pakistan airline route schedules, real airfares, and fare validation active.
                </p>
              </div>

            </div>
          </div>

          {/* CSV Export Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div>
              <div className="font-bold text-slate-900">Export Reconciliation Reports</div>
              <div className="text-slate-500">Download formatted CSV ledgers for accounting & Pakistan tax audits.</div>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="/api/admin/export/bookings"
                download="ah_flight_bookings.csv"
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Bookings CSV</span>
              </a>

              <a
                href="/api/admin/export/ledger"
                download="ah_flight_financial_ledger.csv"
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
                <span>Export Financial Ledger CSV</span>
              </a>
            </div>
          </div>

        </div>
      )}

      {/* Tab 2: Bookings Management */}
      {activeTab === 'bookings' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-5">
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <h3 className="font-bold text-slate-900 text-sm">All Flight Reservations</h3>
            
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search PNR, email, or passenger..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-y border-slate-200 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">PNR</th>
                  <th className="py-2.5 px-3">Passenger & Contact</th>
                  <th className="py-2.5 px-3">Route & Flight</th>
                  <th className="py-2.5 px-3">Gross (PKR)</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBookings.map(b => {
                  const p = b.passengers[0];
                  const seg = b.offer.outboundSegments[0];
                  const lastSeg = b.offer.outboundSegments[b.offer.outboundSegments.length - 1];

                  return (
                    <tr key={b.pnr} className="hover:bg-slate-50/60">
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">
                        {b.pnr}
                        <div className="text-[10px] text-slate-400 font-normal">{b.supplierBookingReference}</div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 uppercase">
                          {p?.firstName} {p?.lastName}
                        </div>
                        <div className="text-[11px] text-slate-500">{b.contact.email}</div>
                        <div className="text-[10px] text-slate-400">{b.contact.phoneNumber}</div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800">
                          {seg.departureAirport} → {lastSeg.arrivalAirport}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {seg.airlineName} ({seg.flightNumber})
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(seg.departureTime).toLocaleDateString()}
                        </div>
                      </td>

                      <td className="py-3 px-3 font-mono font-semibold tabular-nums text-slate-900">
                        {formatPrice(b.payment.amount)}
                        <div className="text-[10px] text-emerald-700">Fee: {formatPrice(b.financials.agencyServiceFee)}</div>
                      </td>

                      <td className="py-3 px-3">
                        <select
                          value={b.status}
                          onChange={e => handleUpdateStatus(b.pnr, e.target.value)}
                          className="text-xs bg-slate-100 border-0 rounded px-2 py-1 font-semibold cursor-pointer text-slate-800"
                        >
                          <option value="ticketed">Ticketed</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="refund_requested">Refund Requested</option>
                          <option value="refunded">Refunded</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveBooking(b);
                            setView('confirmation');
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-medium text-[11px] transition-colors"
                        >
                          Print E-Ticket
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* Tab 3: Service Fee Rules */}
      {activeTab === 'fees' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Service Fee & Agency Margin Engine</h3>
            <p className="text-xs text-slate-500">
              Configure transparent agency service fees automatically added to airfares. Disclosed clearly before customer checkout.
            </p>
          </div>

          <form onSubmit={handleSaveFeeRules} className="max-w-lg space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Domestic Flights Fixed Fee (PKR)
              </label>
              <input
                type="number"
                value={domesticFee}
                onChange={e => setDomesticFee(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600 font-mono"
              />
              <span className="text-[11px] text-slate-400">
                Applied to flights within Pakistan (e.g. Karachi, Lahore, Islamabad, Skardu).
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                International Flights Fixed Fee (PKR)
              </label>
              <input
                type="number"
                value={intlFee}
                onChange={e => setIntlFee(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600 font-mono"
              />
              <span className="text-[11px] text-slate-400">
                Applied to international departures from Pakistan (e.g. Dubai, London, Jeddah).
              </span>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors"
            >
              Save Service Fee Rules
            </button>
          </form>
        </div>
      )}

      {/* Tab 4: Promo Codes */}
      {activeTab === 'promos' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Promotional Discount Vouchers</h3>
              <p className="text-xs text-slate-500">Create discount codes for marketing campaigns.</p>
            </div>
          </div>

          {/* Add Promo Form */}
          <form onSubmit={handleAddPromo} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Promo Code</label>
              <input
                type="text"
                required
                placeholder="e.g. EIDSPECIAL"
                value={newPromoCode}
                onChange={e => setNewPromoCode(e.target.value.toUpperCase())}
                className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono uppercase"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Discount Type</label>
              <select
                value={newPromoType}
                onChange={e => setNewPromoType(e.target.value as any)}
                className="w-full p-2 bg-white border border-slate-200 rounded-lg"
              >
                <option value="fixed">Fixed PKR Amount</option>
                <option value="percentage">Percentage (%)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Value (PKR or %)</label>
              <input
                type="number"
                required
                value={newPromoDiscount}
                onChange={e => setNewPromoDiscount(e.target.value)}
                className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800"
              >
                Create Promo
              </button>
            </div>
          </form>

          {/* Promos Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-y border-slate-200 font-semibold">
                <tr>
                  <th className="py-2 px-3">Code</th>
                  <th className="py-2 px-3">Discount</th>
                  <th className="py-2 px-3">Min Booking</th>
                  <th className="py-2 px-3">Usage Count</th>
                  <th className="py-2 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {promoCodes.map(p => (
                  <tr key={p.code}>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{p.code}</td>
                    <td className="py-2.5 px-3">
                      {p.discountType === 'fixed' ? `PKR ${p.discountValue.toLocaleString()}` : `${p.discountValue}%`}
                    </td>
                    <td className="py-2.5 px-3">PKR {p.minBookingValuePKR.toLocaleString()}</td>
                    <td className="py-2.5 px-3 tabular-nums">{p.usageCount} times</td>
                    <td className="py-2.5 px-3">
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-sans font-bold">
                        ACTIVE
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Audit Trail */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Security & Pricing Audit Trail</h3>
            <p className="text-xs text-slate-500">Immutable ledger of administrative actions, fee modifications, and refund approvals.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-y border-slate-200 font-semibold">
                <tr>
                  <th className="py-2 px-3">Timestamp</th>
                  <th className="py-2 px-3">Actor</th>
                  <th className="py-2 px-3">Action</th>
                  <th className="py-2 px-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map(l => (
                  <tr key={l.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {new Date(l.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{l.actor}</td>
                    <td className="py-2.5 px-3">
                      <span className="font-medium text-slate-900">{l.action}</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{l.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
