import os
import json
import re
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Load environment variables from backend/.env or parent .env
load_dotenv()
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

app = FastAPI(
    title="Finova Financial Intelligence API",
    description="Intelligent Fintech & Smart Expense Analyzer API with Groq LLM Agent",
    version="1.0.0"
)

# CORS Configuration for Vercel Frontend Deployment & Local Development
allowed_origins = [
    os.getenv("FRONTEND_URL", "http://localhost:5173"),
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://*.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins (including Vercel deployments)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Schemas
class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="User prompt or query for AI Financial Copilot")
    context: Optional[Dict[str, Any]] = Field(default_factory=dict, description="User financial context data")
    history: Optional[List[Dict[str, Any]]] = Field(default_factory=list, description="Chat conversation history")

class TransactionItem(BaseModel):
    id: Optional[str] = None
    date: Optional[str] = "N/A"
    merchant: Optional[str] = "Unknown Merchant"
    raw_description: Optional[str] = ""
    amount: float = 0.0
    type: str = "expense"
    category: str = "Uncategorized"
    payment_method: Optional[str] = "Card"
    is_recurring: Optional[bool] = False

# Financial Tools Execution Engine
def execute_tool_call(tool_name: str, tool_args: Dict[str, Any], user_context: Dict[str, Any]) -> Dict[str, Any]:
    transactions = user_context.get("transactions", [])
    budgets = user_context.get("budgets", [])
    goals = user_context.get("goals", [])
    recurring = user_context.get("recurring", [])
    health_score = user_context.get("healthScore", {})
    currency = user_context.get("currency", "₹")

    # Coerce limit parameter if present
    raw_limit = tool_args.get("limit", 10)
    try:
        limit = int(raw_limit)
    except (ValueError, TypeError):
        limit = 10

    if tool_name == "get_recent_transactions":
        if not transactions:
            return {"transactions": [], "count": 0, "message": "No transactions found in database.", "currency": currency}
        
        filtered = list(transactions)
        req_type = tool_args.get("type")
        if req_type:
            filtered = [t for t in filtered if str(t.get("type", "")).lower() == str(req_type).lower()]
        
        req_cat = tool_args.get("category")
        if req_cat:
            filtered = [t for t in filtered if str(req_cat).lower() in str(t.get("category", "")).lower()]
        
        max_limit = min(20, max(1, limit))
        result_list = []
        for idx, t in enumerate(filtered[:max_limit]):
            amt = float(t.get("amount", 0))
            result_list.append({
                "index": idx + 1,
                "date": t.get("date", "N/A"),
                "merchant": t.get("merchant", "Unknown Merchant"),
                "category": t.get("category", "Uncategorized"),
                "type": t.get("type", "expense"),
                "amount": f"{currency}{amt:.2f}"
            })
        
        return {
            "transactions": result_list,
            "returned_count": len(result_list),
            "total_matching_transactions": len(filtered),
            "currency": currency
        }

    elif tool_name == "get_category_spending":
        cat_param = tool_args.get("category", "").lower()
        expenses = [t for t in transactions if t.get("type") == "expense"]
        if cat_param:
            expenses = [t for t in expenses if cat_param in str(t.get("category", "")).lower()]
        
        total = sum(float(t.get("amount", 0)) for t in expenses)
        return {
            "category": tool_args.get("category", "Overall Expenses"),
            "total": round(total, 2),
            "transaction_count": len(expenses),
            "currency": currency
        }

    elif tool_name == "get_top_spending_categories":
        expenses = [t for t in transactions if t.get("type") == "expense"]
        total_exp = sum(float(t.get("amount", 0)) for t in expenses)
        cat_totals = {}
        for t in expenses:
            c = t.get("category", "Other")
            cat_totals[c] = cat_totals.get(c, 0.0) + float(t.get("amount", 0))
        
        sorted_cats = sorted(cat_totals.items(), key=lambda x: x[1], reverse=True)[:limit]
        top_categories = []
        for c, amt in sorted_cats:
            pct = round((amt / total_exp * 100), 2) if total_exp > 0 else 0.0
            top_categories.append({"category": c, "amount": round(amt, 2), "percentage": pct})
        
        return {
            "top_categories": top_categories,
            "total_expenses": round(total_exp, 2),
            "currency": currency
        }

    elif tool_name == "get_top_merchants":
        expenses = [t for t in transactions if t.get("type") == "expense"]
        merchant_totals = {}
        merchant_counts = {}
        for t in expenses:
            m = t.get("merchant", "Unknown Merchant")
            merchant_totals[m] = merchant_totals.get(m, 0.0) + float(t.get("amount", 0))
            merchant_counts[m] = merchant_counts.get(m, 0) + 1
        
        sorted_m = sorted(merchant_totals.items(), key=lambda x: x[1], reverse=True)[:limit]
        top_merchants = []
        for m, tot in sorted_m:
            top_merchants.append({"merchant": m, "total_spent": round(tot, 2), "transaction_count": merchant_counts[m]})
        
        return {"top_merchants": top_merchants, "currency": currency}

    elif tool_name == "get_transaction_summary":
        total_income = sum(float(t.get("amount", 0)) for t in transactions if t.get("type") == "income")
        total_expenses = sum(float(t.get("amount", 0)) for t in transactions if t.get("type") == "expense")
        net_savings = total_income - total_expenses
        return {
            "total_income": round(total_income, 2),
            "total_expenses": round(total_expenses, 2),
            "net_savings": round(netSavings if 'netSavings' in locals() else net_savings, 2),
            "transaction_count": len(transactions),
            "currency": currency
        }

    elif tool_name == "get_financial_health":
        total_income = sum(float(t.get("amount", 0)) for t in transactions if t.get("type") == "income")
        total_expenses = sum(float(t.get("amount", 0)) for t in transactions if t.get("type") == "expense")
        savings_rate = round(((total_income - total_expenses) / total_income * 100), 1) if total_income > 0 else 0
        score = health_score.get("score", max(20, min(100, int(50 + savings_rate * 0.5))))
        grade = "A" if score >= 80 else ("B" if score >= 70 else ("C" if score >= 50 else "D"))
        status = "Excellent" if score >= 80 else ("Good" if score >= 70 else "Moderate")
        return {
            "score": score,
            "grade": grade,
            "status": status,
            "savings_rate": savings_rate,
            "subscription_ratio": health_score.get("subscriptionRatio", 4.2),
            "total_income": round(total_income, 2),
            "total_expenses": round(total_expenses, 2),
            "insights": ["Maintain savings rate above 20% to build wealth."],
            "currency": currency
        }

    elif tool_name == "simulate_savings":
        cat = tool_args.get("category", "Food & Dining")
        pct = float(tool_args.get("reduction_percentage", 50))
        cat_expenses = sum(float(t.get("amount", 0)) for t in transactions if t.get("type") == "expense" and cat.lower() in str(t.get("category", "")).lower())
        if cat_expenses == 0:
            cat_expenses = 800.0  # Default benchmark baseline
        
        monthly_sav = round(cat_expenses * (pct / 100.0), 2)
        annual_sav = round(monthly_sav * 12, 2)
        proj_growth = round(annual_sav * 1.07, 2)
        return {
            "category": cat,
            "reduction_percentage": pct,
            "estimated_monthly_savings": monthly_sav,
            "estimated_annual_savings": annual_sav,
            "projected_1yr_investment_growth_at_7pct": proj_growth,
            "currency": currency
        }

    elif tool_name in ["detect_subscriptions", "get_recurring_payments"]:
        rec_list = list(recurring)
        if not rec_list:
            sub_txs = [t for t in transactions if t.get("type") == "expense" and (t.get("is_recurring") or "Subscription" in str(t.get("category", "")))]
            seen = set()
            for t in sub_txs:
                m = t.get("merchant", "Service")
                if m not in seen:
                    seen.add(m)
                    rec_list.append({"merchant": m, "amount": float(t.get("amount", 0)), "billing_cycle": "Monthly", "notice": f"Recurring {m} payment detected — consider reviewing."})
        
        tot_commitment = sum(float(r.get("amount", 0)) for r in rec_list)
        return {
            "recurring_payments": rec_list,
            "count": len(rec_list),
            "total_monthly_commitment": round(tot_commitment, 2),
            "currency": currency
        }

    elif tool_name == "get_budget_status":
        b_list = []
        for b in budgets:
            cat = b.get("category", "General")
            limit_val = float(b.get("monthly_limit", 500))
            spent = sum(float(t.get("amount", 0)) for t in transactions if t.get("type") == "expense" and str(t.get("category", "")).lower() == cat.lower())
            b_list.append({"category": cat, "monthly_limit": limit_val, "spent": round(spent, 2), "remaining": round(limit_val - spent, 2)})
        return {"budgets": b_list, "currency": currency}

    elif tool_name == "get_savings_goals":
        return {"goals": goals, "currency": currency}

    else:
        return {"summary": "Financial analysis retrieved.", "currency": currency}

# Tool JSON Schemas for Groq API
GROQ_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "get_recent_transactions",
            "description": "Retrieves a list of individual transaction records (with date, merchant, category, type, and amount). Use whenever user asks to see, show, or list transactions.",
            "parameters": {
                "type": "object",
                "properties": {
                    "limit": {"type": "number", "description": "Number of transactions to return (default 10, max 20)"},
                    "category": {"type": "string", "description": "Filter by category"},
                    "type": {"type": "string", "description": "Filter by type (income or expense)"}
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_category_spending",
            "description": "Calculates total spending for a specific category or overall.",
            "parameters": {
                "type": "object",
                "properties": {
                    "category": {"type": "string", "description": "Category name"}
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_top_spending_categories",
            "description": "Returns highest spending expense categories.",
            "parameters": {
                "type": "object",
                "properties": {
                    "limit": {"type": "number", "description": "Number of categories to return"}
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_financial_health",
            "description": "Calculates overall Financial Health Score (0-100), grade, and status.",
            "parameters": {"type": "object", "properties": {}}
        }
    },
    {
        "type": "function",
        "function": {
            "name": "simulate_savings",
            "description": "Simulates financial impact of reducing spending in a category.",
            "parameters": {
                "type": "object",
                "properties": {
                    "category": {"type": "string", "description": "Target expense category"},
                    "reduction_percentage": {"type": "number", "description": "Percentage cut (e.g. 50)"}
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_recurring_payments",
            "description": "Detects recurring subscription payments.",
            "parameters": {"type": "object", "properties": {}}
        }
    }
]

SYSTEM_PROMPT = """You are Finova AI, an expert Financial AI Copilot embedded inside the user's Smart Expense Analyzer & Financial Health Dashboard.

CORE RESPONSIBILITIES:
1. Provide accurate, clear, and actionable insights about the user's actual financial data.
2. Use available financial tools whenever factual financial information (spending, category totals, health scores, savings rates, budgets, recurring items, or simulations) is required.
3. Be professional, encouraging, concise, and helpful. Use clear bullet points and bold formatting for financial figures.

GROUNDING & TRUTH RULES:
- Tool outputs are the absolute source of truth.
- NEVER invent, guess, or hallucinate transaction amounts, balances, category spend totals, health scores, or percentages.
- When listing transactions (e.g. from get_recent_transactions), ALWAYS format the transaction list as a clean, beautifully formatted Markdown table with headers: | # | Date | Merchant | Category | Type | Amount |.
- For speculative/hypothetical questions ("What if I reduce spending?"), ALWAYS execute the corresponding simulation tool first, then explain the returned simulation numbers.

CURRENCY:
- Always format currency values using the user's currency symbol (defaulting to '$' or '₹' as indicated in tool output)."""

# Health Check Route
@app.get("/api/health")
async def health_check():
    groq_key = os.getenv("GROQ_API_KEY", "").strip()
    return {
        "status": "OK",
        "message": "Finova Backend & AI Agent Running (FastAPI)",
        "groq_configured": bool(groq_key)
    }

# AI Agent Chat Endpoint
@app.post("/api/agent/chat")
async def agent_chat(chat_req: ChatRequest):
    message = chat_req.message.strip()
    context = chat_req.context or {}
    history = chat_req.history or []

    if not message:
        raise HTTPException(status_code=400, detail="Message is required.")

    groq_key = os.getenv("GROQ_API_KEY", "").strip()
    model_name = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

    # If Groq SDK is available and GROQ_API_KEY is configured
    if groq_key:
        try:
            from groq import Groq
            client = Groq(api_key=groq_key)
            
            messages = [{"role": "system", "content": SYSTEM_PROMPT}]
            for h in history:
                role = "user" if h.get("sender") == "user" else "assistant"
                messages.append({"role": role, "content": str(h.get("text", ""))})
            messages.append({"role": "user", "content": message})

            completion = client.chat.completions.create(
                model=model_name,
                messages=messages,
                tools=GROQ_TOOLS,
                tool_choice="auto",
                temperature=0.2
            )

            choice = completion.choices[0]
            resp_msg = choice.message
            executed_tools = []

            if hasattr(resp_msg, 'tool_calls') and resp_msg.tool_calls:
                messages.append(resp_msg)
                for tool_call in resp_msg.tool_calls:
                    fn_name = tool_call.function.name
                    fn_args = {}
                    try:
                        fn_args = json.loads(tool_call.function.arguments or "{}")
                    except Exception:
                        fn_args = {}

                    res = execute_tool_call(fn_name, fn_args, context)
                    executed_tools.append(fn_name)

                    messages.append({
                        "tool_call_id": tool_call.id,
                        "role": "tool",
                        "name": fn_name,
                        "content": json.dumps(res)
                    })

                final_completion = client.chat.completions.create(
                    model=model_name,
                    messages=messages,
                    temperature=0.3
                )
                final_text = final_completion.choices[0].message.content or "Here is your financial tool analysis result."
                return {
                    "success": True,
                    "answer": final_text,
                    "tools_used": executed_tools,
                    "grounded": True,
                    "fallback": False
                }

            return {
                "success": True,
                "answer": resp_msg.content or "I can help analyze your transactions, health score, or savings goals.",
                "tools_used": [],
                "grounded": True,
                "fallback": False
            }

        except Exception as e:
            print(f"[Groq API Agent Warning]: {e}")

    # Fallback Deterministic Engine if GROQ_API_KEY is absent or API fails
    q = message.lower().strip()
    match_num = re.search(r'\b(\d+)\b', q)
    parsed_limit = int(match_num.group(1)) if match_num else 10

    if any(k in q for k in ["traction", "transaction", "trans", "tx", "item", "entry", "list", "show", "history"]):
        t_name = "get_recent_transactions"
        t_args = {"limit": parsed_limit}
    elif any(k in q for k in ["where", "spending", "top category", "most"]):
        t_name = "get_top_spending_categories"
        t_args = {"limit": 5}
    elif any(k in q for k in ["health", "score", "status"]):
        t_name = "get_financial_health"
        t_args = {}
    elif any(k in q for k in ["save", "cut", "simulate", "reduce"]):
        t_name = "simulate_savings"
        t_args = {"category": "Food & Dining", "reduction_percentage": 50}
    elif any(k in q for k in ["sub", "recurring", "leak"]):
        t_name = "get_recurring_payments"
        t_args = {}
    else:
        t_name = "get_transaction_summary"
        t_args = {}

    res = execute_tool_call(t_name, t_args, context)
    currency = context.get("currency", "₹")

    if t_name == "get_recent_transactions":
        tx_list = res.get("transactions", [])
        if tx_list:
            ans = f"Here are the first **{len(tx_list)}** transactions from your database (Total: **{res.get('total_matching_transactions')}**):\n\n"
            ans += "| # | Date | Merchant | Category | Type | Amount |\n"
            ans += "|---|---|---|---|---|---|\n"
            for t in tx_list:
                tb = "🟢 Income" if t["type"] == "income" else "🔴 Expense"
                ans += f"| {t['index']} | {t['date']} | **{t['merchant']}** | {t['category']} | {tb} | **{t['amount']}** |\n"
        else:
            ans = "No transactions found in your database. Upload a CSV statement or add entries manually to view them."

    elif t_name == "get_top_spending_categories":
        cats = res.get("top_categories", [])
        ans = "Here are your top spending categories calculated from your dataset:\n\n"
        for c in cats:
            ans += f"• **{c['category']}**: {currency}{c['amount']:.2f} ({c['percentage']}% of total)\n"

    elif t_name == "get_financial_health":
        ans = f"Your Financial Health Score is **{res.get('score')}/100** (Grade: **{res.get('grade')}** - {res.get('status')}).\n\n"
        ans += f"• **Savings Rate:** {res.get('savings_rate')}%\n"
        ans += f"• **Subscription Ratio:** {res.get('subscription_ratio')}%\n"

    elif t_name == "simulate_savings":
        ans = f"**Simulation Result (50% Food & Dining Reduction):**\n\n"
        ans += f"• Estimated Monthly Savings: **{currency}{res.get('estimated_monthly_savings')}**\n"
        ans += f"• Estimated Annual Savings: **{currency}{res.get('estimated_annual_savings')}**\n"
        ans += f"• 1-Year Wealth Projection (7% return): **{currency}{res.get('projected_1yr_investment_growth_at_7pct')}**"

    else:
        ans = f"Here is your current financial summary:\n\n"
        ans += f"• **Total Income:** {currency}{res.get('total_income', 0)}\n"
        ans += f"• **Total Expenses:** {currency}{res.get('total_expenses', 0)}\n"
        ans += f"• **Net Savings:** {currency}{res.get('net_savings', 0)}\n"

    return {
        "success": True,
        "answer": ans,
        "tools_used": [t_name],
        "grounded": True,
        "fallback": True
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 3001))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=False)
