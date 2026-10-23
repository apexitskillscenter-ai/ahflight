import React from 'react';
import { useApp } from '../context/AppContext';
import { X, ShieldCheck, Scale, FileText, AlertCircle } from 'lucide-react';

export const LegalModal: React.FC = () => {
  const { legalModal, closeLegalModal, openLegalModal } = useApp();
  if (!legalModal.open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg">Legal, Regulatory & DTS Disclosures</h3>
            <p className="text-xs text-slate-500">
              AH Flight Travel & Tours Pvt Ltd · Compliance with Pakistan Laws
            </p>
          </div>
          <button
            onClick={closeLegalModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-200 text-xs font-semibold overflow-x-auto">
          {[
            { id: 'terms', label: 'Terms of Service', icon: Scale },
            { id: 'privacy', label: 'Privacy & Passports', icon: ShieldCheck },
            { id: 'refund', label: 'Refunds & Changes', icon: FileText },
            { id: 'dts', label: 'DTS Agency License', icon: AlertCircle }
          ].map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => openLegalModal(t.id as any)}
                className={`py-2 px-3.5 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  legalModal.tab === t.id
                    ? 'border-sky-600 text-sky-700 font-bold'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs text-slate-600 leading-relaxed">
          
          {legalModal.tab === 'terms' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">1. Agency Role & Terms of Booking</h4>
              <p>
                AH Flight Travel & Tours Pvt Ltd acts as an authorized travel agent facilitating the search, reservation, and issuance of airline tickets through certified Global Distribution Systems (GDS) and authorized consolidators.
              </p>
              <h4 className="font-bold text-slate-900 text-sm">2. Transparent Pricing Disclosure</h4>
              <p>
                In strict adherence to consumer transparency, all airfares are itemized prior to payment: Airline Base Fare, Government & Airport Taxes (including Pakistan Federal Excise Duty / Embarkation charges), Carrier Surcharges, and AH Flight Agency Service Fees. No hidden surcharges are levied.
              </p>
              <h4 className="font-bold text-slate-900 text-sm">3. Ticket Validity & Airport Check-In</h4>
              <p>
                The contract of carriage is directly between the passenger and the operating airline. Passengers are solely responsible for ensuring valid travel documents (passports with minimum 6 months validity, transit and destination visas, vaccination certificates where applicable).
              </p>
            </div>
          )}

          {legalModal.tab === 'privacy' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">Protection of Passport & National ID Data</h4>
              <p>
                AH Flight respects user privacy and complies with applicable Pakistan personal data protection standards.
              </p>
              <ul className="list-disc pl-4 space-y-1">
                <li>
                  <strong>Collection Limitation:</strong> We collect only identification data required by civil aviation authorities and airlines (Full Name, Date of Birth, Gender, Passport Number, Expiry Date, Issuing Country, or Pakistan CNIC).
                </li>
                <li>
                  <strong>No Card Data Storage:</strong> In compliance with PCI DSS standards, raw credit/debit card numbers and CVVs are processed directly via certified payment gateways and are never stored on AH Flight servers.
                </li>
                <li>
                  <strong>Encryption in Transit:</strong> All customer data is transmitted using modern TLS 1.3 encryption.
                </li>
              </ul>
            </div>
          )}

          {legalModal.tab === 'refund' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">Airline Cancellation, Void & Refund Policy</h4>
              <p>
                All ticket cancellations and modifications are strictly governed by the fare rules established by the issuing airline:
              </p>
              <ul className="list-disc pl-4 space-y-1">
                <li>
                  <strong>Refundable Fares:</strong> Can be cancelled prior to flight departure. The net refund equals the total airfare paid minus the airline cancellation penalty and the agency processing fee (PKR 1,500).
                </li>
                <li>
                  <strong>Non-Refundable Fares:</strong> The base fare is non-refundable. Only unutilized government embarkation taxes may be claimed upon application.
                </li>
                <li>
                  <strong>Date Changes:</strong> Subject to airline seat availability in the same or higher booking class, airline reissue penalty, and fare difference.
                </li>
                <li>
                  <strong>Refund Timeline:</strong> Once processed by the airline, funds are credited back to the original funding source (credit card, JazzCash, EasyPaisa, or bank account) within 5-10 business days.
                </li>
              </ul>
            </div>
          )}

          {legalModal.tab === 'dts' && (
            <div className="space-y-3">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                <div className="font-bold text-emerald-950 flex items-center gap-2 text-sm">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>Government of Pakistan Authorization</span>
                </div>
                <div className="text-emerald-900 space-y-1">
                  <div>Department of Tourist Services (DTS) License: <strong>DTS-PK-KHI-4892</strong></div>
                  <div>Securities and Exchange Commission of Pakistan (SECP): <strong>CUIN 0194820-2024</strong></div>
                  <div>Federal Board of Revenue (FBR) NTN: <strong>9482019-1</strong></div>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                Operating under the Travel Agencies Act 1976 and the Travel Agencies Rules 1977. AH Flight does not display false IATA logos or claim unauthorized direct carrier appointments without signed supplier or consolidator agreements.
              </p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={closeLegalModal}
            className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
          >
            I Understand
          </button>
        </div>

      </div>
    </div>
  );
};
