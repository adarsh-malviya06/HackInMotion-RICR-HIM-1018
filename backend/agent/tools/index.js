/**
 * Central Tool Registry & Handler Router for AI Financial Agent
 * Maps Groq function definitions to modular tool execution functions.
 */

import {
  get_category_spending,
  compare_monthly_spending,
  get_top_spending_categories,
  get_top_merchants,
  get_transaction_summary,
  get_recent_transactions
} from './spending_tools.js';

import {
  get_financial_health,
  get_health_factors,
  get_savings_rate,
  get_budget_adherence
} from './health_tools.js';

import {
  get_budget_status,
  get_category_budget,
  set_budget
} from './budget_tools.js';

import {
  get_savings_goals,
  get_goal_progress
} from './goal_tools.js';

import {
  detect_subscriptions,
  get_recurring_payments
} from './subscription_tools.js';

import {
  simulate_savings,
  simulate_budget_change
} from './simulation_tools.js';

// Groq Function Tool Specifications
export const TOOLS_DEFINITIONS = [
  {
    type: 'function',
    function: {
      name: 'get_category_spending',
      description: 'Calculates total spending for a specific category or overall.',
      parameters: {
        type: 'object',
        properties: {
          category: { type: 'string', description: 'Category name (e.g. Food & Dining, Groceries, Shopping)' },
          period: { type: 'string', description: 'Time period or month' }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'compare_monthly_spending',
      description: 'Compares monthly spending totals and calculates percentage trends.',
      parameters: { type: 'object', properties: {} }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_top_spending_categories',
      description: 'Retrieves the top expense categories ranked by total amount spent.',
      parameters: {
        type: 'object',
        properties: {
          limit: { type: 'number', description: 'Number of categories to return (default 5)' }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_top_merchants',
      description: 'Retrieves the merchants where the user spent the most money.',
      parameters: {
        type: 'object',
        properties: {
          limit: { type: 'number', description: 'Number of top merchants to return (default 5)' }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_transaction_summary',
      description: 'Returns overall total income, total expenses, net savings, and count.',
      parameters: { type: 'object', properties: {} }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_recent_transactions',
      description: 'Retrieves a list of individual transaction records (with date, merchant, category, type, and amount). Use whenever the user asks to see, show, or list transactions (e.g. "show me first 10 transactions", "show recent transactions").',
      parameters: {
        type: 'object',
        properties: {
          limit: { type: 'number', description: 'Number of transactions to return (default 10, max 20)' },
          category: { type: 'string', description: 'Filter by category (optional)' },
          type: { type: 'string', description: 'Filter by type: income or expense (optional)' }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_financial_health',
      description: 'Calculates the overall Financial Health Score (0-100), grade, and status.',
      parameters: { type: 'object', properties: {} }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_health_factors',
      description: 'Explains the positive and negative key factors affecting the health score.',
      parameters: { type: 'object', properties: {} }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_savings_rate',
      description: 'Calculates current savings rate percentage versus the 20% target.',
      parameters: { type: 'object', properties: {} }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_budget_adherence',
      description: 'Evaluates adherence across configured budget categories.',
      parameters: { type: 'object', properties: {} }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_budget_status',
      description: 'Retrieves active budget limits and current spending vs limit for each.',
      parameters: { type: 'object', properties: {} }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_category_budget',
      description: 'Checks budget status and limit for a specific spending category.',
      parameters: {
        type: 'object',
        properties: {
          category: { type: 'string', description: 'Target spending category name' }
        },
        required: ['category']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'set_budget',
      description: 'Sets or updates a monthly budget cap for a category.',
      parameters: {
        type: 'object',
        properties: {
          category: { type: 'string', description: 'Spending category' },
          monthly_limit: { type: 'number', description: 'New monthly budget limit' }
        },
        required: ['category', 'monthly_limit']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_savings_goals',
      description: 'Lists all active savings goals and current amounts saved.',
      parameters: { type: 'object', properties: {} }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_goal_progress',
      description: 'Calculates progress percentage and target date for a savings goal.',
      parameters: {
        type: 'object',
        properties: {
          goal_name: { type: 'string', description: 'Name of the goal' },
          goal_id: { type: 'string', description: 'Goal ID' }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'detect_subscriptions',
      description: 'Detects active recurring payments and software subscriptions.',
      parameters: { type: 'object', properties: {} }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_recurring_payments',
      description: 'Retrieves recurring payments and total monthly commitment.',
      parameters: { type: 'object', properties: {} }
    }
  },
  {
    type: 'function',
    function: {
      name: 'simulate_savings',
      description: 'Simulates projected monthly & 1-year savings from spending reductions.',
      parameters: {
        type: 'object',
        properties: {
          category: { type: 'string', description: 'Category to cut (e.g. Food Delivery, Dining)' },
          reduction_percentage: { type: 'number', description: 'Percentage reduction (e.g. 50)' },
          monthly_amount: { type: 'number', description: 'Optional exact monthly spending amount' }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'simulate_budget_change',
      description: 'Simulates the effect of changing a budget limit on overall savings.',
      parameters: {
        type: 'object',
        properties: {
          category: { type: 'string', description: 'Category to simulate' },
          new_limit: { type: 'number', description: 'Proposed new monthly budget limit' }
        },
        required: ['category', 'new_limit']
      }
    }
  }
];

// Tool Execution Dispatch Router
export const executeToolCall = (toolName, toolArgs, userContext) => {
  switch (toolName) {
    case 'get_category_spending':
      return get_category_spending(userContext, toolArgs);
    case 'compare_monthly_spending':
      return compare_monthly_spending(userContext);
    case 'get_top_spending_categories':
      return get_top_spending_categories(userContext, toolArgs);
    case 'get_top_merchants':
      return get_top_merchants(userContext, toolArgs);
    case 'get_transaction_summary':
      return get_transaction_summary(userContext);
    case 'get_recent_transactions':
      return get_recent_transactions(userContext, toolArgs);
    case 'get_financial_health':
      return get_financial_health(userContext);
    case 'get_health_factors':
      return get_health_factors(userContext);
    case 'get_savings_rate':
      return get_savings_rate(userContext);
    case 'get_budget_adherence':
      return get_budget_adherence(userContext);
    case 'get_budget_status':
      return get_budget_status(userContext);
    case 'get_category_budget':
      return get_category_budget(userContext, toolArgs);
    case 'set_budget':
      return set_budget(userContext, toolArgs);
    case 'get_savings_goals':
      return get_savings_goals(userContext);
    case 'get_goal_progress':
      return get_goal_progress(userContext, toolArgs);
    case 'detect_subscriptions':
      return detect_subscriptions(userContext);
    case 'get_recurring_payments':
      return get_recurring_payments(userContext);
    case 'simulate_savings':
      return simulate_savings(userContext, toolArgs);
    case 'simulate_budget_change':
      return simulate_budget_change(userContext, toolArgs);
    default:
      return { error: `Tool ${toolName} not found.` };
  }
};
