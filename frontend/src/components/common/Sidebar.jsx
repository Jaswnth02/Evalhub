import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutGrid, 
  FileText, 
  FileCheck2, 
  PlusCircle, 
  Users, 
  Fingerprint, 
  ShieldCheck,
  Code2,
  Lightbulb,
  ArrowRight
} from 'lucide-react';

export function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="brand-icon" style={{
          width: '38px',
          height: '38px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontWeight: 800,
          boxShadow: '0 4px 10px rgba(79, 70, 229, 0.25)'
        }}>
          <Code2 size={20} strokeWidth={2.5} />
        </div>
        <div>
          <div className="brand-title" style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            EvalHub
          </div>
          <div style={{ fontSize: '0.72rem', color: '#4f46e5', fontWeight: 600, marginTop: '2px' }}>
            Evaluation Portal
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="sidebar-nav">
        {/* STUDENT NAVIGATION */}
        {user?.role === 'student' && (
          <>
            <div className="sidebar-category">
              Student Portal
            </div>
            <NavLink to="/student/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <LayoutGrid size={18} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/student/assignments" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <FileText size={18} />
              <span>Assignments</span>
            </NavLink>
            <NavLink to="/student/submissions" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <FileCheck2 size={18} />
              <span>My Submissions</span>
            </NavLink>
          </>
        )}

        {/* FACULTY NAVIGATION */}
        {user?.role === 'faculty' && (
          <>
            <div className="sidebar-category">
              Faculty Portal
            </div>
            <NavLink to="/faculty/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <LayoutGrid size={18} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/faculty/assignments" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <FileText size={18} />
              <span>Assignments</span>
            </NavLink>
            <NavLink to="/faculty/create-assignment" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <PlusCircle size={18} />
              <span>Create Assignment</span>
            </NavLink>
            <NavLink to="/faculty/submissions" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <FileCheck2 size={18} />
              <span>Submissions</span>
            </NavLink>
            <NavLink to="/faculty/plagiarism" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Fingerprint size={18} />
              <span>Plagiarism & DBSCAN</span>
            </NavLink>
          </>
        )}

        {/* ADMIN NAVIGATION */}
        {user?.role === 'admin' && (
          <>
            <div className="sidebar-category">
              Administration
            </div>
            <NavLink to="/admin/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <LayoutGrid size={18} />
              <span>Overview</span>
            </NavLink>
            <NavLink to="/admin/users" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Users size={18} />
              <span>Manage Users</span>
            </NavLink>
            <NavLink to="/admin/assignments" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <FileText size={18} />
              <span>All Assignments</span>
            </NavLink>
          </>
        )}
      </nav>

      {/* Need Help? Card */}
      <div className="sidebar-help-card">
        <div className="help-icon-circle">
          <Lightbulb size={16} color="#d97706" />
        </div>
        <div style={{ fontWeight: 700, fontSize: '0.86rem', color: '#0f172a' }}>
          Need Help?
        </div>
        <div style={{ fontSize: '0.74rem', color: '#64748b', lineHeight: 1.35 }}>
          Check the guidelines or contact support.
        </div>
        <button 
          className="btn-help-center"
          onClick={() => alert('Student Documentation & Support Hub: Contact support@evalhub.edu for platform assistance.')}
        >
          <span>View Help Center</span>
          <ArrowRight size={12} />
        </button>
      </div>

      {/* Sidebar Security Footer */}
      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldCheck size={20} color="#10b981" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155' }}>
              Sandbox Protected Runner
            </span>
            <span style={{ fontSize: '0.70rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
              Online and Secure
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}

