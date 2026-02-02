import React, { createContext, useContext, ReactNode } from 'react';
import { useLocalization } from '@/hooks/useLocalization';
import { Currency, Country } from '@/lib/currencies';

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

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

export const LocalizationProvider = ({ children }: { children: ReactNode }) => {
  const localization = useLocalization();

  return (
    <LocalizationContext.Provider value={localization}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalizationContext = () => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useLocalizationContext must be used within a LocalizationProvider');
  }
  return context;
};
