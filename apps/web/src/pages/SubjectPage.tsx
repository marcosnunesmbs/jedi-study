import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { studyPathsApi } from '../api/study-paths.api';
import { subjectsApi } from '../api/subjects.api';

const STATUS_COLOR: Record<string, string> = {
  LOCKED: '#6b7280',
  ACTIVE: '#7c3aed',
  COMPLETED: '#10b981',
  GENERATING: '#f59e0b',
};

export default function SubjectPage() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const navigate = useNavigate();

  const { data: subject } = useQuery({
    queryKey: ['subject', subjectId],
    queryFn: () => subjectsApi.get(subjectId!),
  });

  const { data: studyPath, refetch, isLoading } = useQuery({
    queryKey: ['study-path-active', subjectId],
    queryFn: () => studyPathsApi.getActive(subjectId!),
    retry: false,
  });

  const generateMutation = useMutation({
    mutationFn: () => studyPathsApi.generate(subjectId!),
    onSuccess: () => refetch(),
  });

  // Poll status while GENERATING
  useEffect(() => {
    const path = studyPath as any;
    if (path?.status === 'GENERATING') {
      const timer = setInterval(() => refetch(), 3000);
      return () => clearInterval(timer);
    }
  }, [(studyPath as any)?.status]);

  const path = studyPath as any;
  const sub = subject as any;

  return (
    <div>
      <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', marginBottom: 16, fontWeight: 500 }}>
        ← Back
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>{sub?.title}</h1>
          <span style={{ color: '#6b7280', fontSize: 14, fontWeight: 500 }}>{sub?.skillLevel}</span>
        </div>
        <button
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending || path?.status === 'GENERATING'}
          style={{
            background: 'transparent', border: '1px solid #7c3aed', color: '#7c3aed',
            padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontWeight: 500
          }}
        >
          {path?.status === 'GENERATING' ? '⏳ Generating...' : '↻ Regenerate'}
        </button>
      </div>

      {isLoading && <p style={{ color: '#6b7280' }}>Loading study path...</p>}

      {!isLoading && !path && (
        <div style={{ textAlign: 'center', padding: 64 }}>
          <p style={{ color: '#6b7280', marginBottom: 16 }}>No study path yet.</p>
          <button
            onClick={() => generateMutation.mutate()}
            style={{ background: '#7c3aed', color: 'white', border: 'none', padding: '10px 24px', borderRadius: 6, cursor: 'pointer', fontWeight: 500 }}
          >
            Generate Study Path
          </button>
        </div>
      )}

      {path?.status === 'GENERATING' && (
        <div style={{ textAlign: 'center', padding: 64 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚡</div>
          <p style={{ color: '#f59e0b', fontWeight: 500 }}>AI is generating your personalized study path...</p>
        </div>
      )}

      {path?.phases && (
        <div>
          <p style={{ color: '#6b7280', marginBottom: 24, fontWeight: 500 }}>
            {path.totalPhases} phases · ~{path.estimatedHours}h estimated
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(path.phases as any[]).map((phase: any) => (
              <div
                key={phase.id}
                onClick={() => phase.status !== 'LOCKED' && navigate(`/phases/${phase.id}`)}
                style={{
                  background: '#ffffff', borderRadius: 8, padding: 20,
                  border: `1px solid ${phase.status === 'LOCKED' ? '#e5e7eb' : STATUS_COLOR[phase.status]}`,
                  cursor: phase.status === 'LOCKED' ? 'not-allowed' : 'pointer',
                  opacity: phase.status === 'LOCKED' ? 0.6 : 1,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                }}
              >
                <div>
                  <span style={{ color: '#6b7280', fontSize: 12, marginRight: 8, fontWeight: 500 }}>Phase {phase.order}</span>
                  <span style={{ fontWeight: 600, color: '#111827' }}>{phase.title}</span>
                  <p style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>
                    {phase.tasks?.length || 0} tasks · {phase.estimatedHours}h
                  </p>
                </div>
                <span style={{
                  fontSize: 12, padding: '4px 10px', borderRadius: 12,
                  background: `${STATUS_COLOR[phase.status]}15`,
                  color: STATUS_COLOR[phase.status],
                  fontWeight: 600
                }}>
                  {phase.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
