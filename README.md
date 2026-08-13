# Finova — Smart Expense Analyzer & Financial Health Dashboard with AI Agent

Finova is a high-performance financial management platform integrated with an **intelligent Financial AI Agent** powered by **Groq LLM + Function/Tool Calling**.

---

## 🤖 AI Financial Agent Architecture

The AI Agent acts as an intelligent financial copilot orchestrating tool calls over the user's actual database and analytics logic.

```text
User Question (Floating AI Chat UI)
       │
       ▼
Backend Express API (POST /api/agent/chat)
  - Enforces User Session & Data Isolation
  - Transmits User Financial Context
       │
       ▼
Groq LLM (llama-3.3-70b-versatile)
       │
   Tool Selection (Function Calling Protocol)
       │
       ▼
Financial Tools Layer (backend/agent/tools/)
  - spending_tools.js
  - health_tools.js
  - budget_tools.js
  - goal_tools.js
  - subscription_tools.js
  - simulation_tools.js
       │
       ▼
Database / Domain Calculation Engine
       │
       ▼
Structured JSON Result returned to Groq
       │
       ▼
Final Grounded Response returned to Frontend UI
```

---

## ⚡ Why Groq LLM?

1. **Ultra-Fast Inference Speed**: Sub-second response times ideal for an interactive, conversational financial copilot.
2. **First-Class Function Calling**: Precise tool selection and argument generation.
3. **Enterprise Scalability**: Reliable execution for multi-step financial reasoning.

---

## 🛠️ Modular Tool Registry

All agent tools reside in [`backend/agent/tools/`](file:///c:/Users/anubh/OneDrive/Documents/GitHub/New%20folder/HackInMotion-RICR-HIM-1018/backend/agent/tools/):

* **Spending Tools**: `get_category_spending()`, `compare_monthly_spending()`, `get_top_spending_categories()`, `get_top_merchants()`, `get_transaction_summary()`
* **Financial Health Tools**: `get_financial_health()`, `get_health_factors()`, `get_savings_rate()`, `get_budget_adherence()`
* **Budget Tools**: `get_budget_status()`, `get_category_budget()`, `set_budget()`
* **Goal Tools**: `get_savings_goals()`, `get_goal_progress()`
* **Subscription Tools**: `detect_subscriptions()`, `get_recurring_payments()`
* **Simulation Tools**: `simulate_savings()`, `simulate_budget_change()`

---

## 🛡️ Security & Data Privacy

* **Key Protection**: Groq API keys are handled strictly on the backend. The frontend bundle contains zero LLM secrets.
* **User Isolation**: Tools execute exclusively against the authenticated user's financial dataset. User A cannot view User B's transactions.
* **Grounding Guarantee**: Financial calculations (totals, percentages, savings rates, scores) are computed by backend code—never hallucinated by the LLM.

---

## ⚙️ Environment Configuration

Create a `.env` file in the root directory (see `.env.example`):

```env
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
PORT=3001
```

*Note: If `GROQ_API_KEY` is omitted, the application uses an intelligent local tool execution engine as a fallback.*

---

## 🚀 Running the Application

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Backend Agent API Server
```bash
npm run server
```

### 3. Run Frontend (Vite)
```bash
npm run dev
```

The Vite dev server proxies `/api/*` endpoint calls directly to the Express backend server on port 3001.

### 4. Run Automated Tests
```bash
node tests/agent.test.js
```

---

## 📁 System Prompt Location

The central system message is managed at [`backend/agent/system_prompt.js`](file:///c:/Users/anubh/OneDrive/Documents/GitHub/New%20folder/HackInMotion-RICR-HIM-1018/backend/agent/system_prompt.js). It enforces grounding, forbids hallucinating numbers, and instructs the agent to rely strictly on tool execution outputs.
