import { FlightSearchParams, FlightOffer, RevalidationResult } from '../../src/types/flight';
import { PassengerDetails, BookingRecord } from '../../src/types/booking';

export interface FlightSupplierAdapter {
  supplierId: 'sandbox' | 'amadeus' | 'duffel';
  supplierName: string;
  isReady(): boolean;
  search(params: FlightSearchParams): Promise<FlightOffer[]>;
  reprice(offerId: string, validationToken: string): Promise<RevalidationResult>;
  createBooking(
    offer: FlightOffer,
    passengers: PassengerDetails[],
    contact: { email: string; phone: string; fullName: string }
  ): Promise<{
    supplierBookingReference: string;
    eTicketNumbers: Record<string, string>; // passengerId -> eTicketNumber
    status: 'ticketed' | 'confirmed';
    isLiveSupplier: boolean;
  }>;
  cancelBooking(supplierBookingReference: string): Promise<{ success: boolean; message: string; penaltyAmount: number }>;
}
