# FINLY — API & Financial Intelligence Documentation

This document provides complete technical specifications for **FINLY**'s Backend AI Agent API, Financial Tools Catalogue, Data Categorization Algorithms, and Supabase Database Integration.

---

## 1. AI Agent REST Endpoints

### 1.1 POST `/api/agent/chat`
Executes the Groq LLM tool-calling orchestration loop over user financial data.

* **URL**: `/api/agent/chat`
* **Method**: `POST`
* **Headers**: `Content-Type: application/json`

#### Request Payload:
```json
{
  "message": "Where am I spending the most?",
  "context": {
    "transactions": [
      {
        "id": "tx_01",
        "date": "2026-08-01",
        "merchant": "DoorDash",
        "amount": 450.00,
        "type": "expense",
        "category": "Food & Dining"
      }
    ],
    "budgets": [
      { "category": "Food & Dining", "monthly_limit": 500.00 }
    ],
    "goals": [
      { "name": "Emergency Cushion", "target_amount": 10000.00, "current_amount": 3500.00 }
    ],
    "recurring": [
      { "merchant": "Netflix", "amount": 15.99, "billing_cycle": "Monthly" }
    ],
    "currency": "$"
  },
  "history": [
    { "sender": "user", "text": "Hi Copilot" },
    { "sender": "bot", "text": "Hello! How can I help with your finances?" }
  ]
}
```

#### Response Payload:
```json
{
  "success": true,
  "answer": "Your highest spending category is **Food & Dining** at **$450.00** (100% of total expenses).",
  "tools_used": ["get_top_spending_categories"],
  "grounded": true,
  "fallback": false
}
```

---

### 1.2 GET `/api/health`
Monitors backend server status and Groq LLM configuration.

* **URL**: `/api/health`
* **Method**: `GET`

#### Response Payload:
```json
{
  "status": "online",
  "agent": "FINLY Financial AI Copilot",
  "groq_configured": true
}
```

---

## 2. Financial Tools Catalogue (Groq Function Definitions)

All tools are declared in `backend/agent/tools/index.js` and executed on trusted server-side financial data.

### 2.1 Spending Tools
* `get_category_spending({ category, period })`: Calculates spend total and percentage for a category.
* `compare_monthly_spending()`: Computes month-over-month deltas and trend direction.
* `get_top_spending_categories({ limit })`: Ranks expense categories by amount spent.
* `get_top_merchants({ limit })`: Identifies top merchants by dollar volume and transaction frequency.
* `get_transaction_summary()`: Returns total income, total expenses, net cashflow, and record count.

### 2.2 Financial Health Tools
* `get_financial_health()`: Computes overall score (0-100), grade (A-D), savings rate, and subscription ratio.
* `get_health_factors()`: Identifies positive and negative drivers of the user's health score.
* `get_savings_rate()`: Compares current savings rate against the 20% target.
* `get_budget_adherence()`: Evaluates overall budget compliance across active categories.

### 2.3 Budget & Goal Tools
* `get_budget_status()`: Lists monthly limit, actual spent, and remaining headroom per budget.
* `get_category_budget({ category })`: Checks budget limits for a specific category.
* `set_budget({ category, monthly_limit })`: Proposes new category budget limit.
* `get_savings_goals()`: Summarizes active savings targets and amounts accumulated.
* `get_goal_progress({ goal_name, goal_id })`: Calculates target date and completion percentage.

### 2.4 Subscription & Simulation Tools
* `detect_subscriptions()`: Identifies recurring service payments (e.g. Netflix, Spotify).
* `get_recurring_payments()`: Retrieves active subscriptions and total monthly commitment.
* `simulate_savings({ category, reduction_percentage, monthly_amount })`: Projects 1-month and 12-month savings with 7% wealth projection.
* `simulate_budget_change({ category, new_limit })`: Models cashflow impact of adjusting category budget caps.

---

## 3. Automatic Categorization Engine

Located in `src/services/dataIntelligence.js`:

### 3.1 Merchant Normalization
Regex cleaners strip payment gateway prefixes (`SQ *`, `PAYPAL *`, order numbers `#1234`, state codes `CA 90210`) and map raw strings to clean merchant names (e.g., `AMZN MKT` ➔ `Amazon`).

### 3.2 Categorization Logic
Categorizes transactions using keyword and regex rules across merchant name and raw transaction description:
* **Housing**: `rent`, `mortgage`, `lease`, `property`
* **Groceries**: `grocery`, `walmart`, `target`, `trader joe`, `costco`
* **Food & Dining**: `doordash`, `ubereats`, `starbucks`, `restaurant`, `cafe`
* **Subscriptions & Tech**: `netflix`, `spotify`, `aws`, `github`, `adobe`, `apple`
* **Utilities**: `electric`, `water`, `gas bill`, `internet`, `verizon`
* **Travel & Transport**: `uber`, `lyft`, `gas`, `fuel`, `airline`, `metro`
* **Health & Fitness**: `gym`, `cvs`, `doctor`, `pharmacy`
* **Shopping**: `amazon`, `zara`, `nike`, `electronics`

---

## 4. Database Schema (Supabase PostgreSQL)

Defined in `supabase_schema.sql`:
* `profiles`: User account details and currency preference.
* `transactions`: Transaction ledger (`amount`, `type`, `category`, `merchant`, `date`, `user_id`).
* `budgets`: Category limits (`monthly_limit`, `category`, `user_id`).
* `goals`: Wealth targets (`target_amount`, `current_amount`, `target_date`, `user_id`).
* `recurring_expenses`: Detected recurring subscriptions (`merchant`, `amount`, `billing_cycle`, `user_id`).
