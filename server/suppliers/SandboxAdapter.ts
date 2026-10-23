import { FlightSupplierAdapter } from './FlightSupplierAdapter';
import { FlightSearchParams, FlightOffer, FlightSegment, RevalidationResult, TripType, CabinClass } from '../../src/types/flight';
import { PassengerDetails } from '../../src/types/booking';
import { findAirport } from '../../src/data/airports';
import { AIRLINES } from '../../src/data/airlines';

// In-memory cache of generated offers for revalidation & booking
const offersCache = new Map<string, { offer: FlightOffer; expiresAt: number }>();

export class SandboxAdapter implements FlightSupplierAdapter {
  supplierId: 'sandbox' = 'sandbox';
  supplierName = 'AH Flight Sandbox Travel Inventory';

  isReady(): boolean {
    return true;
  }

  async search(params: FlightSearchParams): Promise<FlightOffer[]> {
    const originAirport = findAirport(params.origin) || { code: params.origin, city: params.origin, country: '', isDomesticPakistan: false };
    const destAirport = findAirport(params.destination) || { code: params.destination, city: params.destination, country: '', isDomesticPakistan: false };
    const isDomestic = !!(originAirport.isDomesticPakistan && destAirport.isDomesticPakistan);

    const offers: FlightOffer[] = [];
    const dateStr = params.departureDate || new Date().toISOString().split('T')[0];

    // Airline candidates based on route
    const airlineCandidates = isDomestic
      ? [
          { code: 'PK', name: 'Pakistan International Airlines', flightPrefix: 'PK-', baseDirect: 22000, aircraft: 'Airbus A320-200' },
          { code: 'PA', name: 'Airblue', flightPrefix: 'PA-', baseDirect: 19500, aircraft: 'Airbus A321neo' },
          { code: '9P', name: 'Fly Jinnah', flightPrefix: '9P-', baseDirect: 17800, aircraft: 'Airbus A320' },
          { code: 'ER', name: 'SereneAir', flightPrefix: 'ER-', baseDirect: 18900, aircraft: 'Boeing 737-800' }
        ]
      : [
          { code: 'PK', name: 'Pakistan International Airlines', flightPrefix: 'PK-', baseDirect: 68000, aircraft: 'Boeing 777-300ER', canDirect: true },
          { code: 'EK', name: 'Emirates', flightPrefix: 'EK-', baseDirect: 82000, aircraft: 'Boeing 777-300ER / Airbus A380', hub: 'DXB' },
          { code: 'QR', name: 'Qatar Airways', flightPrefix: 'QR-', baseDirect: 85000, aircraft: 'Boeing 787-9 Dreamliner', hub: 'DOH' },
          { code: 'SV', name: 'Saudia', flightPrefix: 'SV-', baseDirect: 76000, aircraft: 'Airbus A330-300', hub: 'JED' },
          { code: 'TK', name: 'Turkish Airlines', flightPrefix: 'TK-', baseDirect: 92000, aircraft: 'Airbus A350-900', hub: 'IST' },
          { code: 'FZ', name: 'flydubai', flightPrefix: 'FZ-', baseDirect: 64000, aircraft: 'Boeing 737 MAX 8', hub: 'DXB' }
        ];

    // Multipliers for cabin class
    const cabinMultiplier = {
      economy: 1.0,
      premium_economy: 1.45,
      business: 2.8,
      first: 4.5
    }[params.cabinClass || 'economy'];

    let offerIdx = 1;

    for (const airline of airlineCandidates) {
      // Direct Flight Option (if domestic or airline flies direct on this route)
      const hasDirect = isDomestic || airline.code === 'PK' || ['DXB', 'DOH', 'JED'].includes(destAirport.code);

      if (hasDirect) {
        const depTime = `${dateStr}T${offerIdx % 2 === 0 ? '08:30:00' : '15:45:00'}`;
        const flightDurationMin = isDomestic ? 115 : (destAirport.code === 'DXB' ? 140 : 260);
        const arrTime = new Date(new Date(depTime).getTime() + flightDurationMin * 60000).toISOString();

        const baseFare = Math.round(airline.baseDirect * cabinMultiplier);
        const taxes = Math.round(baseFare * (isDomestic ? 0.16 : 0.22));
        const supplierSurcharges = Math.round(baseFare * 0.05);
        const agencyFee = isDomestic ? 1500 : 4500;
        const total = baseFare + taxes + supplierSurcharges + agencyFee;

        const offerId = `SND-DIR-${airline.code}-${offerIdx}-${Date.now()}`;
        const offer: FlightOffer = {
          id: offerId,
          supplier: 'sandbox',
          supplierOfferId: `SBOX-OFFER-${airline.code}-${Math.floor(1000 + Math.random() * 9000)}`,
          tripType: params.tripType,
          outboundSegments: [
            {
              id: `seg-out-${offerIdx}`,
              airlineCode: airline.code,
              airlineName: airline.name,
              flightNumber: `${airline.flightPrefix}${300 + offerIdx * 12}`,
              aircraft: airline.aircraft,
              departureAirport: originAirport.code,
              departureCity: originAirport.city,
              departureTime: depTime,
              departureTerminal: isDomestic ? 'Domestic T1' : 'Terminal 1',
              arrivalAirport: destAirport.code,
              arrivalCity: destAirport.city,
              arrivalTime: arrTime,
              arrivalTerminal: destAirport.code === 'DXB' ? 'Terminal 3' : 'Terminal 1',
              durationMinutes: flightDurationMin,
              cabinClass: params.cabinClass,
              checkedBaggage: isDomestic ? '20 kg Check-in' : (params.cabinClass === 'business' ? '40 kg (2 pcs)' : '30 kg (1 pc)'),
              cabinBaggage: '7 kg Hand baggage',
              mealProvided: true
            }
          ],
          totalOutboundDurationMinutes: flightDurationMin,
          stopsOutbound: 0,
          layoversOutbound: [],
          pricing: {
            currency: 'PKR',
            baseFare,
            taxesAirportCharges: taxes,
            supplierSurcharges,
            agencyServiceFee: agencyFee,
            totalAmount: total
          },
          fareConditions: {
            refundable: airline.code !== '9P' && airline.code !== 'PA',
            cancellationPenaltyPKR: isDomestic ? 4000 : 15000,
            changeAllowed: true,
            changePenaltyPKR: isDomestic ? 2500 : 9000,
            seatSelectionIncluded: params.cabinClass !== 'economy',
            mealIncluded: true,
            checkedBaggage: isDomestic ? '20 kg' : '30 kg',
            cabinBaggage: '7 kg',
            fareClassCode: params.cabinClass === 'economy' ? 'Y-Standard' : 'J-Business'
          },
          seatsRemaining: Math.floor(3 + Math.random() * 6),
          validationToken: `VAL-TOKEN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
          isDemoData: true,
          lastUpdated: new Date().toISOString()
        };

        offersCache.set(offer.id, { offer, expiresAt: Date.now() + 1800000 });
        offers.push(offer);
        offerIdx++;
      }

      // Connecting 1-Stop Flight Option for International routes
      if (!isDomestic && !params.directOnly && (airline as any).hub && (airline as any).hub !== destAirport.code) {
        const hub = (airline as any).hub;
        const hubAirport = findAirport(hub) || { code: hub, name: `${hub} Hub Airport`, city: hub, country: '', countryCode: '' };
        const depTime1 = `${dateStr}T${offerIdx % 2 === 0 ? '04:15:00' : '20:10:00'}`;
        const leg1Duration = 180;
        const arrTime1 = new Date(new Date(depTime1).getTime() + leg1Duration * 60000).toISOString();

        const layoverDuration = 120 + (offerIdx * 15); // e.g. 2h 15m layover
        const depTime2 = new Date(new Date(arrTime1).getTime() + layoverDuration * 60000).toISOString();
        const leg2Duration = 360;
        const arrTime2 = new Date(new Date(depTime2).getTime() + leg2Duration * 60000).toISOString();

        const totalDuration = leg1Duration + layoverDuration + leg2Duration;
        const baseFare = Math.round((airline.baseDirect * 1.15) * cabinMultiplier);
        const taxes = Math.round(baseFare * 0.24);
        const supplierSurcharges = Math.round(baseFare * 0.06);
        const agencyFee = 4500;
        const total = baseFare + taxes + supplierSurcharges + agencyFee;

        const offerId = `SND-CONN-${airline.code}-${offerIdx}-${Date.now()}`;
        const offer: FlightOffer = {
          id: offerId,
          supplier: 'sandbox',
          supplierOfferId: `SBOX-OFFER-${airline.code}-${Math.floor(1000 + Math.random() * 9000)}`,
          tripType: params.tripType,
          outboundSegments: [
            {
              id: `seg-leg1-${offerIdx}`,
              airlineCode: airline.code,
              airlineName: airline.name,
              flightNumber: `${airline.flightPrefix}${600 + offerIdx * 5}`,
              aircraft: 'Boeing 777-300ER',
              departureAirport: originAirport.code,
              departureCity: originAirport.city,
              departureTime: depTime1,
              departureTerminal: 'Terminal 1',
              arrivalAirport: hubAirport.code,
              arrivalCity: hubAirport.city,
              arrivalTime: arrTime1,
              arrivalTerminal: 'Terminal 3',
              durationMinutes: leg1Duration,
              cabinClass: params.cabinClass,
              checkedBaggage: '30 kg (1 pc)',
              cabinBaggage: '7 kg Hand baggage',
              mealProvided: true
            },
            {
              id: `seg-leg2-${offerIdx}`,
              airlineCode: airline.code,
              airlineName: airline.name,
              flightNumber: `${airline.flightPrefix}${10 + offerIdx * 3}`,
              aircraft: 'Airbus A350-900',
              departureAirport: hubAirport.code,
              departureCity: hubAirport.city,
              departureTime: depTime2,
              departureTerminal: 'Terminal 3',
              arrivalAirport: destAirport.code,
              arrivalCity: destAirport.city,
              arrivalTime: arrTime2,
              arrivalTerminal: 'Terminal 2',
              durationMinutes: leg2Duration,
              cabinClass: params.cabinClass,
              checkedBaggage: '30 kg (1 pc)',
              cabinBaggage: '7 kg Hand baggage',
              mealProvided: true
            }
          ],
          totalOutboundDurationMinutes: totalDuration,
          stopsOutbound: 1,
          layoversOutbound: [
            {
              airportCode: hubAirport.code,
              airportName: hubAirport.name || `${hubAirport.code} Hub`,
              city: hubAirport.city,
              durationMinutes: layoverDuration
            }
          ],
          pricing: {
            currency: 'PKR',
            baseFare,
            taxesAirportCharges: taxes,
            supplierSurcharges,
            agencyServiceFee: agencyFee,
            totalAmount: total
          },
          fareConditions: {
            refundable: true,
            cancellationPenaltyPKR: 18000,
            changeAllowed: true,
            changePenaltyPKR: 12000,
            seatSelectionIncluded: true,
            mealIncluded: true,
            checkedBaggage: '30 kg Checked Baggage',
            cabinBaggage: '7 kg Cabin Bag',
            fareClassCode: 'M-EconomyFlex'
          },
          seatsRemaining: Math.floor(2 + Math.random() * 5),
          validationToken: `VAL-TOKEN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
          isDemoData: true,
          lastUpdated: new Date().toISOString()
        };

        offersCache.set(offer.id, { offer, expiresAt: Date.now() + 1800000 });
        offers.push(offer);
        offerIdx++;
      }
    }

    return offers;
  }

  async reprice(offerId: string, validationToken: string): Promise<RevalidationResult> {
    const cached = offersCache.get(offerId);
    if (!cached) {
      return {
        valid: false,
        priceChanged: false,
        offer: null as any,
        validationToken: '',
        message: 'The selected flight offer has expired from the reservation system. Please search again to get current inventory.'
      };
    }

    // Refresh token and update validation timestamp
    const refreshedToken = `VAL-RECONFIRMED-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    cached.offer.validationToken = refreshedToken;
    cached.offer.lastUpdated = new Date().toISOString();

    return {
      valid: true,
      priceChanged: false,
      offer: cached.offer,
      validationToken: refreshedToken,
      message: 'Fare confirmed with airline reservation engine. Seat availability locked for 15 minutes.'
    };
  }

  async createBooking(
    offer: FlightOffer,
    passengers: PassengerDetails[],
    contact: { email: string; phone: string; fullName: string }
  ): Promise<{
    supplierBookingReference: string;
    eTicketNumbers: Record<string, string>;
    status: 'ticketed' | 'confirmed';
    isLiveSupplier: boolean;
  }> {
    // Generate genuine-looking PNR and ticket numbers
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let gdsRef = '';
    for (let i = 0; i < 6; i++) {
      gdsRef += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const airlineCode = offer.outboundSegments[0]?.airlineCode || 'PK';
    const airlinePrefixMap: Record<string, string> = {
      PK: '214', // PIA IATA prefix
      EK: '176', // Emirates
      QR: '157', // Qatar Airways
      TK: '235', // Turkish Airlines
      SV: '065', // Saudia
      PA: '788', // Airblue
      '9P': '910', // Fly Jinnah
      BA: '125'  // British Airways
    };
    const prefix = airlinePrefixMap[airlineCode] || '888';

    const eTicketNumbers: Record<string, string> = {};
    passengers.forEach((p, idx) => {
      const serial = Math.floor(1000000000 + Math.random() * 9000000000);
      eTicketNumbers[p.id] = `${prefix}-${serial}`;
    });

    return {
      supplierBookingReference: `${airlineCode}-${gdsRef}`,
      eTicketNumbers,
      status: 'ticketed',
      isLiveSupplier: false
    };
  }

  async cancelBooking(supplierBookingReference: string): Promise<{ success: boolean; message: string; penaltyAmount: number }> {
    return {
      success: true,
      message: `Cancellation processed with supplier. Supplier reference ${supplierBookingReference} voided.`,
      penaltyAmount: 4000
    };
  }
}
