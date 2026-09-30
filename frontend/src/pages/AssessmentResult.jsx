import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ArrowLeft,
  PlusCircle,
  Printer,
  History,
  Layers,
  Sparkles,
  Camera,
  Calendar,
  Share2
} from 'lucide-react';
import { api } from '../services/api';
import { StatusBadge, SeverityBadge, ConfidenceBadge } from '../components/Badge';
import ConfidenceIndicator from '../components/ConfidenceIndicator';
import RecommendationCard from '../components/RecommendationCard';

export default function AssessmentResult() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState(location.state?.assessment || null);
  const [loading, setLoading] = useState(!assessment);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!assessment && id) {
      async function fetchAssessment() {
        try {
          const data = await api.getAssessment(id);
          setAssessment(data);
        } catch (err) {
          setError(err.message || 'Failed to load assessment report.');
        } finally {
          setLoading(false);
        }
      }
      fetchAssessment();
    }
  }, [id, assessment]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
        Loading assessment report #{id}...
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="card" style={{ maxWidth: '600px', margin: '40px auto', textAlign: 'center', padding: '40px' }}>
        <AlertTriangle size={48} color="var(--danger)" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: '1.4rem', color: 'var(--primary)', marginBottom: '8px' }}>Report Not Found</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>{error || 'Unable to load diagnostic details.'}</p>
        <Link to="/history" className="btn btn-secondary">
          <ArrowLeft size={16} /> Return to History
        </Link>
      </div>
    );
  }

  const isHealthy = assessment.status === 'healthy';
  const isLowConfidence = assessment.status === 'low_confidence';
  const isInvalidImage = assessment.status === 'invalid_image';
  const isModelUnavailable = assessment.status === 'model_unavailable';

  const pred = assessment.prediction;
  const rec = assessment.recommendation;

  const formatDate = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Top Breadcrumb & Action Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={() => navigate(-1)} className="btn btn-secondary btn-sm">
            <ArrowLeft size={15} /> Back
          </button>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Assessment ID: <strong style={{ color: 'var(--primary)' }}>#{assessment.id.slice(-8)}</strong>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={handlePrint} className="btn btn-secondary btn-sm" title="Print or save as PDF">
            <Printer size={15} /> Print Report
          </button>
          <Link to="/new-assessment" className="btn btn-emerald btn-sm">
            <PlusCircle size={15} /> New Assessment
          </Link>
        </div>
      </div>

      {/* STATE 1: UNSUITABLE IMAGE */}
      {isInvalidImage && (
        <div className="card" style={{ borderLeft: '6px solid var(--danger)', padding: '36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ padding: '12px', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: '12px' }}>
              <AlertTriangle size={32} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem', color: 'var(--danger)' }}>
                IMAGE NOT SUITABLE FOR CROP ANALYSIS
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                The uploaded photograph does not contain visible foliage or plant parts.
              </p>
            </div>
          </div>

          <div style={{ background: 'var(--bg-light)', padding: '20px', borderRadius: 'var(--radius-md)', margin: '20px 0', border: '1px solid var(--border-color)' }}>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
              {assessment.message || 'Please upload a photograph showing clear green crop leaves, stems, or fruit.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '14px', marginTop: '24px' }}>
            <Link to="/new-assessment" className="btn btn-primary">
              <Camera size={16} /> Upload New Crop Image
            </Link>
            <Link to="/dashboard" className="btn btn-secondary">
              Back to Dashboard
            </Link>
          </div>
        </div>
      )}

      {/* STATE 2: MODEL UNAVAILABLE */}
      {isModelUnavailable && (
        <div className="card" style={{ borderLeft: '6px solid var(--warning)', padding: '36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ padding: '12px', background: 'var(--warning-bg)', color: '#855700', borderRadius: '12px' }}>
              <HelpCircle size={32} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>
                AI MODEL NOT AVAILABLE
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                The agricultural AI model has not been configured yet.
              </p>
            </div>
          </div>
          <p style={{ color: 'var(--text-main)', margin: '16px 0', fontSize: '0.95rem' }}>
            Please configure or download the model weights before performing crop disease analysis.
          </p>
          <code style={{ display: 'block', background: '#212529', color: '#79dfc1', padding: '14px', borderRadius: '8px', fontSize: '0.85rem' }}>
            python -m backend.ai.download_model
          </code>
        </div>
      )}

      {/* STATE 3: LOW CONFIDENCE */}
      {isLowConfidence && (
        <div className="card" style={{ borderLeft: '6px solid var(--warning)', padding: '36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ padding: '12px', background: 'var(--warning-bg)', color: 'var(--warning)', borderRadius: '12px' }}>
              <HelpCircle size={32} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>
                LOW CONFIDENCE ASSESSMENT
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                The AI could not identify the crop condition reliably ({Math.round((assessment.confidence || 0) * 100)}% confidence).
              </p>
            </div>
          </div>

          <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', margin: '16px 0 20px' }}>
            To prevent incorrect treatment guidance, our decision engine does not generate speculative diagnoses for low-confidence images.
          </p>

          <div className="card" style={{ background: '#fffcf2', borderColor: '#ffeeba', padding: '20px' }}>
            <h4 style={{ fontSize: '1rem', color: '#855700', marginBottom: '10px' }}>
              Photography recommendations for higher confidence:
            </h4>
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', color: 'var(--text-main)' }}>
              <li><strong>Closer distance:</strong> Hold your camera 15–25 cm from the affected leaf spot.</li>
              <li><strong>Diffuse lighting:</strong> Avoid heavy glare, flash reflections, or deep shadows.</li>
              <li><strong>Sharp focus:</strong> Tap the phone screen to lock focus on leaf lesion borders.</li>
              <li><strong>Unobstructed view:</strong> Ensure fingers, background soil, or foreign weeds do not obscure the crop leaf.</li>
            </ul>
          </div>

          <div style={{ marginTop: '24px', display: 'flex', gap: '14px' }}>
            <Link to="/new-assessment" className="btn btn-primary">
              <Camera size={16} /> Analyze Another Image
            </Link>
          </div>
        </div>
      )}

      {/* STATE 4: HEALTHY CROP */}
      {isHealthy && (
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, #12372A 0%, #198754 100%)',
            color: '#ffffff',
            padding: '36px',
            boxShadow: 'var(--shadow-lg)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={30} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.9 }}>
                Assessment Complete
              </div>
              <h1 style={{ fontSize: '2rem', color: '#ffffff', lineHeight: 1.15 }}>
                HEALTHY CROP DETECTED
              </h1>
            </div>
          </div>
          <p style={{ opacity: 0.95, fontSize: '1.05rem', maxWidth: '640px', marginTop: '8px' }}>
            ✓ No significant disease pattern was detected for the supported classification categories. Leaf morphology and pigmentation indicate healthy vegetative tissue.
          </p>
        </div>
      )}

      {/* STATE 5: DISEASE DETECTED */}
      {!isHealthy && !isLowConfidence && !isInvalidImage && !isModelUnavailable && (
        <div
          className="card"
          style={{
            borderLeft: '6px solid var(--danger)',
            padding: '32px',
            boxShadow: 'var(--shadow-md)',
            background: '#ffffff'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span className="badge badge-danger">● Disease Detected</span>
                {rec?.severity && <SeverityBadge severity={rec.severity} />}
              </div>
              <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', color: 'var(--primary)', lineHeight: 1.15 }}>
                {assessment.crop?.name} {assessment.predicted_condition}
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '6px' }}>
                Identified by deep neural network visual feature analysis
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>
                {Math.round((assessment.confidence || 0) * 100)}%
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--emerald)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {assessment.confidence_level} Confidence
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Two Column Diagnostic Summary (if valid classification) */}
      {!isInvalidImage && !isModelUnavailable && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
          {/* Uploaded Photograph */}
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', color: 'var(--primary)', marginBottom: '16px' }}>
              Uploaded Crop Photograph
            </h3>
            <div
              style={{
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                background: '#000000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                maxHeight: '340px'
              }}
            >
              <img
                src={assessment.image_path}
                alt="Analyzed Crop Leaf"
                style={{
                  maxWidth: '100%',
                  maxHeight: '340px',
                  objectFit: 'contain'
                }}
              />
            </div>
            <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <span>Source: <strong style={{ textTransform: 'capitalize' }}>{assessment.image_source}</strong></span>
              <span>{formatDate(assessment.created_at)}</span>
            </div>
          </div>

          {/* AI Diagnostic Summary Card */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <Sparkles size={20} color="var(--emerald)" />
                <h3 style={{ fontSize: '1.15rem', color: 'var(--primary)' }}>AI Vision Summary</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Crop Variety</span>
                  <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{assessment.crop?.name}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Diagnostic Condition</span>
                  <span style={{ fontWeight: 700, color: isHealthy ? 'var(--emerald)' : 'var(--danger)' }}>
                    {assessment.predicted_condition}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Severity Level</span>
                  <span>{rec ? <SeverityBadge severity={rec.severity} /> : <SeverityBadge severity="none" />}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Overall Status</span>
                  <StatusBadge status={assessment.status} />
                </div>
              </div>

              {/* Confidence Meter */}
              <div style={{ marginTop: '20px' }}>
                <ConfidenceIndicator confidence={assessment.confidence || 0} level={assessment.confidence_level} />
              </div>
            </div>

            {/* AI Explanation Box */}
            <div className="ai-explainer-box" style={{ marginTop: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Sparkles size={16} color="var(--ai-accent)" />
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>
                  How the AI Evaluated This Specimen
                </div>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', color: 'var(--text-main)' }}>
                <li>• <strong>Preprocessed:</strong> Input resized & normalized to 224×224 RGB tensor.</li>
                <li>• <strong>Model Architecture:</strong> Quantized MobileNetV2 deep convolutional neural network.</li>
                <li>• <strong>Neural Match:</strong> Softmax activation mapped to <code>{pred?.model_class || assessment.predicted_condition}</code>.</li>
                <li>• <strong>Confidence Evaluation:</strong> Classification score of {Math.round((assessment.confidence || 0) * 100)}% falls in the <strong>{assessment.confidence_level}</strong> confidence tier.</li>
              </ul>
            </div>

            {/* Top 3 Predictions Transparency */}
            {pred?.top_3_predictions && pred.top_3_predictions.length > 1 && (
              <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                  Top Model Class Candidates:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {pred.top_3_predictions.map((c, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                      <span style={{ color: 'var(--text-main)' }}>{i + 1}. {c.crop} - {c.condition}</span>
                      <strong style={{ color: 'var(--primary)' }}>{Math.round(c.confidence * 100)}%</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Comprehensive Recommendations & Agronomic Guidance */}
      {rec && !isLowConfidence && !isInvalidImage && (
        <div style={{ marginTop: '12px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.45rem', color: 'var(--primary)' }}>
              {isHealthy ? 'Maintenance & Protection Guide' : 'Agronomic Action Plan & Disease Management'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Standard operating procedures vetted for {assessment.crop?.name} cultivation
            </p>
          </div>

          <RecommendationCard recommendation={rec} isHealthy={isHealthy} />
        </div>
      )}
    </div>
  );
}
