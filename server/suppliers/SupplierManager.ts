import { FlightSupplierAdapter } from './FlightSupplierAdapter';
import { SandboxAdapter } from './SandboxAdapter';
import { AmadeusAdapter } from './AmadeusAdapter';
import { DuffelAdapter } from './DuffelAdapter';
import { FlightSearchParams, FlightOffer, RevalidationResult } from '../../src/types/flight';
import { PassengerDetails } from '../../src/types/booking';

export class SupplierManager {
  private sandbox: SandboxAdapter;
  private amadeus: AmadeusAdapter;
  private duffel: DuffelAdapter;
  private currentMode: 'sandbox' | 'amadeus' | 'duffel';

  constructor() {
    this.sandbox = new SandboxAdapter();
    this.amadeus = new AmadeusAdapter();
    this.duffel = new DuffelAdapter();
    this.currentMode = (process.env.FLIGHT_SUPPLIER_MODE as any) || 'sandbox';
  }

  getActiveSupplier(): FlightSupplierAdapter {
    if (this.currentMode === 'amadeus' && this.amadeus.isReady()) {
      return this.amadeus;
    }
    if (this.currentMode === 'duffel' && this.duffel.isReady()) {
      return this.duffel;
    }
    // Default safe fallback to Sandbox
    return this.sandbox;
  }

  setSupplierMode(mode: 'sandbox' | 'amadeus' | 'duffel') {
    this.currentMode = mode;
  }

  getStatus() {
    return {
      currentMode: this.currentMode,
      activeSupplierName: this.getActiveSupplier().supplierName,
      isLiveSupplier: this.getActiveSupplier().supplierId !== 'sandbox',
      amadeusConfigured: this.amadeus.isReady(),
      duffelConfigured: this.duffel.isReady(),
      sandboxReady: true
    };
  }

  async searchFlights(params: FlightSearchParams): Promise<{
    offers: FlightOffer[];
    supplierId: string;
    isDemo: boolean;
    disclaimer: string;
  }> {
    const supplier = this.getActiveSupplier();
    let offers: FlightOffer[] = [];
    let isDemo = supplier.supplierId === 'sandbox';
    let disclaimer = '';

    try {
      offers = await supplier.search(params);
    } catch (err: any) {
      console.warn(`[SupplierManager] Primary supplier (${supplier.supplierId}) search failed: ${err.message}. Falling back to Sandbox.`);
      offers = await this.sandbox.search(params);
      isDemo = true;
      disclaimer = `Notice: Primary supplier ${supplier.supplierName} was unavailable (${err.message}). Results served from AH Flight Sandbox environment.`;
    }

    if (isDemo && !disclaimer) {
      disclaimer = 'Sandbox Environment: Demonstrating real-world Pakistan flight routes, inventory, and fares. Live airline ticket issuance requires verified GDS/supplier credentials.';
    }

    return {
      offers,
      supplierId: supplier.supplierId,
      isDemo,
      disclaimer
    };
  }

  async repriceOffer(offerId: string, validationToken: string, supplierId: string): Promise<RevalidationResult> {
    if (offerId.startsWith('AMAD-') && this.amadeus.isReady()) {
      return this.amadeus.reprice(offerId, validationToken);
    }
    return this.sandbox.reprice(offerId, validationToken);
  }

  async createBooking(
    offer: FlightOffer,
    passengers: PassengerDetails[],
    contact: { email: string; phone: string; fullName: string }
  ) {
    if (offer.supplier === 'amadeus' && this.amadeus.isReady()) {
      return this.amadeus.createBooking(offer, passengers, contact);
    }
    return this.sandbox.createBooking(offer, passengers, contact);
  }
}

export const supplierManager = new SupplierManager();
