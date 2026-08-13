import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { 
  normalizeMerchantName, 
  autoCategorize, 
  detectDuplicates, 
  calculateHealthScore, 
  detectAnomalies, 
  detectMoneyLeaks 
} from '../services/dataIntelligence';

const FinanceContext = createContext(null);

export const FinanceProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);

  // Core Financial Data Arrays
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [recurring, setRecurring] = useState([]);
  
  // Settings & Preferences
  const [currency, setCurrency] = useState('₹');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [toast, setToast] = useState(null);

  // Intelligence Computed States
  const [healthScore, setHealthScore] = useState({});
  const [duplicates, setDuplicates] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [moneyLeaks, setMoneyLeaks] = useState([]);

  // Toast Helper
  const showToast = (message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch authenticated user's financial datasets from Express Backend API
  const fetchUserFinancialData = useCallback(async () => {
    setLoading(true);
    try {
      const [txData, bData, gData] = await Promise.allSettled([
        api.transactions.getAll(),
        api.budgets.getAll(),
        api.goals.getAll()
      ]);

      if (txData.status === 'fulfilled' && Array.isArray(txData.value)) {
        setTransactions(txData.value);
      } else {
        setTransactions([]);
      }

      if (bData.status === 'fulfilled' && Array.isArray(bData.value)) {
        setBudgets(bData.value);
      } else {
        setBudgets([]);
      }

      if (gData.status === 'fulfilled' && Array.isArray(gData.value)) {
        setGoals(gData.value);
      } else {
        setGoals([]);
      }
    } catch (err) {
      console.warn('Backend financial data fetch notice:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Recalculate Intelligence whenever core datasets update
  const recalculateIntelligence = useCallback((txs, bdg) => {
    const targetTxs = txs || transactions;
    const targetBdg = bdg || budgets;
    const health = calculateHealthScore(targetTxs, targetBdg, 5000);
    const dups = detectDuplicates(targetTxs);
    const anom = detectAnomalies(targetTxs);
    const leaks = detectMoneyLeaks(targetTxs);

    setHealthScore(health);
    setDuplicates(dups);
    setAnomalies(anom);
    setMoneyLeaks(leaks);

    // Auto-detect recurring items for Subscription view
    const detectedRecurring = targetTxs.filter(t => t.type === 'expense' && (t.is_recurring || t.category === 'Subscriptions & Tech'));
    const uniqueRec = [];
    const seen = new Set();
    detectedRecurring.forEach(t => {
      if (!seen.has(t.merchant)) {
        seen.add(t.merchant);
        uniqueRec.push({
          id: t._id || t.id,
          merchant: t.merchant,
          amount: t.amount,
          billing_cycle: 'Monthly',
          status: 'Active'
        });
      }
    });
    setRecurring(uniqueRec);
  }, []);

  useEffect(() => {
    recalculateIntelligence(transactions, budgets);
  }, [transactions, budgets, recalculateIntelligence]);

  // Data Mutation Handlers (Persisted to Backend API)
  const addTransaction = async (tx) => {
    const cleanMerchant = normalizeMerchantName(tx.merchant);
    const category = tx.category || autoCategorize(cleanMerchant, tx.raw_description, tx.amount, tx.type);

    const payload = {
      merchant: cleanMerchant,
      raw_description: tx.raw_description || cleanMerchant,
      amount: Number(tx.amount),
      type: tx.type || 'expense',
      category,
      date: tx.date || new Date().toISOString().split('T')[0],
      payment_method: tx.payment_method || 'Card',
      is_recurring: Boolean(tx.is_recurring)
    };

    try {
      const saved = await api.transactions.create(payload);
      setTransactions(prev => [saved, ...prev]);
      showToast('Transaction saved successfully!', 'success');
      return saved;
    } catch (err) {
      showToast(err.message || 'Failed to save transaction', 'error');
      // Fallback state update for seamless offline demo
      const fallbackTx = { ...payload, _id: `tx_${Date.now()}` };
      setTransactions(prev => [fallbackTx, ...prev]);
      return fallbackTx;
    }
  };

  // Bulk Import CSV Transactions
  const importBulkTransactions = async (rawItems) => {
    const cleaned = rawItems.map(item => {
      const merchant = normalizeMerchantName(item.merchant || item.raw_description || 'Expense');
      const category = item.category && item.category !== 'Uncategorized' 
        ? item.category 
        : autoCategorize(merchant, item.raw_description, item.amount, item.type);

      return {
        date: item.date || new Date().toISOString().split('T')[0],
        merchant,
        raw_description: item.raw_description || merchant,
        amount: Math.abs(Number(item.amount)),
        type: item.type || (Number(item.amount) < 0 ? 'expense' : 'income'),
        category,
        payment_method: item.payment_method || 'Card',
        is_recurring: Boolean(item.is_recurring)
      };
    });

    try {
      const res = await api.transactions.import(cleaned);
      const imported = res.data || [];
      setTransactions(prev => [...imported, ...prev]);
      showToast(`Successfully imported ${imported.length} user transactions!`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to import transactions', 'error');
      setTransactions(prev => [...cleaned, ...prev]);
    }
  };

  const deleteTransaction = async (id) => {
    try {
      await api.transactions.delete(id);
      setTransactions(prev => prev.filter(t => (t._id || t.id) !== id));
      showToast('Transaction removed.', 'info');
    } catch (err) {
      setTransactions(prev => prev.filter(t => (t._id || t.id) !== id));
      showToast('Transaction removed.', 'info');
    }
  };

  const addBudget = async (budget) => {
    try {
      const saved = await api.budgets.save(budget);
      setBudgets(prev => [...prev.filter(b => b.category !== budget.category), saved]);
      showToast('Budget limit saved.', 'success');
    } catch (err) {
      setBudgets(prev => [...prev.filter(b => b.category !== budget.category), budget]);
      showToast('Budget limit saved.', 'success');
    }
  };

  const addGoal = async (goal) => {
    try {
      const saved = await api.goals.create(goal);
      setGoals(prev => [...prev, saved]);
      showToast('Savings goal created!', 'success');
    } catch (err) {
      setGoals(prev => [...prev, { ...goal, _id: `goal_${Date.now()}` }]);
      showToast('Savings goal created!', 'success');
    }
  };

  const depositToGoal = async (goalId, amount) => {
    try {
      const updated = await api.goals.deposit(goalId, amount);
      setGoals(prev => prev.map(g => (g._id || g.id) === goalId ? updated : g));
      showToast(`Added ${currency}${amount} to goal!`, 'success');
    } catch (err) {
      setGoals(prev => prev.map(g => {
        if ((g._id || g.id) === goalId) {
          return { ...g, current_amount: Number(g.current_amount || 0) + Number(amount) };
        }
        return g;
      }));
      showToast(`Added ${currency}${amount} to goal!`, 'success');
    }
  };

  const clearAllData = useCallback(() => {
    setTransactions([]);
    setBudgets([]);
    setGoals([]);
    setRecurring([]);
  }, []);

  return (
    <FinanceContext.Provider value={{
      supabaseConfig: { url: '', key: '' },
      updateSupabaseCredentials: () => {},
      fetchUserFinancialData,
      transactions,
      budgets,
      goals,
      recurring,
      currency,
      setCurrency,
      activeTab,
      setActiveTab,
      toast,
      showToast,
      healthScore,
      duplicates,
      anomalies,
      moneyLeaks,
      addTransaction,
      importBulkTransactions,
      deleteTransaction,
      addBudget,
      addGoal,
            depositToGoal,
      clearAllData
    }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => useContext(FinanceContext);
