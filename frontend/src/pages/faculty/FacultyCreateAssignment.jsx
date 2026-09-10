import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { PlusCircle, Trash2, ChevronLeft, Save, AlertCircle } from 'lucide-react';

export function FacultyCreateAssignment() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructions: '',
    programmingLanguage: 'python',
    deadline: '',
    maxTestScore: 60,
    maxQualityScore: 40
  });

  const [testCases, setTestCases] = useState([
    { inputData: '', expectedOutput: '', marks: 15, isSample: true },
    { inputData: '', expectedOutput: '', marks: 15, isSample: false }
  ]);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTestCaseChange = (index, field, value) => {
    const updated = [...testCases];
    updated[index][field] = value;
    setTestCases(updated);
  };

  const addTestCase = () => {
    setTestCases([...testCases, { inputData: '', expectedOutput: '', marks: 10, isSample: false }]);
  };

  const removeTestCase = (index) => {
    if (testCases.length > 1) {
      setTestCases(testCases.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.title || !formData.deadline) {
      setErrorMsg('Please provide assignment title and deadline.');
      return;
    }

    // Verify test cases have expected output
    for (let i = 0; i < testCases.length; i++) {
      if (!testCases[i].expectedOutput.trim()) {
        setErrorMsg(`Test Case #${i + 1} must have an expected output.`);
        return;
      }
    }

    setLoading(true);
    try {
      const res = await api.assignments.create({
        ...formData,
        testCases
      });

      if (res.success) {
        navigate('/faculty/assignments');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create assignment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '1000px' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link to="/faculty/assignments" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          <ChevronLeft size={16} /> Back to Assignments
        </Link>
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-title">Create New Assignment</h1>
          <p className="page-subtitle">
            Configure project specifications, runtime language, and automated test benchmark criteria
          </p>
        </div>
      </div>

      {errorMsg && (
        <div style={{ background: 'var(--danger-bg)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '12px 16px', borderRadius: 'var(--radius-md)', color: '#fca5a5', fontSize: '0.85rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Basic Specifications */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <h3 className="card-title" style={{ marginBottom: '16px' }}>
            General Project Details
          </h3>

          <div className="form-group">
            <label className="form-label">Assignment Title *</label>
            <input
              type="text"
              name="title"
              className="form-input"
              placeholder="e.g. Graph Shortest Path & Dijkstra Algorithm"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Programming Language *</label>
              <select
                name="programmingLanguage"
                className="form-select"
                value={formData.programmingLanguage}
                onChange={handleChange}
              >
                <option value="python">Python (.py)</option>
                <option value="cpp">C++ (.cpp)</option>
                <option value="c">C (.c)</option>
                <option value="java">Java (.java)</option>
                <option value="javascript">JavaScript / Node.js (.js)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Submission Deadline *</label>
              <input
                type="datetime-local"
                name="deadline"
                className="form-input"
                value={formData.deadline}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Project Description</label>
            <textarea
              name="description"
              className="form-textarea"
              rows="3"
              placeholder="Explain the background, theoretical problem, and high-level goal..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">I/O & Execution Instructions</label>
            <textarea
              name="instructions"
              className="form-textarea"
              rows="3"
              placeholder="Specify standard input format, number of test cases, and exact required output strings..."
              value={formData.instructions}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Max Test Benchmarks Score</label>
              <input
                type="number"
                name="maxTestScore"
                className="form-input"
                value={formData.maxTestScore}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Max Code Quality / Viva Score</label>
              <input
                type="number"
                name="maxQualityScore"
                className="form-input"
                value={formData.maxQualityScore}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Test Cases Builder */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">Test Benchmarks ({testCases.length})</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Fed automatically into student code via standard input (stdin) and verified against stdout
              </p>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={addTestCase}
            >
              <PlusCircle size={16} />
              <span>Add Test Case</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {testCases.map((tc, idx) => (
              <div 
                key={idx} 
                style={{ 
                  background: '#f8fafc', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: 'var(--radius-md)', 
                  padding: '16px' 
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                      Test Case #{idx + 1}
                    </span>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={tc.isSample}
                        onChange={(e) => handleTestCaseChange(idx, 'isSample', e.target.checked)}
                      />
                      <span>Sample / Public Benchmark</span>
                    </label>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Marks:</span>
                      <input
                        type="number"
                        style={{ width: '65px', padding: '4px 8px', background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                        value={tc.marks}
                        onChange={(e) => handleTestCaseChange(idx, 'marks', Number(e.target.value))}
                      />
                    </div>
                    {testCases.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTestCase(idx)}
                        style={{ color: 'var(--danger)', padding: '4px' }}
                        title="Delete Test Case"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Standard Input (stdin):
                    </label>
                    <textarea
                      rows="3"
                      className="form-textarea"
                      style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
                      placeholder="Input tokens or lines fed to code"
                      value={tc.inputData}
                      onChange={(e) => handleTestCaseChange(idx, 'inputData', e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Expected Output (stdout) *:
                    </label>
                    <textarea
                      rows="3"
                      className="form-textarea"
                      style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
                      placeholder="Exact stdout string expected"
                      value={tc.expectedOutput}
                      onChange={(e) => handleTestCaseChange(idx, 'expectedOutput', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <Link to="/faculty/assignments" className="btn btn-secondary">
            Cancel
          </Link>
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
          >
            <Save size={18} />
            {loading ? 'Creating Assignment...' : 'Publish Assignment'}
          </button>
        </div>
      </form>
    </div>
  );
}
