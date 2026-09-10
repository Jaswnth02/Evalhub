import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { TestCaseTable } from '../../components/evaluation/TestCaseTable';
import { PlagiarismScore } from '../../components/evaluation/PlagiarismScore';
import { FeedbackForm } from '../../components/evaluation/FeedbackForm';
import { 
  Play, 
  ChevronLeft, 
  FileCode, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Terminal, 
  Award,
  Clock,
  RotateCw
} from 'lucide-react';

export function FacultySubmissionDetail() {
  const { id } = useParams();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [evalMessage, setEvalMessage] = useState('');
  const [activeTab, setActiveTab] = useState('evaluation'); // 'evaluation' | 'code' | 'plagiarism' | 'feedback'

  const fetchSubmission = async () => {
    try {
      const res = await api.submissions.getById(id);
      if (res.success) {
        setSubmission(res.submission);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmission();
  }, [id]);

  const handleTriggerEvaluation = async () => {
    setEvaluating(true);
    setEvalMessage('');
    try {
      const res = await api.evaluation.trigger(id);
      if (res.success) {
        setEvalMessage('Automated evaluation and plagiarism check re-run successfully!');
        await fetchSubmission();
      }
    } catch (err) {
      setEvalMessage('Evaluation failed: ' + err.message);
    } finally {
      setEvaluating(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '80px 0' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Loading submission details...</div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="page-container">
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <h3>Submission not found</h3>
          <Link to="/faculty/submissions" className="btn btn-secondary" style={{ marginTop: '16px' }}>
            Back to Submissions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div style={{ marginBottom: '20px' }}>
        <Link to="/faculty/submissions" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          <ChevronLeft size={16} /> Back to Submissions
        </Link>
      </div>

      {/* Header Bar */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span className="badge badge-info" style={{ textTransform: 'uppercase' }}>
              {submission.programming_language}
            </span>
            <StatusBadge status={submission.status} />
          </div>
          <h1 className="page-title">
            {submission.student_name} &bull; {submission.assignment_title}
          </h1>
          <p className="page-subtitle">
            Reg: {submission.register_number} | Department: {submission.department} | Submitted: {new Date(submission.submitted_at).toLocaleString()}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            className="btn btn-primary"
            onClick={handleTriggerEvaluation}
            disabled={evaluating}
          >
            <Play size={16} />
            <span>{evaluating ? 'Executing in Sandbox...' : 'Run Automated Evaluation'}</span>
          </button>

          <Link
            to={`/student/report/${submission.submission_id}`}
            className="btn btn-secondary"
            title="Preview Printable Academic Report"
          >
            <FileText size={16} />
            <span>Official Report</span>
          </Link>
        </div>
      </div>

      {evalMessage && (
        <div style={{ background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '12px 16px', borderRadius: 'var(--radius-md)', color: '#c7d2fe', fontSize: '0.85rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RotateCw size={16} />
          <span>{evalMessage}</span>
        </div>
      )}

      {/* Metric Summary Grid */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-value" style={{ color: submission.compilation_status === 'SUCCESS' ? 'var(--success)' : 'var(--danger)' }}>
              {submission.compilation_status || 'NOT RUN'}
            </span>
            <span className="stat-label">Compilation Status</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-value">
              {submission.test_cases_passed || 0} / {(submission.test_cases_passed || 0) + (submission.test_cases_failed || 0)}
            </span>
            <span className="stat-label">Test Cases Passed</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-value" style={{ color: Number(submission.report_plagiarism_score || 0) >= 60 ? 'var(--danger)' : 'var(--success)' }}>
              {submission.report_plagiarism_score !== null ? `${Number(submission.report_plagiarism_score).toFixed(1)}%` : '--'}
            </span>
            <span className="stat-label">Highest Similarity</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-value" style={{ color: 'var(--accent-primary)' }}>
              {submission.total_score !== null ? `${submission.total_score} / 100` : '--'}
            </span>
            <span className="stat-label">Final Evaluation Score</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', marginBottom: '24px' }}>
        <button
          className={`btn ${activeTab === 'evaluation' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('evaluation')}
        >
          Execution & Test Benchmarks
        </button>
        <button
          className={`btn ${activeTab === 'code' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('code')}
        >
          Source Code ({submission.original_filename})
        </button>
        <button
          className={`btn ${activeTab === 'plagiarism' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('plagiarism')}
        >
          Plagiarism & Pairwise Matches
        </button>
        <button
          className={`btn ${activeTab === 'feedback' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('feedback')}
        >
          Faculty Feedback & Marks
        </button>
      </div>

      {/* Tab 1: Execution & Test Cases */}
      {activeTab === 'evaluation' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {submission.compilation_output && (
            <div className="card">
              <div className="card-header">
                <h4 className="card-title">
                  <Terminal size={18} color="var(--accent-primary)" />
                  Compiler & Sandbox Runtime Output
                </h4>
              </div>
              <pre className="code-box" style={{ margin: 0, maxHeight: '200px' }}>
                {submission.compilation_output}
              </pre>
            </div>
          )}

          <div className="card">
            <div className="card-header">
              <h4 className="card-title">
                Test Case Execution Benchmarks
              </h4>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Test Score: {submission.test_score || 0} / {submission.max_test_score || 60}
              </span>
            </div>
            <TestCaseTable testCaseResults={submission.testCaseResults} />
          </div>
        </div>
      )}

      {/* Tab 2: Source Code */}
      {activeTab === 'code' && (
        <div className="card">
          <div className="card-header">
            <h4 className="card-title">
              <FileCode size={18} color="var(--accent-primary)" />
              Submitted Source File: {submission.original_filename}
            </h4>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Language: {submission.programming_language}
            </span>
          </div>

          <div className="code-box" style={{ maxHeight: '600px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {(submission.codeContent || '').split('\n').map((line, idx) => (
                  <tr key={idx}>
                    <td style={{ width: '40px', color: '#475569', userSelect: 'none', textAlign: 'right', paddingRight: '16px', verticalAlign: 'top' }}>
                      {idx + 1}
                    </td>
                    <td style={{ color: '#e2e8f0', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                      {line || ' '}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Plagiarism Details */}
      {activeTab === 'plagiarism' && (
        <PlagiarismScore
          similarityScore={submission.report_plagiarism_score || 0}
          matches={submission.plagiarismMatches || []}
        />
      )}

      {/* Tab 4: Faculty Feedback Form */}
      {activeTab === 'feedback' && (
        <FeedbackForm
          submissionId={submission.submission_id}
          currentFeedback={{
            comments: submission.faculty_feedback,
            faculty_name: submission.feedback_faculty_name
          }}
          onFeedbackSaved={() => fetchSubmission()}
        />
      )}
    </div>
  );
}
