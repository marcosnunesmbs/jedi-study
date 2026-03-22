import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { usersApi, UserWithTokenUsage } from '../api/users.api';
import { AgentUsageCard } from '../components/AgentUsageCard';
import { ChevronLeft, CreditCard, Zap, FileText, DollarSign, BookOpen, Activity } from 'lucide-react';
import { useCurrency, CurrencySelector } from '../components/CurrencySelector';
import { formatNumber, formatCurrency } from '../utils/format';

export default function AdminUserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { customRate } = useCurrency();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-user', userId],
    queryFn: () => usersApi.admin.getUser(userId!),
    enabled: !!userId,
  });

  const user = data as UserWithTokenUsage | undefined;
  const tokenUsage = user?.tokenUsage;

  if (isLoading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-slate-500)' }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-slate-500)' }}>
        User not found
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 0.5s ease-out' }}>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
              <span className="badge" style={{
                backgroundColor: user.role === 'ADMIN' ? 'rgba(124, 58, 237, 0.1)' : 'var(--surface)',
                color: user.role === 'ADMIN' ? 'var(--primary)' : 'var(--text-slate-500)',
              }}>
                {user.role}
              </span>
              <span style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.75rem',
                color: 'var(--text-slate-500)',
              }}>
                <BookOpen size={12} />
                {user.subjectsCount} subjects
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Token Usage Summary */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-slate-900)', margin: 0 }}>
          Token Usage
        </h3>
        <CurrencySelector />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.5rem', backgroundColor: 'rgba(124, 58, 237, 0.1)', color: 'var(--primary)', borderRadius: '0.5rem' }}>
            <CreditCard size={20} />
          </div>
          <div>
            <p style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-slate-400)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.125rem 0' }}>Total Cost</p>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-slate-900)', margin: 0 }}>
              {formatCurrency(tokenUsage?.totalCostUsd || 0, customRate)}
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

        <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.5rem', backgroundColor: 'rgba(124, 58, 237, 0.1)', color: 'var(--primary)', borderRadius: '0.5rem' }}>
            <BookOpen size={20} />
          </div>
          <div>
            <p style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-slate-400)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.125rem 0' }}>Avg/Subject</p>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-slate-900)', margin: 0 }}>
              {formatCurrency(user.subjectsCount > 0 ? (tokenUsage?.totalCostUsd || 0) / user.subjectsCount : 0, customRate)}
            </h3>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.5rem', backgroundColor: 'rgba(124, 58, 237, 0.1)', color: 'var(--primary)', borderRadius: '0.5rem' }}>
            <Activity size={20} />
          </div>
          <div>
            <p style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-slate-400)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.125rem 0' }}>Avg/Call</p>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-slate-900)', margin: 0 }}>
              {formatCurrency((tokenUsage?.totalCalls || 0) > 0 ? (tokenUsage?.totalCostUsd || 0) / (tokenUsage?.totalCalls || 1) : 0, customRate)}
            </h3>
          </div>
        </div>
      </div>

      {/* Usage by Agent */}
      <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-slate-900)', marginBottom: '1rem' }}>
        Usage by Agent
      </h3>

      {tokenUsage?.byAgent && Object.keys(tokenUsage.byAgent).length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {Object.entries(tokenUsage.byAgent).map(([agentType, stats]) => (
            <AgentUsageCard key={agentType} agentType={agentType} stats={stats} />
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