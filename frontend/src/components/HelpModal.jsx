import React from 'react';
import { X, Check, AlertTriangle, Camera, Sun, Focus, Crop } from 'lucide-react';

export default function HelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(18, 55, 42, 0.45)',
        backdropFilter: 'blur(6px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          maxWidth: '620px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '32px',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            color: 'var(--text-muted)',
            padding: '6px'
          }}
        >
          <X size={22} />
        </button>

        <h3 style={{ fontSize: '1.4rem', color: 'var(--primary)', marginBottom: '8px' }}>
          Crop Photography Best Practices
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
          To ensure the highest AI classification confidence, follow these field capture recommendations:
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <div style={{ padding: '8px', background: 'var(--emerald-subtle)', borderRadius: '10px', color: 'var(--emerald)', flexShrink: 0 }}>
              <Focus size={20} />
            </div>
            <div>
              <h5 style={{ fontSize: '1rem', color: 'var(--primary)', marginBottom: '4px' }}>Close-Up on Affected Foliage</h5>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                Frame the specific leaf or symptom area in sharp focus. Avoid blurry shots or shaking leaves in windy conditions.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <div style={{ padding: '8px', background: 'var(--warning-bg)', borderRadius: '10px', color: '#b45309', flexShrink: 0 }}>
              <Sun size={20} />
            </div>
            <div>
              <h5 style={{ fontSize: '1rem', color: 'var(--primary)', marginBottom: '4px' }}>Natural Diffuse Lighting</h5>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                Photograph during morning or late afternoon. Avoid severe direct midday shadows or dark indoor photography.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <div style={{ padding: '8px', background: '#e0f2fe', borderRadius: '10px', color: '#0284c7', flexShrink: 0 }}>
              <Crop size={20} />
            </div>
            <div>
              <h5 style={{ fontSize: '1rem', color: 'var(--primary)', marginBottom: '4px' }}>Supported Crops Only</h5>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                Verify that your crop is among the 14 supported agricultural species (Tomato, Potato, Corn, Apple, Grape, etc.).
              </p>
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: '24px',
            padding: '16px',
            background: 'var(--bg-light)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            fontSize: '0.82rem',
            color: 'var(--text-muted)'
          }}
        >
          <strong>Scientific Disclaimer:</strong> This software uses neural network image classification trained on the standard agricultural PlantVillage dataset. It is intended as an assistive scouting aid and does not substitute for on-site agronomist laboratory testing.
        </div>

        <div style={{ marginTop: '24px', textAlign: 'right' }}>
          <button onClick={onClose} className="btn btn-primary btn-sm">
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
