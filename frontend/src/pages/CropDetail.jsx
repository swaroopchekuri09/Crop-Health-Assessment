import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Sparkles,
  Info,
  Calendar,
  Layers,
  Sprout,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { api } from '../services/api';

export default function CropDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [crop, setCrop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadCrop() {
      try {
        const data = await api.getCropDetail(id);
        setCrop(data);
      } catch (err) {
        setError(err.message || 'Crop not found');
      } finally {
        setLoading(false);
      }
    }
    loadCrop();
  }, [id]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
        Loading crop details...
      </div>
    );
  }

  if (error || !crop) {
    return (
      <div className="card" style={{ maxWidth: '600px', margin: '40px auto', textAlign: 'center', padding: '40px' }}>
        <AlertTriangle size={48} color="var(--danger)" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: '1.4rem', color: 'var(--primary)', marginBottom: '8px' }}>Crop Not Found</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>The requested crop could not be found in our catalog.</p>
        <Link to="/crops" className="btn btn-secondary">
          <ArrowLeft size={16} /> Back to Crop Library
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Top Navigation */}
      <div>
        <Link to="/crops" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', gap: '8px' }}>
          <ArrowLeft size={16} /> Back to Crop Library
        </Link>
      </div>

      {/* Main Header Card */}
      <div className="card" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div
              style={{
                width: '76px',
                height: '76px',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--bg-light)',
                border: '1.5px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3rem'
              }}
            >
              {crop.icon || '🌱'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '2.2rem', color: 'var(--primary)' }}>{crop.name}</h1>
                {crop.ai_supported ? (
                  <span className="crop-card-ai-badge supported" style={{ padding: '6px 14px', fontSize: '0.82rem' }}>
                    <CheckCircle2 size={15} /> AI Supported
                  </span>
                ) : (
                  <span className="crop-card-ai-badge coming-soon" style={{ padding: '6px 14px', fontSize: '0.82rem' }}>
                    <Clock size={15} /> AI Analysis Coming Soon
                  </span>
                )}
              </div>
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '1.05rem', marginTop: '4px' }}>
                {crop.scientific_name} • {crop.category}
              </p>
            </div>
          </div>

          {crop.ai_supported && (
            <button
              onClick={() => navigate('/new-assessment', { state: { preselectedCropId: crop.id } })}
              className="btn btn-emerald btn-lg"
            >
              <Sparkles size={18} /> Analyze {crop.name} Leaf
            </button>
          )}
        </div>

        <p style={{ color: 'var(--text-main)', fontSize: '1.05rem', lineHeight: 1.65, marginTop: '24px' }}>
          {crop.description}
        </p>
      </div>

      {/* AI Diagnostic Capability Notice */}
      <div
        className="card"
        style={{
          borderLeft: `4px solid ${crop.ai_supported ? 'var(--secondary)' : 'var(--text-muted)'}`,
          background: crop.ai_supported ? 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)' : '#f8fafc'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <Sparkles size={20} color={crop.ai_supported ? 'var(--secondary)' : 'var(--text-muted)'} />
          <h3 style={{ fontSize: '1.15rem', color: 'var(--primary)' }}>
            {crop.ai_supported
              ? 'PlantVillage MobileNetV2 Vision Diagnostic Ready'
              : 'Agronomic Dataset Expansion in Progress'}
          </h3>
        </div>
        <p style={{ color: 'var(--text-main)', fontSize: '0.92rem', lineHeight: 1.6 }}>
          {crop.ai_supported
            ? 'This crop is fully integrated with our high-accuracy quantized MobileNetV2 neural network. You can capture a photograph of healthy or distressed leaves and receive real-time classification, confidence analysis, and tailored agronomic management steps.'
            : 'Vision inference for this crop is currently undergoing data collection and verification. You can reference its agronomic guidelines, target diseases, and soil specifications below.'}
        </p>
      </div>

      {/* Growing & Agronomic Profile */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <Calendar size={20} color="var(--secondary)" />
            <h3 style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>Growing Season & Climate</h3>
          </div>
          <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: 1.6 }}>
            {crop.growing_season || 'Cultivated across multiple climate zones depending on cultivar and seasonal monsoons.'}
          </p>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <Layers size={20} color="var(--secondary)" />
            <h3 style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>Soil & Nutrient Conditions</h3>
          </div>
          <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: 1.6 }}>
            {crop.soil_requirements || 'Prefers well-drained, aerated soils rich in organic matter with balanced NPK.'}
          </p>
        </div>
      </div>

      {/* Common Diseases Section */}
      {crop.common_diseases && crop.common_diseases.length > 0 && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <ShieldCheck size={20} color="var(--secondary)" />
            <h3 style={{ fontSize: '1.15rem', color: 'var(--primary)' }}>Recognized Pathologies & Stresses</h3>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {crop.common_diseases.map((dis, idx) => (
              <span
                key={idx}
                style={{
                  padding: '8px 16px',
                  background: 'var(--bg-light)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  color: 'var(--text-main)'
                }}
              >
                {dis}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Foliage Health Indicators */}
      {crop.health_indicators && crop.health_indicators.length > 0 && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <CheckCircle2 size={20} color="var(--secondary)" />
            <h3 style={{ fontSize: '1.15rem', color: 'var(--primary)' }}>Foliage Health Indicators</h3>
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {crop.health_indicators.map((ind, idx) => (
              <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.95rem', color: 'var(--text-main)' }}>
                <CheckCircle2 size={16} color="var(--secondary)" style={{ flexShrink: 0 }} />
                <span>{ind}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
