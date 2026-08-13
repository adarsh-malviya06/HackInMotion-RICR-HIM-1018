/**
 * Subscription & Recurring Payment Tools for AI Financial Agent
 * Identifies recurring commitments and money leak points.
 */

export const detect_subscriptions = (context) => {
  const { transactions = [], currency = '$' } = context;
  const expenses = transactions.filter(t => t.type === 'expense');

  if (!expenses.length) {
    return { subscriptions: [], total_monthly_cost: 0, count: 0, currency };
  }

  // Detect subscriptions by category or recurring flag or merchant keywords
  const detected = expenses.filter(t => 
    t.is_recurring || 
    t.category === 'Subscriptions & Tech' ||
    /netflix|spotify|hulu|disney|apple|youtube|amazon prime|hbo|patreon|software|github|aws|adobe/i.test(`${t.merchant} ${t.raw_description}`)
  );

  const uniqueMap = {};
  detected.forEach(t => {
    const merchantKey = t.merchant || 'Unknown Merchant';
    if (!uniqueMap[merchantKey] || Number(t.amount) > uniqueMap[merchantKey].amount) {
      uniqueMap[merchantKey] = {
        merchant: merchantKey,
        amount: Number(t.amount || 0),
        category: t.category,
        billing_cycle: 'Monthly',
        notice: 'Recurring payment detected — consider reviewing whether you still use it.'
      };
    }
  });

  const subscriptionsList = Object.values(uniqueMap);
  const totalMonthlyCost = subscriptionsList.reduce((sum, s) => sum + s.amount, 0);

  return {
    subscriptions: subscriptionsList,
    count: subscriptionsList.length,
    total_monthly_cost: Number(totalMonthlyCost.toFixed(2)),
    projected_annual_cost: Number((totalMonthlyCost * 12).toFixed(2)),
    currency
  };
};

export const get_recurring_payments = (context) => {
  const { recurring = [], currency = '$' } = context;

  if (recurring.length > 0) {
    const total = recurring.reduce((sum, r) => sum + Number(r.amount || 0), 0);
    return {
      recurring_payments: recurring.map(r => ({
        merchant: r.merchant,
        amount: Number(Number(r.amount || 0).toFixed(2)),
        billing_cycle: r.billing_cycle || 'Monthly',
        status: r.status || 'Active',
        notice: 'Recurring payment detected — consider reviewing whether you still use it.'
      })),
      count: recurring.length,
      total_monthly_commitment: Number(total.toFixed(2)),
      currency
    };
  }

  return detect_subscriptions(context);
};
