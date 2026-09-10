import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { ReportView } from '../../components/evaluation/ReportView';
import { ChevronLeft, AlertCircle } from 'lucide-react';

export function StudentReportView() {
  const { submissionId } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await api.reports.getBySubmission(submissionId);
        if (res.success) {
          setReport(res.report);
        }
      } catch (err) {
        setError(err.message || 'Failed to load evaluation report.');
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, [submissionId]);

  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '80px 0' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Generating academic evaluation report...</div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="page-container">
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <AlertCircle size={36} color="var(--danger)" style={{ margin: '0 auto 12px' }} />
          <h3>Unable to Load Evaluation Report</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>{error}</p>
          <Link to="/student/submissions" className="btn btn-secondary" style={{ marginTop: '16px' }}>
            Back to Submissions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="no-print" style={{ marginBottom: '20px' }}>
        <Link to="/student/submissions" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          <ChevronLeft size={16} /> Back to Submissions
        </Link>
      </div>

      <ReportView report={report} />
    </div>
  );
}
