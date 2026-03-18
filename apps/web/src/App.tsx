import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth.store';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SubjectPage from './pages/SubjectPage';
import PhasePage from './pages/PhasePage';
import TaskPage from './pages/TaskPage';
import ContentPage from './pages/ContentPage';
import TokenUsagePage from './pages/TokenUsagePage';
import ProfilePage from './pages/ProfilePage';
import AppShell from './components/layout/AppShell';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  if (user?.role !== 'ADMIN') return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <AppShell />
          </PrivateRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="subjects/:subjectId" element={<SubjectPage />} />
        <Route path="phases/:phaseId" element={<PhasePage />} />
        <Route path="tasks/:taskId" element={<TaskPage />} />
        <Route path="content/:contentId" element={<ContentPage />} />
        <Route
          path="tokens"
          element={
            <AdminRoute>
              <TokenUsagePage />
            </AdminRoute>
          }
        />
      </Route>
    </Routes>
  );
}
