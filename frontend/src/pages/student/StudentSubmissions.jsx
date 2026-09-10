import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { CodeViewerModal } from '../../components/submission/CodeViewerModal';
import { FileCheck2, Code, ArrowUpRight, FileText } from 'lucide-react';

export function StudentSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCodeViewer, setActiveCodeViewer] = useState(null);

  useEffect(() => {
    async function fetchSubmissions() {
      try {
        const res = await api.submissions.getAll();
        if (res.success) {
          setSubmissions(res.submissions);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchSubmissions();
  }, []);

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

  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '80px 0' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Loading your submission history...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Project Submissions</h1>
          <p className="page-subtitle">
            Central history of submitted source files, automated test outcomes, and faculty scores
          </p>
        </div>
      </div>

      <div className="card">
        {submissions.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            You have not submitted any assignments yet.
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Assignment</th>
                  <th>Submitted File</th>
                  <th>Submitted At</th>
                  <th>Status</th>
                  <th>Compilation</th>
                  <th>Tests Passed</th>
                  <th>Similarity</th>
                  <th>Final Score</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub) => (
                  <tr key={sub.submission_id}>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {sub.assignment_title}
                      </span>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        {sub.programming_language}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                        {sub.original_filename}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {new Date(sub.submitted_at).toLocaleString()}
                    </td>
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
                          color: Number(sub.plagiarism_score) >= 60 ? 'var(--danger)' : (Number(sub.plagiarism_score) >= 35 ? 'var(--warning)' : 'var(--success)') 
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
                          title="Inspect Source Code"
                        >
                          <Code size={14} />
                          <span>Code</span>
                        </button>

                        <Link
                          to={`/student/report/${sub.submission_id}`}
                          className="btn btn-secondary btn-sm"
                          title="View Official Report"
                        >
                          <FileText size={14} />
                          <span>Report</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
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
