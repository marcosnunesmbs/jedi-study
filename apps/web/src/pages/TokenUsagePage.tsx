import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tokenUsageApi } from '../api/token-usage.api';
import { DataTable } from '../components/DataTable';
import { CreditCard, Coins, Zap, Users, Clock, Bot } from 'lucide-react';
import { useCurrency, CurrencySelector } from '../components/CurrencySelector';

const AGENT_LABELS: Record<string, string> = {
  PATH_GENERATOR: 'Path Generator',
  CONTENT_GEN: 'Content Gen',
  TASK_ANALYZER: 'Task Analyzer',
  PROJECT_ANALYZER: 'Project Analyzer',
  SAFETY: 'Safety',
};

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

function formatCurrency(value: number, customRate: number): string {
  const { currency } = useCurrency();
  const rate = customRate > 0 ? customRate : 1;
  const converted = value * rate;
  return `${currency.symbol}${converted.toFixed(currency.code === 'USD' ? 4 : 2)}`;
}

export default function TokenUsagePage() {
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const { customRate } = useCurrency();

  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ['token-usage-summary'],
    queryFn: () => tokenUsageApi.getSummary(),
    refetchInterval: 30000,
  });

  const { data: history, isLoading: loadingHistory } = useQuery({
    queryKey: ['token-usage-history', page, limit],
    queryFn: () => tokenUsageApi.getHistory({ 
      limit, 
      offset: page * limit 
    }),
  });

  if (loadingSummary || loadingHistory) return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-slate-500)' }}>Loading usage data...</div>;

  const s = summary as any;
  const h = (history as any)?.records || [];
  const totalRecords = (history as any)?.total || 0;
  const totalPages = Math.ceil(totalRecords / limit);

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', letterSpacing: '-0.025em', color: 'var(--text-slate-900)', margin: '0 0 0.5rem 0' }}>Token Consumption</h2>
          <p style={{ color: 'var(--text-slate-500)', fontWeight: 500, margin: 0 }}>Monitoring AI resource consumption and efficiency</p>
        </div>
        <CurrencySelector />
      </div>

      {/* Metric Cards */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.5rem', backgroundColor: 'rgba(124, 58, 237, 0.1)', color: 'var(--primary)', borderRadius: '0.5rem' }}>
            <CreditCard size={20} />
          </div>
          <div>
            <p style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-slate-400)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.125rem 0' }}>Total Cost</p>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-slate-900)', margin: 0 }}>{formatCurrency(s?.totalCostUsd || 0, customRate)}</h3>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.5rem', backgroundColor: 'rgba(124, 58, 237, 0.1)', color: 'var(--primary)', borderRadius: '0.5rem' }}>
            <Users size={20} />
          </div>
          <div>
            <p style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-slate-400)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.125rem 0' }}>Active Users</p>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-slate-900)', margin: 0 }}>{s?.totalUsers || 0}</h3>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.5rem', backgroundColor: 'rgba(124, 58, 237, 0.1)', color: 'var(--primary)', borderRadius: '0.5rem' }}>
            <Zap size={20} />
          </div>
          <div>
            <p style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-slate-400)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.125rem 0' }}>Avg/User</p>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-slate-900)', margin: 0 }}>{formatCurrency(s?.averageCostPerUser || 0, customRate)}</h3>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.5rem', backgroundColor: 'rgba(124, 58, 237, 0.1)', color: 'var(--primary)', borderRadius: '0.5rem' }}>
            <Coins size={20} />
          </div>
          <div>
            <p style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-slate-400)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.125rem 0' }}>Total Tokens</p>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-slate-900)', margin: 0 }}>{s?.totalTokens?.toLocaleString() || 0}</h3>
          </div>
        </div>
      </section>

      {/* Usage by Agent */}
      {s?.byAgent && Object.keys(s.byAgent).length > 0 && (
        <section style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-slate-900)', marginBottom: '1rem' }}>
            Usage by Agent
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {Object.entries(s.byAgent).map(([agentType, stats]: [string, any]) => (
              <div key={agentType} className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ padding: '0.5rem', backgroundColor: 'var(--surface)', color: 'var(--primary)', borderRadius: '0.5rem' }}>
                    <Bot size={20} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-slate-900)' }}>
                      {AGENT_LABELS[agentType] || agentType}
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
                      {formatNumber(stats.totalTokens || 0)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recent Activity Table */}
      <DataTable
        columns={[
          {
            key: 'agent',
            header: 'Agent / ID',
            minWidth: '150px',
            render: (r: any) => (
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-slate-700)' }}>{r.agentType}</div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: 'var(--text-slate-400)' }}>{r.id.split('-')[0]}...</div>
              </div>
            )
          },
          {
            key: 'userId',
            header: 'User ID',
            render: (r: any) => (
              <span style={{ color: 'var(--text-slate-500)', fontSize: '0.75rem' }}>
                {r.userId.split('-')[0]}...
              </span>
            )
          },
          {
            key: 'input',
            header: 'Input',
            align: 'center',
            render: (r: any) => <span style={{ color: 'var(--text-slate-600)' }}>{r.inputTokens.toLocaleString()}</span>
          },
          {
            key: 'output',
            header: 'Output',
            align: 'center',
            render: (r: any) => <span style={{ color: 'var(--text-slate-600)' }}>{r.outputTokens.toLocaleString()}</span>
          },
          {
            key: 'total',
            header: 'Total',
            align: 'center',
            render: (r: any) => <span style={{ fontWeight: 600 }}>{r.totalTokens.toLocaleString()}</span>
          },
          {
            key: 'duration',
            header: 'Duration',
            align: 'center',
            render: (r: any) => (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', color: 'var(--text-slate-500)' }}>
                <Clock size={12} />
                {(r.durationMs / 1000).toFixed(1)}s
              </div>
            )
          },
          {
            key: 'cost',
            header: 'Cost',
            render: (r: any) => (
              <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
                {formatCurrency(r.estimatedCostUsd || 0, customRate)}
              </span>
            )
          },
          {
            key: 'date',
            header: 'Date',
            align: 'right',
            render: (r: any) => (
              <span style={{ color: 'var(--text-slate-400)' }}>
                {new Date(r.createdAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
              </span>
            )
          }
        ]}
        data={h}
        keyExtractor={(r: any) => r.id}
        isLoading={loadingHistory}
        emptyMessage="No usage activity found."
        page={page}
        totalPages={totalPages}
        totalRecords={totalRecords}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={(l) => { setLimit(l); setPage(0); }}
        containerStyle={{ marginTop: '2rem' }}
      />
    </div>
  );
}
