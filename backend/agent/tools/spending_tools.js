/**
 * Spending Tools for AI Financial Agent
 * Calculates spending statistics strictly from user transaction data.
 */

export const get_category_spending = (context, { category, period } = {}) => {
  const { transactions = [], currency = '$' } = context;
  const expenses = transactions.filter(t => t.type === 'expense');

  if (!expenses.length) {
    return {
      category: category || 'All',
      period: period || 'All Time',
      total: 0,
      count: 0,
      currency,
      message: 'No expense transactions recorded in dataset.'
    };
  }

  let filtered = expenses;
  if (category && category.toLowerCase() !== 'all') {
    filtered = expenses.filter(t => t.category.toLowerCase().includes(category.toLowerCase()));
  }

  const total = filtered.reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const totalExpenseAll = expenses.reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const percentageOfTotal = totalExpenseAll > 0 ? Number(((total / totalExpenseAll) * 100).toFixed(2)) : 0;

  return {
    category: category || 'All Categories',
    period: period || 'All Time',
    total: Number(total.toFixed(2)),
    transaction_count: filtered.length,
    percentage_of_total_expenses: percentageOfTotal,
    currency
  };
};

export const compare_monthly_spending = (context) => {
  const { transactions = [], currency = '$' } = context;
  const expenses = transactions.filter(t => t.type === 'expense');

  if (!expenses.length) {
    return { message: 'Insufficient transaction data to calculate monthly comparison.', currency };
  }

  const monthMap = {};
  expenses.forEach(t => {
    const monthKey = t.date ? t.date.substring(0, 7) : 'Unknown';
    monthMap[monthKey] = (monthMap[monthKey] || 0) + Number(t.amount || 0);
  });

  const sortedMonths = Object.keys(monthMap).sort();
  const monthlyData = sortedMonths.map(m => ({
    month: m,
    total: Number(monthMap[m].toFixed(2))
  }));

  let changePercent = 0;
  let recentMonth = null;
  let previousMonth = null;

  if (monthlyData.length >= 2) {
    recentMonth = monthlyData[monthlyData.length - 1];
    previousMonth = monthlyData[monthlyData.length - 2];
    if (previousMonth.total > 0) {
      changePercent = Number((((recentMonth.total - previousMonth.total) / previousMonth.total) * 100).toFixed(2));
    }
  }

  return {
    monthly_totals: monthlyData,
    recent_month: recentMonth,
    previous_month: previousMonth,
    change_percent: changePercent,
    trend: changePercent > 0 ? 'increased' : changePercent < 0 ? 'decreased' : 'stable',
    currency
  };
};

export const get_top_spending_categories = (context, { limit = 5 } = {}) => {
  const { transactions = [], currency = '$' } = context;
  const expenses = transactions.filter(t => t.type === 'expense');

  if (!expenses.length) {
    return { top_categories: [], total_expenses: 0, currency };
  }

  const catTotals = {};
  expenses.forEach(t => {
    const cat = t.category || 'Uncategorized';
    catTotals[cat] = (catTotals[cat] || 0) + Number(t.amount || 0);
  });

  const totalExpense = expenses.reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const sorted = Object.entries(catTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([category, amount]) => ({
      category,
      amount: Number(amount.toFixed(2)),
      percentage: totalExpense > 0 ? Number(((amount / totalExpense) * 100).toFixed(2)) : 0
    }));

  return {
    top_categories: sorted,
    total_expenses: Number(totalExpense.toFixed(2)),
    currency
  };
};

export const get_top_merchants = (context, { limit = 5 } = {}) => {
  const { transactions = [], currency = '$' } = context;
  const expenses = transactions.filter(t => t.type === 'expense');

  if (!expenses.length) {
    return { top_merchants: [], currency };
  }

  const merchantTotals = {};
  const merchantCounts = {};

  expenses.forEach(t => {
    const m = t.merchant || 'Unknown Merchant';
    merchantTotals[m] = (merchantTotals[m] || 0) + Number(t.amount || 0);
    merchantCounts[m] = (merchantCounts[m] || 0) + 1;
  });

  const sorted = Object.entries(merchantTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([merchant, total]) => ({
      merchant,
      total_spent: Number(total.toFixed(2)),
      transaction_count: merchantCounts[merchant]
    }));

  return {
    top_merchants: sorted,
    currency
  };
};

export const get_transaction_summary = (context) => {
  const { transactions = [], currency = '$' } = context;

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const netSavings = totalIncome - totalExpenses;

  return {
    total_income: Number(totalIncome.toFixed(2)),
    total_expenses: Number(totalExpenses.toFixed(2)),
    net_savings: Number(netSavings.toFixed(2)),
    transaction_count: transactions.length,
    currency
  };
};
