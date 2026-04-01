import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { currencies, countries, formatCurrency, Currency, Country } from '@/lib/currencies';

interface LocalizationState {
  currency: string;
  country: string;
  region: string;
}

const STORAGE_KEY = 'statusads_localization';

const detectUserLocale = (): LocalizationState => {
  const lang = navigator.language || 'pt-BR';
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';

  // Map timezone/language to country
  const tzCountryMap: Record<string, string> = {
    'America/Sao_Paulo': 'BR', 'America/Fortaleza': 'BR', 'America/Recife': 'BR',
    'America/Bahia': 'BR', 'America/Belem': 'BR', 'America/Manaus': 'BR',
    'America/New_York': 'US', 'America/Chicago': 'US', 'America/Denver': 'US',
    'America/Los_Angeles': 'US', 'America/Argentina/Buenos_Aires': 'AR',
    'America/Santiago': 'CL', 'America/Bogota': 'CO', 'America/Lima': 'PE',
    'America/Mexico_City': 'MX', 'America/Montevideo': 'UY',
    'Europe/Lisbon': 'PT', 'Europe/Madrid': 'ES', 'Europe/Paris': 'FR',
    'Europe/Berlin': 'DE', 'Europe/Rome': 'IT', 'Europe/London': 'GB',
    'Africa/Maputo': 'MZ', 'Africa/Luanda': 'AO',
    'America/Toronto': 'CA',
  };

  const langCountryMap: Record<string, string> = {
    'pt-BR': 'BR', 'pt-PT': 'PT', 'pt-MZ': 'MZ', 'pt-AO': 'AO', 'pt': 'BR',
    'en-US': 'US', 'en-GB': 'GB', 'en': 'US',
    'es-ES': 'ES', 'es-AR': 'AR', 'es-MX': 'MX', 'es-CO': 'CO', 'es-CL': 'CL',
    'es-PE': 'PE', 'es': 'ES',
    'fr': 'FR', 'de': 'DE', 'it': 'IT',
  };

  const detectedCode = tzCountryMap[tz] || langCountryMap[lang] || 'BR';
  const country = countries.find(c => c.code === detectedCode);

  return {
    currency: country?.currency || 'BRL',
    country: detectedCode,
    region: country?.region || 'south_america',
  };
};

export const useLocalization = () => {
  const { i18n } = useTranslation();

  const [state, setState] = useState<LocalizationState>(() => {
    if (typeof window === 'undefined') return { currency: 'BRL', country: 'BR', region: 'south_america' };

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try { return JSON.parse(stored); } catch { /* fall through */ }
    }

    return detectUserLocale();
  });

  // Auto-set i18n language on first load based on detected locale
  useEffect(() => {
    const stored = localStorage.getItem('statusads_language');
    if (!stored) {
      const lang = navigator.language || 'pt-BR';
      const supported = ['pt-BR', 'en-US', 'es-ES'];
      const match = supported.find(s => lang.startsWith(s.split('-')[0]));
      if (match) i18n.changeLanguage(match);
    }
  }, [i18n]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const setCurrency = useCallback((currencyCode: string) => {
    setState(prev => ({ ...prev, currency: currencyCode }));
  }, []);

  const setCountry = useCallback((countryCode: string) => {
    const country = countries.find(c => c.code === countryCode);
    if (country) {
      setState(prev => ({
        ...prev,
        country: countryCode,
        region: country.region,
        currency: country.currency,
      }));
    }
  }, []);

  const setRegion = useCallback((regionCode: string) => {
    setState(prev => ({ ...prev, region: regionCode }));
  }, []);

  const format = useCallback((amount: number): string => {
    const currency = currencies.find(c => c.code === state.currency);
    return formatCurrency(amount, state.currency, currency?.locale || 'pt-BR');
  }, [state.currency]);

  const getCurrentCurrency = useCallback((): Currency | undefined => {
    return currencies.find(c => c.code === state.currency);
  }, [state.currency]);

  const getCurrentCountry = useCallback((): Country | undefined => {
    return countries.find(c => c.code === state.country);
  }, [state.country]);

  return {
    currency: state.currency,
    country: state.country,
    region: state.region,
    setCurrency,
    setCountry,
    setRegion,
    format,
    getCurrentCurrency,
    getCurrentCountry,
    currencies,
    countries,
  };
};
