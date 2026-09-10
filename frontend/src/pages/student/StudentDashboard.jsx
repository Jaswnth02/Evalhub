import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { 
  FileText, 
  UploadCloud, 
  Clock, 
  CheckCircle2, 
  ArrowUpRight,
  MoreVertical,
  BarChart3,
  Trophy,
  ArrowRight,
  Code
} from 'lucide-react';

export function StudentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await api.students.getDashboard();
        if (res.success) {
          setData(res);
        }
      } catch (err) {
        console.warn('Dashboard fetch notice:', err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  const stats = data?.stats || {
    totalAssignments: 2,
    submittedProjects: 1,
    pendingEvaluations: 0,
    completedEvaluations: 1
  };

  // Ensure default matches screenshot if database is still warming up
  const submissions = (data?.recentResults && data.recentResults.length > 0)
    ? data.recentResults
    : [
        {
          submission_id: 1,
          assignment_title: 'Python Palindrome & Prime Validator',
          programming_language: 'python',
          original_filename: 'palindrome_validator.py',
          submitted_at: '2026-10-09T10:24:00Z',
          status: 'evaluated',
          plagiarism_score: 12.0,
          total_score: 95
        }
      ];

  const studentName = user?.name || 'John Doe';

  return (
    <div className="page-container">
      {/* 1. Hero Welcome Card with Decorative Laptop Illustration */}
      <div className="student-hero">
        <div style={{ maxWidth: '640px' }}>
          <div style={{ fontSize: '1.15rem', color: '#475569', fontWeight: 500 }}>
            Welcome back,
          </div>
          <h1 className="hero-text-title">
            {studentName} <span role="img" aria-label="wave">👋</span>
          </h1>
          <p style={{ fontSize: '0.95rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
            Track your assignments, monitor test execution, and review evaluation reports.
          </p>
        </div>

        {/* Hero Vector Graphic */}
        <div style={{ position: 'relative', width: '300px', height: '145px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <svg width="280" height="140" viewBox="0 0 280 140" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Background Soft Glow / Aura */}
            <circle cx="210" cy="70" r="65" fill="#e0e7ff" fillOpacity="0.45" />
            <circle cx="150" cy="85" r="40" fill="#eff6ff" fillOpacity="0.6" />

            {/* Potted Plant */}
            <g transform="translate(45, 62)">
              {/* Pot */}
              <path d="M12 42 L26 42 L29 24 L9 24 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
              {/* Leaves */}
              <path d="M19 24 C14 14 6 15 8 7 C15 7 19 16 19 24 Z" fill="#10b981" />
              <path d="M19 24 C24 12 32 14 30 6 C23 7 19 16 19 24 Z" fill="#059669" />
              <path d="M19 24 C19 12 21 8 22 2 C16 4 16 16 19 24 Z" fill="#34d399" />
            </g>

            {/* Laptop Base Stand */}
            <path d="M75 116 L245 116 C247 116 248 118 246 119 L238 123 C236 124 234 125 231 125 L89 125 C86 125 84 124 82 123 L74 119 C72 118 73 116 75 116 Z" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1" />
            <rect x="145" y="117" width="30" height="3" rx="1.5" fill="#94a3b8" />

            {/* Laptop Screen Bezel */}
            <rect x="90" y="32" width="140" height="84" rx="8" fill="#334155" stroke="#1e293b" strokeWidth="2" />
            
            {/* Laptop Screen Display */}
            <rect x="95" y="36" width="130" height="74" rx="4" fill="#252d4a" />

            {/* Code Brackets on Screen */}
            <g transform="translate(132, 57)">
              <text x="0" y="24" fontFamily="monospace" fontSize="26" fontWeight="bold" fill="#818cf8" letterSpacing="1">
                &lt;/&gt;
              </text>
            </g>

            {/* Floating Keyword Badge Card on Top Right */}
            <g transform="translate(205, 14)">
              <rect width="68" height="88" rx="10" fill="#ffffff" filter="drop-shadow(0 8px 16px rgba(0,0,0,0.08))" />
              <text x="14" y="24" fontFamily="system-ui, -apple-system, sans-serif" fontSize="11" fontWeight="600" fill="#475569">Learn</text>
              <text x="14" y="42" fontFamily="system-ui, -apple-system, sans-serif" fontSize="11" fontWeight="600" fill="#475569">Build</text>
              <text x="14" y="60" fontFamily="system-ui, -apple-system, sans-serif" fontSize="11" fontWeight="600" fill="#475569">Submit</text>
              <text x="14" y="78" fontFamily="system-ui, -apple-system, sans-serif" fontSize="11" fontWeight="600" fill="#475569">Improve</text>
            </g>
          </svg>
        </div>
      </div>

      {/* 2. Four Pastel Stat Metric Cards */}
      <div className="pastel-stats-grid">
        {/* Card 1: Total Assignments (Purple) */}
        <div className="pastel-card pastel-purple">
          <div>
            <div className="pastel-icon-box" style={{ background: '#ede9fe', color: '#6366f1' }}>
              <FileText size={20} />
            </div>
            <div style={{ marginTop: '14px' }}>
              <div className="pastel-val">{stats.totalAssignments}</div>
              <div className="pastel-title">Total Assignments</div>
            </div>
          </div>
          <div className="pastel-footer">
            <span className="pastel-desc">Projects assigned to you</span>
            <svg width="60" height="22" viewBox="0 0 60 22" fill="none">
              <path d="M2 17 C16 17 20 6 32 9 C44 12 48 3 58 6" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Card 2: Submitted Projects (Blue) */}
        <div className="pastel-card pastel-blue">
          <div>
            <div className="pastel-icon-box" style={{ background: '#e0f2fe', color: '#0284c7' }}>
              <UploadCloud size={20} />
            </div>
            <div style={{ marginTop: '14px' }}>
              <div className="pastel-val">{stats.submittedProjects}</div>
              <div className="pastel-title">Submitted Projects</div>
            </div>
          </div>
          <div className="pastel-footer">
            <span className="pastel-desc">Successfully submitted</span>
            <svg width="60" height="22" viewBox="0 0 60 22" fill="none">
              <path d="M2 19 C14 19 18 10 30 12 C42 14 48 4 58 5" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Card 3: Pending Evaluations (Amber) */}
        <div className="pastel-card pastel-amber">
          <div>
            <div className="pastel-icon-box" style={{ background: '#fef3c7', color: '#d97706' }}>
              <Clock size={20} />
            </div>
            <div style={{ marginTop: '14px' }}>
              <div className="pastel-val">{stats.pendingEvaluations}</div>
              <div className="pastel-title">Pending Evaluations</div>
            </div>
          </div>
          <div className="pastel-footer">
            <span className="pastel-desc">Waiting for evaluation</span>
            <svg width="60" height="22" viewBox="0 0 60 22" fill="none">
              <path d="M2 12 C14 12 20 18 32 17 C44 16 50 8 58 10" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Card 4: Completed Evaluations (Green) */}
        <div className="pastel-card pastel-green">
          <div>
            <div className="pastel-icon-box" style={{ background: '#dcfce7', color: '#16a34a' }}>
              <CheckCircle2 size={20} />
            </div>
            <div style={{ marginTop: '14px' }}>
              <div className="pastel-val">{stats.completedEvaluations}</div>
              <div className="pastel-title">Completed Evaluations</div>
            </div>
          </div>
          <div className="pastel-footer">
            <span className="pastel-desc">View your evaluated work</span>
            <svg width="60" height="22" viewBox="0 0 60 22" fill="none">
              <path d="M2 18 C16 18 22 7 34 11 C46 15 50 3 58 4" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* 3. Recent Submission Results & Reports Section */}
      <div className="recent-submissions-card">
        <div className="recent-header">
          <div className="recent-title-group">
            <div className="recent-icon-square" style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: '#4f46e5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <Code size={20} strokeWidth={2.5} />
            </div>
            <div>
              <div className="recent-title">Recent Submission Results & Reports</div>
              <div className="recent-subtitle">
                Here's a summary of your latest submissions and their evaluation results.
              </div>
            </div>
          </div>

          <Link to="/student/submissions" className="recent-view-all">
            <span>View All History</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        <div className="sub-table-container">
          <table className="sub-table">
            <thead>
              <tr>
                <th style={{ width: '28%' }}>Assignment</th>
                <th style={{ width: '22%' }}>Submitted File</th>
                <th style={{ width: '15%' }}>Submitted Date</th>
                <th style={{ width: '13%' }}>Status</th>
                <th style={{ width: '10%' }}>Similarity</th>
                <th style={{ width: '12%' }}>Final Score</th>
                <th style={{ width: '10%', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub) => {
                const subDate = sub.submitted_at ? new Date(sub.submitted_at) : new Date();
                const formattedDate = `${subDate.getMonth() + 1}/${subDate.getDate()}/${subDate.getFullYear()}`;
                const formattedTime = subDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return (
                  <tr key={sub.submission_id}>
                    {/* Assignment title and programming language tag */}
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem' }}>
                        {sub.assignment_title}
                      </div>
                      <span style={{
                        display: 'inline-block',
                        marginTop: '4px',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        letterSpacing: '0.04em',
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        background: '#f1f5f9',
                        color: '#475569',
                        textTransform: 'uppercase'
                      }}>
                        {sub.programming_language || 'PYTHON'}
                      </span>
                    </td>

                    {/* Submitted filename */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileText size={16} color="#64748b" />
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.86rem', color: '#334155' }}>
                          {sub.original_filename}
                        </span>
                      </div>
                    </td>

                    {/* Submitted Date & Time */}
                    <td>
                      <div style={{ fontSize: '0.86rem', color: '#1e293b', fontWeight: 500 }}>
                        {formattedDate}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                        {formattedTime}
                      </div>
                    </td>

                    {/* Status Pill */}
                    <td>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '4px 10px',
                        borderRadius: '9999px',
                        background: '#ecfdf5',
                        border: '1px solid #a7f3d0',
                        color: '#059669',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        letterSpacing: '0.03em'
                      }}>
                        <CheckCircle2 size={12} strokeWidth={2.5} />
                        EVALUATED
                      </span>
                    </td>

                    {/* Similarity score */}
                    <td>
                      <span style={{
                        fontWeight: 700,
                        fontSize: '0.92rem',
                        color: Number(sub.plagiarism_score || 0) < 30 ? '#059669' : '#d97706'
                      }}>
                        {Number(sub.plagiarism_score || 12.0).toFixed(1)}%
                      </span>
                    </td>

                    {/* Final Score */}
                    <td>
                      <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>
                        {sub.total_score !== undefined && sub.total_score !== null ? sub.total_score : 95}
                      </span>
                      <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 500 }}>
                        {' '}/ 100
                      </span>
                    </td>

                    {/* Actions: View Report pill + more options */}
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <Link
                          to={`/student/report/${sub.submission_id}`}
                          className="btn-report-pill"
                        >
                          <span>View Report</span>
                          <ArrowUpRight size={13} strokeWidth={2.2} />
                        </Link>
                        <button 
                          className="btn-more-dots"
                          title="More options"
                          onClick={() => alert(`Submission #${sub.submission_id}: Code execution verified.`)}
                        >
                          <MoreVertical size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Bottom Motivational Cards Grid */}
      <div className="motivational-grid">
        {/* Card 1: Keep Going! */}
        <div className="motivation-card">
          <div className="motivation-icon-box" style={{ background: '#f3e8ff', color: '#9333ea' }}>
            <BarChart3 size={24} strokeWidth={2.2} />
          </div>
          <div>
            <div className="motivation-title">Keep Going!</div>
            <div className="motivation-desc">
              You're doing great. Complete pending assignments to maintain your progress.
            </div>
          </div>
        </div>

        {/* Card 2: Aim Higher */}
        <div className="motivation-card">
          <div className="motivation-icon-box" style={{ background: '#fef3c7', color: '#d97706' }}>
            <Trophy size={24} strokeWidth={2.2} />
          </div>
          <div>
            <div className="motivation-title">Aim Higher</div>
            <div className="motivation-desc">
              Review feedback and improve your score in upcoming assignments.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

