import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { phasesApi } from '../api/phases.api';
import { contentApi } from '../api/content.api';
import { tasksApi } from '../api/tasks.api';

export default function PhasePage() {
  const { phaseId } = useParams<{ phaseId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [customPrompt, setCustomPrompt] = useState('');

  const { data: phase } = useQuery({
    queryKey: ['phase', phaseId],
    queryFn: () => phasesApi.get(phaseId!),
    refetchOnWindowFocus: true,
    staleTime: 0,
    // Invalidate/refetch if any content is not COMPLETE or ERROR
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
  const TASK_TYPE_ICON: Record<string, string> = {
    READING: '📖', EXERCISE: '💻', PROJECT: '🚀', QUIZ: '🧪',
  };

  return (
    <div>
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', marginBottom: 16, fontWeight: 500 }}>
        ← Back
      </button>

      <div style={{ marginBottom: 32 }}>
        <span style={{ color: '#6b7280', fontSize: 13, fontWeight: 500 }}>Phase {p?.order}</span>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginTop: 4, color: '#111827' }}>{p?.title}</h1>
        <p style={{ color: '#4b5563', marginTop: 8 }}>{p?.description}</p>
      </div>

      {p?.objectives && (
        <div style={{ background: '#ffffff', borderRadius: 8, padding: 20, marginBottom: 24, border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginBottom: 12, fontSize: 14, color: '#7c3aed', fontWeight: 600 }}>Learning Objectives</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {(JSON.parse(p.objectives) as string[]).map((o: string, i: number) => (
              <li key={i} style={{ color: '#374151', padding: '4px 0', fontSize: 14 }}>✓ {o}</li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, marginBottom: 16, color: '#111827' }}>Learning Materials</h2>
        
        <div style={{ background: '#f9fafb', padding: 16, borderRadius: 8, border: '1px solid #e5e7eb', marginBottom: 20 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Ask for something specific:</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <input 
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g. Explain this with a pirate analogy..."
              style={{ flex: 1, padding: '8px 12px', borderRadius: 6, border: '1px solid #e5e7eb', fontSize: 14 }}
              onKeyDown={(e) => e.key === 'Enter' && customPrompt.trim() && generateContentMutation.mutate('CUSTOM')}
            />
            <button
              onClick={() => generateContentMutation.mutate('CUSTOM')}
              disabled={generateContentMutation.isPending || !customPrompt.trim()}
              style={{
                background: '#7c3aed', color: 'white', border: 'none',
                padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600
              }}
            >
              Ask AI
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {['EXPLANATION', 'EXAMPLE', 'SUMMARY', 'RESOURCE_LIST'].map((type) => (
            <button
              key={type}
              onClick={() => generateContentMutation.mutate(type)}
              disabled={generateContentMutation.isPending}
              style={{
                background: 'transparent', border: '1px solid #7c3aed', color: '#7c3aed',
                padding: '6px 14px', borderRadius: 4, cursor: 'pointer', fontSize: 13, fontWeight: 500
              }}
            >
              {type === 'RESOURCE_LIST' ? 'Resources' : type.toLowerCase()}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(p?.contents || []).map((content: any) => (
            <div
              key={content.id}
              onClick={() => navigate(`/content/${content.id}`)}
              style={{
                background: '#ffffff', borderRadius: 8, padding: 16,
                border: '1px solid #e5e7eb', cursor: 'pointer',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)'
              }}
            >
              <div style={{ color: '#111827', fontWeight: 500 }}>
                <span style={{ marginRight: 8 }}>{content.status === 'COMPLETE' ? '✅' : '⏳'}</span>
                <span>{content.title}</span>
              </div>
              <span style={{
                fontSize: 12, padding: '3px 8px', borderRadius: 12,
                background: content.status === 'COMPLETE' ? '#dcfce7' : '#dbeafe',
                color: content.status === 'COMPLETE' ? '#166534' : '#1e40af',
                fontWeight: 600
              }}>
                {content.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      <h2 style={{ fontSize: 18, marginBottom: 16, color: '#111827' }}>Tasks</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {(p?.tasks || []).map((task: any) => (
          <div
            key={task.id}
            onClick={() => navigate(`/tasks/${task.id}`)}
            style={{
              background: '#ffffff', borderRadius: 8, padding: 16,
              border: '1px solid #e5e7eb', cursor: 'pointer',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)'
            }}
          >
            <div style={{ color: '#111827', fontWeight: 500 }}>
              <span style={{ marginRight: 8 }}>{TASK_TYPE_ICON[task.type] || '📌'}</span>
              <span>{task.title}</span>
              <span style={{ marginLeft: 8, fontSize: 12, color: '#6b7280' }}>{task.type}</span>
            </div>
            <span style={{
              fontSize: 12, padding: '3px 8px', borderRadius: 12,
              background: task.status === 'PASSED' ? '#dcfce7' : '#f3f4f6',
              color: task.status === 'PASSED' ? '#166534' : '#6b7280',
              fontWeight: 600,
              border: '1px solid #e5e7eb',
            }}>
              {task.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
