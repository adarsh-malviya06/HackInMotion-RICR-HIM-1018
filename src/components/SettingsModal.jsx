import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Database, Copy, Check, X, ShieldCheck } from 'lucide-react';

export const SettingsModal = ({ isOpen, onClose }) => {
  const { supabaseConfig, updateSupabaseCredentials, showToast } = useFinance();
  const [url, setUrl] = useState(supabaseConfig.url || '');
  const [key, setKey] = useState(supabaseConfig.key || '');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    updateSupabaseCredentials(url.trim(), key.trim());
    onClose();
  };

  const sqlSchemaSnippet = `-- Copy and run this in your Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  merchant TEXT NOT NULL,
  raw_description TEXT,
  amount NUMERIC(12, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL DEFAULT 'Uncategorized',
  payment_method TEXT DEFAULT 'Card',
  is_recurring BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can select own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlSchemaSnippet);
    setCopied(true);
    showToast('SQL Schema copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

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
        maxWidth: '650px',
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
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Supabase Integration Settings</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Connect FINLY directly to your Supabase project</p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-icon"><X size={18} /></button>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Supabase Project URL</label>
            <input
              type="text"
              className="form-input"
              placeholder="https://your-project.supabase.co"
              value={url}
              onChange={e => setUrl(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Supabase Anon Key</label>
            <input
              type="password"
              className="form-input"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
              value={key}
              onChange={e => setKey(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">Save Credentials</button>
          </div>
        </form>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', margin: '24px 0' }} />

        {/* SQL Schema Reference Card */}
        <div style={{ background: 'rgba(15, 18, 30, 0.8)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={16} color="var(--emerald)" />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>Quick SQL Schema Generator</span>
            </div>
            <button onClick={copySql} className="btn btn-secondary btn-sm" style={{ padding: '4px 10px' }}>
              {copied ? <Check size={14} color="var(--emerald)" /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy SQL'}
            </button>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
            Paste this SQL script in your Supabase SQL Editor to create the required tables and security policies.
          </p>
          <pre style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem',
            background: '#090a10',
            padding: '12px',
            borderRadius: '6px',
            overflowX: 'auto',
            color: '#a78bfa',
            border: '1px solid var(--border-subtle)'
          }}>
            {sqlSchemaSnippet}
          </pre>
        </div>
      </div>
    </div>
  );
};
