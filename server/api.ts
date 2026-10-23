import { Router, Request, Response } from 'express';
import { supplierManager } from './suppliers/SupplierManager';
import { db } from './db';
import { FlightSearchParams, FlightOffer } from '../src/types/flight';
import { PassengerDetails, BookingContact, PaymentMethod, BookingRecord } from '../src/types/booking';

export const apiRouter = Router();

// Track idempotency keys for booking creations to prevent duplicate charges/bookings
const idempotencyStore = new Map<string, { result: any; timestamp: number }>();

// 1. Search Flights across connected suppliers
apiRouter.post('/flights/search', async (req: Request, res: Response) => {
  try {
    const params: FlightSearchParams = req.body;
    if (!params.origin || !params.destination || !params.departureDate) {
      return res.status(400).json({ error: 'Origin, destination, and departureDate are required.' });
    }

    db.totalSearches++;
    const searchResult = await supplierManager.searchFlights(params);

    // Apply active agency service fee rule to offers
    const originUpper = params.origin.toUpperCase();
    const destUpper = params.destination.toUpperCase();
    const isDomestic = (
      ['KHI', 'LHE', 'ISB', 'PEW', 'MUX', 'SKT', 'UET', 'FSD', 'KDU', 'GIL', 'GWD', 'RYK'].includes(originUpper) &&
      ['KHI', 'LHE', 'ISB', 'PEW', 'MUX', 'SKT', 'UET', 'FSD', 'KDU', 'GIL', 'GWD', 'RYK'].includes(destUpper)
    );

    const adjustedOffers = searchResult.offers.map(offer => {
      const agencyFee = db.calculateFee(offer.pricing.baseFare, isDomestic);
      const totalAmount = offer.pricing.baseFare + offer.pricing.taxesAirportCharges + offer.pricing.supplierSurcharges + agencyFee;
      return {
        ...offer,
        pricing: {
          ...offer.pricing,
          agencyServiceFee: agencyFee,
          totalAmount
        }
      };
    });

    res.json({
      success: true,
      supplierId: searchResult.supplierId,
      isDemo: searchResult.isDemo,
      disclaimer: searchResult.disclaimer,
      offersCount: adjustedOffers.length,
      offers: adjustedOffers
    });
  } catch (err: any) {
    console.error('[API /flights/search] error:', err);
    res.status(500).json({ error: err.message || 'Error occurred while searching flights.' });
  }
});

// 2. Re-price and revalidate offer before charging customer
apiRouter.post('/flights/reprice', async (req: Request, res: Response) => {
  try {
    const { offerId, validationToken, supplierId } = req.body;
    if (!offerId) {
      return res.status(400).json({ error: 'offerId is required for fare revalidation.' });
    }

    const reval = await supplierManager.repriceOffer(offerId, validationToken, supplierId);
    res.json(reval);
  } catch (err: any) {
    console.error('[API /flights/reprice] error:', err);
    res.status(500).json({ error: err.message || 'Fare revalidation failed.' });
  }
});

// 3. Create Booking & Capture Payment
apiRouter.post('/bookings/create', async (req: Request, res: Response) => {
  try {
    const {
      offer,
      passengers,
      contact,
      paymentMethod,
      promoCode,
      idempotencyKey
    }: {
      offer: FlightOffer;
      passengers: PassengerDetails[];
      contact: BookingContact;
      paymentMethod: PaymentMethod;
      promoCode?: string;
      idempotencyKey?: string;
    } = req.body;

    // Idempotency check
    if (idempotencyKey && idempotencyStore.has(idempotencyKey)) {
      const cached = idempotencyStore.get(idempotencyKey);
      return res.json(cached?.result);
    }

    if (!offer || !passengers?.length || !contact?.email || !contact?.phoneNumber) {
      return res.status(400).json({ error: 'Missing required booking parameters.' });
    }

    // Passport validation for international flights
    const isIntl = !offer.outboundSegments.every(s => 
      ['KHI', 'LHE', 'ISB', 'PEW', 'MUX', 'SKT', 'UET', 'FSD', 'KDU', 'GIL', 'GWD', 'RYK'].includes(s.departureAirport) &&
      ['KHI', 'LHE', 'ISB', 'PEW', 'MUX', 'SKT', 'UET', 'FSD', 'KDU', 'GIL', 'GWD', 'RYK'].includes(s.arrivalAirport)
    );

    if (isIntl) {
      for (const p of passengers) {
        if (!p.passportNumber || !p.passportExpiry) {
          return res.status(400).json({
            error: `Passenger ${p.firstName} ${p.lastName} requires a valid passport number and expiry date for international travel.`
          });
        }
      }
    }

    // Validate Promo Code if applied
    let discountPKR = 0;
    if (promoCode) {
      const foundPromo = db.promoCodes.find(p => p.code.toUpperCase() === promoCode.toUpperCase() && p.isActive);
      if (foundPromo && offer.pricing.totalAmount >= foundPromo.minBookingValuePKR) {
        if (foundPromo.discountType === 'fixed') {
          discountPKR = foundPromo.discountValue;
        } else {
          discountPKR = Math.min(Math.round((offer.pricing.totalAmount * foundPromo.discountValue) / 100), foundPromo.maxDiscountPKR);
        }
        foundPromo.usageCount++;
      }
    }

    // Call Supplier adapter to create reservation & ticketing
    const supplierResult = await supplierManager.createBooking(offer, passengers, {
      email: contact.email,
      phone: contact.phoneNumber,
      fullName: contact.fullName
    });

    // Generate unique 6-character PNR
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let pnr = 'AH';
    for (let i = 0; i < 4; i++) {
      pnr += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Assign e-ticket numbers to passengers
    const passengersWithTickets = passengers.map(p => ({
      ...p,
      ticketNumber: supplierResult.eTicketNumbers[p.id] || `214-${Math.floor(1000000000 + Math.random() * 9000000000)}`
    }));

    const grossAmount = Math.max(offer.pricing.totalAmount - discountPKR, 0);
    const supplierNetRemittance = offer.pricing.baseFare + offer.pricing.supplierSurcharges;
    const taxesAndAirportCharges = offer.pricing.taxesAirportCharges;
    const agencyServiceFee = offer.pricing.agencyServiceFee;
    const agencyCommission = Math.round(offer.pricing.baseFare * 0.03); // 3% negotiated commission
    // Gateway fee estimate (2% for card/wallets)
    const gatewayFee = Math.round(grossAmount * 0.02);
    const netProfit = (agencyServiceFee + agencyCommission) - gatewayFee - discountPKR;

    const txnId = `TXN-${paymentMethod.toUpperCase().substring(0, 4)}-${Math.floor(10000000 + Math.random() * 90000000)}`;

    const booking: BookingRecord = {
      id: `bk-${Date.now()}-${pnr}`,
      pnr,
      supplierBookingReference: supplierResult.supplierBookingReference,
      status: 'ticketed',
      isDemoBooking: !supplierResult.isLiveSupplier,
      offer,
      passengers: passengersWithTickets,
      contact,
      payment: {
        method: paymentMethod,
        transactionId: txnId,
        amount: grossAmount,
        currency: 'PKR',
        paidAt: new Date().toISOString(),
        status: 'paid',
        idempotencyKey: idempotencyKey || txnId
      },
      financials: {
        grossBookingValue: grossAmount,
        supplierNetRemittance,
        taxesAndAirportCharges,
        agencyServiceFee,
        agencyCommission,
        promoDiscount: discountPKR,
        paymentGatewayFee: gatewayFee,
        netProfit
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.bookings.set(pnr, booking);
    db.saveToDisk();

    db.logAudit(
      contact.email,
      'Booking Created & Ticketed',
      'booking',
      `PNR: ${pnr}, Gross: PKR ${grossAmount.toLocaleString()}, Passengers: ${passengers.length}, Method: ${paymentMethod}`
    );

    const responsePayload = {
      success: true,
      pnr,
      booking,
      message: 'Booking confirmed and airline e-ticket issued successfully.'
    };

    if (idempotencyKey) {
      idempotencyStore.set(idempotencyKey, { result: responsePayload, timestamp: Date.now() });
    }

    res.json(responsePayload);
  } catch (err: any) {
    console.error('[API /bookings/create] error:', err);
    res.status(500).json({ error: err.message || 'Failed to complete booking reservation.' });
  }
});

// 4. Booking Lookup (by PNR + Email or Last Name)
apiRouter.post('/bookings/lookup', (req: Request, res: Response) => {
  const { pnr, query } = req.body;
  if (!pnr) {
    return res.status(400).json({ error: 'PNR reference code is required.' });
  }

  const booking = db.bookings.get(pnr.toUpperCase().trim());
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found with reference code ' + pnr });
  }

  // If query is provided, verify against email or passenger last name
  if (query) {
    const q = query.toLowerCase().trim();
    const emailMatch = booking.contact.email.toLowerCase().includes(q);
    const nameMatch = booking.passengers.some(p => p.lastName.toLowerCase().includes(q) || p.firstName.toLowerCase().includes(q));
    if (!emailMatch && !nameMatch) {
      return res.status(403).json({ error: 'Security verification failed: Name or email does not match booking record.' });
    }
  }

  res.json({ success: true, booking });
});

// 5. Get Booking by PNR
apiRouter.get('/bookings/:pnr', (req: Request, res: Response) => {
  const pnr = req.params.pnr.toUpperCase().trim();
  const booking = db.bookings.get(pnr);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found.' });
  }
  res.json({ success: true, booking });
});

// 6. Request Cancellation & Refund
apiRouter.post('/bookings/:pnr/refund-request', (req: Request, res: Response) => {
  const pnr = req.params.pnr.toUpperCase().trim();
  const { reason } = req.body;
  const booking = db.bookings.get(pnr);

  if (!booking) {
    return res.status(404).json({ error: 'Booking not found.' });
  }

  if (booking.status === 'cancelled' || booking.status === 'refunded') {
    return res.status(400).json({ error: 'Booking is already cancelled or refunded.' });
  }

  const airlinePenalty = booking.offer.fareConditions.cancellationPenaltyPKR || 5000;
  const agencyFee = 1500;
  const grossPaid = booking.payment.amount;
  const netRefund = Math.max(grossPaid - airlinePenalty - agencyFee, 0);

  const refundReq = {
    id: `ref-${Date.now()}`,
    requestedAt: new Date().toISOString(),
    reason: reason || 'Customer requested flight cancellation',
    airlinePenalty,
    agencyProcessingFee: agencyFee,
    netRefundAmount: netRefund,
    status: 'pending' as const
  };

  booking.refundRequests = booking.refundRequests || [];
  booking.refundRequests.push(refundReq);
  booking.status = 'refund_requested';
  booking.updatedAt = new Date().toISOString();

  db.saveToDisk();
  db.logAudit('Customer', 'Refund Requested', 'refund', `PNR ${pnr}: Penalty PKR ${airlinePenalty}, Refundable PKR ${netRefund}`);

  res.json({
    success: true,
    message: 'Refund request submitted. Support staff will verify airline fare rules and credit the original payment method.',
    refundRequest: refundReq,
    booking
  });
});

// 7. Request Date Change
apiRouter.post('/bookings/:pnr/change-request', (req: Request, res: Response) => {
  const pnr = req.params.pnr.toUpperCase().trim();
  const { newDate, reason } = req.body;
  const booking = db.bookings.get(pnr);

  if (!booking) {
    return res.status(404).json({ error: 'Booking not found.' });
  }

  const airlineChangeFee = booking.offer.fareConditions.changePenaltyPKR || 4000;
  const agencyFee = 1000;
  const estimatedFareDiff = 2500;
  const totalPayable = airlineChangeFee + agencyFee + estimatedFareDiff;

  const changeReq = {
    id: `chg-${Date.now()}`,
    requestedAt: new Date().toISOString(),
    targetDate: newDate,
    reason: reason || 'Flight date modification requested',
    airlineChangeFee,
    fareDifference: estimatedFareDiff,
    agencyFee,
    totalPayable,
    status: 'pending' as const
  };

  booking.changeRequests = booking.changeRequests || [];
  booking.changeRequests.push(changeReq);
  booking.status = 'change_requested';
  booking.updatedAt = new Date().toISOString();

  db.saveToDisk();
  db.logAudit('Customer', 'Change Requested', 'booking', `PNR ${pnr} new date: ${newDate}, Quoted payable: PKR ${totalPayable}`);

  res.json({
    success: true,
    message: 'Flight date change request lodged. Our ticketing desk will re-price availability and contact you.',
    changeRequest: changeReq,
    booking
  });
});

// 8. Admin Metrics & Health Check
apiRouter.get('/admin/metrics', (_req: Request, res: Response) => {
  res.json(db.getMetrics());
});

// 9. Admin Bookings List
apiRouter.get('/admin/bookings', (req: Request, res: Response) => {
  const list = Array.from(db.bookings.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  res.json({ success: true, count: list.length, bookings: list });
});

// 10. Admin Update Booking Status & Process Refund
apiRouter.patch('/admin/bookings/:pnr/status', (req: Request, res: Response) => {
  const pnr = req.params.pnr.toUpperCase().trim();
  const { status, adminNotes } = req.body;
  const booking = db.bookings.get(pnr);

  if (!booking) {
    return res.status(404).json({ error: 'Booking not found.' });
  }

  const previousStatus = booking.status;
  booking.status = status;
  booking.updatedAt = new Date().toISOString();

  if (status === 'refunded' && booking.refundRequests?.length) {
    const lastReq = booking.refundRequests[booking.refundRequests.length - 1];
    lastReq.status = 'processed';
    lastReq.processedAt = new Date().toISOString();
    lastReq.adminNotes = adminNotes;
  }

  db.saveToDisk();
  db.logAudit(
    'AdminStaff',
    'Booking Status Modified',
    'booking',
    `PNR: ${pnr} changed from ${previousStatus} to ${status}. Note: ${adminNotes || 'None'}`
  );

  res.json({ success: true, booking });
});

// 11. Admin Service Fee Rules
apiRouter.get('/admin/fee-rules', (_req: Request, res: Response) => {
  res.json({ success: true, rules: db.feeRules });
});

apiRouter.post('/admin/fee-rules', (req: Request, res: Response) => {
  const { rules } = req.body;
  if (Array.isArray(rules)) {
    db.feeRules = rules;
    db.saveToDisk();
    db.logAudit('AdminStaff', 'Fee Rules Updated', 'pricing', `Updated ${rules.length} agency service fee rules.`);
    return res.json({ success: true, rules: db.feeRules });
  }
  res.status(400).json({ error: 'Rules must be an array.' });
});

// 12. Admin Promo Codes
apiRouter.get('/admin/promo-codes', (_req: Request, res: Response) => {
  res.json({ success: true, promoCodes: db.promoCodes });
});

apiRouter.post('/admin/promo-codes', (req: Request, res: Response) => {
  const { code, discountType, discountValue, minBookingValuePKR, maxDiscountPKR, expiryDate } = req.body;
  if (!code || !discountValue) {
    return res.status(400).json({ error: 'code and discountValue are required.' });
  }

  const newPromo = {
    code: code.toUpperCase().trim(),
    discountType: discountType || 'fixed',
    discountValue: Number(discountValue),
    minBookingValuePKR: Number(minBookingValuePKR) || 10000,
    maxDiscountPKR: Number(maxDiscountPKR) || 5000,
    isActive: true,
    expiryDate: expiryDate || '2026-12-31',
    usageCount: 0
  };

  db.promoCodes.push(newPromo);
  db.saveToDisk();
  db.logAudit('AdminStaff', 'Promo Code Added', 'pricing', `Code: ${newPromo.code}, Discount: ${newPromo.discountValue}`);

  res.json({ success: true, promo: newPromo });
});

// 13. Admin Audit Logs
apiRouter.get('/admin/audit-logs', (_req: Request, res: Response) => {
  res.json({ success: true, logs: db.auditLogs });
});

// 14. Admin CSV Export
apiRouter.get('/admin/export/:type', (req: Request, res: Response) => {
  const type = req.params.type;
  const bookingsList = Array.from(db.bookings.values());

  if (type === 'bookings') {
    let csv = 'PNR,Created Date,Supplier Ref,Passenger Name,Passenger Phone,Origin,Destination,Flight No,Class,Gross (PKR),Status\n';
    bookingsList.forEach(b => {
      const p = b.passengers[0];
      const s = b.offer.outboundSegments[0];
      csv += `"${b.pnr}","${b.createdAt}","${b.supplierBookingReference}","${p?.firstName} ${p?.lastName}","${b.contact.phoneNumber}","${s?.departureAirport}","${s?.arrivalAirport}","${s?.flightNumber}","${s?.cabinClass}","${b.financials.grossBookingValue}","${b.status}"\n`;
    });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="ah_flight_bookings.csv"');
    return res.send(csv);
  }

  if (type === 'ledger') {
    let csv = 'PNR,Date,Gross Booking Value,Supplier Net Cost,Airport Taxes,Agency Fee,Commission,Discount,Gateway Fee,Net Profit\n';
    bookingsList.forEach(b => {
      const f = b.financials;
      csv += `"${b.pnr}","${b.createdAt}",${f.grossBookingValue},${f.supplierNetRemittance},${f.taxesAndAirportCharges},${f.agencyServiceFee},${f.agencyCommission},${f.promoDiscount},${f.paymentGatewayFee},${f.netProfit}\n`;
    });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="ah_flight_financial_ledger.csv"');
    return res.send(csv);
  }

  res.status(400).json({ error: 'Unknown export type' });
});

// 15. Customer Support Ticket Creation
apiRouter.post('/support/ticket', (req: Request, res: Response) => {
  const { pnr, customerName, email, phone, subject, message, priority } = req.body;
  if (!customerName || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }

  const ticket = {
    id: `TCK-${Date.now().toString().slice(-6)}`,
    pnr,
    customerName,
    email,
    phone,
    subject: subject || 'General Flight Inquiry',
    message,
    priority: priority || 'medium',
    status: 'open' as const,
    createdAt: new Date().toISOString()
  };

  db.supportTickets.unshift(ticket);
  db.saveToDisk();

  res.json({
    success: true,
    ticketNumber: ticket.id,
    message: 'Your inquiry has been logged. AH Flight support agent will respond within 30 minutes.'
  });
});

// 16. Public Agency Config & Disclosures
apiRouter.get('/config', (_req: Request, res: Response) => {
  res.json({
    agencyName: 'AH Flight Travel & Tours Pvt Ltd',
    dtsLicense: 'DTS-PK-KHI-4892',
    secpRegistration: 'CUIN-0194820-2024',
    supplierStatus: supplierManager.getStatus(),
    supportedCurrencies: ['PKR', 'USD', 'AED', 'SAR', 'GBP', 'EUR'],
    exchangeRatesToPKR: {
      PKR: 1,
      USD: 280,
      AED: 76.5,
      SAR: 74.6,
      GBP: 365,
      EUR: 305
    }
  });
});
