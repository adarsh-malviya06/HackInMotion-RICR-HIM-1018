# 💰 Finova — Intelligent Financial AI Copilot
### The financial copilot that never makes up a number.

A smart expense analyzer + financial health dashboard, wired to an AI agent that reasons over *your real transactions* — not guesses.

---

## Team Name

**RICR-HIM-1018**

---

## Team Members

| Name | Role |
|---|---|
| Adarsh Malviya | Full Stack Lead |
| Anubhav Gupta | AI Agent & Security Engineer |
| Ayush Raj | Frontend & UI Specialist |

Built at **HackInMotion**, RICR.

---

## Selected Theme

**Fintech & Personal Finance**

---

## Problem Statement

Most people don't lack financial data — they're drowning in it. Bank SMS, UPI apps, credit card statements, five different budgeting apps that each show a different number. What's missing isn't *more dashboards*, it's someone who can actually **answer a question**:

> "Can I afford to cut my dining budget and still hit my Goa trip goal by December?"

Existing expense trackers show you charts. They don't reason. And generic chatbots that *do* reason will happily hallucinate a savings rate that's off by 40%.

---

## Solution Overview

**Finova pairs a real financial calculation engine with an LLM that is only allowed to talk about numbers it actually computed.**

The AI never does math in its head. Every dollar figure, percentage, or score it states comes from a backend tool call against your live database — the LLM's only job is picking the right tool and explaining the result in plain language. That's the difference between a chatbot and a copilot you can trust with money.

**Key Features:**

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

## Technology Stack

### Frontend
- React 19 + Vite 8
- Chart.js & React-ChartJS-2 (Financial Visualization)
- Lucide React (Icons & Micro-interactions)
- PapaParse (Browser CSV Bank Statement Parsing)
- Canvas-Confetti (Goal Celebration Animations)

### Backend
- Node.js + Express (Agent & REST Server)
- FastAPI (Python Agent API Backup Engine)
- Mongoose ODM (MongoDB Drivers)
- JSONWebToken & BcryptJS (Authentication & Cookie Sessions)

### Database
- MongoDB Atlas (Cloud database persistence)
- Local Mongoose / MongoDB Memory Server Fallback (Runs out-of-the-box without DB setup)

### AI
- Groq Cloud SDK (`llama-3.3-70b-versatile`) for sub-second function/tool-calling agent
- Deterministic Rule-Based Fallback Executor when `GROQ_API_KEY` is omitted

### Deployment
- Frontend: Vercel ([hack-in-motion-ricr-him-1018.vercel.app](https://hack-in-motion-ricr-him-1018.vercel.app))
- Backend: Render ([hackinmotion-ricr-him-1018.onrender.com](https://hackinmotion-ricr-him-1018.onrender.com))

---

## Installation Guide

### Prerequisites
- Node.js 18+
- A Groq API key ([console.groq.com](https://console.groq.com)) — optional, see fallback note below

### 1. Clone and install
```bash
git clone https://github.com/adarsh-malviya06/HackInMotion-RICR-HIM-1018.git
cd HackInMotion-RICR-HIM-1018
npm install
```

### 2. Run the backend agent API
```bash
npm run server
```

### 3. Run the frontend (Vite)
```bash
npm run dev
```
The Vite dev server proxies all `/api/*` calls to the Express backend on port `3001`.

### 4. Run automated tests
```bash
node tests/agent.test.js
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in:

```env
# Groq API Configuration
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile

# Port for Backend Express Agent Server (Default 3001)
PORT=3001

# Render Deployed Backend URL for Frontend Vercel Connection
VITE_API_URL=https://hackinmotion-ricr-him-1018.onrender.com

# MongoDB Atlas Cloud Database Connection (Optional for Cloud DB Persistence)
MONGO_URI=mongodb+srv://finova_admin:finova_admin@cluster0.l56uark.mongodb.net/finova_db?appName=Cluster0
```

`MONGO_URI` is optional — if it isn't set, the backend automatically falls back to an in-memory data store, so the app still runs end-to-end without a database connection.

---

## API Documentation

Complete REST & AI Agent endpoints documented in [`api-documentation.md`](./api-documentation.md):

| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Register new user account | No |
| POST | `/api/auth/login` | Authenticate user & issue JWT session cookie | No |
| GET | `/api/auth/me` | Verify active user session | Yes |
| POST | `/api/auth/logout` | Clear user session cookie | Yes |
| GET | `/api/transactions` | Fetch user financial transaction ledger | Yes |
| POST | `/api/transactions` | Log single manual expense/income transaction | Yes |
| POST | `/api/transactions/bulk` | Ingest bulk CSV statement rows with duplicate detection | Yes |
| DELETE | `/api/transactions/:id` | Remove transaction record | Yes |
| GET | `/api/budgets` | Fetch monthly budget limits per category | Yes |
| POST | `/api/budgets` | Create or update category budget cap | Yes |
| GET | `/api/goals` | Fetch active savings targets | Yes |
| POST | `/api/goals` | Create new wealth goal | Yes |
| POST | `/api/goals/:id/deposit` | Add funds towards savings target | Yes |
| POST | `/api/agent/chat` | Sends user prompt to AI agent; authenticates session & executes tools | Yes |

---

## Database Details

- **MongoDB Atlas** is used for persistence when `MONGO_URI` is configured.
- If `MONGO_URI` is not set, the backend falls back to an **in-memory data store** (see `backend/models/`), so the app still runs end-to-end without a database connection.

### Collections & Schemas:
- `users`: User profile details, email, and `bcrypt` password hashes (`backend/models/User.js`).
- `transactions`: Complete transaction ledger (`amount`, `type`, `category`, `merchant`, `date`, `payment_method`, `userId`).
- `budgets`: Category monthly limits (`category`, `monthly_limit`, `userId`).
- `goals`: Target savings projects (`name`, `target_amount`, `current_amount`, `target_date`, `userId`).
- `recurring`: Auto-detected subscriptions (`merchant`, `amount`, `billing_cycle`, `status`, `userId`).

---

## Architecture Diagram

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

**Modular Tool Registry** — all agent tools live in [`backend/agent/tools/`](./backend/agent/tools/):

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

## Screenshots

### Landing Page
![Finova Landing Page](./screenshots/landing-page.jpeg)

### Dashboard
![Finova Dashboard](./screenshots/dashboard.png)

### AI Copilot
![Finova AI Copilot](./screenshots/ai-copilot.png)

---

## Deployment Link

- **Live App (Frontend):** [hack-in-motion-ricr-him-1018.vercel.app](https://hack-in-motion-ricr-him-1018.vercel.app)
- **API (Backend):** [hackinmotion-ricr-him-1018.onrender.com](https://hackinmotion-ricr-him-1018.onrender.com)
- **Database:** MongoDB Atlas (`cluster0.l56uark.mongodb.net`)

---

## Future Scope

- [x] Automated CSV bank statement parsing & category auto-mapping
- [ ] Bank-statement / UPI live API integration
- [ ] Multi-currency support ($ USD, ₹ INR, € EUR)
- [ ] Proactive push notifications ("You're 80% through your dining budget")
- [ ] Voice input for the chat agent
- [ ] Shareable read-only financial health report
