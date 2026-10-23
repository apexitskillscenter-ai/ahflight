import { BookingRecord, BookingStatus } from '../src/types/booking';
import { ServiceFeeRule, PromoCode, AuditLogEntry, SupportTicket, AdminMetrics } from './types';
import fs from 'fs';
import path from 'path';

class DatabaseStore {
  public bookings: Map<string, BookingRecord> = new Map();
  public feeRules: ServiceFeeRule[] = [];
  public promoCodes: PromoCode[] = [];
  public auditLogs: AuditLogEntry[] = [];
  public supportTickets: SupportTicket[] = [];
  public totalSearches: number = 142;

  private dataFilePath = path.resolve(process.cwd(), '.ah_flight_data.json');

  constructor() {
    this.initDefaults();
    this.loadFromDisk();
  }

  private initDefaults() {
    // Default Service Fee Rules for Pakistan Travel Agency
    this.feeRules = [
      {
        id: 'rule-domestic-fixed',
        name: 'Pakistan Domestic Flights Service Fee',
        type: 'fixed',
        amount: 1500, // PKR 1,500
        appliesTo: 'domestic',
        isActive: true,
        updatedAt: new Date().toISOString()
      },
      {
        id: 'rule-intl-fixed',
        name: 'International Flights Service Fee',
        type: 'fixed',
        amount: 4500, // PKR 4,500
        appliesTo: 'international',
        isActive: true,
        updatedAt: new Date().toISOString()
      },
      {
        id: 'rule-percentage-highfare',
        name: 'Corporate & First Class Margin Rule',
        type: 'percentage',
        amount: 2.5, // 2.5%
        appliesTo: 'all',
        isActive: false,
        minFeePKR: 3000,
        maxFeePKR: 18000,
        updatedAt: new Date().toISOString()
      }
    ];

    // Default Promotional Codes
    this.promoCodes = [
      {
        code: 'AHWELCOME',
        discountType: 'fixed',
        discountValue: 2000,
        minBookingValuePKR: 20000,
        maxDiscountPKR: 2000,
        isActive: true,
        expiryDate: '2026-12-31',
        usageCount: 18
      },
      {
        code: 'FLYPAKISTAN',
        discountType: 'percentage',
        discountValue: 5,
        minBookingValuePKR: 15000,
        maxDiscountPKR: 4000,
        isActive: true,
        expiryDate: '2026-11-30',
        usageCount: 34
      }
    ];

    // Initial audit logs
    this.auditLogs = [
      {
        id: 'log-1',
        timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
        actor: 'SuperAdmin (apexitskillscenter@gmail.com)',
        action: 'System Initialized',
        category: 'auth',
        details: 'AH Flight Agency management console deployed with Pakistan DTS compliance rules.'
      },
      {
        id: 'log-2',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        actor: 'FinanceManager',
        action: 'Service Fee Rules Configured',
        category: 'pricing',
        details: 'Configured domestic ticket fee PKR 1,500 and international fee PKR 4,500.'
      }
    ];

    // Seed realistic sample bookings for demonstration
    this.seedSampleBookings();
  }

  private seedSampleBookings() {
    const seed1: BookingRecord = {
      id: 'bk-khi-isb-001',
      pnr: 'PK49Q2',
      supplierBookingReference: 'PK-384910',
      status: 'ticketed',
      isDemoBooking: true,
      offer: {
        id: 'seed-offer-1',
        supplier: 'sandbox',
        supplierOfferId: 'SBOX-PK-482',
        tripType: 'one-way',
        outboundSegments: [
          {
            id: 'seg-1',
            airlineCode: 'PK',
            airlineName: 'Pakistan International Airlines',
            flightNumber: 'PK-300',
            aircraft: 'Airbus A320-200',
            departureAirport: 'KHI',
            departureCity: 'Karachi',
            departureTime: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0] + 'T07:00:00',
            departureTerminal: 'Domestic T1',
            arrivalAirport: 'ISB',
            arrivalCity: 'Islamabad',
            arrivalTime: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0] + 'T09:00:00',
            arrivalTerminal: 'Terminal 1',
            durationMinutes: 120,
            cabinClass: 'economy',
            checkedBaggage: '20 kg',
            cabinBaggage: '7 kg',
            mealProvided: true
          }
        ],
        totalOutboundDurationMinutes: 120,
        stopsOutbound: 0,
        layoversOutbound: [],
        pricing: {
          currency: 'PKR',
          baseFare: 21500,
          taxesAirportCharges: 3440,
          supplierSurcharges: 1075,
          agencyServiceFee: 1500,
          totalAmount: 27515
        },
        fareConditions: {
          refundable: true,
          cancellationPenaltyPKR: 4000,
          changeAllowed: true,
          changePenaltyPKR: 2500,
          seatSelectionIncluded: true,
          mealIncluded: true,
          checkedBaggage: '20 kg',
          cabinBaggage: '7 kg',
          fareClassCode: 'Y-Economy'
        },
        seatsRemaining: 4,
        validationToken: 'SEED-VAL-1',
        isDemoData: true,
        lastUpdated: new Date().toISOString()
      },
      passengers: [
        {
          id: 'pax-1',
          type: 'adult',
          title: 'Mr',
          firstName: 'Muhammad',
          lastName: 'Ahmed',
          dateOfBirth: '1988-06-15',
          gender: 'male',
          nationality: 'PK',
          passportNumber: 'BL8294012',
          passportExpiry: '2030-05-12',
          passportIssuingCountry: 'PK',
          cnicNumber: '42201-1234567-1',
          ticketNumber: '214-4920194820',
          assignedSeat: '12A'
        }
      ],
      contact: {
        fullName: 'Muhammad Ahmed',
        email: 'ahmed.m@example.com',
        phoneCountryCode: '+92',
        phoneNumber: '3009283741',
        city: 'Karachi'
      },
      payment: {
        method: 'payfast_card',
        transactionId: 'PF-TXN-9284102',
        amount: 27515,
        currency: 'PKR',
        paidAt: new Date(Date.now() - 3600000 * 12).toISOString(),
        status: 'paid',
        idempotencyKey: 'IDEMP-92841-KHI'
      },
      financials: {
        grossBookingValue: 27515,
        supplierNetRemittance: 22575,
        taxesAndAirportCharges: 3440,
        agencyServiceFee: 1500,
        agencyCommission: 645,
        promoDiscount: 0,
        paymentGatewayFee: 660,
        netProfit: 1485
      },
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 12).toISOString()
    };

    const seed2: BookingRecord = {
      id: 'bk-khi-dxb-002',
      pnr: 'EK79B1',
      supplierBookingReference: 'EK-849201',
      status: 'ticketed',
      isDemoBooking: true,
      offer: {
        id: 'seed-offer-2',
        supplier: 'sandbox',
        supplierOfferId: 'SBOX-EK-921',
        tripType: 'one-way',
        outboundSegments: [
          {
            id: 'seg-2',
            airlineCode: 'EK',
            airlineName: 'Emirates',
            flightNumber: 'EK-601',
            aircraft: 'Boeing 777-300ER',
            departureAirport: 'KHI',
            departureCity: 'Karachi',
            departureTime: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0] + 'T12:00:00',
            departureTerminal: 'Terminal 1',
            arrivalAirport: 'DXB',
            arrivalCity: 'Dubai',
            arrivalTime: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0] + 'T13:20:00',
            arrivalTerminal: 'Terminal 3',
            durationMinutes: 140,
            cabinClass: 'economy',
            checkedBaggage: '30 kg (1 pc)',
            cabinBaggage: '7 kg Hand baggage',
            mealProvided: true
          }
        ],
        totalOutboundDurationMinutes: 140,
        stopsOutbound: 0,
        layoversOutbound: [],
        pricing: {
          currency: 'PKR',
          baseFare: 78000,
          taxesAirportCharges: 17160,
          supplierSurcharges: 4680,
          agencyServiceFee: 4500,
          totalAmount: 104340
        },
        fareConditions: {
          refundable: true,
          cancellationPenaltyPKR: 15000,
          changeAllowed: true,
          changePenaltyPKR: 9000,
          seatSelectionIncluded: true,
          mealIncluded: true,
          checkedBaggage: '30 kg',
          cabinBaggage: '7 kg',
          fareClassCode: 'V-Flex'
        },
        seatsRemaining: 5,
        validationToken: 'SEED-VAL-2',
        isDemoData: true,
        lastUpdated: new Date().toISOString()
      },
      passengers: [
        {
          id: 'pax-2',
          type: 'adult',
          title: 'Mrs',
          firstName: 'Fatima',
          lastName: 'Zahra',
          dateOfBirth: '1992-11-20',
          gender: 'female',
          nationality: 'PK',
          passportNumber: 'CA9104829',
          passportExpiry: '2029-08-14',
          passportIssuingCountry: 'PK',
          ticketNumber: '176-9284109482',
          assignedSeat: '18K'
        }
      ],
      contact: {
        fullName: 'Fatima Zahra',
        email: 'fatima.z@example.com',
        phoneCountryCode: '+92',
        phoneNumber: '3219482710',
        city: 'Karachi'
      },
      payment: {
        method: 'jazzcash',
        transactionId: 'JC-84920194',
        amount: 104340,
        currency: 'PKR',
        paidAt: new Date(Date.now() - 3600000 * 28).toISOString(),
        status: 'paid',
        idempotencyKey: 'IDEMP-JC-DXB'
      },
      financials: {
        grossBookingValue: 104340,
        supplierNetRemittance: 82680,
        taxesAndAirportCharges: 17160,
        agencyServiceFee: 4500,
        agencyCommission: 2340,
        promoDiscount: 0,
        paymentGatewayFee: 1250,
        netProfit: 5590
      },
      createdAt: new Date(Date.now() - 3600000 * 28).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 28).toISOString()
    };

    this.bookings.set(seed1.pnr, seed1);
    this.bookings.set(seed2.pnr, seed2);
  }

  private loadFromDisk() {
    try {
      if (fs.existsSync(this.dataFilePath)) {
        const raw = fs.readFileSync(this.dataFilePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.bookings)) {
          parsed.bookings.forEach((b: BookingRecord) => this.bookings.set(b.pnr, b));
        }
        if (Array.isArray(parsed.feeRules) && parsed.feeRules.length > 0) {
          this.feeRules = parsed.feeRules;
        }
        if (Array.isArray(parsed.promoCodes) && parsed.promoCodes.length > 0) {
          this.promoCodes = parsed.promoCodes;
        }
        if (Array.isArray(parsed.auditLogs) && parsed.auditLogs.length > 0) {
          this.auditLogs = parsed.auditLogs;
        }
        if (typeof parsed.totalSearches === 'number') {
          this.totalSearches = parsed.totalSearches;
        }
      }
    } catch (e) {
      console.warn('[DatabaseStore] Could not load persisted data file:', e);
    }
  }

  public saveToDisk() {
    try {
      const payload = {
        bookings: Array.from(this.bookings.values()),
        feeRules: this.feeRules,
        promoCodes: this.promoCodes,
        auditLogs: this.auditLogs.slice(0, 200),
        totalSearches: this.totalSearches
      };
      fs.writeFileSync(this.dataFilePath, JSON.stringify(payload, null, 2), 'utf-8');
    } catch (e) {
      console.warn('[DatabaseStore] Could not save data to disk:', e);
    }
  }

  public logAudit(actor: string, action: string, category: 'pricing' | 'booking' | 'refund' | 'supplier' | 'auth', details: string) {
    const entry: AuditLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      actor,
      action,
      category,
      details
    };
    this.auditLogs.unshift(entry);
    this.saveToDisk();
  }

  public calculateFee(baseFare: number, isDomestic: boolean): number {
    const applicableRule = this.feeRules.find(
      r => r.isActive && (r.appliesTo === 'all' || (isDomestic ? r.appliesTo === 'domestic' : r.appliesTo === 'international'))
    );
    if (!applicableRule) return isDomestic ? 1500 : 4500;
    if (applicableRule.type === 'fixed') {
      return applicableRule.amount;
    }
    const computed = Math.round((baseFare * applicableRule.amount) / 100);
    const min = applicableRule.minFeePKR || 1000;
    const max = applicableRule.maxFeePKR || 20000;
    return Math.min(Math.max(computed, min), max);
  }

  public getMetrics(): AdminMetrics {
    const bookingsList = Array.from(this.bookings.values());
    const totalBookings = bookingsList.length;
    const confirmed = bookingsList.filter(b => b.status === 'confirmed').length;
    const ticketed = bookingsList.filter(b => b.status === 'ticketed').length;
    const cancelled = bookingsList.filter(b => b.status === 'cancelled').length;
    const pendingRefunds = bookingsList.filter(b => b.status === 'refund_requested').length;

    let grossBookingValuePKR = 0;
    let agencyFeeRevenuePKR = 0;
    let estimatedNetProfitPKR = 0;

    bookingsList.forEach(b => {
      if (b.status === 'ticketed' || b.status === 'confirmed') {
        grossBookingValuePKR += b.financials.grossBookingValue;
        agencyFeeRevenuePKR += b.financials.agencyServiceFee;
        estimatedNetProfitPKR += b.financials.netProfit;
      }
    });

    return {
      totalSearches: this.totalSearches,
      totalBookings,
      confirmedBookings: confirmed,
      ticketedBookings: ticketed,
      cancelledBookings: cancelled,
      refundsPending: pendingRefunds,
      grossBookingValuePKR,
      agencyFeeRevenuePKR,
      estimatedNetProfitPKR,
      supplierHealth: {
        activeProvider: process.env.FLIGHT_SUPPLIER_MODE || 'sandbox',
        amadeusConfigured: Boolean(process.env.AMADEUS_CLIENT_ID && process.env.AMADEUS_CLIENT_SECRET),
        duffelConfigured: Boolean(process.env.DUFFEL_ACCESS_TOKEN),
        sandboxActive: true,
        lastPingMs: 42
      }
    };
  }
}

export const db = new DatabaseStore();
