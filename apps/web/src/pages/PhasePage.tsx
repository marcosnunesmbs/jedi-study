import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useRef } from 'react';
import { phasesApi } from '../api/phases.api';
import { contentApi } from '../api/content.api';
import { ChevronLeft, Radar, CheckCircle, Sparkles, BookOpen, Code, Rocket, HelpCircle, ClipboardList, ChevronRight, FileText, Hourglass, AlertCircle, ChevronDown, Layers, MessageSquareText, Loader2 } from 'lucide-react';

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

const CONTENT_TYPES = [
  { type: 'EXPLANATION', label: 'Explanation' },
  { type: 'EXAMPLE', label: 'Example' },
  { type: 'SUMMARY', label: 'Summary' },
  { type: 'RESOURCE_LIST', label: 'Resources' },
];

export default function PhasePage() {
  const { phaseId } = useParams<{ phaseId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [customPrompt, setCustomPrompt] = useState('');
  const hasTriggeredPrompt = useRef<string | null>(null);
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});

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
    mutationFn: ({ type, topic }: { type: string, topic?: string }) => 
      contentApi.generate(phaseId!, type, type === 'CUSTOM' ? customPrompt : undefined, topic),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['phase', phaseId] });
      setCustomPrompt('');
    },
  });

  useEffect(() => {
    const prompt = location.state?.autoAskAiPrompt;
    if (prompt && hasTriggeredPrompt.current !== prompt) {
      hasTriggeredPrompt.current = prompt;
      setCustomPrompt(prompt);
      contentApi.generate(phaseId!, 'CUSTOM', prompt).then(() => {
        queryClient.invalidateQueries({ queryKey: ['phase', phaseId] });
      });
      // Clear state so it doesn't run again on reload
      navigate('.', { replace: true, state: {} });
    }
  }, [location.state, phaseId, navigate, queryClient]);

  const p = phase as any;
  const TASK_TYPE_ICON: Record<string, any> = {
    READING: <BookOpen size={20} />, 
    EXERCISE: <Code size={20} />, 
    PROJECT: <Rocket size={20} />, 
    QUIZ: <HelpCircle size={20} />,
  };

  const toggleTopic = (topic: string) => {
    setExpandedTopics(prev => ({ ...prev, [topic]: !prev[topic] }));
  };

  if (isLoading) return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-slate-500)' }}>Loading phase details...</div>;
  if (!p) return <div>Phase not found.</div>;

  const topics = p.topics || [];
  const contents = p.contents || [];
  
  // Group contents
  const contentsByTopic: Record<string, any[]> = {};
  const standardGeneralContents: any[] = [];
  const customContents: any[] = [];

  contents.forEach((content: any) => {
    if (content.topic) {
      if (!contentsByTopic[content.topic]) contentsByTopic[content.topic] = [];
      contentsByTopic[content.topic].push(content);
    } else if (content.type === 'CUSTOM') {
      customContents.push(content);
    } else {
      standardGeneralContents.push(content);
    }
  });

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
            {(typeof p.objectives === 'string' ? JSON.parse(p.objectives) : p.objectives).map((o: string, i: number) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: 'var(--text-slate-600)', fontSize: '0.875rem', lineHeight: 1.5 }}>
                <CheckCircle size={20} style={{ color: '#10b981', flexShrink: 0 }} />
                {o}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 1. Learning Materials (Topics + General) */}
      <div style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-slate-900)', margin: 0 }}>Learning Materials</h2>
          {topics.length > 0 && (
            <span style={{ fontSize: '0.875rem', color: 'var(--text-slate-500)', fontWeight: 500 }}>
              {topics.length} topics identified
            </span>
          )}
        </div>
        
        <div style={{ display: 'grid', gap: '1rem' }}>
          {topics.map((topic: string, index: number) => {
            const isExpanded = expandedTopics[topic] ?? true;
            const topicContents = contentsByTopic[topic] || [];
            
            return (
              <div key={index} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div 
                  onClick={() => toggleTopic(topic)}
                  style={{ 
                    padding: '1rem 1.25rem', backgroundColor: 'var(--surface)', cursor: 'pointer',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    borderBottom: isExpanded ? '1px solid var(--border-color)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Layers size={18} style={{ color: 'var(--primary)' }} />
                    <span style={{ fontWeight: 600, color: 'var(--text-slate-900)' }}>{topic}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-slate-500)', backgroundColor: 'white', padding: '0.125rem 0.5rem', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
                      {topicContents.length}
                    </span>
                  </div>
                  <ChevronDown size={20} style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', color: 'var(--text-slate-400)' }} />
                </div>

                {isExpanded && (
                  <div style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-slate-400)', textTransform: 'uppercase', width: '100%', marginBottom: '0.25rem' }}>Generate content:</span>
                      {CONTENT_TYPES.map((ct) => {
                        const isThisPending = generateContentMutation.isPending && 
                          generateContentMutation.variables?.type === ct.type && 
                          generateContentMutation.variables?.topic === topic;
                        
                        return (
                          <button
                            key={ct.type}
                            onClick={() => generateContentMutation.mutate({ type: ct.type, topic })}
                            disabled={generateContentMutation.isPending}
                            style={{
                              background: 'var(--surface)', border: '1px solid var(--border-color)', color: isThisPending ? 'var(--primary)' : 'var(--text-slate-600)',
                              padding: '0.375rem 0.75rem', borderRadius: '0.5rem', cursor: generateContentMutation.isPending ? 'not-allowed' : 'pointer', fontSize: '0.75rem', fontWeight: 500,
                              display: 'flex', alignItems: 'center', gap: '0.25rem', transition: 'all 0.2s',
                              opacity: generateContentMutation.isPending && !isThisPending ? 0.6 : 1
                            }}
                            onMouseOver={(e) => { if (!generateContentMutation.isPending) { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; } }}
                            onMouseOut={(e) => { if (!generateContentMutation.isPending) { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-slate-600)'; } }}
                          >
                            {isThisPending ? <Loader2 size={14} className="animate-spin" /> : null}
                            {ct.label}
                          </button>
                        );
                      })}
                    </div>

                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                      {topicContents.map((content) => (
                        <div
                          key={content.id}
                          onClick={() => navigate(`/content/${content.id}`)}
                          style={{
                            padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer',
                            backgroundColor: 'var(--surface)', transition: 'all 0.2s'
                          }}
                          onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.backgroundColor = 'var(--background-light)'; }}
                          onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.backgroundColor = 'var(--surface)'; }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ color: STATUS_COLOR[content.status] }}>
                              {content.status === 'COMPLETE' ? <FileText size={16} /> : <Hourglass size={16} />}
                            </div>
                            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{content.title}</span>
                          </div>
                          <span style={{ fontSize: '0.75rem', color: STATUS_COLOR[content.status], fontWeight: 600 }}>{content.status}</span>
                        </div>
                      ))}
                      {topicContents.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '1rem', fontSize: '0.875rem', color: 'var(--text-slate-400)', border: '1px dashed var(--border-color)', borderRadius: '0.5rem' }}>
                          No content for this topic yet.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Standard General contents (non-custom, no topic) */}
          {standardGeneralContents.length > 0 && (
            <div className="card" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-slate-900)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Layers size={18} style={{ color: 'var(--text-slate-400)' }} />
                General Materials
              </h3>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {standardGeneralContents.map((content: any) => (
                  <div
                    key={content.id}
                    onClick={() => navigate(`/content/${content.id}`)}
                    style={{
                      padding: '1rem 1.25rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer',
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
                        {content.status === 'COMPLETE' ? <FileText size={20} /> : <Hourglass size={20} />}
                      </div>
                      <span style={{ fontWeight: 500, color: 'var(--text-slate-900)' }}>{content.title}</span>
                    </div>
                    <span className="badge" style={{ backgroundColor: STATUS_BG[content.status] || 'var(--surface)', color: STATUS_COLOR[content.status] || 'var(--text-slate-500)' }}>
                      {content.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {topics.length === 0 && standardGeneralContents.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-slate-500)', border: '1px dashed var(--border-color)', borderRadius: '0.75rem' }}>
              No standard learning materials yet.
            </div>
          )}
        </div>
      </div>

      {/* 2. ASK to AI (Custom contents + Input) */}
      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-slate-900)', margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MessageSquareText size={24} style={{ color: 'var(--primary)' }} />
          Ask to AI
        </h2>

        <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem', backgroundColor: 'var(--surface)', borderStyle: 'dashed' }}>
          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-slate-700)', margin: '0 0 0.75rem 0' }}>Ask AI for specific content regarding this phase:</p>
          <div className="input-button-group">
            <input
              className="input-field"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g. Explain this with a real-world example..."
              onKeyDown={(e) => e.key === 'Enter' && customPrompt.trim() && generateContentMutation.mutate({ type: 'CUSTOM' })}
            />
            <button
              className="btn-primary"
              onClick={() => generateContentMutation.mutate({ type: 'CUSTOM' })}
              disabled={generateContentMutation.isPending || !customPrompt.trim()}
            >
              {generateContentMutation.isPending && generateContentMutation.variables?.type === 'CUSTOM' ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Sparkles size={20} />
              )}
              {generateContentMutation.isPending && generateContentMutation.variables?.type === 'CUSTOM' ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </div>

        {customContents.length > 0 && (
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {customContents.map((content: any) => (
              <div
                key={content.id}
                onClick={() => navigate(`/content/${content.id}`)}
                style={{
                  padding: '1rem 1.25rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer',
                  backgroundColor: 'var(--surface)',
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
                    {content.status === 'COMPLETE' ? <Sparkles size={18} /> : <Hourglass size={18} />}
                  </div>
                  <span style={{ fontWeight: 500, color: 'var(--text-slate-900)' }}>{content.title}</span>
                </div>
                <span className="badge" style={{ backgroundColor: STATUS_BG[content.status] || 'var(--surface)', color: STATUS_COLOR[content.status] || 'var(--text-slate-500)' }}>
                  {content.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Tasks & Exercises */}
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
