import React from 'react';
import { Users, AlertOctagon, CheckCircle2, Network } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

export function PlagiarismClusterGraph({ clusters = [], outliers = [], matrix = [], submissions = [] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. DBSCAN Collusion Clusters Section */}
      <div className="card">
        <div className="card-header">
          <h4 className="card-title">
            <Network size={20} color="#ef4444" />
            Density-Based Collusion Clusters (DBSCAN Algorithm)
          </h4>
          <span className="badge badge-neutral">
            Threshold: eps=0.40 (&ge;60% Similarity)
          </span>
        </div>

        {clusters.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <CheckCircle2 size={36} color="var(--success)" style={{ margin: '0 auto 10px', display: 'block' }} />
            No collusion clusters detected! All submissions demonstrate distinct independent code structures.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {clusters.map((cluster) => (
              <div key={cluster.clusterId} className="cluster-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertOctagon size={18} color="var(--danger)" />
                    <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                      Collusion Group #{cluster.clusterId} ({cluster.size} Submissions)
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Avg Group Similarity:
                    </span>
                    <span style={{ fontWeight: 800, color: 'var(--danger)' }}>
                      {cluster.averageSimilarity}%
                    </span>
                    <span className="badge badge-danger">High Collusion Risk</span>
                  </div>
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  The following submissions share density-connected tokenized code structures:
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
                  {cluster.members.map((member) => (
                    <div 
                      key={member.submissionId}
                      style={{ 
                        background: '#ffffff', 
                        padding: '10px 14px', 
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid #fecaca'
                      }}
                    >
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                        {member.studentName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Reg No: {member.registerNumber} | Sub #{member.submissionId}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {outliers.length > 0 && (
          <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Independent / Original Work (DBSCAN Outliers/Noise)
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {outliers.map((outlier) => (
                <span key={outlier.submissionId} className="badge badge-success" style={{ textTransform: 'none' }}>
                  {outlier.studentName} ({outlier.registerNumber})
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. Pairwise Similarity Heat Matrix */}
      {matrix.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h4 className="card-title">
              Pairwise Source Code Similarity Heat Matrix
            </h4>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Values represent structural token isomorphism
            </span>
          </div>

          <div className="table-container">
            <table className="matrix-table">
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', background: '#f8fafc' }}>Student</th>
                  {matrix.map((col) => (
                    <th key={col.submissionId} style={{ minWidth: '100px', fontSize: '0.8rem' }}>
                      {col.studentName.split(' ')[0]}
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>#{col.submissionId}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrix.map((row) => (
                  <tr key={row.submissionId}>
                    <td style={{ textAlign: 'left', fontWeight: 600, background: '#f8fafc' }}>
                      {row.studentName}
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                        {row.registerNumber}
                      </span>
                    </td>
                    {matrix.map((col) => {
                      const score = Number(row.scores[col.submissionId]) || 0;
                      const isSelf = row.submissionId === col.submissionId;

                      let cellClass = 'matrix-cell-low';
                      if (isSelf) {
                        cellClass = '';
                      } else if (score >= 60) {
                        cellClass = 'matrix-cell-high';
                      } else if (score >= 35) {
                        cellClass = 'matrix-cell-mod';
                      }

                      return (
                        <td key={col.submissionId} className={cellClass}>
                          {isSelf ? '-' : `${score.toFixed(0)}%`}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
