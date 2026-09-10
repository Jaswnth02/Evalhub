import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { BookOpen, Trash2, Calendar } from 'lucide-react';

export function AdminAssignments() {
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
    if (window.confirm(`Admin: Force delete assignment "${title}"? This will cascade remove all submissions, test runs, and reports.`)) {
      try {
        await api.assignments.delete(id);
        fetchAssignments();
      } catch (err) {
        alert('Failed to delete assignment: ' + err.message);
      }
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">All Course Assignments</h1>
          <p className="page-subtitle">
            System-wide oversight of assigned programming projects and submission volumes
          </p>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading assignments...
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Assignment</th>
                  <th>Faculty In-Charge</th>
                  <th>Department</th>
                  <th>Language</th>
                  <th>Deadline</th>
                  <th>Submissions</th>
                  <th style={{ textAlign: 'right' }}>Admin Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((a) => (
                  <tr key={a.assignment_id}>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{a.title}</span>
                    </td>
                    <td>{a.faculty_name}</td>
                    <td>{a.faculty_department}</td>
                    <td>
                      <span className="badge badge-info" style={{ textTransform: 'uppercase' }}>
                        {a.programming_language}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{new Date(a.deadline).toLocaleDateString()}</td>
                    <td>
                      <span className="badge badge-neutral">{a.total_submissions || 0}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => handleDelete(a.assignment_id, a.title)}
                        style={{ color: 'var(--danger)' }}
                      >
                        <Trash2 size={14} />
                      </button>
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
