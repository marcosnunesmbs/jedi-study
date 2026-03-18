import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { phasesApi } from '../api/phases.api';
import { contentApi } from '../api/content.api';
import { ChevronLeft, Radar, CheckCircle, Sparkles, BookOpen, Code, Rocket, HelpCircle, ClipboardList, ChevronRight, FileText, Hourglass, AlertCircle } from 'lucide-react';

const STATUS_COLOR: Record<string, string> = {
  COMPLETE: '#10b981',
  GENERATING: '#f59e0b',
  ERROR: '#ef4444',
  PASSED: '#10b981',
  FAILED: '#ef4444',
  PENDING: '#6b7280',
};

const STATUS_BG: Record<string, string> = {
  COMPLETE: 'rgba(16, 185, 129, 0.1)',
  GENERATING: 'rgba(245, 158, 11, 0.1)',
  ERROR: 'rgba(239, 68, 68, 0.1)',
  PASSED: 'rgba(16, 185, 129, 0.1)',
  FAILED: 'rgba(239, 68, 68, 0.1)',
  PENDING: 'rgba(107, 114, 128, 0.1)',
};

export default function PhasePage() {
  const { phaseId } = useParams<{ phaseId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [customPrompt, setCustomPrompt] = useState('');

  const { data: phase, isLoading } = useQuery({
    queryKey: ['phase', phaseId],
    queryFn: () => phasesApi.get(phaseId!),
    refetchOnWindowFocus: true,
    staleTime: 0,
    refetchInterval: (query) => {
      const p = query.state.data as any;
      const hasPending = p?.contents?.some((c: any) => c.status !== 'COMPLETE' && c.status !== 'ERROR');
      return hasPending ? 3000 : false;
    }
  });

  const generateContentMutation = useMutation({
    mutationFn: (type: string) => contentApi.generate(phaseId!, type, type === 'CUSTOM' ? customPrompt : undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['phase', phaseId] });
      setCustomPrompt('');
    },
  });

  const p = phase as any;
  const TASK_TYPE_ICON: Record<string, any> = {
    READING: <BookOpen size={20} />, 
    EXERCISE: <Code size={20} />, 
    PROJECT: <Rocket size={20} />, 
    QUIZ: <HelpCircle size={20} />,
  };

  if (isLoading) return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-slate-500)' }}>Loading phase details...</div>;
  if (!p) return <div>Phase not found.</div>;

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-slate-500)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, padding: 0 }}>
          <ChevronLeft size={20} />
          Back
        </button>
      </div>

      <div style={{ marginBottom: '2.5rem' }}>
        <span style={{ color: 'var(--primary)', fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phase {p.order}</span>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: 'var(--text-slate-900)', margin: '0.25rem 0 0.5rem 0' }}>{p.title}</h1>
        <p style={{ color: 'var(--text-slate-500)', fontSize: '1rem', lineHeight: 1.6, maxWidth: '48rem', margin: 0 }}>{p.description}</p>
      </div>

      {p.objectives && (
        <div className="card" style={{ padding: '1.5rem', marginBottom: '2.5rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-slate-900)', fontSize: '1.125rem', fontWeight: 600, margin: '0 0 1rem 0' }}>
            <Radar size={20} style={{ color: 'var(--primary)' }} />
            Learning Objectives
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0.75rem' }}>
            {(JSON.parse(p.objectives) as string[]).map((o: string, i: number) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: 'var(--text-slate-600)', fontSize: '0.875rem', lineHeight: 1.5 }}>
                <CheckCircle size={20} style={{ color: '#10b981', flexShrink: 0 }} />
                {o}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-slate-900)', margin: '0 0 1.5rem 0' }}>Learning Materials</h2>
        
        <div className="card" style={{ padding: '1.25rem', backgroundColor: 'var(--surface)', borderStyle: 'dashed', marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-slate-700)', margin: '0 0 0.75rem 0' }}>Ask AI for specific content:</p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <input 
              className="input-field"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g. Explain this with a real-world example..."
              onKeyDown={(e) => e.key === 'Enter' && customPrompt.trim() && generateContentMutation.mutate('CUSTOM')}
              style={{ flex: 1, backgroundColor: 'white' }}
            />
            <button
              className="btn-primary"
              onClick={() => generateContentMutation.mutate('CUSTOM')}
              disabled={generateContentMutation.isPending || !customPrompt.trim()}
            >
              <Sparkles size={20} />
              Generate
            </button>
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
            {['EXPLANATION', 'EXAMPLE', 'SUMMARY', 'RESOURCE_LIST'].map((type) => (
              <button
                key={type}
                onClick={() => generateContentMutation.mutate(type)}
                disabled={generateContentMutation.isPending}
                style={{
                  background: 'white', border: '1px solid var(--border-color)', color: 'var(--text-slate-600)',
                  padding: '0.375rem 0.75rem', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 500,
                  display: 'flex', alignItems: 'center', gap: '0.25rem', transition: 'all 0.2s'
                }}
                onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
                onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-slate-600)'; }}
              >
                {type === 'RESOURCE_LIST' ? 'Resources' : type.charAt(0) + type.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {(p.contents || []).map((content: any) => (
            <div
              key={content.id}
              className="card"
              onClick={() => navigate(`/content/${content.id}`)}
              style={{
                padding: '1rem 1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                borderLeft: content.status === 'COMPLETE' ? '4px solid #10b981' : content.status === 'GENERATING' ? '4px solid #f59e0b' : '1px solid var(--border-color)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ 
                  width: '2rem', height: '2rem', borderRadius: '0.5rem', 
                  backgroundColor: STATUS_BG[content.status] || 'var(--surface)',
                  color: STATUS_COLOR[content.status] || 'var(--text-slate-400)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {content.status === 'COMPLETE' ? <FileText size={20} /> : content.status === 'GENERATING' ? <Hourglass size={20} /> : <AlertCircle size={20} />}
                </div>
                <span style={{ fontWeight: 500, color: 'var(--text-slate-900)' }}>{content.title}</span>
              </div>
              <span className="badge" style={{ backgroundColor: STATUS_BG[content.status] || 'var(--surface)', color: STATUS_COLOR[content.status] || 'var(--text-slate-500)' }}>
                {content.status}
              </span>
            </div>
          ))}
          {(!p.contents || p.contents.length === 0) && (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-slate-500)', border: '1px dashed var(--border-color)', borderRadius: '0.75rem' }}>
              No learning materials yet. Ask AI to generate some!
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-slate-900)', margin: '0 0 1.5rem 0' }}>Tasks & Exercises</h2>
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {(p.tasks || []).map((task: any) => (
            <div
              key={task.id}
              className="card"
              onClick={() => navigate(`/tasks/${task.id}`)}
              style={{
                padding: '1rem 1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ 
                  width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem', 
                  backgroundColor: 'var(--surface)', color: 'var(--text-slate-600)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {TASK_TYPE_ICON[task.type] || <ClipboardList size={20} />}
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-slate-900)', marginBottom: '0.125rem' }}>{task.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-slate-500)', textTransform: 'capitalize' }}>{task.type.toLowerCase()}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span className="badge" style={{ backgroundColor: STATUS_BG[task.status] || 'var(--surface)', color: STATUS_COLOR[task.status] || 'var(--text-slate-500)' }}>
                  {task.status}
                </span>
                <ChevronRight size={20} style={{ color: 'var(--text-slate-400)' }} />
              </div>
            </div>
          ))}
          {(!p.tasks || p.tasks.length === 0) && (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-slate-500)', border: '1px dashed var(--border-color)', borderRadius: '0.75rem' }}>
              No tasks available for this phase.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
