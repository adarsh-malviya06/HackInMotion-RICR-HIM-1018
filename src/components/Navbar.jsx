import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { Plus, Database, Settings, User, LogOut, Globe, Sparkles } from 'lucide-react';

export const Navbar = ({ onOpenSettings, onOpenAuth }) => {
  const { supabaseConfig, session, supabase, currency, setCurrency, activeTab, setActiveTab } = useFinance();

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
  };

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'ingestion', label: 'Ingestion' },
    { id: 'data-intelligence', label: 'Data Cleaning' },
    { id: 'financial-intelligence', label: 'Intelligence' },
    { id: 'subscriptions', label: 'Recurring' },
    { id: 'planning', label: 'Planning' },
    { id: 'simulator', label: 'Simulator' },
    { id: 'copilot', label: 'AI Copilot', highlight: true }
  ];

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 0 28px 0',
      borderBottom: '1px solid #dce0ee',
      marginBottom: '28px'
    }}>
      {/* Brand Logo matching BloomFi "+ FINLY" */}
      <div 
        onClick={() => setActiveTab('dashboard')} 
        style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
      >
        <div style={{
          width: '28px',
          height: '28px',
          borderRadius: '8px',
          background: 'var(--bg-card-dark)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff'
        }}>
          <Plus size={18} strokeWidth={2.5} />
        </div>
        <span className="display-title" style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
          FINLY
        </span>
      </div>

      {/* Nav Links Navigation matching BloomFi center links */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#e2e6f2', padding: '4px', borderRadius: 'var(--radius-pill)' }}>
        {navLinks.map(link => {
          const isActive = activeTab === link.id;
          return (
            <button
              key={link.id}
              onClick={() => setActiveTab(link.id)}
              style={{
                background: isActive ? 'var(--bg-card-dark)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--text-muted)',
                border: 'none',
                padding: '6px 14px',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.825rem',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {link.highlight && <Sparkles size={11} color={isActive ? '#c084fc' : 'var(--accent-purple)'} />}
              {link.label}
            </button>
          );
        })}
      </nav>

      {/* Right Action Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Currency Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', background: '#ffffff', padding: '3px 6px', borderRadius: 'var(--radius-pill)', border: '1px solid #dce0ee' }}>
          {['$', '€', '£', '₹'].map(s => (
            <button
              key={s}
              onClick={() => setCurrency(s)}
              style={{
                background: currency === s ? 'var(--bg-card-dark)' : 'transparent',
                color: currency === s ? '#ffffff' : 'var(--text-muted)',
                border: 'none',
                borderRadius: 'var(--radius-pill)',
                padding: '2px 7px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Supabase Status Pill */}
        <button
          onClick={onOpenSettings}
          className="btn-pill-light"
          style={{ fontSize: '0.78rem', padding: '8px 14px' }}
        >
          <Database size={13} color="var(--accent-purple)" />
          {supabaseConfig.isConfigured ? 'Supabase Connected' : 'Connect Supabase'}
        </button>

        {/* Auth / Launch BETA Dark Pill Button */}
        {session ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dark)' }}>
              {session.user.email}
            </span>
            <button onClick={handleSignOut} className="btn-pill-dark" style={{ padding: '8px 12px' }} title="Sign Out">
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <button onClick={onOpenAuth} className="btn-pill-dark">
            Launch FINLY <Plus size={14} />
          </button>
        )}
      </div>
    </header>
  );
};
