import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Filter,
  Sprout,
  Info,
  Calendar,
  Layers,
  X
} from 'lucide-react';
import { api } from '../services/api';

const CATEGORIES = [
  { id: 'all', label: 'All Crops' },
  { id: 'Cereal', label: 'Cereals & Grains' },
  { id: 'Pulse', label: 'Pulses' },
  { id: 'Legume', label: 'Legumes' },
  { id: 'Vegetable', label: 'Vegetables' },
  { id: 'Fruit', label: 'Fruits' },
  { id: 'Commercial Crop', label: 'Commercial' },
  { id: 'Plantation Crop', label: 'Plantation' },
  { id: 'Oilseed', label: 'Oilseeds' },
  { id: 'Root Crop', label: 'Root Crops' }
];

export default function CropLibrary() {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [onlyAiSupported, setOnlyAiSupported] = useState(false);
  const [activeModalCrop, setActiveModalCrop] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    async function loadCrops() {
      setLoading(true);
      try {
        const params = {};
        if (selectedCategory !== 'all') {
          params.category = selectedCategory;
        }
        if (onlyAiSupported) {
          params.ai_supported = true;
        }
        if (search.trim()) {
          params.search = search.trim();
        }
        const data = await api.getCrops(params);
        setCrops(data);
      } catch (err) {
        console.warn('Failed to load crop catalog:', err.message);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      loadCrops();
    }, 200);

    return () => clearTimeout(timer);
  }, [selectedCategory, onlyAiSupported, search]);

  const aiSupportedCount = crops.filter(c => c.ai_supported).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--secondary)', marginBottom: '6px' }}>
            <Sprout size={16} /> Agricultural Knowledge Base
          </div>
          <h1 style={{ fontSize: '2rem', color: 'var(--primary)' }}>Crop Library</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
            Explore 68 cultivated crops, agronomic requirements, and 14 AI-supported diagnostic models.
          </p>
        </div>

        <Link to="/new-assessment" className="btn btn-emerald">
          <Sparkles size={18} /> New AI Assessment
        </Link>
      </div>

      {/* Filter and Search Bar Row */}
      <div className="card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
              <Search
                size={18}
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }}
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by crop name (e.g. 'capsicum', 'paddy', 'tomato')..."
                className="form-input"
                style={{ paddingLeft: '42px', width: '100%' }}
              />
            </div>

            {/* AI Supported Filter Checkbox */}
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                userSelect: 'none',
                padding: '8px 14px',
                background: onlyAiSupported ? 'var(--emerald-subtle)' : 'var(--bg-light)',
                border: `1.5px solid ${onlyAiSupported ? 'var(--secondary)' : 'var(--border-color)'}`,
                borderRadius: 'var(--radius-pill)',
                transition: 'all 0.15s ease'
              }}
            >
              <input
                type="checkbox"
                checked={onlyAiSupported}
                onChange={(e) => setOnlyAiSupported(e.target.checked)}
                style={{ accentColor: 'var(--secondary)', width: '16px', height: '16px' }}
              />
              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--primary)' }}>
                AI-Supported Only (14 crops)
              </span>
            </label>
          </div>

          {/* Category Filter Pills */}
          <div className="filter-tabs">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`filter-tab ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Catalog Counts Summary */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
        <span>Showing <strong>{crops.length}</strong> crop varieties</span>
        <span>
          <strong style={{ color: 'var(--primary)' }}>{aiSupportedCount}</strong> with real-time AI vision models
        </span>
      </div>

      {/* Crops Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          Loading agricultural catalog...
        </div>
      ) : crops.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 20px' }}>
          <Sprout size={40} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.2rem', color: 'var(--primary)', marginBottom: '8px' }}>No crops match your criteria</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
            Try adjusting your search terms or category filter.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('all');
              setOnlyAiSupported(false);
            }}
            className="btn btn-secondary btn-sm"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="crop-catalog-grid">
          {crops.map((crop) => (
            <div
              key={crop.id}
              className={`crop-catalog-card ${crop.ai_supported ? 'ai-active' : ''}`}
            >
              <div>
                <div className="crop-card-header">
                  <div className="crop-card-icon-box">
                    {crop.icon || '🌱'}
                  </div>
                  {crop.ai_supported ? (
                    <span className="crop-card-ai-badge supported">
                      <CheckCircle2 size={13} color="#14532D" /> AI Supported
                    </span>
                  ) : (
                    <span className="crop-card-ai-badge coming-soon">
                      <Clock size={13} color="#647067" /> AI Coming Soon
                    </span>
                  )}
                </div>

                <h3 className="crop-card-title">{crop.name}</h3>
                <div className="crop-card-scientific">
                  {crop.scientific_name ? `(${crop.scientific_name})` : crop.category}
                </div>

                <p className="crop-card-desc">
                  {crop.description || 'Major agricultural crop cultivated globally for nutritional and industrial yield.'}
                </p>

                <div className="crop-card-meta">
                  <div className="crop-meta-row">
                    <span className="crop-meta-label">Category:</span>
                    <span className="crop-meta-val">{crop.category}</span>
                  </div>
                  {crop.growing_season && (
                    <div className="crop-meta-row">
                      <span className="crop-meta-label">Season:</span>
                      <span className="crop-meta-val">{crop.growing_season}</span>
                    </div>
                  )}
                  {crop.common_diseases && crop.common_diseases.length > 0 && (
                    <div className="crop-meta-row">
                      <span className="crop-meta-label">Target Diseases:</span>
                      <span className="crop-meta-val">{crop.common_diseases.length} known</span>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setActiveModalCrop(crop)}
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1 }}
                >
                  Details
                </button>
                {crop.ai_supported ? (
                  <button
                    type="button"
                    onClick={() => navigate('/new-assessment', { state: { preselectedCropId: crop.id } })}
                    className="btn btn-emerald btn-sm"
                    style={{ flex: 1 }}
                  >
                    <Sparkles size={14} /> Diagnose
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1, opacity: 0.6, cursor: 'not-allowed' }}
                    title="Deep learning vision model in active development"
                  >
                    Model Soon
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Crop Detail Modal */}
      {activeModalCrop && (
        <div
          onClick={() => setActiveModalCrop(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(20, 83, 45, 0.45)',
            backdropFilter: 'blur(5px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="card"
            style={{
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '32px',
              position: 'relative'
            }}
          >
            <button
              onClick={() => setActiveModalCrop(null)}
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-light)',
                  border: '1.5px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.4rem'
                }}
              >
                {activeModalCrop.icon || '🌱'}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h2 style={{ fontSize: '1.6rem', color: 'var(--primary)' }}>{activeModalCrop.name}</h2>
                  {activeModalCrop.ai_supported ? (
                    <span className="crop-card-ai-badge supported">
                      <CheckCircle2 size={14} /> AI Supported
                    </span>
                  ) : (
                    <span className="crop-card-ai-badge coming-soon">
                      <Clock size={14} /> AI Coming Soon
                    </span>
                  )}
                </div>
                <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.95rem' }}>
                  {activeModalCrop.scientific_name} • {activeModalCrop.category}
                </div>
              </div>
            </div>

            <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '24px' }}>
              {activeModalCrop.description}
            </p>

            {/* AI Status Callout Banner */}
            <div
              style={{
                padding: '16px 20px',
                borderRadius: 'var(--radius-md)',
                background: activeModalCrop.ai_supported ? 'var(--emerald-subtle)' : '#f8fafc',
                border: `1.5px solid ${activeModalCrop.ai_supported ? '#bbf7d0' : 'var(--border-color)'}`,
                marginBottom: '24px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700, color: activeModalCrop.ai_supported ? 'var(--primary)' : 'var(--text-muted)' }}>
                {activeModalCrop.ai_supported ? <Sparkles size={18} color="var(--secondary)" /> : <Info size={18} />}
                <span>
                  {activeModalCrop.ai_supported
                    ? 'Active Deep-Learning Vision Model Available'
                    : 'Dataset Training in Progress'}
                </span>
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', marginTop: '6px' }}>
                {activeModalCrop.ai_supported
                  ? 'Our quantized MobileNetV2 ONNX neural network can detect both healthy foliage and common foliar diseases for this crop.'
                  : 'AI leaf analysis is currently being curated for this crop. Agronomic guidance, disease profiles, and growing parameters are fully accessible below.'}
              </p>
            </div>

            {/* Agronomic Details Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div style={{ background: 'var(--bg-light)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
                  Growing Season
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--primary)' }}>
                  {activeModalCrop.growing_season || 'Varies by region & climate zone'}
                </div>
              </div>

              <div style={{ background: 'var(--bg-light)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
                  Soil Requirements
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--primary)' }}>
                  {activeModalCrop.soil_requirements || 'Well-drained fertile loam with organic matter'}
                </div>
              </div>
            </div>

            {/* Common Diseases */}
            {activeModalCrop.common_diseases && activeModalCrop.common_diseases.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '1rem', color: 'var(--primary)', marginBottom: '10px' }}>
                  Common Pathologies & Conditions
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {activeModalCrop.common_diseases.map((dis, idx) => (
                    <span
                      key={idx}
                      style={{
                        padding: '6px 12px',
                        background: '#ffffff',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-pill)',
                        fontSize: '0.85rem',
                        color: 'var(--text-main)'
                      }}
                    >
                      {dis}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Health Indicators */}
            {activeModalCrop.health_indicators && activeModalCrop.health_indicators.length > 0 && (
              <div style={{ marginBottom: '28px' }}>
                <h4 style={{ fontSize: '1rem', color: 'var(--primary)', marginBottom: '10px' }}>
                  Healthy Foliage Indicators
                </h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {activeModalCrop.health_indicators.map((ind, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: 'var(--text-main)' }}>
                      <CheckCircle2 size={15} color="var(--secondary)" />
                      <span>{ind}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setActiveModalCrop(null)}
                className="btn btn-secondary"
              >
                Close
              </button>
              {activeModalCrop.ai_supported && (
                <button
                  type="button"
                  onClick={() => {
                    const cId = activeModalCrop.id;
                    setActiveModalCrop(null);
                    navigate('/new-assessment', { state: { preselectedCropId: cId } });
                  }}
                  className="btn btn-emerald"
                >
                  <Sparkles size={16} /> Analyze {activeModalCrop.name} Leaf
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
