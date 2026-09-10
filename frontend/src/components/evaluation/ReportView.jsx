import React from 'react';
import { Printer, Award, FileText, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

export function ReportView({ report }) {
  if (!report) return null;

  const { student, assignment, submission, evaluation, testCaseResults = [], plagiarism, facultyFeedback } = report;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Action Bar */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <button 
          className="btn btn-primary"
          onClick={() => window.print()}
        >
          <Printer size={18} />
          Print / Save Official Report
        </button>
      </div>

      {/* Official Academic Evaluation Report Sheet */}
      <div className="report-sheet">
        {/* Header */}
        <div className="report-header">
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              AUTOMATED STUDENT PROJECT EVALUATION HUB
            </h2>
            <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '4px' }}>
              Academic Evaluation Sheet &bull; Project ID: 2026MIN314
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#334155' }}>
              Report ID: {report.reportId}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Generated: {new Date(report.generatedAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* 1. Student & Assignment Overview */}
        <div className="report-section">
          <div className="report-section-title">1. Student & Assignment Details</div>
          <div className="report-grid-2">
            <div className="report-data-item">
              <span className="report-data-label">Student Name:</span>
              <span style={{ fontWeight: 600 }}>{student?.name}</span>
            </div>
            <div className="report-data-item">
              <span className="report-data-label">Registration No:</span>
              <span style={{ fontWeight: 600 }}>{student?.registerNumber}</span>
            </div>
            <div className="report-data-item">
              <span className="report-data-label">Department:</span>
              <span>{student?.department}</span>
            </div>
            <div className="report-data-item">
              <span className="report-data-label">Academic Year:</span>
              <span>Year {student?.year}</span>
            </div>
            <div className="report-data-item">
              <span className="report-data-label">Assignment:</span>
              <span style={{ fontWeight: 600 }}>{assignment?.title}</span>
            </div>
            <div className="report-data-item">
              <span className="report-data-label">Language:</span>
              <span style={{ textTransform: 'uppercase', fontWeight: 600 }}>{assignment?.programmingLanguage}</span>
            </div>
            <div className="report-data-item">
              <span className="report-data-label">File Submitted:</span>
              <span style={{ fontFamily: 'monospace' }}>{submission?.filename}</span>
            </div>
            <div className="report-data-item">
              <span className="report-data-label">Submitted On:</span>
              <span>{new Date(submission?.submittedAt).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* 2. Automated Execution & Test Cases */}
        <div className="report-section">
          <div className="report-section-title">2. Automated Execution & Test Cases</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
            <div className="report-score-box">
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Compilation</div>
              <div style={{ fontWeight: 700, color: evaluation?.compilationStatus === 'SUCCESS' ? '#059669' : '#dc2626' }}>
                {evaluation?.compilationStatus || 'N/A'}
              </div>
            </div>
            <div className="report-score-box">
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Execution</div>
              <div style={{ fontWeight: 700, color: evaluation?.executionStatus === 'SUCCESS' ? '#059669' : '#dc2626' }}>
                {evaluation?.executionStatus || 'N/A'}
              </div>
            </div>
            <div className="report-score-box">
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Test Cases Passed</div>
              <div style={{ fontWeight: 700, color: '#0f172a' }}>
                {evaluation?.testCasesPassed || 0} / {(evaluation?.testCasesPassed || 0) + (evaluation?.testCasesFailed || 0)}
              </div>
            </div>
            <div className="report-score-box">
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Test Score</div>
              <div style={{ fontWeight: 700, color: '#4338ca' }}>
                {evaluation?.testScore || 0} / {assignment?.maxTestScore || 60}
              </div>
            </div>
          </div>

          {/* Test Case Breakdown */}
          {testCaseResults.length > 0 && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', marginBottom: '16px' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                  <th style={{ padding: '8px', textAlign: 'left' }}>#</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Input</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Expected</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Actual Output</th>
                  <th style={{ padding: '8px', textAlign: 'center' }}>Result</th>
                </tr>
              </thead>
              <tbody>
                {testCaseResults.map((tc, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '8px' }}>{idx + 1}</td>
                    <td style={{ padding: '8px', fontFamily: 'monospace' }}>{tc.input_data || '(none)'}</td>
                    <td style={{ padding: '8px', fontFamily: 'monospace' }}>{tc.expected_output}</td>
                    <td style={{ padding: '8px', fontFamily: 'monospace' }}>{tc.actual_output || '(error)'}</td>
                    <td style={{ padding: '8px', textAlign: 'center', fontWeight: 600, color: tc.status === 'PASS' ? '#059669' : '#dc2626' }}>
                      {tc.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* 3. Plagiarism Analysis */}
        <div className="report-section">
          <div className="report-section-title">3. Source-Code Plagiarism Analysis</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Highest Pairwise Similarity Score</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: plagiarism?.highestSimilarity >= 60 ? '#dc2626' : '#059669' }}>
                {plagiarism?.highestSimilarity?.toFixed(1) || 0}%
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Plagiarism Category</div>
              <div style={{ fontWeight: 700, textTransform: 'uppercase', color: plagiarism?.status === 'HIGH_SIMILARITY' ? '#dc2626' : '#059669' }}>
                {plagiarism?.status?.replace('_', ' ') || 'LOW SIMILARITY'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Applied Penalty</div>
              <div style={{ fontWeight: 700, color: '#dc2626' }}>
                -{evaluation?.plagiarismPenalty || 0} Marks
              </div>
            </div>
          </div>
        </div>

        {/* 4. Final Score & Faculty Remarks */}
        <div className="report-section">
          <div className="report-section-title">4. Evaluation Summary & Faculty Feedback</div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', alignItems: 'center' }}>
            <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Faculty Remarks:
              </div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#1e293b', fontStyle: 'italic', lineHeight: 1.6 }}>
                "{facultyFeedback?.comments || 'Automated evaluation completed. Code executed successfully against test benchmarks.'}"
              </p>
              {facultyFeedback?.facultyName && (
                <div style={{ marginTop: '8px', fontSize: '0.75rem', color: '#64748b', textAlign: 'right' }}>
                  &mdash; {facultyFeedback.facultyName}
                </div>
              )}
            </div>

            <div style={{ textAlign: 'center', background: '#eef2ff', padding: '18px', borderRadius: '8px', border: '1px solid #c7d2fe' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4338ca' }}>
                FINAL SCORE
              </div>
              <div style={{ fontSize: '2.8rem', fontWeight: 900, color: '#312e81', lineHeight: 1.1 }}>
                {evaluation?.totalScore || 0}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#6366f1' }}>
                OUT OF 100
              </div>
            </div>
          </div>
        </div>

        {/* Footer Sign-off */}
        <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '24px', marginTop: '32px', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b' }}>
          <div>Automated Student Project Evaluation Hub &bull; Verifiable Academic Record</div>
          <div style={{ textAlign: 'right' }}>
            Authorized Academic Stamp & Signature
            <div style={{ marginTop: '24px', borderBottom: '1px solid #94a3b8', width: '180px' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
