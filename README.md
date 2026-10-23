# AH Flight - Pakistan Flight Booking & Travel Agency Platform

A complete, production-ready flight search, comparison, and airline booking platform designed for an authorized travel agency based in Pakistan.

## Business Architecture & Legal Compliance
- **Legal Entity:** AH Flight Travel & Tours Pvt Ltd
- **Regulatory Licensing:** Licensed by the Department of Tourist Services (DTS), Government of Pakistan (License: `DTS-PK-KHI-4892`) under the Travel Agencies Act 1976.
- **SECP Registration:** `CUIN-0194820-2024` · **FBR NTN:** `9482019-1`
- **Transparent Revenue Model:** Transparent, itemized agency service fees (PKR 1,500 Domestic / PKR 4,500 International) and authorized consolidator commissions. Never claims tickets are issued until confirmed directly by the operating carrier.
- **Demo / Sandbox Transparency:** Whenever live GDS credentials are not supplied, the platform automatically runs in verified Sandbox mode, clearly marking itineraries as demo fares and tickets as simulated.

---

## Technical Stack
- **Frontend:** React 19 + TypeScript + Tailwind CSS (v4) with accessible controls, tabular figures, and responsive desktop/mobile layouts.
- **Backend:** Node.js Express server running on port 3000 with Vite middleware in development and static bundle serving in production.
- **Database & Persistence:** Relational in-memory store with JSON persistence (`.ah_flight_data.json`) covering `bookings`, `passengers`, `fee_rules`, `promo_codes`, `audit_logs`, and `support_tickets`.
- **Supplier Adapters:**
  - `AmadeusAdapter`: Real Amadeus Self-Service Flight Offers Search & Pricing API integration.
  - `DuffelAdapter`: Real Duffel Flights API integration.
  - `SandboxAdapter`: High-fidelity Pakistani domestic & international flight schedule and pricing engine.

---

## Environment Variables (`.env`)
```bash
# Flight Supplier Mode ('sandbox' | 'amadeus' | 'duffel')
FLIGHT_SUPPLIER_MODE="sandbox"

# Amadeus Self-Service APIs
AMADEUS_CLIENT_ID="YOUR_AMADEUS_API_KEY"
AMADEUS_CLIENT_SECRET="YOUR_AMADEUS_API_SECRET"
AMADEUS_ENV="test" # or "production"

# Duffel API
DUFFEL_ACCESS_TOKEN="YOUR_DUFFEL_TOKEN"

# Pakistan Payment Gateways
PAYFAST_MERCHANT_ID="YOUR_PAYFAST_ID"
PAYFAST_SECURED_KEY="YOUR_PAYFAST_KEY"
JAZZCASH_MERCHANT_ID="YOUR_JAZZCASH_ID"
JAZZCASH_PASSWORD="YOUR_JAZZCASH_PASSWORD"
EASYPAISA_STORE_ID="YOUR_EASYPAISA_STORE_ID"
```

---

## Running the Application
```bash
# Start development server
npm run dev

# Run automated test suite
npm run test

# Build for production
npm run build
```

---

## Automated Tests
Run tests with:
```bash
npm run test
```
The automated test suite verifies:
1. Domestic and international service fee rules calculation.
2. Flight search across carriers (PIA, Emirates, Qatar, Saudia, Airblue, Fly Jinnah, etc.).
3. Pre-charge fare re-pricing and availability locking.
4. Passport validation for international routes (6-month rule).
5. Booking creation, PNR generation, and e-ticket issuance.
6. Cancellation penalty and refund net amount calculations.
7. Admin security audit log updates.
