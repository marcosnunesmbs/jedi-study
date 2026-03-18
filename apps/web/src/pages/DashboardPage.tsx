import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subjectsApi } from '../api/subjects.api';
import { studyPathsApi } from '../api/study-paths.api';
import { X, Plus, ArrowRight, Code, Palette, Database, Network, GraduationCap } from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [newSubject, setNewSubject] = useState({ title: '', skillLevel: 'BEGINNER', goals: '' });
  const [showForm, setShowForm] = useState(false);

  const { data: subjects = [], isLoading } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => subjectsApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => subjectsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subjects'] });
      setShowForm(false);
      setNewSubject({ title: '', skillLevel: 'BEGINNER', goals: '' });
    },
  });

  const generateMutation = useMutation({
    mutationFn: (subjectId: string) => studyPathsApi.generate(subjectId),
    onSuccess: (res: any, subjectId) => {
      navigate(`/subjects/${subjectId}`);
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      title: newSubject.title,
      skillLevel: newSubject.skillLevel,
      goals: newSubject.goals.split('\n').filter(Boolean),
    });
  };

  const getSkillBadgeClass = (level: string) => {
    switch (level) {
      case 'BEGINNER': return 'badge-emerald';
      case 'INTERMEDIATE': return 'badge-indigo';
      case 'ADVANCED': return 'badge-amber';
      default: return 'badge-indigo';
    }
  };

  const getSubjectIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('code') || t.includes('program')) return <Code size={24} />;
    if (t.includes('design') || t.includes('ui')) return <Palette size={24} />;
    if (t.includes('data')) return <Database size={24} />;
    if (t.includes('arch')) return <Network size={24} />;
    return <GraduationCap size={24} />;
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', letterSpacing: '-0.025em', color: 'var(--text-slate-900)', margin: '0 0 0.5rem 0' }}>My Subjects</h2>
        <p style={{ color: 'var(--text-slate-500)', fontWeight: 500, margin: 0 }}>Manage your learning paths and track your skill progression.</p>
      </div>

      {/* Stats Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="stat-card">
          <p style={{ color: 'var(--text-slate-500)', fontSize: '0.875rem', fontWeight: 500, margin: '0 0 0.25rem 0' }}>Total Subjects</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>{(subjects as any[]).length}</p>
        </div>
        <div className="stat-card">
          <p style={{ color: 'var(--text-slate-500)', fontSize: '0.875rem', fontWeight: 500, margin: '0 0 0.25rem 0' }}>Active Paths</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
            {(subjects as any[]).filter(s => s.studyPaths?.length > 0).length}
          </p>
        </div>
        <div className="stat-card">
          <p style={{ color: 'var(--text-slate-500)', fontSize: '0.875rem', fontWeight: 500, margin: '0 0 0.25rem 0' }}>Completion Rate</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>--</p>
        </div>
      </div>

      {showForm && (
        <div className="card" style={{ padding: '2rem', marginBottom: '2.5rem', animation: 'slideDown 0.3s ease-out' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>New Subject</h3>
            <button 
              onClick={() => setShowForm(false)} 
              style={{ background: 'none', border: 'none', color: 'var(--text-slate-400)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label className="label">Subject Title</label>
              <input
                className="input-field"
                placeholder="e.g. Software Architecture, React Masterclass"
                value={newSubject.title}
                onChange={(e) => setNewSubject({ ...newSubject, title: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Skill Level</label>
              <select
                className="input-field"
                value={newSubject.skillLevel}
                onChange={(e) => setNewSubject({ ...newSubject, skillLevel: e.target.value })}
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>
            <div>
              <label className="label">Learning Goals (one per line)</label>
              <textarea
                className="input-field"
                placeholder="Master microservices design&#10;Understand event-driven architecture"
                value={newSubject.goals}
                onChange={(e) => setNewSubject({ ...newSubject, goals: e.target.value })}
                rows={3}
                style={{ resize: 'vertical' }}
              />
            </div>
            <button className="btn-primary" type="submit" disabled={createMutation.isPending} style={{ width: '100%' }}>
              {createMutation.isPending ? 'Creating...' : 'Create & Generate Path'}
            </button>
          </form>
        </div>
      )}

      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {[1, 2, 3].map(i => <div key={i} className="card" style={{ height: '200px', backgroundColor: '#f1f5f9', opacity: 0.5 }}></div>)}
        </div>
      ) : (subjects as any[]).length === 0 ? (
        <button 
          className="card" 
          onClick={() => setShowForm(true)}
          style={{ width: '100%', padding: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', borderStyle: 'dashed', backgroundColor: 'transparent', cursor: 'pointer' }}
        >
          <div style={{ width: '3rem', height: '3rem', borderRadius: '50%', backgroundColor: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-slate-400)' }}>
            <Plus size={32} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--text-slate-600)' }}>Add New Subject</p>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: 'var(--text-slate-400)' }}>Start your learning journey here</p>
          </div>
        </button>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {(subjects as any[]).map((subject: any) => (
            <div key={subject.id} className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', cursor: 'pointer' }} onClick={() => navigate(`/subjects/${subject.id}`)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ padding: '0.625rem', backgroundColor: 'rgba(124, 58, 237, 0.1)', borderRadius: '0.5rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {getSubjectIcon(subject.title)}
                </div>
                <span className={`badge ${getSkillBadgeClass(subject.skillLevel)}`}>{subject.skillLevel}</span>
              </div>

              <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.125rem', fontWeight: 'bold', color: 'var(--text-slate-900)' }}>{subject.title}</h3>
              <p className="line-clamp-2" style={{ margin: '0 0 1.5rem 0', fontSize: '0.875rem', color: 'var(--text-slate-500)', minHeight: '2.5rem' }}>
                {subject.goals?.[0] || 'No specific goals set yet.'}
              </p>

              <div style={{ marginTop: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.025em', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-slate-400)' }}>Status</span>
                  <span style={{ color: 'var(--text-slate-900)' }}>{subject.studyPaths?.[0]?.status || 'Ready'}</span>
                </div>
                <div className="progress-bar-container">
                  <div className="progress-bar-fill" style={{ width: subject.studyPaths?.length ? '10%' : '0%' }}></div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', marginTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <span style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', backgroundColor: subject.studyPaths?.length ? '#10b981' : '#94a3b8' }}></span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-slate-600)' }}>{subject.studyPaths?.length ? 'Active' : 'Pending'}</span>
                  </div>
                  <button className="btn-primary" style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }} onClick={(e) => {
                    if (!subject.studyPaths?.length) {
                      e.stopPropagation();
                      generateMutation.mutate(subject.id);
                    }
                  }}>
                    {subject.studyPaths?.length ? 'Continue' : 'Generate'}
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          <button 
            className="card" 
            onClick={() => setShowForm(true)}
            style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', borderStyle: 'dashed', backgroundColor: 'transparent', cursor: 'pointer' }}
          >
            <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', backgroundColor: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-slate-400)' }}>
              <Plus size={24} />
            </div>
            <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--text-slate-500)' }}>Add New Subject</p>
          </button>
        </div>
      )}
    </div>
  );
}
