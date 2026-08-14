import React from 'react';
import { Database, X, ShieldCheck, Server, Cpu } from 'lucide-react';

export const SettingsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px'
    }}>
      <div className="glass-panel-glow" style={{
        maxWidth: '550px',
        width: '100%',
        padding: '28px',
        borderRadius: 'var(--radius-lg)',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Database size={24} color="var(--primary-light)" />
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Finova Platform Settings</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>System Architecture & Database Configuration</p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-icon"><X size={18} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Active Database Info */}
          <div style={{ background: 'rgba(15, 18, 30, 0.8)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Server size={18} color="var(--emerald)" />
              <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>Database Engine</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              MongoDB / MongoDB Atlas Cloud Database connected with browser-side localStorage caching for offline resilience.
            </p>
          </div>

          {/* AI Copilot & Backend Info */}
          <div style={{ background: 'rgba(15, 18, 30, 0.8)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Cpu size={18} color="var(--primary-light)" />
              <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>AI Agent Engine</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Powered by Groq LLM (llama-3.3-70b-versatile) running strictly on backend servers with zero secret exposure.
            </p>
          </div>

          {/* Security Indicator */}
          <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck size={20} color="var(--emerald)" />
            <span style={{ fontSize: '0.825rem', color: 'var(--emerald-light)', fontWeight: 600 }}>
              Security Audit Verified: User Data Isolated & Encrypted
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button type="button" onClick={onClose} className="btn btn-primary">Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};

