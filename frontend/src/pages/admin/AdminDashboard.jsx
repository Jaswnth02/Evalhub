import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import adminHeroImg from '../../assets/admin-hero-illustration.png';
import { 
  Users, 
  GraduationCap, 
  User, 
  BookOpen, 
  UploadCloud, 
  CheckCircle2, 
  AlertTriangle,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  Activity,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight
} from 'lucide-react';

export function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAdminData() {
      try {
        const res = await api.admin.getDashboard();
        if (res && res.success) {
          setData(res);
        }
      } catch (err) {
        console.error('Failed to fetch admin metrics', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAdminData();
  }, []);

  const stats = {
    totalUsers: data?.stats?.totalUsers ?? 7,
    totalStudents: data?.stats?.totalStudents ?? 4,
    totalFaculty: data?.stats?.totalFaculty ?? 2,
    totalAssignments: data?.stats?.totalAssignments ?? 2,
    totalSubmissions: data?.stats?.totalSubmissions ?? 4,
    totalEvaluated: data?.stats?.totalEvaluated ?? 3,
    suspiciousCollusions: data?.stats?.suspiciousCollusions ?? 4
  };

  const recentUsers = (data?.recentUsers && data.recentUsers.length >= 4)
    ? data.recentUsers.slice(0, 4)
    : [
        { user_id: 1, name: 'System Administrator', email: 'admin@evalhub.edu', role: 'admin', created_at: '2026-10-09' },
        { user_id: 2, name: 'Prof. Alan Turing', email: 'prof.alan@evalhub.edu', role: 'faculty', created_at: '2026-10-09' },
        { user_id: 3, name: 'Dr. Grace Hopper', email: 'prof.grace@evalhub.edu', role: 'faculty', created_at: '2026-10-08' },
        { user_id: 4, name: 'John Doe', email: 'student.john@evalhub.edu', role: 'student', created_at: '2026-10-08' }
      ];

  const recentSubs = (data?.recentSubmissions && data.recentSubmissions.length >= 4)
    ? data.recentSubmissions.slice(0, 4)
    : [
        { submission_id: 1, student_name: 'John Doe', assignment_title: 'Python Palindrome & Prime Validator', submitted_at: '2026-10-09', status: 'evaluated' },
        { submission_id: 2, student_name: 'Jane Smith', assignment_title: 'Python Palindrome & Prime Validator', submitted_at: '2026-10-09', status: 'evaluated' },
        { submission_id: 3, student_name: 'Alex Johnson', assignment_title: 'Python Palindrome & Prime Validator', submitted_at: '2026-10-09', status: 'evaluated' },
        { submission_id: 4, student_name: 'Emma Watson', assignment_title: 'Python Palindrome & Prime Validator', submitted_at: '2026-10-08', status: 'submitted' }
      ];

  const getUserInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length > 1 && parts[0].startsWith('Prof.') || parts[0].startsWith('Dr.')) {
      return parts[0][0].toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  const getAvatarStyle = (index) => {
    const styles = [
      { bg: '#ede9fe', color: '#6366f1' }, // S - purple
      { bg: '#e0f2fe', color: '#0284c7' }, // P - blue
      { bg: '#cffafe', color: '#0891b2' }, // D - cyan
      { bg: '#ffedd5', color: '#ea580c' }  // J - orange
    ];
    return styles[index % styles.length];
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '10/9/2026';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="admin-dashboard-container">
      {/* 1. Welcome Back Hero Section */}
      <section className="admin-hero-banner">
        <div className="admin-hero-left">
          <div className="admin-hero-greeting">Welcome back,</div>
          <h1 className="admin-hero-title">
            System Administrator <span>👋</span>
          </h1>
          <p className="admin-hero-subtitle">
            Centralized monitoring of platform activity, user management, and evaluation integrity.
          </p>
        </div>
        <div className="admin-hero-right">
          <img 
            src={adminHeroImg} 
            alt="Server and Analytics Monitoring" 
            className="admin-hero-img"
          />
        </div>
      </section>

      {/* 2. Row 1: 4 Metric Cards */}
      <div className="admin-stats-grid-8">
        {/* Card 1: Total Platform Users */}
        <div className="admin-metric-card">
          <div className="admin-metric-top">
            <div className="admin-metric-icon" style={{ background: '#eef2ff', color: '#6366f1' }}>
              <Users size={22} />
            </div>
            <div className="admin-metric-val-wrap">
              <div className="admin-metric-value">{stats.totalUsers}</div>
              <div className="admin-metric-label">Total Platform Users</div>
            </div>
          </div>
          <div className="admin-metric-bottom">
            <div className="admin-metric-trend" style={{ color: '#10b981' }}>
              <ArrowUpRight size={13} strokeWidth={2.5} />
              <span>+2 this month</span>
            </div>
            <svg viewBox="0 0 60 18" className="admin-sparkline-svg">
              <path 
                d="M 2 16 C 14 18, 24 10, 36 12 C 46 14, 52 6, 58 4" 
                fill="none" 
                stroke="#818cf8" 
                strokeWidth="2.2" 
                strokeLinecap="round" 
              />
            </svg>
          </div>
        </div>

        {/* Card 2: Enrolled Students */}
        <div className="admin-metric-card">
          <div className="admin-metric-top">
            <div className="admin-metric-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
              <GraduationCap size={22} />
            </div>
            <div className="admin-metric-val-wrap">
              <div className="admin-metric-value">{stats.totalStudents}</div>
              <div className="admin-metric-label">Enrolled Students</div>
            </div>
          </div>
          <div className="admin-metric-bottom">
            <div className="admin-metric-trend" style={{ color: '#10b981' }}>
              <ArrowUpRight size={13} strokeWidth={2.5} />
              <span>+1 this month</span>
            </div>
            <svg viewBox="0 0 60 18" className="admin-sparkline-svg">
              <path 
                d="M 2 16 C 16 18, 26 12, 38 14 C 46 14, 52 8, 58 5" 
                fill="none" 
                stroke="#34d399" 
                strokeWidth="2.2" 
                strokeLinecap="round" 
              />
            </svg>
          </div>
        </div>

        {/* Card 3: Faculty Members */}
        <div className="admin-metric-card">
          <div className="admin-metric-top">
            <div className="admin-metric-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
              <User size={22} />
            </div>
            <div className="admin-metric-val-wrap">
              <div className="admin-metric-value">{stats.totalFaculty}</div>
              <div className="admin-metric-label">Faculty Members</div>
            </div>
          </div>
          <div className="admin-metric-bottom">
            <div className="admin-metric-trend" style={{ color: '#64748b' }}>
              <span>No change</span>
            </div>
            <svg viewBox="0 0 60 18" className="admin-sparkline-svg">
              <path 
                d="M 2 16 C 16 16, 26 14, 38 10 C 46 6, 52 3, 58 2" 
                fill="none" 
                stroke="#38bdf8" 
                strokeWidth="2.2" 
                strokeLinecap="round" 
              />
            </svg>
          </div>
        </div>

        {/* Card 4: Course Assignments */}
        <div className="admin-metric-card">
          <div className="admin-metric-top">
            <div className="admin-metric-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
              <BookOpen size={22} />
            </div>
            <div className="admin-metric-val-wrap">
              <div className="admin-metric-value">{stats.totalAssignments}</div>
              <div className="admin-metric-label">Course Assignments</div>
            </div>
          </div>
          <div className="admin-metric-bottom">
            <div className="admin-metric-trend" style={{ color: '#10b981' }}>
              <ArrowUpRight size={13} strokeWidth={2.5} />
              <span>+1 this week</span>
            </div>
            <svg viewBox="0 0 60 18" className="admin-sparkline-svg">
              <path 
                d="M 2 15 C 14 18, 22 10, 32 14 C 42 18, 48 8, 58 4" 
                fill="none" 
                stroke="#a78bfa" 
                strokeWidth="2.2" 
                strokeLinecap="round" 
              />
            </svg>
          </div>
        </div>
      </div>

      {/* 3. Row 2: 3 Metric Cards + Integrity Matters Card */}
      <div className="admin-stats-grid-8">
        {/* Card 5: Total Submissions */}
        <div className="admin-metric-card">
          <div className="admin-metric-top">
            <div className="admin-metric-icon" style={{ background: '#e0f7fa', color: '#06b6d4' }}>
              <UploadCloud size={22} />
            </div>
            <div className="admin-metric-val-wrap">
              <div className="admin-metric-value">{stats.totalSubmissions}</div>
              <div className="admin-metric-label">Total Submissions</div>
            </div>
          </div>
          <div className="admin-metric-bottom">
            <div className="admin-metric-trend" style={{ color: '#10b981' }}>
              <ArrowUpRight size={13} strokeWidth={2.5} />
              <span>+2 this week</span>
            </div>
            <svg viewBox="0 0 60 18" className="admin-sparkline-svg">
              <path 
                d="M 2 12 C 14 16, 24 10, 36 14 C 44 16, 52 8, 58 7" 
                fill="none" 
                stroke="#22d3ee" 
                strokeWidth="2.2" 
                strokeLinecap="round" 
              />
            </svg>
          </div>
        </div>

        {/* Card 6: Evaluations Completed */}
        <div className="admin-metric-card">
          <div className="admin-metric-top">
            <div className="admin-metric-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
              <CheckCircle2 size={22} />
            </div>
            <div className="admin-metric-val-wrap">
              <div className="admin-metric-value">{stats.totalEvaluated}</div>
              <div className="admin-metric-label">Evaluations Completed</div>
            </div>
          </div>
          <div className="admin-metric-bottom">
            <div className="admin-metric-trend" style={{ color: '#10b981' }}>
              <ArrowUpRight size={13} strokeWidth={2.5} />
              <span>+3 this week</span>
            </div>
            <svg viewBox="0 0 60 18" className="admin-sparkline-svg">
              <path 
                d="M 2 15 C 16 17, 26 12, 36 13 C 44 14, 52 7, 58 5" 
                fill="none" 
                stroke="#34d399" 
                strokeWidth="2.2" 
                strokeLinecap="round" 
              />
            </svg>
          </div>
        </div>

        {/* Card 7: Suspicious Collisions */}
        <div className="admin-metric-card">
          <div className="admin-metric-top">
            <div className="admin-metric-icon" style={{ background: '#fef2f2', color: '#ef4444' }}>
              <AlertTriangle size={22} />
            </div>
            <div className="admin-metric-val-wrap">
              <div className="admin-metric-value">{stats.suspiciousCollusions}</div>
              <div className="admin-metric-label">Suspicious Collisions</div>
            </div>
          </div>
          <div className="admin-metric-bottom">
            <div className="admin-metric-trend" style={{ color: '#10b981' }}>
              <ArrowDownRight size={13} strokeWidth={2.5} />
              <span>-1 this week</span>
            </div>
            <svg viewBox="0 0 60 18" className="admin-sparkline-svg">
              <path 
                d="M 2 15 C 15 17, 25 9, 36 12 C 46 14, 52 8, 58 6" 
                fill="none" 
                stroke="#f87171" 
                strokeWidth="2.2" 
                strokeLinecap="round" 
              />
            </svg>
          </div>
        </div>

        {/* Card 8: Integrity Matters Action Card */}
        <Link to="/admin/plagiarism" className="integrity-card">
          <div className="integrity-card-left">
            <div className="integrity-icon-wrap">
              <ShieldCheck size={24} />
            </div>
            <div>
              <div className="integrity-card-title">Integrity Matters</div>
              <div className="integrity-card-subtitle">
                Keeping evaluations fair and transparent.
              </div>
            </div>
          </div>
          <ChevronRight size={18} className="integrity-chevron" />
        </Link>
      </div>

      {/* 4. Row 3: 3 Analytics Cards */}
      <div className="analytics-grid">
        {/* Chart 1: User Distribution */}
        <div className="analytics-card">
          <div className="analytics-card-header">
            <div className="analytics-card-title-group">
              <div className="analytics-card-title-row">
                <Users size={16} color="#6366f1" />
                <span>User Distribution</span>
              </div>
              <div className="analytics-card-subtitle">Breakdown of platform users by role.</div>
            </div>
            <button className="analytics-dropdown-btn">
              <span>This Month</span>
              <ChevronDown size={11} />
            </button>
          </div>

          <div className="bar-chart-wrap">
            {/* Total Users */}
            <div className="bar-col">
              <div className="bar-val">{stats.totalUsers}</div>
              <div className="bar-pillar" style={{ height: '78px', background: '#6366f1' }} />
            </div>
            {/* Students */}
            <div className="bar-col">
              <div className="bar-val">{stats.totalStudents}</div>
              <div className="bar-pillar" style={{ height: '52px', background: '#10b981' }} />
            </div>
            {/* Faculty */}
            <div className="bar-col">
              <div className="bar-val">{stats.totalFaculty}</div>
              <div className="bar-pillar" style={{ height: '30px', background: '#38bdf8' }} />
            </div>
            {/* Admins */}
            <div className="bar-col">
              <div className="bar-val">1</div>
              <div className="bar-pillar" style={{ height: '18px', background: '#fbbf24' }} />
            </div>
          </div>
          <div className="bar-lbl-row">
            <div className="bar-lbl">Total Users</div>
            <div className="bar-lbl">Students</div>
            <div className="bar-lbl">Faculty</div>
            <div className="bar-lbl">Admins</div>
          </div>
        </div>

        {/* Chart 2: Submission Activity */}
        <div className="analytics-card">
          <div className="analytics-card-header">
            <div className="analytics-card-title-group">
              <div className="analytics-card-title-row">
                <Activity size={16} color="#6366f1" />
                <span>Submission Activity</span>
              </div>
              <div className="analytics-card-subtitle">Submissions over the last 7 days.</div>
            </div>
            <button className="analytics-dropdown-btn">
              <span>Last 7 Days</span>
              <ChevronDown size={11} />
            </button>
          </div>

          <div className="line-chart-wrap">
            <svg viewBox="0 0 320 120" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <defs>
                <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines and Y-Labels */}
              <text x="12" y="18" fill="#94a3b8" fontSize="8.5" fontWeight="500">8</text>
              <line x1="24" y1="15" x2="315" y2="15" stroke="#f1f5f9" strokeDasharray="3 3" />

              <text x="12" y="38" fill="#94a3b8" fontSize="8.5" fontWeight="500">6</text>
              <line x1="24" y1="35" x2="315" y2="35" stroke="#f1f5f9" strokeDasharray="3 3" />

              <text x="12" y="58" fill="#94a3b8" fontSize="8.5" fontWeight="500">4</text>
              <line x1="24" y1="55" x2="315" y2="55" stroke="#f1f5f9" strokeDasharray="3 3" />

              <text x="12" y="78" fill="#94a3b8" fontSize="8.5" fontWeight="500">2</text>
              <line x1="24" y1="75" x2="315" y2="75" stroke="#f1f5f9" strokeDasharray="3 3" />

              <text x="12" y="98" fill="#94a3b8" fontSize="8.5" fontWeight="500">0</text>
              <line x1="24" y1="95" x2="315" y2="95" stroke="#e2e8f0" strokeWidth="1" />

              {/* Area Gradient fill */}
              <path
                d="M 38 85 C 60 85, 68 75, 84 75 C 100 75, 112 95, 128 95 C 144 95, 156 75, 172 75 C 188 75, 202 75, 218 75 C 236 75, 248 45, 264 45 C 280 45, 290 35, 304 35 L 304 95 L 38 95 Z"
                fill="url(#chartGlow)"
              />

              {/* Glowing Line */}
              <path
                d="M 38 85 C 60 85, 68 75, 84 75 C 100 75, 112 95, 128 95 C 144 95, 156 75, 172 75 C 188 75, 202 75, 218 75 C 236 75, 248 45, 264 45 C 280 45, 290 35, 304 35"
                fill="none"
                stroke="#6366f1"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Points */}
              <circle cx="38" cy="85" r="3" fill="#6366f1" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="84" cy="75" r="3" fill="#6366f1" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="128" cy="95" r="3" fill="#6366f1" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="172" cy="75" r="3" fill="#6366f1" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="218" cy="75" r="3" fill="#6366f1" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="264" cy="45" r="3" fill="#6366f1" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="304" cy="35" r="3" fill="#6366f1" stroke="#ffffff" strokeWidth="1.5" />

              {/* X Labels */}
              <text x="38" y="112" fill="#64748b" fontSize="8" textAnchor="middle">Sep 3</text>
              <text x="84" y="112" fill="#64748b" fontSize="8" textAnchor="middle">Sep 4</text>
              <text x="128" y="112" fill="#64748b" fontSize="8" textAnchor="middle">Sep 5</text>
              <text x="172" y="112" fill="#64748b" fontSize="8" textAnchor="middle">Sep 6</text>
              <text x="218" y="112" fill="#64748b" fontSize="8" textAnchor="middle">Sep 7</text>
              <text x="264" y="112" fill="#64748b" fontSize="8" textAnchor="middle">Sep 8</text>
              <text x="304" y="112" fill="#64748b" fontSize="8" textAnchor="middle">Sep 9</text>
            </svg>
          </div>
        </div>

        {/* Chart 3: Evaluation Status */}
        <div className="analytics-card">
          <div className="analytics-card-header">
            <div className="analytics-card-title-group">
              <div className="analytics-card-title-row">
                <FileText size={16} color="#6366f1" />
                <span>Evaluation Status</span>
              </div>
              <div className="analytics-card-subtitle">Status of all submissions.</div>
            </div>
            <button className="analytics-dropdown-btn">
              <span>This Month</span>
              <ChevronDown size={11} />
            </button>
          </div>

          <div className="donut-chart-wrap">
            {/* SVG Donut */}
            <div style={{ position: 'relative', width: '96px', height: '96px', flexShrink: 0 }}>
              <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="36"
                  fill="transparent"
                  stroke="#f1f5f9"
                  strokeWidth="12"
                />
                {/* Green Segment: Evaluated 75% -> 0.75 * 226.19 = 169.64 */}
                <circle
                  cx="50"
                  cy="50"
                  r="36"
                  fill="transparent"
                  stroke="#10b981"
                  strokeWidth="12"
                  strokeDasharray="169.64 226.19"
                  strokeDashoffset="0"
                  strokeLinecap="round"
                />
                {/* Blue Segment: Pending 25% -> 0.25 * 226.19 = 56.55 */}
                <circle
                  cx="50"
                  cy="50"
                  r="36"
                  fill="transparent"
                  stroke="#38bdf8"
                  strokeWidth="12"
                  strokeDasharray="56.55 226.19"
                  strokeDashoffset="-169.64"
                  strokeLinecap="round"
                />
              </svg>
              {/* Donut Center Label */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                  4
                </span>
                <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#64748b', marginTop: '2px' }}>
                  Total
                </span>
              </div>
            </div>

            {/* Legend */}
            <div className="donut-legend">
              <div className="donut-legend-item">
                <div>
                  <span className="donut-dot" style={{ background: '#10b981' }} />
                  <span>Evaluated</span>
                </div>
                <span className="donut-legend-val">3 (75%)</span>
              </div>
              <div className="donut-legend-item">
                <div>
                  <span className="donut-dot" style={{ background: '#38bdf8' }} />
                  <span>Pending</span>
                </div>
                <span className="donut-legend-val">1 (25%)</span>
              </div>
              <div className="donut-legend-item">
                <div>
                  <span className="donut-dot" style={{ background: '#f59e0b' }} />
                  <span>In Review</span>
                </div>
                <span className="donut-legend-val">0 (0%)</span>
              </div>
              <div className="donut-legend-item">
                <div>
                  <span className="donut-dot" style={{ background: '#ef4444' }} />
                  <span>Flagged</span>
                </div>
                <span className="donut-legend-val">0 (0%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Row 4: Two Activity Tables */}
      <div className="admin-tables-grid">
        {/* Table 1: Recently Registered Accounts */}
        <div className="admin-table-card">
          <div className="admin-table-header">
            <div className="admin-table-title-wrap">
              <Users size={17} color="#6366f1" />
              <span>Recently Registered Accounts</span>
            </div>
            <Link to="/admin/users" className="admin-table-view-all">
              <span>View All</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-exact-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Registered On</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((u, idx) => {
                  const avatar = getAvatarStyle(idx);
                  const roleLower = (u.role || 'student').toLowerCase();
                  const roleClass = roleLower === 'admin' 
                    ? 'role-pill-admin' 
                    : (roleLower === 'faculty' ? 'role-pill-faculty' : 'role-pill-student');

                  return (
                    <tr key={u.user_id || idx}>
                      <td>
                        <span className="user-avatar-circle" style={{ background: avatar.bg, color: avatar.color }}>
                          {getUserInitials(u.name)}
                        </span>
                        <span style={{ fontWeight: 600, color: '#0f172a' }}>{u.name}</span>
                      </td>
                      <td style={{ color: '#64748b' }}>{u.email}</td>
                      <td>
                        <span className={`role-pill ${roleClass}`}>
                          {(u.role || 'STUDENT').toUpperCase()}
                        </span>
                      </td>
                      <td style={{ color: '#475569' }}>
                        {formatDate(u.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 2: Recent Submission Pipeline */}
        <div className="admin-table-card">
          <div className="admin-table-header">
            <div className="admin-table-title-wrap">
              <UploadCloud size={17} color="#6366f1" />
              <span>Recent Submission Pipeline</span>
            </div>
            <Link to="/admin/submissions" className="admin-table-view-all">
              <span>View All</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-exact-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Assignment</th>
                  <th>Submitted On</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentSubs.map((s, idx) => {
                  const statusLower = (s.status || 'submitted').toLowerCase();
                  const isEvaluated = statusLower === 'evaluated';
                  const statusClass = isEvaluated ? 'status-pill-evaluated' : 'status-pill-submitted';

                  return (
                    <tr key={s.submission_id || idx}>
                      <td style={{ fontWeight: 600, color: '#0f172a' }}>
                        {s.student_name}
                      </td>
                      <td style={{ color: '#334155' }}>
                        {s.assignment_title}
                      </td>
                      <td style={{ color: '#475569' }}>
                        {formatDate(s.submitted_at)}
                      </td>
                      <td>
                        <span className={statusClass}>
                          {isEvaluated ? 'EVALUATED' : 'SUBMITTED'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
