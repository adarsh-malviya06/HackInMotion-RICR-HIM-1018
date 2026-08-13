import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Sparkles, 
  UploadCloud, 
  PlusCircle,
  ShieldCheck,
  Repeat,
  PieChart,
  Bot
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
  const { transactions, currency, healthScore, setActiveTab } = useFinance();
  const { user } = useAuth();

  const userName = user?.name || (user?.email ? user.email.split('@')[0] : 'User');
  const hasData = transactions && transactions.length > 0;

  // Calculations for data-driven dashboard
  const incomeTxs = transactions.filter(t => t.type === 'income');
  const expenseTxs = transactions.filter(t => t.type === 'expense');

  const totalIncome = incomeTxs.reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpense = expenseTxs.reduce((sum, t) => sum + Number(t.amount), 0);
  const netSavings = totalIncome - totalExpense;

  // Category Distribution Doughnut
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

  // Timeline Cashflow Line Chart
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

  const toolkit = [
    {
      id: 'ingestion',
      icon: <UploadCloud size={22} color="#7c5cff" />,
      title: 'Smart Data Ingestion',
      desc: 'Import CSV statements and organize transactions automatically.'
    },
    {
      id: 'data-intelligence',
      icon: <ShieldCheck size={22} color="#10b981" />,
      title: 'Data Cleaning',
      desc: 'Normalize messy merchant names and detect duplicate charges.'
    },
    {
      id: 'financial-intelligence',
      icon: <TrendingUp size={22} color="#c084fc" />,
      title: 'Financial Intelligence',
      desc: 'Understand spending patterns, anomalies, money leaks & health.'
    },
    {
      id: 'subscriptions',
      icon: <Repeat size={22} color="#f59e0b" />,
      title: 'Recurring & Subscriptions',
      desc: 'Identify recurring expenses and subscription patterns.'
    },
    {
      id: 'planning',
      icon: <PieChart size={22} color="#3b82f6" />,
      title: 'Planning & Budgets',
      desc: 'Manage budgets, savings goals & financial simulations.'
    },
    {
      id: 'copilot',
      icon: <Bot size={22} color="#ec4899" />,
      title: 'AI Copilot Assistant',
      desc: 'Ask natural language questions about your live financial data.'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Dynamic Workspace Header */}
      <div style={{
        background: '#ffffff',
        padding: '28px 32px',
        borderRadius: '24px',
        border: '1px solid #dce0ee',
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.03)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '1.4rem' }}>👋</span>
            <h1 className="display-title" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-dark)', margin: 0 }}>
              Welcome back, {userName}
            </h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
            {hasData 
              ? "Here is your real-time financial workspace & live cashflow analytics." 
              : "Your financial workspace is ready. Bring in your data to start understanding where your money goes."}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => setActiveTab('ingestion')} className="btn-pill-white" style={{ padding: '10px 18px' }}>
            <UploadCloud size={16} /> Import Transactions
          </button>
          <button onClick={() => setActiveTab('ingestion')} className="btn-pill-dark" style={{ padding: '10px 20px' }}>
            <PlusCircle size={16} /> Add Transaction
          </button>
        </div>
      </div>

      {/* Render Empty State if no financial transactions exist yet */}
      {!hasData ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Empty State Banner */}
          <div className="card-dark-violet" style={{ padding: '36px', borderRadius: '24px', color: '#ffffff' }}>
            <div style={{ maxWidth: '640px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 12px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#c084fc',
                marginBottom: '14px'
              }}>
                <Sparkles size={13} /> Getting Started with FINLY
              </div>
              <h2 className="display-title" style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '12px', color: '#ffffff' }}>
                Your financial workspace is ready
              </h2>
              <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '24px' }}>
                Import a bank CSV statement or add your first manual transaction to activate real-time analytics, category breakdowns, health scores, and AI recommendations.
              </p>
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <button onClick={() => setActiveTab('ingestion')} className="btn-pill-white" style={{ padding: '12px 24px', fontWeight: 700 }}>
                  <UploadCloud size={16} /> Import Transactions
                </button>
                <button onClick={() => setActiveTab('ingestion')} className="btn-pill-dark" style={{ padding: '12px 22px', border: '1px solid rgba(255,255,255,0.2)' }}>
                  <PlusCircle size={16} /> Add Manual Record
                </button>
              </div>
            </div>
          </div>

          {/* Your FINLY Toolkit Section */}
          <div>
            <h3 className="display-title" style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '16px' }}>
              Your FINLY Workspace Toolkit
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {toolkit.map((item) => (
                <div
                  key={item.id}
                  className="card-white-clean"
                  onClick={() => {
                    if (item.id !== 'copilot') setActiveTab(item.id);
                  }}
                  style={{
                    padding: '24px',
                    borderRadius: '20px',
                    border: '1px solid #dce0ee',
                    cursor: item.id !== 'copilot' ? 'pointer' : 'default',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (item.id !== 'copilot') {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(25, 23, 40, 0.08)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.04)';
                  }}
                >
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: '#f8fafc',
                    border: '1px solid #edf0f8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '14px'
                  }}>
                    {item.icon}
                  </div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '6px' }}>
                    {item.title}
                  </h4>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Data-Driven Dashboard View when transactions exist */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
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
        </div>
      )}
    </div>
  );
};
