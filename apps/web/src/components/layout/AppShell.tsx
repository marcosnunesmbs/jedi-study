import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { Sparkles, LayoutDashboard, Coins, LogOut, Search, Bell, Plus } from 'lucide-react';

export default function AppShell() {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '2rem', height: '2rem', backgroundColor: 'var(--primary)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <Sparkles size={20} />
          </div>
          <h1 style={{ fontSize: '1.125rem', fontWeight: 'bold', letterSpacing: '-0.025em', margin: 0 }}>Jedi Study</h1>
        </div>

        <nav style={{ flex: 1, padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
          <Link to="/tokens" className={`nav-link ${isActive('/tokens') ? 'active' : ''}`}>
            <Coins size={20} />
            <span>Token Usage</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          {/* <div className="sidebar-promo">
            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-slate-500)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.5rem 0' }}>Pro Plan</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-slate-700)', margin: '0 0 0.75rem 0', lineHeight: 1.5 }}>Unlock advanced subjects & AI tutoring.</p>
            <button className="btn-primary" style={{ width: '100%', padding: '0.5rem', fontSize: '0.75rem' }}>Upgrade Now</button>
          </div> */}

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0 0.5rem' }}>
            <img 
              className="avatar-img" 
              src={`https://ui-avatars.com/api/?name=${user?.email || 'User'}&background=7c3aed&color=fff`} 
              alt="User profile" 
            />
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <p style={{ fontSize: '0.875rem', fontWeight: 500, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email?.split('@')[0] || 'User'}
              </p>
              {/* <p style={{ fontSize: '0.75rem', color: 'var(--text-slate-500)', margin: 0 }}>Pro Member</p> */}
            </div>
            <button 
              onClick={logout}
              style={{ background: 'none', border: 'none', color: 'var(--text-slate-400)', cursor: 'pointer', display: 'flex' }}
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: 'var(--background-light)' }}>
        {/* Header */}
        {/* <header style={{ height: '4rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem', backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 10 }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '28rem' }}>
              <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-slate-400)' }} />
              <input 
                type="text" 
                placeholder="Search subjects..." 
                style={{ width: '100%', paddingLeft: '2.5rem', paddingRight: '1rem', paddingTop: '0.5rem', paddingBottom: '0.5rem', backgroundColor: 'var(--surface)', border: '1px solid transparent', borderRadius: '0.5rem', fontSize: '0.875rem', outline: 'none' }}
                className="search-input"
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button style={{ padding: '0.5rem', color: 'var(--text-slate-500)', background: 'none', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', position: 'relative' }}>
              <Bell size={20} />
              <span style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', width: '0.5rem', height: '0.5rem', backgroundColor: 'var(--primary)', borderRadius: '9999px', border: '2px solid white' }}></span>
            </button>
            <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
              <Plus size={18} />
              New Subject
            </button>
          </div>
        </header> */}

        {/* Dashboard Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
          <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
