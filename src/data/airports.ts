import { Airport } from '../types/flight';

export const AIRPORTS: Airport[] = [
  // Major Pakistan Airports
  { code: 'KHI', name: 'Jinnah International Airport', city: 'Karachi', country: 'Pakistan', countryCode: 'PK', isDomesticPakistan: true },
  { code: 'LHE', name: 'Allama Iqbal International Airport', city: 'Lahore', country: 'Pakistan', countryCode: 'PK', isDomesticPakistan: true },
  { code: 'ISB', name: 'Islamabad International Airport', city: 'Islamabad', country: 'Pakistan', countryCode: 'PK', isDomesticPakistan: true },
  { code: 'PEW', name: 'Bacha Khan International Airport', city: 'Peshawar', country: 'Pakistan', countryCode: 'PK', isDomesticPakistan: true },
  { code: 'MUX', name: 'Multan International Airport', city: 'Multan', country: 'Pakistan', countryCode: 'PK', isDomesticPakistan: true },
  { code: 'SKT', name: 'Sialkot International Airport', city: 'Sialkot', country: 'Pakistan', countryCode: 'PK', isDomesticPakistan: true },
  { code: 'UET', name: 'Quetta International Airport', city: 'Quetta', country: 'Pakistan', countryCode: 'PK', isDomesticPakistan: true },
  { code: 'FSD', name: 'Faisalabad International Airport', city: 'Faisalabad', country: 'Pakistan', countryCode: 'PK', isDomesticPakistan: true },
  { code: 'KDU', name: 'Skardu Airport', city: 'Skardu', country: 'Pakistan', countryCode: 'PK', isDomesticPakistan: true },
  { code: 'GIL', name: 'Gilgit Airport', city: 'Gilgit', country: 'Pakistan', countryCode: 'PK', isDomesticPakistan: true },
  { code: 'GWD', name: 'Gwadar International Airport', city: 'Gwadar', country: 'Pakistan', countryCode: 'PK', isDomesticPakistan: true },
  { code: 'RYK', name: 'Shaikh Zayed International Airport', city: 'Rahim Yar Khan', country: 'Pakistan', countryCode: 'PK', isDomesticPakistan: true },

  // Key Middle East & Gulf Hubs
  { code: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'United Arab Emirates', countryCode: 'AE' },
  { code: 'SHJ', name: 'Sharjah International Airport', city: 'Sharjah', country: 'United Arab Emirates', countryCode: 'AE' },
  { code: 'AUH', name: 'Zayed International Airport', city: 'Abu Dhabi', country: 'United Arab Emirates', countryCode: 'AE' },
  { code: 'DOH', name: 'Hamad International Airport', city: 'Doha', country: 'Qatar', countryCode: 'QA' },
  { code: 'JED', name: 'King Abdulaziz International Airport (Hajj/Umrah)', city: 'Jeddah', country: 'Saudi Arabia', countryCode: 'SA' },
  { code: 'MED', name: 'Prince Mohammad Bin Abdulaziz Airport', city: 'Madinah', country: 'Saudi Arabia', countryCode: 'SA' },
  { code: 'RUH', name: 'King Khalid International Airport', city: 'Riyadh', country: 'Saudi Arabia', countryCode: 'SA' },
  { code: 'DMM', name: 'King Fahd International Airport', city: 'Dammam', country: 'Saudi Arabia', countryCode: 'SA' },
  { code: 'MCT', name: 'Muscat International Airport', city: 'Muscat', country: 'Oman', countryCode: 'OM' },
  { code: 'BAH', name: 'Bahrain International Airport', city: 'Manama', country: 'Bahrain', countryCode: 'BH' },
  { code: 'KWI', name: 'Kuwait International Airport', city: 'Kuwait City', country: 'Kuwait', countryCode: 'KW' },

  // Key Europe, UK, Turkey & North America Hubs
  { code: 'IST', name: 'Istanbul Airport', city: 'Istanbul', country: 'Turkey', countryCode: 'TR' },
  { code: 'SAW', name: 'Sabiha Gokcen Airport', city: 'Istanbul', country: 'Turkey', countryCode: 'TR' },
  { code: 'LHR', name: 'Heathrow Airport', city: 'London', country: 'United Kingdom', countryCode: 'GB' },
  { code: 'MAN', name: 'Manchester Airport', city: 'Manchester', country: 'United Kingdom', countryCode: 'GB' },
  { code: 'BHX', name: 'Birmingham Airport', city: 'Birmingham', country: 'United Kingdom', countryCode: 'GB' },
  { code: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France', countryCode: 'FR' },
  { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany', countryCode: 'DE' },
  { code: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York', country: 'United States', countryCode: 'US' },
  { code: 'ORD', name: 'O\'Hare International Airport', city: 'Chicago', country: 'United States', countryCode: 'US' },
  { code: 'YYZ', name: 'Toronto Pearson International Airport', city: 'Toronto', country: 'Canada', countryCode: 'CA' },

  // Asia Pacific
  { code: 'BKK', name: 'Suvarnabhumi Airport', city: 'Bangkok', country: 'Thailand', countryCode: 'TH' },
  { code: 'KUL', name: 'Kuala Lumpur International Airport', city: 'Kuala Lumpur', country: 'Malaysia', countryCode: 'MY' },
  { code: 'SIN', name: 'Singapore Changi Airport', city: 'Singapore', country: 'Singapore', countryCode: 'SG' }
];

export function findAirport(code: string): Airport | undefined {
  return AIRPORTS.find(a => a.code.toUpperCase() === code.toUpperCase());
}

export function searchAirports(query: string): Airport[] {
  if (!query || query.trim() === '') return AIRPORTS.slice(0, 8);
  const q = query.toLowerCase().trim();
  return AIRPORTS.filter(
    a =>
      a.code.toLowerCase().includes(q) ||
      a.city.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q) ||
      a.country.toLowerCase().includes(q)
  );
}
