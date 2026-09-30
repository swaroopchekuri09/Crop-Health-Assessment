import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  History,
  User,
  LogOut,
  HelpCircle,
  Sprout,
  X,
  BookOpen,
  Settings
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen, onClose, onOpenHelp }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/new-assessment', label: 'New Assessment', icon: PlusCircle },
    { to: '/crops', label: 'Crop Library', icon: BookOpen },
    { to: '/history', label: 'Assessment History', icon: History },
    { to: '/profile', label: 'Profile', icon: User },
    { to: '/settings', label: 'Settings', icon: Settings }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(18, 55, 42, 0.4)',
            backdropFilter: 'blur(4px)',
            zIndex: 45
          }}
        />
      )}

      <aside className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
        <div className="brand-logo" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="brand-icon">
              <Sprout size={24} />
            </div>
            <div>
              <div className="brand-name">AgriHealth AI</div>
              <div className="brand-subtitle">Crop Diagnostics</div>
            </div>
          </div>
          {/* Mobile close button */}
          <button
            onClick={onClose}
            style={{ display: 'block', padding: '6px', color: 'var(--text-muted)' }}
            className="mobile-close-btn"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button
            type="button"
            onClick={() => {
              onClose?.();
              onOpenHelp?.();
            }}
            className="nav-item"
            style={{ width: '100%', textAlign: 'left', border: 'none' }}
          >
            <HelpCircle size={20} />
            <span>Image Capture Guide</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="nav-item"
            style={{ width: '100%', textAlign: 'left', border: 'none', color: 'var(--danger)' }}
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
