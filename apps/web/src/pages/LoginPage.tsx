import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';
import { Zap, ArrowRight, Apple } from 'lucide-react';

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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div className="login-bg">
        <div className="blur-circle blur-top"></div>
        <div className="blur-circle blur-bottom"></div>
      </div>

      {/* Header / Logo */}
      <div style={{ marginBottom: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '0.625rem', borderRadius: 'var(--radius-lg)', boxShadow: '0 10px 15px -3px rgba(124, 58, 237, 0.2)' }}>
          <Zap size={30} style={{ display: 'block' }} />
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '-0.025em', color: 'var(--text-slate-900)', margin: 0 }}>Jedi Study</h1>
      </div>

      {/* Login Card */}
      <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-slate-900)', margin: 0 }}>
            {mode === 'login' ? 'Welcome back' : 'Create an account'}
          </h2>
          <p style={{ color: 'var(--text-slate-500)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {mode === 'login' ? 'Enter your credentials to access your courses.' : 'Join us to start your AI-powered learning journey.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label className="label" htmlFor="email">Email address</label>
            <input
              className="input-field"
              id="email"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
              <label className="label" htmlFor="password" style={{ margin: 0 }}>Password</label>
              {mode === 'login' && (
                <a href="#" style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--primary)', textDecoration: 'none' }}>Forgot password?</a>
              )}
            </div>
            <div style={{ position: 'relative' }}>
              <input
                className="input-field"
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>

          {error && <p style={{ color: '#dc2626', fontSize: '0.8125rem', fontWeight: 500, margin: 0 }}>{error}</p>}

          <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: '0.25rem' }}>
            <span>{loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}</span>
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div style={{ position: 'relative', margin: '2rem 0' }}>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '100%', borderTop: '1px solid var(--border-color)' }}></div>
          </div>
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', fontSize: '0.75rem', textTransform: 'uppercase' }}>
            <span style={{ backgroundColor: 'white', padding: '0 0.75rem', color: 'var(--text-slate-400)', fontWeight: 500 }}>Or continue with</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.625rem', border: '1px solid var(--border-color)', borderRadius: '0.5rem', backgroundColor: 'white', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-slate-700)' }}>
            <svg style={{ width: '1rem', height: '1rem' }} viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
            </svg>
            Google
          </button>
          <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.625rem', border: '1px solid var(--border-color)', borderRadius: '0.5rem', backgroundColor: 'white', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-slate-700)' }}>
            <Apple size={18} />
            Apple
          </button>
        </div>
      </div>

      <p style={{ marginTop: '2rem', fontSize: '0.875rem', color: 'var(--text-slate-500)' }}>
        {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
        <button
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          style={{ backgroundColor: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', padding: '0 0.25rem' }}
        >
          {mode === 'login' ? 'Create an account' : 'Sign In'}
        </button>
      </p>
    </div>
  );
}
