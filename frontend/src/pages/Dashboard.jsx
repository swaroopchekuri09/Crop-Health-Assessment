import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  PlusCircle,
  ArrowRight,
  Eye,
  Calendar,
  Sparkles,
  BookOpen,
  Sprout
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import StatCard from '../components/StatCard';
import { StatusBadge, ConfidenceBadge } from '../components/Badge';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total_assessments: 0,
    healthy_count: 0,
    disease_detected_count: 0,
    low_confidence_count: 0,
    ai_supported_crops_count: 14,
    total_crops_count: 68,
    recent_assessments: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await api.getStats();
        setStats(data);
      } catch (err) {
        console.warn('Failed to load dashboard statistics:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Top Welcome Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px'
        }}
      >
        <div>
          <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', color: 'var(--primary)' }}>
            {getGreeting()} 👋
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '6px' }}>
            Monitor your crop health and review recent assessments
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link to="/crops" className="btn btn-secondary btn-lg" style={{ display: 'inline-flex', gap: '8px' }}>
            <BookOpen size={18} /> Crop Library
          </Link>
          <Link to="/new-assessment" className="btn btn-emerald btn-lg">
            <PlusCircle size={20} /> New Assessment
          </Link>
        </div>
      </div>

      {/* Statistics Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: '20px'
        }}
      >
        <StatCard
          title="Total Assessments"
          value={stats.total_assessments}
          icon={FileText}
          color="primary"
          subtitle="Saved diagnostic records"
        />
        <StatCard
          title="Healthy"
          value={stats.healthy_count}
          icon={CheckCircle}
          color="emerald"
          subtitle="Optimal foliage vigor"
        />
        <StatCard
          title="Needs Attention"
          value={stats.disease_detected_count}
          icon={AlertTriangle}
          color="danger"
          subtitle="Active disease or pest stress"
        />
        <StatCard
          title="AI Supported Crops"
          value={`${stats.ai_supported_crops_count || 14} / ${stats.total_crops_count || 68}`}
          icon={Sprout}
          color="secondary"
          subtitle="Active vision diagnostics"
        />
      </div>

      {/* Quick Action Prompt to Library */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)',
          borderColor: '#bbf7d0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          padding: '20px 24px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--emerald-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
              fontSize: '1.4rem'
            }}
          >
            🌾
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--primary)' }}>
              Explore 68 Crops in the Agricultural Library
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Check soil parameters, climate conditions, target pathologies, and AI availability for any crop.
            </div>
          </div>
        </div>

        <Link to="/crops" className="btn btn-secondary btn-sm" style={{ fontWeight: 700 }}>
          Browse Catalog <ArrowRight size={15} />
        </Link>
      </div>

      {/* Recent Assessments Section */}
      <div className="card">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px'
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>Recent Assessments</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Latest diagnostic analyses recorded on your account
            </p>
          </div>

          <Link
            to="/history"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.88rem',
              fontWeight: 600,
              color: 'var(--secondary)'
            }}
          >
            View All <ArrowRight size={16} />
          </Link>
        </div>

        {stats.recent_assessments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'var(--bg-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                color: 'var(--text-muted)'
              }}
            >
              <FileText size={28} />
            </div>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--primary)', marginBottom: '8px' }}>
              No Assessments Yet
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto 20px' }}>
              Upload your first crop leaf photograph to receive an instant AI health diagnosis and agronomic guidance.
            </p>
            <Link to="/new-assessment" className="btn btn-primary btn-sm">
              <PlusCircle size={16} /> Start First Assessment
            </Link>
          </div>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Crop</th>
                  <th>Predicted Condition</th>
                  <th>Confidence</th>
                  <th>Status</th>
                  <th>Source</th>
                  <th>Date</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_assessments.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{item.crop_name}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 500 }}>{item.condition}</span>
                    </td>
                    <td>
                      {item.confidence !== null ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>
                            {Math.round(item.confidence * 100)}%
                          </span>
                          <ConfidenceBadge level={item.confidence_level} />
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>—</span>
                      )}
                    </td>
                    <td>
                      <StatusBadge status={item.status} />
                    </td>
                    <td>
                      <span
                        style={{
                          textTransform: 'capitalize',
                          fontSize: '0.85rem',
                          color: 'var(--text-muted)'
                        }}
                      >
                        {item.image_source || 'manual'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {formatDate(item.created_at)}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link
                        to={`/assessment/${item.id}`}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '6px 12px' }}
                      >
                        <Eye size={14} /> View Report
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
