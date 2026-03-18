import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { contentApi } from '../api/content.api';
import { ChevronLeft, Clock, Sparkles } from 'lucide-react';

export default function ContentPage() {
  const { contentId } = useParams<{ contentId: string }>();
  const navigate = useNavigate();
  const [streamedContent, setStreamedContent] = useState<string | null>(null);
  const [selection, setSelection] = useState<{ text: string; x: number; y: number } | null>(null);

  useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      const sel = window.getSelection();
      if (sel && sel.toString().trim().length > 0) {
        setTimeout(() => {
          try {
            setSelection({
              text: sel.toString().trim(),
              x: e.clientX,
              y: e.clientY - 60, // Position slightly above the mouse
            });
          } catch (err) {
            setSelection(null);
          }
        }, 0);
      } else {
        setSelection(null);
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const { data: content, refetch } = useQuery({
    queryKey: ['content', contentId],
    queryFn: () => contentApi.get(contentId!).then(res => res.data || res),
  });

  useEffect(() => {
    if (!content || content.status === 'COMPLETE' || content.status === 'ERROR') return;

    const url = contentApi.streamUrl(contentId!);
    const eventSource = new EventSource(url);

    eventSource.addEventListener('content', (e) => {
      const data = JSON.parse(e.data);
      setStreamedContent(data.body);
    });

    eventSource.addEventListener('done', () => {
      eventSource.close();
      refetch();
    });

    eventSource.addEventListener('error', (e) => {
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
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <button 
        onClick={() => navigate(-1)} 
        style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-slate-500)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, padding: 0, marginBottom: '2rem' }}
      >
        <ChevronLeft size={20} />
        Back to Phase
      </button>

      <article style={{ maxWidth: '720px', margin: '0 auto', paddingBottom: '4rem', position: 'relative' }}>
        {selection && content?.phaseId && (
          <div 
            style={{
              position: 'fixed',
              left: `${selection.x}px`,
              top: `${Math.max(10, selection.y)}px`,
              transform: 'translateX(-50%)',
              backgroundColor: 'var(--text-slate-900)',
              color: 'white',
              padding: '0.5rem 0.75rem',
              borderRadius: '0.5rem',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              zIndex: 100,
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 500
            }}
            onMouseDown={(e) => {
              e.preventDefault(); // prevents selection from clearing
              e.stopPropagation();
              navigate(`/phases/${content.phaseId}`, { 
                state: { autoAskAiPrompt: `Can you explain this?\n\n> "${selection.text}"` } 
              });
            }}
          >
            <Sparkles size={16} style={{ color: 'var(--primary)' }} />
            Ask AI about this
          </div>
        )}

        <header style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <span style={{ backgroundColor: 'rgba(124, 58, 237, 0.1)', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 'bold', padding: '0.25rem 0.75rem', borderRadius: '9999px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {content?.type || 'Material'}
            </span>
            {content?.topic && (
              <span style={{ backgroundColor: 'var(--surface)', color: 'var(--text-slate-600)', fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.75rem', borderRadius: '9999px', border: '1px solid var(--border-color)' }}>
                Topic: {content.topic}
              </span>
            )}
            <span style={{ color: 'var(--text-slate-400)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Clock size={18} />
              {content?.status === 'COMPLETE' ? 'Ready to read' : content?.status}
            </span>
          </div>
          
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-slate-900)', lineHeight: 1.2, margin: '0 0 1rem 0' }}>
            {content?.title || 'Loading content...'}
          </h1>
          
          <p style={{ fontSize: '1.25rem', color: 'var(--text-slate-500)', fontStyle: 'italic', fontFamily: 'Georgia, serif', margin: 0 }}>
            {content?.status === 'PENDING' ? 'Preparing the Holocron...' : content?.status === 'GENERATING' ? 'Channeling the Force to generate knowledge...' : ''}
          </p>

          <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', backgroundColor: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
               <Sparkles size={20} />
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-slate-900)', margin: 0 }}>Jedi Study AI</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-slate-500)', margin: 0 }}>Knowledge Synthesizer</p>
            </div>
          </div>
        </header>

        <div className="prose-content">
          {body ? (
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                table: ({node, ...props}) => (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="styled-table" {...props} />
                  </div>
                ),
              }}
            >
              {body}
            </ReactMarkdown>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem 0', color: 'var(--text-slate-400)' }}>
               <div style={{ width: '3rem', height: '3rem', borderRadius: '50%', border: '3px solid var(--surface)', borderTopColor: 'var(--primary)', animation: 'spin 1s linear infinite', marginBottom: '1rem' }}></div>
               <p>Compiling archives...</p>
            </div>
          )}
        </div>
      </article>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
