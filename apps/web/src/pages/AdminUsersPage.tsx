import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi, User } from '../api/users.api';
import Modal from '../components/layout/Modal';
import Button from '../components/layout/Button';
import { 
  Search, 
  UserPlus, 
  Trash2, 
  RefreshCcw, 
  Shield, 
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
  X,
  Copy,
  Check,
  AlertCircle,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { isStrongPassword, getPasswordErrorMessage } from '../utils/password-validation';

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Modals visibility
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isConfirmBulkDeleteOpen, setIsConfirmBulkDeleteOpen] = useState(false);
  const [isConfirmResetOpen, setIsConfirmResetOpen] = useState(false);
  const [isConfirmRestoreOpen, setIsConfirmRestoreOpen] = useState(false);
  const [isPasswordResultOpen, setIsPasswordResultOpen] = useState(false);
  
  // Action targets
  const [userToAction, setUserToAction] = useState<User | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  
  // Create User Form State
  const [createEmail, setCreateEmail] = useState('');
  const [createDisplayName, setCreateDisplayName] = useState('');
  const [createRole, setCreateRole] = useState('USER');

  const { data: queryData, isLoading } = useQuery({
    queryKey: ['admin-users', page, search, roleFilter, showDeleted],
    queryFn: () => usersApi.admin.list({ 
      page, 
      search, 
      role: roleFilter, 
      withDeleted: showDeleted 
    }),
  });

  // Handle both possible response shapes from interceptor
  const users: User[] = (queryData as any)?.data || (Array.isArray(queryData) ? queryData : []);
  const meta = (queryData as any)?.meta || { total: 0, page: 1, limit: 10, lastPage: 1 };

  const createMutation = useMutation({
    mutationFn: usersApi.admin.create,
    onSuccess: (res) => {
      setGeneratedPassword((res as any).password || (res as any).data?.password);
      setIsPasswordResultOpen(true);
      setIsCreateModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    }
  });

  const resetPasswordMutation = useMutation({
    mutationFn: usersApi.admin.resetPassword,
    onSuccess: (res) => {
      setGeneratedPassword((res as any).password || (res as any).data?.password);
      setIsPasswordResultOpen(true);
      setIsConfirmResetOpen(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: usersApi.admin.remove,
    onSuccess: () => {
      setIsConfirmDeleteOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    }
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: usersApi.admin.removeBulk,
    onSuccess: () => {
      setSelectedIds([]);
      setIsConfirmBulkDeleteOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    }
  });

  const restoreMutation = useMutation({
    mutationFn: usersApi.admin.restore,
    onSuccess: () => {
      setIsConfirmRestoreOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    }
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked && users.length > 0) {
      setSelectedIds(users.map(u => u.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      email: createEmail,
      displayName: createDisplayName,
      role: createRole
    });
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    setCreateEmail('');
    setCreateDisplayName('');
    setCreateRole('USER');
    createMutation.reset();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="admin-page">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, margin: 0 }}>User Management</h1>
          <p style={{ color: 'var(--text-slate-500)', marginTop: '0.25rem' }}>Manage all users, roles and account access.</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} icon={<UserPlus size={18} />}>
          Create User
        </Button>
      </header>

      {/* Filters & Actions */}
      <div style={{ 
        backgroundColor: 'var(--surface)', 
        padding: '1.25rem', 
        borderRadius: '0.75rem', 
        marginBottom: '1.5rem',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        alignItems: 'center',
        border: '1px solid var(--border-color)'
      }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-slate-400)' }} />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '0.625rem 1rem 0.625rem 2.5rem',
              backgroundColor: 'var(--background-light)',
              border: '1px solid var(--border-color)',
              borderRadius: '0.5rem',
              fontSize: '0.875rem'
            }}
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="select-input"
          style={{ padding: '0.625rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', minWidth: '120px', backgroundColor: 'var(--surface)', color: 'var(--text-slate-900)' }}
        >
          <option value="">All Roles</option>
          <option value="USER">User</option>
          <option value="ADMIN">Admin</option>
        </select>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
          <input 
            type="checkbox" 
            checked={showDeleted} 
            onChange={(e) => setShowDeleted(e.target.checked)} 
          />
          Show Deleted
        </label>

        {selectedIds.length > 0 && (
          <Button 
            variant="danger"
            style={{ marginLeft: 'auto' }}
            onClick={() => setIsConfirmBulkDeleteOpen(true)}
            icon={<Trash2 size={18} />}
          >
            Delete Selected ({selectedIds.length})
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="table-container">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '1rem' }}>
                <input 
                  type="checkbox" 
                  onChange={handleSelectAll}
                  checked={users.length > 0 && selectedIds.length === users.length}
                />
              </th>
              <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-slate-500)' }}>User</th>
              <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-slate-500)' }}>Role</th>
              <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-slate-500)' }}>Status</th>
              <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-slate-500)' }}>Created At</th>
              <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-slate-500)', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center' }}>Loading users...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center' }}>No users found.</td></tr>
            ) : users.map((u: User) => (
              <tr
                key={u.id}
                style={{ borderBottom: '1px solid var(--border-color)', opacity: u.deletedAt ? 0.6 : 1 }}
              >
                <td style={{ padding: '1rem' }}>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(u.id)}
                    onChange={() => handleSelectOne(u.id)}
                  />
                </td>
                <td
                  onClick={() => navigate(`/admin/users/${u.id}`)}
                  style={{ padding: '1rem', cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img
                      className="avatar-img"
                      src={`https://ui-avatars.com/api/?name=${u.displayName || u.email}&background=7c3aed&color=fff`}
                      alt=""
                      style={{ width: '2.5rem', height: '2.5rem' }}
                    />
                    <div>
                      <p style={{ fontWeight: 600, margin: 0 }}>{u.displayName || 'N/A'}</p>
                      <p style={{ color: 'var(--text-slate-500)', margin: 0 }}>{u.email}</p>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '0.375rem',
                    padding: '0.25rem 0.625rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    backgroundColor: u.role === 'ADMIN' ? 'rgba(124, 58, 237, 0.1)' : 'rgba(100, 116, 139, 0.1)',
                    color: u.role === 'ADMIN' ? 'var(--primary)' : 'var(--text-slate-600)'
                  }}>
                    {u.role === 'ADMIN' ? <Shield size={12} /> : <UserIcon size={12} />}
                    {u.role}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    padding: '0.25rem 0.625rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    backgroundColor: u.deletedAt ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                    color: u.deletedAt ? 'var(--danger)' : '#166534'
                  }}>
                    {u.deletedAt ? 'Deleted' : 'Active'}
                  </span>
                </td>
                <td style={{ padding: '1rem', color: 'var(--text-slate-500)' }}>
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    {u.deletedAt ? (
                      <button 
                        title="Restore User"
                        onClick={() => {
                          setUserToAction(u);
                          setIsConfirmRestoreOpen(true);
                        }}
                        style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)', background: 'var(--surface)', cursor: 'pointer', color: 'var(--primary)' }}
                      >
                        <RotateCcw size={16} />
                      </button>
                    ) : (
                      <>
                        <button 
                          title="Reset Password"
                          onClick={() => {
                            setUserToAction(u);
                            setIsConfirmResetOpen(true);
                          }}
                          style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)', background: 'var(--surface)', cursor: 'pointer' }}
                        >
                          <RefreshCcw size={16} />
                        </button>
                        <button 
                          title="Delete User"
                          onClick={() => {
                            setUserToAction(u);
                            setIsConfirmDeleteOpen(true);
                          }}
                          style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)', background: 'var(--surface)', cursor: 'pointer', color: 'var(--danger)' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {meta.lastPage > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem' }}>
          <button 
            disabled={page === 1} 
            onClick={() => setPage(p => p - 1)}
            style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)', background: 'var(--surface)', cursor: page === 1 ? 'not-allowed' : 'pointer' }}
          >
            <ChevronLeft size={20} />
          </button>
          <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
            Page {page} of {meta.lastPage}
          </span>
          <button 
            disabled={page === meta.lastPage} 
            onClick={() => setPage(p => p + 1)}
            style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)', background: 'var(--surface)', cursor: page === meta.lastPage ? 'not-allowed' : 'pointer' }}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* Create User Modal */}
      <Modal 
        isOpen={isCreateModalOpen} 
        onClose={closeCreateModal} 
        title="Create New User"
        maxWidth="400px"
      >
        <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label>Email Address</label>
            <input 
              className="input-field"
              type="email" 
              required 
              value={createEmail}
              onChange={(e) => setCreateEmail(e.target.value)}
              placeholder="e.g. anakin@jedi.com"
            />
          </div>
          <div className="form-group">
            <label>Display Name (Optional)</label>
            <input 
              className="input-field"
              type="text" 
              value={createDisplayName}
              onChange={(e) => setCreateDisplayName(e.target.value)}
              placeholder="e.g. Anakin Skywalker"
            />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select
              value={createRole}
              onChange={(e) => setCreateRole(e.target.value)}
              className="select-input"
              style={{ width: '100%', padding: '0.625rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--surface)', color: 'var(--text-slate-900)' }}
            >
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <Button 
            type="submit" 
            style={{ width: '100%', marginTop: '0.5rem' }}
            isLoading={createMutation.isPending}
          >
            Create User
          </Button>
        </form>
      </Modal>

      {/* Password Result Modal */}
      <Modal
        isOpen={isPasswordResultOpen}
        onClose={() => {
          setIsPasswordResultOpen(false);
          setGeneratedPassword(null);
        }}
        title="Access Credentials"
        maxWidth="400px"
        footer={
          <Button style={{ width: '100%' }} onClick={() => {
            setIsPasswordResultOpen(false);
            setGeneratedPassword(null);
          }}>Done</Button>
        }
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            backgroundColor: 'rgba(34, 197, 94, 0.1)', 
            color: '#166534', 
            padding: '1rem', 
            borderRadius: '0.5rem', 
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem'
          }}>
            <Check size={20} />
            <span>Success! The temporary password is below.</span>
          </div>
          
          <p style={{ fontSize: '0.875rem', color: 'var(--text-slate-600)', marginBottom: '0.5rem' }}>Temporary Password:</p>
          <div style={{ 
            backgroundColor: 'var(--background-light)', 
            padding: '1rem', 
            borderRadius: '0.5rem', 
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem'
          }}>
            <code style={{ fontSize: '1.125rem', fontWeight: 700, letterSpacing: '0.05em' }}>{generatedPassword}</code>
            <button 
              onClick={() => copyToClipboard(generatedPassword || '')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)' }}
              title="Copy to clipboard"
            >
              <Copy size={18} />
            </button>
          </div>
          
          <div style={{ 
            backgroundColor: 'rgba(245, 158, 11, 0.1)', 
            color: '#92400e', 
            padding: '0.75rem', 
            borderRadius: '0.5rem', 
            fontSize: '0.75rem',
            display: 'flex',
            gap: '0.5rem',
            textAlign: 'left'
          }}>
            <AlertCircle size={32} />
            <p style={{ margin: 0 }}>This password will <strong>never be shown again</strong>. Please copy it and share it securely with the user.</p>
          </div>
        </div>
      </Modal>

      {/* Confirm Reset Modal */}
      <Modal
        isOpen={isConfirmResetOpen}
        onClose={() => setIsConfirmResetOpen(false)}
        title="Reset Password"
        maxWidth="400px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsConfirmResetOpen(false)}>Cancel</Button>
            <Button 
              onClick={() => userToAction && resetPasswordMutation.mutate(userToAction.id)}
              isLoading={resetPasswordMutation.isPending}
            >
              Confirm Reset
            </Button>
          </>
        }
      >
        <p style={{ margin: 0 }}>Are you sure you want to reset the password for <strong>{userToAction?.email}</strong>?</p>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-slate-500)', marginTop: '0.5rem' }}>A new random password will be generated and shown to you.</p>
      </Modal>

      {/* Confirm Delete Modal */}
      <Modal
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        title="Delete User"
        maxWidth="400px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsConfirmDeleteOpen(false)}>Cancel</Button>
            <Button 
              variant="danger" 
              onClick={() => userToAction && deleteMutation.mutate(userToAction.id)}
              isLoading={deleteMutation.isPending}
            >
              Delete Account
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ color: 'var(--danger)' }}><AlertTriangle size={24} /></div>
          <div>
            <p style={{ margin: 0, fontWeight: 600 }}>Confirm Account Deletion</p>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: 'var(--text-slate-500)' }}>
              Are you sure you want to delete <strong>{userToAction?.email}</strong>? This user will lose all access immediately.
            </p>
          </div>
        </div>
      </Modal>

      {/* Confirm Bulk Delete Modal */}
      <Modal
        isOpen={isConfirmBulkDeleteOpen}
        onClose={() => setIsConfirmBulkDeleteOpen(false)}
        title="Bulk Delete"
        maxWidth="400px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsConfirmBulkDeleteOpen(false)}>Cancel</Button>
            <Button 
              variant="danger" 
              onClick={() => bulkDeleteMutation.mutate(selectedIds)}
              isLoading={bulkDeleteMutation.isPending}
            >
              Delete {selectedIds.length} Users
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ color: 'var(--danger)' }}><AlertTriangle size={24} /></div>
          <div>
            <p style={{ margin: 0, fontWeight: 600 }}>Delete Multiple Accounts</p>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: 'var(--text-slate-500)' }}>
              You have selected <strong>{selectedIds.length}</strong> users. This action will deactivate all of them. Are you sure?
            </p>
          </div>
        </div>
      </Modal>

      {/* Confirm Restore Modal */}
      <Modal
        isOpen={isConfirmRestoreOpen}
        onClose={() => setIsConfirmRestoreOpen(false)}
        title="Restore User"
        maxWidth="400px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsConfirmRestoreOpen(false)}>Cancel</Button>
            <Button 
              onClick={() => userToAction && restoreMutation.mutate(userToAction.id)}
              isLoading={restoreMutation.isPending}
            >
              Confirm Restore
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ color: 'var(--primary)' }}><RotateCcw size={24} /></div>
          <div>
            <p style={{ margin: 0, fontWeight: 600 }}>Restore Account</p>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: 'var(--text-slate-500)' }}>
              Are you sure you want to restore the access for <strong>{userToAction?.email}</strong>?
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
