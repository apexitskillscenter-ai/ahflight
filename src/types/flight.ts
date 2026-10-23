export type CabinClass = 'economy' | 'premium_economy' | 'business' | 'first';

export type TripType = 'one-way' | 'round-trip' | 'multi-city';

export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
  countryCode: string;
  isDomesticPakistan?: boolean;
}

export interface FlightSegment {
  id: string;
  airlineCode: string;
  airlineName: string;
  flightNumber: string;
  aircraft: string;
  departureAirport: string;
  departureCity: string;
  departureTime: string; // ISO
  departureTerminal?: string;
  arrivalAirport: string;
  arrivalCity: string;
  arrivalTime: string; // ISO
  arrivalTerminal?: string;
  durationMinutes: number;
  cabinClass: CabinClass;
  checkedBaggage: string;
  cabinBaggage: string;
  mealProvided: boolean;
}

export interface LayoverInfo {
  airportCode: string;
  airportName: string;
  city: string;
  durationMinutes: number;
}

export interface FlightOffer {
  id: string;
  supplier: 'sandbox' | 'amadeus' | 'duffel';
  supplierOfferId: string;
  tripType: TripType;
  outboundSegments: FlightSegment[];
  inboundSegments?: FlightSegment[];
  totalOutboundDurationMinutes: number;
  totalInboundDurationMinutes?: number;
  stopsOutbound: number;
  stopsInbound?: number;
  layoversOutbound: LayoverInfo[];
  layoversInbound?: LayoverInfo[];
  pricing: {
    currency: string; // e.g. 'PKR'
    baseFare: number;
    taxesAirportCharges: number;
    supplierSurcharges: number;
    agencyServiceFee: number;
    totalAmount: number;
  };
  fareConditions: {
    refundable: boolean;
    cancellationPenaltyPKR: number;
    changeAllowed: boolean;
    changePenaltyPKR: number;
    seatSelectionIncluded: boolean;
    mealIncluded: boolean;
    checkedBaggage: string;
    cabinBaggage: string;
    fareClassCode: string;
  };
  seatsRemaining: number;
  validationToken: string;
  isDemoData: boolean;
  lastUpdated: string;
}

export interface FlightSearchParams {
  tripType: TripType;
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  children: number;
  infants: number;
  cabinClass: CabinClass;
  directOnly?: boolean;
}

export interface RevalidationResult {
  valid: boolean;
  priceChanged: boolean;
  oldPrice?: number;
  newPrice?: number;
  offer: FlightOffer;
  validationToken: string;
  message?: string;
}
