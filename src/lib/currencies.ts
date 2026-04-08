export interface Currency {
  code: string;
  symbol: string;
  name: string;
  locale: string;
}

export interface Country {
  code: string;
  name: string;
  nameEn: string;
  currency: string;
  region: string;
  flag: string;
}

export const currencies: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
  { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE' },
  { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
  { code: 'BRL', symbol: 'R$', name: 'Real Brasileiro', locale: 'pt-BR' },
  { code: 'MZN', symbol: 'MT', name: 'Metical Moçambicano', locale: 'pt-MZ' },
  { code: 'AOA', symbol: 'Kz', name: 'Kwanza Angolano', locale: 'pt-AO' },
  { code: 'ARS', symbol: '$', name: 'Peso Argentino', locale: 'es-AR' },
  { code: 'MXN', symbol: '$', name: 'Peso Mexicano', locale: 'es-MX' },
  { code: 'COP', symbol: '$', name: 'Peso Colombiano', locale: 'es-CO' },
  { code: 'PEN', symbol: 'S/', name: 'Sol Peruano', locale: 'es-PE' },
  { code: 'CLP', symbol: '$', name: 'Peso Chileno', locale: 'es-CL' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', locale: 'en-ZA' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', locale: 'en-NG' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', locale: 'en-KE' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', locale: 'en-CA' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU' },
];

export const countries: Country[] = [
  // América do Sul
  { code: 'BR', name: 'Brasil', nameEn: 'Brazil', currency: 'BRL', region: 'south_america', flag: '🇧🇷' },
  { code: 'AR', name: 'Argentina', nameEn: 'Argentina', currency: 'ARS', region: 'south_america', flag: '🇦🇷' },
  { code: 'CL', name: 'Chile', nameEn: 'Chile', currency: 'CLP', region: 'south_america', flag: '🇨🇱' },
  { code: 'CO', name: 'Colômbia', nameEn: 'Colombia', currency: 'COP', region: 'south_america', flag: '🇨🇴' },
  { code: 'PE', name: 'Peru', nameEn: 'Peru', currency: 'PEN', region: 'south_america', flag: '🇵🇪' },
  { code: 'UY', name: 'Uruguai', nameEn: 'Uruguay', currency: 'USD', region: 'south_america', flag: '🇺🇾' },
  { code: 'PY', name: 'Paraguai', nameEn: 'Paraguay', currency: 'USD', region: 'south_america', flag: '🇵🇾' },
  { code: 'BO', name: 'Bolívia', nameEn: 'Bolivia', currency: 'USD', region: 'south_america', flag: '🇧🇴' },
  { code: 'EC', name: 'Equador', nameEn: 'Ecuador', currency: 'USD', region: 'south_america', flag: '🇪🇨' },
  { code: 'VE', name: 'Venezuela', nameEn: 'Venezuela', currency: 'USD', region: 'south_america', flag: '🇻🇪' },
  
  // América do Norte e Central
  { code: 'US', name: 'Estados Unidos', nameEn: 'United States', currency: 'USD', region: 'north_america', flag: '🇺🇸' },
  { code: 'MX', name: 'México', nameEn: 'Mexico', currency: 'MXN', region: 'north_america', flag: '🇲🇽' },
  { code: 'CA', name: 'Canadá', nameEn: 'Canada', currency: 'CAD', region: 'north_america', flag: '🇨🇦' },
  
  // Europa
  { code: 'PT', name: 'Portugal', nameEn: 'Portugal', currency: 'EUR', region: 'europe', flag: '🇵🇹' },
  { code: 'ES', name: 'Espanha', nameEn: 'Spain', currency: 'EUR', region: 'europe', flag: '🇪🇸' },
  { code: 'FR', name: 'França', nameEn: 'France', currency: 'EUR', region: 'europe', flag: '🇫🇷' },
  { code: 'DE', name: 'Alemanha', nameEn: 'Germany', currency: 'EUR', region: 'europe', flag: '🇩🇪' },
  { code: 'IT', name: 'Itália', nameEn: 'Italy', currency: 'EUR', region: 'europe', flag: '🇮🇹' },
  { code: 'GB', name: 'Reino Unido', nameEn: 'United Kingdom', currency: 'GBP', region: 'europe', flag: '🇬🇧' },
  
  // África
  { code: 'MZ', name: 'Moçambique', nameEn: 'Mozambique', currency: 'MZN', region: 'africa', flag: '🇲🇿' },
  { code: 'AO', name: 'Angola', nameEn: 'Angola', currency: 'AOA', region: 'africa', flag: '🇦🇴' },
  { code: 'CV', name: 'Cabo Verde', nameEn: 'Cape Verde', currency: 'EUR', region: 'africa', flag: '🇨🇻' },
  { code: 'GW', name: 'Guiné-Bissau', nameEn: 'Guinea-Bissau', currency: 'EUR', region: 'africa', flag: '🇬🇼' },
  { code: 'ST', name: 'São Tomé e Príncipe', nameEn: 'São Tomé and Príncipe', currency: 'EUR', region: 'africa', flag: '🇸🇹' },
  { code: 'ZA', name: 'África do Sul', nameEn: 'South Africa', currency: 'ZAR', region: 'africa', flag: '🇿🇦' },
  { code: 'NG', name: 'Nigéria', nameEn: 'Nigeria', currency: 'NGN', region: 'africa', flag: '🇳🇬' },
  { code: 'KE', name: 'Quénia', nameEn: 'Kenya', currency: 'KES', region: 'africa', flag: '🇰🇪' },

  // Ásia-Pacífico
  { code: 'IN', name: 'Índia', nameEn: 'India', currency: 'INR', region: 'asia_pacific', flag: '🇮🇳' },
  { code: 'AU', name: 'Austrália', nameEn: 'Australia', currency: 'AUD', region: 'asia_pacific', flag: '🇦🇺' },
];

export const regions = [
  { code: 'south_america', name: 'América do Sul', nameEn: 'South America' },
  { code: 'north_america', name: 'América do Norte', nameEn: 'North America' },
  { code: 'europe', name: 'Europa', nameEn: 'Europe' },
  { code: 'africa', name: 'África', nameEn: 'Africa' },
  { code: 'asia_pacific', name: 'Ásia-Pacífico', nameEn: 'Asia-Pacific' },
];

export const formatCurrency = (
  amount: number,
  currencyCode: string = 'USD',
  locale: string = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const getCurrencyByCode = (code: string): Currency | undefined => {
  return currencies.find(c => c.code === code);
};

export const getCountryByCode = (code: string): Country | undefined => {
  return countries.find(c => c.code === code);
};

export const getCountriesByRegion = (regionCode: string): Country[] => {
  return countries.filter(c => c.region === regionCode);
};
