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

  const defaultAssignments = [
    {
      assignment_id: 1,
      title: 'Python Palindrome & Prime Validator',
      faculty_name: 'Prof. Alan Turing',
      faculty_department: 'Computer Science and Engineering',
      programming_language: 'python',
      deadline: '2026-12-31T23:59:59Z',
      total_submissions: 18
    },
    {
      assignment_id: 2,
      title: 'C++ Array Target Sum Evaluator',
      faculty_name: 'Prof. Alan Turing',
      faculty_department: 'Computer Science and Engineering',
      programming_language: 'cpp',
      deadline: '2026-11-30T23:59:59Z',
      total_submissions: 12
    }
  ];

  const displayedAssignments = (assignments && assignments.length > 0) ? assignments : defaultAssignments;

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
                {displayedAssignments.map((a) => (
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
