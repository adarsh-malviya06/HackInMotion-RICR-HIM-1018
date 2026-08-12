import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { 
  BrainCircuit, 
  Sparkles, 
  AlertTriangle, 
  Flame, 
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export const FinancialIntelligence = () => {
  const { healthScore, anomalies, moneyLeaks, currency, setActiveTab } = useFinance();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div>
        <h1 className="display-title" style={{ fontSize: '2rem', fontWeight: 800 }}>Financial Intelligence</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Algorithmic health scoring, anomaly detection, spending analysis & money leak scanner
        </p>
      </div>

      {/* Health Score Overview Hero */}
      <div className="card-dark-violet" style={{ padding: '36px', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '36px', alignItems: 'center' }}>
        {/* Score Gauge Circle */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '160px',
            height: '160px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(124, 92, 255, 0.3) 0%, rgba(0,0,0,0) 70%)',
            border: '4px solid #c084fc',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 30px rgba(192, 132, 252, 0.4)'
          }}>
            <span className="num-mono" style={{ fontSize: '3.2rem', fontWeight: 800, color: '#ffffff' }}>
              {healthScore.score || 50}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              OUT OF 100
            </span>
          </div>
          <div style={{ marginTop: '16px' }}>
            <span style={{ background: '#ffffff', color: 'var(--text-dark)', padding: '4px 14px', borderRadius: 'var(--radius-pill)', fontSize: '0.85rem', fontWeight: 700 }}>
              Grade {healthScore.grade || 'C'} ({healthScore.status || 'Active'})
            </span>
          </div>
        </div>

        {/* Score Breakdown Metrics */}
        <div>
          <h2 className="display-title" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={22} color="#c084fc" /> Financial Health Diagnostics
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.06)', padding: '14px 18px', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim-light)' }}>Net Savings Ratio</div>
              <div className="num-mono" style={{ fontSize: '1.3rem', fontWeight: 800, color: '#34d399', marginTop: '2px' }}>
                {healthScore.savingsRate || 0}%
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.06)', padding: '14px 18px', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim-light)' }}>Subscription Burden</div>
              <div className="num-mono" style={{ fontSize: '1.3rem', fontWeight: 800, color: (healthScore.subscriptionRatio > 15) ? '#fb7185' : '#38bdf8', marginTop: '2px' }}>
                {healthScore.subscriptionRatio || 0}%
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {healthScore.insights && healthScore.insights.map((insight, idx) => (
              <div key={idx} style={{ fontSize: '0.85rem', color: 'var(--text-dim-light)', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <CheckCircle2 size={16} color="#34d399" style={{ flexShrink: 0, marginTop: '3px' }} />
                <span>{insight}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Anomaly Detection Section */}
      <div className="card-white-clean">
        <h2 className="display-title" style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertTriangle size={20} color="var(--accent-rose)" /> Anomaly & Charge Spike Detector ({anomalies.length})
        </h2>

        {anomalies.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No unusual spending spikes or anomalous transaction amounts detected in your dataset.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {anomalies.map((anom, idx) => (
              <div key={idx} style={{
                background: 'rgba(244, 63, 94, 0.06)',
                border: '1px solid rgba(244, 63, 94, 0.2)',
                padding: '16px',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 700 }}>{anom.transaction.merchant}</span>
                    <span style={{ background: '#f43f5e', color: '#ffffff', padding: '2px 8px', borderRadius: 'var(--radius-pill)', fontSize: '0.7rem', fontWeight: 700 }}>
                      {anom.severity} Spike
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {anom.reason}
                  </div>
                </div>
                <div className="num-mono" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-rose)' }}>
                  {currency}{Number(anom.transaction.amount).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Money Leak Detector Cards */}
      <div className="card-white-clean">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 className="display-title" style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Flame size={20} color="var(--accent-amber)" /> Money Leak Detector
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Automated audit for micro-spends, convenience premiums & passive cash drains
            </p>
          </div>
          <button onClick={() => setActiveTab('simulator')} className="btn-pill-dark">
            Simulate Savings <ArrowRight size={14} />
          </button>
        </div>

        {moneyLeaks.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No significant money leaks detected in your current dataset.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {moneyLeaks.map(leak => (
              <div key={leak.id} className="card-light-lavender" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ background: '#191728', color: '#ffffff', padding: '3px 12px', borderRadius: 'var(--radius-pill)', fontSize: '0.72rem', fontWeight: 700 }}>
                    {leak.type}
                  </span>
                  <span className="num-mono" style={{ fontWeight: 800, color: 'var(--accent-rose)', fontSize: '1.15rem' }}>
                    {currency}{leak.monthlyImpact.toFixed(2)}/mo
                  </span>
                </div>

                <h3 className="display-title" style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>{leak.title}</h3>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
                  {leak.description}
                </p>

                <div style={{ background: '#ffffff', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--accent-emerald)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Recommended Action
                  </div>
                  <div style={{ fontSize: '0.825rem', color: 'var(--text-dark)', fontWeight: 600, marginTop: '2px' }}>
                    {leak.recommendation} (Potential Savings: +{currency}{leak.savingsPotential}/mo)
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
