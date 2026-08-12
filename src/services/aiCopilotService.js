// AI Financial Copilot Natural Language Query & Insights Processor

export const processCopilotQuery = (query, contextData) => {
  const { transactions = [], budgets = [], goals = [], recurring = [], healthScore = {}, currency = '$' } = contextData;
  const q = query.toLowerCase().trim();

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const netSavings = totalIncome - totalExpenses;

  // 1. Where am I spending the most / Category breakdown
  if (q.includes('where') || q.includes('spending most') || q.includes('biggest expense') || q.includes('top category')) {
    if (!transactions.length) {
      return {
        answer: `I don't see any transactions in your database yet. Upload a CSV file or add entries to analyze your top spending categories.`,
        action: 'ingest'
      };
    }

    const catTotals = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      catTotals[t.category] = (catTotals[t.category] || 0) + Number(t.amount);
    });

    const sortedCats = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);

    if (!sortedCats.length) {
      return { answer: `You haven't recorded any expenses yet! Total income is ${currency}${totalIncome.toFixed(2)}.` };
    }

    const [topCat, topAmount] = sortedCats[0];
    const topPct = totalExpenses > 0 ? Math.round((topAmount / totalExpenses) * 100) : 0;

    let responseText = `Your highest spending category is **${topCat}** at **${currency}${topAmount.toFixed(2)}** (${topPct}% of total expenses).\n\n`;
    responseText += `**Top Spending Summary:**\n`;
    sortedCats.slice(0, 4).forEach(([cat, amt]) => {
      const pct = Math.round((amt / totalExpenses) * 100);
      responseText += `• ${cat}: ${currency}${amt.toFixed(2)} (${pct}%)\n`;
    });

    return {
      answer: responseText,
      recommendation: topPct > 35 ? `Consider setting a budget cap on ${topCat} to protect your savings target.` : null
    };
  }

  // 2. Health score query
  if (q.includes('health') || q.includes('score') || q.includes('financial status')) {
    const score = healthScore.score || 50;
    const grade = healthScore.grade || 'C';
    const status = healthScore.status || 'Moderate';

    let answer = `Your Financial Health Score is currently **${score}/100** (Grade: **${grade}** - ${status}).\n\n`;
    answer += `• **Savings Rate:** ${healthScore.savingsRate || 0}%\n`;
    answer += `• **Subscription Ratio:** ${healthScore.subscriptionRatio || 0}%\n`;
    if (healthScore.insights && healthScore.insights.length) {
      answer += `\n**Key Insight:** ${healthScore.insights[0]}`;
    }

    return { answer };
  }

  // 3. Money Leaks / Subscriptions query
  if (q.includes('leak') || q.includes('subscription') || q.includes('recurring') || q.includes('waste')) {
    const subTotal = recurring.reduce((sum, r) => sum + Number(r.amount), 0);
    let answer = `I've analyzed your recurring expenses and subscriptions.\n\n`;
    answer += `• Active Recurring Subscriptions: **${recurring.length} items**\n`;
    answer += `• Total Monthly Commitment: **${currency}${subTotal.toFixed(2)}** (${currency}${(subTotal * 12).toFixed(2)}/year)\n\n`;

    if (recurring.length > 0) {
      answer += `**Subscriptions Tracked:**\n`;
      recurring.forEach(r => {
        answer += `• ${r.merchant}: ${currency}${Number(r.amount).toFixed(2)} (${r.billing_cycle || 'Monthly'})\n`;
      });
      answer += `\n*Tip: You can simulate cutting any subscription in the Subscriptions module to view instant projected savings.*`;
    } else {
      answer += `No recurring subscriptions detected yet. When you upload transactions, recurring items will automatically be flagged.`;
    }

    return { answer };
  }

  // 4. Save more money / Reach goal / Savings simulation
  if (q.includes('save') || q.includes('goal') || q.includes('cut') || q.includes('simulate')) {
    const potentialSubSavings = recurring.slice(0, 2).reduce((s, r) => s + Number(r.amount), 0);
    const estimatedMonthlyCut = 150 + potentialSubSavings;

    let answer = `Here is a personalized simulation to boost your savings:\n\n`;
    answer += `1. **Cut Non-Essential Spends by 15%**: Save ~${currency}${Math.round(totalExpenses * 0.15)}/mo\n`;
    answer += `2. **Optimize Subscriptions**: Save ~${currency}${potentialSubSavings.toFixed(2)}/mo\n\n`;
    answer += `**Combined 1-Year Wealth Projection:** If you invest this extra ${currency}${estimatedMonthlyCut.toFixed(2)}/mo at 7% return, you will gain **${currency}${(estimatedMonthlyCut * 12 * 1.07).toFixed(2)}** in 12 months!`;

    return { answer };
  }

  // Generic intelligent overview
  let answer = `Here is your current financial snapshot based on your database:\n\n`;
  answer += `• **Total Inflow (Income):** ${currency}${totalIncome.toFixed(2)}\n`;
  answer += `• **Total Outflow (Expenses):** ${currency}${totalExpenses.toFixed(2)}\n`;
  answer += `• **Net Cashflow:** ${currency}${netSavings.toFixed(2)}\n`;
  answer += `• **Recorded Transactions:** ${transactions.length} entries\n\n`;
  answer += `Feel free to ask me specifically about top spending, health score, money leaks, or how to reach your savings goals!`;

  return { answer };
};
