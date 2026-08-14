import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { LogOut, ArrowRight, User as UserIcon } from 'lucide-react';

export const Navbar = ({ onNavigateToLogin, onNavigateToRegister }) => {
  const { activeTab, setActiveTab } = useFinance();
  const { user, isAuthenticated, logout } = useAuth();
  const [cleanLogoUrl, setCleanLogoUrl] = React.useState(null);

  React.useEffect(() => {
    let isMounted = true;
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = '/finova_logo.png';
    img.onload = () => {
      if (!isMounted) return;
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const maxC = Math.max(r, g, b);
          const minC = Math.min(r, g, b);
          const diff = maxC - minC;
          const brightness = (r + g + b) / 3;
          
          // Convert off-white paper background and construction grid lines to transparent alpha
          if (brightness > 200 && diff < 22) {
            data[i + 3] = 0; // 100% transparent
          } else if (brightness > 175 && diff < 16) {
            // Anti-aliased soft edge transition
            data[i + 3] = Math.floor(255 * (200 - brightness) / 25);
          }
        }
        
        ctx.putImageData(imgData, 0, 0);
        setCleanLogoUrl(canvas.toDataURL('image/png'));
      } catch (err) {
        console.warn('Logo transparent conversion fallback:', err);
      }
    };
    return () => { isMounted = false; };
  }, []);

  const handleSignOut = async () => {
    await logout();
    if (onNavigateToLogin) {
      onNavigateToLogin();
    }
  };

  const appNavLinks = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'ingestion', label: 'Ingestion' },
    { id: 'data-intelligence', label: 'Data Cleaning' },
    { id: 'financial-intelligence', label: 'Intelligence' },
    { id: 'subscriptions', label: 'Recurring' },
    { id: 'planning', label: 'Planning' },
    { id: 'simulator', label: 'Simulator' }
  ];

  const landingNavLinks = [
    { id: 'features', label: 'Features' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'intelligence', label: 'Intelligence' }
  ];

  const currentNavLinks = isAuthenticated ? appNavLinks : landingNavLinks;

  const handleNavClick = (linkId) => {
    if (isAuthenticated) {
      setActiveTab(linkId);
    } else {
      const el = document.getElementById(linkId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
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
      {/* Brand Text Only Branding (No Logo Image) */}
      <div 
        onClick={() => {
          if (isAuthenticated) {
            setActiveTab('dashboard');
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }} 
        style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.0, cursor: 'pointer', flexShrink: 0 }}
      >
        <span className="display-title" style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.025em', color: '#0f172a' }}>
          Finova
        </span>
        <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#475569', letterSpacing: '0.02em', marginTop: '2px', lineHeight: 1.2 }}>
          Intelligent Fintech
        </span>
      </div>

      {/* Center Navigation */}
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
        {currentNavLinks.map(link => {
          const isActive = isAuthenticated && activeTab === link.id;
          return (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              style={{
                background: isActive ? 'var(--bg-card-dark)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--text-dark)',
                border: 'none',
                padding: '6px 16px',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.85rem',
                fontWeight: isActive ? 700 : 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                flexShrink: 0
              }}
            >
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
