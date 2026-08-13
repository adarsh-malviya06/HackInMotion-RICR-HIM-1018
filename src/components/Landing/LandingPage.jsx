import React from 'react';
import { 
  ArrowRight, 
  Sparkles, 
  UploadCloud, 
  ShieldCheck, 
  TrendingUp, 
  Repeat, 
  PieChart, 
  Bot, 
  CheckCircle2, 
  Zap, 
  Layers, 
  Compass, 
  DollarSign, 
  Activity 
} from 'lucide-react';

export const LandingPage = ({ onNavigateToRegister, onNavigateToLogin }) => {
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const features = [
    {
      icon: <UploadCloud size={24} color="#7c5cff" />,
      title: 'Smart Ingestion',
      description: 'Import bank CSV statements or enter transactions effortlessly with automatic field parsing.'
    },
    {
      icon: <ShieldCheck size={24} color="#10b981" />,
      title: 'Data Cleaning',
      description: 'Normalize messy merchant names, flag duplicate charges, and clean inconsistent records.'
    },
    {
      icon: <TrendingUp size={24} color="#c084fc" />,
      title: 'Financial Intelligence',
      description: 'Understand spending patterns, detect money leaks, track health score, and spot anomalies.'
    },
    {
      icon: <Repeat size={24} color="#f59e0b" />,
      title: 'Recurring & Subscriptions',
      description: 'Auto-detect active subscriptions and identify unexpected recurring expense drains.'
    },
    {
      icon: <PieChart size={24} color="#3b82f6" />,
      title: 'Planning & Budgets',
      description: 'Set category budget limits, track progress towards savings goals, and simulate scenarios.'
    },
    {
      icon: <Bot size={24} color="#ec4899" />,
      title: 'AI Copilot Assistant',
      description: 'Ask natural language questions about your finances and receive live contextual insights.'
    }
  ];

  const steps = [
    {
      step: '01',
      title: 'Import',
      desc: 'Bring in your raw financial records or statement CSVs in seconds.'
    },
    {
      step: '02',
      title: 'Clean',
      desc: 'FINLY normalizes merchant names and flags duplicate entries automatically.'
    },
    {
      step: '03',
      title: 'Understand',
      desc: 'Discover spending trends, money leaks, and your financial health score.'
    },
    {
      step: '04',
      title: 'Plan',
      desc: 'Leverage insights to set category budgets and reach savings goals faster.'
    }
  ];

  const valueProps = [
    {
      title: 'Where your money is going',
      desc: 'Get instant category allocations and monthly trend breakdowns.'
    },
    {
      title: 'What spending patterns are changing',
      desc: 'Automated anomaly detection alerts you to unusual price spikes.'
    },
    {
      title: 'Which recurring expenses drain your budget',
      desc: 'Identify forgotten subscriptions before they renew unexpectedly.'
    },
    {
      title: 'How to plan your next financial move',
      desc: 'Set category limits and track goals with real-time feedback.'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '80px', paddingBottom: '60px' }}>
      {/* --- HERO SECTION --- */}
      <section style={{ textAlign: 'center', maxWidth: '860px', margin: '20px auto 0 auto' }}>
        {/* Product Pill Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          background: '#ffffff',
          borderRadius: 'var(--radius-pill)',
          border: '1px solid #dce0ee',
          boxShadow: '0 2px 8px rgba(25, 23, 40, 0.05)',
          marginBottom: '20px'
        }}>
          <Sparkles size={14} color="var(--accent-purple)" />
          <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-dark)' }}>
            Intelligent Financial Workspace & AI Assistant
          </span>
        </div>

        {/* Hero Headline */}
        <h1 className="display-title" style={{
          fontSize: '3rem',
          fontWeight: 800,
          lineHeight: 1.15,
          color: 'var(--text-dark)',
          marginBottom: '20px',
          letterSpacing: '-0.03em'
        }}>
          Take Control of Your Money <br />
          <span style={{
            background: 'linear-gradient(135deg, #191728 0%, #7c5cff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Before It Controls You.
          </span>
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: '1.1rem',
          color: 'var(--text-muted)',
          lineHeight: 1.6,
          maxWidth: '680px',
          margin: '0 auto 32px auto'
        }}>
          FINLY turns your financial data into clear insights, smarter planning, and actionable decisions — all in one intelligent workspace.
        </p>

        {/* Hero CTA Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <button
            onClick={onNavigateToRegister}
            className="btn-pill-dark"
            style={{ padding: '14px 28px', fontSize: '0.95rem', fontWeight: 700 }}
          >
            Get Started <ArrowRight size={16} />
          </button>

          <button
            onClick={() => scrollToSection('features')}
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
          >
            Explore Features
          </button>
        </div>

        {/* --- PRODUCT PREVIEW CARD --- */}
        <div className="card-white-clean" style={{
          marginTop: '48px',
          padding: '24px',
          borderRadius: '24px',
          boxShadow: '0 20px 50px rgba(25, 23, 40, 0.1), 0 2px 10px rgba(0, 0, 0, 0.03)',
          border: '1px solid #dce0ee',
          textAlign: 'left'
        }}>
          {/* Header row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginLeft: '6px' }}>
                FINLY Live Workspace Preview
              </span>
            </div>
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              color: '#059669',
              padding: '4px 12px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.75rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <Activity size={12} /> Health Score: 88 / 100
            </div>
          </div>

          {/* Stats Row Mockup */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #edf0f8' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Balance</span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-dark)', margin: '4px 0 0 0' }}>₹1,42,850</h3>
            </div>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #edf0f8' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Monthly Income</span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#059669', margin: '4px 0 0 0' }}>+₹85,000</h3>
            </div>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #edf0f8' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Monthly Expenses</span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#e11d48', margin: '4px 0 0 0' }}>-₹32,150</h3>
            </div>
          </div>

          {/* AI Insight Pill */}
          <div style={{
            background: 'var(--bg-card-dark)',
            color: '#ffffff',
            padding: '12px 18px',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.85rem'
          }}>
            <Sparkles size={16} color="#c084fc" style={{ flexShrink: 0 }} />
            <span><strong>AI Insight:</strong> Dining out is 14% higher than last month. Setting a ₹5,000 limit could save ₹2,400 monthly.</span>
          </div>
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section id="features" style={{ maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 className="display-title" style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '10px' }}>
            Everything You Need for Total Financial Clarity
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Designed to process, clean, and analyze your financial transactions automatically.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px'
        }}>
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="card-white-clean"
              style={{
                padding: '28px',
                borderRadius: '20px',
                border: '1px solid #dce0ee',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                cursor: 'default'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 28px rgba(25, 23, 40, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.04)';
              }}
            >
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: '#f8fafc',
                border: '1px solid #edf0f8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '18px'
              }}>
                {feat.icon}
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '8px' }}>
                {feat.title}
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                {feat.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* --- HOW IT WORKS SECTION --- */}
      <section id="how-it-works" style={{ maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 className="display-title" style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '10px' }}>
            How FINLY Works in 4 Simple Steps
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            A smooth, automated pipeline from raw statement to actionable decisions.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px'
        }}>
          {steps.map((item, idx) => (
            <div
              key={idx}
              style={{
                background: '#ffffff',
                padding: '24px',
                borderRadius: '20px',
                border: '1px solid #dce0ee',
                position: 'relative'
              }}
            >
              <span style={{
                fontSize: '1.8rem',
                fontWeight: 900,
                color: 'var(--accent-purple)',
                opacity: 0.35,
                display: 'block',
                marginBottom: '10px'
              }}>
                {item.step}
              </span>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '6px' }}>
                {item.title}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* --- INTELLIGENCE / VALUE SECTION --- */}
      <section id="intelligence" style={{ maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        <div className="card-dark-violet" style={{
          padding: '44px',
          borderRadius: '24px',
          color: '#ffffff'
        }}>
          <div style={{ maxWidth: '640px', marginBottom: '36px' }}>
            <h2 className="display-title" style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '12px' }}>
              "Your financial data shouldn't just be stored. It should tell you something."
            </h2>
            <p style={{ color: '#d8b4fe', fontSize: '0.95rem' }}>
              FINLY transforms raw database rows into intelligent recommendations.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '20px'
          }}>
            {valueProps.map((vp, i) => (
              <div key={i} style={{
                background: 'rgba(255, 255, 255, 0.08)',
                padding: '20px',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.12)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <CheckCircle2 size={16} color="#34d399" />
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                    {vp.title}
                  </h4>
                </div>
                <p style={{ fontSize: '0.825rem', color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.4, margin: 0 }}>
                  {vp.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- AI COPILOT PRESENTATION SECTION --- */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        <div className="card-white-clean" style={{
          padding: '36px',
          borderRadius: '24px',
          border: '1px solid #dce0ee',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '32px',
          alignItems: 'center'
        }}>
          <div>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'var(--bg-card-dark)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <Bot size={22} color="#c084fc" />
            </div>
            <h2 className="display-title" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '10px' }}>
              Meet Your Personal Financial Copilot
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '20px' }}>
              Ask natural questions about your transactions, financial health, recurring subscriptions, and savings goals. Receive live data-backed answers immediately.
            </p>

            <button
              onClick={onNavigateToRegister}
              className="btn-pill-dark"
              style={{ padding: '10px 22px', fontSize: '0.875rem' }}
            >
              Try AI Copilot <ArrowRight size={14} />
            </button>
          </div>

          {/* Copilot Chat Preview Mockup */}
          <div style={{
            background: '#f8fafc',
            borderRadius: '18px',
            border: '1px solid #edf0f8',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', gap: '8px', alignSelf: 'flex-start' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--bg-card-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={13} color="#c084fc" />
              </div>
              <div style={{ background: '#ffffff', border: '1px solid #dce0ee', padding: '10px 14px', borderRadius: '12px', fontSize: '0.825rem', color: 'var(--text-dark)' }}>
                How can I help you with your finances today?
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignSelf: 'flex-end' }}>
              <div style={{ background: 'var(--bg-card-dark)', color: '#ffffff', padding: '10px 14px', borderRadius: '12px', fontSize: '0.825rem' }}>
                Where am I spending the most this month?
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignSelf: 'flex-start' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--bg-card-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={13} color="#c084fc" />
              </div>
              <div style={{ background: '#ffffff', border: '1px solid #dce0ee', padding: '10px 14px', borderRadius: '12px', fontSize: '0.825rem', color: 'var(--text-dark)' }}>
                Your highest category is <strong>Housing & Utilities (₹25,000)</strong>, followed by <strong>Shopping (₹4,200)</strong>.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FINAL CTA SECTION --- */}
      <section style={{ textAlign: 'center', maxWidth: '640px', margin: '20px auto 0 auto' }}>
        <h2 className="display-title" style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '12px' }}>
          Ready to Understand Your Money Better?
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '28px' }}>
          Turn your raw financial data into smart, actionable decisions today.
        </p>

        <button
          onClick={onNavigateToRegister}
          className="btn-pill-dark"
          style={{ padding: '14px 32px', fontSize: '1rem', fontWeight: 700 }}
        >
          Get Started <ArrowRight size={16} />
        </button>
      </section>
    </div>
  );
};
