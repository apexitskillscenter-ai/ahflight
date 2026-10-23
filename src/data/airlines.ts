export interface Airline {
  code: string;
  name: string;
  country: string;
  logoBg: string;
  accentColor: string;
}

export const AIRLINES: Record<string, Airline> = {
  PK: { code: 'PK', name: 'Pakistan International Airlines (PIA)', country: 'Pakistan', logoBg: '#0b522c', accentColor: '#c5a059' },
  EK: { code: 'EK', name: 'Emirates', country: 'United Arab Emirates', logoBg: '#d71921', accentColor: '#ffffff' },
  QR: { code: 'QR', name: 'Qatar Airways', country: 'Qatar', logoBg: '#5c0632', accentColor: '#ffffff' },
  TK: { code: 'TK', name: 'Turkish Airlines', country: 'Turkey', logoBg: '#e81932', accentColor: '#ffffff' },
  SV: { code: 'SV', name: 'Saudia', country: 'Saudi Arabia', logoBg: '#006a4e', accentColor: '#caa250' },
  PA: { code: 'PA', name: 'Airblue', country: 'Pakistan', logoBg: '#002b66', accentColor: '#00a3e0' },
  '9P': { code: '9P', name: 'Fly Jinnah', country: 'Pakistan', logoBg: '#e60000', accentColor: '#ffffff' },
  ER: { code: 'ER', name: 'SereneAir', country: 'Pakistan', logoBg: '#0f3c5f', accentColor: '#dca42b' },
  FZ: { code: 'FZ', name: 'flydubai', country: 'United Arab Emirates', logoBg: '#f26829', accentColor: '#004b87' },
  G9: { code: 'G9', name: 'Air Arabia', country: 'United Arab Emirates', logoBg: '#e01e26', accentColor: '#ffffff' },
  GF: { code: 'GF', name: 'Gulf Air', country: 'Bahrain', logoBg: '#8c734b', accentColor: '#1d252c' },
  BA: { code: 'BA', name: 'British Airways', country: 'United Kingdom', logoBg: '#075aaa', accentColor: '#eb2226' }
};

export function getAirlineInfo(code: string): Airline {
  return AIRLINES[code.toUpperCase()] || {
    code: code.toUpperCase(),
    name: `${code.toUpperCase()} Airways`,
    country: 'International',
    logoBg: '#1e293b',
    accentColor: '#38bdf8'
  };
}
