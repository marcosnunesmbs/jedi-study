import { useQuery } from '@tanstack/react-query';
import { tokenUsageApi } from '../api/token-usage.api';
import { Download, CreditCard, Coins, Zap } from 'lucide-react';

export default function TokenUsagePage() {
  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ['token-usage-summary'],
    queryFn: () => tokenUsageApi.getSummary(),
    refetchInterval: 10000,
  });

  const { data: history, isLoading: loadingHistory } = useQuery({
    queryKey: ['token-usage-history'],
    queryFn: () => tokenUsageApi.getHistory({ limit: 20 }),
  });

  if (loadingSummary || loadingHistory) return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-slate-500)' }}>Loading usage data...</div>;

  const s = summary as any;
  const h = (history as any)?.records || [];

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', letterSpacing: '-0.025em', color: 'var(--text-slate-900)', margin: '0 0 0.5rem 0' }}>Token Consumption</h2>
          <p style={{ color: 'var(--text-slate-500)', fontWeight: 500, margin: 0 }}>Monitoring AI resource consumption for the platform</p>
        </div>
        <button className="btn-primary" style={{ background: 'white', color: 'var(--text-slate-700)', border: '1px solid var(--border-color)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Download size={18} />
          Export Report
        </button>
      </div>

      {/* Top Metric Cards */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', backgroundColor: 'rgba(124, 58, 237, 0.1)', color: 'var(--primary)', borderRadius: '0.5rem' }}>
            <CreditCard size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-slate-400)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.25rem 0' }}>Total Cost</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-slate-900)', margin: 0 }}>${s?.totalCostUsd?.toFixed(4) || '0.0000'}</h3>
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', backgroundColor: 'rgba(124, 58, 237, 0.1)', color: 'var(--primary)', borderRadius: '0.5rem' }}>
            <Coins size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-slate-400)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.25rem 0' }}>Total Tokens</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-slate-900)', margin: 0 }}>{s?.totalTokens?.toLocaleString() || 0}</h3>
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', backgroundColor: 'rgba(124, 58, 237, 0.1)', color: 'var(--primary)', borderRadius: '0.5rem' }}>
            <Zap size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-slate-400)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.25rem 0' }}>AI Calls</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-slate-900)', margin: 0 }}>{s?.totalCalls || 0}</h3>
          </div>
        </div>
      </section>

      {/* Breakdown by Agent */}
      <section className="card" style={{ padding: '1.5rem', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h4 style={{ fontWeight: 'bold', color: 'var(--text-slate-900)', margin: 0 }}>Consumption by Agent</h4>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-slate-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Allocations</span>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
          {Object.entries(s?.byAgent || {}).map(([agent, data]: [string, any], index) => {
            // Calculate a pseudo-percentage based on max tokens (assuming max ~ 50k for demo purposes if low, else relative to total)
            const maxTokens = Math.max(50000, s.totalTokens || 1);
            const percentage = Math.min(100, Math.max(5, (data.totalTokens / maxTokens) * 100));
            // Diminish opacity based on index to replicate mockup style
            const opacity = Math.max(0.3, 1 - (index * 0.2));

            return (
              <div key={agent}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-slate-700)' }}>{agent}</span>
                  <span style={{ color: 'var(--text-slate-500)' }}>{data.totalTokens?.toLocaleString()} Tokens (${data.totalCostUsd?.toFixed(4)})</span>
                </div>
                <div className="progress-bar-container" style={{ backgroundColor: 'var(--surface)', height: '0.5rem' }}>
                  <div className="progress-bar-fill" style={{ width: `${percentage}%`, opacity: opacity }}></div>
                </div>
              </div>
            );
          })}
          {(!s?.byAgent || Object.keys(s.byAgent).length === 0) && (
            <div style={{ color: 'var(--text-slate-500)', fontSize: '0.875rem' }}>No usage recorded yet.</div>
          )}
        </div>
      </section>

      {/* Recent Activity Table */}
      <section className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ fontWeight: 'bold', color: 'var(--text-slate-900)', margin: 0 }}>Recent Activity Log</h4>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead style={{ backgroundColor: 'var(--surface)', color: 'var(--text-slate-500)', fontSize: '0.625rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <tr>
                <th style={{ padding: '1rem 1.5rem' }}>Request ID</th>
                <th style={{ padding: '1rem 1.5rem' }}>AI Agent</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>Tokens</th>
                <th style={{ padding: '1rem 1.5rem' }}>Status / Cost</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {h.map((r: any) => (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--surface)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ padding: '1rem 1.5rem', fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-slate-500)' }}>{r.id.split('-')[0]}...</td>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-slate-700)' }}>{r.agentType}</td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>{r.totalTokens.toLocaleString()}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="badge badge-emerald">Success</span>
                      <span style={{ color: 'var(--text-slate-500)', fontSize: '0.75rem' }}>${r.estimatedCostUsd?.toFixed(5)}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'right', color: 'var(--text-slate-400)', fontWeight: 500 }}>
                    {new Date(r.createdAt).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
              {h.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-slate-500)' }}>No recent activity.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
