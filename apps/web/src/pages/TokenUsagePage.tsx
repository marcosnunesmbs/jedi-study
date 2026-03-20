import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tokenUsageApi } from '../api/token-usage.api';
import { CreditCard, Coins, Zap, Users, ChevronLeft, ChevronRight, Clock } from 'lucide-react';

export default function TokenUsagePage() {
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', letterSpacing: '-0.025em', color: 'var(--text-slate-900)', margin: '0 0 0.5rem 0' }}>Token Consumption</h2>
          <p style={{ color: 'var(--text-slate-500)', fontWeight: 500, margin: 0 }}>Monitoring AI resource consumption and efficiency</p>
        </div>
      </div>

      {/* Metric Cards */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.5rem', backgroundColor: 'rgba(124, 58, 237, 0.1)', color: 'var(--primary)', borderRadius: '0.5rem' }}>
            <CreditCard size={20} />
          </div>
          <div>
            <p style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-slate-400)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.125rem 0' }}>Total Cost</p>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-slate-900)', margin: 0 }}>${s?.totalCostUsd?.toFixed(4) || '0.0000'}</h3>
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
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-slate-900)', margin: 0 }}>${s?.averageCostPerUser?.toFixed(4) || '0.0000'}</h3>
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

      {/* Recent Activity Table */}
      <section className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ fontWeight: 'bold', color: 'var(--text-slate-900)', margin: 0 }}>Detailed Activity Log</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-slate-500)' }}>Per page:</span>
              <select
                value={limit}
                onChange={(e) => { setLimit(Number(e.target.value)); setPage(0); }}
                style={{ padding: '0.25rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)', fontSize: '0.75rem', outline: 'none', backgroundColor: 'var(--surface)', color: 'var(--text-slate-900)' }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
            <thead style={{ backgroundColor: 'var(--surface)', color: 'var(--text-slate-500)', fontSize: '0.625rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <tr>
                <th style={{ padding: '1rem 1.5rem' }}>Agent / ID</th>
                <th style={{ padding: '1rem 1.5rem' }}>User ID</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>Input</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>Output</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>Total</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>Duration</th>
                <th style={{ padding: '1rem 1.5rem' }}>Cost</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {h.map((r: any) => (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--surface)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-slate-700)' }}>{r.agentType}</div>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: 'var(--text-slate-400)' }}>{r.id.split('-')[0]}...</div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--text-slate-500)', fontSize: '0.75rem' }}>
                    {r.userId.split('-')[0]}...
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'center', color: 'var(--text-slate-600)' }}>{r.inputTokens.toLocaleString()}</td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'center', color: 'var(--text-slate-600)' }}>{r.outputTokens.toLocaleString()}</td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'center', fontWeight: 600 }}>{r.totalTokens.toLocaleString()}</td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'center', color: 'var(--text-slate-500)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                      <Clock size={12} />
                      {(r.durationMs / 1000).toFixed(1)}s
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span style={{ color: 'var(--primary)', fontWeight: 600 }}>${r.estimatedCostUsd?.toFixed(5)}</span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'right', color: 'var(--text-slate-400)' }}>
                    {new Date(r.createdAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                </tr>
              ))}
              {h.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-slate-500)' }}>No usage activity found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div style={{ padding: '1rem 1.5rem', backgroundColor: 'var(--surface)', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-slate-500)' }}>
            Showing <strong>{page * limit + 1}</strong> to <strong>{Math.min((page + 1) * limit, totalRecords)}</strong> of <strong>{totalRecords}</strong> records
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="btn-primary"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              style={{ padding: '0.4rem', background: page === 0 ? 'var(--border-color)' : 'var(--surface)', color: 'var(--text-slate-700)', border: '1px solid var(--border-color)', opacity: page === 0 ? 0.5 : 1 }}
            >
              <ChevronLeft size={16} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0 0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
              <span>{page + 1}</span>
              <span style={{ color: 'var(--text-slate-400)' }}>/</span>
              <span style={{ color: 'var(--text-slate-400)' }}>{totalPages || 1}</span>
            </div>
            <button
              className="btn-primary"
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              style={{ padding: '0.4rem', background: page >= totalPages - 1 ? 'var(--border-color)' : 'var(--surface)', color: 'var(--text-slate-700)', border: '1px solid var(--border-color)', opacity: page >= totalPages - 1 ? 0.5 : 1 }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
