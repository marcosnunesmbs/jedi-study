import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useRef } from 'react';
import { phasesApi } from '../api/phases.api';
import { contentApi } from '../api/content.api';
import confetti from 'canvas-confetti';
import { ChevronLeft, Radar, CheckCircle, Sparkles, BookOpen, Code, HelpCircle, ClipboardList, ChevronRight, FileText, Hourglass, ChevronDown, Layers, MessageSquareText, Loader2, Trophy, ArrowRight, PartyPopper, Brain, ListChecks, Swords, Zap } from 'lucide-react';

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
  const [showCelebration, setShowCelebration] = useState(false);
  const prevPhaseStatus = useRef<string | null>(null);
  const [awaitingTasks, setAwaitingTasks] = useState(false);

  const { data: phase, isLoading } = useQuery({
    queryKey: ['phase', phaseId],
    queryFn: () => phasesApi.get(phaseId!),
    refetchOnWindowFocus: true,
    staleTime: 0,
    refetchInterval: (query) => {
      const p = query.state.data as any;
      const hasPendingContent = p?.contents?.some((c: any) => c.status !== 'COMPLETE' && c.status !== 'ERROR');
      const stillAwaiting = awaitingTasks && (!p?.tasks || p.tasks.length === 0);
      return (hasPendingContent || stillAwaiting) ? 3000 : false;
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

  // Detect phase completion and trigger celebration
  useEffect(() => {
    const p = phase as any;
    if (!p) return;

    const celebratedKey = `phase-celebrated-${phaseId}`;
    const alreadyCelebrated = sessionStorage.getItem(celebratedKey);

    if (
      prevPhaseStatus.current &&
      prevPhaseStatus.current !== 'COMPLETED' &&
      p.status === 'COMPLETED' &&
      !alreadyCelebrated
    ) {
      sessionStorage.setItem(celebratedKey, 'true');
      setShowCelebration(true);
      // Fire confetti
      const duration = 3000;
      const end = Date.now() + duration;
      const frame = () => {
        confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 } });
        confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 } });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    }

    prevPhaseStatus.current = p.status;
  }, [(phase as any)?.status]);

  const generateTasksMutation = useMutation({
    mutationFn: () => phasesApi.generateTasks(phaseId!),
    onSuccess: () => {
      setAwaitingTasks(true);
      queryClient.invalidateQueries({ queryKey: ['phase', phaseId] });
    },
  });

  // Stop polling once tasks appear
  useEffect(() => {
    const p = phase as any;
    if (awaitingTasks && p?.tasks?.length > 0) {
      setAwaitingTasks(false);
    }
  }, [(phase as any)?.tasks?.length, awaitingTasks]);

  const p = phase as any;
  const TASK_TYPE_ICON: Record<string, any> = {
    CONCEPTUAL: <Brain size={20} />,
    CODE_CHALLENGE: <Code size={20} />,
    ANALYTICAL: <Swords size={20} />,
    MULTI_QUESTION: <ListChecks size={20} />,
    // Legacy types
    READING: <BookOpen size={20} />,
    EXERCISE: <Code size={20} />,
    QUIZ: <HelpCircle size={20} />,
  };

  const TASK_TYPE_COLORS: Record<string, { bg: string; color: string }> = {
    CONCEPTUAL: { bg: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' },
    CODE_CHALLENGE: { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981' },
    ANALYTICAL: { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' },
    MULTI_QUESTION: { bg: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed' },
  };

  const toggleTopic = (topic: string) => {
    setExpandedTopics(prev => ({ ...prev, [topic]: !prev[topic] }));
  };

  if (isLoading) return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-slate-500)' }}>Loading phase details...</div>;
  if (!p) return <div>Phase not found.</div>;

  const topics = p.topics || [];
  const contents = p.contents || [];

  // Topic coverage: each topic needs at least 1 COMPLETE content
  const topicsCovered = topics.filter((t: string) =>
    contents.some((c: any) => c.topic === t && c.status === 'COMPLETE')
  );
  const allTopicsCovered = topics.length > 0 && topicsCovered.length === topics.length;
  const hasTasks = p.tasks && p.tasks.length > 0;
  const canGenerateTasks = allTopicsCovered && !hasTasks && p.status === 'ACTIVE';

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

      {/* Progress Bar */}
      {p.tasks && p.tasks.length > 0 && (() => {
        const passedCount = p.tasks.filter((t: any) => t.status === 'PASSED').length;
        const totalCount = p.tasks.length;
        const pct = Math.round((passedCount / totalCount) * 100);
        return (
          <div className="card" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-slate-700)' }}>Phase Progress</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: pct === 100 ? '#10b981' : 'var(--text-slate-900)' }}>{passedCount}/{totalCount} tasks ({pct}%)</span>
            </div>
            <div style={{ width: '100%', height: '0.5rem', backgroundColor: 'var(--surface)', borderRadius: '1rem', overflow: 'hidden' }}>
              <div style={{
                width: `${pct}%`,
                height: '100%',
                backgroundColor: pct === 100 ? '#10b981' : 'var(--primary)',
                borderRadius: '1rem',
                transition: 'width 0.5s ease-out',
              }} />
            </div>
            {pct === 100 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem', padding: '0.75rem 1rem', backgroundColor: 'rgba(16, 185, 129, 0.05)', borderRadius: '0.5rem', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Trophy size={18} style={{ color: '#10b981' }} />
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#059669' }}>Congratulations! You completed this phase!</span>
                </div>
                <button
                  onClick={() => {
                    const duration = 3000;
                    const end = Date.now() + duration;
                    const frame = () => {
                      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 } });
                      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 } });
                      if (Date.now() < end) requestAnimationFrame(frame);
                    };
                    frame();
                  }}
                  style={{
                    background: 'none', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '0.5rem',
                    padding: '0.375rem 0.75rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
                    color: '#059669', display: 'flex', alignItems: 'center', gap: '0.375rem',
                  }}
                >
                  <PartyPopper size={14} />
                  Celebrate!
                </button>
              </div>
            )}
          </div>
        );
      })()}

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
                    {topicContents.some((c: any) => c.status === 'COMPLETE') ? (
                      <CheckCircle size={16} style={{ color: '#10b981' }} />
                    ) : (
                      <span style={{ fontSize: '0.625rem', color: '#f59e0b', fontWeight: 600, backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '0.125rem 0.5rem', borderRadius: '1rem' }}>
                        Not studied
                      </span>
                    )}
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

      {/* 3. Challenges */}
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-slate-900)', margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Zap size={24} style={{ color: 'var(--primary)' }} />
          Challenges
        </h2>

        {hasTasks ? (
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {p.tasks.map((task: any) => {
              const typeStyle = TASK_TYPE_COLORS[task.type] || { bg: 'var(--surface)', color: 'var(--text-slate-500)' };
              return (
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
                      backgroundColor: typeStyle.bg, color: typeStyle.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {TASK_TYPE_ICON[task.type] || <ClipboardList size={20} />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-slate-900)', marginBottom: '0.25rem' }}>{task.title}</div>
                      <span style={{
                        fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                        padding: '0.125rem 0.5rem', borderRadius: '1rem',
                        backgroundColor: typeStyle.bg, color: typeStyle.color,
                      }}>
                        {task.type.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span className="badge" style={{ backgroundColor: STATUS_BG[task.status] || 'var(--surface)', color: STATUS_COLOR[task.status] || 'var(--text-slate-500)' }}>
                      {task.status}
                    </span>
                    <ChevronRight size={20} style={{ color: 'var(--text-slate-400)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
            {!allTopicsCovered ? (
              <>
                <div style={{ marginBottom: '1rem' }}>
                  <Zap size={32} style={{ color: 'var(--text-slate-300)' }} />
                </div>
                <p style={{ fontWeight: 600, color: 'var(--text-slate-700)', margin: '0 0 0.5rem 0' }}>
                  Study all topics to unlock challenges
                </p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-slate-500)', margin: '0 0 1rem 0' }}>
                  Generate at least one content for each topic before generating your challenges.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {topics.map((topic: string, i: number) => {
                    const covered = contents.some((c: any) => c.topic === topic && c.status === 'COMPLETE');
                    return (
                      <span key={i} style={{
                        fontSize: '0.75rem', padding: '0.25rem 0.75rem', borderRadius: '1rem',
                        backgroundColor: covered ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        color: covered ? '#10b981' : '#f59e0b',
                        fontWeight: 600,
                        display: 'flex', alignItems: 'center', gap: '0.25rem',
                      }}>
                        {covered ? <CheckCircle size={12} /> : null}
                        {topic}
                      </span>
                    );
                  })}
                </div>
              </>
            ) : generateTasksMutation.isPending || generateTasksMutation.isSuccess ? (
              <>
                <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
                <p style={{ fontWeight: 600, color: 'var(--text-slate-700)', margin: '0 0 0.5rem 0' }}>
                  Generating your challenges...
                </p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-slate-500)', margin: 0 }}>
                  Our AI is crafting personalized challenges based on your study content.
                </p>
              </>
            ) : (
              <>
                <div style={{ marginBottom: '1rem' }}>
                  <Zap size={32} style={{ color: 'var(--primary)' }} />
                </div>
                <p style={{ fontWeight: 600, color: 'var(--text-slate-700)', margin: '0 0 0.5rem 0' }}>
                  All topics covered! Ready to test your knowledge.
                </p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-slate-500)', margin: '0 0 1.5rem 0' }}>
                  Generate challenges based on everything you've studied in this phase.
                </p>
                <button
                  className="btn-primary"
                  onClick={() => generateTasksMutation.mutate()}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', fontSize: '1rem' }}
                >
                  <Zap size={20} />
                  Generate My Challenges
                </button>
                {generateTasksMutation.isError && (
                  <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '1rem' }}>
                    Failed to generate challenges. Please try again.
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Celebration Modal */}
      {showCelebration && (() => {
        const passedTasks = (p.tasks || []).filter((t: any) => t.status === 'PASSED');
        const totalTasks = (p.tasks || []).length;
        const submissions = passedTasks.flatMap((t: any) => (t.submissions || []).filter((s: any) => s.analysis?.score != null));
        const avgScore = submissions.length > 0
          ? Math.round(submissions.reduce((sum: number, s: any) => sum + s.analysis.score, 0) / submissions.length)
          : null;
        const isLastPhase = p.studyPath && p.order >= p.studyPath.totalPhases;
        const subjectId = p.studyPath?.subjectId;

        return (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, animation: 'fadeIn 0.3s ease-out' }}>
            <div className="card" style={{ padding: '2.5rem', maxWidth: '480px', width: '90%', textAlign: 'center', animation: 'slideUp 0.4s ease-out' }}>
              <div style={{ width: '4rem', height: '4rem', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                <Trophy size={32} style={{ color: '#10b981' }} />
              </div>

              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-slate-900)', margin: '0 0 0.5rem 0' }}>
                {isLastPhase ? 'Study Path Complete!' : 'Phase Complete!'}
              </h2>
              <p style={{ color: 'var(--text-slate-500)', margin: '0 0 1.5rem 0', fontSize: '0.875rem' }}>
                {isLastPhase
                  ? 'Congratulations! You have completed all phases of this study path!'
                  : `Great job completing Phase ${p.order} — ${p.title}!`}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: avgScore != null ? '1fr 1fr' : '1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ padding: '1rem', backgroundColor: 'rgba(16, 185, 129, 0.05)', borderRadius: '0.75rem', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#10b981' }}>{passedTasks.length}/{totalTasks}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-slate-500)', fontWeight: 500 }}>Tasks Completed</div>
                </div>
                {avgScore != null && (
                  <div style={{ padding: '1rem', backgroundColor: 'rgba(124, 58, 237, 0.05)', borderRadius: '0.75rem', border: '1px solid rgba(124, 58, 237, 0.15)' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)' }}>{avgScore}<span style={{ fontSize: '0.875rem', fontWeight: 400 }}>/100</span></div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-slate-500)', fontWeight: 500 }}>Avg. Score</div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                <button
                  onClick={() => setShowCelebration(false)}
                  style={{ padding: '0.625rem 1.25rem', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 500, color: 'var(--text-slate-600)', fontSize: '0.875rem' }}
                >
                  Close
                </button>
                <button
                  className="btn-primary"
                  onClick={() => {
                    setShowCelebration(false);
                    if (isLastPhase && subjectId) {
                      navigate(`/subjects/${subjectId}`);
                    } else if (subjectId) {
                      // Navigate to subject page where user can access the next unlocked phase
                      navigate(`/subjects/${subjectId}`);
                    }
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', fontSize: '0.875rem' }}
                >
                  {isLastPhase ? 'Back to Subject' : 'Next Phase'}
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
