import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Plus, Cpu, Bell, Search, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function Navbar({ onToggleSidebar }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [aiStatus, setAiStatus] = useState({ loaded: false, classes: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    async function checkModel() {
      try {
        const res = await api.getAiHealth();
        if (res.model_loaded) {
          setAiStatus({ loaded: true, classes: res.supported_classes || 38 });
        }
      } catch (err) {
        console.warn('AI status check failed');
      }
    }
    checkModel();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/crops`);
    }
  };

  return (
    <header className="top-navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <button
          type="button"
          onClick={onToggleSidebar}
          style={{ padding: '8px', color: 'var(--primary)', display: 'flex', alignItems: 'center' }}
          className="mobile-menu-btn"
          aria-label="Toggle Navigation"
        >
          <Menu size={24} />
        </button>

        {/* Global Quick Search */}
        <form onSubmit={handleSearchSubmit} className="topbar-search-box">
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search 68 crops..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="topbar-search-input"
          />
        </form>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* AI Model Indicator Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            background: aiStatus.loaded ? 'var(--emerald-subtle)' : 'var(--warning-bg)',
            border: `1.5px solid ${aiStatus.loaded ? '#bbf7d0' : '#ffeeba'}`,
            borderRadius: 'var(--radius-pill)',
            fontSize: '0.8rem',
            fontWeight: 700,
            color: aiStatus.loaded ? '#14532D' : '#855700'
          }}
          title={aiStatus.loaded ? `MobileNetV2 ONNX active (${aiStatus.classes} conditions)` : 'Model offline'}
        >
          <Cpu size={15} color={aiStatus.loaded ? 'var(--secondary)' : '#d99a00'} />
          <span>{aiStatus.loaded ? `MobileNetV2 ONNX • ${aiStatus.classes} Conditions Active` : 'AI Model Offline'}</span>
        </div>

        {/* Notification Bell */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setShowNotification(!showNotification)}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: '#ffffff',
              border: '1.5px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
              position: 'relative'
            }}
            title="Notifications"
          >
            <Bell size={18} />
            <span
              style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'var(--secondary)'
              }}
            />
          </button>

          {showNotification && (
            <div
              className="card"
              style={{
                position: 'absolute',
                right: 0,
                top: '48px',
                width: '300px',
                padding: '16px',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 60
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary)', marginBottom: '8px' }}>
                System Notifications
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
                🌿 <strong>68 Crops Active</strong>: Complete agronomic database loaded with 14 instant AI vision diagnostics.
              </p>
            </div>
          )}
        </div>

        {/* Quick CTA */}
        <Link to="/new-assessment" className="btn btn-emerald btn-sm">
          <Plus size={16} /> New Assessment
        </Link>

        {/* User Pill */}
        {user && (
          <Link
            to="/profile"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '6px 12px',
              background: '#ffffff',
              border: '1.5px solid var(--border-color)',
              borderRadius: 'var(--radius-pill)',
              transition: 'border-color 0.15s ease'
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'var(--primary)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.85rem'
              }}
            >
              {user.name ? user.name[0].toUpperCase() : 'F'}
            </div>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--primary)' }}>
              {user.name}
            </span>
          </Link>
        )}
      </div>
    </header>
  );
}
