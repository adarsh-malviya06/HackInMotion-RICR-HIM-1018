import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Sliders } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export const WhatIfSimulator = () => {
  const { transactions, recurring, currency } = useFinance();

  // Slider Parameters
  const [expenseCutPct, setExpenseCutPct] = useState(15);
  const [subsCutCount, setSubsCutCount] = useState(1);
  const [extraMonthlySave, setExtraMonthlySave] = useState(250);
  const [returnRate, setReturnRate] = useState(7);
  const [years, setYears] = useState(10);

  // Baseline Monthly Expense & Income
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0) || 1200;

  const totalSubSpend = recurring.slice(0, subsCutCount).reduce((sum, r) => sum + Number(r.amount), 0);
  
  const monthlyExpenseSavings = (totalExpense * (expenseCutPct / 100)) + totalSubSpend;
  const totalExtraMonthly = monthlyExpenseSavings + Number(extraMonthlySave);

  // Compound Interest Calculation over N Years
  const generateTrajectory = () => {
    const monthlyRate = returnRate / 100 / 12;
    const labels = [];
    const baselinePoints = [];
    const boostedPoints = [];

    let currentBaseline = 0;
    let currentBoosted = 0;

    for (let yr = 0; yr <= years; yr++) {
      labels.push(`Year ${yr}`);
      
      if (yr === 0) {
        baselinePoints.push(0);
        boostedPoints.push(0);
      } else {
        for (let m = 0; m < 12; m++) {
          currentBaseline = (currentBaseline + 100) * (1 + monthlyRate);
          currentBoosted = (currentBoosted + 100 + totalExtraMonthly) * (1 + monthlyRate);
        }
        baselinePoints.push(Math.round(currentBaseline));
        boostedPoints.push(Math.round(currentBoosted));
      }
    }

    return { labels, baselinePoints, boostedPoints };
  };

  const { labels, baselinePoints, boostedPoints } = generateTrajectory();

  const finalBoostedWealth = boostedPoints[boostedPoints.length - 1] || 0;
  const finalBaselineWealth = baselinePoints[baselinePoints.length - 1] || 0;
  const netWealthGain = finalBoostedWealth - finalBaselineWealth;

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Boosted Savings & Investments Trajectory',
        data: boostedPoints,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.08)',
        fill: true,
        tension: 0.3
      },
      {
        label: 'Standard Baseline Trajectory',
        data: baselinePoints,
        borderColor: '#9fa2b8',
        borderDash: [5, 5],
        backgroundColor: 'transparent',
        fill: false,
        tension: 0.3
      }
    ]
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div>
        <h1 className="display-title" style={{ fontSize: '2rem', fontWeight: 800 }}>What-If Wealth & Savings Simulator</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Simulate spending cuts, subscription cancellations & compound investment returns over 1-30 year horizons
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px' }}>
        {/* Controls Column */}
        <div className="card-light-lavender" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 className="display-title" style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sliders size={20} color="var(--accent-purple)" /> Simulation Parameters
          </h2>

          {/* Slider 1: Cut Non-Essential Expenses */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px', fontWeight: 600 }}>
              <span>Cut Non-Essential Spending</span>
              <strong style={{ color: 'var(--accent-purple)' }}>{expenseCutPct}%</strong>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={expenseCutPct}
              onChange={e => setExpenseCutPct(Number(e.target.value))}
              style={{ width: '100%' }}
            />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Saves ~{currency}{Math.round(totalExpense * (expenseCutPct / 100))}/month
            </div>
          </div>

          {/* Slider 2: Cancel Subscriptions */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px', fontWeight: 600 }}>
              <span>Cancel Subscriptions</span>
              <strong style={{ color: 'var(--accent-rose)' }}>{subsCutCount} Items</strong>
            </div>
            <input
              type="range"
              min="0"
              max={Math.max(1, recurring.length)}
              step="1"
              value={subsCutCount}
              onChange={e => setSubsCutCount(Number(e.target.value))}
              style={{ width: '100%' }}
            />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Saves ~{currency}{totalSubSpend.toFixed(2)}/month
            </div>
          </div>

          {/* Slider 3: Direct Extra Savings */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px', fontWeight: 600 }}>
              <span>Extra Monthly Investment</span>
              <strong style={{ color: 'var(--accent-emerald)' }}>{currency}{extraMonthlySave}</strong>
            </div>
            <input
              type="range"
              min="0"
              max="1500"
              step="50"
              value={extraMonthlySave}
              onChange={e => setExtraMonthlySave(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          {/* Slider 4: Time Horizon */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px', fontWeight: 600 }}>
              <span>Time Horizon (Years)</span>
              <strong style={{ color: 'var(--accent-cyan)' }}>{years} Years</strong>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              step="1"
              value={years}
              onChange={e => setYears(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          {/* Slider 5: Expected Compound Return % */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px', fontWeight: 600 }}>
              <span>Expected Annual Return Rate</span>
              <strong style={{ color: 'var(--accent-amber)' }}>{returnRate}% ARR</strong>
            </div>
            <input
              type="range"
              min="2"
              max="15"
              step="1"
              value={returnRate}
              onChange={e => setReturnRate(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        {/* Results & Visual Chart Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Highlight Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="card-white-clean">
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Additional Monthly Cash Flow
              </div>
              <div className="num-mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-emerald)', marginTop: '4px' }}>
                +{currency}{totalExtraMonthly.toFixed(2)}/mo
              </div>
            </div>

            <div className="card-dark-violet">
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim-light)', textTransform: 'uppercase', fontWeight: 700 }}>
                {years}-Year Net Wealth Expansion
              </div>
              <div className="num-mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#c084fc', marginTop: '4px' }}>
                +{currency}{netWealthGain.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Chart Container */}
          <div className="card-white-clean" style={{ flex: 1 }}>
            <h3 className="display-title" style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>
              {years}-Year Compound Accumulation Projection
            </h3>
            <div style={{ height: '300px' }}>
              <Line data={chartData} options={{
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
        </div>
      </div>
    </div>
  );
};
