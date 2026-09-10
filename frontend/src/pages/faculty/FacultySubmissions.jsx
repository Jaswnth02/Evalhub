import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { CodeViewerModal } from '../../components/submission/CodeViewerModal';
import { 
  FileCheck2, 
  Code, 
  ArrowUpRight, 
  AlertTriangle, 
  Filter, 
  RotateCw 
} from 'lucide-react';

export function FacultySubmissions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const assignmentFilter = searchParams.get('assignmentId') || '';

  const [submissions, setSubmissions] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCodeViewer, setActiveCodeViewer] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [subsRes, assignRes] = await Promise.all([
        api.submissions.getAll(assignmentFilter ? { assignmentId: assignmentFilter } : {}),
        api.assignments.getAll()
      ]);

      if (subsRes.success) setSubmissions(subsRes.submissions);
      if (assignRes.success) setAssignments(assignRes.assignments);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [assignmentFilter]);

  const openCodeModal = async (subId, filename) => {
    try {
      const res = await api.submissions.getById(subId);
      if (res.success && res.submission) {
        setActiveCodeViewer({
          filename: filename || res.submission.original_filename,
          content: res.submission.codeContent
        });
      }
    } catch (err) {
      alert('Failed to load code: ' + err.message);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Student Project Submissions</h1>
          <p className="page-subtitle">
            Review uploaded source files, execute automated test benchmarks, and review plagiarism metrics
          </p>
        </div>

        {/* Filter by Assignment */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-card)', padding: '6px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <Filter size={16} color="var(--text-muted)" />
            <select
              style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none' }}
              value={assignmentFilter}
              onChange={(e) => {
                if (e.target.value) {
                  setSearchParams({ assignmentId: e.target.value });
                } else {
                  setSearchParams({});
                }
              }}
            >
              <option value="">All Assignments</option>
              {assignments.map(a => (
                <option key={a.assignment_id} value={a.assignment_id}>
                  {a.title}
                </option>
              ))}
            </select>
          </div>

          <button className="btn btn-secondary btn-sm" onClick={fetchData} title="Refresh submissions">
            <RotateCw size={14} />
          </button>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading submissions...
          </div>
        ) : submissions.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No submissions found for the selected filter.
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Reg Number</th>
                  <th>Assignment</th>
                  <th>File Name</th>
                  <th>Status</th>
                  <th>Compilation</th>
                  <th>Tests Passed</th>
                  <th>Similarity</th>
                  <th>Total Score</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub) => {
                  const isHighPlag = Number(sub.plagiarism_score || 0) >= 60;
                  return (
                    <tr key={sub.submission_id}>
                      <td style={{ fontWeight: 600 }}>{sub.student_name}</td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{sub.register_number}</td>
                      <td>{sub.assignment_title}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{sub.original_filename}</td>
                      <td>
                        <StatusBadge status={sub.status} />
                      </td>
                      <td>
                        <StatusBadge status={sub.compilation_status || 'N/A'} type="compilation" />
                      </td>
                      <td>
                        <span style={{ fontWeight: 600 }}>
                          {sub.test_cases_passed || 0} / {sub.total_test_cases || 0}
                        </span>
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
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => openCodeModal(sub.submission_id, sub.original_filename)}
                            title="Inspect Code"
                          >
                            <Code size={14} />
                          </button>
                          <Link
                            to={`/faculty/submissions/${sub.submission_id}`}
                            className="btn btn-primary btn-sm"
                          >
                            <span>Evaluate</span>
                            <ArrowUpRight size={14} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {activeCodeViewer && (
        <CodeViewerModal
          isOpen={!!activeCodeViewer}
          onClose={() => setActiveCodeViewer(null)}
          filename={activeCodeViewer.filename}
          codeContent={activeCodeViewer.content}
        />
      )}
    </div>
  );
}
