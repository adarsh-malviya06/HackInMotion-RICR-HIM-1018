import React from 'react';
import { 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  TrendingUp, 
  Compass, 
  Bot, 
  AlertTriangle,
  Activity,
  CheckCircle2
} from 'lucide-react';

export const HeroSection = ({ onNavigateToRegister, scrollToSection }) => {
  return (
    <section style={{ maxWidth: '1240px', margin: '0 auto', width: '100%', position: 'relative' }}>
      {/* Background radial glow effect */}
      <div className="hero-glow-bg" />

      <div className="hero-redesign-grid fade-in-up">
        {/* ==================== LEFT HERO COLUMN ==================== */}
        <div className="hero-left-col">
          {/* Top Pill Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            background: '#ffffff',
            borderRadius: 'var(--radius-pill)',
            border: '1px solid #dce0ee',
            boxShadow: '0 2px 10px rgba(124, 92, 255, 0.08)',
            marginBottom: '20px'
          }}>
            <Sparkles size={14} color="var(--accent-purple)" />
            <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--accent-purple)' }}>
              ✦ Intelligent Financial Workspace & AI Assistant
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="display-title" style={{
            fontSize: '3.4rem',
            fontWeight: 800,
            lineHeight: 1.08,
            color: 'var(--text-dark)',
            marginBottom: '20px',
            letterSpacing: '-0.03em'
          }}>
            TAKE<br />
            CONTROL OF<br />
            YOUR MONEY<br />
            <span style={{
              background: 'linear-gradient(135deg, #7c5cff 0%, #906ffa 40%, #c084fc 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'inline-block'
            }}>
              Before it controls you.
            </span>
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: '1.05rem',
            color: 'var(--text-muted)',
            lineHeight: 1.6,
            maxWidth: '460px',
            marginBottom: '28px',
            fontWeight: 500
          }}>
            Upload your transactions. FINLY cleans the mess, finds the patterns, and tells you what to do next.
          </p>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '40px' }}>
            <button
              onClick={onNavigateToRegister}
              className="btn-pill-dark"
              style={{ padding: '14px 28px', fontSize: '0.95rem', fontWeight: 700 }}
            >
              Get Started <ArrowRight size={16} />
            </button>

            <button
              onClick={() => scrollToSection ? scrollToSection('features') : null}
              style={{
                background: '#ffffff',
                color: 'var(--text-dark)',
                border: '1px solid #dce0ee',
                borderRadius: 'var(--radius-pill)',
                padding: '14px 26px',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
            >
              Explore Features
            </button>
          </div>

          {/* LEFT BOTTOM TRUST FEATURES */}
          <div className="hero-trust-highlights" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            paddingTop: '20px',
            borderTop: '1px solid #dce0ee',
            width: '100%',
            maxWidth: '460px'
          }}>
            {/* Feature 1 */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                background: 'rgba(124, 92, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <ShieldCheck size={18} color="var(--accent-purple)" />
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-dark)' }}>
                  Bank-Level Security
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Your data is encrypted and 100% private
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                background: 'rgba(192, 132, 252, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Sparkles size={18} color="#c084fc" />
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-dark)' }}>
                  AI-Powered Insights
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Smart analysis that finds what you miss
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                background: 'rgba(16, 185, 129, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Compass size={18} color="#10b981" />
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-dark)' }}>
                  Actionable Guidance
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Clear steps to save more and stress less
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ==================== RIGHT HERO COLUMN: FINLY COMMAND CENTER ==================== */}
        <div className="hero-right-col">
          {/* FLOATING CARD 1: AI Insight (Top Right) */}
          <div className="floating-card-1 glass-floating-card floating-card-container-mobile" style={{
            position: 'absolute',
            top: '-24px',
            right: '-16px',
            zIndex: 10,
            padding: '14px 18px',
            maxWidth: '280px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #7c5cff, #c084fc)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(124, 92, 255, 0.3)'
            }}>
              <Bot size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-purple)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                AI Insight
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dark)', marginTop: '2px', lineHeight: 1.35 }}>
                You could save <span style={{ color: '#10b981', fontWeight: 800 }}>₹3,200</span> this month by optimizing food delivery & subscriptions.
              </div>
            </div>
          </div>

          {/* MAIN FINLY COMMAND CENTER DASHBOARD CARD */}
          <div className="finly-command-card">
            {/* Card Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 className="display-title" style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, letterSpacing: '-0.01em', color: 'var(--text-dark)' }}>
                  FINLY COMMAND CENTER
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Your Financial Overview
                </span>
              </div>

              {/* Status pill */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(16, 185, 129, 0.1)',
                color: '#059669',
                padding: '5px 12px',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.75rem',
                fontWeight: 700,
                border: '1px solid rgba(16, 185, 129, 0.2)'
              }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                Synced & Active
              </div>
            </div>

            {/* FINANCIAL HEALTH SCORE + SPENDING TREND SECTION (Dark Navy/Purple) */}
            <div style={{
              background: 'var(--bg-card-dark)',
              color: '#ffffff',
              borderRadius: '22px',
              padding: '20px',
              marginBottom: '20px',
              display: 'grid',
              gridTemplateColumns: '1fr 1.3fr',
              gap: '16px',
              boxShadow: '0 8px 24px rgba(25, 23, 40, 0.2)'
            }}>
              {/* LEFT: Financial Health Score */}
              <div style={{ borderRight: '1px solid rgba(255, 255, 255, 0.1)', paddingRight: '16px' }}>
                <span style={{ fontSize: '0.725rem', color: '#9fa2b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Financial Health Score
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '6px' }}>
                  <span style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff', lineHeight: 1 }}>88</span>
                  <span style={{ fontSize: '1.1rem', color: '#c084fc', fontWeight: 700 }}>/ 100</span>
                </div>
                <div style={{
                  display: 'inline-block',
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: '#34d399',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  marginTop: '8px'
                }}>
                  Excellent
                </div>

                {/* Progress Bar */}
                <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.12)', borderRadius: '4px', marginTop: '12px', overflow: 'hidden' }}>
                  <div style={{ width: '88%', height: '100%', background: 'linear-gradient(90deg, #7c5cff 0%, #10b981 100%)', borderRadius: '4px' }} />
                </div>
              </div>

              {/* RIGHT: Spending Trend Chart */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div>
                    <span style={{ fontSize: '0.725rem', color: '#9fa2b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Spending Trend
                    </span>
                    <div style={{ fontSize: '0.75rem', color: '#ffffff', fontWeight: 600 }}>This Month</div>
                  </div>
                  <span style={{
                    fontSize: '0.725rem',
                    fontWeight: 800,
                    background: 'rgba(16, 185, 129, 0.2)',
                    color: '#34d399',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-pill)'
                  }}>
                    +18%
                  </span>
                </div>

                {/* Clean SVG Trend Line Chart */}
                <div style={{ height: '64px', width: '100%', position: 'relative', marginTop: '4px' }}>
                  <svg width="100%" height="100%" viewBox="0 0 240 60" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#7c5cff" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#7c5cff" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Gradient fill beneath curve */}
                    <path
                      d="M 0,45 Q 35,50 70,30 T 140,25 T 200,10 L 240,15 L 240,60 L 0,60 Z"
                      fill="url(#chartGradient)"
                    />

                    {/* Smooth curve line */}
                    <path
                      d="M 0,45 Q 35,50 70,30 T 140,25 T 200,10 L 240,15"
                      fill="none"
                      stroke="#c084fc"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />

                    {/* Active highlight dot */}
                    <circle cx="200" cy="10" r="4" fill="#ffffff" stroke="#7c5cff" strokeWidth="2" />
                  </svg>
                </div>

                {/* Months labels */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#9fa2b8', fontWeight: 600, marginTop: '2px' }}>
                  <span>Jan</span>
                  <span>Feb</span>
                  <span>Mar</span>
                  <span>Apr</span>
                  <span>May</span>
                  <span>Jun</span>
                  <span>Jul</span>
                </div>
              </div>
            </div>

            {/* METRIC CARDS ROW (3 Cards) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
              marginBottom: '20px'
            }}>
              {/* Card 1: Total Balance */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                padding: '12px 14px',
                borderRadius: '16px'
              }}>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 700 }}>Total Balance</span>
                <h4 className="num-mono" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-dark)', margin: '2px 0 0 0' }}>
                  ₹1,42,850
                </h4>
                <span style={{ fontSize: '0.68rem', color: '#7c5cff', fontWeight: 700 }}>+12.5% vs last month</span>
              </div>

              {/* Card 2: Monthly Income */}
              <div style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                padding: '12px 14px',
                borderRadius: '16px'
              }}>
                <span style={{ fontSize: '0.725rem', color: '#166534', fontWeight: 700 }}>Monthly Income</span>
                <h4 className="num-mono" style={{ fontSize: '1.1rem', fontWeight: 800, color: '#15803d', margin: '2px 0 0 0' }}>
                  ₹85,000
                </h4>
                <span style={{ fontSize: '0.68rem', color: '#16a34a', fontWeight: 700 }}>+8.3% vs last month</span>
              </div>

              {/* Card 3: Monthly Expenses */}
              <div style={{
                background: '#fff1f2',
                border: '1px solid #fecdd3',
                padding: '12px 14px',
                borderRadius: '16px'
              }}>
                <span style={{ fontSize: '0.725rem', color: '#9f1239', fontWeight: 700 }}>Monthly Expenses</span>
                <h4 className="num-mono" style={{ fontSize: '1.1rem', fontWeight: 800, color: '#be123c', margin: '2px 0 0 0' }}>
                  ₹32,150
                </h4>
                <span style={{ fontSize: '0.68rem', color: '#e11d48', fontWeight: 700 }}>+15.6% vs last month</span>
              </div>
            </div>

            {/* SPENDING CATEGORIES + EXPENSE BREAKDOWN (2 Column Section inside Card) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 1fr',
              gap: '16px',
              alignItems: 'center',
              background: '#f8fafc',
              padding: '16px',
              borderRadius: '20px',
              border: '1px solid #edf0f8'
            }}>
              {/* TOP SPENDING CATEGORIES LIST */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-dark)' }}>
                    Top Spending Categories
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>This Month</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {/* Category Item 1 */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '2px' }}>
                      <span>Food & Dining</span>
                      <span className="num-mono">₹8,420</span>
                    </div>
                    <div style={{ width: '100%', height: '5px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: '42%', height: '100%', background: '#7c5cff', borderRadius: '3px' }} />
                    </div>
                  </div>

                  {/* Category Item 2 */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '2px' }}>
                      <span>Shopping</span>
                      <span className="num-mono">₹5,120</span>
                    </div>
                    <div style={{ width: '100%', height: '5px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: '28%', height: '100%', background: '#3b82f6', borderRadius: '3px' }} />
                    </div>
                  </div>

                  {/* Category Item 3 */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '2px' }}>
                      <span>Subscriptions</span>
                      <span className="num-mono">₹2,840</span>
                    </div>
                    <div style={{ width: '100%', height: '5px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: '18%', height: '100%', background: '#f59e0b', borderRadius: '3px' }} />
                    </div>
                  </div>

                  {/* Category Item 4 */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '2px' }}>
                      <span>Travel</span>
                      <span className="num-mono">₹2,320</span>
                    </div>
                    <div style={{ width: '100%', height: '5px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: '14%', height: '100%', background: '#10b981', borderRadius: '3px' }} />
                    </div>
                  </div>

                  {/* Category Item 5 */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '2px' }}>
                      <span>Others</span>
                      <span className="num-mono">₹13,450</span>
                    </div>
                    <div style={{ width: '100%', height: '5px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: '56%', height: '100%', background: '#c084fc', borderRadius: '3px' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* EXPENSE BREAKDOWN DONUT CHART */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderLeft: '1px solid #e2e8f0', paddingLeft: '12px' }}>
                <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-dark)' }}>
                    Expense Breakdown
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>This Month</div>
                </div>

                {/* Donut Chart Visual */}
                <div className="donut-chart-circle">
                  <div className="donut-chart-center">
                    <span className="num-mono" style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-dark)' }}>
                      ₹32,150
                    </span>
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FLOATING CARD 2: Money Leak Detected (Bottom Left) */}
          <div className="floating-card-2 glass-floating-card floating-card-container-mobile" style={{
            position: 'absolute',
            bottom: '-24px',
            left: '-20px',
            zIndex: 10,
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            maxWidth: '260px'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#ffe4e6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <AlertTriangle size={18} color="#e11d48" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.78rem', color: '#be123c' }}>
                Money Leak Detected
              </div>
              <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                ₹499/month unused subscription found.
              </div>
              <div style={{ fontSize: '0.725rem', fontWeight: 800, color: 'var(--accent-purple)', cursor: 'pointer', marginTop: '2px' }}>
                Review Now →
              </div>
            </div>
          </div>

          {/* FLOATING CARD 3: Monthly Savings (Bottom Right) */}
          <div className="floating-card-3 glass-floating-card floating-card-container-mobile" style={{
            position: 'absolute',
            bottom: '-20px',
            right: '-16px',
            zIndex: 10,
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            maxWidth: '260px'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#dcfce7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <TrendingUp size={18} color="#166534" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.78rem', color: '#15803d' }}>
                Monthly Savings <span className="num-mono" style={{ fontWeight: 900, color: '#166534' }}>+₹12,450</span>
              </div>
              <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                Great job! You're saving 18% more this month.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
