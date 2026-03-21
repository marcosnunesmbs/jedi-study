import { ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  align?: 'left' | 'center' | 'right';
  minWidth?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  isLoading?: boolean;
  emptyMessage?: string;
  // Pagination
  page: number;
  totalPages: number;
  totalRecords: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  // Table container style
  containerStyle?: React.CSSProperties;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyMessage = 'No data found',
  page,
  totalPages,
  totalRecords,
  limit,
  onPageChange,
  onLimitChange,
  containerStyle,
}: DataTableProps<T>) {
  const startRecord = page * limit + 1;
  const endRecord = Math.min((page + 1) * limit, totalRecords);

  return (
    <div className="card" style={{ overflow: 'hidden', ...containerStyle }}>
      {/* Header with limit selector */}
      <div style={{ 
        padding: '1rem 1.5rem', 
        borderBottom: '1px solid var(--border-color)', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-slate-500)' }}>
          Showing <strong>{totalRecords > 0 ? startRecord : 0}</strong> to <strong>{endRecord}</strong> of <strong>{totalRecords}</strong> records
        </div>
        {onLimitChange && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-slate-500)' }}>Per page:</span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              style={{
                padding: '0.25rem 0.5rem',
                borderRadius: '0.375rem',
                border: '1px solid var(--border-color)',
                fontSize: '0.75rem',
                outline: 'none',
                backgroundColor: 'var(--surface)',
                color: 'var(--text-slate-900)',
              }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        )}
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ 
          width: '100%', 
          textAlign: 'left', 
          borderCollapse: 'collapse', 
          fontSize: '0.8125rem',
          minWidth: '600px' // Prevent columns from being too compressed
        }}>
          <thead style={{ 
            backgroundColor: 'var(--surface)', 
            color: 'var(--text-slate-500)', 
            fontSize: '0.625rem', 
            fontWeight: 'bold', 
            textTransform: 'uppercase', 
            letterSpacing: '0.05em' 
          }}>
            <tr>
              {columns.map((col) => (
                <th 
                  key={col.key} 
                  style={{ 
                    padding: '1rem 1.5rem',
                    textAlign: col.align || 'left',
                    minWidth: col.minWidth,
                    whiteSpace: 'nowrap'
                  }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: '3rem', textAlign: 'center' }}>
                  Loading...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-slate-500)' }}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr 
                  key={keyExtractor(item)} 
                  style={{ 
                    borderBottom: '1px solid var(--border-color)', 
                    transition: 'background-color 0.2s' 
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--surface)'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  {columns.map((col) => (
                    <td 
                      key={col.key} 
                      style={{ 
                        padding: '1rem 1.5rem',
                        textAlign: col.align || 'left',
                      }}
                    >
                      {col.render ? col.render(item) : (item as any)[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ 
          padding: '1rem 1.5rem', 
          backgroundColor: 'var(--surface)', 
          borderTop: '1px solid var(--border-color)', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          gap: '0.5rem' 
        }}>
          <button
            onClick={() => onPageChange(Math.max(0, page - 1))}
            disabled={page === 0}
            style={{
              padding: '0.4rem',
              background: page === 0 ? 'var(--border-color)' : 'var(--surface)',
              color: 'var(--text-slate-700)',
              border: '1px solid var(--border-color)',
              borderRadius: '0.375rem',
              cursor: page === 0 ? 'not-allowed' : 'pointer',
              opacity: page === 0 ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ChevronLeft size={16} />
          </button>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.25rem', 
            padding: '0 0.5rem', 
            fontSize: '0.875rem', 
            fontWeight: 600 
          }}>
            <span>{page + 1}</span>
            <span style={{ color: 'var(--text-slate-400)' }}>/</span>
            <span style={{ color: 'var(--text-slate-400)' }}>{totalPages}</span>
          </div>
          <button
            onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
            style={{
              padding: '0.4rem',
              background: page >= totalPages - 1 ? 'var(--border-color)' : 'var(--surface)',
              color: 'var(--text-slate-700)',
              border: '1px solid var(--border-color)',
              borderRadius: '0.375rem',
              cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
              opacity: page >= totalPages - 1 ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}