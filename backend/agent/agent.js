/**
 * Main AI Agent Orchestration Engine
 * Uses official Groq SDK + Tool Calling for grounded financial answers.
 */

import Groq from 'groq-sdk';
import { SYSTEM_PROMPT } from './system_prompt.js';
import { TOOLS_DEFINITIONS, executeToolCall } from './tools/index.js';

export const runFinancialAgent = async ({ message, userContext, history = [] }) => {
  const apiKey = process.env.GROQ_API_KEY;
  const modelName = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

  // Fallback engine when GROQ_API_KEY is not configured or in offline demo mode
  if (!apiKey || apiKey.trim() === '') {
    return handleDeterministicFallback(message, userContext);
  }

  const groq = new Groq({ apiKey });

  try {
    // Format conversation history for Groq
    const conversation = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.map(h => ({
        role: h.sender === 'user' ? 'user' : 'assistant',
        content: h.text
      })),
      { role: 'user', content: message }
    ];

    // Initial call to Groq with tool definitions
    const completion = await groq.chat.completions.create({
      model: modelName,
      messages: conversation,
      tools: TOOLS_DEFINITIONS,
      tool_choice: 'auto',
      temperature: 0.2
    });

    const choice = completion.choices[0];
    const responseMessage = choice.message;
    const executedTools = [];

    // Check if Groq decided to invoke tool calls
    if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
      conversation.push(responseMessage); // Add assistant message with tool calls

      for (const toolCall of responseMessage.tool_calls) {
        const functionName = toolCall.function.name;
        let functionArgs = {};
        try {
          functionArgs = JSON.parse(toolCall.function.arguments || '{}');
        } catch (e) {
          functionArgs = {};
        }

        // Execute tool call on trusted backend financial data
        const toolResult = executeToolCall(functionName, functionArgs, userContext);
        executedTools.push({ name: functionName, args: functionArgs, result: toolResult });

        conversation.push({
          tool_call_id: toolCall.id,
          role: 'tool',
          name: functionName,
          content: JSON.stringify(toolResult)
        });
      }

      // Re-invoke Groq to generate grounded natural language explanation of tool results
      const finalCompletion = await groq.chat.completions.create({
        model: modelName,
        messages: conversation,
        temperature: 0.3
      });

      const finalAnswer = finalCompletion.choices[0]?.message?.content || 'Here are your financial tool analysis results.';
      return {
        answer: finalAnswer,
        tools_used: executedTools.map(t => t.name),
        grounded: true
      };
    }

    // Direct text response if no tools were required
    return {
      answer: responseMessage.content || 'I can help analyze your transactions, health score, or budget goals.',
      tools_used: [],
      grounded: true
    };
  } catch (error) {
    console.error('Groq API Agent Error:', error.message);
    // Graceful error recovery: fall back to tool execution engine
    return handleDeterministicFallback(message, userContext, error.message);
  }
};

/**
 * Fallback Execution Engine
 * Evaluates intent and executes relevant tools directly when LLM API is unavailable.
 */
function handleDeterministicFallback(query, userContext, apiErrorMessage = null) {
  const q = query.toLowerCase();

  let toolName = 'get_transaction_summary';
  let toolArgs = {};

  if (q.includes('where') || q.includes('spending') || q.includes('top category') || q.includes('most')) {
    toolName = 'get_top_spending_categories';
    toolArgs = { limit: 5 };
  } else if (q.includes('health') || q.includes('score') || q.includes('status')) {
    toolName = 'get_financial_health';
  } else if (q.includes('save') || q.includes('cut') || q.includes('simulate') || q.includes('reduce')) {
    toolName = 'simulate_savings';
    toolArgs = { category: 'Food & Dining', reduction_percentage: 50 };
  } else if (q.includes('sub') || q.includes('recurring') || q.includes('leak')) {
    toolName = 'get_recurring_payments';
  } else if (q.includes('budget')) {
    toolName = 'get_budget_status';
  } else if (q.includes('goal')) {
    toolName = 'get_savings_goals';
  }

  const result = executeToolCall(toolName, toolArgs, userContext);
  const currency = userContext.currency || '$';

  let answerText = '';
  if (toolName === 'get_top_spending_categories' && result.top_categories?.length) {
    answerText = `Here are your top spending categories calculated from your dataset:\n\n`;
    result.top_categories.forEach(c => {
      answerText += `• **${c.category}**: ${currency}${c.amount.toFixed(2)} (${c.percentage}% of total)\n`;
    });
  } else if (toolName === 'get_financial_health') {
    answerText = `Your Financial Health Score is **${result.score}/100** (Grade: **${result.grade}** - ${result.status}).\n\n`;
    answerText += `• **Savings Rate:** ${result.savings_rate}%\n`;
    answerText += `• **Subscription Ratio:** ${result.subscription_ratio}%\n`;
    if (result.insights && result.insights.length) {
      answerText += `\n**Key Insight:** ${result.insights[0]}`;
    }
  } else if (toolName === 'simulate_savings') {
    answerText = `**Simulation Result (50% Food & Dining Reduction):**\n\n`;
    answerText += `• Estimated Monthly Savings: **${currency}${result.estimated_monthly_savings}**\n`;
    answerText += `• Estimated Annual Savings: **${currency}${result.estimated_annual_savings}**\n`;
    answerText += `• 1-Year Wealth Projection (7% return): **${currency}${result.projected_1yr_investment_growth_at_7pct}**`;
  } else if (toolName === 'get_recurring_payments' && result.recurring_payments?.length) {
    answerText = `**Recurring Payments & Subscriptions:**\n\n`;
    result.recurring_payments.forEach(r => {
      answerText += `• **${r.merchant}**: ${currency}${r.amount.toFixed(2)} (${r.billing_cycle})\n`;
    });
    answerText += `\n*Total Monthly Commitment:* ${currency}${result.total_monthly_commitment || 0}\n`;
    answerText += `*Notice: Recurring payment detected — consider reviewing whether you still use it.*`;
  } else {
    answerText = `Here is your current financial summary:\n\n`;
    answerText += `• **Total Income:** ${currency}${result.total_income || 0}\n`;
    answerText += `• **Total Expenses:** ${currency}${result.total_expenses || 0}\n`;
    answerText += `• **Net Savings:** ${currency}${result.net_savings || 0}\n`;
  }

  if (apiErrorMessage) {
    console.warn(`[Agent Fallback Used due to API error: ${apiErrorMessage}]`);
  }

  return {
    answer: answerText,
    tools_used: [toolName],
    grounded: true,
    fallback: true
  };
}
