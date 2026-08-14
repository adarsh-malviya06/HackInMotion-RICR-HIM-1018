import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, ArrowRight } from 'lucide-react';

export const LoginPage = ({ onNavigateToRegister, onLoginSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('demo1@finly.test');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setError(err.message || 'Failed to sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '420px', margin: '40px auto', padding: '32px', background: '#ffffff', borderRadius: '24px', border: '1px solid #dce0ee', boxShadow: '0 12px 32px rgba(25, 23, 40, 0.08)' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <img 
          src="/finova_logo.png" 
          alt="Finova Logo" 
          style={{ height: '54px', width: 'auto', marginBottom: '8px', mixBlendMode: 'multiply' }} 
        />
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-dark)', margin: 0 }}>Welcome to Finova</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '4px' }}>Sign in to access your Financial AI Copilot & Dashboard</p>
      </div>

      {error && (
        <div style={{ padding: '10px 14px', background: '#fef2f2', color: '#dc2626', borderRadius: '8px', fontSize: '0.825rem', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-dark)', display: 'block', marginBottom: '6px' }}>Email Address</label>
          <input
            type="email"
            className="form-input"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ width: '100%', height: '42px', borderRadius: '10px', padding: '0 14px', border: '1px solid #dce0ee' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-dark)', display: 'block', marginBottom: '6px' }}>Password</label>
          <input
            type="password"
            className="form-input"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ width: '100%', height: '42px', borderRadius: '10px', padding: '0 14px', border: '1px solid #dce0ee' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            height: '44px',
            borderRadius: 'var(--radius-pill)',
            background: 'var(--bg-card-dark)',
            color: '#ffffff',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            marginTop: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          {loading ? 'Signing In...' : <>Sign In <ArrowRight size={16} /></>}
        </button>
      </form>

      <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        Don't have an account?{' '}
        <button onClick={onNavigateToRegister} style={{ background: 'none', border: 'none', color: '#7c5cff', fontWeight: 700, cursor: 'pointer' }}>
          Create Account
        </button>
      </div>
    </div>
  );
};
