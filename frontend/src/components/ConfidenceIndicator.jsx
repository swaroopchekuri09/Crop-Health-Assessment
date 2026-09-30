import React from 'react';
import { ConfidenceBadge } from './Badge';

export default function ConfidenceIndicator({ confidence = 0, level = 'low' }) {
  const percent = Math.round(confidence * 100);

  const getBarColor = () => {
    if (percent >= 80) return 'linear-gradient(90deg, #198754 0%, #157347 100%)';
    if (percent >= 60) return 'linear-gradient(90deg, #D99A00 0%, #b45309 100%)';
    return 'linear-gradient(90deg, #C94A4A 0%, #b91c1c 100%)';
  };

  return (
    <div style={{ marginTop: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>
            {percent}%
          </span>
          <ConfidenceBadge level={level} />
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Threshold: 80% High • 60% Mod
        </span>
      </div>

      <div
        style={{
          width: '100%',
          height: '10px',
          background: 'var(--border-color)',
          borderRadius: 'var(--radius-pill)',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            width: `${Math.min(100, Math.max(0, percent))}%`,
            height: '100%',
            background: getBarColor(),
            borderRadius: 'var(--radius-pill)',
            transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        />
      </div>
    </div>
  );
}
