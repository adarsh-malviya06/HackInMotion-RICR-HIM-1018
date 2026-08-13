/**
 * Simulation Tools for AI Financial Agent
 * Calculates projected savings and financial impact of hypothetical spending or budget changes.
 */

export const simulate_savings = (context, { category = 'Food & Dining', reduction_percentage = 50, monthly_amount } = {}) => {
  const { transactions = [], goals = [], currency = '$' } = context;
  const expenses = transactions.filter(t => t.type === 'expense');

  let baseMonthlySpend = 0;

  if (monthly_amount && Number(monthly_amount) > 0) {
    baseMonthlySpend = Number(monthly_amount);
  } else {
    const catExpenses = expenses.filter(t => 
      t.category.toLowerCase().includes(category.toLowerCase()) ||
      /food|delivery|doordash|ubereats|zomato|swiggy|restaurant/i.test(`${t.category} ${t.merchant}`)
    );
    baseMonthlySpend = catExpenses.reduce((sum, t) => sum + Number(t.amount || 0), 0);
    if (baseMonthlySpend === 0 && expenses.length > 0) {
      baseMonthlySpend = expenses.reduce((sum, t) => sum + Number(t.amount || 0), 0) * 0.25;
    }
  }

  const reductionPct = Math.min(100, Math.max(0, Number(reduction_percentage || 50)));
  const monthlySavings = baseMonthlySpend * (reductionPct / 100);
  const annualSavings = monthlySavings * 12;

  let goalImpact = null;
  if (goals.length > 0) {
    const primaryGoal = goals[0];
    const target = Number(primaryGoal.target_amount || 0);
    const current = Number(primaryGoal.current_amount || 0);
    const remaining = Math.max(0, target - current);
    
    if (remaining > 0 && monthlySavings > 0) {
      const monthsFaster = Number((remaining / monthlySavings).toFixed(1));
      goalImpact = {
        goal_name: primaryGoal.name,
        target_amount: target,
        months_to_reach_with_savings: monthsFaster
      };
    }
  }

  return {
    target_category: category,
    current_monthly_spend: Number(baseMonthlySpend.toFixed(2)),
    reduction_percentage: reductionPct,
    estimated_monthly_savings: Number(monthlySavings.toFixed(2)),
    estimated_annual_savings: Number(annualSavings.toFixed(2)),
    projected_1yr_investment_growth_at_7pct: Number((annualSavings * 1.07).toFixed(2)),
    goal_impact: goalImpact,
    currency
  };
};

export const simulate_budget_change = (context, { category, new_limit }) => {
  const { budgets = [], transactions = [], currency = '$' } = context;
  const expenses = transactions.filter(t => t.type === 'expense');

  if (!category || new_limit === undefined) {
    return { error: 'Category and new_limit parameters are required for budget simulation.', currency };
  }

  const catExpenses = expenses.filter(t => t.category.toLowerCase().includes(category.toLowerCase()));
  const currentSpent = catExpenses.reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const existingBudget = budgets.find(b => b.category.toLowerCase().includes(category.toLowerCase()));
  const oldLimit = existingBudget ? Number(existingBudget.monthly_limit || 0) : currentSpent;

  const newLimitNum = Number(new_limit);
  const limitDifference = oldLimit - newLimitNum;
  const projectMonthlyImpact = currentSpent > newLimitNum ? currentSpent - newLimitNum : 0;

  return {
    category,
    current_spent: Number(currentSpent.toFixed(2)),
    previous_limit: Number(oldLimit.toFixed(2)),
    new_limit: Number(newLimitNum.toFixed(2)),
    monthly_budget_change: Number(limitDifference.toFixed(2)),
    projected_monthly_savings_if_enforced: Number(projectMonthlyImpact.toFixed(2)),
    projected_annual_savings_if_enforced: Number((projectMonthlyImpact * 12).toFixed(2)),
    currency
  };
};
