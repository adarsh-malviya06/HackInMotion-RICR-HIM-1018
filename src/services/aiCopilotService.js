/**
 * AI Financial Copilot Client Service
 * Routes queries to backend Groq Agent API (/api/agent/chat) with local fallback capability.
 */

export const processCopilotQueryAsync = async (query, contextData, history = []) => {
  try {
    const response = await fetch('/api/agent/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: query,
        context: {
          transactions: contextData.transactions || [],
          budgets: contextData.budgets || [],
          goals: contextData.goals || [],
          recurring: contextData.recurring || [],
          healthScore: contextData.healthScore || {},
          currency: contextData.currency || '$'
        },
        history
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.answer) {
        return {
          answer: data.answer,
          tools_used: data.tools_used || [],
          grounded: true
        };
      }
    }
  } catch (error) {
    console.warn('Backend Agent Server request failed, switching to local calculation engine fallback:', error.message);
  }

  // Local fallback execution engine if backend endpoint is unreachable
  return processCopilotQueryLocal(query, contextData);
};

// Synchronous local fallback engine
export const processCopilotQueryLocal = (query, contextData) => {
  const { transactions = [], recurring = [], healthScore = {}, currency = '$' } = contextData;
  const q = query.toLowerCase().trim();

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const netSavings = totalIncome - totalExpenses;

  // 0. Show / List transactions query
  if (q.includes('show') || q.includes('list') || q.includes('transaction') || q.includes('first') || q.includes('recent')) {
    if (!transactions.length) {
      return {
        answer: `I don't see any transactions in your database yet. Upload a bank CSV file or add entries manually to view them here.`
      };
    }

    const matchLimit = q.match(/\b(\d+)\b/);
    const limit = matchLimit ? Math.min(20, parseInt(matchLimit[1], 10)) : 10;
    const sliceList = transactions.slice(0, limit);

    let answer = `Here are the first **${sliceList.length}** transactions from your database (Total: **${transactions.length}**):\n\n`;
    sliceList.forEach((t, idx) => {
      const amtStr = `${currency}${Number(t.amount || 0).toFixed(2)}`;
      const typeBadge = t.type === 'income' ? '🟢 Inflow' : '🔴 Outflow';
      answer += `${idx + 1}. **${t.merchant || 'Merchant'}** — ${amtStr} (${t.category || 'Category'}) • *${t.date || 'N/A'}* [${typeBadge}]\n`;
    });

    return { answer };
  }

  // 1. Top spending categories query
  if (q.includes('where') || q.includes('spending most') || q.includes('biggest expense') || q.includes('top category')) {
    if (!transactions.length) {
      return {
        answer: `I don't see any transactions in your database yet. Upload a CSV file or add entries to analyze your top spending categories.`
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
      answer += `\n*Recurring payment detected — consider reviewing whether you still use it.*`;
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

export const processCopilotQuery = (query, contextData) => {
  return processCopilotQueryLocal(query, contextData);
};
