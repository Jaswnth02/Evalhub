import React, { useState, useRef } from 'react';
import { UploadCloud, FileCode2, CheckCircle2, AlertCircle } from 'lucide-react';

export function FileUploader({ onFileSelected, acceptedLanguages = ['python', 'cpp', 'c', 'java', 'javascript'] }) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const allowedExtensions = ['.py', '.cpp', '.c', '.java', '.js'];

  const validateAndSetFile = (file) => {
    setError('');
    if (!file) return;

    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      setError(`Invalid file type '${ext}'. Please upload a source code file (${allowedExtensions.join(', ')})`);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds 5MB limit.');
      return;
    }

    setSelectedFile(file);
    if (onFileSelected) onFileSelected(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  return (
    <div style={{ width: '100%' }}>
      <input
        type="file"
        ref={inputRef}
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            validateAndSetFile(e.target.files[0]);
          }
        }}
        accept=".py,.c,.cpp,.java,.js"
        style={{ display: 'none' }}
      />

      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        style={{
          border: `2px dashed ${dragOver ? 'var(--accent-primary)' : (selectedFile ? 'var(--success)' : 'var(--border-color)')}`,
          borderRadius: 'var(--radius-lg)',
          padding: '36px 24px',
          textAlign: 'center',
          cursor: 'pointer',
          background: dragOver ? 'rgba(79, 70, 229, 0.06)' : '#f8fafc',
          transition: 'all 0.2s ease'
        }}
      >
        {selectedFile ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <FileCode2 size={44} color="var(--success)" />
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '1.05rem' }}>
              {selectedFile.name}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {(selectedFile.size / 1024).toFixed(1)} KB &bull; Click or drop another file to replace
            </div>
            <span className="badge badge-success" style={{ marginTop: '6px' }}>Ready to Submit</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <UploadCloud size={44} color="var(--accent-primary)" />
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '1rem' }}>
              Drag and drop project source code, or <span style={{ color: 'var(--accent-primary)' }}>browse</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Supports Python (.py), C++ (.cpp), C (.c), Java (.java), JS (.js) up to 5MB
            </div>
          </div>
        )}
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--danger)', fontSize: '0.85rem', marginTop: '8px' }}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}
    </div>
  );
}
