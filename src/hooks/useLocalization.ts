import { useState, useEffect, useCallback } from 'react';
import { currencies, countries, formatCurrency, Currency, Country } from '@/lib/currencies';

interface LocalizationState {
  currency: string;
  country: string;
  region: string;
}

const STORAGE_KEY = 'statusads_localization';

const defaultState: LocalizationState = {
  currency: 'BRL',
  country: 'BR',
  region: 'south_america',
};

export const useLocalization = () => {
  const [state, setState] = useState<LocalizationState>(() => {
    if (typeof window === 'undefined') return defaultState;
    
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return defaultState;
      }
    }
    return defaultState;
  });

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
