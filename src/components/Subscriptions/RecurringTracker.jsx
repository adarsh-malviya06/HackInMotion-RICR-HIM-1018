import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { CreditCard, Scissors } from 'lucide-react';

export const RecurringTracker = () => {
  const { recurring, currency } = useFinance();
  const [canceledItems, setCanceledItems] = useState(new Set());

  const toggleCancelSim = (id) => {
    setCanceledItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const totalMonthlyBurn = recurring.reduce((sum, r) => sum + Number(r.amount), 0);

  const activeRecurring = recurring.filter(r => !canceledItems.has(r.id));
  const activeMonthlyBurn = activeRecurring.reduce((sum, r) => sum + Number(r.amount), 0);
  const totalSavedMonthly = totalMonthlyBurn - activeMonthlyBurn;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div>
        <h1 className="display-title" style={{ fontSize: '2rem', fontWeight: 800 }}>Recurring Expenses & Subscriptions</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Algorithmic subscription detection, monthly burn rate meter & one-click cancellation simulator
        </p>
      </div>

      {/* Burn Rate Header Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
        <div className="card-white-clean">
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Total Subscription Commitment
          </div>
          <div className="num-mono" style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-rose)', marginTop: '4px' }}>
            {currency}{totalMonthlyBurn.toFixed(2)}/mo
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Annual Drain: <strong style={{ color: 'var(--text-dark)' }}>{currency}{(totalMonthlyBurn * 12).toFixed(2)}/yr</strong>
          </div>
        </div>

        <div className="card-dark-violet">
          <div style={{ fontSize: '0.75rem', color: '#34d399', textTransform: 'uppercase', fontWeight: 700 }}>
            Cancellation Simulator Savings
          </div>
          <div className="num-mono" style={{ fontSize: '2rem', fontWeight: 800, color: '#34d399', marginTop: '4px' }}>
            +{currency}{totalSavedMonthly.toFixed(2)}/mo
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-dim-light)', marginTop: '4px' }}>
            1-Year Wealth Retained: <strong style={{ color: '#ffffff' }}>+{currency}{(totalSavedMonthly * 12).toFixed(2)}/yr</strong>
          </div>
        </div>
      </div>

      {/* Subscriptions List */}
      <div className="card-white-clean">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 className="display-title" style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CreditCard size={20} color="var(--accent-purple)" /> Tracked Subscriptions ({recurring.length})
          </h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Click "Simulate Cut" to preview immediate financial savings
          </span>
        </div>

        {recurring.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No recurring subscription items detected yet. Upload transactions to auto-detect monthly subscriptions.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {recurring.map(item => {
              const isCanceled = canceledItems.has(item.id);
              return (
                <div
                  key={item.id}
                  className={isCanceled ? "card-light-lavender" : "card-white-clean"}
                  style={{
                    opacity: isCanceled ? 0.6 : 1,
                    transition: 'all 0.2s',
                    padding: '24px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                    <div>
                      <h3 className="display-title" style={{ fontSize: '1.1rem', fontWeight: 700, textDecoration: isCanceled ? 'line-through' : 'none' }}>
                        {item.merchant}
                      </h3>
                      <span style={{ background: '#191728', color: '#ffffff', padding: '2px 10px', borderRadius: 'var(--radius-pill)', fontSize: '0.68rem', fontWeight: 700, marginTop: '4px', display: 'inline-block' }}>
                        {item.billing_cycle || 'Monthly'}
                      </span>
                    </div>
                    <div className="num-mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: isCanceled ? 'var(--text-muted)' : 'var(--accent-rose)' }}>
                      {currency}{Number(item.amount).toFixed(2)}
                    </div>
                  </div>

                  <button
                    onClick={() => toggleCancelSim(item.id)}
                    className={isCanceled ? "btn-pill-white" : "btn-pill-dark"}
                    style={{ width: '100%', justifyContent: 'center', padding: '8px 14px', fontSize: '0.8rem' }}
                  >
                    <Scissors size={14} />
                    {isCanceled ? 'Undo Cancellation' : 'Simulate Cut / Cancel'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
