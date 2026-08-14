import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import financialRoutes from './routes/financialRoutes.js';
import { runFinancialAgent } from './agent/agent.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

// Configure CORS for credentialed requests (cookies)
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Allow during local dev testing
      }
    },
    credentials: true
  })
);

// Middleware
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Finova Backend & AI Agent Running',
    groq_configured: Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim() !== '')
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api', financialRoutes);

// AI Agent Chat Endpoint
app.post('/api/agent/chat', async (req, res) => {
  try {
    const { message, context, history } = req.body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({ error: 'Message is required and must be a non-empty string.' });
    }

    const sanitizedContext = {
      transactions: Array.isArray(context?.transactions) ? context.transactions : [],
      budgets: Array.isArray(context?.budgets) ? context.budgets : [],
      goals: Array.isArray(context?.goals) ? context.goals : [],
      recurring: Array.isArray(context?.recurring) ? context.recurring : [],
      healthScore: typeof context?.healthScore === 'object' ? context.healthScore : {},
      currency: context?.currency || '₹'
    };

    const result = await runFinancialAgent({
      message: message.trim(),
      userContext: sanitizedContext,
      history: Array.isArray(history) ? history : []
    });

    return res.json({
      success: true,
      answer: result.answer,
      tools_used: result.tools_used || [],
      grounded: true,
      fallback: Boolean(result.fallback)
    });
  } catch (error) {
    console.error('API Error in /api/agent/chat:', error);
    return res.status(500).json({
      success: false,
      error: 'I couldn\'t retrieve your financial data right now. Please try again.'
    });
  }
});

// Global 404 Route Handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Global Error Handler
app.use((err, req, res, _next) => {
  console.error('[Server Error]:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`[Finova Server] Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  } catch (_err) {
    console.error(`[Finova Server Fatal] Server failed to start due to database connection failure.`);
    process.exit(1);
  }
}

startServer();
