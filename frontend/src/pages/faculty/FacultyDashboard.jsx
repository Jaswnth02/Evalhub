import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { DashboardCard } from '../../components/common/DashboardCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { 
  BookOpen, 
  UploadCloud, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  PlusCircle, 
  ChevronRight,
  ArrowUpRight,
  Play
} from 'lucide-react';

export function FacultyDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFacultyDashboard() {
      try {
        const res = await api.faculty.getDashboard();
        if (res.success) {
          setData(res);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchFacultyDashboard();
  }, []);

  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '80px 0' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Loading faculty dashboard...</div>
      </div>
    );
  }

  const stats = data?.stats || {
    totalAssignments: 0,
    totalSubmissions: 0,
    pendingEvaluations: 0,
    evaluatedSubmissions: 0,
    suspiciousSubmissions: 0
  };

  const recentSubs = data?.recentSubmissions || [];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Faculty Dashboard</h1>
          <p className="page-subtitle">
            Manage course projects, trigger automated code compilation, inspect test runs, and review plagiarism clusters
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/faculty/plagiarism" className="btn btn-secondary">
            <span>DBSCAN Plagiarism Hub</span>
          </Link>
          <Link to="/faculty/create-assignment" className="btn btn-primary">
            <PlusCircle size={18} />
            <span>Create Assignment</span>
          </Link>
        </div>
      </div>

      {/* 5 Core Faculty Metrics (Section 13) */}
      <div className="stats-grid">
        <DashboardCard
          title="Total Assignments"
          value={stats.totalAssignments}
          icon={<BookOpen size={24} />}
          color="#6366f1"
        />
        <DashboardCard
          title="Total Submissions"
          value={stats.totalSubmissions}
          icon={<UploadCloud size={24} />}
          color="#3b82f6"
        />
        <DashboardCard
          title="Pending Evaluations"
          value={stats.pendingEvaluations}
          icon={<Clock size={24} />}
          color="#f59e0b"
        />
        <DashboardCard
          title="Evaluated Submissions"
          value={stats.evaluatedSubmissions}
          icon={<CheckCircle2 size={24} />}
          color="#10b981"
        />
        <DashboardCard
          title="Suspicious Collusions"
          value={stats.suspiciousSubmissions}
          icon={<AlertTriangle size={24} />}
          color="#ef4444"
          subtitle="&ge;60% Similarity"
        />
      </div>

      {/* Recent Submissions Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <UploadCloud size={20} color="var(--accent-primary)" />
            Recent Student Submissions
          </h3>
          <Link to="/faculty/submissions" style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            All Submissions <ChevronRight size={16} />
          </Link>
        </div>

        {recentSubs.length === 0 ? (
          <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No student submissions received yet.
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Assignment</th>
                  <th>File Submitted</th>
                  <th>Submission Date</th>
                  <th>Status</th>
                  <th>Similarity</th>
                  <th>Total Score</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentSubs.map((sub) => {
                  const isHighPlag = Number(sub.plagiarism_score || 0) >= 60;
                  return (
                    <tr key={sub.submission_id}>
                      <td>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {sub.student_name}
                        </span>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {sub.register_number}
                        </span>
                      </td>
                      <td>{sub.assignment_title}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                        {sub.original_filename}
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {new Date(sub.submitted_at).toLocaleDateString()}
                      </td>
                      <td>
                        <StatusBadge status={sub.status} />
                      </td>
                      <td>
                        {sub.plagiarism_score !== null && sub.plagiarism_score !== undefined ? (
                          <span style={{ 
                            fontWeight: 700, 
                            color: isHighPlag ? 'var(--danger)' : (Number(sub.plagiarism_score) >= 35 ? 'var(--warning)' : 'var(--success)') 
                          }}>
                            {Number(sub.plagiarism_score).toFixed(1)}%
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>--</span>
                        )}
                      </td>
                      <td>
                        {sub.total_score !== null && sub.total_score !== undefined ? (
                          <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
                            {sub.total_score} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/ 100</span>
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>--</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Link
                          to={`/faculty/submissions/${sub.submission_id}`}
                          className="btn btn-secondary btn-sm"
                        >
                          <span>Review & Evaluate</span>
                          <ArrowUpRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
