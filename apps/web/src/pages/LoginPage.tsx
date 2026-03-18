import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res: any = mode === 'login'
        ? await authApi.login(email, password)
        : await authApi.register(email, password);

      setAuth(res.accessToken, res.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px', borderRadius: 6,
    border: '1px solid #e5e7eb', background: '#ffffff', color: '#111827',
    fontSize: 14, boxSizing: 'border-box', outline: 'none'
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#f8f9fa',
    }}>
      <div style={{ 
        width: 360, background: '#ffffff', borderRadius: 12, padding: 40,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        border: '1px solid #e5e7eb'
      }}>
        <h1 style={{ color: '#7c3aed', fontSize: 28, marginBottom: 8, fontWeight: 800 }}>⚡ Jedi Study</h1>
        <p style={{ color: '#6b7280', marginBottom: 32, fontSize: 15, fontWeight: 500 }}>AI-powered learning guide</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Email</label>
            <input
              type="email" placeholder="you@example.com" value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle} required
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Password</label>
            <input
              type="password" placeholder="••••••••" value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle} required minLength={6}
            />
          </div>
          {error && <p style={{ color: '#dc2626', fontSize: 13, fontWeight: 500 }}>{error}</p>}
          <button
            type="submit" disabled={loading}
            style={{
              background: '#7c3aed', color: 'white', border: 'none',
              padding: '12px 16px', borderRadius: 6, fontSize: 15, fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
              marginTop: 8, transition: 'all 0.2s'
            }}
          >
            {loading ? 'Loading...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div style={{ color: '#6b7280', fontSize: 14, marginTop: 24, textAlign: 'center', fontWeight: 500 }}>
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            style={{ 
              background: 'none', border: 'none', color: '#7c3aed', 
              cursor: 'pointer', fontSize: 14, fontWeight: 600,
              padding: '0 4px'
            }}
          >
            {mode === 'login' ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
}
