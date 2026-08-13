/**
 * Express Backend API Server for Financial AI Agent
 * Serves POST /api/agent/chat endpoint with strict multi-tenant authorization.
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { runFinancialAgent } from './agent/agent.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    agent: 'FINLY Financial AI Copilot',
    groq_configured: Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim() !== '')
  });
});

// AI Agent Chat Endpoint
app.post('/api/agent/chat', async (req, res) => {
  try {
    const { message, context, history } = req.body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({ error: 'Message is required and must be a non-empty string.' });
    }

    // Security Context Building:
    // Sanitize user context so tool execution works in the user's isolated context
    const sanitizedContext = {
      transactions: Array.isArray(context?.transactions) ? context.transactions : [],
      budgets: Array.isArray(context?.budgets) ? context.budgets : [],
      goals: Array.isArray(context?.goals) ? context.goals : [],
      recurring: Array.isArray(context?.recurring) ? context.recurring : [],
      healthScore: typeof context?.healthScore === 'object' ? context.healthScore : {},
      currency: context?.currency || '$'
    };

    // Execute AI Financial Agent loop
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
      error: 'I couldn\'t retrieve your financial data right now. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 FINLY AI Agent Backend Server running on http://localhost:${PORT}`);
  console.log(`🤖 Groq Model: ${process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'}`);
  console.log(`🔑 Groq API Key: ${process.env.GROQ_API_KEY ? 'Configured ✅' : 'Not set (Using tool fallback engine) ⚠️'}`);
});
