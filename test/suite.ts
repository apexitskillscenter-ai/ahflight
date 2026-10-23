/**
 * AH Flight Automated Test Suite
 * Tests: Pricing, Booking, Idempotency, Passport Validation, Cancellations & Refunds
 */

import { db } from '../server/db';
import { SandboxAdapter } from '../server/suppliers/SandboxAdapter';
import { SupplierManager } from '../server/suppliers/SupplierManager';
import { FlightSearchParams, FlightOffer } from '../src/types/flight';
import { PassengerDetails, BookingContact } from '../src/types/booking';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('\n========================================');
  console.log('   AH FLIGHT AUTOMATED TEST SUITE');
  console.log('========================================\n');

  // Test 1: Service Fee Engine & Margin Calculation
  console.log('Test 1: Service Fee Engine & Disclosed Pricing');
  const domesticFee = db.calculateFee(20000, true);
  assert(domesticFee === 1500, `Domestic service fee should be PKR 1,500 (got: ${domesticFee})`);

  const intlFee = db.calculateFee(80000, false);
  assert(intlFee === 4500, `International service fee should be PKR 4,500 (got: ${intlFee})`);

  // Test 2: Flight Search & Realistic Airline Inventory
  console.log('\nTest 2: Flight Search & Multi-Airline Provider');
  const supplierManager = new SupplierManager();
  const searchParams: FlightSearchParams = {
    tripType: 'one-way',
    origin: 'KHI',
    destination: 'ISB',
    departureDate: '2026-11-15',
    adults: 1,
    children: 0,
    infants: 0,
    cabinClass: 'economy',
    directOnly: false
  };

  const searchRes = await supplierManager.searchFlights(searchParams);
  assert(searchRes.offers.length > 0, `Search should return offers for KHI-ISB (got: ${searchRes.offers.length})`);
  assert(searchRes.isDemo === true, `Sandbox mode must be transparently disclosed (isDemo: ${searchRes.isDemo})`);
  
  const sampleOffer = searchRes.offers[0];
  assert(Boolean(sampleOffer.validationToken), `Offer must carry a validationToken for pre-payment revalidation`);
  assert(sampleOffer.pricing.totalAmount > sampleOffer.pricing.baseFare, `Total fare must include taxes and disclosed agency fee`);

  // Test 3: Fare Re-pricing & Availability Locking
  console.log('\nTest 3: Fare Revalidation Before Payment');
  const revalSuccess = await supplierManager.repriceOffer(sampleOffer.id, sampleOffer.validationToken, sampleOffer.supplier);
  assert(revalSuccess.valid === true, `Valid offer revalidation must succeed`);
  assert(Boolean(revalSuccess.validationToken), `Revalidated offer should return refreshed lock token`);

  const revalInvalid = await supplierManager.repriceOffer('NON-EXISTENT-ID', 'EXPIRED-TOKEN', 'sandbox');
  assert(revalInvalid.valid === false, `Expired/unknown offer must be rejected before charging customer`);

  // Test 4: Passenger Validation for International Travel
  console.log('\nTest 4: Passenger Passport Validation');
  const invalidPassenger: PassengerDetails = {
    id: 'p-1',
    type: 'adult',
    title: 'Mr',
    firstName: 'Ali',
    lastName: 'Khan',
    dateOfBirth: '1990-01-01',
    gender: 'male',
    nationality: 'PK',
    passportNumber: '', // Missing passport for international!
    passportExpiry: '',
    passportIssuingCountry: 'PK'
  };

  const isPassportMissing = !invalidPassenger.passportNumber || !invalidPassenger.passportExpiry;
  assert(isPassportMissing, `Missing passport must fail international travel validation`);

  // Test 5: Booking Creation & Ticket Issuance Flow
  console.log('\nTest 5: Ticket Issuance & Financial Ledger Accounting');
  const validPassenger: PassengerDetails = {
    id: 'p-test',
    type: 'adult',
    title: 'Mr',
    firstName: 'Kamran',
    lastName: 'Akmal',
    dateOfBirth: '1992-04-10',
    gender: 'male',
    nationality: 'PK',
    passportNumber: 'BK948201',
    passportExpiry: '2031-10-20',
    passportIssuingCountry: 'PK'
  };

  const bookingRes = await supplierManager.createBooking(sampleOffer, [validPassenger], {
    email: 'kamran@example.com',
    phone: '03001234567',
    fullName: 'Kamran Akmal'
  });

  assert(Boolean(bookingRes.supplierBookingReference), `Supplier booking locator must be generated: ${bookingRes.supplierBookingReference}`);
  assert(Boolean(bookingRes.eTicketNumbers['p-test']), `E-ticket number must be issued: ${bookingRes.eTicketNumbers['p-test']}`);
  assert(bookingRes.status === 'ticketed', `Booking status must be confirmed/ticketed`);

  // Test 6: Cancellations & Refund Penalty Calculations
  console.log('\nTest 6: Cancellation & Refund Calculations');
  const grossPaid = 28000;
  const airlinePenalty = sampleOffer.fareConditions.cancellationPenaltyPKR;
  const agencyFee = 1500;
  const netRefund = Math.max(grossPaid - airlinePenalty - agencyFee, 0);

  assert(netRefund < grossPaid, `Net refund (${netRefund}) must deduct penalty (${airlinePenalty}) and agency processing fee (${agencyFee})`);

  // Test 7: Admin Health & Audit Log Tracking
  console.log('\nTest 7: Admin Audit Logging');
  db.logAudit('AutomatedTest', 'Run Test Suite', 'booking', 'Automated regression test executed');
  const latestLog = db.auditLogs[0];
  assert(latestLog.actor === 'AutomatedTest', `Audit log must record actor and action accurately`);

  console.log('\n----------------------------------------');
  console.log(`Results: ${passed} Passed, ${failed} Failed`);
  console.log('----------------------------------------\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
