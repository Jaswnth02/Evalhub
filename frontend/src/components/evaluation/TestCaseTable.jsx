import React from 'react';
import { StatusBadge } from '../common/StatusBadge';
import { CheckCircle2, XCircle, Clock, AlertTriangle } from 'lucide-react';

export function TestCaseTable({ testCaseResults = [] }) {
  if (!testCaseResults || testCaseResults.length === 0) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
        No test case execution results available. Run evaluation to execute code against test cases.
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th style={{ width: '60px' }}>#</th>
            <th>Input Data</th>
            <th>Expected Output</th>
            <th>Actual Output</th>
            <th style={{ width: '100px' }}>Time</th>
            <th style={{ width: '100px' }}>Marks</th>
            <th style={{ width: '100px', textAlign: 'center' }}>Result</th>
          </tr>
        </thead>
        <tbody>
          {testCaseResults.map((tc, index) => {
            const isPass = tc.status === 'PASS';
            return (
              <tr key={tc.testCaseId || tc.test_case_id || index}>
                <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{index + 1}</td>
                <td>
                  <pre style={{ margin: 0, fontSize: '0.8rem', fontFamily: 'var(--font-mono)', whiteSpace: 'pre-wrap' }}>
                    {tc.input_data || tc.inputData || '(none)'}
                  </pre>
                </td>
                <td>
                  <pre style={{ margin: 0, fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: '#a5b4fc', whiteSpace: 'pre-wrap' }}>
                    {tc.expected_output || tc.expectedOutput}
                  </pre>
                </td>
                <td>
                  <pre style={{ 
                    margin: 0, 
                    fontSize: '0.8rem', 
                    fontFamily: 'var(--font-mono)', 
                    color: isPass ? '#86efac' : '#fca5a5',
                    whiteSpace: 'pre-wrap' 
                  }}>
                    {tc.actual_output || tc.actualOutput || tc.errorMessage || '(empty)'}
                  </pre>
                </td>
                <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {tc.execution_time_ms || tc.executionTimeMs || 0}ms
                </td>
                <td style={{ fontWeight: 600 }}>
                  <span style={{ color: isPass ? 'var(--success)' : 'var(--text-muted)' }}>
                    {tc.marks_awarded !== undefined ? tc.marks_awarded : (isPass ? (tc.marks || 10) : 0)}
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {' '}/ {tc.max_marks || tc.marks || 10}
                  </span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <StatusBadge status={tc.status} type="execution" />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
