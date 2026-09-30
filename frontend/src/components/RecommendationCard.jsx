import React from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  ShieldCheck,
  Sprout,
  FlaskConical,
  Info,
  HeartHandshake
} from 'lucide-react';

export default function RecommendationCard({ recommendation, isHealthy = false }) {
  if (!recommendation) return null;

  if (isHealthy) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="card" style={{ borderLeft: '5px solid var(--emerald)', background: '#fafdfb' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <div style={{ padding: '8px', background: 'var(--emerald-subtle)', borderRadius: '10px', color: 'var(--emerald)' }}>
              <HeartHandshake size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>Preventive Cultural Practices</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Keep your crops thriving with routine agronomic care</p>
            </div>
          </div>
          <ul style={{ paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recommendation.prevention?.map((item, idx) => (
              <li key={idx} style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="card" style={{ borderLeft: '5px solid #0284c7' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <div style={{ padding: '8px', background: '#e0f2fe', borderRadius: '10px', color: '#0284c7' }}>
              <Sprout size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>Balanced Nutrition & Irrigation</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Optimal feeding schedule without chemical interventions</p>
            </div>
          </div>
          <ul style={{ paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recommendation.fertilizer_guidance?.map((item, idx) => (
              <li key={idx} style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>{item}</li>
            ))}
          </ul>
        </div>

        <div
          style={{
            padding: '16px 20px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--emerald-subtle)',
            border: '1px solid #c3e6cb',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}
        >
          <CheckCircle size={22} color="var(--emerald)" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '0.9rem', color: '#0f5132', fontWeight: 500 }}>
            <strong>No chemical pesticides required:</strong> Healthy plants naturally host beneficial pollinators and natural predators. Avoid prophylactic chemical spraying.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. Symptoms & Causes Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Symptoms */}
        <div className="card" style={{ borderTop: '4px solid var(--warning)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ padding: '8px', background: 'var(--warning-bg)', borderRadius: '10px', color: 'var(--warning)' }}>
              <Activity size={22} />
            </div>
            <div>
              <h4 style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>Observed Symptoms</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Diagnostic foliar indicators</p>
            </div>
          </div>
          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recommendation.symptoms?.map((s, idx) => (
              <li key={idx} style={{ fontSize: '0.92rem', color: 'var(--text-main)' }}>{s}</li>
            ))}
          </ul>
        </div>

        {/* Causes */}
        <div className="card" style={{ borderTop: '4px solid var(--danger)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ padding: '8px', background: 'var(--danger-bg)', borderRadius: '10px', color: 'var(--danger)' }}>
              <AlertTriangle size={22} />
            </div>
            <div>
              <h4 style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>Causal Factors</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pathogen & environmental conditions</p>
            </div>
          </div>
          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recommendation.causes?.map((c, idx) => (
              <li key={idx} style={{ fontSize: '0.92rem', color: 'var(--text-main)' }}>{c}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* 2. Immediate Action & Management */}
      <div className="card" style={{ borderLeft: '5px solid var(--primary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ padding: '8px', background: '#e8f0ec', borderRadius: '10px', color: 'var(--primary)' }}>
            <CheckCircle size={22} />
          </div>
          <div>
            <h4 style={{ fontSize: '1.15rem', color: 'var(--primary)' }}>Recommended Management Actions</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Immediate interventions to suppress spread</p>
          </div>
        </div>
        <ul style={{ paddingLeft: '22px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {recommendation.management?.map((m, idx) => (
            <li key={idx} style={{ fontSize: '0.93rem', color: 'var(--text-main)' }}>{m}</li>
          ))}
        </ul>
      </div>

      {/* 3. Prevention & Precautions Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        <div className="card" style={{ borderTop: '4px solid var(--emerald)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ padding: '8px', background: 'var(--emerald-subtle)', borderRadius: '10px', color: 'var(--emerald)' }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <h4 style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>Long-Term Prevention</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Crop rotation & resistant cultivars</p>
            </div>
          </div>
          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recommendation.prevention?.map((p, idx) => (
              <li key={idx} style={{ fontSize: '0.92rem', color: 'var(--text-main)' }}>{p}</li>
            ))}
          </ul>
        </div>

        <div className="card" style={{ borderTop: '4px solid #b45309' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ padding: '8px', background: 'var(--warning-bg)', borderRadius: '10px', color: '#b45309' }}>
              <Info size={22} />
            </div>
            <div>
              <h4 style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>Field Precautions</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Important safety & operational warnings</p>
            </div>
          </div>
          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recommendation.precautions?.map((pr, idx) => (
              <li key={idx} style={{ fontSize: '0.92rem', color: 'var(--text-main)' }}>{pr}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* 4. Fertilizer & Chemical Guidance Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        <div className="card" style={{ borderTop: '4px solid #0284c7' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ padding: '8px', background: '#e0f2fe', borderRadius: '10px', color: '#0284c7' }}>
              <Sprout size={22} />
            </div>
            <div>
              <h4 style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>Nutrient & Fertilizer Guidance</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Supporting cellular recovery</p>
            </div>
          </div>
          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recommendation.fertilizer_guidance?.map((f, idx) => (
              <li key={idx} style={{ fontSize: '0.92rem', color: 'var(--text-main)' }}>{f}</li>
            ))}
          </ul>
        </div>

        <div className="card" style={{ borderTop: '4px solid #7c3aed' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ padding: '8px', background: '#f5f3ff', borderRadius: '10px', color: '#7c3aed' }}>
              <FlaskConical size={22} />
            </div>
            <div>
              <h4 style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>Pesticide & Fungicide Guidance</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Regulatory chemical standards</p>
            </div>
          </div>
          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recommendation.pesticide_guidance?.map((pg, idx) => (
              <li key={idx} style={{ fontSize: '0.92rem', color: 'var(--text-main)' }}>{pg}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Safety Notice */}
      <div
        style={{
          padding: '16px 20px',
          borderRadius: 'var(--radius-md)',
          background: '#fffbf0',
          border: '1px solid #fde68a',
          fontSize: '0.85rem',
          color: '#92400e',
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start'
        }}
      >
        <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
        <span>
          <strong>Agricultural Safety Notice:</strong> {recommendation.disclaimer || 'Guidance provided is for educational and advisory purposes only. Always inspect chemical product labels and consult local agricultural extension officers before application.'}
        </span>
      </div>
    </div>
  );
}
