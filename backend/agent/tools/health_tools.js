/**
 * Financial Health Tools for AI Financial Agent
 * Evaluates savings rate, budget adherence, subscription ratio, and health score factors.
 */

export const get_financial_health = (context) => {
  const { healthScore = {}, transactions = [], currency = '$' } = context;

  // Compute fallback or use existing healthScore structure
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const savingsRate = healthScore.savingsRate !== undefined
    ? healthScore.savingsRate
    : (totalIncome > 0 ? Math.max(0, Math.round(((totalIncome - totalExpense) / totalIncome) * 100)) : 0);

  const subscriptionRatio = healthScore.subscriptionRatio !== undefined
    ? healthScore.subscriptionRatio
    : 0;

  return {
    score: healthScore.score || 50,
    grade: healthScore.grade || 'C',
    status: healthScore.status || 'Moderate',
    savings_rate: savingsRate,
    subscription_ratio: subscriptionRatio,
    total_income: Number(totalIncome.toFixed(2)),
    total_expense: Number(totalExpense.toFixed(2)),
    breakdown: healthScore.breakdown || { savingsScore: 20, subScore: 15, budgetScore: 15 },
    insights: healthScore.insights || ['Record your income and expenses to calculate your health score.'],
    currency
  };
};

export const get_health_factors = (context) => {
  const { transactions = [], budgets = [], currency = '$' } = context;
  const health = get_financial_health(context);

  const factors = [];
  
  if (health.savings_rate >= 20) {
    factors.push({ factor: 'Savings Rate', impact: 'Positive', detail: `Strong ${health.savings_rate}% savings rate.` });
  } else {
    factors.push({ factor: 'Savings Rate', impact: 'Negative', detail: `Savings rate is ${health.savings_rate}%, below recommended 20% target.` });
  }

  if (health.subscription_ratio > 20) {
    factors.push({ factor: 'Subscriptions', impact: 'Negative', detail: `Subscriptions consume ${health.subscription_ratio}% of monthly budget.` });
  } else {
    factors.push({ factor: 'Subscriptions', impact: 'Positive', detail: `Controlled subscription usage at ${health.subscription_ratio}%.` });
  }

  if (budgets.length) {
    let overBudgetCount = 0;
    budgets.forEach(b => {
      const spent = transactions
        .filter(t => t.type === 'expense' && t.category === b.category)
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);
      if (spent > Number(b.monthly_limit)) overBudgetCount++;
    });
    if (overBudgetCount > 0) {
      factors.push({ factor: 'Budget Adherence', impact: 'Negative', detail: `${overBudgetCount} budget categories exceeded limit.` });
    } else {
      factors.push({ factor: 'Budget Adherence', impact: 'Positive', detail: 'All active budgets are within limits.' });
    }
  }

  return {
    score: health.score,
    grade: health.grade,
    status: health.status,
    key_factors: factors,
    currency
  };
};

export const get_savings_rate = (context) => {
  const { transactions = [], currency = '$' } = context;

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? Number(((netSavings / totalIncome) * 100).toFixed(2)) : 0;

  return {
    total_income: Number(totalIncome.toFixed(2)),
    total_expenses: Number(totalExpenses.toFixed(2)),
    net_savings: Number(netSavings.toFixed(2)),
    savings_rate_percent: savingsRate,
    target_savings_rate_percent: 20,
    is_meeting_target: savingsRate >= 20,
    currency
  };
};

export const get_budget_adherence = (context) => {
  const { budgets = [], transactions = [], currency = '$' } = context;

  if (!budgets.length) {
    return { message: 'No budget limits configured yet.', budget_count: 0, currency };
  }

  const results = budgets.map(b => {
    const spent = transactions
      .filter(t => t.type === 'expense' && t.category === b.category)
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const limit = Number(b.monthly_limit || 0);
    const variance = limit - spent;
    const isOver = spent > limit;

    return {
      category: b.category,
      limit: Number(limit.toFixed(2)),
      spent: Number(spent.toFixed(2)),
      remaining: Number(variance.toFixed(2)),
      is_over_budget: isOver,
      usage_percent: limit > 0 ? Number(((spent / limit) * 100).toFixed(2)) : 0
    };
  });

  const totalLimit = budgets.reduce((sum, b) => sum + Number(b.monthly_limit || 0), 0);
  const totalSpentBudgets = results.reduce((sum, r) => sum + r.spent, 0);

  return {
    budgets: results,
    total_budget_limit: Number(totalLimit.toFixed(2)),
    total_budget_spent: Number(totalSpentBudgets.toFixed(2)),
    overall_adherence_percent: totalLimit > 0 ? Number(((totalSpentBudgets / totalLimit) * 100).toFixed(2)) : 0,
    over_budget_count: results.filter(r => r.is_over_budget).length,
    currency
  };
};
