import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { processCopilotQuery } from '../../services/aiCopilotService';
import { Bot, Send, Sparkles, User, Lightbulb } from 'lucide-react';

export const AiCopilot = () => {
  const { transactions, budgets, goals, recurring, healthScore, currency } = useFinance();
  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: `Hello! I am your **FINLY AI Financial Copilot**. I have full contextual awareness of your database.\n\nAsk me anything about your spending habits, financial health score, money leaks, or how to reach your savings goals faster!`
    }
  ]);

  const quickPrompts = [
    "Where am I spending the most money?",
    "Explain my Financial Health Score",
    "Find all my subscriptions & money leaks",
    "How can I save $500 this month?"
  ];

  const handleSend = (textToSend = inputQuery) => {
    if (!textToSend.trim()) return;

    const userMsg = { sender: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');

    setTimeout(() => {
      const result = processCopilotQuery(textToSend, {
        transactions,
        budgets,
        goals,
        recurring,
        healthScore,
        currency
      });

      const botMsg = {
        sender: 'bot',
        text: result.answer,
        recommendation: result.recommendation
      };

      setMessages(prev => [...prev, botMsg]);
    }, 400);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', height: 'calc(100vh - 160px)' }}>
      <div>
        <h1 className="display-title" style={{ fontSize: '2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Bot size={28} color="var(--accent-purple)" /> AI Financial Copilot
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Conversational AI model with live database context awareness
        </p>
      </div>

      {/* Main Chat Panel */}
      <div className="card-dark-violet" style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '28px',
        minHeight: '420px'
      }}>
        {/* Messages Scroll Area */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px', paddingRight: '8px' }}>
          {messages.map((m, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                gap: '12px',
                alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%'
              }}
            >
              {m.sender === 'bot' && (
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  background: '#c084fc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Bot size={22} color="#191728" />
                </div>
              )}

              <div style={{
                background: m.sender === 'user' ? '#7c5cff' : 'rgba(255, 255, 255, 0.07)',
                border: m.sender === 'user' ? 'none' : '1px solid rgba(255, 255, 255, 0.12)',
                color: '#ffffff',
                padding: '16px 20px',
                borderRadius: '20px',
                fontSize: '0.925rem',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap'
              }}>
                {m.text}
                {m.recommendation && (
                  <div style={{
                    marginTop: '12px',
                    padding: '10px 14px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '10px',
                    fontSize: '0.825rem',
                    color: '#34d399',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <Lightbulb size={16} /> {m.recommendation}
                  </div>
                )}
              </div>

              {m.sender === 'user' && (
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <User size={18} color="#ffffff" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quick Prompts Row */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', margin: '20px 0 14px 0', paddingBottom: '4px' }}>
          {quickPrompts.map((qp, i) => (
            <button
              key={i}
              onClick={() => handleSend(qp)}
              className="btn-pill-white"
              style={{ flexShrink: 0, fontSize: '0.78rem', padding: '6px 14px' }}
            >
              <Sparkles size={12} color="var(--accent-purple)" /> {qp}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} style={{ display: 'flex', gap: '12px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Ask your AI Financial Copilot..."
            value={inputQuery}
            onChange={e => setInputQuery(e.target.value)}
            style={{
              fontSize: '0.9rem',
              borderRadius: 'var(--radius-pill)',
              paddingLeft: '20px',
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.15)'
            }}
          />
          <button type="submit" className="btn-pill-white" style={{ padding: '0 24px' }}>
            <Send size={16} /> Send
          </button>
        </form>
      </div>
    </div>
  );
};
