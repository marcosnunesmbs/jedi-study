import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '../api/tasks.api';
import { ChevronLeft, CheckCircle, Info, RefreshCw, Send } from 'lucide-react';

export default function TaskPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [submission, setSubmission] = useState('');
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [hasLoadedInitial, setHasLoadedInitial] = useState(false);

  const { data: task } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => tasksApi.get(taskId!),
    staleTime: 0,
  });

  useEffect(() => {
    const lastSubmission = (task as any)?.submissions?.[0];
    if (lastSubmission && !hasLoadedInitial) {
      setSubmissionId(lastSubmission.id);
      if (lastSubmission.content) setSubmission(lastSubmission.content);
      setHasLoadedInitial(true);
    } else if (task && !hasLoadedInitial) {
      setHasLoadedInitial(true);
    }
  }, [task, hasLoadedInitial]);

  const { data: analysis, refetch: refetchAnalysis } = useQuery({
    queryKey: ['analysis', submissionId],
    queryFn: () => tasksApi.getAnalysis(submissionId!),
    enabled: !!submissionId,
    retry: false,
  });

  const submitMutation = useMutation({
    mutationFn: (content: string) => tasksApi.submit(taskId!, content),
    onSuccess: (res: any) => {
      setSubmissionId(res.submissionId);
      const phaseId = (task as any)?.phaseId;
      if (phaseId) {
        queryClient.invalidateQueries({ queryKey: ['phase', phaseId] });
      }
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
    },
  });

  const handleBack = () => {
    const phaseId = (task as any)?.phaseId;
    if (phaseId) {
      queryClient.invalidateQueries({ queryKey: ['phase', phaseId] });
    }
    queryClient.invalidateQueries({ queryKey: ['task', taskId] });
    navigate(-1);
  };

  useEffect(() => {
    if (!submissionId || (analysis as any)?.feedback) return;
    const timer = setInterval(() => refetchAnalysis(), 3000);
    return () => clearInterval(timer);
  }, [submissionId, (analysis as any)?.feedback]);

  useEffect(() => {
    if ((analysis as any)?.passed && (task as any)?.phaseId) {
      queryClient.invalidateQueries({ queryKey: ['phase', (task as any).phaseId] });
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
    }
  }, [analysis, (task as any)?.phaseId, taskId, queryClient]);

  const t = task as any;
  const a = (submissionId || !hasLoadedInitial) 
    ? (analysis || t?.submissions?.[0]?.analysis)
    : null;

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out', height: 'calc(100vh - 8rem)', display: 'flex', flexDirection: 'column', margin: '-2rem' }}>
      {/* Header bar within the page */}
      <div style={{ padding: '1rem 2rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', backgroundColor: 'white', zIndex: 5 }}>
        <button onClick={handleBack} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-slate-500)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, padding: 0 }}>
          <ChevronLeft size={20} />
          Back to Phase
        </button>
        <div style={{ width: '1px', height: '1.5rem', backgroundColor: 'var(--border-color)', margin: '0 1rem' }}></div>
        <span className="badge badge-indigo">{t?.type}</span>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Panel - Task Description */}
        <section style={{ width: '50%', overflowY: 'auto', padding: '2rem', borderRight: '1px solid var(--border-color)', backgroundColor: 'white' }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-slate-900)', marginBottom: '1rem' }}>{t?.title}</h1>
          <div style={{ color: 'var(--text-slate-600)', lineHeight: 1.6, fontSize: '1rem', whiteSpace: 'pre-wrap' }}>
            {t?.description}
          </div>

          {a && (
            <div style={{ marginTop: '3rem', animation: 'slideUp 0.3s ease-out' }}>
              <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--surface)', borderRadius: '0.75rem 0.75rem 0 0', border: '1px solid var(--border-color)' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-slate-900)', margin: 0 }}>
                    Result: <span style={{ color: a.passed ? '#10b981' : '#f59e0b', fontStyle: 'italic' }}>{a.passed ? 'APPROVED' : 'NEEDS WORK'}</span>
                  </h2>
                  <p style={{ color: 'var(--text-slate-500)', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>Evaluated by AI</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '2.25rem', fontWeight: 900, color: a.passed ? '#10b981' : '#f59e0b', lineHeight: 1 }}>
                    {a.score}<span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-slate-400)' }}>/100</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', backgroundColor: 'var(--border-color)', border: '1px solid var(--border-color)', borderTop: 'none', borderRadius: '0 0 0.75rem 0.75rem', overflow: 'hidden' }}>
                <div style={{ backgroundColor: 'white', padding: '1.5rem' }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#059669', fontWeight: 600, margin: '0 0 1rem 0' }}>
                    <CheckCircle size={20} /> Strengths
                  </h3>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {(a.strengths || []).map((s: string, i: number) => (
                      <li key={i} style={{ padding: '0.75rem', backgroundColor: '#ecfdf5', border: '1px solid #d1fae5', borderRadius: '0.5rem', fontSize: '0.875rem', color: '#065f46' }}>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div style={{ backgroundColor: 'white', padding: '1.5rem' }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#d97706', fontWeight: 600, margin: '0 0 1rem 0' }}>
                    <Info size={20} /> Improvements
                  </h3>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {(a.improvements || []).map((s: string, i: number) => (
                      <li key={i} style={{ padding: '0.75rem', backgroundColor: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '0.5rem', fontSize: '0.875rem', color: '#92400e' }}>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'var(--surface)', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
                <p style={{ margin: 0, color: 'var(--text-slate-700)', fontSize: '0.875rem', lineHeight: 1.6 }}>{a.feedback}</p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button
                  onClick={() => { setSubmissionId(null); setSubmission(t?.submissions?.[0]?.content || ''); }}
                  className="btn-primary"
                  style={{ background: 'transparent', color: 'var(--text-slate-600)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <RefreshCw size={18} />
                  {a.passed ? 'Submit Alternative Version' : 'Try Again'}
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Right Panel - Text Editor / Submission Area */}
        <section style={{ width: '50%', display: 'flex', flexDirection: 'column', backgroundColor: '#010409' }}>
          <div style={{ height: '2.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', padding: '0 1rem', justifyContent: 'space-between', backgroundColor: 'rgba(0,0,0,0.2)' }}>
            <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-slate-500)' }}>submission.txt</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', backgroundColor: 'rgba(239,68,68,0.3)' }}></div>
              <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', backgroundColor: 'rgba(245,158,11,0.3)' }}></div>
              <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', backgroundColor: 'rgba(16,185,129,0.3)' }}></div>
            </div>
          </div>
          
          <div style={{ flex: 1, position: 'relative' }}>
            <textarea
              value={submission}
              onChange={(e) => setSubmission(e.target.value)}
              disabled={!!a || submissionId !== null}
              placeholder={t?.type === 'PROJECT' ? '// Describe your project, share a GitHub link, or paste your code...' : '// Write your answer here...'}
              spellCheck="false"
              style={{
                width: '100%', height: '100%', backgroundColor: 'transparent', padding: '1.5rem',
                fontFamily: 'monospace', fontSize: '0.875rem', lineHeight: 1.6, color: '#e0e7ff',
                border: 'none', resize: 'none', outline: 'none'
              }}
            />
            
            {submissionId && !a && (
              <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(1,4,9,0.8)', backdropFilter: 'blur(4px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <div style={{ width: '3rem', height: '3rem', borderRadius: '50%', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--primary)', animation: 'spin 1s linear infinite', marginBottom: '1rem' }}></div>
                <p style={{ fontWeight: 500, color: 'var(--text-slate-300)' }}>AI Oracle is analyzing your code...</p>
              </div>
            )}
          </div>

          {(!a && !submissionId) && (
            <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(0,0,0,0.2)', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className="btn-primary"
                onClick={() => submitMutation.mutate(submission)}
                disabled={!submission.trim() || submitMutation.isPending}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                {submitMutation.isPending ? 'Submitting...' : 'Submit Solution'}
                <Send size={18} />
              </button>
            </div>
          )}
        </section>
      </div>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
