import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';
import { Zap, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [passwordMatchError, setPasswordMatchError] = useState('');
  const [loading, setLoading] = useState(false);

  const switchMode = (next: 'login' | 'register') => {
    setMode(next);
    setError('');
    setPasswordMatchError('');
    setConfirmPassword('');
  };

  const handleConfirmBlur = () => {
    if (confirmPassword && confirmPassword !== password) {
      setPasswordMatchError("Passwords don't match");
    } else {
      setPasswordMatchError('');
    }
  };

  const isSubmitDisabled =
    loading ||
    (mode === 'register' && (!!passwordMatchError || confirmPassword !== password));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res: any = mode === 'login'
        ? await authApi.login(email, password)
        : await authApi.register(email, password, displayName);

      queryClient.clear();
      setAuth(res.accessToken, res.user);
      navigate('/');
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(typeof msg === 'string' ? msg : msg?.message || 'Authentication failed');
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

      {/* Card */}
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

          {/* Name — register only */}
          {mode === 'register' && (
            <div>
              <label className="label" htmlFor="displayName">Name</label>
              <input
                className="input-field"
                id="displayName"
                type="text"
                placeholder="Your name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                autoComplete="name"
                required
              />
            </div>
          )}

          {/* Email */}
          <div>
            <label className="label" htmlFor="email">Email address</label>
            <input
              className="input-field"
              id="email"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          {/* Password */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
              <label className="label" htmlFor="password" style={{ margin: 0 }}>Password</label>
              {mode === 'login' && (
                <a href="#" style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--primary)', textDecoration: 'none' }}>Forgot password?</a>
              )}
            </div>
            <input
              className="input-field"
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
              minLength={6}
            />
          </div>

          {/* Confirm Password — register only */}
          {mode === 'register' && (
            <div>
              <label className="label" htmlFor="confirmPassword">Confirm Password</label>
              <input
                className="input-field"
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (passwordMatchError) setPasswordMatchError('');
                }}
                onBlur={handleConfirmBlur}
                autoComplete="new-password"
                required
              />
              {passwordMatchError && (
                <p style={{ color: '#dc2626', fontSize: '0.8125rem', fontWeight: 500, margin: '0.375rem 0 0' }}>
                  {passwordMatchError}
                </p>
              )}
            </div>
          )}

          {/* API error */}
          {error && (
            <p style={{ color: '#dc2626', fontSize: '0.8125rem', fontWeight: 500, margin: 0 }}>
              {error}
            </p>
          )}

          <button
            className="btn-primary"
            type="submit"
            disabled={isSubmitDisabled}
            style={{ width: '100%', marginTop: '0.25rem' }}
          >
            <span>{loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}</span>
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>
      </div>

      <p style={{ marginTop: '2rem', fontSize: '0.875rem', color: 'var(--text-slate-500)' }}>
        {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
        <button
          onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
          style={{ backgroundColor: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', padding: '0 0.25rem' }}
        >
          {mode === 'login' ? 'Create an account' : 'Sign In'}
        </button>
      </p>
    </div>
  );
}
