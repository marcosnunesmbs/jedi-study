import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subjectsApi } from '../api/subjects.api';
import { studyPathsApi } from '../api/study-paths.api';

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

  const cardStyle: React.CSSProperties = {
    background: '#ffffff', borderRadius: 8, padding: 20,
    border: '1px solid #e5e7eb', cursor: 'pointer',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>My Study Paths</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            background: '#7c3aed', color: 'white', border: 'none',
            padding: '10px 20px', borderRadius: 6, cursor: 'pointer',
            fontWeight: 500
          }}
        >
          {showForm ? 'Cancel' : '+ New Subject'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} style={{ ...cardStyle, marginBottom: 24, cursor: 'default' }}>
          <h3 style={{ marginBottom: 16, color: '#111827' }}>New Subject</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              placeholder="Subject title (e.g. Google ADK, Machine Learning)"
              value={newSubject.title}
              onChange={(e) => setNewSubject({ ...newSubject, title: e.target.value })}
              required
              style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #e5e7eb', background: '#fff', color: '#111827' }}
            />
            <select
              value={newSubject.skillLevel}
              onChange={(e) => setNewSubject({ ...newSubject, skillLevel: e.target.value })}
              style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #e5e7eb', background: '#fff', color: '#111827' }}
            >
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
            <textarea
              placeholder="Learning goals (one per line)"
              value={newSubject.goals}
              onChange={(e) => setNewSubject({ ...newSubject, goals: e.target.value })}
              rows={3}
              style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #e5e7eb', background: '#fff', color: '#111827', resize: 'vertical' }}
            />
            <button
              type="submit" disabled={createMutation.isPending}
              style={{ background: '#7c3aed', color: 'white', border: 'none', padding: '10px', borderRadius: 6, cursor: 'pointer', fontWeight: 500 }}
            >
              {createMutation.isPending ? 'Creating...' : 'Create & Generate Path'}
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <p style={{ color: '#6b7280' }}>Loading...</p>
      ) : (subjects as any[]).length === 0 ? (
        <div style={{ textAlign: 'center', padding: 64, color: '#6b7280' }}>
          <p style={{ fontSize: 48, marginBottom: 16 }}>🎯</p>
          <p>No subjects yet. Create your first study path!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {(subjects as any[]).map((subject: any) => (
            <div key={subject.id} style={cardStyle} onClick={() => navigate(`/subjects/${subject.id}`)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <h3 style={{ marginBottom: 4, color: '#111827' }}>{subject.title}</h3>
                  <span style={{ fontSize: 12, color: '#6b7280', textTransform: 'lowercase', fontWeight: 500 }}>
                    {subject.skillLevel}
                  </span>
                </div>
                <span style={{
                  fontSize: 11, padding: '3px 8px', borderRadius: 12,
                  background: subject.studyPaths?.length ? '#dcfce7' : '#f3f4f6',
                  color: subject.studyPaths?.length ? '#166534' : '#6b7280',
                  fontWeight: 600
                }}>
                  {subject.studyPaths?.[0]?.status || 'No path'}
                </span>
              </div>
              {!subject.studyPaths?.length && (
                <button
                  onClick={(e) => { e.stopPropagation(); generateMutation.mutate(subject.id); }}
                  disabled={generateMutation.isPending}
                  style={{
                    marginTop: 12, background: 'transparent', border: '1px solid #7c3aed',
                    color: '#7c3aed', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 13,
                    fontWeight: 500
                  }}
                >
                  Generate Path
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
