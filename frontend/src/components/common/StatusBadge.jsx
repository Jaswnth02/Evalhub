import React from 'react';

export function StatusBadge({ status, type = 'status' }) {
  if (!status) return null;

  const normalized = status.toString().toUpperCase();

  let badgeClass = 'badge-neutral';
  let label = normalized;

  if (type === 'plagiarism') {
    if (normalized.includes('HIGH') || normalized === 'HIGH_SIMILARITY') {
      badgeClass = 'badge-danger';
      label = 'High Similarity';
    } else if (normalized.includes('MODERATE') || normalized === 'MODERATE_SIMILARITY') {
      badgeClass = 'badge-warning';
      label = 'Moderate Similarity';
    } else {
      badgeClass = 'badge-success';
      label = 'Original / Low';
    }
  } else if (type === 'execution' || type === 'compilation') {
    if (normalized === 'SUCCESS' || normalized === 'PASS') {
      badgeClass = 'badge-success';
    } else if (normalized === 'TIMEOUT') {
      badgeClass = 'badge-warning';
    } else {
      badgeClass = 'badge-danger';
    }
  } else {
    // Submission status
    switch (normalized) {
      case 'EVALUATED':
        badgeClass = 'badge-success';
        label = 'Evaluated';
        break;
      case 'EVALUATING':
        badgeClass = 'badge-info';
        label = 'Evaluating...';
        break;
      case 'SUBMITTED':
        badgeClass = 'badge-warning';
        label = 'Submitted';
        break;
      case 'ERROR':
        badgeClass = 'badge-danger';
        label = 'Execution Error';
        break;
      default:
        badgeClass = 'badge-neutral';
    }
  }

  return (
    <span className={`badge ${badgeClass}`}>
      {label}
    </span>
  );
}
