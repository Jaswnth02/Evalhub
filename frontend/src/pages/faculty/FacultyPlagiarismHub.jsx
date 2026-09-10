import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { PlagiarismClusterGraph } from '../../components/evaluation/PlagiarismClusterGraph';
import { Fingerprint, Network, Filter, RotateCw, AlertTriangle } from 'lucide-react';

export function FacultyPlagiarismHub() {
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState('');
  const [hubData, setHubData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchingHub, setFetchingHub] = useState(false);

  useEffect(() => {
    async function loadAssignments() {
      try {
        const res = await api.assignments.getAll();
        if (res.success && res.assignments.length > 0) {
          setAssignments(res.assignments);
          setSelectedAssignmentId(res.assignments[0].assignment_id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAssignments();
  }, []);

  const loadHubData = async (assignId) => {
    if (!assignId) return;
    setFetchingHub(true);
    try {
      const res = await api.plagiarism.getAssignmentHub(assignId);
      if (res.success) {
        setHubData(res);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingHub(false);
    }
  };

  useEffect(() => {
    if (selectedAssignmentId) {
      loadHubData(selectedAssignmentId);
    }
  }, [selectedAssignmentId]);

  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '80px 0' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Loading Plagiarism Hub...</div>
      </div>
    );
  }

  const selectedAssign = assignments.find(a => a.assignment_id === Number(selectedAssignmentId));

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Plagiarism Detection & DBSCAN Cluster Hub</h1>
          <p className="page-subtitle">
            Algorithmic source-code similarity analysis, pairwise isomorphic matrices, and density-based collusion clustering
          </p>
        </div>

        {/* Assignment Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-card)', padding: '6px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <Filter size={16} color="var(--text-muted)" />
            <select
              style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none' }}
              value={selectedAssignmentId}
              onChange={(e) => setSelectedAssignmentId(e.target.value)}
            >
              {assignments.map((a) => (
                <option key={a.assignment_id} value={a.assignment_id}>
                  {a.title} ({a.programming_language})
                </option>
              ))}
            </select>
          </div>

          <button 
            className="btn btn-secondary btn-sm" 
            onClick={() => loadHubData(selectedAssignmentId)}
            disabled={fetchingHub}
            title="Re-run Clustering"
          >
            <RotateCw size={16} className={fetchingHub ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {/* Info Alert Box */}
      <div style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.25)', borderRadius: 'var(--radius-md)', padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <Network size={22} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--text-primary)' }}>How Plagiarism Clustering Works:</strong> Source code is preprocessed (stripping comments/whitespace), tokenized with identifier abstraction (<code style={{ color: '#c7d2fe' }}>ID_1</code>, <code style={{ color: '#c7d2fe' }}>ID_2</code>), and analyzed using Winnowing k-gram fingerprints. DBSCAN density clustering groups submissions with similarity &ge; 60% into collusion clusters.
        </div>
      </div>

      {fetchingHub ? (
        <div className="card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Computing pairwise similarity matrix and running DBSCAN clustering...
        </div>
      ) : (!hubData || hubData.submissions.length === 0) ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No submissions found for this assignment to compute similarity.
        </div>
      ) : (
        <PlagiarismClusterGraph
          clusters={hubData.clusters || []}
          outliers={hubData.outliers || []}
          matrix={hubData.matrix || []}
          submissions={hubData.submissions || []}
        />
      )}
    </div>
  );
}
