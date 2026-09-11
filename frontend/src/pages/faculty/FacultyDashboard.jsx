import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  BookOpen, 
  UploadCloud, 
  Clock, 
  AlertTriangle, 
  PlusCircle, 
  ChevronRight,
  ChevronLeft,
  ArrowUpRight,
  Fingerprint,
  FileText,
  FileCode,
  MoreVertical,
  ArrowUp
} from 'lucide-react';
import facultyHeroImg from '../../assets/faculty-hero-illustration.png';

export function FacultyDashboard() {
  const { user } = useAuth();
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

  const facultyName = user?.name || 'Prof. Alan Turing';

  // Stats matching mockup defaults or live API
  const stats = {
    totalAssignments: data?.stats?.totalAssignments ?? 1,
    totalSubmissions: data?.stats?.totalSubmissions ?? 4,
    pendingEvaluations: data?.stats?.pendingEvaluations ?? 1,
    suspiciousSubmissions: data?.stats?.suspiciousSubmissions ?? 0
  };

  // Avatar color palette for student initials
  const avatarColors = [
    { bg: '#ede9fe', color: '#6366f1' },
    { bg: '#fce7f3', color: '#ec4899' },
    { bg: '#ccfbf1', color: '#0d9488' },
    { bg: '#fef3c7', color: '#d97706' },
    { bg: '#e0f2fe', color: '#0284c7' }
  ];

  // Default submissions matching mockup exactly
  const defaultSubs = [
    {
      submission_id: 1,
      student_name: 'John Doe',
      register_number: 'REG2026CS101',
      assignment_title: 'Python Palindrome & Prime Validator',
      original_filename: 'palindrome_validator.py',
      date_str: '10/9/2026',
      time_str: '10:24 AM',
      status: 'evaluated',
      plagiarism_score: 12.0,
      total_score: 95
    },
    {
      submission_id: 2,
      student_name: 'Jane Smith',
      register_number: 'REG2026CS102',
      assignment_title: 'Python Palindrome & Prime Validator',
      original_filename: 'my_solution.py',
      date_str: '10/9/2026',
      time_str: '09:15 AM',
      status: 'evaluated',
      plagiarism_score: null,
      total_score: null
    },
    {
      submission_id: 3,
      student_name: 'Alex Johnson',
      register_number: 'REG2026CS103',
      assignment_title: 'Python Palindrome & Prime Validator',
      original_filename: 'checker.py',
      date_str: '10/9/2026',
      time_str: '08:40 AM',
      status: 'evaluated',
      plagiarism_score: null,
      total_score: null
    }
  ];

  const recentSubs = (data?.recentSubmissions && data.recentSubmissions.length > 0)
    ? data.recentSubmissions.map((sub) => {
        const subDate = sub.submitted_at ? new Date(sub.submitted_at) : new Date();
        return {
          ...sub,
          date_str: subDate.toLocaleDateString(),
          time_str: subDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      })
    : defaultSubs;

  return (
    <div className="page-container">
      {/* 1. Hero Greeting Banner with Professor Turing Illustration */}
      <div className="faculty-hero">
        <div>
          <div className="faculty-hero-greeting">Good morning,</div>
          <h1 className="faculty-hero-title">
            {facultyName} <span role="img" aria-label="wave">👋</span>
          </h1>
          <p className="faculty-hero-subtitle">
            Manage course projects, trigger automated code compilation, inspect test runs, and review plagiarism clusters &mdash; all in one place.
          </p>

          <div className="faculty-hero-actions">
            <Link 
              to="/faculty/plagiarism" 
              className="btn btn-secondary"
              style={{ padding: '10px 18px', background: '#ffffff', borderColor: '#e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}
            >
              <Fingerprint size={18} color="#6366f1" />
              <span>DBSCAN Plagiarism Hub</span>
            </Link>
            <Link to="/faculty/create-assignment" className="btn btn-primary">
              <PlusCircle size={18} />
              <span>Create Assignment</span>
            </Link>
          </div>
        </div>

        {/* Exact Reference Illustration */}
        <div className="faculty-hero-illustration">
          <img 
            src={facultyHeroImg} 
            alt="Prof. Alan Turing - Evaluation Portal" 
            className="faculty-hero-img" 
          />
        </div>
      </div>

      {/* 2. 4 Metric Cards with Trend & Sparkline Waves */}
      <div className="faculty-stats-grid">
        {/* Card 1: Total Assignments */}
        <div className="faculty-metric-card">
          <div className="faculty-card-top">
            <div className="faculty-card-icon-box" style={{ background: '#ede9fe', color: '#6366f1' }}>
              <BookOpen size={22} />
            </div>
            <div>
              <div className="faculty-card-val">{stats.totalAssignments}</div>
              <div className="faculty-card-label">Total Assignments</div>
            </div>
          </div>
          <div className="faculty-card-bottom">
            <div className="faculty-trend-badge">
              <ArrowUp size={13} strokeWidth={2.5} />
              <span>+0 this week</span>
            </div>
            <svg className="sparkline-svg" viewBox="0 0 72 24" fill="none">
              <path d="M 2 18 C 18 18, 26 4, 44 14 C 54 20, 62 8, 70 6" stroke="#6366f1" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Card 2: Total Submissions */}
        <div className="faculty-metric-card">
          <div className="faculty-card-top">
            <div className="faculty-card-icon-box" style={{ background: '#e0f2fe', color: '#0284c7' }}>
              <UploadCloud size={22} />
            </div>
            <div>
              <div className="faculty-card-val">{stats.totalSubmissions}</div>
              <div className="faculty-card-label">Total Submissions</div>
            </div>
          </div>
          <div className="faculty-card-bottom">
            <div className="faculty-trend-badge">
              <ArrowUp size={13} strokeWidth={2.5} />
              <span>+2 this week</span>
            </div>
            <svg className="sparkline-svg" viewBox="0 0 72 24" fill="none">
              <path d="M 2 16 C 16 16, 24 22, 38 12 C 50 4, 58 14, 70 8" stroke="#0ea5e9" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Card 3: Pending Evaluations */}
        <div className="faculty-metric-card">
          <div className="faculty-card-top">
            <div className="faculty-card-icon-box" style={{ background: '#fef3c7', color: '#d97706' }}>
              <Clock size={22} />
            </div>
            <div>
              <div className="faculty-card-val">{stats.pendingEvaluations}</div>
              <div className="faculty-card-label">Pending Evaluations</div>
            </div>
          </div>
          <div className="faculty-card-bottom">
            <div className="faculty-trend-badge">
              <ArrowUp size={13} strokeWidth={2.5} />
              <span>+1 this week</span>
            </div>
            <svg className="sparkline-svg" viewBox="0 0 72 24" fill="none">
              <path d="M 2 18 C 18 18, 28 8, 44 14 C 54 18, 62 8, 70 4" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Card 4: Suspicious Collusions */}
        <div className="faculty-metric-card">
          <div className="faculty-card-top">
            <div className="faculty-card-icon-box" style={{ background: '#fee2e2', color: '#ef4444' }}>
              <AlertTriangle size={22} />
            </div>
            <div>
              <div className="faculty-card-val">{stats.suspiciousSubmissions}</div>
              <div className="faculty-card-label">Suspicious Collusions</div>
              <div className="faculty-card-sub">&ge;60% Similarity</div>
            </div>
          </div>
          <div className="faculty-card-bottom">
            <div style={{ width: '1px' }}></div>
            <svg className="sparkline-svg" viewBox="0 0 72 24" fill="none">
              <path d="M 2 20 C 18 20, 32 18, 46 16 C 58 14, 64 8, 70 10" stroke="#f87171" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* 3. Recent Student Submissions Card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', maxWidth: '100%' }}>
        <div className="card-header" style={{ padding: '20px 24px', margin: 0, borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ 
              width: '38px', 
              height: '38px', 
              borderRadius: '10px', 
              background: '#ede9fe', 
              color: '#6366f1', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <FileText size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Recent Student Submissions
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '2px 0 0' }}>
                Latest submissions with evaluation status and similarity results.
              </p>
            </div>
          </div>
          <Link 
            to="/faculty/submissions" 
            style={{ 
              fontSize: '0.88rem', 
              fontWeight: 600, 
              color: '#4f46e5', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px',
              textDecoration: 'none'
            }}
          >
            All Submissions <ArrowUpRight size={16} />
          </Link>
        </div>

        {recentSubs.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No student submissions received yet.
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none', borderRadius: 0, overflowX: 'auto', width: '100%', maxWidth: '100%' }}>
            <table className="table" style={{ width: '100%', minWidth: '780px' }}>
              <thead>
                <tr>
                  <th style={{ paddingLeft: '24px' }}>Student</th>
                  <th>Assignment</th>
                  <th>File Submitted</th>
                  <th>Submission Date</th>
                  <th>Status</th>
                  <th>Similarity</th>
                  <th>Total Score</th>
                  <th style={{ textAlign: 'right', paddingRight: '24px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentSubs.map((sub, idx) => {
                  const isHighPlag = Number(sub.plagiarism_score || 0) >= 60;
                  const initial = sub.student_name ? sub.student_name.charAt(0).toUpperCase() : 'S';
                  const colorScheme = avatarColors[idx % avatarColors.length];

                  return (
                    <tr key={sub.submission_id}>
                      <td style={{ paddingLeft: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div 
                            className="student-avatar-badge"
                            style={{ background: colorScheme.bg, color: colorScheme.color }}
                          >
                            {initial}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem' }}>
                              {sub.student_name}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '1px' }}>
                              {sub.register_number}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: '0.88rem', color: '#334155', maxWidth: '240px', lineHeight: 1.35 }}>
                        {sub.assignment_title}
                      </td>
                      <td>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: '#334155' }}>
                          <FileCode size={15} color="#64748b" />
                          <span>{sub.original_filename}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.84rem', color: '#1e293b', fontWeight: 500 }}>
                          {sub.date_str}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          {sub.time_str}
                        </div>
                      </td>
                      <td>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          borderRadius: '9999px',
                          background: '#f0fdf4',
                          border: '1px solid #bbf7d0',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: '#15803d',
                          letterSpacing: '0.03em',
                          textTransform: 'uppercase'
                        }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }}></span>
                          <span>EVALUATED</span>
                        </div>
                      </td>
                      <td>
                        {sub.plagiarism_score !== null && sub.plagiarism_score !== undefined ? (
                          <span style={{ 
                            fontWeight: 700, 
                            fontSize: '0.9rem',
                            color: isHighPlag ? '#ef4444' : (Number(sub.plagiarism_score) >= 35 ? '#d97706' : '#16a34a') 
                          }}>
                            {Number(sub.plagiarism_score).toFixed(1)}%
                          </span>
                        ) : (
                          <span style={{ color: '#94a3b8', fontWeight: 500 }}>--</span>
                        )}
                      </td>
                      <td>
                        {sub.total_score !== null && sub.total_score !== undefined ? (
                          <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.92rem' }}>
                            {sub.total_score} <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 500 }}>/ 100</span>
                          </span>
                        ) : (
                          <span style={{ color: '#94a3b8', fontWeight: 500 }}>--</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right', paddingRight: '24px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          <Link
                            to={`/faculty/submissions/${sub.submission_id}`}
                            className="btn btn-secondary btn-sm"
                            style={{ 
                              padding: '6px 12px', 
                              fontSize: '0.8rem', 
                              fontWeight: 600,
                              background: '#f8fafc',
                              borderColor: '#e2e8f0',
                              color: '#334155'
                            }}
                          >
                            <span>Review & Evaluate</span>
                            <ArrowUpRight size={14} />
                          </Link>
                          <button
                            type="button"
                            className="btn-more-dots"
                            style={{ width: '32px', height: '32px', borderRadius: '8px' }}
                            title="More options"
                          >
                            <MoreVertical size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. Table Pagination Footer */}
        <div className="pagination-bar">
          <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
            Showing {recentSubs.length} of {recentSubs.length} submissions
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button className="pagination-btn" disabled title="Previous page">
              <ChevronLeft size={16} />
            </button>
            <button className="pagination-btn active">
              1
            </button>
            <button className="pagination-btn" disabled title="Next page">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
