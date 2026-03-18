import { useQuery } from '@tanstack/react-query';
import { tokenUsageApi } from '../api/token-usage.api';

export default function TokenUsagePage() {
  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ['token-usage-summary'],
    queryFn: () => tokenUsageApi.getSummary(),
    refetchInterval: 10000, // Refresh every 10s
  });

  const { data: history, isLoading: loadingHistory } = useQuery({
    queryKey: ['token-usage-history'],
    queryFn: () => tokenUsageApi.getHistory({ limit: 20 }),
  });

  if (loadingSummary || loadingHistory) return <p>Loading usage data...</p>;

  const s = summary as any;
  const h = (history as any)?.records || [];

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 32, color: '#111827' }}>Token Consumption</h1>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 40 }}>
        <div style={cardStyle}>
          <span style={labelStyle}>Total Cost (USD)</span>
          <div style={valueStyle}>${s?.totalCostUsd?.toFixed(4)}</div>
        </div>
        <div style={cardStyle}>
          <span style={labelStyle}>Total Tokens</span>
          <div style={valueStyle}>{s?.totalTokens?.toLocaleString()}</div>
        </div>
        <div style={cardStyle}>
          <span style={labelStyle}>Total AI Calls</span>
          <div style={valueStyle}>{s?.totalCalls}</div>
        </div>
      </div>

      {/* Breakdown by Agent */}
      <h2 style={{ fontSize: 18, marginBottom: 16, color: '#111827' }}>Usage by Agent</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16, marginBottom: 40 }}>
        {Object.entries(s?.byAgent || {}).map(([agent, data]: [string, any]) => (
          <div key={agent} style={{ ...cardStyle, borderLeft: '4px solid #7c3aed' }}>
            <h3 style={{ fontSize: 14, color: '#7c3aed', marginBottom: 12, fontWeight: 700 }}>{agent}</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: '#6b7280', fontSize: 13 }}>Calls</span>
              <span style={{ fontWeight: 600 }}>{data.calls}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: '#6b7280', fontSize: 13 }}>Tokens</span>
              <span style={{ fontWeight: 600 }}>{data.totalTokens?.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280', fontSize: 13 }}>Cost</span>
              <span style={{ fontWeight: 600 }}>${data.totalCostUsd?.toFixed(4)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <h2 style={{ fontSize: 18, marginBottom: 16, color: '#111827' }}>Recent Activity</h2>
      <div style={{ background: '#ffffff', borderRadius: 8, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
            <tr>
              <th style={thStyle}>Agent</th>
              <th style={thStyle}>Tokens</th>
              <th style={thStyle}>Cost</th>
              <th style={thStyle}>Duration</th>
              <th style={thStyle}>Time</th>
            </tr>
          </thead>
          <tbody>
            {h.map((r: any) => (
              <tr key={r.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={tdStyle}>{r.agentType}</td>
                <td style={tdStyle}>{r.totalTokens}</td>
                <td style={tdStyle}>${r.estimatedCostUsd?.toFixed(5)}</td>
                <td style={tdStyle}>{r.durationMs}ms</td>
                <td style={tdStyle}>{new Date(r.createdAt).toLocaleTimeString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background: '#ffffff',
  padding: '24px',
  borderRadius: 12,
  border: '1px solid #e5e7eb',
  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  color: '#6b7280',
  fontSize: '13px',
  fontWeight: 500,
  marginBottom: '8px',
};

const valueStyle: React.CSSProperties = {
  fontSize: '24px',
  fontWeight: 700,
  color: '#111827',
};

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '12px 16px',
  color: '#374151',
  fontWeight: 600,
};

const tdStyle: React.CSSProperties = {
  padding: '12px 16px',
  color: '#4b5563',
};
