import { BookingRecord } from '../src/types/booking';

export interface ServiceFeeRule {
  id: string;
  name: string;
  type: 'fixed' | 'percentage';
  amount: number; // e.g. 1500 PKR fixed or 3.5%
  appliesTo: 'domestic' | 'international' | 'all';
  isActive: boolean;
  minFeePKR?: number;
  maxFeePKR?: number;
  updatedAt: string;
}

export interface PromoCode {
  code: string;
  discountType: 'fixed' | 'percentage';
  discountValue: number;
  minBookingValuePKR: number;
  maxDiscountPKR: number;
  isActive: boolean;
  expiryDate: string;
  usageCount: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  category: 'pricing' | 'booking' | 'refund' | 'supplier' | 'auth';
  details: string;
  ipAddress?: string;
}

export interface SupportTicket {
  id: string;
  pnr?: string;
  customerName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: string;
}

export interface AdminMetrics {
  totalSearches: number;
  totalBookings: number;
  confirmedBookings: number;
  ticketedBookings: number;
  cancelledBookings: number;
  refundsPending: number;
  grossBookingValuePKR: number;
  agencyFeeRevenuePKR: number;
  estimatedNetProfitPKR: number;
  supplierHealth: {
    activeProvider: string;
    amadeusConfigured: boolean;
    duffelConfigured: boolean;
    sandboxActive: boolean;
    lastPingMs: number;
  };
}
