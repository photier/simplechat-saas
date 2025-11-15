// Country code to flag emoji mapping
const countryFlags: Record<string, string> = {
  TR: '🇹🇷',
  US: '🇺🇸',
  DE: '🇩🇪',
  GB: '🇬🇧',
  FR: '🇫🇷',
  IT: '🇮🇹',
  ES: '🇪🇸',
  NL: '🇳🇱',
  PK: '🇵🇰',
  IN: '🇮🇳',
  CN: '🇨🇳',
  JP: '🇯🇵',
  KR: '🇰🇷',
  BR: '🇧🇷',
  MX: '🇲🇽',
  CA: '🇨🇦',
  AU: '🇦🇺',
  RU: '🇷🇺',
  SA: '🇸🇦',
  AE: '🇦🇪',
};

export const getCountryFlag = (countryCode: string): string => {
  return countryFlags[countryCode.toUpperCase()] || '🌍';
};
