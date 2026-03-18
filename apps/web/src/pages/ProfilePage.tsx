import { useState } from 'react';
import { useAuthStore } from '../store/auth.store';
import { usersApi } from '../api/users.api';
import { User, Lock, CheckCircle, AlertCircle, Save } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  
  // Profile State
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Password State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess(false);
    setProfileLoading(true);
    try {
      const updatedUser: any = await usersApi.updateProfile(displayName);
      updateUser(updatedUser);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: any) {
      setProfileError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }

    setPasswordLoading(true);
    try {
      await usersApi.updatePassword(oldPassword, newPassword);
      setPasswordSuccess(true);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '48rem', margin: '0 auto' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'var(--text-slate-900)', margin: 0 }}>Account Settings</h1>
        <p style={{ color: 'var(--text-slate-500)', marginTop: '0.5rem' }}>Manage your profile information and security preferences.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Profile Section */}
        <section className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '0.5rem', borderRadius: '0.5rem', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
              <User size={20} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-slate-900)', margin: 0 }}>Public Profile</h2>
          </div>

          <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '0.5rem' }}>
              <img 
                className="avatar-img" 
                src={`https://ui-avatars.com/api/?name=${user?.email || 'User'}&background=7c3aed&color=fff&size=128`} 
                alt="Profile" 
                style={{ width: '5rem', height: '5rem', borderRadius: '9999px' }}
              />
              <div>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-slate-900)', margin: 0 }}>Profile Picture</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-slate-500)', margin: '0.25rem 0 0 0' }}>Avatar is generated from your email address.</p>
              </div>
            </div>

            <div>
              <label className="label" htmlFor="email">Email Address</label>
              <input
                className="input-field"
                id="email"
                type="email"
                value={user?.email || ''}
                disabled
                style={{ backgroundColor: 'var(--background-light)', cursor: 'not-allowed', color: 'var(--text-slate-500)' }}
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-slate-500)', marginTop: '0.375rem' }}>Your email address cannot be changed.</p>
            </div>

            <div>
              <label className="label" htmlFor="displayName">Display Name</label>
              <input
                className="input-field"
                id="displayName"
                type="text"
                placeholder="How should we call you?"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            </div>

            {profileError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#dc2626', fontSize: '0.875rem', fontWeight: 500 }}>
                <AlertCircle size={16} />
                <span>{profileError}</span>
              </div>
            )}

            {profileSuccess && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#16a34a', fontSize: '0.875rem', fontWeight: 500 }}>
                <CheckCircle size={16} />
                <span>Profile updated successfully!</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn-primary" type="submit" disabled={profileLoading} style={{ padding: '0.625rem 1.5rem' }}>
                {profileLoading ? 'Saving...' : 'Save Changes'}
                {!profileLoading && <Save size={18} />}
              </button>
            </div>
          </form>
        </section>

        {/* Password Section */}
        <section className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '0.5rem', borderRadius: '0.5rem', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
              <Lock size={20} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-slate-900)', margin: 0 }}>Security</h2>
          </div>

          <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label className="label" htmlFor="oldPassword">Current Password</label>
              <input
                className="input-field"
                id="oldPassword"
                type="password"
                placeholder="••••••••"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="label" htmlFor="newPassword">New Password</label>
                <input
                  className="input-field"
                  id="newPassword"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="label" htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  className="input-field"
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {passwordError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#dc2626', fontSize: '0.875rem', fontWeight: 500 }}>
                <AlertCircle size={16} />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#16a34a', fontSize: '0.875rem', fontWeight: 500 }}>
                <CheckCircle size={16} />
                <span>Password updated successfully!</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn-primary" type="submit" disabled={passwordLoading} style={{ padding: '0.625rem 1.5rem' }}>
                {passwordLoading ? 'Updating...' : 'Update Password'}
                {!passwordLoading && <Lock size={18} />}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
