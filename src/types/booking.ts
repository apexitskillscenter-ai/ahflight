import { FlightOffer } from './flight';

export type PassengerType = 'adult' | 'child' | 'infant';
export type Gender = 'male' | 'female' | 'other';
export type PassengerTitle = 'Mr' | 'Mrs' | 'Ms' | 'Master' | 'Miss';

export interface PassengerDetails {
  id: string;
  type: PassengerType;
  title: PassengerTitle;
  firstName: string;
  lastName: string;
  dateOfBirth: string; // YYYY-MM-DD
  gender: Gender;
  nationality: string; // ISO 2-letter
  passportNumber: string;
  passportExpiry: string; // YYYY-MM-DD
  passportIssuingCountry: string;
  cnicNumber?: string; // Pakistan CNIC / Form-B for domestic routes
  mealPreference?: string;
  frequentFlyerAirline?: string;
  frequentFlyerNumber?: string;
  assignedSeat?: string;
  ticketNumber?: string;
}

export interface BookingContact {
  fullName: string;
  email: string;
  phoneCountryCode: string; // e.g. "+92"
  phoneNumber: string; // e.g. "3001234567"
  city: string;
  specialRequests?: string;
}

export type PaymentMethod = 
  | 'payfast_card' 
  | 'jazzcash' 
  | 'easypaisa' 
  | 'hbl_pay' 
  | 'raast_bank' 
  | 'sandbox_demo';

export type BookingStatus = 
  | 'confirmed' 
  | 'ticketed' 
  | 'pending_payment' 
  | 'cancelled' 
  | 'refund_requested' 
  | 'refunded' 
  | 'change_requested';

export interface RefundRequest {
  id: string;
  requestedAt: string;
  reason: string;
  airlinePenalty: number;
  agencyProcessingFee: number;
  netRefundAmount: number;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  adminNotes?: string;
  processedAt?: string;
}

export interface ChangeRequest {
  id: string;
  requestedAt: string;
  targetDate: string;
  reason: string;
  airlineChangeFee: number;
  fareDifference: number;
  agencyFee: number;
  totalPayable: number;
  status: 'pending' | 'quoted' | 'completed' | 'rejected';
  adminNotes?: string;
}

export interface BookingFinancials {
  grossBookingValue: number; // Total charged to customer in PKR
  supplierNetRemittance: number; // Cost paid to airline/supplier
  taxesAndAirportCharges: number;
  agencyServiceFee: number; // Transparent agency fee
  agencyCommission: number; // Commercial commission from supplier if applicable
  promoDiscount: number;
  paymentGatewayFee: number; // 1.5% - 2.5% card/wallet fees
  netProfit: number; // agencyServiceFee + commission - gatewayFee - promoDiscount
}

export interface BookingRecord {
  id: string; // Internal UUID
  pnr: string; // 6-character PNR code e.g. "AH89QK"
  supplierBookingReference: string; // Airline GDS locator e.g. "PK-928410"
  status: BookingStatus;
  offer: FlightOffer;
  passengers: PassengerDetails[];
  contact: BookingContact;
  payment: {
    method: PaymentMethod;
    transactionId: string;
    amount: number;
    currency: string;
    paidAt: string;
    status: 'paid' | 'pending' | 'refunded';
    idempotencyKey: string;
  };
  financials: BookingFinancials;
  isDemoBooking: boolean;
  createdAt: string;
  updatedAt: string;
  refundRequests?: RefundRequest[];
  changeRequests?: ChangeRequest[];
}
