import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import confetti from 'canvas-confetti';
import { Target, PlusCircle, Trophy } from 'lucide-react';

export const BudgetPlanner = () => {
  const { budgets, goals, transactions, currency, addBudget, addGoal, depositToGoal, showToast } = useFinance();

  // New Budget Form
  const [budgetCat, setBudgetCat] = useState('Food & Dining');
  const [budgetLimit, setBudgetLimit] = useState('');

  // New Goal Form
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalDate, setGoalDate] = useState('');

  // Quick Deposit State
  const [depositGoalId, setDepositGoalId] = useState(null);
  const [depositAmt, setDepositAmt] = useState('');

  const categories = [
    'Housing', 'Groceries', 'Food & Dining', 'Subscriptions & Tech', 
    'Utilities', 'Travel & Transport', 'Health & Fitness', 'Shopping', 'Miscellaneous'
  ];

  const handleCreateBudget = (e) => {
    e.preventDefault();
    if (!budgetLimit) return;
    addBudget({ category: budgetCat, monthly_limit: Number(budgetLimit) });
    setBudgetLimit('');
  };

  const handleCreateGoal = (e) => {
    e.preventDefault();
    if (!goalName || !goalTarget) return;
    addGoal({
      name: goalName,
      target_amount: Number(goalTarget),
      current_amount: 0,
      target_date: goalDate || null
    });
    setGoalName('');
    setGoalTarget('');
    setGoalDate('');
  };

  const handleDepositSubmit = (e) => {
    e.preventDefault();
    if (!depositGoalId || !depositAmt) return;
    depositToGoal(depositGoalId, depositAmt);
    
    const g = goals.find(item => (item._id || item.id) === depositGoalId);
    if (g && (Number(g.current_amount) + Number(depositAmt)) >= Number(g.target_amount)) {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      showToast(`Congratulations! You reached your goal "${g.name}"!`, 'success');
    }

    setDepositGoalId(null);
    setDepositAmt('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 className="display-title" style={{ fontSize: '2rem', fontWeight: 800 }}>Financial Planning: Budgets & Goals</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Set monthly category spending caps and track progress towards major wealth accumulation goals
        </p>
      </div>

      {/* 1. Category Budgets Section */}
      <div className="card-white-clean">
        <h2 className="display-title" style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Target size={22} color="var(--accent-purple)" /> Category Monthly Spending Caps
        </h2>

        {/* Add Budget Form */}
        <form onSubmit={handleCreateBudget} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '28px' }}>
          <select
            className="form-select"
            style={{ width: '200px' }}
            value={budgetCat}
            onChange={e => setBudgetCat(e.target.value)}
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input
            type="number"
            className="form-input"
            style={{ width: '180px' }}
            placeholder={`Limit (${currency})`}
            value={budgetLimit}
            onChange={e => setBudgetLimit(e.target.value)}
            required
          />
          <button type="submit" className="btn-pill-dark">
            <PlusCircle size={16} /> Save Cap
          </button>
        </form>

        {/* Budgets List */}
        {budgets.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No category budgets set yet. Add a category cap above to track overspending.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {budgets.map(b => {
              const spent = transactions
                .filter(t => t.type === 'expense' && t.category === b.category)
                .reduce((sum, t) => sum + Number(t.amount), 0);
              const limit = Number(b.monthly_limit);
              const pct = Math.min(100, Math.round((spent / limit) * 100));

              let barColor = 'var(--accent-emerald)';
              if (pct >= 100) barColor = 'var(--accent-rose)';
              else if (pct >= 75) barColor = 'var(--accent-amber)';

              return (
                <div key={b.category} className="card-light-lavender" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span className="display-title" style={{ fontWeight: 700, fontSize: '1rem' }}>{b.category}</span>
                    <span className="num-mono" style={{ fontSize: '0.85rem', color: pct >= 100 ? 'var(--accent-rose)' : 'var(--text-dark)', fontWeight: 700 }}>
                      {currency}{spent.toFixed(2)} / {currency}{limit.toFixed(2)}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div style={{ width: '100%', height: '8px', background: 'rgba(0, 0, 0, 0.08)', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: barColor, transition: 'width 0.4s ease' }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>{pct}% Used</span>
                    <span>{pct >= 100 ? 'EXCEEDED' : `${currency}${(limit - spent).toFixed(2)} remaining`}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Financial Goals Section */}
      <div className="card-white-clean">
        <h2 className="display-title" style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Trophy size={22} color="var(--accent-amber)" /> Financial Wealth Accumulation Goals
        </h2>

        {/* Add Goal Form */}
        <form onSubmit={handleCreateGoal} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '28px' }}>
          <input
            type="text"
            className="form-input"
            style={{ width: '220px' }}
            placeholder="Goal Title (e.g. Emergency Fund)"
            value={goalName}
            onChange={e => setGoalName(e.target.value)}
            required
          />
          <input
            type="number"
            className="form-input"
            style={{ width: '160px' }}
            placeholder={`Target (${currency})`}
            value={goalTarget}
            onChange={e => setGoalTarget(e.target.value)}
            required
          />
          <input
            type="date"
            className="form-input"
            style={{ width: '160px' }}
            value={goalDate}
            onChange={e => setGoalDate(e.target.value)}
          />
          <button type="submit" className="btn-pill-dark">
            <PlusCircle size={16} /> Create Goal
          </button>
        </form>

        {/* Goals Grid */}
        {goals.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No savings goals established yet. Create a target goal above to track progress.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {goals.map(g => {
              const current = Number(g.current_amount || 0);
              const target = Number(g.target_amount);
              const pct = Math.min(100, Math.round((current / target) * 100));

              return (
                <div key={g.id} className="card-light-lavender" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <h3 className="display-title" style={{ fontSize: '1.15rem', fontWeight: 700 }}>{g.name}</h3>
                      {g.target_date && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target: {g.target_date}</div>}
                    </div>
                    <span style={{ background: '#191728', color: '#ffffff', padding: '3px 10px', borderRadius: 'var(--radius-pill)', fontSize: '0.72rem', fontWeight: 700 }}>
                      {pct}% Achieved
                    </span>
                  </div>

                  <div className="num-mono" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '10px' }}>
                    {currency}{current.toFixed(2)} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ {currency}{target.toFixed(2)}</span>
                  </div>

                  {/* Progress Bar */}
                  <div style={{ width: '100%', height: '10px', background: 'rgba(0, 0, 0, 0.08)', borderRadius: '99px', overflow: 'hidden', marginBottom: '16px' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: 'var(--accent-emerald)', transition: 'width 0.4s ease' }} />
                  </div>

                  <button
                    onClick={() => { setDepositGoalId(g.id); setDepositAmt(''); }}
                    className="btn-pill-white"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    + Deposit Funds
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Deposit Modal */}
      {depositGoalId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110 }}>
          <div className="card-white-clean" style={{ maxWidth: '360px', width: '100%' }}>
            <h3 className="display-title" style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '12px' }}>Deposit Funds to Goal</h3>
            <form onSubmit={handleDepositSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <input
                type="number"
                step="0.01"
                className="form-input"
                placeholder={`Deposit Amount (${currency})`}
                value={depositAmt}
                onChange={e => setDepositAmt(e.target.value)}
                required
                autoFocus
              />
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setDepositGoalId(null)} className="btn-pill-white">Cancel</button>
                <button type="submit" className="btn-pill-dark">Confirm Deposit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
