# Finova — HackInMotion Presentation Slide Deck (RICR-HIM-1018)

## Slide 1: Title Slide
* **Title**: ✦ Finova — Smart Expense Analyzer & Financial Health Dashboard with AI Agent
* **Subtitle**: Pre-qualifier HackInMotion Hackathon Presentation
* **Team**: RICR-HIM-1018
* **Theme**: FinTech & Personal Finance

---

## Slide 2: Problem Statement & Solution
* **Problem**:
  - Bank CSV exports contain unorganized raw descriptions and ambiguous merchant names.
  - Subscription creep and impulse micro-purchases quietly drain savings.
  - Conventional finance dashboards lack natural-language context.
  - Standard AI chatbots hallucinate financial figures when answering questions.
* **Solution**:
  - Rule-based Merchant Normalization & Auto-Categorization Algorithm.
  - Groq LLM + Backend Function Calling (18 modular financial tools).
  - Financial Health Score Engine (0-100) & Money Leak Detector.
  - Interactive What-If Simulator with projected 1-year wealth accumulation.

---

## Slide 3: System & AI Agent Architecture
* **Frontend**: React 19 + Vite 8 SPA with persistent Floating AI Copilot UI panel.
* **Backend API**: Express server (`backend/server.js`) on port 3001 servicing `POST /api/agent/chat`.
* **LLM Model**: Groq `llama-3.3-70b-versatile` with sub-second inference speeds.
* **Tool Calling Engine**: 18 tools registered in `backend/agent/tools/`.
* **Grounding Rule**: LLM receives structured JSON from backend tools—zero hallucination.

---

## Slide 4: Feature Modules Overview
1. **Dashboard**: Cashflow totals, category pie charts, recent activity.
2. **Ingestion**: Bank CSV upload with header auto-mapping and single manual entry.
3. **Data Cleaning**: Smart deduplication algorithm and merchant regex cleaning.
4. **Intelligence**: Financial Health Score (0-100), grade (A-D), and money leak detector.
5. **Subscriptions**: Recurring payment tracker with review recommendations.
6. **Planning & Simulator**: Budget limits, savings goal progress, and 50% spend cut simulations.

---

## Slide 5: Security & Quality Audit Resolution
* **Secret Protection**: `GROQ_API_KEY` handled strictly backend-only (`.env` in `.gitignore`).
* **Multi-Tenant Isolation**: Tools execute strictly within the authenticated user's context.
* **Database**: MongoDB / MongoDB Atlas with authenticated Mongoose schemas.
* **Code Quality**: Oxlint configured with 0 lint warnings; 100% Vite production build.
* **Automated Tests**: `tests/agent.test.js` passing 12/12 unit and user isolation tests.
