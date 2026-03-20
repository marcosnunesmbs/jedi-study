import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { usersApi, UserWithTokenUsage } from '../api/users.api';
import { ChevronLeft, CreditCard, Zap, FileText, DollarSign, Bot } from 'lucide-react';

const AGENT_LABELS: Record<string, string> = {
  PATH_GENERATOR: 'Path Generator',
  CONTENT_GEN: 'Content Gen',
  TASK_ANALYZER: 'Task Analyzer',
  PROJECT_ANALYZER: 'Project Analyzer',
  SAFETY: 'Safety',
};

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(2) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export default function AdminUserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-user', userId],
    queryFn: () => usersApi.admin.getUser(userId!),
    enabled: !!userId,
  });

  const user = data as UserWithTokenUsage | undefined;
  const tokenUsage = user?.tokenUsage;

  if (isLoading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-slate-500)' }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-slate-500)' }}>
        User not found
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <button
        onClick={() => navigate('/admin/users')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'none',
          border: 'none',
          color: 'var(--text-slate-600)',
          cursor: 'pointer',
          padding: 0,
          marginBottom: '1.5rem',
          fontSize: '0.875rem',
        }}
      >
        <ChevronLeft size={18} />
        Back to Users
      </button>

      {/* User Info Card */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '3.5rem',
            height: '3.5rem',
            borderRadius: '50%',
            backgroundColor: 'var(--surface)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)',
            fontSize: '1.5rem',
            fontWeight: 'bold',
          }}>
            {user.displayName?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-slate-900)' }}>
              {user.displayName || 'No name'}
            </h2>
            <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-slate-500)', fontSize: '0.875rem' }}>
              {user.email}
            </p>
            <span className="badge" style={{
              marginTop: '0.5rem',
              backgroundColor: user.role === 'ADMIN' ? 'rgba(124, 58, 237, 0.1)' : 'var(--surface)',
              color: user.role === 'ADMIN' ? 'var(--primary)' : 'var(--text-slate-500)',
            }}>
              {user.role}
            </span>
          </div>
        </div>
      </div>

      {/* Token Usage Summary */}
      <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-slate-900)', marginBottom: '1rem' }}>
        Token Usage
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.5rem', backgroundColor: 'rgba(124, 58, 237, 0.1)', color: 'var(--primary)', borderRadius: '0.5rem' }}>
            <CreditCard size={20} />
          </div>
          <div>
            <p style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-slate-400)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.125rem 0' }}>Total Cost</p>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-slate-900)', margin: 0 }}>
              ${tokenUsage?.totalCostUsd?.toFixed(4) || '0.0000'}
            </h3>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.5rem', backgroundColor: 'rgba(124, 58, 237, 0.1)', color: 'var(--primary)', borderRadius: '0.5rem' }}>
            <Zap size={20} />
          </div>
          <div>
            <p style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-slate-400)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.125rem 0' }}>Input Tokens</p>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-slate-900)', margin: 0 }}>
              {formatNumber(tokenUsage?.totalInputTokens || 0)}
            </h3>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.5rem', backgroundColor: 'rgba(124, 58, 237, 0.1)', color: 'var(--primary)', borderRadius: '0.5rem' }}>
            <FileText size={20} />
          </div>
          <div>
            <p style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-slate-400)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.125rem 0' }}>Output Tokens</p>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-slate-900)', margin: 0 }}>
              {formatNumber(tokenUsage?.totalOutputTokens || 0)}
            </h3>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.5rem', backgroundColor: 'rgba(124, 58, 237, 0.1)', color: 'var(--primary)', borderRadius: '0.5rem' }}>
            <DollarSign size={20} />
          </div>
          <div>
            <p style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-slate-400)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.125rem 0' }}>Total Calls</p>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-slate-900)', margin: 0 }}>
              {tokenUsage?.totalCalls || 0}
            </h3>
          </div>
        </div>
      </div>

      {/* Breakdown by Agent */}
      <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-slate-900)', marginBottom: '1rem' }}>
        Usage by Agent
      </h3>

      {tokenUsage?.byAgent && Object.keys(tokenUsage.byAgent).length > 0 ? (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {Object.entries(tokenUsage.byAgent).map(([agentType, stats]) => (
            <div
              key={agentType}
              className="card"
              style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '0.5rem',
                  backgroundColor: 'var(--surface)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)',
                }}>
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
              </div>
              <div style={{ display: 'flex', gap: '2rem', textAlign: 'right' }}>
                <div>
                  <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text-slate-400)', textTransform: 'uppercase' }}>Input</p>
                  <p style={{ margin: '0.125rem 0 0 0', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-slate-900)' }}>
                    {formatNumber(stats.inputTokens)}
                  </p>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text-slate-400)', textTransform: 'uppercase' }}>Output</p>
                  <p style={{ margin: '0.125rem 0 0 0', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-slate-900)' }}>
                    {formatNumber(stats.outputTokens)}
                  </p>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text-slate-400)', textTransform: 'uppercase' }}>Cost</p>
                  <p style={{ margin: '0.125rem 0 0 0', fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)' }}>
                    ${stats.totalCostUsd.toFixed(4)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-slate-500)' }}>
          No token usage data for this user
        </div>
      )}
    </div>
  );
}