import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useLocalization } from '@/hooks/useLocalization';
import { Currency, Country, currencies, countries, formatCurrency } from '@/lib/currencies';

interface LocalizationContextType {
  currency: string;
  country: string;
  region: string;
  setCurrency: (code: string) => void;
  setCountry: (code: string) => void;
  setRegion: (code: string) => void;
  format: (amount: number) => string;
  getCurrentCurrency: () => Currency | undefined;
  getCurrentCountry: () => Country | undefined;
  currencies: Currency[];
  countries: Country[];
}

// Default fallback context for SSR/HMR safety
const defaultContext: LocalizationContextType = {
  currency: 'BRL',
  country: 'BR',
  region: 'south_america',
  setCurrency: () => {},
  setCountry: () => {},
  setRegion: () => {},
  format: (amount: number) => formatCurrency(amount, 'BRL', 'pt-BR'),
  getCurrentCurrency: () => currencies.find(c => c.code === 'BRL'),
  getCurrentCountry: () => countries.find(c => c.code === 'BR'),
  currencies,
  countries,
};

const LocalizationContext = createContext<LocalizationContextType>(defaultContext);

export const LocalizationProvider = ({ children }: { children: ReactNode }) => {
  const localization = useLocalization();

  const value = useMemo(() => localization, [
    localization.currency,
    localization.country,
    localization.region,
    localization.format,
    localization.setCurrency,
    localization.setCountry,
    localization.setRegion,
    localization.getCurrentCurrency,
    localization.getCurrentCountry,
  ]);

  return (
    <LocalizationContext.Provider value={value}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalizationContext = () => useContext(LocalizationContext);
