import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { contentApi } from '../api/content.api';

export default function ContentPage() {
  const { contentId } = useParams<{ contentId: string }>();
  const navigate = useNavigate();
  const [streamedContent, setStreamedContent] = useState<string | null>(null);

  const { data: content, refetch } = useQuery({
    queryKey: ['content', contentId],
    queryFn: () => contentApi.get(contentId!).then(res => res.data || res),
  });

  useEffect(() => {
    if (!content || content.status === 'COMPLETE' || content.status === 'ERROR') return;

    // Use SSE for streaming
    const url = contentApi.streamUrl(contentId!);
    const eventSource = new EventSource(url);

    eventSource.addEventListener('content', (e) => {
      const data = JSON.parse(e.data);
      setStreamedContent(data.body);
    });

    eventSource.addEventListener('done', () => {
      console.log('SSE Stream finished');
      eventSource.close();
      refetch();
    });

    eventSource.addEventListener('error', (e) => {
      // EventSource.readyState 2 means CLOSED
      if (eventSource.readyState === 2) {
        console.log('SSE connection closed');
      } else {
        console.error('SSE Error:', e);
      }
      eventSource.close();
      refetch();
    });

    return () => eventSource.close();
  }, [content?.status, contentId, refetch]);

  const body = streamedContent || content?.body || '';

  return (
    <div>
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', marginBottom: 16, fontWeight: 500 }}>
        ← Back
      </button>

      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>{content?.title || 'Loading content...'}</h1>
        <div style={{ display: 'flex', gap: 12, marginTop: 8, alignItems: 'center' }}>
          <span style={{
            fontSize: 12, padding: '3px 8px', borderRadius: 12,
            background: content?.status === 'COMPLETE' ? '#dcfce7' : '#dbeafe',
            color: content?.status === 'COMPLETE' ? '#166534' : '#1e40af',
            fontWeight: 600
          }}>
            {content?.status || 'PENDING'}
          </span>
          <span style={{ color: '#6b7280', fontSize: 13, fontWeight: 500 }}>{content?.type}</span>
        </div>
      </div>

      <div className="markdown-content" style={{ 
        background: '#ffffff', borderRadius: 8, padding: 32, 
        border: '1px solid #e5e7eb', minHeight: '60vh',
        lineHeight: 1.6, color: '#374151',
        boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)'
      }}>
        {body ? (
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              table: ({node, ...props}) => (
                <div style={{ overflowX: 'auto', marginBottom: 20 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e5e7eb' }} {...props} />
                </div>
              ),
              th: ({node, ...props}) => <th style={{ border: '1px solid #e5e7eb', padding: '8px 12px', background: '#f9fafb', textAlign: 'left', color: '#111827' }} {...props} />,
              td: ({node, ...props}) => <td style={{ border: '1px solid #e5e7eb', padding: '8px 12px' }} {...props} />,
              h1: ({node, ...props}) => <h1 style={{ color: '#7c3aed', marginTop: 24, marginBottom: 16, borderBottom: '1px solid #e5e7eb', paddingBottom: 8 }} {...props} />,
              h2: ({node, ...props}) => <h2 style={{ color: '#7c3aed', marginTop: 20, marginBottom: 12 }} {...props} />,
              h3: ({node, ...props}) => <h3 style={{ color: '#6d28d9', marginTop: 16, marginBottom: 8 }} {...props} />,
              code: ({node, ...props}) => <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: 4, color: '#be185d' }} {...props} />,
              pre: ({node, ...props}) => <pre style={{ background: '#111827', padding: 16, borderRadius: 8, overflowX: 'auto', color: '#e5e7eb' }} {...props} />,
              a: ({node, ...props}) => <a style={{ color: '#7c3aed', textDecoration: 'none', fontWeight: 500 }} target="_blank" rel="noopener noreferrer" {...props} />,
              blockquote: ({node, ...props}) => <blockquote style={{ borderLeft: '4px solid #7c3aed', paddingLeft: 16, marginLeft: 0, color: '#4b5563', fontStyle: 'italic' }} {...props} />
            }}
          >
            {body}
          </ReactMarkdown>
        ) : (
          <p style={{ color: '#6b7280' }}>
            {content?.status === 'PENDING' ? 'Preparing to generate...' : 'Generating content...'}
          </p>
        )}
      </div>
    </div>
  );
}
