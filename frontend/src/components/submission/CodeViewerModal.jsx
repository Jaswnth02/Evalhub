import React from 'react';
import { Modal } from '../common/Modal';
import { Code2, Copy, Check } from 'lucide-react';

export function CodeViewerModal({ isOpen, onClose, filename, codeContent }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (codeContent) {
      navigator.clipboard.writeText(codeContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const lines = (codeContent || '').split('\n');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Source Code: ${filename || 'submission.code'}`}
      maxWidth="850px"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {lines.length} lines &bull; {codeContent ? (codeContent.length / 1024).toFixed(1) : 0} KB
          </span>
          <button className="btn btn-secondary btn-sm" onClick={handleCopy}>
            {copied ? <Check size={16} color="var(--success)" /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy Code'}
          </button>
        </div>
      }
    >
      <div 
        style={{ 
          background: '#040711', 
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          maxHeight: '520px',
          overflowY: 'auto',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.85rem',
          lineHeight: '1.6'
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx}>
                <td 
                  style={{ 
                    width: '40px', 
                    color: '#475569', 
                    userSelect: 'none', 
                    textAlign: 'right', 
                    paddingRight: '16px',
                    verticalAlign: 'top' 
                  }}
                >
                  {idx + 1}
                </td>
                <td style={{ color: '#e2e8f0', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                  {line || ' '}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Modal>
  );
}
