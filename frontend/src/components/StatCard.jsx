import React from 'react';

export default function StatCard({ title, value, icon: Icon, color = 'emerald', subtitle }) {
  const colorMap = {
    emerald: {
      bg: 'var(--emerald-subtle)',
      text: 'var(--emerald)',
      border: '#c3e6cb'
    },
    primary: {
      bg: '#e8f0ec',
      text: 'var(--primary)',
      border: '#cbdcd2'
    },
    danger: {
      bg: 'var(--danger-bg)',
      text: 'var(--danger)',
      border: '#f5c2c7'
    },
    warning: {
      bg: 'var(--warning-bg)',
      text: '#b45309',
      border: '#ffeeba'
    }
  };

  const scheme = colorMap[color] || colorMap.emerald;

  return (
    <div className="card" style={{ padding: '24px 20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '14px',
          background: scheme.bg,
          border: `1px solid ${scheme.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: scheme.text,
          flexShrink: 0
        }}
      >
        {Icon && <Icon size={26} strokeWidth={2.2} />}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1.1 }}>
          {value}
        </div>
        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '4px' }}>
          {title}
        </div>
        {subtitle && (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '2px' }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}
