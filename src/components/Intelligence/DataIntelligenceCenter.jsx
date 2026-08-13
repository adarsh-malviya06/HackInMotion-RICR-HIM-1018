import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Wand2, Copy, CheckCircle2, Sparkles } from 'lucide-react';

export const DataIntelligenceCenter = () => {
  const { duplicates, transactions, deleteTransaction, showToast } = useFinance();

  const handleResolveDuplicate = (dupItem, keepId, removeId) => {
    deleteTransaction(removeId);
    showToast('Duplicate transaction resolved!', 'success');
  };

  const uncategorizedTxs = transactions.filter(t => t.category === 'Uncategorized');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div>
        <h1 className="display-title" style={{ fontSize: '2rem', fontWeight: 800 }}>Data Intelligence Center</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Algorithmic data cleaning, duplicate detection, merchant string normalization & categorization engine
        </p>
      </div>

      {/* Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        <div className="card-white-clean">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Wand2 size={22} color="var(--accent-purple)" />
            <h3 className="display-title" style={{ fontSize: '1.1rem', fontWeight: 700 }}>Merchant Normalization</h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Automatically strips raw gateway codes (e.g., <code>SQ *STARBUCKS #9482</code> → <strong>Starbucks</strong>).
          </p>
        </div>

        <div className="card-white-clean">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Copy size={22} color="var(--accent-amber)" />
            <h3 className="display-title" style={{ fontSize: '1.1rem', fontWeight: 700 }}>Duplicate Detector</h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            {duplicates.length > 0 
              ? `${duplicates.length} duplicate charge pairs detected in your transaction log.` 
              : 'Zero duplicate transactions detected. Database is clean!'}
          </p>
        </div>

        <div className="card-white-clean">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Sparkles size={22} color="var(--accent-emerald)" />
            <h3 className="display-title" style={{ fontSize: '1.1rem', fontWeight: 700 }}>Auto-Categorization</h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            {uncategorizedTxs.length > 0 
              ? `${uncategorizedTxs.length} items require category review.` 
              : '100% of your transactions are cleanly categorized.'}
          </p>
        </div>
      </div>

      {/* Duplicate Resolution Section */}
      <div className="card-dark-violet">
        <h2 className="display-title" style={{ fontSize: '1.3rem', fontWeight: 700, color: '#ffffff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Copy size={20} color="#fbbf24" /> Duplicate Transaction Resolver ({duplicates.length})
        </h2>

        {duplicates.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#34d399', fontSize: '0.9rem' }}>
            <CheckCircle2 size={22} />
            <span>No duplicate charges found in your dataset. All database records are unique.</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {duplicates.map((item, idx) => (
              <div key={idx} style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 'var(--radius-md)',
                padding: '20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span style={{ background: '#fbbf24', color: '#191728', padding: '3px 12px', borderRadius: 'var(--radius-pill)', fontSize: '0.75rem', fontWeight: 700 }}>
                    {item.confidence} Confidence Duplicate Match
                  </span>
                  <span className="num-mono" style={{ fontWeight: 800, color: '#ffffff', fontSize: '1.1rem' }}>
                    ${Number(item.primary.amount).toFixed(2)}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {/* Item 1 */}
                  <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim-light)' }}>Entry A - Date: {item.primary.date}</div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', marginTop: '2px' }}>{item.primary.merchant}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim-light)', marginTop: '2px' }}>{item.primary.payment_method}</div>
                    <button
                      onClick={() => handleResolveDuplicate(item, item.primary.id, item.duplicate.id)}
                      className="btn-pill-white"
                      style={{ marginTop: '12px', width: '100%', padding: '6px 12px', fontSize: '0.8rem', justifyContent: 'center' }}
                    >
                      Keep Entry A Only
                    </button>
                  </div>

                  {/* Item 2 */}
                  <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim-light)' }}>Entry B - Date: {item.duplicate.date}</div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', marginTop: '2px' }}>{item.duplicate.merchant}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim-light)', marginTop: '2px' }}>{item.duplicate.payment_method}</div>
                    <button
                      onClick={() => handleResolveDuplicate(item, item.duplicate.id, item.primary.id)}
                      className="btn-pill-white"
                      style={{ marginTop: '12px', width: '100%', padding: '6px 12px', fontSize: '0.8rem', justifyContent: 'center' }}
                    >
                      Keep Entry B Only
                    </button>
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
