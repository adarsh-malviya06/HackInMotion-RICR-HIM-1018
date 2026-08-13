/**
 * Budget Tools for AI Financial Agent
 * Evaluates category budgets, budget usage, and safe budget limit updates.
 */

export const get_budget_status = (context) => {
  const { budgets = [], transactions = [], currency = '$' } = context;
  const expenses = transactions.filter(t => t.type === 'expense');

  const budgetStatuses = budgets.map(b => {
    const spent = expenses
      .filter(t => t.category.toLowerCase() === b.category.toLowerCase())
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const limit = Number(b.monthly_limit || 0);
    const remaining = limit - spent;

    return {
      category: b.category,
      monthly_limit: Number(limit.toFixed(2)),
      spent: Number(spent.toFixed(2)),
      remaining: Number(remaining.toFixed(2)),
      percentage_used: limit > 0 ? Number(((spent / limit) * 100).toFixed(2)) : 0,
      status: spent > limit ? 'EXCEEDED' : spent > limit * 0.85 ? 'WARNING' : 'OK'
    };
  });

  return {
    budgets: budgetStatuses,
    total_budgeted_categories: budgets.length,
    currency
  };
};

export const get_category_budget = (context, { category }) => {
  const { budgets = [], transactions = [], currency = '$' } = context;

  if (!category) {
    return { error: 'Category parameter is required.', currency };
  }

  const budget = budgets.find(b => b.category.toLowerCase().includes(category.toLowerCase()));
  const expenses = transactions.filter(t => t.type === 'expense' && t.category.toLowerCase().includes(category.toLowerCase()));
  const spent = expenses.reduce((sum, t) => sum + Number(t.amount || 0), 0);

  if (!budget) {
    return {
      category,
      has_budget: false,
      amount_spent: Number(spent.toFixed(2)),
      message: `No budget limit set for category "${category}".`,
      currency
    };
  }

  const limit = Number(budget.monthly_limit || 0);
  return {
    category: budget.category,
    has_budget: true,
    monthly_limit: Number(limit.toFixed(2)),
    amount_spent: Number(spent.toFixed(2)),
    remaining: Number((limit - spent).toFixed(2)),
    percentage_used: limit > 0 ? Number(((spent / limit) * 100).toFixed(2)) : 0,
    currency
  };
};

export const set_budget = (context, { category, monthly_limit }) => {
  const { currency = '$' } = context;

  if (!category || monthly_limit === undefined || monthly_limit < 0) {
    return { error: 'Valid category and positive monthly_limit are required.', currency };
  }

  const limitNum = Number(monthly_limit);

  return {
    category,
    monthly_limit: Number(limitNum.toFixed(2)),
    action: 'SET_BUDGET_REQUESTED',
    message: `Proposed setting budget for "${category}" to ${currency}${limitNum.toFixed(2)}. Please confirm in the Budget Planner component.`,
    currency
  };
};
