import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sprout, LogIn, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setEmail('farmer@agrihealth.org');
    setPassword('FarmerPass2025!');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: 'radial-gradient(ellipse at 50% 20%, #eaf4ee 0%, #f6faf7 80%)'
      }}
    >
      <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '40px 32px', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            className="brand-icon"
            style={{ margin: '0 auto 16px', width: '50px', height: '50px' }}
          >
            <Sprout size={28} />
          </div>
          <h2 style={{ fontSize: '1.6rem', color: 'var(--primary)' }}>Farmer Sign In</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '6px' }}>
            Access your crop assessments and guidance
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--danger-bg)',
              color: 'var(--danger)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '0.88rem',
              marginBottom: '20px',
              border: '1px solid #f5c2c7'
            }}
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              className="form-input"
              required
              placeholder="e.g. farmer@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-input"
              required
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '8px' }}
            disabled={loading}
          >
            {loading ? 'Signing In...' : <><LogIn size={18} /> Sign In</>}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button
            type="button"
            onClick={handleDemoLogin}
            style={{
              fontSize: '0.82rem',
              color: 'var(--emerald)',
              fontWeight: 600,
              textDecoration: 'underline'
            }}
          >
            Fill Demo Credentials
          </button>
        </div>

        <div
          style={{
            marginTop: '28px',
            paddingTop: '20px',
            borderTop: '1px solid var(--border-color)',
            textAlign: 'center',
            fontSize: '0.9rem',
            color: 'var(--text-muted)'
          }}
        >
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--emerald)', fontWeight: 600 }}>
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
