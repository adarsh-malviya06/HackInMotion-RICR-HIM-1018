import React, { useState, useRef, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { processCopilotQuery } from '../../services/aiCopilotService';
import { Sparkles, X, Send, Bot, User, Lightbulb, Maximize2, Minimize2 } from 'lucide-react';

export const FloatingAiCopilot = () => {
  const { transactions, budgets, goals, recurring, healthScore, currency } = useFinance();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'How can I help you with your finances?'
    }
  ]);

  const chatContainerRef = useRef(null);

  const quickPrompts = [
    'Where am I spending most?',
    'Financial Health Score',
    'Subscriptions & leaks',
    'How to save ₹500?'
  ];

  useEffect(() => {
    if (isOpen && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isOpen, isExpanded]);

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
    }, 350);
  };

  return (
    <>
      {/* Floating Circular Assistant Trigger Button */}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}
      >
        {/* Hover Tooltip Label */}
        {isHovered && !isOpen && (
          <div
            style={{
              background: 'var(--bg-card-dark)',
              color: '#ffffff',
              padding: '6px 14px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.825rem',
              fontWeight: 600,
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              animation: 'fadeIn 0.15s ease'
            }}
          >
            AI Copilot
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          aria-label="Toggle AI Copilot"
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'var(--bg-card-dark)',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 6px 24px rgba(25, 23, 40, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease',
            transform: isHovered ? 'scale(1.06)' : 'scale(1)'
          }}
        >
          {isOpen ? (
            <X size={22} color="#ffffff" />
          ) : (
            <Sparkles size={22} color="#c084fc" />
          )}
        </button>
      </div>

      {/* Floating AI Chat Panel */}
      {isOpen && (
        <div
          style={
            isExpanded
              ? {
                  position: 'fixed',
                  top: '20px',
                  bottom: '20px',
                  left: '20px',
                  right: '20px',
                  width: 'calc(100vw - 40px)',
                  height: 'calc(100vh - 40px)',
                  maxWidth: '1400px',
                  margin: '0 auto',
                  background: '#ffffff',
                  borderRadius: '20px',
                  border: '1px solid #dce0ee',
                  boxShadow: '0 24px 60px rgba(25, 23, 40, 0.25)',
                  zIndex: 9999,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  fontFamily: 'inherit',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                }
              : {
                  position: 'fixed',
                  bottom: '90px',
                  right: '24px',
                  width: '380px',
                  maxWidth: 'calc(100vw - 32px)',
                  height: '500px',
                  maxHeight: 'calc(100vh - 120px)',
                  background: '#ffffff',
                  borderRadius: '20px',
                  border: '1px solid #dce0ee',
                  boxShadow: '0 16px 40px rgba(25, 23, 40, 0.18), 0 2px 10px rgba(0, 0, 0, 0.05)',
                  zIndex: 9999,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  fontFamily: 'inherit',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                }
          }
        >
          {/* Header */}
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid #edf0f8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f8fafc'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  background: 'var(--bg-card-dark)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Sparkles size={15} color="#c084fc" />
              </div>
              <div>
                <h3
                  className="display-title"
                  style={{
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    color: 'var(--text-dark)',
                    margin: 0,
                    lineHeight: 1.2
                  }}
                >
                  ✦ AI Copilot
                </h3>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Live Financial Assistant
                </span>
              </div>
            </div>

            {/* Header Right Action Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.15s ease, color 0.15s ease'
                }}
                title={isExpanded ? 'Collapse Copilot' : 'Expand Copilot'}
                aria-label={isExpanded ? 'Collapse Copilot' : 'Expand Copilot'}
              >
                {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsExpanded(false);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.15s ease, color 0.15s ease'
                }}
                title="Close Copilot"
                aria-label="Close Copilot"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div
            ref={chatContainerRef}
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              background: '#ffffff'
            }}
          >
            {messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  gap: '8px',
                  alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%'
                }}
              >
                {m.sender === 'bot' && (
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'var(--bg-card-dark)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}
                  >
                    <Bot size={15} color="#c084fc" />
                  </div>
                )}

                <div
                  style={{
                    background: m.sender === 'user' ? 'var(--bg-card-dark)' : '#f1f4fb',
                    color: m.sender === 'user' ? '#ffffff' : 'var(--text-dark)',
                    padding: '12px 16px',
                    borderRadius: '16px',
                    fontSize: '0.85rem',
                    lineHeight: 1.5,
                    whiteSpace: 'pre-wrap',
                    borderBottomRightRadius: m.sender === 'user' ? '4px' : '16px',
                    borderBottomLeftRadius: m.sender === 'bot' ? '4px' : '16px'
                  }}
                >
                  {m.text}
                  {m.recommendation && (
                    <div
                      style={{
                        marginTop: '8px',
                        padding: '8px 12px',
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.25)',
                        borderRadius: '8px',
                        fontSize: '0.78rem',
                        color: '#059669',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Lightbulb size={14} /> {m.recommendation}
                    </div>
                  )}
                </div>

                {m.sender === 'user' && (
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: '#7c5cff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}
                  >
                    <User size={14} color="#ffffff" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Quick Prompts Row */}
          <div
            style={{
              display: 'flex',
              gap: '6px',
              overflowX: 'auto',
              padding: '8px 16px',
              borderTop: '1px solid #edf0f8',
              background: '#f8fafc'
            }}
          >
            {quickPrompts.map((qp, i) => (
              <button
                key={i}
                onClick={() => handleSend(qp)}
                style={{
                  flexShrink: 0,
                  fontSize: '0.72rem',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-pill)',
                  background: '#ffffff',
                  border: '1px solid #dce0ee',
                  color: 'var(--text-dark)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.15s ease'
                }}
              >
                <Sparkles size={10} color="var(--accent-purple)" /> {qp}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
            style={{
              display: 'flex',
              gap: '8px',
              padding: '12px 16px',
              borderTop: '1px solid #edf0f8',
              background: '#ffffff'
            }}
          >
            <input
              type="text"
              className="form-input"
              placeholder="Ask your AI Financial Copilot..."
              value={inputQuery}
              onChange={e => setInputQuery(e.target.value)}
              style={{
                fontSize: '0.825rem',
                borderRadius: 'var(--radius-pill)',
                paddingLeft: '14px',
                paddingRight: '14px',
                height: '38px',
                background: '#f8fafc',
                color: 'var(--text-dark)',
                border: '1px solid #dce0ee'
              }}
            />
            <button
              type="submit"
              className="btn-pill-dark"
              style={{
                padding: '0 16px',
                height: '38px',
                borderRadius: 'var(--radius-pill)',
                flexShrink: 0
              }}
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
