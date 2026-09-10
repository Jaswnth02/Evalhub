import React from 'react';
import { StatusBadge } from '../common/StatusBadge';
import { ShieldAlert, ShieldCheck, AlertCircle } from 'lucide-react';

export function PlagiarismScore({ similarityScore = 0, matches = [] }) {
  const score = Number(similarityScore) || 0;

  let color = 'var(--success)';
  let bgGradient = 'linear-gradient(90deg, #10b981 0%, #059669 100%)';
  let label = 'Low Similarity (Original Code)';
  let status = 'LOW_SIMILARITY';

  if (score >= 60) {
    color = 'var(--danger)';
    bgGradient = 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)';
    label = 'High Similarity (Suspicious Collusion)';
    status = 'HIGH_SIMILARITY';
  } else if (score >= 35) {
    color = 'var(--warning)';
    bgGradient = 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)';
    label = 'Moderate Similarity (Review Required)';
    status = 'MODERATE_SIMILARITY';
  }

  return (
    <div className="card" style={{ marginBottom: '20px' }}>
      <div className="card-header">
        <h4 className="card-title">
          <ShieldAlert size={20} color={color} />
          Plagiarism & Source Code Similarity Analysis
        </h4>
        <StatusBadge status={status} type="plagiarism" />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '28px', flexWrap: 'wrap' }}>
        <div style={{ textAlign: 'center', minWidth: '120px' }}>
          <div style={{ fontSize: '2.8rem', fontWeight: 800, color, lineHeight: 1 }}>
            {score.toFixed(1)}%
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
            Highest Match
          </div>
        </div>

        <div style={{ flex: 1, minWidth: '220px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{label}</span>
            <span style={{ color: 'var(--text-muted)' }}>Threshold: 60%</span>
          </div>

          {/* Progress meter bar */}
          <div style={{ 
            height: '10px', 
            background: '#e2e8f0', 
            borderRadius: '9999px', 
            overflow: 'hidden' 
          }}>
            <div 
              style={{ 
                height: '100%', 
                width: `${Math.min(100, Math.max(2, score))}%`, 
                background: bgGradient, 
                borderRadius: '9999px',
                transition: 'width 0.8s ease'
              }} 
            />
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            Method: Source-code preprocessing, token abstraction & Winnowing k-gram fingerprinting
          </div>
        </div>
      </div>

      {matches.length > 0 && (
        <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '10px', color: 'var(--text-secondary)' }}>
            Detected Pairwise Matches ({matches.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {matches.map((m, i) => (
              <div 
                key={i} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: '#f8fafc',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem'
                }}
              >
                <div>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {m.compared_student_name || `Submission #${m.compared_submission_id}`}
                  </span>
                  {m.compared_reg_no && (
                    <span style={{ color: 'var(--text-muted)', marginLeft: '8px', fontSize: '0.75rem' }}>
                      ({m.compared_reg_no})
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontWeight: 700, color: Number(m.similarity_score) >= 60 ? 'var(--danger)' : 'var(--warning)' }}>
                    {Number(m.similarity_score).toFixed(1)}%
                  </span>
                  <StatusBadge status={m.detection_status} type="plagiarism" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
