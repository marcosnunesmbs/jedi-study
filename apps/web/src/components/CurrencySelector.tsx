import { useState, createContext, useContext, ReactNode } from 'react';

export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

const CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
];

interface CurrencyContextType {
  currency: Currency;
  customRate: number;
  setCurrency: (c: Currency) => void;
  setCustomRate: (r: number) => void;
}

const CurrencyContext = createContext<CurrencyContextType | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>(CURRENCIES[0]);
  const [customRate, setCustomRate] = useState<number>(1);

  return (
    <CurrencyContext.Provider value={{ currency, customRate, setCurrency, setCustomRate }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
}

export function formatCurrency(value: number, customRate: number): string {
  const { currency } = useCurrency();
  const rate = customRate > 0 ? customRate : 1;
  const converted = value * rate;
  return `${currency.symbol}${converted.toFixed(4)}`;
}

interface CurrencySelectorProps {
  showRate?: boolean;
}

export function CurrencySelector({ showRate = true }: CurrencySelectorProps) {
  const { currency, customRate, setCurrency, setCustomRate } = useCurrency();

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
      <select
        value={currency.code}
        onChange={(e) => {
          const selected = CURRENCIES.find(c => c.code === e.target.value);
          if (selected) setCurrency(selected);
        }}
        style={{
          padding: '0.5rem',
          borderRadius: '0.5rem',
          border: '1px solid var(--border-color)',
          fontSize: '0.875rem',
          backgroundColor: 'var(--surface)',
          color: 'var(--text-slate-900)',
          outline: 'none',
        }}
      >
        {CURRENCIES.map(c => (
          <option key={c.code} value={c.code}>{c.symbol} - {c.name}</option>
        ))}
      </select>
      {showRate && (
        <input
          type="number"
          value={customRate}
          onChange={(e) => setCustomRate(Number(e.target.value))}
          placeholder="Rate"
          min="0.01"
          step="0.01"
          title="Exchange rate to USD"
          style={{
            width: '100px',
            padding: '0.5rem',
            borderRadius: '0.5rem',
            border: '1px solid var(--border-color)',
            fontSize: '0.875rem',
            backgroundColor: 'var(--surface)',
            color: 'var(--text-slate-900)',
            outline: 'none',
          }}
        />
      )}
    </div>
  );
}

export { CURRENCIES };