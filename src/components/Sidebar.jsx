import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { 
  LayoutDashboard, 
  UploadCloud, 
  Wand2, 
  BrainCircuit, 
  CreditCard, 
  Target, 
  Sliders, 
  Bot,
  Flame
} from 'lucide-react';

export const Sidebar = () => {
  const { activeTab, setActiveTab, duplicates, anomalies, moneyLeaks, recurring } = useFinance();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'ingestion', label: 'Transaction Ingestion', icon: UploadCloud },
    { 
      id: 'data-intelligence', 
      label: 'Data Intelligence', 
      icon: Wand2,
      badge: duplicates.length ? `${duplicates.length} Dups` : null,
      badgeColor: 'amber'
    },
    { 
      id: 'financial-intelligence', 
      label: 'Financial Intelligence', 
      icon: BrainCircuit,
      badge: (anomalies.length + moneyLeaks.length) ? `${anomalies.length + moneyLeaks.length} Alerts` : null,
      badgeColor: 'rose'
    },
    { 
      id: 'subscriptions', 
      label: 'Recurring Expenses', 
      icon: CreditCard,
      badge: recurring.length ? `${recurring.length}` : null,
      badgeColor: 'cyan'
    },
    { id: 'planning', label: 'Financial Planning', icon: Target },
    { id: 'simulator', label: 'What-If Simulator', icon: Sliders }
  ];

  return (
    <aside style={{
      width: '260px',
      minWidth: '260px',
      background: 'rgba(12, 14, 24, 0.95)',
      borderRight: '1px solid var(--border-subtle)',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    }}>
      <div style={{ padding: '0 12px 12px 12px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Core Modules
      </div>

      {navItems.map(item => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              padding: '11px 14px',
              borderRadius: 'var(--radius-sm)',
              border: isActive ? '1px solid var(--border-highlight)' : '1px solid transparent',
              background: isActive 
                ? 'linear-gradient(90deg, rgba(139, 92, 246, 0.2) 0%, rgba(139, 92, 246, 0.05) 100%)' 
                : item.highlight ? 'rgba(167, 139, 250, 0.06)' : 'transparent',
              color: isActive ? '#ffffff' : 'var(--text-secondary)',
              fontSize: '0.875rem',
              fontWeight: isActive ? 700 : 500,
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Icon size={18} color={isActive ? 'var(--primary-light)' : item.highlight ? '#c084fc' : 'var(--text-muted)'} />
              <span>{item.label}</span>
            </div>

            {item.badge && (
              <span className={`pill-badge pill-badge-${item.badgeColor}`} style={{ fontSize: '0.65rem', padding: '2px 7px' }}>
                {item.badge}
              </span>
            )}
          </button>
        );
      })}

      <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--border-subtle)', padding: '16px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Flame size={16} color="var(--amber)" />
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>FINLY Smart Engine</span>
        </div>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
          Algorithmic data normalization, deduplication & health scoring active.
        </p>
      </div>
    </aside>
  );
};
