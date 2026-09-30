import React, { useState, useEffect } from 'react';
import { CheckCircle2, Loader2, Circle } from 'lucide-react';

const STEPS = [
  'Preparing image & validating leaf dimensions (224x224 RGB)',
  'Running MobileNetV2 ONNX neural network inference',
  'Evaluating classification confidence & thresholds',
  'Preparing agronomic insights, management steps & precautions'
];

export default function ProcessingScreen() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 700);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="processing-container">
      <div className="radar-spinner" />
      <h2 style={{ fontSize: '1.6rem', color: 'var(--primary)', marginBottom: '8px' }}>
        ANALYZING YOUR CROP
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
        Please wait while our agricultural vision model analyzes cellular and foliar pathology.
      </p>

      <div className="process-steps-list">
        {STEPS.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;

          return (
            <div
              key={idx}
              className={`process-step-item ${isCurrent ? 'active' : ''}`}
              style={{
                borderColor: isDone ? '#c3e6cb' : isCurrent ? 'var(--emerald)' : 'var(--border-color)',
                background: isDone ? '#fbfdfb' : isCurrent ? '#f4faf6' : '#ffffff'
              }}
            >
              {isDone ? (
                <CheckCircle2 size={20} color="var(--emerald)" />
              ) : isCurrent ? (
                <Loader2 size={20} color="var(--emerald)" className="spin-animation" style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <Circle size={20} color="var(--text-subtle)" />
              )}
              <span style={{ color: isDone ? 'var(--secondary)' : isCurrent ? 'var(--primary)' : 'var(--text-muted)' }}>
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
