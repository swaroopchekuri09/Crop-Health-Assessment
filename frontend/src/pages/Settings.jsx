import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Cpu,
  Sliders,
  Shield,
  Bell,
  CheckCircle,
  HelpCircle,
  Leaf
} from 'lucide-react';

export default function Settings() {
  const [confidenceThreshold, setConfidenceThreshold] = useState('75');
  const [defaultSource, setDefaultSource] = useState('mobile');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pesticideWarningAcknowledged, setPesticideWarningAcknowledged] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--secondary)', marginBottom: '6px' }}>
          <SettingsIcon size={16} /> Configuration & Preferences
        </div>
        <h1 style={{ fontSize: '2rem', color: 'var(--primary)' }}>Application Settings</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
          Customize diagnostic sensitivity, default capture methods, and model inference options.
        </p>
      </div>

      {savedSuccess && (
        <div
          style={{
            padding: '14px 18px',
            background: 'var(--emerald-subtle)',
            border: '1px solid #bbf7d0',
            borderRadius: 'var(--radius-md)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: 600
          }}
        >
          <CheckCircle size={18} color="var(--secondary)" /> Preferences saved successfully.
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* AI Inference Architecture Card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Cpu size={22} color="var(--secondary)" />
            <h2 style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>AI Vision Inference Engine</h2>
          </div>
          <div
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-light)',
              border: '1px solid var(--border-color)',
              marginBottom: '16px'
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '0.88rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Model Architecture:</span>
                <div style={{ fontWeight: 600, color: 'var(--primary)' }}>MobileNetV2 (Quantized ONNX)</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Class Coverage:</span>
                <div style={{ fontWeight: 600, color: 'var(--primary)' }}>38 PlantVillage Conditions</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Execution Runtime:</span>
                <div style={{ fontWeight: 600, color: 'var(--primary)' }}>ONNX Runtime (CPU Fast-Pass)</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Supported Crops:</span>
                <div style={{ fontWeight: 600, color: 'var(--primary)' }}>14 Canonical Crops</div>
              </div>
            </div>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            The AI engine runs quantized weights locally for sub-second diagnosis with zero third-party cloud data transmission.
          </p>
        </div>

        {/* Diagnostic Sensitivity Settings */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Sliders size={22} color="var(--secondary)" />
            <h2 style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>Diagnostic Confidence Scale</h2>
          </div>

          <div className="form-group">
            <label className="form-label">High Confidence Cutoff (%)</label>
            <input
              type="range"
              min="60"
              max="90"
              step="5"
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(e.target.value)}
              style={{ accentColor: 'var(--secondary)', width: '100%' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              <span>Strict (60%)</span>
              <span><strong>{confidenceThreshold}%</strong></span>
              <span>Aggressive (90%)</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '16px' }}>
            <div style={{ flex: 1, minWidth: '180px', padding: '12px', background: 'var(--emerald-subtle)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)' }}>High Confidence</div>
              <div style={{ fontSize: '0.85rem', color: '#14532D' }}>≥ {confidenceThreshold}% probability</div>
            </div>
            <div style={{ flex: 1, minWidth: '180px', padding: '12px', background: 'var(--warning-bg)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#92400E' }}>Moderate Confidence</div>
              <div style={{ fontSize: '0.85rem', color: '#92400E' }}>50% – {confidenceThreshold}%</div>
            </div>
            <div style={{ flex: 1, minWidth: '180px', padding: '12px', background: 'var(--danger-bg)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#991B1B' }}>Low Confidence</div>
              <div style={{ fontSize: '0.85rem', color: '#991B1B' }}>&lt; 50% (re-shoot advised)</div>
            </div>
          </div>
        </div>

        {/* Default Capture Mode */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Leaf size={22} color="var(--secondary)" />
            <h2 style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>Capture & Field Defaults</h2>
          </div>

          <div className="form-group">
            <label className="form-label">Preferred Image Source</label>
            <select
              value={defaultSource}
              onChange={(e) => setDefaultSource(e.target.value)}
              className="form-select"
            >
              <option value="mobile">Mobile Phone Camera (In-Field Close-Up)</option>
              <option value="manual">Digital Camera / File Upload</option>
              <option value="drone">Drone / Aerial Imagery</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={pesticideWarningAcknowledged}
                onChange={(e) => setPesticideWarningAcknowledged(e.target.checked)}
                style={{ accentColor: 'var(--secondary)' }}
              />
              <span>Always display safety & protective gear disclaimers on chemical treatment suggestions</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                style={{ accentColor: 'var(--secondary)' }}
              />
              <span>Receive periodic agronomic tips and seasonal disease alerts</span>
            </label>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button type="submit" className="btn btn-emerald btn-lg">
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}
