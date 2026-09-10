import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { FileUploader } from '../../components/submission/FileUploader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { TestCaseTable } from '../../components/evaluation/TestCaseTable';
import { 
  BookOpen, 
  Calendar, 
  Code, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  FileText,
  ChevronLeft,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';

export function StudentAssignmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchDetails = async () => {
    try {
      const res = await api.assignments.getById(id);
      if (res.success) {
        setAssignment(res.assignment);
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleSubmitCode = async (e) => {
    e.preventDefault();
    if (!fileToUpload) return;

    setSubmitting(true);
    setErrorMsg('');
    setSubmitSuccess(null);

    try {
      const formData = new FormData();
      formData.append('assignmentId', id);
      formData.append('codeFile', fileToUpload);

      const res = await api.submissions.submit(formData);
      if (res.success) {
        setSubmitSuccess(res);
        setFileToUpload(null);
        await fetchDetails();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit project code.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '80px 0' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Loading assignment requirements...</div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="page-container">
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <AlertCircle size={36} color="var(--danger)" style={{ margin: '0 auto 12px' }} />
          <h3>Assignment Not Found</h3>
          <Link to="/student/assignments" className="btn btn-secondary" style={{ marginTop: '16px' }}>
            Back to Assignments
          </Link>
        </div>
      </div>
    );
  }

  const mySub = assignment.mySubmission;

  return (
    <div className="page-container">
      <div style={{ marginBottom: '20px' }}>
        <Link to="/student/assignments" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          <ChevronLeft size={16} /> Back to Assignments
        </Link>
      </div>

      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span className="badge badge-info" style={{ textTransform: 'uppercase' }}>
              {assignment.programming_language}
            </span>
            {mySub && <StatusBadge status={mySub.status} />}
          </div>
          <h1 className="page-title">{assignment.title}</h1>
          <p className="page-subtitle">
            Faculty In-charge: {assignment.faculty_name} ({assignment.faculty_department})
          </p>
        </div>

        {mySub && mySub.status === 'evaluated' && (
          <Link to={`/student/report/${mySub.submission_id}`} className="btn btn-primary">
            <FileText size={18} />
            <span>View Evaluation Report</span>
          </Link>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '24px', alignItems: 'start' }}>
        {/* Left Column: Requirements & Sample Test Cases */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Overview & Instructions */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '16px' }}>
              <BookOpen size={18} color="var(--accent-primary)" />
              Project Objective & Specifications
            </h3>
            <p style={{ color: 'var(--text-primary)', lineHeight: 1.7, fontSize: '0.95rem', marginBottom: '20px' }}>
              {assignment.description}
            </p>

            {assignment.instructions && (
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '8px' }}>
                  I/O & Execution Instructions:
                </div>
                <pre style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', margin: 0 }}>
                  {assignment.instructions}
                </pre>
              </div>
            )}

            <div style={{ display: 'flex', gap: '24px', marginTop: '20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <div>Deadline: <strong style={{ color: 'var(--text-primary)' }}>{new Date(assignment.deadline).toLocaleString()}</strong></div>
              <div>Test Benchmark Weight: <strong style={{ color: 'var(--text-primary)' }}>{assignment.max_test_score} Marks</strong></div>
            </div>
          </div>

          {/* Sample Test Cases Preview */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <Code size={18} color="var(--accent-primary)" />
                Sample Test Cases
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Visible public benchmarks
              </span>
            </div>

            {(!assignment.testCases || assignment.testCases.length === 0) ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No sample test cases provided. Your code will be tested against private benchmarks upon submission.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {assignment.testCases.map((tc, idx) => (
                  <div key={idx} style={{ background: '#f8fafc', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.8rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Sample Test Case #{idx + 1}</span>
                      <span className="badge badge-neutral">{tc.marks} marks</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.8rem' }}>
                      <div>
                        <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>Input (stdin):</div>
                        <pre style={{ margin: 0, padding: '8px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px', fontFamily: 'var(--font-mono)', color: '#0f172a' }}>
                          {tc.input_data || '(none)'}
                        </pre>
                      </div>
                      <div>
                        <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>Expected Output (stdout):</div>
                        <pre style={{ margin: 0, padding: '8px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px', fontFamily: 'var(--font-mono)', color: '#4338ca' }}>
                          {tc.expected_output}
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Code Upload & Live Result Feedback */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Upload Form */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '16px' }}>
              <Send size={18} color="var(--accent-primary)" />
              {mySub ? 'Resubmit Project Solution' : 'Submit Project Solution'}
            </h3>

            <form onSubmit={handleSubmitCode}>
              <div className="form-group">
                <FileUploader
                  onFileSelected={setFileToUpload}
                  acceptedLanguages={[assignment.programming_language]}
                />
              </div>

              {errorMsg && (
                <div style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertCircle size={16} /> {errorMsg}
                </div>
              )}

              {submitSuccess && (
                <div style={{ background: 'var(--success-bg)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '12px', borderRadius: 'var(--radius-md)', color: '#86efac', fontSize: '0.85rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={16} />
                  Code uploaded and automated evaluation executed!
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%' }}
                disabled={!fileToUpload || submitting}
              >
                {submitting ? 'Running Automated Evaluation...' : (mySub ? 'Resubmit & Re-evaluate' : 'Submit Code & Evaluate')}
              </button>
            </form>
          </div>

          {/* Current Evaluation Status Box */}
          {mySub && (
            <div className="card" style={{ borderLeft: '4px solid var(--accent-primary)' }}>
              <div className="card-header">
                <h4 className="card-title" style={{ fontSize: '1rem' }}>
                  <ShieldCheck size={18} color="var(--accent-primary)" />
                  Latest Evaluation Status
                </h4>
                <StatusBadge status={mySub.status} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>File Submitted:</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>{mySub.original_filename}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Submission Date:</span>
                  <span>{new Date(mySub.submitted_at).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Compilation / Syntax:</span>
                  <strong style={{ color: mySub.compilation_status === 'SUCCESS' ? 'var(--success)' : 'var(--danger)' }}>
                    {mySub.compilation_status || 'Pending'}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Similarity Analysis:</span>
                  <span style={{ fontWeight: 700 }}>
                    {mySub.plagiarism_score !== null ? `${Number(mySub.plagiarism_score).toFixed(1)}%` : 'Pending'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Total Marks Awarded:</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {mySub.total_score !== null ? `${mySub.total_score} / 100` : '--'}
                  </span>
                </div>

                {mySub.feedback_comment && (
                  <div style={{ marginTop: '10px', padding: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Faculty Feedback:</div>
                    <div style={{ fontStyle: 'italic', marginTop: '4px', color: '#1e293b' }}>"{mySub.feedback_comment}"</div>
                  </div>
                )}
              </div>

              <div style={{ marginTop: '16px' }}>
                <Link to={`/student/report/${mySub.submission_id}`} className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                  <span>Open Full Academic Report</span>
                  <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
