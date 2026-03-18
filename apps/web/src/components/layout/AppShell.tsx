import { Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';

export default function AppShell() {
  const { user, logout } = useAuthStore();

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <nav style={{
        width: 240,
        background: '#ffffff',
        color: '#1a1a2e',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        borderRight: '1px solid #e5e7eb'
      }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#7c3aed', marginBottom: 24 }}>
          ⚡ Jedi Study
        </div>
        <a href="/" style={{ 
          color: '#1a1a2e', 
          textDecoration: 'none', 
          padding: '8px 12px', 
          borderRadius: 6,
          background: window.location.pathname === '/' ? '#f3f4f6' : 'transparent'
        }}>
          Dashboard
        </a>
        <a href="/tokens" style={{ 
          color: '#1a1a2e', 
          textDecoration: 'none', 
          padding: '8px 12px', 
          borderRadius: 6,
          background: window.location.pathname === '/tokens' ? '#f3f4f6' : 'transparent'
        }}>
          Token Usage
        </a>
        <div style={{ marginTop: 'auto', paddingTop: 16 }}>
          <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>{user?.email}</div>
          <button
            onClick={logout}
            style={{
              background: 'transparent',
              border: '1px solid #e5e7eb',
              color: '#6b7280',
              padding: '6px 12px',
              borderRadius: 4,
              cursor: 'pointer',
              width: '100%',
            }}
          >
            Logout
          </button>
        </div>
      </nav>
      <main style={{ flex: 1, padding: 32, background: '#f8f9fa', color: '#1a1a2e', overflowY: 'auto' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
