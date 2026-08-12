import React, { useState } from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Navbar } from './components/Navbar';
import { SettingsModal } from './components/SettingsModal';
import { AuthModal } from './components/AuthModal';

import { FinancialDashboard } from './components/Dashboard/FinancialDashboard';
import { TransactionIngestion } from './components/Ingestion/TransactionIngestion';
import { DataIntelligenceCenter } from './components/Intelligence/DataIntelligenceCenter';
import { FinancialIntelligence } from './components/Intelligence/FinancialIntelligence';
import { RecurringTracker } from './components/Subscriptions/RecurringTracker';
import { BudgetPlanner } from './components/Planning/BudgetPlanner';
import { WhatIfSimulator } from './components/Simulator/WhatIfSimulator';
import { AiCopilot } from './components/Copilot/AiCopilot';

const MainLayout = () => {
  const { activeTab, toast } = useFinance();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard': return <FinancialDashboard />;
      case 'ingestion': return <TransactionIngestion />;
      case 'data-intelligence': return <DataIntelligenceCenter />;
      case 'financial-intelligence': return <FinancialIntelligence />;
      case 'subscriptions': return <RecurringTracker />;
      case 'planning': return <BudgetPlanner />;
      case 'simulator': return <WhatIfSimulator />;
      case 'copilot': return <AiCopilot />;
      default: return <FinancialDashboard />;
    }
  };

  return (
    <div className="outer-website-frame">
      {/* Toast Banner */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: 'var(--bg-card-dark)',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: 'var(--radius-pill)',
          boxShadow: 'var(--shadow-dark)',
          fontSize: '0.875rem',
          fontWeight: 600,
          zIndex: 1000
        }}>
          {toast.message}
        </div>
      )}

      {/* Top Navbar */}
      <Navbar 
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main Tab Workspace */}
      <main>
        {renderTabContent()}
      </main>

      {/* Modals */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
      />
    </div>
  );
};

export default function App() {
  return (
    <FinanceProvider>
      <MainLayout />
    </FinanceProvider>
  );
}
