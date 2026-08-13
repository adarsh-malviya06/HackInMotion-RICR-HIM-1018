import React, { useState } from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { SettingsModal } from './components/SettingsModal';

import { LoginPage } from './components/Auth/LoginPage';
import { RegisterPage } from './components/Auth/RegisterPage';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { LandingPage } from './components/Landing/LandingPage';

import { FinancialDashboard } from './components/Dashboard/FinancialDashboard';
import { TransactionIngestion } from './components/Ingestion/TransactionIngestion';
import { DataIntelligenceCenter } from './components/Intelligence/DataIntelligenceCenter';
import { FinancialIntelligence } from './components/Intelligence/FinancialIntelligence';
import { RecurringTracker } from './components/Subscriptions/RecurringTracker';
import { BudgetPlanner } from './components/Planning/BudgetPlanner';
import { WhatIfSimulator } from './components/Simulator/WhatIfSimulator';
import { FloatingAiCopilot } from './components/Copilot/FloatingAiCopilot';

const MainLayout = () => {
  const { activeTab, toast, fetchUserFinancialData, clearAllData } = useFinance();
  const { user, isAuthenticated, loading } = useAuth();
  const [viewRoute, setViewRoute] = useState('landing'); // 'landing' | 'login' | 'register'
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  React.useEffect(() => {
    if (isAuthenticated && user) {
      if (typeof fetchUserFinancialData === 'function') {
        fetchUserFinancialData();
      }
    } else if (!isAuthenticated && !loading) {
      if (typeof clearAllData === 'function') {
        clearAllData();
      }
    }
  }, [user?.id, isAuthenticated, loading, fetchUserFinancialData, clearAllData]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard': return <FinancialDashboard />;
      case 'ingestion': return <TransactionIngestion />;
      case 'data-intelligence': return <DataIntelligenceCenter />;
      case 'financial-intelligence': return <FinancialIntelligence />;
      case 'subscriptions': return <RecurringTracker />;
      case 'planning': return <BudgetPlanner />;
      case 'simulator': return <WhatIfSimulator />;
      default: return <FinancialDashboard />;
    }
  };

  const renderMainView = () => {
    if (isAuthenticated) {
      return (
        <ProtectedRoute onRedirectToLogin={() => setViewRoute('login')}>
          {renderTabContent()}
        </ProtectedRoute>
      );
    }

    if (viewRoute === 'login') {
      return (
        <LoginPage
          onNavigateToRegister={() => setViewRoute('register')}
          onLoginSuccess={() => setViewRoute('landing')}
        />
      );
    }

    if (viewRoute === 'register') {
      return (
        <RegisterPage
          onNavigateToLogin={() => setViewRoute('login')}
          onRegisterSuccess={() => setViewRoute('login')}
        />
      );
    }

    // Default Unauthenticated State: Public Landing Page
    return (
      <LandingPage
        onNavigateToRegister={() => setViewRoute('register')}
        onNavigateToLogin={() => setViewRoute('login')}
      />
    );
  };

  return (
    <div className="outer-website-frame">
      {/* Toast Banner */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '90px',
          right: '24px',
          background: 'var(--bg-card-dark)',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: 'var(--radius-pill)',
          boxShadow: 'var(--shadow-dark)',
          fontSize: '0.875rem',
          fontWeight: 600,
          zIndex: 10000
        }}>
          {toast.message}
        </div>
      )}

      {/* Top Navbar */}
      <Navbar 
        onNavigateToLogin={() => setViewRoute('login')}
        onNavigateToRegister={() => setViewRoute('register')}
      />

      {/* Main Workspace View */}
      <main style={{ minHeight: 'calc(100vh - 180px)' }}>
        {renderMainView()}
      </main>

      {/* Persistent Floating AI Copilot Assistant */}
      <FloatingAiCopilot />

      {/* Modals */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
};

export default function App() {
  return (
    <FinanceProvider>
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </FinanceProvider>
  );
}
