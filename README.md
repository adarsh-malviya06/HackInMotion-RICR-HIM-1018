# 💰 Finova
### The financial copilot that never makes up a number.

**A smart expense analyzer + financial health dashboard, wired to an AI agent that reasons over *your real transactions* — not guesses.**


---

## 🚩 The Problem

Most people don't lack financial data — they're drowning in it. Bank SMS, UPI apps, credit card statements, five different budgeting apps that each show a different number. What's missing isn't *more dashboards*, it's someone who can actually **answer a question**:

> "Can I afford to cut my dining budget and still hit my Goa trip goal by December?"

Existing expense trackers show you charts. They don't reason. And generic chatbots that *do* reason will happily hallucinate a savings rate that's off by 40%.

## 💡 The Solution

**Finova pairs a real financial calculation engine with an LLM that is only allowed to talk about numbers it actually computed.**

The AI never does math in its head. Every dollar figure, percentage, or score it states comes from a backend tool call against your live database — the LLM's only job is picking the right tool and explaining the result in plain language. That's the difference between a chatbot and a copilot you can trust with money.

---

## ✨ Key Features

| Category | What it does |
|---|---|
| 🧠 **Conversational AI Agent** | Ask financial questions in plain English via a floating chat UI — answers are grounded in your actual data, every time |
| 📊 **Spending Intelligence** | Category breakdowns, month-over-month comparisons, top merchants, transaction summaries |
| ❤️ **Financial Health Score** | Multi-factor health score with an explainable breakdown of what's helping or hurting it |
| 🎯 **Budgets & Goals** | Set budgets per category, track adherence, monitor savings goals against real progress |
| 🔁 **Subscription Detection** | Automatically surfaces recurring payments and subscriptions hiding in your transaction history |
| 🔮 **What-If Simulation** | "What if I saved ₹5,000 more a month?" — simulate budget or savings changes before committing |
| 🔒 **Zero-Trust Isolation** | Every tool call is scoped to the authenticated user — no cross-user data leakage, no LLM secrets in the frontend bundle |

---

## 🤖 How the AI Agent Works

Finova's agent doesn't "chat" — it **orchestrates tool calls** over your real financial data and only writes prose once the numbers are already computed.

```
 User Question (Floating AI Chat UI)
        │
        ▼
 Express API · POST /api/agent/chat
   → authenticates session, scopes to user, attaches financial context
        │
        ▼
 Groq LLM (llama-3.3-70b-versatile)
   → selects the right tool(s), generates arguments
        │
        ▼
 Financial Tools Layer  (backend/agent/tools/)
   → spending_tools · health_tools · budget_tools
   → goal_tools · subscription_tools · simulation_tools
        │
        ▼
 Database / Domain Calculation Engine
   → the ONLY place where numbers are ever computed
        │
        ▼
 Structured JSON result → back to Groq → grounded final answer → UI
```

**Why this matters for judges:** the LLM is architecturally *incapable* of inventing a savings rate or a health score — it can only report what the calculation engine returns. That's a deliberate anti-hallucination design, not an accident.

---

## ⚡ Why Groq?

| Reason | Impact |
|---|---|
| **Sub-second inference** | The agent feels conversational, not like a form submission with a spinner |
| **Native function calling** | Reliable tool selection and argument generation, even across multi-step questions |
| **Cheap enough to demo live** | No rate-limit anxiety during a judging round |

If `GROQ_API_KEY` isn't set, Finova falls back to a local rule-based tool execution engine — so the app still runs end-to-end for judges without an internet-dependent API key.

---

## 🛠️ Modular Tool Registry

All agent tools live in [`backend/agent/tools/`](./backend/agent/tools/):

| File | Tools |
|---|---|
| `spending_tools.js` | `get_category_spending()`, `compare_monthly_spending()`, `get_top_spending_categories()`, `get_top_merchants()`, `get_transaction_summary()` |
| `health_tools.js` | `get_financial_health()`, `get_health_factors()`, `get_savings_rate()`, `get_budget_adherence()` |
| `budget_tools.js` | `get_budget_status()`, `get_category_budget()`, `set_budget()` |
| `goal_tools.js` | `get_savings_goals()`, `get_goal_progress()` |
| `subscription_tools.js` | `detect_subscriptions()`, `get_recurring_payments()` |
| `simulation_tools.js` | `simulate_savings()`, `simulate_budget_change()` |

The system prompt enforcing this grounding behavior lives in [`backend/agent/system_prompt.js`](./backend/agent/system_prompt.js) — it explicitly forbids the model from stating any figure it didn't receive from a tool result.

---

## 🛡️ Security & Data Privacy

- **Key protection** — Groq API keys live strictly on the backend; the frontend bundle ships zero LLM secrets.
- **User isolation** — every tool executes only against the authenticated user's dataset. User A cannot see User B's transactions, even by prompt injection, since the tool layer scopes queries server-side, not via the LLM's judgment.
- **Grounding guarantee** — totals, percentages, savings rates, and health scores are always backend-computed, never generated by the LLM.

---

## 🖼️ Screenshots

> _Dashboard, AI Copilot chat, and landing page views — add before submitting._

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A Groq API key ([console.groq.com](https://console.groq.com)) — optional, see fallback note above

### 1. Clone and install
```bash
git clone https://github.com/<your-org>/HackInMotion-RICR-HIM-1018.git
cd HackInMotion-RICR-HIM-1018
npm install
```

### 2. Configure environment
Copy `.env.example` to `.env` and fill in:
```env
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
PORT=3001
```

### 3. Run the backend agent API
```bash
npm run server
```

### 4. Run the frontend (Vite)
```bash
npm run dev
```
The Vite dev server proxies all `/api/*` calls to the Express backend on port `3001`.

### 5. Run automated tests
```bash
node tests/agent.test.js
```

---

## 🗺️ Roadmap

- [ ] Bank-statement / UPI auto-import (currently manual/seeded transactions)
- [ ] Multi-currency support
- [ ] Proactive push notifications ("You're 80% through your dining budget")
- [ ] Voice input for the chat agent
- [ ] Shareable read-only financial health report

---

## 👥 Team — RICR-HIM-1018

| Name | Role |
|---|---|
| Adarsh Malviya | — |
| Anubhav Gupta | — |
| Ayush Raj | — |

Built at **HackInMotion**, RICR.

---

## 📄 License

MIT — see [`LICENSE`](./LICENSE) for details.