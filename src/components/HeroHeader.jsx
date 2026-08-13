import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { Plus, ArrowRight } from 'lucide-react';

export const HeroHeader = () => {
  const { setActiveTab } = useFinance();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', marginBottom: '40px' }}>
      {/* Hero Card Container matching exact BloomFi visual */}
      <div className="card-hero-lavender">
        <div style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          background: 'rgba(25, 23, 40, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px auto',
          color: 'var(--text-dark)'
        }}>
          <Plus size={16} strokeWidth={2.5} />
        </div>

        <h1 className="display-title" style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '16px', lineHeight: 1.1 }}>
          Where Money Grows
        </h1>

        <p style={{
          maxWidth: '540px',
          margin: '0 auto 24px auto',
          color: 'var(--text-muted)',
          fontSize: '0.95rem',
          lineHeight: 1.6
        }}>
          A programmable, AI-driven personal finance platform designed for native wealth accrual and seamless Supabase integration into your daily life.
        </p>

        <button onClick={() => setActiveTab('ingestion')} className="btn-pill-dark" style={{ marginBottom: '32px' }}>
          Try now <ArrowRight size={14} />
        </button>

        {/* Embedded 3D Artwork */}
        <div style={{
          position: 'relative',
          maxHeight: '260px',
          overflow: 'hidden',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.06)'
        }}>
          <img
            src="/hero_artwork.png"
            alt="3D Silver Coins and Purple Flora"
            style={{
              width: '100%',
              height: '260px',
              objectFit: 'cover',
              display: 'block'
            }}
          />
        </div>
      </div>

      {/* "What is FINLY?" Sub-Header Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'flex-start' }}>
        <div>
          <h2 className="display-title" style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '14px' }}>
            What is FINLY?
          </h2>
          <button onClick={() => setActiveTab('financial-intelligence')} className="btn-pill-dark">
            Explore now
          </button>
        </div>

        <div>
          <p style={{ fontSize: '1.05rem', color: '#424458', lineHeight: 1.6, fontWeight: 500 }}>
            FINLY is an automated financial intelligence engine that helps your capital grow while staying synced to your real bank CSV statements & Supabase PostgreSQL database.
          </p>
        </div>
      </div>

      {/* Feature Cards Grid (matching exact 3-column layout) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '20px' }}>
        {/* Card 1: Light Lavender with 3D Visual */}
        <div className="card-light-lavender" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '220px' }}>
          <div>
            <h3 className="display-title" style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '12px' }}>
              Capital that grows
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Earn passive insight as your transactions are automatically clean-categorized into high-performing budget goals.
            </p>
          </div>
        </div>

        {/* Card 2: Deep Dark Violet */}
        <div className="card-dark-violet" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '220px' }}>
          <div>
            <h3 className="display-title" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginBottom: '12px' }}>
              Always liquid, always stable
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim-light)', lineHeight: 1.5 }}>
              Stay fully cash-flow positive with instant access to your funds — no lockups or delays.
            </p>
          </div>
        </div>

        {/* Card 3: Deep Dark Violet */}
        <div className="card-dark-violet" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '220px' }}>
          <div>
            <h3 className="display-title" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginBottom: '12px' }}>
              100% hands-free
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim-light)', lineHeight: 1.5 }}>
              No need to manage strategies manually. FINLY AI works in the background for you.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
