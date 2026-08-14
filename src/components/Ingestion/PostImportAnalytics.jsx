import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { 
  TrendingUp, 
  TrendingDown, 
  Layers, 
  Calendar, 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  X, 
  Tag,
  Repeat,
  ArrowUpDown,
  PieChart,
  FileSpreadsheet
} from 'lucide-react';

export const PostImportAnalytics = ({ customTransactions = null, title = "Post-Upload Financial Intelligence" }) => {
  const { transactions: contextTransactions, currency, deleteTransaction } = useFinance();
  
  // Use passed transactions array or fallback to global context transactions
  const rawTransactions = useMemo(() => customTransactions || contextTransactions || [], [customTransactions, contextTransactions]);

  // Filter & Search Controls State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL'); // 'ALL' | 'income' | 'expense'
  const [selectedPeriod, setSelectedPeriod] = useState('ALL'); // 'ALL' | 'YYYY' | 'YYYY-MM'
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [sortField, setSortField] = useState('date'); // 'date' | 'amount' | 'merchant'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'

  // 1. Dynamic Period Options Extraction (Detect available Years & Months from data)
  const periodOptions = useMemo(() => {
    if (!rawTransactions.length) return [];

    const yearsSet = new Set();
    const monthYearMap = new Map(); // 'YYYY-MM' -> 'Month YYYY'

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June', 
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    rawTransactions.forEach(t => {
      if (!t.date) return;
      const d = new Date(t.date);
      if (isNaN(d.getTime())) return;

      const y = d.getFullYear();
      const m = d.getMonth();
      const monthKey = `${y}-${String(m + 1).padStart(2, '0')}`;
      const label = `${monthNames[m]} ${y}`;

      yearsSet.add(String(y));
      monthYearMap.set(monthKey, { label, year: String(y), key: monthKey, dateObj: d });
    });

    const sortedYears = Array.from(yearsSet).sort().reverse();
    const sortedMonths = Array.from(monthYearMap.values()).sort((a, b) => b.dateObj - a.dateObj);

    const options = [{ key: 'ALL', label: 'All Time' }];

    // Add Year Options
    sortedYears.forEach(y => {
      options.push({ key: `YEAR:${y}`, label: `Year ${y}` });
    });

    // Add Month Options
    sortedMonths.forEach(m => {
      options.push({ key: `MONTH:${m.key}`, label: m.label });
    });

    return options;
  }, [rawTransactions]);

  // 2. Filter Transactions based on Period, Category, Type, and Search Query
  const filteredTransactions = useMemo(() => {
    return rawTransactions.filter(t => {
      // Search Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const m = (t.merchant || '').toLowerCase();
        const d = (t.raw_description || '').toLowerCase();
        const c = (t.category || '').toLowerCase();
        if (!m.includes(q) && !d.includes(q) && !c.includes(q)) return false;
      }

      // Type Filter
      if (selectedType !== 'ALL') {
        if ((t.type || 'expense').toLowerCase() !== selectedType.toLowerCase()) return false;
      }

      // Category Filter
      if (selectedCategory !== 'ALL') {
        if ((t.category || 'Uncategorized').toLowerCase() !== selectedCategory.toLowerCase()) return false;
      }

      // Period Filter
      if (selectedPeriod !== 'ALL') {
        if (!t.date) return false;
        const d = new Date(t.date);
        if (isNaN(d.getTime())) return false;

        if (selectedPeriod.startsWith('YEAR:')) {
          const targetYear = selectedPeriod.replace('YEAR:', '');
          if (String(d.getFullYear()) !== targetYear) return false;
        } else if (selectedPeriod.startsWith('MONTH:')) {
          const targetMonthKey = selectedPeriod.replace('MONTH:', '');
          const mKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          if (mKey !== targetMonthKey) return false;
        }
      }

      return true;
    });
  }, [rawTransactions, searchQuery, selectedCategory, selectedType, selectedPeriod]);

  // 3. Sort Filtered Transactions
  const sortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort((a, b) => {
      if (sortField === 'date') {
        const dA = new Date(a.date || 0);
        const dB = new Date(b.date || 0);
        return sortOrder === 'desc' ? dB - dA : dA - dB;
      } else if (sortField === 'amount') {
        const valA = Number(a.amount || 0);
        const valB = Number(b.amount || 0);
        return sortOrder === 'desc' ? valB - valA : valA - valB;
      } else if (sortField === 'merchant') {
        const mA = (a.merchant || '').toLowerCase();
        const mB = (b.merchant || '').toLowerCase();
        return sortOrder === 'desc' ? mB.localeCompare(mA) : mA.localeCompare(mB);
      }
      return 0;
    });
  }, [filteredTransactions, sortField, sortOrder]);

  // 4. Calculate Post-Upload Financial Summary Metrics
  const summaryMetrics = useMemo(() => {
    let income = 0;
    let expenses = 0;

    filteredTransactions.forEach(t => {
      const amt = Math.abs(Number(t.amount || 0));
      if ((t.type || 'expense').toLowerCase() === 'income') {
        income += amt;
      } else {
        expenses += amt;
      }
    });

    const netCashFlow = income - expenses;
    const savingsRate = income > 0 ? Math.round((netCashFlow / income) * 100) : 0;

    return {
      count: filteredTransactions.length,
      income,
      expenses,
      netCashFlow,
      savingsRate
    };
  }, [filteredTransactions]);

  // 5. Category-wise Breakdown Calculations
  const categoryBreakdown = useMemo(() => {
    const map = {};
    let totalExpenseAmount = 0;
    let totalIncomeAmount = 0;

    filteredTransactions.forEach(t => {
      const cat = t.category || 'Uncategorized';
      const amt = Math.abs(Number(t.amount || 0));
      const type = (t.type || 'expense').toLowerCase();

      if (!map[cat]) {
        map[cat] = {
          name: cat,
          expenseAmount: 0,
          incomeAmount: 0,
          count: 0,
          items: []
        };
      }

      map[cat].count += 1;
      map[cat].items.push(t);

      if (type === 'income') {
        map[cat].incomeAmount += amt;
        totalIncomeAmount += amt;
      } else {
        map[cat].expenseAmount += amt;
        totalExpenseAmount += amt;
      }
    });

    const expenseCategories = [];
    const incomeCategories = [];

    Object.values(map).forEach(cat => {
      if (cat.expenseAmount > 0) {
        const pct = totalExpenseAmount > 0 ? Math.round((cat.expenseAmount / totalExpenseAmount) * 100) : 0;
        expenseCategories.push({ ...cat, percentage: pct, totalAmount: cat.expenseAmount });
      }
      if (cat.incomeAmount > 0) {
        const pct = totalIncomeAmount > 0 ? Math.round((cat.incomeAmount / totalIncomeAmount) * 100) : 0;
        incomeCategories.push({ ...cat, percentage: pct, totalAmount: cat.incomeAmount });
      }
    });

    // Sort expense categories from highest to lowest spending
    expenseCategories.sort((a, b) => b.expenseAmount - a.expenseAmount);
    incomeCategories.sort((a, b) => b.incomeAmount - a.incomeAmount);

    return {
      expenseCategories,
      incomeCategories,
      totalExpenseAmount,
      totalIncomeAmount,
      allCategoryNames: Array.from(new Set(filteredTransactions.map(t => t.category || 'Uncategorized'))).sort()
    };
  }, [filteredTransactions]);

  // 6. Monthly Breakdown for Multi-Month statements
  const monthlyComparison = useMemo(() => {
    const map = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    filteredTransactions.forEach(t => {
      if (!t.date) return;
      const d = new Date(t.date);
      if (isNaN(d.getTime())) return;

      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;

      if (!map[key]) {
        map[key] = { key, label, income: 0, expense: 0, count: 0, dateObj: d };
      }

      const amt = Math.abs(Number(t.amount || 0));
      map[key].count += 1;
      if ((t.type || 'expense').toLowerCase() === 'income') {
        map[key].income += amt;
      } else {
        map[key].expense += amt;
      }
    });

    return Object.values(map).sort((a, b) => b.dateObj - a.dateObj);
  }, [filteredTransactions]);

  // Toggle Category Expand/Collapse
  const toggleCategoryExpand = (catName) => {
    setExpandedCategory(prev => prev === catName ? null : catName);
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSelectedType('ALL');
    setSelectedPeriod('ALL');
    setExpandedCategory(null);
  };

  const isFiltered = searchQuery !== '' || selectedCategory !== 'ALL' || selectedType !== 'ALL' || selectedPeriod !== 'ALL';

  // Category Color Palette Map for UI Polish
  const getCategoryColor = (catName) => {
    const name = (catName || '').toLowerCase();
    if (name.includes('food') || name.includes('din')) return '#f59e0b';
    if (name.includes('shop')) return '#ec4899';
    if (name.includes('housing') || name.includes('rent')) return '#7c5cff';
    if (name.includes('sub') || name.includes('tech')) return '#a855f7';
    if (name.includes('travel') || name.includes('trans')) return '#3b82f6';
    if (name.includes('util') || name.includes('bill')) return '#06b6d4';
    if (name.includes('grocer')) return '#10b981';
    if (name.includes('health') || name.includes('fit')) return '#ef4444';
    if (name.includes('inc') || name.includes('sal')) return '#10b981';
    return '#8b5cf6';
  };

  if (!rawTransactions.length) {
    return (
      <div className="card-white-clean" style={{ textAlign: 'center', padding: '48px 24px' }}>
        <FileSpreadsheet size={48} color="var(--text-muted)" style={{ marginBottom: '14px' }} />
        <h3 className="display-title" style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '8px' }}>
          No Transactions Available Yet
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', maxWidth: '440px', margin: '0 auto 20px auto' }}>
          Upload a bank CSV statement or add single transactions manually to view post-import category analytics and cash flow.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* HEADER BAR & DYNAMIC PERIOD SELECTOR */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <PieChart size={22} color="var(--accent-purple)" />
            <h2 className="display-title" style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>
              {title}
            </h2>
          </div>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Real-time financial analysis calculated directly from {filteredTransactions.length} transaction records
          </p>
        </div>

        {/* Dynamic Period Selector Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Calendar size={16} color="var(--accent-purple)" />
          <select
            value={selectedPeriod}
            onChange={e => setSelectedPeriod(e.target.value)}
            className="form-select"
            style={{
              padding: '8px 14px',
              fontSize: '0.85rem',
              fontWeight: 700,
              borderRadius: 'var(--radius-pill)',
              background: '#ffffff',
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer'
            }}
          >
            {periodOptions.map(opt => (
              <option key={opt.key} value={opt.key}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 1. POST-UPLOAD METRICS SUMMARY CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        {/* Total Transactions Card */}
        <div className="card-white-clean" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Imported Items
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers size={16} color="#475569" />
            </div>
          </div>
          <div>
            <div className="num-mono" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-dark)' }}>
              {summaryMetrics.count}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Total transaction rows
            </span>
          </div>
        </div>

        {/* Total Income Card */}
        <div className="card-white-clean" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#047857', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total Income
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={16} color="#047857" />
            </div>
          </div>
          <div>
            <div className="num-mono" style={{ fontSize: '1.6rem', fontWeight: 800, color: '#047857' }}>
              {currency}{summaryMetrics.income.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>
              + Inflow records
            </span>
          </div>
        </div>

        {/* Total Expenses Card */}
        <div className="card-white-clean" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#be123c', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total Expenses
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#ffe4e6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingDown size={16} color="#be123c" />
            </div>
          </div>
          <div>
            <div className="num-mono" style={{ fontSize: '1.6rem', fontWeight: 800, color: '#be123c' }}>
              {currency}{summaryMetrics.expenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#e11d48', fontWeight: 600 }}>
              - Outflow records
            </span>
          </div>
        </div>

        {/* Net Cash Flow Card */}
        <div 
          className="card-white-clean" 
          style={{ 
            padding: '18px 20px', 
            display: 'flex', 
            flexDirection: 'column', 
            justify: 'space-between',
            background: summaryMetrics.netCashFlow >= 0 ? 'linear-gradient(135deg, #ffffff 0%, #ecfdf5 100%)' : 'linear-gradient(135deg, #ffffff 0%, #fff1f2 100%)',
            border: summaryMetrics.netCashFlow >= 0 ? '1px solid #a7f3d0' : '1px solid #fecdd3'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Net Cash Flow
            </span>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: '10px', 
              background: summaryMetrics.netCashFlow >= 0 ? '#d1fae5' : '#ffe4e6', 
              display: 'flex', 
              alignItems: 'center', 
              justify: 'center' 
            }}>
              {summaryMetrics.netCashFlow >= 0 ? <TrendingUp size={16} color="#047857" /> : <TrendingDown size={16} color="#be123c" />}
            </div>
          </div>
          <div>
            <div className="num-mono" style={{ fontSize: '1.6rem', fontWeight: 800, color: summaryMetrics.netCashFlow >= 0 ? '#047857' : '#be123c' }}>
              {summaryMetrics.netCashFlow >= 0 ? '+' : ''}{currency}{summaryMetrics.netCashFlow.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {summaryMetrics.savingsRate}% Net Savings Rate
            </span>
          </div>
        </div>
      </div>

      {/* 2. MULTI-MONTH COMPARISON GRID (Visible when statement spans multiple months) */}
      {monthlyComparison.length > 1 && selectedPeriod === 'ALL' && (
        <div className="card-white-clean" style={{ padding: '20px' }}>
          <h3 className="display-title" style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={16} color="var(--accent-purple)" /> Monthly Cash Flow Comparison ({monthlyComparison.length} Months Detected)
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            {monthlyComparison.map(m => {
              const net = m.income - m.expense;
              return (
                <div
                  key={m.key}
                  onClick={() => setSelectedPeriod(`MONTH:${m.key}`)}
                  style={{
                    background: '#f8fafc',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: '1px solid #edf0f8',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  className="hover-card"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-dark)' }}>{m.label}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{m.count} txs</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                    <span style={{ color: '#059669' }}>In: {currency}{m.income.toLocaleString()}</span>
                    <span style={{ color: '#e11d48' }}>Out: {currency}{m.expense.toLocaleString()}</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: net >= 0 ? '#047857' : '#be123c', textAlign: 'right' }}>
                    Net: {net >= 0 ? '+' : ''}{currency}{net.toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. CATEGORY-WISE OVERVIEW & EXPANDABLE SUB-TABLE */}
      <div className="card-white-clean" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', gap: '12px' }}>
          <div>
            <h3 className="display-title" style={{ fontSize: '1.15rem', fontWeight: 800 }}>
              Category Breakdown ({categoryBreakdown.expenseCategories.length} Categories)
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Click any category card below to expand and view its specific transaction list
            </p>
          </div>

          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            Total Expenses: {currency}{categoryBreakdown.totalExpenseAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>

        {/* Expense Category Grid Cards */}
        {categoryBreakdown.expenseCategories.length === 0 ? (
          <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No expense categories found in current filter.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
            {categoryBreakdown.expenseCategories.map(cat => {
              const isExpanded = expandedCategory === cat.name;
              const themeColor = getCategoryColor(cat.name);

              return (
                <div
                  key={cat.name}
                  style={{
                    background: isExpanded ? '#ffffff' : '#f8fafc',
                    borderRadius: '14px',
                    border: isExpanded ? `2px solid ${themeColor}` : '1px solid #edf0f8',
                    padding: '16px',
                    boxShadow: isExpanded ? '0 8px 24px rgba(0,0,0,0.06)' : 'none',
                    transition: 'all 0.2s ease',
                    gridColumn: isExpanded ? '1 / -1' : 'span 1' // Expand full width when clicked!
                  }}
                >
                  {/* Category Header Row */}
                  <div
                    onClick={() => toggleCategoryExpand(cat.name)}
                    style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '10px' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: themeColor
                          }}
                        />
                        <span style={{ fontWeight: 800, fontSize: '0.925rem', color: 'var(--text-dark)' }}>
                          {cat.name}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.725rem', padding: '2px 8px', borderRadius: '12px', background: '#ffffff', border: '1px solid #e2e8f0', color: 'var(--text-muted)', fontWeight: 700 }}>
                          {cat.count} txs
                        </span>
                        {isExpanded ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                      </div>
                    </div>

                    {/* Progress Bar & Amount Row */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                        <span className="num-mono" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-dark)' }}>
                          {currency}{cat.expenseAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                        <span style={{ fontSize: '0.78rem', fontWeight: 800, color: themeColor }}>
                          {cat.percentage}% of total
                        </span>
                      </div>

                      {/* Visual Progress Bar Indicator */}
                      <div style={{ width: '100%', height: '7px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${Math.min(100, Math.max(4, cat.percentage))}%`,
                            height: '100%',
                            background: themeColor,
                            borderRadius: '4px',
                            transition: 'width 0.3s ease'
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 3. CATEGORY EXPANDED SUB-TABLE (Reveals ONLY items in this category) */}
                  {isExpanded && (
                    <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px dashed #e2e8f0', animation: 'fadeIn 0.2s ease' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-dark)' }}>
                          Transactions under "{cat.name}" ({cat.items.length})
                        </h4>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCategory(cat.name);
                          }}
                          style={{ background: 'transparent', border: 'none', color: 'var(--accent-purple)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                        >
                          Isolate Category in Full Table ↑
                        </button>
                      </div>

                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid #e2e8f0', color: 'var(--text-muted)' }}>
                              <th style={{ padding: '6px 8px' }}>Date</th>
                              <th style={{ padding: '6px 8px' }}>Merchant / Description</th>
                              <th style={{ padding: '6px 8px' }}>Payment Method</th>
                              <th style={{ padding: '6px 8px', textAlign: 'right' }}>Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {cat.items.map((subItem, sIdx) => (
                              <tr key={subItem._id || subItem.id || sIdx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '6px 8px' }} className="num-mono">{subItem.date || 'N/A'}</td>
                                <td style={{ padding: '6px 8px', fontWeight: 700 }}>{subItem.merchant || subItem.raw_description}</td>
                                <td style={{ padding: '6px 8px', color: 'var(--text-muted)' }}>{subItem.payment_method || 'Card'}</td>
                                <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 800, color: '#be123c' }} className="num-mono">
                                  {currency}{Math.abs(Number(subItem.amount)).toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4 & 5. COMPLETE TRANSACTION TABLE WITH FILTERS & SEARCH */}
      <div className="card-white-clean" style={{ padding: '24px' }}>
        
        {/* Table Title & Filter Control Bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '20px' }}>
          <div>
            <h3 className="display-title" style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
              Complete Transaction Ledger ({sortedTransactions.length} Items)
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Filter, search, and audit individual transaction records in real-time
            </p>
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', width: '260px', maxWidth: '100%' }}>
            <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search merchant or details..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                paddingLeft: '34px',
                paddingRight: '30px',
                height: '38px',
                fontSize: '0.8rem',
                borderRadius: 'var(--radius-pill)',
                background: '#f8fafc'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Filter Dropdowns Row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px', marginBottom: '20px', padding: '12px 16px', background: '#f8fafc', borderRadius: '14px', border: '1px solid #edf0f8' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-dark)' }}>
            <Filter size={14} color="var(--accent-purple)" /> Filters:
          </div>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="form-select"
            style={{ width: 'auto', fontSize: '0.78rem', height: '32px', borderRadius: '8px', padding: '0 10px' }}
          >
            <option value="ALL">All Types</option>
            <option value="expense">Expenses Only (-)</option>
            <option value="income">Income Only (+)</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="form-select"
            style={{ width: 'auto', fontSize: '0.78rem', height: '32px', borderRadius: '8px', padding: '0 10px' }}
          >
            <option value="ALL">All Categories ({categoryBreakdown.allCategoryNames.length})</option>
            {categoryBreakdown.allCategoryNames.map(cName => (
              <option key={cName} value={cName}>{cName}</option>
            ))}
          </select>

          {/* Sort By Field */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Sort:</span>
            <select
              value={sortField}
              onChange={e => setSortField(e.target.value)}
              className="form-select"
              style={{ width: 'auto', fontSize: '0.78rem', height: '32px', borderRadius: '8px', padding: '0 8px' }}
            >
              <option value="date">Date</option>
              <option value="amount">Amount</option>
              <option value="merchant">Merchant</option>
            </select>
            <button
              onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
              className="btn btn-secondary"
              style={{ height: '32px', width: '32px', padding: 0, justifyContent: 'center', borderRadius: '8px' }}
              title={`Sorting ${sortOrder.toUpperCase()}`}
            >
              <ArrowUpDown size={14} />
            </button>
          </div>

          {/* Clear Filters Button */}
          {isFiltered && (
            <button
              onClick={resetFilters}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', height: '32px', padding: '0 12px', borderRadius: '8px', color: '#be123c', fontWeight: 700 }}
            >
              <X size={13} /> Clear Filters
            </button>
          )}
        </div>

        {/* 11. FILTER EMPTY STATE OR TRANSACTION TABLE */}
        {sortedTransactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 16px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
            <Search size={32} color="var(--text-muted)" style={{ marginBottom: '8px' }} />
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-dark)' }}>
              No transactions match your current filters.
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Try adjusting your search query, type, or period selector.
            </p>
            <button onClick={resetFilters} className="btn-pill-dark" style={{ padding: '6px 16px', fontSize: '0.78rem' }}>
              Reset All Filters
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #edf0f8' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: 'var(--text-muted)', fontWeight: 700 }}>
                  <th style={{ padding: '12px 14px' }}>Date</th>
                  <th style={{ padding: '12px 14px' }}>Merchant / Payee</th>
                  <th style={{ padding: '12px 14px' }}>Category</th>
                  <th style={{ padding: '12px 14px' }}>Type</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>Amount</th>
                  <th style={{ padding: '12px 14px' }}>Payment</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {sortedTransactions.map((tx, index) => {
                  const isIncome = (tx.type || 'expense').toLowerCase() === 'income';
                  const txId = tx._id || tx.id || `tx_${index}`;
                  const catColor = getCategoryColor(tx.category);

                  return (
                    <tr 
                      key={txId} 
                      style={{ borderBottom: '1px solid #f1f5f9', background: index % 2 === 0 ? '#ffffff' : '#fafafa' }}
                      className="hover-row"
                    >
                      {/* Date */}
                      <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }} className="num-mono">
                        {tx.date || 'N/A'}
                      </td>

                      {/* Merchant & Description */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 800, color: 'var(--text-dark)' }}>
                          {tx.merchant || 'Unknown Merchant'}
                        </div>
                        {tx.raw_description && tx.raw_description !== tx.merchant && (
                          <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '220px', whiteSpace: 'nowrap' }}>
                            {tx.raw_description}
                          </div>
                        )}
                      </td>

                      {/* Category Badge */}
                      <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                        <span
                          style={{
                            fontSize: '0.725rem',
                            fontWeight: 700,
                            padding: '3px 10px',
                            borderRadius: 'var(--radius-pill)',
                            background: `${catColor}15`,
                            color: catColor,
                            border: `1px solid ${catColor}30`,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Tag size={10} /> {tx.category || 'Uncategorized'}
                        </span>
                      </td>

                      {/* Type Badge */}
                      <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                        <span
                          style={{
                            fontSize: '0.725rem',
                            fontWeight: 800,
                            padding: '3px 10px',
                            borderRadius: 'var(--radius-pill)',
                            background: isIncome ? '#d1fae5' : '#ffe4e6',
                            color: isIncome ? '#047857' : '#be123c',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          {isIncome ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                          {isIncome ? 'Income' : 'Expense'}
                        </span>
                      </td>

                      {/* Amount */}
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 800, fontSize: '0.9rem', color: isIncome ? '#047857' : 'var(--text-dark)' }} className="num-mono">
                        {isIncome ? '+' : '-'}{currency}{Math.abs(Number(tx.amount || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>

                      {/* Payment Method & Recurring */}
                      <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {tx.payment_method || 'Card'}
                          </span>
                          {tx.is_recurring && (
                            <span style={{ fontSize: '0.65rem', padding: '1px 5px', borderRadius: '4px', background: 'rgba(168, 85, 247, 0.12)', color: '#a855f7', fontWeight: 700 }} title="Recurring Payment">
                              <Repeat size={10} /> Rec
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Action Delete */}
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <button
                          onClick={() => deleteTransaction(txId)}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#cbd5e1', padding: '4px', borderRadius: '4px', transition: 'color 0.15s ease' }}
                          title="Remove Transaction"
                          className="hover-red"
                        >
                          <X size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
