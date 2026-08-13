import React, { useState, useRef, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { processCopilotQueryAsync } from '../../services/aiCopilotService';
import { Sparkles, X, Send, Bot, User, Lightbulb, Maximize2, Minimize2, Loader2, Wrench } from 'lucide-react';

export const FloatingAiCopilot = () => {
  const { transactions, budgets, goals, recurring, healthScore, currency } = useFinance();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
  }, [messages, isOpen, isExpanded, isLoading]);

  const handleSend = async (textToSend = inputQuery) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg = { sender: 'user', text: textToSend };
    const history = messages.slice(1); // Exclude initial greeting from history array
    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const result = await processCopilotQueryAsync(textToSend, {
        transactions,
        budgets,
        goals,
        recurring,
        healthScore,
        currency
      }, history);

      const botMsg = {
        sender: 'bot',
        text: result.answer,
        recommendation: result.recommendation,
        tools_used: result.tools_used || []
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: "I couldn't retrieve your financial data right now. Please try again."
      }]);
    } finally {
      setIsLoading(false);
    }
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
                  Groq LLM + Financial Tool Calling
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

                  {m.tools_used && m.tools_used.length > 0 && (
                    <div style={{ marginTop: '6px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {m.tools_used.map((tool, ti) => (
                        <span
                          key={ti}
                          style={{
                            fontSize: '0.68rem',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: 'rgba(124, 92, 255, 0.1)',
                            color: '#7c5cff',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}
                        >
                          <Wrench size={10} /> {tool}
                        </span>
                      ))}
                    </div>
                  )}

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

            {/* Loading Indicator */}
            {isLoading && (
              <div style={{ display: 'flex', gap: '8px', alignSelf: 'flex-start', maxWidth: '85%' }}>
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
                <div
                  style={{
                    background: '#f1f4fb',
                    color: 'var(--text-muted)',
                    padding: '10px 14px',
                    borderRadius: '16px',
                    fontSize: '0.825rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    borderBottomLeftRadius: '4px'
                  }}
                >
                  <Loader2 size={14} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
                  Analyzing financial data with Groq tools...
                </div>
              </div>
            )}
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
                disabled={isLoading}
                style={{
                  flexShrink: 0,
                  fontSize: '0.72rem',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-pill)',
                  background: '#ffffff',
                  border: '1px solid #dce0ee',
                  color: 'var(--text-dark)',
                  fontWeight: 600,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  opacity: isLoading ? 0.6 : 1,
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
              disabled={isLoading}
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
              disabled={isLoading || !inputQuery.trim()}
              style={{
                padding: '0 16px',
                height: '38px',
                borderRadius: 'var(--radius-pill)',
                flexShrink: 0,
                opacity: (isLoading || !inputQuery.trim()) ? 0.6 : 1
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
