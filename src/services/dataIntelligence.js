// Data Intelligence & Algorithmic Cleaning Engine for Finova

// 1. Merchant Normalization Map & Regex Cleaners
const MERCHANT_PATTERNS = [
  { pattern: /amzn|amazon|mktp/i, name: 'Amazon' },
  { pattern: /flipkart|myntra|ajio|meesho/i, name: 'Shopping Platform' },
  { pattern: /uber|lyft|grab|cab|ola|rapido/i, name: 'Ride Share' },
  { pattern: /starbucks|dunkin|costa|coffee/i, name: 'Starbucks' },
  { pattern: /swiggy|zomato|doordash|ubereats|grubhub/i, name: 'Food Delivery' },
  { pattern: /zepto|blinkit|instamart|bigbasket|dmart|jiomart/i, name: 'Quick Commerce Groceries' },
  { pattern: /netflix|hulu|disney|spotify|apple\.com\/bill|hbo|hotstar|prime video/i, name: 'Subscription Service' },
  { pattern: /walmart|target|costco|kroger|safeway|trader joe|whole foods/i, name: 'Groceries' },
  { pattern: /shell|chevron|exxon|bp|gas|fuel|bpcl|hpcl|iocl/i, name: 'Fuel Station' },
  { pattern: /payroll|salary|direct dep|stripe|payout/i, name: 'Payroll / Salary' },
  { pattern: /irctc|air india|indigo|akasa|spicejet|vistara/i, name: 'Travel Booking' },
  { pattern: /apollo|pharmacy|pharmeasy|netmeds|1mg/i, name: 'Healthcare / Pharmacy' },
  { pattern: /lic\b|hdfc life|icici lombard|policybazaar/i, name: 'Insurance Provider' }
];

export const normalizeMerchantName = (rawStr) => {
  if (!rawStr) return 'Unknown Merchant';
  
  const clean = String(rawStr)
    .trim()
    .replace(/^SQ\s*\*|^TST\s*\*|^PAYPAL\s*\*/i, '') // strip payment gateway prefixes
    .replace(/\*.*$/, '') // strip trailing transaction IDs after asterisk
    .replace(/#\d+/g, '') // strip order numbers
    .replace(/\s+[A-Z]{2}\s+\d{5}$/, '') // strip state/zip codes
    .replace(/\s+/g, ' ');

  for (const item of MERCHANT_PATTERNS) {
    if (item.pattern.test(clean)) {
      return item.name;
    }
  }

  // Capitalize words nicely
  return clean.split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
};

// 2. Smart Auto-Categorization Algorithm
export const autoCategorize = (merchant, description = '', amount = 0, type = 'expense') => {
  const normType = String(type || '').toLowerCase();
  const text = `${merchant || ''} ${description || ''}`.toLowerCase();

  // Income category rules
  if (normType === 'income' || Number(amount) < 0) {
    if (/salary|payroll|direct dep|wages|stipend|employer|company payout/i.test(text)) {
      return 'Salary / Income';
    }
    return 'Other Income';
  }

  // Expense category rules
  if (/swiggy|zomato|starbucks|dunkin|mcdonald|kfc|dominos|pizza|burger|restaurant|cafe|coffee|diner|bistro|food|dining|eat|pub|bar|bakery|subway|taco bell|chipotle/i.test(text)) {
    return 'Food & Dining';
  }

  if (/zepto|blinkit|instamart|bigbasket|dmart|jiomart|grocery|groceries|supermarket|walmart|target|trader joe|kroger|costco|whole foods|market|fruits|vegetable|dairy|milk|bakers/i.test(text)) {
    return 'Groceries';
  }

  if (/amazon|amzn|flipkart|myntra|ajio|meesho|zara|nike|adidas|puma|decathlon|shop|shopping|store|mall|clothing|apparel|electronics|fashion|retail|uniqlo|h&m/i.test(text)) {
    return 'Shopping';
  }

  if (/rent|landlord|lease|property|housing|flat|maintenance fee|real estate|mortgage|apartment/i.test(text)) {
    return 'Rent & Housing';
  }

  if (/electric|electricity|power|water bill|gas bill|utility|utilities|broadband|wifi|jio fiber|airtel|vodafone|vi\b|bsnl|tata play|dth|bill pay|piped gas|bescom|mseb/i.test(text)) {
    return 'Bills & Utilities';
  }

  if (/uber|ola|rapido|taxi|cab|auto|metro|transit|fuel|petrol|diesel|gas station|shell|bpcl|hpcl|iocl|parking|toll|fastag|bus ticket/i.test(text)) {
    return 'Transportation';
  }

  if (/irctc|railway|train|flight|airline|air india|indigo|akasa|spicejet|vistara|makemytrip|cleartrip|yatra|goibibo|hotel|resort|airbnb|stay|boarding/i.test(text)) {
    return 'Travel';
  }

  if (/bookmyshow|pvr|inox|cinema|movie|theater|gaming|playstation|xbox|steam|event|concert|amusement|park/i.test(text)) {
    return 'Entertainment';
  }

  if (/netflix|spotify|hotstar|disney|hulu|youtube|apple\.com|google play|prime video|patreon|software|github|aws|digitalocean|adobe|open ai|chatgpt|midjourney|linkedin|cloud|saas/i.test(text)) {
    return 'Subscriptions & Tech';
  }

  if (/apollo|pharmacy|pharmeasy|netmeds|1mg|hospital|clinic|doctor|dental|dentist|health|lab|diagnostic|medicine|medical|cvs|walgreens/i.test(text)) {
    return 'Healthcare';
  }

  if (/college|university|school|tuition|fees|coursera|udemy|edx|unacademy|byjus|coaching|books|exam|test series|academy|institution/i.test(text)) {
    return 'Education';
  }

  if (/salon|spa|barber|cosmetics|nykaa|parlor|grooming|beauty|skincare|haircut/i.test(text)) {
    return 'Personal Care';
  }

  if (/zerodha|groww|upstox|coin|mutual fund|sip|stocks|equity|vanguard|fidelity|robinhood|crypto|coindcx|binance|gold|bonds|investment/i.test(text)) {
    return 'Investments';
  }

  if (/lic\b|hdfc life|icici lombard|max life|sbi life|insurance|policy|premium|policybazaar|health insurance|term insurance/i.test(text)) {
    return 'Insurance';
  }

  return 'Other';
};

// 3. Deduplication Algorithm
export const detectDuplicates = (transactions = []) => {
  const duplicates = [];
  const visited = new Set();

  for (let i = 0; i < transactions.length; i++) {
    if (visited.has(transactions[i].id)) continue;

    for (let j = i + 1; j < transactions.length; j++) {
      if (visited.has(transactions[j].id)) continue;

      const t1 = transactions[i];
      const t2 = transactions[j];

      const sameAmount = Math.abs(Number(t1.amount) - Number(t2.amount)) < 0.01;
      const sameType = t1.type === t2.type;
      
      const d1 = new Date(t1.date);
      const d2 = new Date(t2.date);
      const diffDays = Math.abs((d1 - d2) / (1000 * 60 * 60 * 24));
      
      const m1 = (t1.merchant || '').toLowerCase();
      const m2 = (t2.merchant || '').toLowerCase();
      const similarMerchant = m1.includes(m2) || m2.includes(m1);

      if (sameAmount && sameType && diffDays <= 2 && similarMerchant) {
        duplicates.push({ primary: t1, duplicate: t2, confidence: diffDays === 0 ? 'High' : 'Medium' });
        visited.add(t2.id);
      }
    }
  }

  return duplicates;
};

// 4. Financial Health Score Calculator (0 - 100)
export const calculateHealthScore = (transactions = [], budgets = [], monthlyIncomeTarget = 5000) => {
  if (!transactions.length) {
    return {
      score: 50,
      grade: 'C',
      status: 'Needs Data',
      savingsRate: 0,
      subscriptionRatio: 0,
      budgetAdherence: 100,
      breakdown: { savingsScore: 20, subscriptionScore: 15, budgetScore: 15 },
      insights: ['Upload your CSV transactions or add entries manually to calculate your real Financial Health Score.']
    };
  }

  let totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // If no explicit income logged, dynamically estimate baseline from expense volume
  if (totalIncome === 0) {
    totalIncome = totalExpense > 0 ? Math.max(totalExpense * 1.2, Number(monthlyIncomeTarget) || 3000) : (Number(monthlyIncomeTarget) || 3000);
  }

  const netSavings = Math.max(0, totalIncome - totalExpense);
  const savingsRate = Math.min(100, Math.round((netSavings / totalIncome) * 100));

  // Subscriptions ratio
  const subExpense = transactions
    .filter(t => t.type === 'expense' && (t.is_recurring || t.category === 'Subscriptions & Tech'))
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const subscriptionRatio = Math.round((subExpense / totalExpense) * 100) || 0;

  // Budget Adherence Score
  let budgetScore = 25;
  if (budgets.length) {
    let passedBudgets = 0;
    budgets.forEach(b => {
      const catSpent = transactions
        .filter(t => t.type === 'expense' && t.category === b.category)
        .reduce((sum, t) => sum + Number(t.amount), 0);
      if (catSpent <= Number(b.monthly_limit)) passedBudgets++;
    });
    budgetScore = Math.round((passedBudgets / budgets.length) * 25);
  }

  // Savings score (Max 40)
  const savingsScore = Math.min(40, Math.round((savingsRate / 30) * 40));

  // Subscription score (Max 20, penalty if > 15% of expenses)
  let subScore = 20;
  if (subscriptionRatio > 25) subScore = 5;
  else if (subscriptionRatio > 15) subScore = 12;

  // Stability / Volatility Score (Max 15)
  const stabilityScore = 15;

  const score = Math.min(100, Math.max(0, savingsScore + subScore + budgetScore + stabilityScore));

  let grade = 'A+';
  let status = 'Excellent';
  if (score < 40) { grade = 'D'; status = 'Critical'; }
  else if (score < 60) { grade = 'C'; status = 'Fair'; }
  else if (score < 75) { grade = 'B'; status = 'Good'; }
  else if (score < 90) { grade = 'A'; status = 'Very Good'; }

  const insights = [];
  if (savingsRate < 20) insights.push(`Your savings rate is ${savingsRate}%. Target at least 20% to build emergency cushion.`);
  if (subscriptionRatio > 15) insights.push(`Subscriptions consume ${subscriptionRatio}% of your expenses. Consider auditing unneeded recurring tools.`);
  if (totalExpense > totalIncome) insights.push(`Warning: Total expenses exceed income by ₹${(totalExpense - totalIncome).toFixed(2)}.`);
  if (insights.length === 0) insights.push(`Great job! You maintain a strong ${savingsRate}% savings rate with balanced spending.`);

  return {
    score,
    grade,
    status,
    savingsRate,
    subscriptionRatio,
    totalIncome,
    totalExpense,
    breakdown: { savingsScore, subScore, budgetScore, stabilityScore },
    insights
  };
};

// 5. Anomaly Detector
export const detectAnomalies = (transactions = []) => {
  const anomalies = [];
  const expenses = transactions.filter(t => t.type === 'expense');

  if (!expenses.length) return [];

  // Group by category to find average and standard deviation
  const catMap = {};
  expenses.forEach(t => {
    if (!catMap[t.category]) catMap[t.category] = [];
    catMap[t.category].push(Number(t.amount));
  });

  const catStats = {};
  Object.keys(catMap).forEach(cat => {
    const amounts = catMap[cat];
    const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    catStats[cat] = { avg, count: amounts.length };
  });

  expenses.forEach(t => {
    const amount = Number(t.amount);
    const stats = catStats[t.category];

    // Spike condition: > 2.5x category average (when category has > 2 items) and amount > 50
    if (stats && stats.count >= 3 && amount > stats.avg * 2.5 && amount > 50) {
      anomalies.push({
        transaction: t,
        reason: `Unusual amount: ₹${amount.toFixed(2)} is ${Math.round(amount / stats.avg)}x higher than category average (₹${stats.avg.toFixed(2)})`,
        severity: amount > stats.avg * 4 ? 'High' : 'Medium'
      });
    }
  });

  return anomalies;
};

// 6. Money Leak Detector
export const detectMoneyLeaks = (transactions = []) => {
  const leaks = [];
  const expenses = transactions.filter(t => t.type === 'expense');

  if (!expenses.length) return [];

  // Micro-transaction frequency (Coffee, quick bites, small impulse purchases < ₹15)
  const microPurchases = expenses.filter(t => Number(t.amount) > 2 && Number(t.amount) <= 15);
  const microTotal = microPurchases.reduce((sum, t) => sum + Number(t.amount), 0);

  if (microPurchases.length >= 5) {
    leaks.push({
      id: 'micro_spend',
      title: 'High Micro-Spending Frequency',
      type: 'Impulse / Daily Habits',
      count: microPurchases.length,
      monthlyImpact: microTotal,
      description: `Found ${microPurchases.length} small purchases (under ₹15) adding up to ₹${microTotal.toFixed(2)}. Small daily expenses like coffee or fast snacks drain cash flow fast.`,
      recommendation: 'Set a weekly cash allowance for micro-purchases to cap passive drain.',
      savingsPotential: Math.round(microTotal * 0.5)
    });
  }

  // Food Delivery Overuse
  const deliveryOps = expenses.filter(t => 
    /doordash|ubereats|grubhub|swiggy|zomato/i.test(`${t.merchant} ${t.raw_description}`)
  );
  if (deliveryOps.length >= 3) {
    const deliveryTotal = deliveryOps.reduce((sum, t) => sum + Number(t.amount), 0);
    leaks.push({
      id: 'food_delivery',
      title: 'Food Delivery Service Fees',
      type: 'Convenience Premium',
      count: deliveryOps.length,
      monthlyImpact: deliveryTotal,
      description: `${deliveryOps.length} food delivery transactions totaled ₹${deliveryTotal.toFixed(2)}. Delivery service fees and markups add 30-40% over dining in or picking up.`,
      recommendation: 'Switch 50% of food delivery orders to direct pickup.',
      savingsPotential: Math.round(deliveryTotal * 0.35)
    });
  }

  // Overlapping Subscriptions
  const subOps = expenses.filter(t => t.is_recurring || t.category === 'Subscriptions & Tech');
  const subTotal = subOps.reduce((sum, t) => sum + Number(t.amount), 0);
  if (subOps.length >= 4) {
    leaks.push({
      id: 'sub_stack',
      title: 'Subscription Stack Bloat',
      type: 'Recurring Commitments',
      count: subOps.length,
      monthlyImpact: subTotal,
      description: `You have ${subOps.length} active software/media subscriptions burning ₹${subTotal.toFixed(2)} monthly (₹${(subTotal * 12).toFixed(2)}/yr).`,
      recommendation: 'Rotate streaming services month-by-month instead of maintaining all concurrently.',
      savingsPotential: Math.round(subTotal * 0.4)
    });
  }

  return leaks;
};

// 7. Month-over-Month Category Trend Analytics
export const calculateCategoryTrends = (transactions = []) => {
  if (!transactions || !transactions.length) return [];

  const monthCatMap = {};
  const allMonths = new Set();

  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      const dateStr = t.date || new Date().toISOString().split('T')[0];
      const monthKey = dateStr.slice(0, 7);
      allMonths.add(monthKey);

      if (!monthCatMap[monthKey]) monthCatMap[monthKey] = {};
      const cat = t.category || 'Other';
      monthCatMap[monthKey][cat] = (monthCatMap[monthKey][cat] || 0) + Number(t.amount);
    });

  const sortedMonths = Array.from(allMonths).sort();
  if (sortedMonths.length === 0) return [];

  if (sortedMonths.length < 2) {
    const currentMonth = sortedMonths[0];
    const catTotals = monthCatMap[currentMonth] || {};
    return Object.keys(catTotals).map(cat => ({
      category: cat,
      currentMonthSpent: catTotals[cat],
      previousMonthSpent: 0,
      percentChange: 0,
      trendText: `${cat}: ₹${catTotals[cat].toFixed(2)} recorded this month`
    }));
  }

  const currMonthKey = sortedMonths[sortedMonths.length - 1];
  const prevMonthKey = sortedMonths[sortedMonths.length - 2];

  const currCatTotals = monthCatMap[currMonthKey] || {};
  const prevCatTotals = monthCatMap[prevMonthKey] || {};

  const allCategories = new Set([...Object.keys(currCatTotals), ...Object.keys(prevCatTotals)]);
  const trends = [];

  allCategories.forEach(cat => {
    const currSpent = currCatTotals[cat] || 0;
    const prevSpent = prevCatTotals[cat] || 0;

    let percentChange = 0;
    let trendText = '';

    if (prevSpent > 0) {
      percentChange = Math.round(((currSpent - prevSpent) / prevSpent) * 100);
      if (percentChange > 0) {
        trendText = `${cat} spending increased by ${percentChange}% compared to last month`;
      } else if (percentChange < 0) {
        trendText = `${cat} spending decreased by ${Math.abs(percentChange)}% compared to last month`;
      } else {
        trendText = `${cat} spending remained unchanged compared to last month`;
      }
    } else if (currSpent > 0) {
      trendText = `${cat}: ₹${currSpent.toFixed(2)} spent this month (new category spending)`;
    }

    trends.push({
      category: cat,
      currentMonthSpent: currSpent,
      previousMonthSpent: prevSpent,
      percentChange,
      trendText
    });
  });

  return trends.sort((a, b) => b.currentMonthSpent - a.currentMonthSpent);
};

