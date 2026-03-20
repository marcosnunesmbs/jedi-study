import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { studyPathsApi } from '../api/study-paths.api';
import { subjectsApi } from '../api/subjects.api';
import { ChevronLeft, GraduationCap, Hourglass, RefreshCw, Map, Sparkles, ListChecks, Clock, Lock, ChevronRight, Loader2 } from 'lucide-react';
import { WelcomeMessage } from '../components/WelcomeMessage';

const STATUS_COLOR: Record<string, string> = {
  LOCKED: 'var(--text-slate-400)',
  ACTIVE: 'var(--primary)',
  COMPLETED: '#10b981',
  GENERATING: '#f59e0b',
};

const STATUS_BG: Record<string, string> = {
  LOCKED: 'var(--surface)',
  ACTIVE: 'rgba(124, 58, 237, 0.1)',
  COMPLETED: 'rgba(16, 185, 129, 0.1)',
  GENERATING: 'rgba(245, 158, 11, 0.1)',
};

export default function SubjectPage() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', skillLevel: 'BEGINNER', goals: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: subject, refetch: refetchSubject } = useQuery({
    queryKey: ['subject', subjectId],
    queryFn: () => subjectsApi.get(subjectId!),
  });

  const { data: studyPath, refetch, isLoading } = useQuery({
    queryKey: ['study-path-active', subjectId],
    queryFn: () => studyPathsApi.getActive(subjectId!),
    retry: false,
  });

  const updateMutation = useMutation({
    mutationFn: (data: { title?: string; skillLevel?: string; goals?: string[] }) =>
      subjectsApi.update(subjectId!, data),
  });

  const generateMutation = useMutation({
    mutationFn: () => studyPathsApi.generate(subjectId!),
    onSuccess: () => refetch(),
  });

  const openModal = () => {
    const sub = subject as any;
    const goals = sub?.goals 
      ? (typeof sub.goals === 'string' ? JSON.parse(sub.goals) : sub.goals)
      : [];
    setEditForm({
      title: sub?.title || '',
      skillLevel: sub?.skillLevel || 'BEGINNER',
      goals: Array.isArray(goals) ? goals.join(', ') : '',
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const goalsArray = editForm.goals
        .split(',')
        .map(g => g.trim())
        .filter(g => g.length > 0);

      await updateMutation.mutateAsync({
        title: editForm.title,
        skillLevel: editForm.skillLevel,
        goals: goalsArray,
      });

      await refetchSubject();
      setShowModal(false);
      generateMutation.mutate();
    } catch (error) {
      console.error('Failed to update subject:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const path = studyPath as any;
    if (path?.status === 'GENERATING') {
      const timer = setInterval(() => refetch(), 3000);
      return () => clearInterval(timer);
    }
  }, [(studyPath as any)?.status]);

  const path = studyPath as any;
  const sub = subject as any;

  if (!sub && !isLoading) return <div>Subject not found</div>;

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-slate-500)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>
          <ChevronLeft size={20} />
          Back to Dashboard
        </Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <div style={{ width: '4rem', height: '4rem', backgroundColor: 'rgba(124, 58, 237, 0.1)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
            <GraduationCap size={40} />
          </div>
          <div>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: 'var(--text-slate-900)', margin: '0 0 0.5rem 0' }}>{sub?.title}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <span className={`badge badge-indigo`}>{sub?.skillLevel}</span>
              <span style={{ color: 'var(--text-slate-500)', fontSize: '0.875rem', fontWeight: 500 }}>
                {path?.totalPhases || 0} Phases · ~{path?.estimatedHours || 0}h estimated
              </span>
            </div>
            {sub?.goals && (
              <div style={{ color: 'var(--text-slate-600)', fontSize: '0.875rem' }}>
                <strong>Goals: </strong>
                {(() => {
                  try {
                    const g = typeof sub.goals === 'string' ? JSON.parse(sub.goals) : sub.goals;
                    return Array.isArray(g) ? g.join(', ') : g;
                  } catch(e) { return 'No specific goals set yet.'; }
                })()}
              </div>
            )}
          </div>
        </div>
        
        <button
          className="btn-primary"
          onClick={openModal}
          disabled={generateMutation.isPending || path?.status === 'GENERATING'}
          style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-slate-600)', padding: '0.625rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          {generateMutation.isPending || path?.status === 'GENERATING' ? <Loader2 size={20} className="animate-spin" /> : <RefreshCw size={20} />}
          {path?.status === 'GENERATING' ? 'Generating...' : 'Regenerate Path'}
        </button>
      </div>

      {isLoading && <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-slate-500)' }}>Loading study path...</div>}

      {!isLoading && !path && (
        <div className="card" style={{ textAlign: 'center', padding: '5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ width: '4rem', height: '4rem', borderRadius: '50%', backgroundColor: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-slate-400)' }}>
            <Map size={40} />
          </div>
          <div>
            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-slate-900)' }}>No study path yet</h3>
            <p style={{ margin: 0, color: 'var(--text-slate-500)', fontSize: '0.875rem' }}>Let our AI generate a personalized learning journey for you.</p>
          </div>
          <button
            className="btn-primary"
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            {generateMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : null}
            {generateMutation.isPending ? 'Generating...' : 'Generate Study Path'}
          </button>
        </div>
      )}

      {path?.status === 'GENERATING' && (
        <div className="card" style={{ textAlign: 'center', padding: '5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ position: 'relative', width: '4rem', height: '4rem' }}>
             <div style={{ width: '100%', height: '100%', borderRadius: '50%', border: '4px solid var(--surface)', borderTopColor: 'var(--primary)', animation: 'spin 1s linear infinite' }}></div>
             <Sparkles size={24} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'var(--primary)' }} />
          </div>
          <div>
            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-slate-900)' }}>AI is working...</h3>
            <p style={{ margin: 0, color: 'var(--text-slate-500)', fontSize: '0.875rem' }}>We're crafting your personalized study path. This usually takes less than a minute.</p>
          </div>
        </div>
      )}

      {path?.phases && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {path?.welcomeMessage && (
            <WelcomeMessage message={path.welcomeMessage} />
          )}
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-slate-900)', margin: '0 0 0.5rem 0' }}>Learning Phases</h3>
          {(path.phases as any[]).map((phase: any) => (
            <div
              key={phase.id}
              className="card"
              onClick={() => phase.status !== 'LOCKED' && navigate(`/phases/${phase.id}`)}
              style={{
                padding: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: phase.status === 'LOCKED' ? 'not-allowed' : 'pointer',
                opacity: phase.status === 'LOCKED' ? 0.7 : 1,
                borderLeft: phase.status === 'ACTIVE' ? '4px solid var(--primary)' : '1px solid var(--border-color)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ 
                  width: '3rem', 
                  height: '3rem', 
                  borderRadius: '0.75rem', 
                  backgroundColor: STATUS_BG[phase.status], 
                  color: STATUS_COLOR[phase.status],
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '1.25rem'
                }}>
                  {phase.order}
                </div>
                <div>
                  <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-slate-900)' }}>{phase.title}</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-slate-500)', fontSize: '0.875rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <ListChecks size={18} />
                      {phase.tasks?.length || 0} tasks
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Clock size={18} />
                      {phase.estimatedHours}h
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <span className="badge" style={{ backgroundColor: STATUS_BG[phase.status], color: STATUS_COLOR[phase.status] }}>
                  {phase.status}
                </span>
                <span style={{ color: 'var(--text-slate-400)' }}>
                  {phase.status === 'LOCKED' ? <Lock size={20} /> : <ChevronRight size={20} />}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ padding: '2rem', maxWidth: '500px', width: '90%', animation: 'fadeIn 0.2s ease-out' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-slate-900)' }}>Edit & Regenerate Path</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-slate-700)' }}>Title</label>
              <input
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border-color)', borderRadius: '0.5rem', fontSize: '0.875rem', backgroundColor: 'var(--surface)', color: 'var(--text-slate-900)' }}
                placeholder="e.g., Learn Python"
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-slate-700)' }}>Skill Level</label>
              <select
                value={editForm.skillLevel}
                onChange={(e) => setEditForm({ ...editForm, skillLevel: e.target.value })}
                style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border-color)', borderRadius: '0.5rem', fontSize: '0.875rem', backgroundColor: 'var(--surface)', color: 'var(--text-slate-900)' }}
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-slate-700)' }}>Goals (comma-separated)</label>
              <input
                type="text"
                value={editForm.goals}
                onChange={(e) => setEditForm({ ...editForm, goals: e.target.value })}
                style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border-color)', borderRadius: '0.5rem', fontSize: '0.875rem', backgroundColor: 'var(--surface)', color: 'var(--text-slate-900)' }}
                placeholder="e.g., Build a web app, Learn data structures"
              />
            </div>

            <p style={{ margin: '0 0 1.5rem 0', color: 'var(--text-slate-600)', lineHeight: 1.5, fontSize: '0.875rem' }}>
              <strong>Warning:</strong> All current progress will be completely deleted.
            </p>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button
                onClick={() => setShowModal(false)}
                disabled={isSubmitting}
                style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '0.5rem', cursor: isSubmitting ? 'not-allowed' : 'pointer', fontWeight: 500, color: 'var(--text-slate-600)', opacity: isSubmitting ? 0.6 : 1 }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !editForm.title.trim()}
                className="btn-primary"
                style={{ padding: '0.5rem 1rem', backgroundColor: '#ef4444', border: 'none', opacity: isSubmitting || !editForm.title.trim() ? 0.6 : 1, cursor: isSubmitting || !editForm.title.trim() ? 'not-allowed' : 'pointer' }}
              >
                {isSubmitting ? <Loader2 size={18} className="animate-spin" style={{ marginRight: '0.5rem' }} /> : null}
                {isSubmitting ? 'Saving...' : 'Save & Regenerate'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
