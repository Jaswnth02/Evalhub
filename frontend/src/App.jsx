import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';

// Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentAssignments } from './pages/student/StudentAssignments';
import { StudentAssignmentDetail } from './pages/student/StudentAssignmentDetail';
import { StudentSubmissions } from './pages/student/StudentSubmissions';
import { StudentReportView } from './pages/student/StudentReportView';

// Faculty Pages
import { FacultyDashboard } from './pages/faculty/FacultyDashboard';
import { FacultyAssignments } from './pages/faculty/FacultyAssignments';
import { FacultyCreateAssignment } from './pages/faculty/FacultyCreateAssignment';
import { FacultySubmissions } from './pages/faculty/FacultySubmissions';
import { FacultySubmissionDetail } from './pages/faculty/FacultySubmissionDetail';
import { FacultyPlagiarismHub } from './pages/faculty/FacultyPlagiarismHub';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminAssignments } from './pages/admin/AdminAssignments';

// Authenticated App Shell Layout
function AppLayout() {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-panel">
        <Navbar />
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// Dynamic Home Redirection based on user role
function RoleBasedHome() {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user.role === 'student') return <Navigate to="/student/dashboard" replace />;
  if (user.role === 'faculty') return <Navigate to="/faculty/dashboard" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Root Redirect */}
          <Route path="/" element={<RoleBasedHome />} />

          {/* Protected Routes inside AppLayout */}
          <Route element={<AppLayout />}>
            {/* Student Routes */}
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/assignments"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentAssignments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/assignments/:id"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentAssignmentDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/submissions"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentSubmissions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/report/:submissionId"
              element={
                <ProtectedRoute allowedRoles={['student', 'faculty', 'admin']}>
                  <StudentReportView />
                </ProtectedRoute>
              }
            />

            {/* Faculty Routes */}
            <Route
              path="/faculty/dashboard"
              element={
                <ProtectedRoute allowedRoles={['faculty', 'admin']}>
                  <FacultyDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/faculty/assignments"
              element={
                <ProtectedRoute allowedRoles={['faculty', 'admin']}>
                  <FacultyAssignments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/faculty/create-assignment"
              element={
                <ProtectedRoute allowedRoles={['faculty', 'admin']}>
                  <FacultyCreateAssignment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/faculty/submissions"
              element={
                <ProtectedRoute allowedRoles={['faculty', 'admin']}>
                  <FacultySubmissions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/faculty/submissions/:id"
              element={
                <ProtectedRoute allowedRoles={['faculty', 'admin']}>
                  <FacultySubmissionDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/faculty/plagiarism"
              element={
                <ProtectedRoute allowedRoles={['faculty', 'admin']}>
                  <FacultyPlagiarismHub />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/assignments"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminAssignments />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
