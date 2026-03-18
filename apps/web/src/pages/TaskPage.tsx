import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '../api/tasks.api';

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

  // Automatically set submissionId if there's a recent submission (only on first load)
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
      // Invalidate the phase query because task status changed
      const phaseId = (task as any)?.phaseId;
      if (phaseId) {
        queryClient.invalidateQueries({ queryKey: ['phase', phaseId] });
      }
      // Also invalidate this task's query to get the new submission list
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

  // Poll for analysis result
  useEffect(() => {
    if (!submissionId || (analysis as any)?.feedback) return;
    const timer = setInterval(() => refetchAnalysis(), 3000);
    return () => clearInterval(timer);
  }, [submissionId, (analysis as any)?.feedback]);

  // If analysis just finished and passed, invalidate task and phase
  useEffect(() => {
    if ((analysis as any)?.passed && (task as any)?.phaseId) {
      queryClient.invalidateQueries({ queryKey: ['phase', (task as any).phaseId] });
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
    }
  }, [analysis, (task as any)?.phaseId, taskId, queryClient]);

  const t = task as any;
  // Use analysis from the separate query OR from the initial task load (if we are NOT in new submission mode)
  const a = (submissionId || !hasLoadedInitial) 
    ? (analysis || t?.submissions?.[0]?.analysis)
    : null;

  return (
    <div>
      <button onClick={handleBack} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', marginBottom: 16, fontWeight: 500 }}>
        ← Back
      </button>

      <div style={{ marginBottom: 24 }}>
        <span style={{ color: '#6b7280', fontSize: 13, fontWeight: 500 }}>{t?.type}</span>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 4, color: '#111827' }}>{t?.title}</h1>
        <p style={{ color: '#4b5563', marginTop: 8, lineHeight: 1.6 }}>{t?.description}</p>
      </div>

      {!a && (
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 12, color: '#111827' }}>Your Submission</h3>
          <textarea
            value={submission}
            onChange={(e) => setSubmission(e.target.value)}
            placeholder={t?.type === 'PROJECT' ? 'Describe your project, share a GitHub link, or paste your code...' : 'Write your answer here...'}
            rows={8}
            style={{
              width: '100%', padding: 12, borderRadius: 6, border: '1px solid #e5e7eb',
              background: '#ffffff', color: '#111827', fontSize: 14,
              resize: 'vertical', boxSizing: 'border-box',
            }}
          />
          <button
            onClick={() => submitMutation.mutate(submission)}
            disabled={!submission.trim() || submitMutation.isPending}
            style={{
              marginTop: 12, background: '#7c3aed', color: 'white', border: 'none',
              padding: '10px 24px', borderRadius: 6, cursor: 'pointer', fontWeight: 500
            }}
          >
            {submitMutation.isPending ? 'Submitting...' : 'Submit for Analysis'}
          </button>
        </div>
      )}

      {submissionId && !a && (
        <div style={{ background: '#ffffff', borderRadius: 8, padding: 24, textAlign: 'center', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⚡</div>
          <p style={{ color: '#d97706', fontWeight: 500 }}>AI is analyzing your submission...</p>
        </div>
      )}

      {a && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ background: '#f9fafb', borderRadius: 8, padding: 24, border: '1px solid #e5e7eb' }}>
            <h3 style={{ marginBottom: 12, color: '#111827', fontSize: 16 }}>Your Answer</h3>
            <div style={{ whiteSpace: 'pre-wrap', color: '#374151', fontSize: 14, lineHeight: 1.6 }}>
              {t?.submissions?.[0]?.content}
            </div>
          </div>

          <div style={{ background: '#ffffff', borderRadius: 8, padding: 24, border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ color: '#111827' }}>Analysis Result</h2>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 32, fontWeight: 700, color: a.passed ? '#059669' : '#dc2626' }}>
                  {a.score}/100
                </div>
                <span style={{ color: a.passed ? '#059669' : '#dc2626', fontSize: 14, fontWeight: 600 }}>
                  {a.passed ? '✓ PASSED' : '✗ FAILED'}
                </span>
              </div>
            </div>

            <p style={{ color: '#374151', lineHeight: 1.6, marginBottom: 20 }}>{a.feedback}</p>

            {a.strengths?.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <h4 style={{ color: '#059669', marginBottom: 8, fontWeight: 600 }}>Strengths</h4>
                <ul style={{ padding: '0 0 0 16px', margin: 0 }}>
                  {a.strengths.map((s: string, i: number) => (
                    <li key={i} style={{ color: '#4b5563', marginBottom: 4 }}>{s}</li>
                  ))}
                </ul>
              </div>
            )}

            {a.improvements?.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <h4 style={{ color: '#d97706', marginBottom: 8, fontWeight: 600 }}>Areas for Improvement</h4>
                <ul style={{ padding: '0 0 0 16px', margin: 0 }}>
                  {a.improvements.map((s: string, i: number) => (
                    <li key={i} style={{ color: '#4b5563', marginBottom: 4 }}>{s}</li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={() => { setSubmissionId(null); setSubmission(t?.submissions?.[0]?.content || ''); }}
              style={{
                marginTop: 20, background: 'transparent', border: '1px solid #7c3aed',
                color: '#7c3aed', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontWeight: 500
              }}
            >
              {a.passed ? 'Submit New Version' : 'Try Again'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
