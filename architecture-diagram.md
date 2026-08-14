# Finova — System Architecture Diagram

```mermaid
graph TD
    subgraph Frontend["React 19 + Vite 8 SPA"]
        UI["Financial Dashboard & Charts"]
        CSV["CSV Ingestion & Auto-Categorizer"]
        CLEAN["Data Cleaning Engine"]
        SIM["What-If Savings Simulator"]
        COPILOT_UI["Floating AI Copilot Panel"]
    end

    subgraph Backend["Express API Backend (port 3001)"]
        ENDPOINT["POST /api/agent/chat"]
        AUTH["Auth & Session Validation"]
        PROMPT["Central System Prompt (system_prompt.js)"]
        AGENT["AI Agent Orchestrator (agent.js)"]
    end

    subgraph Tools["Modular Financial Tools Layer"]
        SPEND_TOOLS["Spending Tools"]
        HEALTH_TOOLS["Health Score Tools"]
        BUDGET_TOOLS["Budget & Goal Tools"]
        SUB_TOOLS["Subscription Tools"]
        SIM_TOOLS["Simulation Tools"]
    end

    subgraph AI["Groq Cloud LLM"]
        GROQ["llama-3.3-70b-versatile"]
    end

    subgraph Database["MongoDB / MongoDB Atlas"]
        DB_PROFILES["users"]
        DB_TX["transactions"]
        DB_BUDGETS["budgets"]
        DB_GOALS["goals"]
        DB_REC["recurring"]
    end

    COPILOT_UI -->|POST /api/agent/chat| ENDPOINT
    ENDPOINT --> AUTH
    AUTH --> AGENT
    PROMPT --> AGENT
    AGENT -->|1. Tool Selection Query| GROQ
    GROQ -->|2. Function Call Requested| AGENT
    AGENT -->|3. Execute Tool| Tools
    Tools -->|4. Query User Ledger| Database
    Database -->|5. Raw Financial Records| Tools
    Tools -->|6. Structured JSON Result| AGENT
    AGENT -->|7. Grounded Tool Context| GROQ
    GROQ -->|8. Natural-Language Answer| AGENT
    AGENT -->|9. Final Grounded Response| COPILOT_UI
```

---

## Architecture Components Overview

1. **React 19 Frontend**:
   - Built with Vite 8, Lucide React, and Chart.js.
   - Provides instant client-side data cleaning, manual entry, and CSV auto-mapping.
   - Houses the persistent **Floating AI Copilot** UI overlay.

2. **Express Backend API (`backend/server.js`)**:
   - Enforces user session context & multi-tenant data isolation.
   - Manages Groq API credentials safely on the backend server.
   - Dispatches incoming chat messages to the agent orchestration engine.

3. **Groq LLM Engine (`llama-3.3-70b-versatile`)**:
   - Performs sub-second function selection via official `groq-sdk` protocol.
   - Generates natural-language financial advice strictly grounded in tool calculation results.

4. **Modular Tools Layer (`backend/agent/tools/`)**:
   - 18 Groq tool definitions across spending, health scores, budget caps, goals, recurring payments, and simulations.

5. **MongoDB / MongoDB Atlas Database**:
   - Cloud MongoDB database with authenticated Mongoose schemas protecting user data.
