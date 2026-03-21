import { useCurrency } from '../components/CurrencySelector';

export const AGENT_LABELS: Record<string, string> = {
  PATH_GENERATOR: 'Path Generator',
  CONTENT_GEN: 'Content Gen',
  TASK_ANALYZER: 'Task Analyzer',
  PROJECT_ANALYZER: 'Project Analyzer',
  SAFETY: 'Safety',
};

export function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

export function formatCurrency(value: number, customRate: number): string {
  const { currency } = useCurrency();
  const rate = customRate > 0 ? customRate : 1;
  const converted = value * rate;
  return `${currency.symbol}${converted.toFixed(currency.code === 'USD' ? 4 : 2)}`;
}