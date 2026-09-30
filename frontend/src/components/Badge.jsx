import React from 'react';

export function StatusBadge({ status }) {
  switch (status) {
    case 'healthy':
      return <span className="badge badge-success">✓ Healthy Crop</span>;
    case 'disease_detected':
      return <span className="badge badge-danger">● Disease Detected</span>;
    case 'low_confidence':
      return <span className="badge badge-warning">⚠ Low Confidence</span>;
    case 'invalid_image':
      return <span className="badge badge-neutral">✕ Unsuitable Image</span>;
    case 'model_unavailable':
      return <span className="badge badge-neutral">! Model Offline</span>;
    default:
      return <span className="badge badge-neutral">{status}</span>;
  }
}

export function SeverityBadge({ severity }) {
  switch (severity?.toLowerCase()) {
    case 'critical':
      return <span className="badge badge-danger" style={{ background: '#7f1d1d', color: '#fff', borderColor: '#991b1b' }}>Critical</span>;
    case 'high':
      return <span className="badge badge-danger">High Severity</span>;
    case 'medium':
      return <span className="badge badge-warning">Moderate Severity</span>;
    case 'low':
      return <span className="badge badge-info">Low Severity</span>;
    case 'none':
      return <span className="badge badge-success">No Severity</span>;
    default:
      return <span className="badge badge-neutral">{severity || 'Standard'}</span>;
  }
}

export function ConfidenceBadge({ level, value }) {
  const percentStr = value !== undefined && value !== null ? `${Math.round(value * 100)}%` : '';
  switch (level?.toLowerCase()) {
    case 'high':
      return <span className="badge badge-success">{percentStr} High Confidence</span>;
    case 'moderate':
      return <span className="badge badge-warning">{percentStr} Moderate Confidence</span>;
    case 'low':
      return <span className="badge badge-danger">{percentStr} Low Confidence</span>;
    default:
      return <span className="badge badge-neutral">{percentStr || 'Evaluating'}</span>;
  }
}
