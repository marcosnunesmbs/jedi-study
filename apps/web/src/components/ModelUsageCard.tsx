import { Cpu } from 'lucide-react';
import { formatNumber, formatCurrency } from '../utils/format';
import { useCurrency } from './CurrencySelector';

export interface ModelUsageStats {
  calls: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens?: number;
  totalCostUsd: number;
}

interface ModelUsageCardProps {
  modelName: string;
  stats: ModelUsageStats;
}

export function ModelUsageCard({ modelName, stats }: ModelUsageCardProps) {
  const { customRate } = useCurrency();

  return (
    <div className="card" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{
          padding: '0.5rem',
          backgroundColor: 'var(--surface)',
          color: 'var(--primary)',
          borderRadius: '0.5rem'
        }}>
          <Cpu size={20} />
        </div>
        <div>
          <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-slate-900)' }}>
            {modelName}
          </h4>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-slate-500)' }}>
            {stats.calls} calls
          </p>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <span style={{ fontSize: '1.125rem', fontWeight: 'bold', color: 'var(--primary)' }}>
            {formatCurrency(stats.totalCostUsd || 0, customRate)}
          </span>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', textAlign: 'center' }}>
        <div style={{ padding: '0.5rem', backgroundColor: 'var(--surface)', borderRadius: '0.375rem' }}>
          <p style={{ margin: 0, fontSize: '0.6rem', color: 'var(--text-slate-400)', textTransform: 'uppercase' }}>Input</p>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-slate-900)' }}>
            {formatNumber(stats.inputTokens || 0)}
          </p>
        </div>
        <div style={{ padding: '0.5rem', backgroundColor: 'var(--surface)', borderRadius: '0.375rem' }}>
          <p style={{ margin: 0, fontSize: '0.6rem', color: 'var(--text-slate-400)', textTransform: 'uppercase' }}>Output</p>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-slate-900)' }}>
            {formatNumber(stats.outputTokens || 0)}
          </p>
        </div>
        <div style={{ padding: '0.5rem', backgroundColor: 'var(--surface)', borderRadius: '0.375rem' }}>
          <p style={{ margin: 0, fontSize: '0.6rem', color: 'var(--text-slate-400)', textTransform: 'uppercase' }}>Total</p>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-slate-900)' }}>
            {formatNumber(stats.totalTokens || (stats.inputTokens + stats.outputTokens))}
          </p>
        </div>
      </div>
    </div>
  );
}