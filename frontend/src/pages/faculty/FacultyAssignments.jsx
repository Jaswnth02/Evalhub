import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { PlusCircle, Calendar, Code, Trash2, ArrowUpRight, BookOpen } from 'lucide-react';

export function FacultyAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAssignments = async () => {
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
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete assignment "${title}"? This will also remove associated submissions.`)) {
      try {
        await api.assignments.delete(id);
        fetchAssignments();
      } catch (err) {
        alert('Failed to delete assignment: ' + err.message);
      }
    }
  };

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
          <h1 className="page-title">Manage Assignments</h1>
          <p className="page-subtitle">
            Create, configure, and monitor course programming assignments and test benches
          </p>
        </div>
        <Link to="/faculty/create-assignment" className="btn btn-primary">
          <PlusCircle size={18} />
          <span>Create Assignment</span>
        </Link>
      </div>

      <div className="card">
        {assignments.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No assignments created yet. Click "Create Assignment" to get started.
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Assignment Title</th>
                  <th>Language</th>
                  <th>Deadline</th>
                  <th>Test Benchmarks</th>
                  <th>Submissions</th>
                  <th>Faculty In-Charge</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((a) => (
                  <tr key={a.assignment_id}>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {a.title}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-info" style={{ textTransform: 'uppercase' }}>
                        {a.programming_language}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {new Date(a.deadline).toLocaleDateString()}
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{a.test_case_count || 0}</span> cases ({a.max_test_score}m)
                    </td>
                    <td>
                      <span className="badge badge-neutral">
                        {a.total_submissions || 0} Submitted
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {a.faculty_name}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <Link
                          to={`/faculty/submissions?assignmentId=${a.assignment_id}`}
                          className="btn btn-secondary btn-sm"
                          title="View Submissions"
                        >
                          <span>Submissions</span>
                          <ArrowUpRight size={14} />
                        </Link>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => handleDelete(a.assignment_id, a.title)}
                          style={{ color: 'var(--danger)' }}
                          title="Delete Assignment"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
