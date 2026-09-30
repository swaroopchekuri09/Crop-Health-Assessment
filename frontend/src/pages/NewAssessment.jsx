import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Smartphone,
  Camera,
  Search,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sprout,
  Info,
  BookOpen
} from 'lucide-react';
import { api } from '../services/api';
import UploadZone from '../components/UploadZone';
import ProcessingScreen from '../components/ProcessingScreen';

const CATEGORIES = [
  { id: 'all', label: 'All Crops' },
  { id: 'Vegetable', label: 'Vegetables' },
  { id: 'Fruit', label: 'Fruits' },
  { id: 'Cereal', label: 'Cereals' },
  { id: 'Pulse', label: 'Pulses' },
  { id: 'Legume', label: 'Legumes' }
];

export default function NewAssessment() {
  const [step, setStep] = useState(1);
  const [crops, setCrops] = useState([]);
  const [loadingCrops, setLoadingCrops] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Form selections
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [imageSource, setImageSource] = useState('mobile');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [unsupportedNotice, setUnsupportedNotice] = useState(null);

  // Submission state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [apiError, setApiError] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    async function loadCrops() {
      try {
        const data = await api.getCrops();
        setCrops(data);

        // Preselect crop if navigated from CropLibrary or CropDetail
        if (location.state?.preselectedCropId) {
          const match = data.find(c => c.id === location.state.preselectedCropId);
          if (match && match.ai_supported) {
            setSelectedCrop(match);
            setStep(2);
          }
        }
      } catch (err) {
        console.warn('Failed to load crop catalog:', err.message);
      } finally {
        setLoadingCrops(false);
      }
    }
    loadCrops();
  }, [location.state]);

  const handleSelectCrop = (crop) => {
    if (!crop.ai_supported) {
      setUnsupportedNotice(crop);
      return;
    }
    setUnsupportedNotice(null);
    setSelectedCrop(crop);
    setApiError(null);
  };

  const handleFileSelected = (file) => {
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleFileRemoved = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleAnalyze = async () => {
    if (!selectedCrop || !selectedFile) {
      setApiError('Please select an AI-supported crop and upload a leaf image.');
      return;
    }

    setApiError(null);
    setIsAnalyzing(true);

    try {
      const result = await api.createAssessment(selectedCrop.id, selectedFile, imageSource);
      navigate(`/assessment/${result.id}`, { state: { assessment: result } });
    } catch (err) {
      setApiError(err.message || 'Analysis failed. Please check the image and try again.');
      setIsAnalyzing(false);
    }
  };

  const filteredCrops = crops.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.common_names && c.common_names.some(cn => cn.toLowerCase().includes(searchTerm.toLowerCase())));
    const matchesCat = categoryFilter === 'all' || c.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const imageSources = [
    {
      id: 'mobile',
      title: 'Mobile Phone Camera',
      desc: 'Close-up camera photo taken on a smartphone directly in the field',
      icon: Smartphone
    },
    {
      id: 'manual',
      title: 'Digital Camera / Upload',
      desc: 'Standard camera photograph or stored archive image',
      icon: Camera
    },
    {
      id: 'drone',
      title: 'Aerial / Drone Imagery',
      desc: 'High-resolution aerial crop canopy capture',
      icon: Sparkles
    }
  ];

  if (isAnalyzing) {
    return (
      <div className="card" style={{ maxWidth: '700px', margin: '40px auto', padding: '40px' }}>
        <ProcessingScreen />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--secondary)', marginBottom: '6px' }}>
          <Sparkles size={16} /> Diagnostic Workflow
        </div>
        <h1 style={{ fontSize: '2rem', color: 'var(--primary)' }}>New Crop Health Assessment</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
          Select an AI-supported crop variety, upload a leaf photograph, and run instant neural diagnosis.
        </p>
      </div>

      {/* Step Wizard Indicator */}
      <div className="wizard-steps">
        <div className={`wizard-step ${step === 1 ? 'active' : step > 1 ? 'completed' : ''}`}>
          <div className="step-circle">{step > 1 ? '✓' : '1'}</div>
          <span className="step-title">Select Crop</span>
        </div>
        <div className={`wizard-step ${step === 2 ? 'active' : step > 2 ? 'completed' : ''}`}>
          <div className="step-circle">{step > 2 ? '✓' : '2'}</div>
          <span className="step-title">Upload & Source</span>
        </div>
        <div className={`wizard-step ${step === 3 ? 'active' : ''}`}>
          <div className="step-circle">3</div>
          <span className="step-title">Run Diagnosis</span>
        </div>
      </div>

      {apiError && (
        <div
          style={{
            padding: '14px 18px',
            background: 'var(--danger-bg)',
            border: '1px solid #fecaca',
            borderRadius: 'var(--radius-md)',
            color: 'var(--danger-text)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.9rem'
          }}
        >
          <AlertCircle size={18} color="var(--danger)" />
          <span>{apiError}</span>
        </div>
      )}

      {/* STEP 1: Select Crop */}
      {step === 1 && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--primary)', marginBottom: '4px' }}>
              Step 1: Choose Crop Variety
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              14 crops have active deep-learning vision models. Other crops are viewable in the catalog.
            </p>
          </div>

          {unsupportedNotice && (
            <div
              style={{
                padding: '16px 20px',
                background: '#fffbeb',
                border: '1.5px solid #fde68a',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}
            >
              <Info size={20} color="#d97706" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 700, color: '#92400E', fontSize: '0.95rem' }}>
                  AI Vision is coming soon for {unsupportedNotice.name}
                </div>
                <p style={{ color: '#78350F', fontSize: '0.88rem', marginTop: '4px', lineHeight: 1.5 }}>
                  Vision diagnostics are currently active for 14 core crops (e.g. Tomato, Potato, Corn, Apple, Grape, Bell Pepper, Strawberry, etc.). You can browse {unsupportedNotice.name}'s agronomic guidelines in the <Link to={`/crops`} style={{ textDecoration: 'underline', fontWeight: 600 }}>Crop Library</Link>.
                </p>
              </div>
            </div>
          )}

          {/* Search & Category Tabs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ position: 'relative' }}>
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
                placeholder="Filter crops by name (e.g. Tomato, Corn, Bell Pepper)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '42px', width: '100%' }}
              />
            </div>

            <div className="filter-tabs">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`filter-tab ${categoryFilter === cat.id ? 'active' : ''}`}
                  onClick={() => setCategoryFilter(cat.id)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Crop Selection Grid */}
          {loadingCrops ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              Loading crop catalog...
            </div>
          ) : (
            <div className="crop-grid">
              {filteredCrops.map((crop) => {
                const isSelected = selectedCrop?.id === crop.id;
                return (
                  <div
                    key={crop.id}
                    onClick={() => handleSelectCrop(crop)}
                    className={`crop-card ${isSelected ? 'selected' : ''}`}
                    style={{
                      opacity: crop.ai_supported ? 1 : 0.75,
                      borderColor: isSelected
                        ? 'var(--secondary)'
                        : crop.ai_supported
                        ? 'var(--border-color)'
                        : '#e2ece5'
                    }}
                  >
                    <div className="crop-card-icon">{crop.icon || '🌱'}</div>
                    <div className="crop-card-name">{crop.name}</div>
                    <div style={{ marginTop: '8px' }}>
                      {crop.ai_supported ? (
                        <span className="crop-card-ai-badge supported" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                          ✓ AI Ready
                        </span>
                      ) : (
                        <span className="crop-card-ai-badge coming-soon" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                          ○ Coming Soon
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
            <button
              type="button"
              disabled={!selectedCrop || !selectedCrop.ai_supported}
              onClick={() => setStep(2)}
              className="btn btn-emerald btn-lg"
              style={{ opacity: selectedCrop && selectedCrop.ai_supported ? 1 : 0.5 }}
            >
              Continue to Upload <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Upload Image & Source */}
      {step === 2 && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', color: 'var(--primary)', marginBottom: '4px' }}>
                Step 2: Upload Leaf Photo & Image Source
              </h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                Target crop: <strong style={{ color: 'var(--primary)' }}>{selectedCrop?.name}</strong>
              </p>
            </div>

            <button onClick={() => setStep(1)} className="btn btn-secondary btn-sm">
              <ArrowLeft size={15} /> Change Crop
            </button>
          </div>

          {/* Image Source Selection */}
          <div>
            <label className="form-label" style={{ marginBottom: '12px', display: 'block' }}>
              Select Image Capture Method
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
              {imageSources.map((source) => {
                const Icon = source.icon;
                const isChosen = imageSource === source.id;
                return (
                  <div
                    key={source.id}
                    onClick={() => setImageSource(source.id)}
                    style={{
                      border: `2px solid ${isChosen ? 'var(--secondary)' : 'var(--border-color)'}`,
                      borderRadius: 'var(--radius-md)',
                      padding: '16px',
                      cursor: 'pointer',
                      background: isChosen ? '#f0fdf4' : '#ffffff',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <Icon size={20} color={isChosen ? 'var(--secondary)' : 'var(--text-muted)'} />
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary)' }}>
                        {source.title}
                      </div>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                      {source.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upload Zone */}
          <div>
            <label className="form-label" style={{ marginBottom: '12px', display: 'block' }}>
              Upload Leaf Photograph
            </label>
            <UploadZone
              onFileSelected={handleFileSelected}
              onFileRemoved={handleFileRemoved}
              selectedFile={selectedFile}
              previewUrl={previewUrl}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
            <button type="button" onClick={() => setStep(1)} className="btn btn-secondary">
              <ArrowLeft size={16} /> Back
            </button>
            <button
              type="button"
              disabled={!selectedFile}
              onClick={() => setStep(3)}
              className="btn btn-emerald btn-lg"
              style={{ opacity: selectedFile ? 1 : 0.5 }}
            >
              Review Assessment <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Review & Submit */}
      {step === 3 && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--primary)', marginBottom: '4px' }}>
              Step 3: Review & Run AI Diagnostic
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Confirm your crop selection and uploaded specimen before inference.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {/* Image Preview */}
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  border: '1.5px solid var(--border-color)',
                  maxHeight: '320px',
                  background: '#000'
                }}
              >
                <img
                  src={previewUrl}
                  alt="Crop preview"
                  style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                />
              </div>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginTop: '8px' }}>
                Specimen file: {selectedFile?.name} ({(selectedFile?.size / 1024).toFixed(1)} KB)
              </span>
            </div>

            {/* Assessment Parameters */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ padding: '16px', background: 'var(--bg-light)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Target Crop
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--primary)', marginTop: '2px' }}>
                  {selectedCrop?.name}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  {selectedCrop?.scientific_name}
                </div>
              </div>

              <div style={{ padding: '16px', background: 'var(--bg-light)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Capture Source
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--primary)', textTransform: 'capitalize', marginTop: '2px' }}>
                  {imageSource} Camera Photo
                </div>
              </div>

              <div style={{ padding: '16px', background: 'var(--emerald-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid #bbf7d0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--primary)', fontSize: '0.9rem' }}>
                  <Sparkles size={16} color="var(--secondary)" /> Ready for Neural Vision Analysis
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-main)', marginTop: '4px' }}>
                  The neural network will evaluate foliar geometry, discolorations, lesion distributions, and return disease probabilities.
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
            <button type="button" onClick={() => setStep(2)} className="btn btn-secondary">
              <ArrowLeft size={16} /> Back
            </button>
            <button
              type="button"
              onClick={handleAnalyze}
              className="btn btn-emerald btn-lg"
              style={{ display: 'inline-flex', gap: '10px' }}
            >
              <Sparkles size={20} /> Run AI Diagnosis Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
