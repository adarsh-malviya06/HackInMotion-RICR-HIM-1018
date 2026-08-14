# Finova API Documentation

## Overview

Finova is an intelligent financial engine & AI-powered personal wealth workspace. The backend API is built using **Node.js** and **Express 5**, providing secure user authentication, user-isolated financial data operations, automatic transaction categorization, bank CSV statement bulk ingestion with duplicate protection, category budget tracking, savings goal management, and an AI agent orchestration system powered by Groq SDK with deterministic offline fallbacks.

---

## Base URL

### Local Development
```http
http://localhost:5000
```

### Production Deployment
```http
https://finova-backend.onrender.com
```

---

## Authentication

Finova uses **JSON Web Tokens (JWT)** for authenticating user requests. Tokens are generated upon successful login/registration with a 1-day expiration time.

### Authentication Mechanisms Supported
1. **HttpOnly Cookie (Primary)**: Sent automatically by browsers via `credentials: 'include'`.
   ```http
   Cookie: token=<JWT_TOKEN>
   ```
2. **Authorization Header (API Clients Fallback)**:
   ```http
   Authorization: Bearer <JWT_TOKEN>
   ```

### User Data Isolation & Security
Every protected API endpoint invokes the `protect` middleware ([authMiddleware.js](file:///c:/Users/Hp/OneDrive/Desktop/HackInMotion-RICR-HIM-1018/backend/middleware/authMiddleware.js)). This extracts the verified user ID (`req.user.id`) from the JWT and scopes all database queries directly to the authenticated user. User A cannot view, modify, or delete User B's financial data (attempts return `404 Not Found`).

---

## API Response Format

All JSON API endpoints return structured HTTP responses.

### Successful Response Example
```json
{
  "message": "Operation completed successfully",
  "data": { ... }
}
```

### Error Response Format
```json
{
  "message": "Detailed error message describing failure"
}
```

---

## Error Handling & HTTP Status Codes

| Status Code | Meaning | Cause / Scenario |
|:---:|---|---|
| **200 OK** | Success | Request succeeded (GET, PUT, login, fetch) |
| **201 Created** | Created | Resource successfully created (User, Transaction, Goal) |
| **400 Bad Request** | Invalid Input | Missing required fields, invalid email format, or invalid parameters |
| **401 Unauthorized** | Auth Failure | Missing token, invalid token, or expired session |
| **404 Not Found** | Resource Missing | Item does not exist or belongs to another user |
| **500 Server Error** | System Failure | Database connection or server processing error |

---

## Authentication APIs

### `POST /api/auth/register`

**Purpose:** Register a new user account and hash their password securely.

- **Authentication:** Not Required
- **Content-Type:** `application/json`

#### Request Body
```json
{
  "name": "Alex Morgan",
  "email": "alex@finova.ai",
  "password": "password123"
}
```

#### Response (`201 Created`)
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "60d5ecb8b5c9c22b10a9a101",
    "name": "Alex Morgan",
    "email": "alex@finova.ai"
  }
}
```

---

### `POST /api/auth/login`

**Purpose:** Authenticate user credentials and establish an HttpOnly cookie session.

- **Authentication:** Not Required
- **Content-Type:** `application/json`

#### Request Body
```json
{
  "email": "alex@finova.ai",
  "password": "password123"
}
```

#### Response (`200 OK`)
Sets `Set-Cookie: token=<JWT_TOKEN>; HttpOnly; SameSite=Lax`.
```json
{
  "message": "Logged in successfully",
  "user": {
    "id": "60d5ecb8b5c9c22b10a9a101",
    "name": "Alex Morgan",
    "email": "alex@finova.ai"
  }
}
```

---

### `GET /api/auth/me`

**Purpose:** Retrieve the currently authenticated user's profile.

- **Authentication:** Required (`protect` middleware)

#### Response (`200 OK`)
```json
{
  "user": {
    "id": "60d5ecb8b5c9c22b10a9a101",
    "name": "Alex Morgan",
    "email": "alex@finova.ai"
  }
}
```

---

### `POST /api/auth/logout`

**Purpose:** Log out the user and clear the authentication cookie.

- **Authentication:** Not Required

#### Response (`200 OK`)
```json
{
  "message": "Logged out successfully"
}
```

---

## Transaction APIs

### `GET /api/transactions`

**Purpose:** Retrieve all financial transactions owned by the authenticated user.

- **Authentication:** Required (`protect` middleware)

#### Response (`200 OK`)
```json
[
  {
    "_id": "60d5ecb8b5c9c22b10a9a201",
    "userId": "60d5ecb8b5c9c22b10a9a101",
    "merchant": "Swiggy",
    "raw_description": "Swiggy Food Delivery",
    "amount": 450,
    "type": "expense",
    "category": "Food & Dining",
    "date": "2026-08-01",
    "payment_method": "Credit Card",
    "is_recurring": false,
    "createdAt": "2026-08-01T10:30:00.000Z"
  }
]
```

---

### `POST /api/transactions`

**Purpose:** Create a single financial transaction item for the authenticated user.

- **Authentication:** Required (`protect` middleware)
- **Content-Type:** `application/json`

#### Request Body
```json
{
  "merchant": "Starbucks",
  "raw_description": "Starbucks Coffee",
  "amount": 380,
  "type": "expense",
  "category": "Food & Dining",
  "date": "2026-08-02",
  "payment_method": "Card",
  "is_recurring": false
}
```

#### Response (`201 Created`)
```json
{
  "_id": "60d5ecb8b5c9c22b10a9a202",
  "userId": "60d5ecb8b5c9c22b10a9a101",
  "merchant": "Starbucks",
  "raw_description": "Starbucks Coffee",
  "amount": 380,
  "type": "expense",
  "category": "Food & Dining",
  "date": "2026-08-02",
  "payment_method": "Card",
  "is_recurring": false
}
```

---

### `POST /api/transactions/import`

**Purpose:** Bulk ingest parsed CSV bank statement records with automated merchant normalization, category assignment, and intra-batch/DB duplicate protection.

- **Authentication:** Required (`protect` middleware)
- **Content-Type:** `application/json`

#### Request Body
```json
{
  "items": [
    {
      "date": "2026-08-01",
      "merchant": "Swiggy",
      "raw_description": "Swiggy Food Delivery",
      "amount": 450,
      "type": "expense",
      "category": "Food & Dining"
    },
    {
      "date": "2026-08-02",
      "merchant": "Amazon",
      "raw_description": "Online Shopping",
      "amount": 1200,
      "type": "expense",
      "category": "Shopping"
    }
  ],
  "filesProcessed": 1,
  "fileNames": ["August_Statement.csv"]
}
```

#### Response (`201 Created`)
```json
{
  "success": true,
  "message": "Import complete: 2 new transactions added, 0 duplicates skipped.",
  "summary": {
    "totalRows": 2,
    "imported": 2,
    "duplicates": 0,
    "invalid": 0,
    "filesProcessed": 1,
    "fileNames": ["August_Statement.csv"]
  },
  "data": [
    {
      "_id": "60d5ecb8b5c9c22b10a9a203",
      "userId": "60d5ecb8b5c9c22b10a9a101",
      "merchant": "Swiggy",
      "amount": 450,
      "type": "expense",
      "category": "Food & Dining",
      "date": "2026-08-01"
    }
  ]
}
```

---

### `GET /api/transactions/:id`

**Purpose:** Retrieve a single transaction by ID. Returns `404 Not Found` if the item belongs to another user.

- **Authentication:** Required (`protect` middleware)

#### Response (`200 OK`)
```json
{
  "_id": "60d5ecb8b5c9c22b10a9a201",
  "userId": "60d5ecb8b5c9c22b10a9a101",
  "merchant": "Swiggy",
  "amount": 450,
  "type": "expense",
  "category": "Food & Dining",
  "date": "2026-08-01"
}
```

---

### `PUT /api/transactions/:id`

**Purpose:** Update an existing transaction record.

- **Authentication:** Required (`protect` middleware)
- **Content-Type:** `application/json`

#### Request Body
```json
{
  "merchant": "Swiggy India",
  "amount": 480
}
```

#### Response (`200 OK`)
```json
{
  "_id": "60d5ecb8b5c9c22b10a9a201",
  "userId": "60d5ecb8b5c9c22b10a9a101",
  "merchant": "Swiggy India",
  "amount": 480,
  "category": "Food & Dining"
}
```

---

### `DELETE /api/transactions/:id`

**Purpose:** Delete a transaction record by ID.

- **Authentication:** Required (`protect` middleware)

#### Response (`200 OK`)
```json
{
  "message": "Transaction deleted successfully"
}
```

---

## Budget APIs

### `GET /api/budgets`

**Purpose:** Retrieve all monthly budget spending limits configured by the authenticated user.

- **Authentication:** Required (`protect` middleware)

#### Response (`200 OK`)
```json
[
  {
    "_id": "60d5ecb8b5c9c22b10a9a301",
    "userId": "60d5ecb8b5c9c22b10a9a101",
    "category": "Food & Dining",
    "monthly_limit": 5000
  }
]
```

---

### `POST /api/budgets`

**Purpose:** Create or update (upsert) a category spending limit for the authenticated user.

- **Authentication:** Required (`protect` middleware)
- **Content-Type:** `application/json`

#### Request Body
```json
{
  "category": "Food & Dining",
  "monthly_limit": 6000
}
```

#### Response (`200 OK`)
```json
{
  "_id": "60d5ecb8b5c9c22b10a9a301",
  "userId": "60d5ecb8b5c9c22b10a9a101",
  "category": "Food & Dining",
  "monthly_limit": 6000
}
```

---

## Savings Goal APIs

### `GET /api/goals`

**Purpose:** Retrieve all savings goals created by the authenticated user.

- **Authentication:** Required (`protect` middleware)

#### Response (`200 OK`)
```json
[
  {
    "_id": "60d5ecb8b5c9c22b10a9a401",
    "userId": "60d5ecb8b5c9c22b10a9a101",
    "name": "Emergency Fund",
    "target_amount": 50000,
    "current_amount": 15000,
    "target_date": "2026-12-31"
  }
]
```

---

### `POST /api/goals`

**Purpose:** Create a new savings goal for the authenticated user.

- **Authentication:** Required (`protect` middleware)
- **Content-Type:** `application/json`

#### Request Body
```json
{
  "name": "Emergency Fund",
  "target_amount": 50000,
  "current_amount": 10000,
  "target_date": "2026-12-31"
}
```

#### Response (`201 Created`)
```json
{
  "_id": "60d5ecb8b5c9c22b10a9a401",
  "userId": "60d5ecb8b5c9c22b10a9a101",
  "name": "Emergency Fund",
  "target_amount": 50000,
  "current_amount": 10000,
  "target_date": "2026-12-31"
}
```

---

### `POST /api/goals/:id/deposit`

**Purpose:** Deposit funds into an existing savings goal.

- **Authentication:** Required (`protect` middleware)
- **Content-Type:** `application/json`

#### Request Body
```json
{
  "amount": 5000
}
```

#### Response (`200 OK`)
```json
{
  "_id": "60d5ecb8b5c9c22b10a9a401",
  "userId": "60d5ecb8b5c9c22b10a9a101",
  "name": "Emergency Fund",
  "target_amount": 50000,
  "current_amount": 15000,
  "target_date": "2026-12-31"
}
```

---

## AI Agent Assistant APIs

### `POST /api/agent/chat`

**Purpose:** Process natural language financial queries using the Groq AI agent SDK (`llama-3.3-70b-versatile`) with 18 structured financial tools and deterministic offline fallbacks.

- **Authentication:** Public / Context-Grounded
- **Content-Type:** `application/json`

#### Request Body
```json
{
  "message": "How much did I spend on Food & Dining?",
  "context": {
    "transactions": [
      { "merchant": "Swiggy", "amount": 450, "category": "Food & Dining", "type": "expense" }
    ],
    "budgets": [{ "category": "Food & Dining", "monthly_limit": 5000 }],
    "goals": [],
    "currency": "₹"
  },
  "history": []
}
```

#### Response (`200 OK`)
```json
{
  "success": true,
  "answer": "You spent **₹450.00** on Food & Dining across 1 transaction. This represents 100% of your total expense outflow.",
  "tools_used": ["get_category_spending"],
  "grounded": true,
  "fallback": false
}
```

---

## Health Check API

### `GET /api/health`

**Purpose:** Backend system health check and Groq API readiness verification.

- **Authentication:** Not Required

#### Response (`200 OK`)
```json
{
  "status": "OK",
  "message": "Finova Backend & AI Agent Running",
  "groq_configured": true
}
```

---

## Complete Endpoint Summary Table

| Method | Path | Auth Required | Purpose | Controller Function |
|:---:|---|:---:|---|---|
| `GET` | `/api/health` | No | System health status | inline in `server.js` |
| `POST` | `/api/auth/register` | No | Register new user account | `registerUser` |
| `POST` | `/api/auth/login` | No | Authenticate user & set JWT cookie | `loginUser` |
| `GET` | `/api/auth/me` | Yes | Get authenticated user profile | `getMe` |
| `POST` | `/api/auth/logout` | No | Clear authentication cookie | `logoutUser` |
| `GET` | `/api/transactions` | Yes | Get all user transactions | `getTransactions` |
| `POST` | `/api/transactions` | Yes | Create single transaction | `createTransaction` |
| `POST` | `/api/transactions/import` | Yes | Bulk ingest CSV transactions | `bulkImportTransactions` |
| `GET` | `/api/transactions/:id` | Yes | Get transaction by ID | `getTransactionById` |
| `PUT` | `/api/transactions/:id` | Yes | Update transaction | `updateTransaction` |
| `DELETE` | `/api/transactions/:id` | Yes | Delete transaction | `deleteTransaction` |
| `GET` | `/api/budgets` | Yes | Get user budget limits | `getBudgets` |
| `POST` | `/api/budgets` | Yes | Create/update category budget | `saveBudget` |
| `GET` | `/api/goals` | Yes | Get user savings goals | `getGoals` |
| `POST` | `/api/goals` | Yes | Create savings goal | `createGoal` |
| `POST` | `/api/goals/:id/deposit` | Yes | Add funds to savings goal | `depositGoal` |
| `POST` | `/api/agent/chat` | No | AI natural language query assistant | `runFinancialAgent` |

---

## Environment Variables Configuration

| Variable | Purpose | Location | Required | Default |
|---|---|---|:---:|---|
| `PORT` | Backend Express server port | `backend/.env` | No | `5000` |
| `JWT_SECRET` | Secret key for signing JWT tokens | `backend/.env` | Yes | `finova_jwt_secret_key...` |
| `MONGO_URI` | MongoDB Atlas / Local MongoDB URI | `backend/.env` | No | `mongodb://127.0.0.1:27017/finova_db` |
| `GROQ_API_KEY` | Groq LLM API Key for AI Agent | `backend/.env` | No | Optional (uses fallback if empty) |
| `GROQ_MODEL` | Target Groq LLM Model name | `backend/.env` | No | `llama-3.3-70b-versatile` |
| `VITE_API_URL` | Frontend API base URL | Vite Client | No | `http://localhost:5000` |

---

## Verification & Automated Test Suites

The API endpoints have been verified using automated Node.js test suites:
- **Security & User Isolation Test**: Executed via `npm run test` (`backend/test_financial_security_api.js`).
- **5-User Multi-Account Demo Persistence Test**: Executed via `node backend/test_5_user_demo_persistence.js` (**100% PASSED**).

---

## Production Deployment Architecture

- **Frontend Hosting**: Deployed on **Vercel** with client-side SPA routing (`vercel.json`).
- **Backend Hosting**: Deployed on **Render** running `node backend/server.js`.
- **Database Engine**: Persistent MongoDB WiredTiger storage engine (`./backend/data/db`) with fallback support for **MongoDB Atlas**.
