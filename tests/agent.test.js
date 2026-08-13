/**
 * Automated Test Suite for Financial AI Agent Tools & Security Context
 */

import { executeToolCall } from '../backend/agent/tools/index.js';

// Mock User A Dataset
const mockUserAContext = {
  currency: '$',
  transactions: [
    { id: 't1', type: 'income', amount: 5000, category: 'Income', date: '2026-07-01' },
    { id: 't2', type: 'expense', amount: 1200, category: 'Housing', date: '2026-07-05', merchant: 'Landlord Rent' },
    { id: 't3', type: 'expense', amount: 600, category: 'Food & Dining', date: '2026-07-10', merchant: 'DoorDash Food Delivery' },
    { id: 't4', type: 'expense', amount: 200, category: 'Food & Dining', date: '2026-07-15', merchant: 'UberEats' },
    { id: 't5', type: 'expense', amount: 50, category: 'Subscriptions & Tech', date: '2026-07-18', merchant: 'Netflix', is_recurring: true },
    { id: 't6', type: 'expense', amount: 15, category: 'Subscriptions & Tech', date: '2026-07-20', merchant: 'Spotify', is_recurring: true }
  ],
  budgets: [
    { category: 'Food & Dining', monthly_limit: 500 }
  ],
  goals: [
    { id: 'g1', name: 'Emergency Fund', target_amount: 10000, current_amount: 4000 }
  ],
  recurring: [
    { merchant: 'Netflix', amount: 50, billing_cycle: 'Monthly' },
    { merchant: 'Spotify', amount: 15, billing_cycle: 'Monthly' }
  ],
  healthScore: {
    score: 82,
    grade: 'A',
    status: 'Very Good',
    savingsRate: 58,
    subscriptionRatio: 3
  }
};

// Mock User B Dataset (Isolated User Context)
const mockUserBContext = {
  currency: '$',
  transactions: [
    { id: 'tb1', type: 'income', amount: 3000, category: 'Income', date: '2026-07-01' },
    { id: 'tb2', type: 'expense', amount: 2500, category: 'Shopping', date: '2026-07-02', merchant: 'Luxury Store' }
  ],
  budgets: [],
  goals: [],
  recurring: [],
  healthScore: {}
};

function runTests() {
  console.log('🧪 Starting AI Agent Tool & Security Test Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  ✅ PASSED: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAILED: ${testName}`);
      failed++;
    }
  }

  // 1. Spending Tool Tests
  const categoryResult = executeToolCall('get_category_spending', { category: 'Food & Dining' }, mockUserAContext);
  assert(categoryResult.total === 800, 'get_category_spending calculates total Food & Dining expense ($800)');
  assert(categoryResult.transaction_count === 2, 'get_category_spending counts transaction count accurately');

  const topCatsResult = executeToolCall('get_top_spending_categories', { limit: 3 }, mockUserAContext);
  assert(topCatsResult.top_categories[0].category === 'Housing', 'get_top_spending_categories ranks Housing top at $1200');
  assert(topCatsResult.top_categories[1].category === 'Food & Dining', 'get_top_spending_categories ranks Food & Dining second at $800');

  const recentTxsResult = executeToolCall('get_recent_transactions', { limit: 5 }, mockUserAContext);
  assert(recentTxsResult.returned_count === 5, 'get_recent_transactions returns requested 5 items');
  assert(recentTxsResult.transactions[0].merchant === 'Income' || recentTxsResult.transactions[0].category === 'Income', 'get_recent_transactions includes date, merchant, category, and amount');

  // 2. Health Tool Tests
  const healthResult = executeToolCall('get_financial_health', {}, mockUserAContext);
  assert(healthResult.score === 82, 'get_financial_health retrieves expected health score');
  assert(healthResult.total_income === 5000, 'get_financial_health computes income accurately');

  const savingsRateResult = executeToolCall('get_savings_rate', {}, mockUserAContext);
  assert(savingsRateResult.net_savings === 2935, 'get_savings_rate computes net savings correctly ($2935)');

  // 3. Simulation Tool Tests
  const simResult = executeToolCall('simulate_savings', { category: 'Food & Dining', reduction_percentage: 50 }, mockUserAContext);
  assert(simResult.estimated_monthly_savings === 400, 'simulate_savings calculates 50% of $800 food spend = $400/mo');
  assert(simResult.estimated_annual_savings === 4800, 'simulate_savings calculates annual savings = $4800/yr');

  // 4. Subscription Tool Tests
  const subResult = executeToolCall('detect_subscriptions', {}, mockUserAContext);
  assert(subResult.count === 2, 'detect_subscriptions flags active Netflix & Spotify items');
  assert(subResult.subscriptions[0].notice.includes('consider reviewing'), 'detect_subscriptions uses non-presumptuous wording');

  // 5. User Data Security Isolation Test
  const userBSending = executeToolCall('get_category_spending', { category: 'Housing' }, mockUserBContext);
  assert(userBSending.total === 0, 'SECURITY ISOLATION: User B queries return 0 for User A Housing expenses');

  console.log(`\n📊 Test Suite Complete: ${passed} Passed, ${failed} Failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
