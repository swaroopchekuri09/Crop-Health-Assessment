import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  UploadCloud,
  Cpu,
  FileCheck2,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sprout,
  Activity,
  Layers,
  Leaf,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { api } from '../services/api';

export default function LandingPage() {
  const [crops, setCrops] = useState([]);
  const [loadingCrops, setLoadingCrops] = useState(true);

  useEffect(() => {
    async function fetchCrops() {
      try {
        const data = await api.getCrops({ ai_supported: true });
        setCrops(data);
      } catch (err) {
        console.warn('Could not load crops:', err.message);
      } finally {
        setLoadingCrops(false);
      }
    }
    fetchCrops();
  }, []);

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <header
        style={{
          borderBottom: '1px solid var(--border-color)',
          padding: '18px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255,255,255,0.95)',
          position: 'sticky',
          top: 0,
          zIndex: 30,
          backdropFilter: 'blur(8px)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="brand-icon">
            <Sprout size={24} />
          </div>
          <div>
            <div className="brand-name">AgriHealth AI</div>
            <div className="brand-subtitle">Smart Crop Intelligence</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to="/crops" style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--primary)', marginRight: '8px' }}>
            Crop Library
          </Link>
          <Link to="/login" className="btn btn-secondary btn-sm">
            Sign In
          </Link>
          <Link to="/register" className="btn btn-emerald btn-sm">
            Get Started <ArrowRight size={15} />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, #eaf4ee 0%, #ffffff 70%)',
          padding: '84px 24px 64px',
          textAlign: 'center'
        }}
      >
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              borderRadius: 'var(--radius-pill)',
              background: 'var(--emerald-subtle)',
              border: '1px solid #bbf7d0',
              color: 'var(--primary)',
              fontSize: '0.85rem',
              fontWeight: 700,
              marginBottom: '24px'
            }}
          >
            <Sparkles size={16} color="var(--secondary)" /> Powered by Real Agricultural Vision AI (PlantVillage MobileNetV2)
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.4rem, 5vw, 3.6rem)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: 'var(--primary)',
              lineHeight: 1.18,
              marginBottom: '22px'
            }}
          >
            AI-Powered Crop Health Intelligence
          </h1>

          <p
            style={{
              fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
              color: 'var(--text-muted)',
              lineHeight: 1.6,
              maxWidth: '700px',
              margin: '0 auto 36px'
            }}
          >
            Protect yields, diagnose crop diseases in seconds, and make confident agricultural decisions backed by machine learning.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary btn-lg">
              Start Assessment <ArrowRight size={18} />
            </Link>
            <Link to="/crops" className="btn btn-secondary btn-lg" style={{ display: 'inline-flex', gap: '8px' }}>
              <BookOpen size={18} /> Explore Crops
            </Link>
          </div>
        </div>
      </section>

      {/* Key Metrics Stats Banner */}
      <section style={{ borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', background: '#ffffff', padding: '36px 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)' }}>68</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>Crops Cataloged</div>
          </div>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--secondary)' }}>14</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>AI-Supported Crops</div>
          </div>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)' }}>38</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>Recognizable Conditions</div>
          </div>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--info)' }}>&lt; 1s</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>Local Quantized Inference</div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" style={{ padding: '80px 24px', background: 'var(--bg-light)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Workflow
            </span>
            <h2 style={{ fontSize: '2.2rem', marginTop: '6px', color: 'var(--primary)' }}>How It Works</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>From leaf photograph to actionable agronomist guidance in seconds</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '24px' }}>
            {[
              { num: '01', title: 'Upload Image', desc: 'Capture or upload clear crop foliage photos from mobile, camera, or drone.', icon: UploadCloud },
              { num: '02', title: 'AI Vision Analysis', desc: 'Quantized MobileNetV2 neural network classifies 38 plant & disease conditions.', icon: Cpu },
              { num: '03', title: 'Understand Diagnosis', desc: 'Review diagnosis, severity rating, and transparent confidence score.', icon: Activity },
              { num: '04', title: 'Take Action', desc: 'Implement vetted cultural management, nutrient advice, and safety precautions.', icon: FileCheck2 }
            ].map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={idx} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
                  <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#e0ece5', position: 'absolute', top: '16px', right: '20px' }}>
                    {step.num}
                  </div>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--emerald-subtle)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                    <Icon size={24} color="var(--secondary)" />
                  </div>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', color: 'var(--primary)' }}>{step.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured AI Supported Crops */}
      <section style={{ padding: '80px 24px', background: '#ffffff', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                AI Vision Supported
              </span>
              <h2 style={{ fontSize: '2.2rem', marginTop: '6px', color: 'var(--primary)' }}>Active AI Vision Diagnosable Crops</h2>
              <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
                Pre-trained deep learning vision models ready for instant foliar analysis
              </p>
            </div>

            <Link to="/crops" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: 'var(--secondary)' }}>
              View all 68 crops <ArrowRight size={16} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
            {crops.slice(0, 8).map((crop) => (
              <div key={crop.id} className="card" style={{ padding: '20px', borderTop: '3px solid var(--secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '2rem' }}>{crop.icon || '🌱'}</span>
                  <span className="crop-card-ai-badge supported">
                    <CheckCircle2 size={12} /> AI Active
                  </span>
                </div>
                <h4 style={{ fontSize: '1.1rem', color: 'var(--primary)', marginBottom: '4px' }}>{crop.name}</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '12px' }}>
                  {crop.scientific_name}
                </p>
                <Link
                  to="/register"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: 'var(--secondary)'
                  }}
                >
                  Analyze foliage <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety Notice Footer Banner */}
      <footer style={{ background: 'var(--primary)', color: '#ffffff', padding: '48px 24px', marginTop: 'auto' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
                <Sprout size={24} />
              </div>
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>AgriHealth AI</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Agricultural Diagnostics & Yield Protection Platform</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', fontSize: '0.9rem' }}>
              <Link to="/crops" style={{ color: '#ffffff', opacity: 0.9 }}>Crop Library</Link>
              <Link to="/login" style={{ color: '#ffffff', opacity: 0.9 }}>Portal Login</Link>
              <Link to="/register" style={{ color: '#ffffff', opacity: 0.9 }}>Register</Link>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '20px', fontSize: '0.82rem', opacity: 0.75, lineHeight: 1.6 }}>
            Disclaimer: AgriHealth AI is an educational and diagnostic advisory system powered by computer vision. Predictions are intended to assist farmers and agronomists. For chemical pesticide handling, always verify recommendations with regional agricultural extension officers and strictly adhere to certified manufacturer safety instructions.
          </div>
        </div>
      </footer>
    </div>
  );
}
