import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { modelPricesApi, AgentModelConfig, agentModelConfigApi } from '../api/model-prices.api';
import Modal from '../components/layout/Modal';
import Button from '../components/layout/Button';
import { DataTable, Column } from '../components/DataTable';
import { Plus, Trash2, Edit, X, AlertTriangle } from 'lucide-react';

const AGENT_TYPE_LABELS: Record<string, string> = {
  CONTENT_GEN: 'Content Generator',
  PATH_GENERATOR: 'Path Generator',
  TASK_ANALYZER: 'Task Analyzer',
  TASK_GENERATOR: 'Task Generator',
  SAFETY: 'Safety Checker',
};

export default function AgentModelConfigsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Modals visibility
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  // Action targets
  const [configToAction, setConfigToAction] = useState<AgentModelConfig | null>(null);

  // Form state
  const [formAgentType, setFormAgentType] = useState('');
  const [formModelPriceId, setFormModelPriceId] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);

  const { data: configsData, isLoading } = useQuery({
    queryKey: ['admin-agent-model-configs', page, limit],
    queryFn: () => agentModelConfigApi.admin.list({ page, limit }),
  });

  const { data: modelPricesData } = useQuery({
    queryKey: ['admin-model-prices-all'],
    queryFn: () => modelPricesApi.admin.list({ limit: 100 }),
  });

  const configs: AgentModelConfig[] = Array.isArray(configsData) ? configsData : (configsData as any)?.data || [];
  const modelPrices: any[] = Array.isArray(modelPricesData) ? modelPricesData : (modelPricesData as any)?.data || [];
  const meta = (configsData as any)?.meta || { total: configs.length, page: 1, limit: 10, lastPage: 1 };

  const createMutation = useMutation({
    mutationFn: agentModelConfigApi.admin.create,
    onSuccess: () => {
      setIsCreateModalOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['admin-agent-model-configs'] });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { modelPriceId?: string; isActive?: boolean } }) =>
      agentModelConfigApi.admin.update(id, data),
    onSuccess: () => {
      setIsEditModalOpen(false);
      setConfigToAction(null);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['admin-agent-model-configs'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: agentModelConfigApi.admin.remove,
    onSuccess: () => {
      setIsConfirmDeleteOpen(false);
      setConfigToAction(null);
      queryClient.invalidateQueries({ queryKey: ['admin-agent-model-configs'] });
    }
  });

  const resetForm = () => {
    setFormAgentType('');
    setFormModelPriceId('');
    setFormIsActive(true);
  };

  const openEditModal = (config: AgentModelConfig) => {
    setConfigToAction(config);
    setFormAgentType(config.agentType);
    setFormModelPriceId(config.modelPriceId);
    setFormIsActive(config.isActive);
    setIsEditModalOpen(true);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      agentType: formAgentType,
      modelPriceId: formModelPriceId,
      isActive: formIsActive,
    });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (configToAction) {
      updateMutation.mutate({
        id: configToAction.id,
        data: {
          modelPriceId: formModelPriceId,
          isActive: formIsActive,
        },
      });
    }
  };

  const handleDelete = () => {
    if (configToAction) {
      deleteMutation.mutate(configToAction.id);
    }
  };

  const agentTypes = Object.keys(AGENT_TYPE_LABELS);

  return (
    <div className="admin-page">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, margin: 0 }}>Agent Model Configs</h1>
          <p style={{ color: 'var(--text-slate-500)', marginTop: '0.25rem' }}>Configure which AI model each agent type uses.</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} icon={<Plus size={18} />}>
          Add Config
        </Button>
      </header>

      {/* Table */}
      <DataTable
        columns={[
          {
            key: 'agentType',
            header: 'Agent Type',
            minWidth: '180px',
            render: (c: AgentModelConfig) => (
              <span style={{ fontWeight: 600 }}>{AGENT_TYPE_LABELS[c.agentType] || c.agentType}</span>
            )
          },
          {
            key: 'modelPrice',
            header: 'Model',
            render: (c: AgentModelConfig) => (
              <span>{c.modelPrice?.name || 'N/A'}</span>
            )
          },
          {
            key: 'isActive',
            header: 'Status',
            render: (c: AgentModelConfig) => (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.25rem 0.625rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 600,
                backgroundColor: c.isActive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(100, 116, 139, 0.1)',
                color: c.isActive ? '#166534' : 'var(--text-slate-600)'
              }}>
                {c.isActive ? 'Active' : 'Inactive'}
              </span>
            )
          },
          {
            key: 'updatedAt',
            header: 'Updated At',
            render: (c: AgentModelConfig) => (
              <span style={{ color: 'var(--text-slate-500)' }}>
                {new Date(c.updatedAt).toLocaleDateString()}
              </span>
            )
          },
          {
            key: 'actions',
            header: 'Actions',
            align: 'right',
            render: (c: AgentModelConfig) => (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  title="Edit Config"
                  onClick={() => openEditModal(c)}
                  style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)', background: 'var(--surface)', cursor: 'pointer' }}
                >
                  <Edit size={16} />
                </button>
                <button
                  title="Delete Config"
                  onClick={() => {
                    setConfigToAction(c);
                    setIsConfirmDeleteOpen(true);
                  }}
                  style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)', background: 'var(--surface)', cursor: 'pointer', color: 'var(--danger)' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )
          }
        ]}
        data={configs}
        keyExtractor={(c: AgentModelConfig) => c.id}
        isLoading={isLoading}
        emptyMessage="No agent configurations found."
        page={page - 1}
        totalPages={meta.lastPage}
        totalRecords={meta.total}
        limit={limit}
        onPageChange={(p) => setPage(p + 1)}
        onLimitChange={(l) => { setLimit(l); setPage(1); }}
      />

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => { setIsCreateModalOpen(false); resetForm(); }}
        title="Add Agent Model Config"
        maxWidth="400px"
      >
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label>Agent Type</label>
            <select
              value={formAgentType}
              onChange={(e) => setFormAgentType(e.target.value)}
              className="select-input"
              required
              style={{ width: '100%', padding: '0.625rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--surface)', color: 'var(--text-slate-900)' }}
            >
              <option value="">Select agent type...</option>
              {agentTypes.map(type => (
                <option key={type} value={type}>{AGENT_TYPE_LABELS[type]}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Model</label>
            <select
              value={formModelPriceId}
              onChange={(e) => setFormModelPriceId(e.target.value)}
              className="select-input"
              required
              style={{ width: '100%', padding: '0.625rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--surface)', color: 'var(--text-slate-900)' }}
            >
              <option value="">Select model...</option>
              {modelPrices.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formIsActive}
                onChange={(e) => setFormIsActive(e.target.checked)}
              />
              Active
            </label>
          </div>
          <Button
            type="submit"
            style={{ width: '100%', marginTop: '0.5rem' }}
            isLoading={createMutation.isPending}
          >
            Add Config
          </Button>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setConfigToAction(null); resetForm(); }}
        title="Edit Agent Model Config"
        maxWidth="400px"
      >
        <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label>Agent Type</label>
            <input
              className="input-field"
              type="text"
              value={AGENT_TYPE_LABELS[formAgentType] || formAgentType}
              disabled
            />
          </div>
          <div className="form-group">
            <label>Model</label>
            <select
              value={formModelPriceId}
              onChange={(e) => setFormModelPriceId(e.target.value)}
              className="select-input"
              required
              style={{ width: '100%', padding: '0.625rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--surface)', color: 'var(--text-slate-900)' }}
            >
              <option value="">Select model...</option>
              {modelPrices.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formIsActive}
                onChange={(e) => setFormIsActive(e.target.checked)}
              />
              Active
            </label>
          </div>
          <Button
            type="submit"
            style={{ width: '100%', marginTop: '0.5rem' }}
            isLoading={updateMutation.isPending}
          >
            Save Changes
          </Button>
        </form>
      </Modal>

      {/* Confirm Delete Modal */}
      <Modal
        isOpen={isConfirmDeleteOpen}
        onClose={() => { setIsConfirmDeleteOpen(false); setConfigToAction(null); }}
        title="Delete Config"
        maxWidth="400px"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setIsConfirmDeleteOpen(false); setConfigToAction(null); }}>Cancel</Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              isLoading={deleteMutation.isPending}
            >
              Delete Config
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ color: 'var(--danger)' }}><AlertTriangle size={24} /></div>
          <div>
            <p style={{ margin: 0, fontWeight: 600 }}>Confirm Config Deletion</p>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: 'var(--text-slate-500)' }}>
              Are you sure you want to delete the configuration for <strong>{AGENT_TYPE_LABELS[configToAction?.agentType || '']}</strong>?
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}