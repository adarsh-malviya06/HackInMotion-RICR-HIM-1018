import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { Plus, LogOut, Sparkles, ArrowRight, User as UserIcon } from 'lucide-react';

export const Navbar = ({ onNavigateToLogin, onNavigateToRegister }) => {
  const { activeTab, setActiveTab } = useFinance();
  const { user, isAuthenticated, logout } = useAuth();

  const handleSignOut = async () => {
    await logout();
    if (onNavigateToLogin) {
      onNavigateToLogin();
    }
  };

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'ingestion', label: 'Ingestion' },
    { id: 'data-intelligence', label: 'Data Cleaning' },
    { id: 'financial-intelligence', label: 'Intelligence' },
    { id: 'subscriptions', label: 'Recurring' },
    { id: 'planning', label: 'Planning' },
    { id: 'simulator', label: 'Simulator' }
  ];

  const handleNavClick = (linkId) => {
    if (isAuthenticated) {
      setActiveTab(linkId);
    } else {
      if (linkId === 'financial-intelligence') {
        const el = document.querySelector('#intelligence');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          return;
        }
      }
      if (onNavigateToLogin) {
        onNavigateToLogin();
      }
    }
  };

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 0 28px 0',
      borderBottom: '1px solid #dce0ee',
      marginBottom: '28px',
      gap: '16px'
    }}>
      {/* Brand Logo matching BloomFi "+ FINLY" */}
      <div 
        onClick={() => {
          if (isAuthenticated) {
            setActiveTab('dashboard');
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }} 
        style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flexShrink: 0 }}
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

      {/* Center Navigation: Original Workspace Product Modules */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        background: '#e2e6f2',
        padding: '4px',
        borderRadius: 'var(--radius-pill)',
        maxWidth: 'calc(100vw - 340px)',
        overflowX: 'auto',
        whiteSpace: 'nowrap'
      }}>
        {navLinks.map(link => {
          const isActive = isAuthenticated && activeTab === link.id;
          return (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
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
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                flexShrink: 0
              }}
            >
              {link.highlight && <Sparkles size={11} color={isActive ? '#c084fc' : 'var(--accent-purple)'} />}
              {link.label}
            </button>
          );
        })}
      </nav>

      {/* Right Action Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        {isAuthenticated && user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#ffffff',
              padding: '6px 14px',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid #dce0ee'
            }}>
              <UserIcon size={14} color="var(--accent-purple)" />
              <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-dark)' }}>
                {user.name || user.email}
              </span>
            </div>
            <button
              onClick={handleSignOut}
              className="btn-pill-dark"
              style={{ padding: '8px 14px', fontSize: '0.8rem' }}
              title="Sign Out"
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={onNavigateToLogin}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-dark)',
                fontSize: '0.85rem',
                fontWeight: 600,
                padding: '6px 12px',
                cursor: 'pointer',
                transition: 'opacity 0.15s ease'
              }}
            >
              Sign In
            </button>

            <button
              onClick={onNavigateToRegister}
              style={{
                background: 'var(--bg-card-dark)',
                color: '#ffffff',
                border: 'none',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.85rem',
                fontWeight: 600,
                padding: '8px 18px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(25, 23, 40, 0.12)',
                transition: 'transform 0.15s ease, opacity 0.15s ease'
              }}
            >
              Get Started <ArrowRight size={14} />
            </button>
          </>
        )}
      </div>
    </header>
  );
};
