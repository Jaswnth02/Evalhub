import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { DashboardCard } from '../../components/common/DashboardCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { 
  Users, 
  GraduationCap, 
  Award, 
  BookOpen, 
  UploadCloud, 
  CheckCircle2, 
  AlertTriangle,
  UserPlus,
  Shield
} from 'lucide-react';

export function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAdminData() {
      try {
        const res = await api.admin.getDashboard();
        if (res.success) {
          setData(res);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '80px 0' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Loading system metrics...</div>
      </div>
    );
  }

  const stats = data?.stats || {
    totalUsers: 0,
    totalStudents: 0,
    totalFaculty: 0,
    totalAssignments: 0,
    totalSubmissions: 0,
    totalEvaluated: 0,
    suspiciousCollusions: 0
  };

  const recentUsers = data?.recentUsers || [];
  const recentSubs = data?.recentSubmissions || [];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">System Administration & Overview</h1>
          <p className="page-subtitle">
            Centralized monitoring of platform activity, user management, and evaluation integrity
          </p>
        </div>
        <Link to="/admin/users" className="btn btn-primary">
          <UserPlus size={18} />
          <span>Manage Users</span>
        </Link>
      </div>

      {/* Admin Stat Cards */}
      <div className="stats-grid">
        <DashboardCard
          title="Total Platform Users"
          value={stats.totalUsers}
          icon={<Users size={24} />}
          color="#6366f1"
        />
        <DashboardCard
          title="Enrolled Students"
          value={stats.totalStudents}
          icon={<GraduationCap size={24} />}
          color="#10b981"
        />
        <DashboardCard
          title="Faculty Members"
          value={stats.totalFaculty}
          icon={<Award size={24} />}
          color="#3b82f6"
        />
        <DashboardCard
          title="Course Assignments"
          value={stats.totalAssignments}
          icon={<BookOpen size={24} />}
          color="#8b5cf6"
        />
        <DashboardCard
          title="Total Submissions"
          value={stats.totalSubmissions}
          icon={<UploadCloud size={24} />}
          color="#06b6d4"
        />
        <DashboardCard
          title="Evaluations Completed"
          value={stats.totalEvaluated}
          icon={<CheckCircle2 size={24} />}
          color="#10b981"
        />
        <DashboardCard
          title="Collusions Flagged"
          value={stats.suspiciousCollusions}
          icon={<AlertTriangle size={24} />}
          color="#ef4444"
        />
      </div>

      {/* Two-Column Activity Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Recent Users */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Users size={18} color="var(--accent-primary)" />
              Recently Registered Accounts
            </h3>
            <Link to="/admin/users" style={{ fontSize: '0.8rem', color: 'var(--accent-primary)' }}>
              View All
            </Link>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((u) => (
                  <tr key={u.user_id}>
                    <td style={{ fontWeight: 600 }}>{u.name}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td>
                      <span className={`badge ${u.role === 'admin' ? 'badge-danger' : (u.role === 'faculty' ? 'badge-info' : 'badge-success')}`}>
                        {u.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Submissions */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <UploadCloud size={18} color="var(--accent-primary)" />
              Recent Submission Pipeline
            </h3>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Assignment</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentSubs.map((s) => (
                  <tr key={s.submission_id}>
                    <td style={{ fontWeight: 600 }}>{s.student_name}</td>
                    <td style={{ fontSize: '0.85rem' }}>{s.assignment_title}</td>
                    <td>
                      <StatusBadge status={s.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
