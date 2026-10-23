import { FlightSearchParams, FlightOffer, RevalidationResult } from '../types/flight';
import { PassengerDetails, BookingContact, PaymentMethod, BookingRecord } from '../types/booking';

export async function searchFlightsAPI(params: FlightSearchParams) {
  const res = await fetch('/api/flights/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Search failed with status ${res.status}`);
  }
  return res.json();
}

export async function repriceOfferAPI(offerId: string, validationToken: string, supplierId: string): Promise<RevalidationResult> {
  const res = await fetch('/api/flights/reprice', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ offerId, validationToken, supplierId })
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Fare revalidation failed.');
  }
  return res.json();
}

export async function createBookingAPI(payload: {
  offer: FlightOffer;
  passengers: PassengerDetails[];
  contact: BookingContact;
  paymentMethod: PaymentMethod;
  promoCode?: string;
  idempotencyKey?: string;
}) {
  const res = await fetch('/api/bookings/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Booking creation failed.');
  }
  return res.json();
}

export async function lookupBookingAPI(pnr: string, query?: string) {
  const res = await fetch('/api/bookings/lookup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pnr, query })
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to locate booking.');
  }
  return res.json();
}

export async function requestRefundAPI(pnr: string, reason: string) {
  const res = await fetch(`/api/bookings/${pnr}/refund-request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason })
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to submit refund request.');
  }
  return res.json();
}

export async function requestChangeAPI(pnr: string, newDate: string, reason: string) {
  const res = await fetch(`/api/bookings/${pnr}/change-request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newDate, reason })
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to submit change request.');
  }
  return res.json();
}

export async function fetchAdminMetricsAPI() {
  const res = await fetch('/api/admin/metrics');
  if (!res.ok) throw new Error('Failed to fetch admin metrics');
  return res.json();
}

export async function fetchAdminBookingsAPI() {
  const res = await fetch('/api/admin/bookings');
  if (!res.ok) throw new Error('Failed to fetch admin bookings');
  return res.json();
}

export async function updateBookingStatusAPI(pnr: string, status: string, adminNotes?: string) {
  const res = await fetch(`/api/admin/bookings/${pnr}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, adminNotes })
  });
  if (!res.ok) throw new Error('Failed to update status');
  return res.json();
}

export async function submitSupportTicketAPI(data: any) {
  const res = await fetch('/api/support/ticket', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to submit ticket');
  return res.json();
}

export async function fetchAgencyConfigAPI() {
  const res = await fetch('/api/config');
  if (!res.ok) throw new Error('Failed to fetch agency config');
  return res.json();
}
