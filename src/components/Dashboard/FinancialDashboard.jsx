import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { HeroHeader } from '../HeroHeader';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Sparkles, 
  Search, 
  Trash2, 
  UploadCloud, 
  PlusCircle,
  ShieldAlert
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

export const FinancialDashboard = () => {
  const { transactions, currency, healthScore, deleteTransaction, setActiveTab } = useFinance();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Calculations
  const incomeTxs = transactions.filter(t => t.type === 'income');
  const expenseTxs = transactions.filter(t => t.type === 'expense');

  const totalIncome = incomeTxs.reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpense = expenseTxs.reduce((sum, t) => sum + Number(t.amount), 0);
  const netSavings = totalIncome - totalExpense;

  // Filtered Transactions
  const filteredTxs = transactions.filter(t => {
    const matchesSearch = t.merchant.toLowerCase().includes(search.toLowerCase()) || 
                          (t.raw_description || '').toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Chart 1: Category Distribution Doughnut
  const categoryTotals = {};
  expenseTxs.forEach(t => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Number(t.amount);
  });

  const doughnutData = {
    labels: Object.keys(categoryTotals),
    datasets: [
      {
        data: Object.values(categoryTotals),
        backgroundColor: [
          '#191728', '#7c5cff', '#10b981', '#f43f5e', '#f59e0b', '#06b6d4', '#64748b'
        ],
        borderWidth: 0
      }
    ]
  };

  // Chart 2: Timeline Cashflow Line Chart
  const dateMap = {};
  transactions.slice().reverse().forEach(t => {
    const d = t.date || 'Today';
    if (!dateMap[d]) dateMap[d] = { income: 0, expense: 0 };
    if (t.type === 'income') dateMap[d].income += Number(t.amount);
    else dateMap[d].expense += Number(t.amount);
  });

  const dates = Object.keys(dateMap).slice(-10);
  const lineData = {
    labels: dates.length ? dates : ['No Data'],
    datasets: [
      {
        label: 'Income',
        data: dates.map(d => dateMap[d].income),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.08)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Expense',
        data: dates.map(d => dateMap[d].expense),
        borderColor: '#f43f5e',
        backgroundColor: 'rgba(244, 63, 94, 0.08)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const categoriesList = ['All', ...new Set(transactions.map(t => t.category))];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* BloomFi Style Hero Header */}
      <HeroHeader />

      {/* Main Workspace Title Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: '20px' }}>
        <div>
          <h2 className="display-title" style={{ fontSize: '1.75rem', fontWeight: 800 }}>Financial Dashboard & Analytics</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Real-time cashflow analytics, data intelligence & health status
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => setActiveTab('ingestion')} className="btn-pill-white">
            <UploadCloud size={16} /> Import CSV
          </button>
          <button onClick={() => setActiveTab('ingestion')} className="btn-pill-dark">
            <PlusCircle size={16} /> Add Transaction
          </button>
        </div>
      </div>

      {/* Summary Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        {/* Card 1: Income */}
        <div className="card-white-clean">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Inflow</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={18} color="var(--accent-emerald)" />
            </div>
          </div>
          <div className="num-mono" style={{ fontSize: '1.8rem', fontWeight: 800 }}>
            {currency}{totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', marginTop: '4px', fontWeight: 600 }}>
            {incomeTxs.length} Income Records
          </div>
        </div>

        {/* Card 2: Expense */}
        <div className="card-white-clean">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Outflow</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(244, 63, 94, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingDown size={18} color="var(--accent-rose)" />
            </div>
          </div>
          <div className="num-mono" style={{ fontSize: '1.8rem', fontWeight: 800 }}>
            {currency}{totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-rose)', marginTop: '4px', fontWeight: 600 }}>
            {expenseTxs.length} Expense Records
          </div>
        </div>

        {/* Card 3: Net Cashflow */}
        <div className="card-white-clean">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Net Cashflow</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(124, 92, 255, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wallet size={18} color="var(--accent-purple)" />
            </div>
          </div>
          <div className="num-mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: netSavings >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
            {netSavings >= 0 ? '+' : ''}{currency}{netSavings.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Savings Rate: <strong style={{ color: 'var(--text-dark)' }}>{healthScore.savingsRate || 0}%</strong>
          </div>
        </div>

        {/* Card 4: Dark Health Score Card */}
        <div className="card-dark-violet" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('financial-intelligence')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim-light)', textTransform: 'uppercase' }}>Financial Health</span>
            <Sparkles size={18} color="#c084fc" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
            <span className="num-mono" style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff' }}>
              {healthScore.score || 50}
            </span>
            <span style={{ background: '#ffffff', color: 'var(--text-dark)', padding: '2px 10px', borderRadius: 'var(--radius-pill)', fontSize: '0.75rem', fontWeight: 700 }}>
              Grade {healthScore.grade || 'C'}
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim-light)', marginTop: '4px' }}>
            Status: <strong style={{ color: '#34d399' }}>{healthScore.status || 'Active'}</strong>
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Cashflow Timeline Line Chart */}
        <div className="card-white-clean">
          <h3 className="display-title" style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>
            Cashflow Dynamics Trend
          </h3>
          <div style={{ height: '260px' }}>
            <Line data={lineData} options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { labels: { color: '#5e6075' } } },
              scales: {
                x: { ticks: { color: '#9fa2b8' }, grid: { color: 'rgba(0, 0, 0, 0.04)' } },
                y: { ticks: { color: '#9fa2b8' }, grid: { color: 'rgba(0, 0, 0, 0.04)' } }
              }
            }} />
          </div>
        </div>

        {/* Expense Category Doughnut Chart */}
        <div className="card-white-clean">
          <h3 className="display-title" style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>
            Expense Distribution
          </h3>
          <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {Object.keys(categoryTotals).length ? (
              <Doughnut data={doughnutData} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { color: '#5e6075', font: { size: 11 } } } }
              }} />
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No category expense data recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Transactions Data Table */}
      <div className="card-white-clean">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 className="display-title" style={{ fontSize: '1.2rem', fontWeight: 700 }}>Transaction Database</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{filteredTxs.length} transaction entries displayed</p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            {/* Search Bar */}
            <div style={{ position: 'relative', width: '220px' }}>
              <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search merchant..."
                style={{ paddingLeft: '34px', fontSize: '0.825rem' }}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <select
              className="form-select"
              style={{ width: '160px', fontSize: '0.825rem' }}
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
            >
              {categoriesList.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Empty State */}
        {filteredTxs.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '48px 20px',
            background: 'var(--bg-card-light)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)'
          }}>
            <ShieldAlert size={42} color="var(--accent-purple)" style={{ marginBottom: '12px' }} />
            <h4 className="display-title" style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>No Financial Data Recorded</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 16px auto' }}>
              Your transaction database is currently empty. Connect your bank CSV file or add transactions manually to trigger full AI analytics.
            </p>
            <button onClick={() => setActiveTab('ingestion')} className="btn-pill-dark">
              <UploadCloud size={16} /> Import Transactions Now
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 16px' }}>Date</th>
                  <th style={{ padding: '12px 16px' }}>Merchant / Description</th>
                  <th style={{ padding: '12px 16px' }}>Category</th>
                  <th style={{ padding: '12px 16px' }}>Payment</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Amount</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTxs.map(t => (
                  <tr key={t.id} style={{ borderBottom: '1px solid #edf0f8', transition: 'background 0.15s' }}>
                    <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '0.8rem' }} className="num-mono">
                      {t.date}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 600 }}>
                      {t.merchant}
                      {t.raw_description && t.raw_description !== t.merchant && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 400 }}>{t.raw_description}</div>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ background: '#e2e6f4', color: 'var(--text-dark)', padding: '3px 10px', borderRadius: 'var(--radius-pill)', fontSize: '0.72rem', fontWeight: 600 }}>
                        {t.category}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {t.payment_method || 'Card'}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 700 }} className="num-mono">
                      <span style={{ color: t.type === 'income' ? 'var(--accent-emerald)' : 'var(--text-dark)' }}>
                        {t.type === 'income' ? '+' : '-'}{currency}{Math.abs(Number(t.amount)).toFixed(2)}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <button
                        onClick={() => deleteTransaction(t.id)}
                        className="btn-pill-white"
                        style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                        title="Delete Transaction"
                      >
                        <Trash2 size={13} color="var(--accent-rose)" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
