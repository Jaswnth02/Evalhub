import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { BookOpen, Calendar, Code, CheckCircle, Clock, ChevronRight } from 'lucide-react';

export function StudentAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAssignments() {
      try {
        const res = await api.assignments.getAll();
        if (res.success) {
          setAssignments(res.assignments);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchAssignments();
  }, []);

  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '80px 0' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Loading assignments...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Course Project Assignments</h1>
          <p className="page-subtitle">
            Review requirements, deadlines, and upload your project source code for automated evaluation
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
        {assignments.map((assignment) => {
          const isSubmitted = !!assignment.mySubmission;
          return (
            <div key={assignment.assignment_id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <span className="badge badge-info" style={{ textTransform: 'uppercase' }}>
                    {assignment.programming_language}
                  </span>
                  {isSubmitted ? (
                    <StatusBadge status={assignment.mySubmission.status} />
                  ) : (
                    <span className="badge badge-warning">Not Submitted</span>
                  )}
                </div>

                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  {assignment.title}
                </h3>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {assignment.description}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} />
                    <span>Deadline: {new Date(assignment.deadline).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Code size={14} />
                    <span>Evaluation: {assignment.test_case_count || 0} Test Benchmarks ({assignment.max_test_score || 60} marks)</span>
                  </div>
                  <div>
                    Faculty: <span style={{ color: 'var(--text-secondary)' }}>{assignment.faculty_name}</span>
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Total Submissions: {assignment.total_submissions || 0}
                </span>

                <Link
                  to={`/student/assignments/${assignment.assignment_id}`}
                  className="btn btn-primary btn-sm"
                >
                  <span>{isSubmitted ? 'View / Resubmit' : 'Open Assignment'}</span>
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
