import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Phone, Mail, MapPin, AlertCircle, FileText } from 'lucide-react';

export const Footer: React.FC = () => {
  const { openLegalModal, setSupportModalOpen } = useApp();

  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Col 1: About & DTS License */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white">
              <span className="text-lg font-bold tracking-tight">AH <span className="text-sky-400">Flight</span></span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              AH Flight Travel & Tours Pvt Ltd is an authorized Pakistani travel agency providing airline ticketing, transparent fare comparison, and GDS flight bookings.
            </p>
            <div className="text-[11px] text-amber-300/90 flex items-center gap-1.5 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-amber-400" />
              <span>DTS License: DTS-PK-KHI-4892</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              SECP Reg: CUIN-0194820-2024
            </div>
          </div>

          {/* Col 2: Regulatory Disclosures */}
          <div className="space-y-2.5">
            <h4 className="text-white font-semibold text-sm">Regulatory Transparency</h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              In strict adherence to Pakistan travel trade regulations and consumer protection:
            </p>
            <ul className="space-y-1.5 text-[11px] text-slate-400">
              <li className="flex items-start gap-1.5">
                <span className="text-sky-400 font-bold">·</span>
                <span>All service fees and merchant charges are itemized before checkout.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-sky-400 font-bold">·</span>
                <span>Bookings are issued through authorized airline consolidators & GDS feeds.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-sky-400 font-bold">·</span>
                <span>In demo/sandbox mode, payments and tickets are simulated with zero real charge.</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal & Quick Links */}
          <div className="space-y-2.5">
            <h4 className="text-white font-semibold text-sm">Policies & Assistance</h4>
            <div className="flex flex-col space-y-1.5 text-xs">
              <button
                onClick={() => openLegalModal('terms')}
                className="text-left hover:text-white transition-colors"
              >
                Terms of Carriage & Booking
              </button>
              <button
                onClick={() => openLegalModal('privacy')}
                className="text-left hover:text-white transition-colors"
              >
                Privacy & Passport Data Protection
              </button>
              <button
                onClick={() => openLegalModal('refund')}
                className="text-left hover:text-white transition-colors"
              >
                Airlines Cancellation & Refund Rules
              </button>
              <button
                onClick={() => openLegalModal('dts')}
                className="text-left hover:text-white transition-colors"
              >
                DTS Agency Credentials & Registration
              </button>
              <button
                onClick={() => setSupportModalOpen(true)}
                className="text-left hover:text-white transition-colors"
              >
                Flight Inquiries & FAQs
              </button>
            </div>
          </div>

          {/* Col 4: Agency Contact & Head Office */}
          <div className="space-y-2.5">
            <h4 className="text-white font-semibold text-sm">Head Office & Support</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Suite 402, Business Avenue, Shahrah-e-Faisal, Karachi</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-mono tabular-nums">+92 21 3452 8900 / 0300 1234567</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-mono">support@ahflight.pk</span>
              </div>
              <div className="text-[11px] text-slate-400 pt-1">
                24/7 Ticketing Desk & Emergency Re-routing Available
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <div>
            © {new Date().getFullYear()} AH Flight Travel & Tours Pvt Ltd. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span>Powered by Authorized GDS / Travel Suppliers</span>
            <span aria-hidden="true">·</span>
            <span>Pakistan Tax Registered (FBR NTN: 9482019-1)</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
