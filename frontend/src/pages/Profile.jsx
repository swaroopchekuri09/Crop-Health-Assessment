import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Shield, Calendar, FileText, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'Active Member';
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="card" style={{ padding: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px' }}>
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--emerald) 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.8rem',
              fontWeight: 800,
              boxShadow: 'var(--shadow-md)'
            }}
          >
            {user?.name ? user.name[0].toUpperCase() : 'F'}
          </div>
          <div>
            <h1 style={{ fontSize: '1.6rem', color: 'var(--primary)' }}>{user?.name || 'Farmer Account'}</h1>
            <span className="badge badge-success" style={{ marginTop: '6px' }}>
              Verified {user?.role || 'Farmer'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ padding: '8px', background: 'var(--bg-light)', borderRadius: '8px', color: 'var(--text-muted)' }}>
              <Mail size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Email Address</div>
              <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.95rem' }}>{user?.email}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ padding: '8px', background: 'var(--bg-light)', borderRadius: '8px', color: 'var(--text-muted)' }}>
              <Shield size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Account Role</div>
              <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.95rem', textTransform: 'capitalize' }}>{user?.role || 'Farmer'}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ padding: '8px', background: 'var(--bg-light)', borderRadius: '8px', color: 'var(--text-muted)' }}>
              <Calendar size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Member Since</div>
              <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.95rem' }}>{formatDate(user?.created_at)}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ padding: '8px', background: 'var(--bg-light)', borderRadius: '8px', color: 'var(--text-muted)' }}>
              <FileText size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Assessments Performed</div>
              <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1.1rem' }}>{user?.total_assessments || 0}</div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '32px', paddingTop: '20px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={handleLogout}
            className="btn btn-secondary"
            style={{ color: 'var(--danger)', borderColor: '#f5c2c7' }}
          >
            <LogOut size={16} /> Sign Out of Account
          </button>
        </div>
      </div>
    </div>
  );
}
