import React, { useState } from 'react';
import { MessageSquare, Send, Check } from 'lucide-react';
import { api } from '../../services/api';

export function FeedbackForm({ submissionId, currentFeedback, onFeedbackSaved }) {
  const [comments, setComments] = useState(currentFeedback?.comments || '');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comments.trim()) return;

    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      await api.feedback.submit({
        submissionId,
        comments
      });
      setSuccessMsg('Faculty feedback saved and published successfully!');
      if (onFeedbackSaved) onFeedbackSaved(comments);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit feedback.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h4 className="card-title">
          <MessageSquare size={18} color="var(--accent-primary)" />
          Faculty Evaluation Feedback
        </h4>
        {currentFeedback?.faculty_name && (
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Reviewed by: {currentFeedback.faculty_name}
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">
            Comments & Constructive Guidance for Student:
          </label>
          <textarea
            className="form-textarea"
            rows="4"
            placeholder="Provide qualitative review (e.g. algorithm efficiency, code modularity, edge case handling, plagiarism observations)..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            required
          />
        </div>

        {errorMsg && (
          <div style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '12px' }}>
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div style={{ color: 'var(--success)', fontSize: '0.85rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Check size={16} /> {successMsg}
          </div>
        )}

        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={saving || !comments.trim()}
        >
          <Send size={16} />
          {saving ? 'Saving...' : 'Save & Publish Feedback'}
        </button>
      </form>
    </div>
  );
}
