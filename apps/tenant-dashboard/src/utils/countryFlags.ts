// Comprehensive country code to flag emoji mapping
// Supports ISO 3166-1 alpha-2 country codes

export const COUNTRY_FLAGS: Record<string, string> = {
  // Europe
  TR: '🇹🇷', // Turkey
  DE: '🇩🇪', // Germany
  GB: '🇬🇧', // United Kingdom
  FR: '🇫🇷', // France
  IT: '🇮🇹', // Italy
  ES: '🇪🇸', // Spain
  NL: '🇳🇱', // Netherlands
  BE: '🇧🇪', // Belgium
  CH: '🇨🇭', // Switzerland
  AT: '🇦🇹', // Austria
  PL: '🇵🇱', // Poland
  SE: '🇸🇪', // Sweden
  NO: '🇳🇴', // Norway
  DK: '🇩🇰', // Denmark
  FI: '🇫🇮', // Finland
  IE: '🇮🇪', // Ireland
  PT: '🇵🇹', // Portugal
  GR: '🇬🇷', // Greece
  CZ: '🇨🇿', // Czech Republic
  RO: '🇷🇴', // Romania
  HU: '🇭🇺', // Hungary
  BG: '🇧🇬', // Bulgaria
  HR: '🇭🇷', // Croatia
  RS: '🇷🇸', // Serbia
  UA: '🇺🇦', // Ukraine
  RU: '🇷🇺', // Russia

  // Americas
  US: '🇺🇸', // United States
  CA: '🇨🇦', // Canada
  MX: '🇲🇽', // Mexico
  BR: '🇧🇷', // Brazil
  AR: '🇦🇷', // Argentina
  CL: '🇨🇱', // Chile
  CO: '🇨🇴', // Colombia
  PE: '🇵🇪', // Peru
  VE: '🇻🇪', // Venezuela

  // Asia
  JP: '🇯🇵', // Japan
  CN: '🇨🇳', // China
  KR: '🇰🇷', // South Korea
  IN: '🇮🇳', // India
  ID: '🇮🇩', // Indonesia
  TH: '🇹🇭', // Thailand
  VN: '🇻🇳', // Vietnam
  PH: '🇵🇭', // Philippines
  MY: '🇲🇾', // Malaysia
  SG: '🇸🇬', // Singapore
  PK: '🇵🇰', // Pakistan
  BD: '🇧🇩', // Bangladesh
  SA: '🇸🇦', // Saudi Arabia
  AE: '🇦🇪', // UAE
  IL: '🇮🇱', // Israel
  IQ: '🇮🇶', // Iraq
  IR: '🇮🇷', // Iran

  // Oceania
  AU: '🇦🇺', // Australia
  NZ: '🇳🇿', // New Zealand

  // Africa
  ZA: '🇿🇦', // South Africa
  EG: '🇪🇬', // Egypt
  NG: '🇳🇬', // Nigeria
  KE: '🇰🇪', // Kenya
  MA: '🇲🇦', // Morocco
  DZ: '🇩🇿', // Algeria
  TN: '🇹🇳', // Tunisia
};

// Country name to code mapping (for normalization)
export const COUNTRY_NAME_TO_CODE: Record<string, string> = {
  'turkey': 'TR',
  'türkiye': 'TR',
  'germany': 'DE',
  'almanya': 'DE',
  'united states': 'US',
  'usa': 'US',
  'amerika': 'US',
  'united kingdom': 'GB',
  'uk': 'GB',
  'ingiltere': 'GB',
  'france': 'FR',
  'fransa': 'FR',
  'italy': 'IT',
  'italya': 'IT',
  'spain': 'ES',
  'ispanya': 'ES',
  'netherlands': 'NL',
  'hollanda': 'NL',
};

/**
 * Get country flag emoji from country code or name
 * @param country - Country code (e.g., "TR") or name (e.g., "Turkey")
 * @returns Flag emoji or default globe
 */
export function getCountryFlag(country: string): string {
  if (!country) return '🌍';

  // Try direct code lookup (already uppercase)
  const upperCountry = country.toUpperCase();
  if (COUNTRY_FLAGS[upperCountry]) {
    return COUNTRY_FLAGS[upperCountry];
  }

  // Try name to code mapping
  const lowerCountry = country.toLowerCase();
  const code = COUNTRY_NAME_TO_CODE[lowerCountry];
  if (code && COUNTRY_FLAGS[code]) {
    return COUNTRY_FLAGS[code];
  }

  // Default to globe
  return '🌍';
}

/**
 * Normalize country to code format
 * @param country - Country code or name
 * @returns Normalized country code (e.g., "TR")
 */
export function normalizeCountryCode(country: string): string {
  if (!country) return '';

  // If already a valid code, return it
  const upperCountry = country.toUpperCase();
  if (COUNTRY_FLAGS[upperCountry]) {
    return upperCountry;
  }

  // Try name to code mapping
  const lowerCountry = country.toLowerCase();
  const code = COUNTRY_NAME_TO_CODE[lowerCountry];
  if (code) {
    return code;
  }

  // Return as-is if no mapping found
  return upperCountry;
}
