# Finova — API & Financial Intelligence Documentation

This document provides complete technical specifications for **Finova**'s Backend AI Agent API, REST API Endpoints, Financial Tools Catalogue, Data Categorization Engine, and MongoDB / MongoDB Atlas Database Integration.

## System Architecture

![Finova Project System Architecture](architecture-diagram.md)

---

## 1. AI Agent REST Endpoints

### 1.1 POST `/api/agent/chat`
Executes the Groq LLM tool-calling orchestration loop over user financial data.

* **URL**: `/api/agent/chat`
* **Method**: `POST`
* **Headers**: `Content-Type: application/json`
* **Authentication**: Required (JWT cookie session / Auth context)

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
    "currency": "₹"
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
  "answer": "Your highest spending category is **Food & Dining** at **₹450.00** (100% of total expenses).",
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
  "status": "OK",
  "message": "Finova Backend & AI Agent Running",
  "groq_configured": true
}
```

---

## 2. User Authentication REST Endpoints

### 2.1 POST `/api/auth/register`
Creates a new user account with hashed password credentials.

* **URL**: `/api/auth/register`
* **Method**: `POST`

#### Request Payload:
```json
{
  "name": "Anubhav Gupta",
  "email": "anubhav@finova.ai",
  "password": "SecurePassword123!"
}
```

---

### 2.2 POST `/api/auth/login`
Authenticates user credentials and issues HttpOnly JWT cookie.

* **URL**: `/api/auth/login`
* **Method**: `POST`

#### Request Payload:
```json
{
  "email": "anubhav@finova.ai",
  "password": "SecurePassword123!"
}
```

---

### 2.3 GET `/api/auth/me`
Retrieves authenticated user profile details from JWT cookie session.

* **URL**: `/api/auth/me`
* **Method**: `GET`

---

### 2.4 POST `/api/auth/logout`
Clears active user session cookie.

* **URL**: `/api/auth/logout`
* **Method**: `POST`

---

## 3. Financial Transaction REST Endpoints

### 3.1 GET `/api/transactions`
Retrieves all transaction ledger items belonging to the authenticated user.

* **URL**: `/api/transactions`
* **Method**: `GET`

---

### 3.2 POST `/api/transactions`
Creates a single transaction record.

* **URL**: `/api/transactions`
* **Method**: `POST`

#### Request Payload:
```json
{
  "date": "2026-08-14",
  "merchant": "Starbucks Coffee",
  "raw_description": "Starbucks Store #481",
  "amount": 350.00,
  "type": "expense",
  "category": "Food & Dining",
  "payment_method": "Credit Card",
  "is_recurring": false
}
```

---

### 3.3 POST `/api/transactions/import`
Ingests bulk CSV transactions with automatic fingerprint duplicate detection (`date + merchant + amount`).

* **URL**: `/api/transactions/import`
* **Method**: `POST`

#### Request Payload:
```json
{
  "transactions": [
    {
      "date": "2026-08-01",
      "merchant": "Uber Trip",
      "amount": 420.00,
      "type": "expense",
      "category": "Travel & Transport"
    }
  ],
  "fileMeta": {
    "filesProcessed": 1,
    "fileNames": ["August_Bank_Statement.csv"]
  }
}
```

---

### 3.4 DELETE `/api/transactions/:id`
Deletes a transaction record from the user's database.

* **URL**: `/api/transactions/:id`
* **Method**: `DELETE`

---

## 4. Budgets & Goals REST Endpoints

### 4.1 GET `/api/budgets`
Lists monthly spending caps per category.

* **URL**: `/api/budgets`
* **Method**: `GET`

---

### 4.2 POST `/api/budgets`
Saves or updates a category budget limit.

* **URL**: `/api/budgets`
* **Method**: `POST`

#### Request Payload:
```json
{
  "category": "Food & Dining",
  "monthly_limit": 15000.00
}
```

---

### 4.3 GET `/api/goals`
Retrieves active savings targets and accumulated progress.

* **URL**: `/api/goals`
* **Method**: `GET`

---

### 4.4 POST `/api/goals`
Creates a new savings goal project.

* **URL**: `/api/goals`
* **Method**: `POST`

#### Request Payload:
```json
{
  "name": "Goa Trip Fund",
  "target_amount": 25000.00,
  "current_amount": 5000.00,
  "target_date": "2026-12-31"
}
```

---

### 4.5 POST `/api/goals/:id/deposit`
Deposits funds into an existing savings goal.

* **URL**: `/api/goals/:id/deposit`
* **Method**: `POST`

#### Request Payload:
```json
{
  "amount": 2500.00
}
```

---

## 5. Financial Tools Catalogue (Groq Function Definitions)

All tools are declared in `backend/agent/tools/index.js` and executed on trusted server-side financial data.

### 5.1 Spending Tools
* `get_category_spending({ category, period })`: Calculates spend total and percentage for a category.
* `compare_monthly_spending()`: Computes month-over-month deltas and trend direction.
* `get_top_spending_categories({ limit })`: Ranks expense categories by amount spent.
* `get_top_merchants({ limit })`: Identifies top merchants by dollar volume and transaction frequency.
* `get_transaction_summary()`: Returns total income, total expenses, net cashflow, and record count.

### 5.2 Financial Health Tools
* `get_financial_health()`: Computes overall score (0-100), grade (A-D), savings rate, and subscription ratio.
* `get_health_factors()`: Identifies positive and negative drivers of the user's health score.
* `get_savings_rate()`: Compares current savings rate against the 20% target.
* `get_budget_adherence()`: Evaluates overall budget compliance across active categories.

### 5.3 Budget & Goal Tools
* `get_budget_status()`: Lists monthly limit, actual spent, and remaining headroom per budget.
* `get_category_budget({ category })`: Checks budget limits for a specific category.
* `set_budget({ category, monthly_limit })`: Proposes new category budget limit.
* `get_savings_goals()`: Summarizes active savings targets and amounts accumulated.
* `get_goal_progress({ goal_name, goal_id })`: Calculates target date and completion percentage.

### 5.4 Subscription & Simulation Tools
* `detect_subscriptions()`: Identifies recurring service payments (e.g. Netflix, Spotify).
* `get_recurring_payments()`: Retrieves active subscriptions and total monthly commitment.
* `simulate_savings({ category, reduction_percentage, monthly_amount })`: Projects 1-month and 12-month savings with 7% wealth projection.
* `simulate_budget_change({ category, new_limit })`: Models cashflow impact of adjusting category budget caps.

---

## 6. Automatic Categorization Engine

Located in `src/services/dataIntelligence.js`:

### 6.1 Merchant Normalization
Regex cleaners strip payment gateway prefixes (`SQ *`, `PAYPAL *`, order numbers `#1234`, state codes `CA 90210`) and map raw strings to clean merchant names (e.g., `AMZN MKT` ➔ `Amazon`).

### 6.2 Categorization Logic
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

## 7. Database Schema (MongoDB / MongoDB Atlas)

Defined in Mongoose models (`backend/models/`):
* `User`: User account details, authentication hashes, and preferences (`backend/models/User.js`).
* `Transaction`: Transaction ledger (`amount`, `type`, `category`, `merchant`, `date`, `userId`, `backend/models/Transaction.js`).
* `Budget`: Category limits (`monthlyLimit`, `category`, `userId`, `backend/models/Budget.js`).
* `Goal`: Wealth targets (`targetAmount`, `currentAmount`, `targetDate`, `userId`, `backend/models/Goal.js`).
* `Recurring`: Detected recurring subscriptions (`merchant`, `amount`, `billingCycle`, `userId`, `backend/models/Recurring.js`).
