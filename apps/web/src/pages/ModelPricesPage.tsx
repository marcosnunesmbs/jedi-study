import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { modelPricesApi, ModelPrice } from '../api/model-prices.api';
import Modal from '../components/layout/Modal';
import Button from '../components/layout/Button';
import { DataTable, Column } from '../components/DataTable';
import { Search, Plus, Trash2, Edit, X, AlertTriangle } from 'lucide-react';

export default function ModelPricesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');

  // Modals visibility
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  // Action targets
  const [modelPriceToAction, setModelPriceToAction] = useState<ModelPrice | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formInputPrice, setFormInputPrice] = useState('');
  const [formOutputPrice, setFormOutputPrice] = useState('');

  const { data: queryData, isLoading } = useQuery({
    queryKey: ['admin-model-prices', page, limit, search],
    queryFn: () => modelPricesApi.admin.list({ page, limit, search }),
  });

  const modelPrices: ModelPrice[] = Array.isArray(queryData) ? queryData : (queryData as any)?.data || [];
  const meta = (queryData as any)?.meta || { total: modelPrices.length, page: 1, limit: 10, lastPage: 1 };

  const createMutation = useMutation({
    mutationFn: modelPricesApi.admin.create,
    onSuccess: () => {
      setIsCreateModalOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['admin-model-prices'] });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string; inputPricePer1M: number; outputPricePer1M: number } }) =>
      modelPricesApi.admin.update(id, data),
    onSuccess: () => {
      setIsEditModalOpen(false);
      setModelPriceToAction(null);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['admin-model-prices'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: modelPricesApi.admin.remove,
    onSuccess: () => {
      setIsConfirmDeleteOpen(false);
      setModelPriceToAction(null);
      queryClient.invalidateQueries({ queryKey: ['admin-model-prices'] });
    }
  });

  const resetForm = () => {
    setFormName('');
    setFormInputPrice('');
    setFormOutputPrice('');
  };

  const openEditModal = (modelPrice: ModelPrice) => {
    setModelPriceToAction(modelPrice);
    setFormName(modelPrice.name);
    setFormInputPrice(modelPrice.inputPricePer1M.toString());
    setFormOutputPrice(modelPrice.outputPricePer1M.toString());
    setIsEditModalOpen(true);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      name: formName,
      inputPricePer1M: parseFloat(formInputPrice),
      outputPricePer1M: parseFloat(formOutputPrice),
    });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (modelPriceToAction) {
      updateMutation.mutate({
        id: modelPriceToAction.id,
        data: {
          name: formName,
          inputPricePer1M: parseFloat(formInputPrice),
          outputPricePer1M: parseFloat(formOutputPrice),
        },
      });
    }
  };

  const handleDelete = () => {
    if (modelPriceToAction) {
      deleteMutation.mutate(modelPriceToAction.id);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    }).format(price);
  };

  return (
    <div className="admin-page">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, margin: 0 }}>Model Prices</h1>
          <p style={{ color: 'var(--text-slate-500)', marginTop: '0.25rem' }}>Manage AI model pricing per 1M tokens.</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} icon={<Plus size={18} />}>
          Add Model
        </Button>
      </header>

      {/* Filters */}
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
            placeholder="Search by model name..."
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
      </div>

      {/* Table */}
      <DataTable
        columns={[
          {
            key: 'name',
            header: 'Model Name',
            minWidth: '200px',
            render: (m: ModelPrice) => (
              <span style={{ fontWeight: 600 }}>{m.name}</span>
            )
          },
          {
            key: 'inputPricePer1M',
            header: 'Input Price / 1M',
            render: (m: ModelPrice) => (
              <span>{formatPrice(m.inputPricePer1M)}</span>
            )
          },
          {
            key: 'outputPricePer1M',
            header: 'Output Price / 1M',
            render: (m: ModelPrice) => (
              <span>{formatPrice(m.outputPricePer1M)}</span>
            )
          },
          {
            key: 'createdAt',
            header: 'Created At',
            render: (m: ModelPrice) => (
              <span style={{ color: 'var(--text-slate-500)' }}>
                {new Date(m.createdAt).toLocaleDateString()}
              </span>
            )
          },
          {
            key: 'actions',
            header: 'Actions',
            align: 'right',
            render: (m: ModelPrice) => (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  title="Edit Model"
                  onClick={() => openEditModal(m)}
                  style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)', background: 'var(--surface)', cursor: 'pointer' }}
                >
                  <Edit size={16} />
                </button>
                <button
                  title="Delete Model"
                  onClick={() => {
                    setModelPriceToAction(m);
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
        data={modelPrices}
        keyExtractor={(m: ModelPrice) => m.id}
        isLoading={isLoading}
        emptyMessage="No models found."
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
        title="Add New Model"
        maxWidth="400px"
      >
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label>Model Name</label>
            <input
              className="input-field"
              type="text"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. gemini-2.5-flash-lite-preview"
            />
          </div>
          <div className="form-group">
            <label>Input Price per 1M Tokens (USD)</label>
            <input
              className="input-field"
              type="number"
              step="0.000001"
              required
              value={formInputPrice}
              onChange={(e) => setFormInputPrice(e.target.value)}
              placeholder="e.g. 0.25"
            />
          </div>
          <div className="form-group">
            <label>Output Price per 1M Tokens (USD)</label>
            <input
              className="input-field"
              type="number"
              step="0.000001"
              required
              value={formOutputPrice}
              onChange={(e) => setFormOutputPrice(e.target.value)}
              placeholder="e.g. 1.50"
            />
          </div>
          <Button
            type="submit"
            style={{ width: '100%', marginTop: '0.5rem' }}
            isLoading={createMutation.isPending}
          >
            Add Model
          </Button>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setModelPriceToAction(null); resetForm(); }}
        title="Edit Model"
        maxWidth="400px"
      >
        <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label>Model Name</label>
            <input
              className="input-field"
              type="text"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. gemini-2.5-flash-lite-preview"
            />
          </div>
          <div className="form-group">
            <label>Input Price per 1M Tokens (USD)</label>
            <input
              className="input-field"
              type="number"
              step="0.000001"
              required
              value={formInputPrice}
              onChange={(e) => setFormInputPrice(e.target.value)}
              placeholder="e.g. 0.25"
            />
          </div>
          <div className="form-group">
            <label>Output Price per 1M Tokens (USD)</label>
            <input
              className="input-field"
              type="number"
              step="0.000001"
              required
              value={formOutputPrice}
              onChange={(e) => setFormOutputPrice(e.target.value)}
              placeholder="e.g. 1.50"
            />
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
        onClose={() => { setIsConfirmDeleteOpen(false); setModelPriceToAction(null); }}
        title="Delete Model"
        maxWidth="400px"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setIsConfirmDeleteOpen(false); setModelPriceToAction(null); }}>Cancel</Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              isLoading={deleteMutation.isPending}
            >
              Delete Model
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ color: 'var(--danger)' }}><AlertTriangle size={24} /></div>
          <div>
            <p style={{ margin: 0, fontWeight: 600 }}>Confirm Model Deletion</p>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: 'var(--text-slate-500)' }}>
              Are you sure you want to delete <strong>{modelPriceToAction?.name}</strong>? This action cannot be undone.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}