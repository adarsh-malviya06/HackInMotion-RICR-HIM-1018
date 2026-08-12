import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSupabaseClient, getStoredSupabaseCredentials, saveSupabaseCredentials } from '../lib/supabase';
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
  const [supabaseConfig, setSupabaseConfig] = useState(getStoredSupabaseCredentials());
  const [supabase, setSupabase] = useState(getSupabaseClient());
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Core Financial Data Arrays
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [recurring, setRecurring] = useState([]);
  
  // Settings & Preferences
  const [currency, setCurrency] = useState('$');
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

  // Re-initialize Supabase when credentials update
  const updateSupabaseCredentials = (url, key) => {
    const client = saveSupabaseCredentials(url, key);
    setSupabaseConfig(getStoredSupabaseCredentials());
    setSupabase(client);
    if (client) {
      showToast('Supabase connected successfully!', 'success');
      fetchSupabaseData(client);
    } else {
      showToast('Updated local configuration.', 'info');
    }
  };

  // Listen to Auth State & Initial Fetch
  useEffect(() => {
    const client = getSupabaseClient();
    if (!client) {
      setLoading(false);
      recalculateIntelligence(transactions, budgets);
      return;
    }

    client.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchSupabaseData(client);
      setLoading(false);
    });

    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchSupabaseData(client);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch All Data from Supabase
  const fetchSupabaseData = async (clientInstance = supabase) => {
    if (!clientInstance) return;
    setLoading(true);

    try {
      // 1. Fetch Transactions
      const { data: txData, error: txErr } = await clientInstance
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      if (!txErr && txData) {
        setTransactions(txData);
      }

      // 2. Fetch Budgets
      const { data: bData, error: bErr } = await clientInstance
        .from('budgets')
        .select('*');
      if (!bErr && bData) setBudgets(bData);

      // 3. Fetch Goals
      const { data: gData, error: gErr } = await clientInstance
        .from('goals')
        .select('*');
      if (!gErr && gData) setGoals(gData);

      // 4. Fetch Recurring Expenses
      const { data: rData, error: rErr } = await clientInstance
        .from('recurring_expenses')
        .select('*');
      if (!rErr && rData) setRecurring(rData);

    } catch (err) {
      console.error('Error fetching Supabase data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Recalculate Intelligence whenever core datasets update
  const recalculateIntelligence = (txs = transactions, bdg = budgets) => {
    const health = calculateHealthScore(txs, bdg, 5000);
    const dups = detectDuplicates(txs);
    const anom = detectAnomalies(txs);
    const leaks = detectMoneyLeaks(txs);

    setHealthScore(health);
    setDuplicates(dups);
    setAnomalies(anom);
    setMoneyLeaks(leaks);

    // Auto-detect recurring items for Subscription view
    const detectedRecurring = txs.filter(t => t.type === 'expense' && (t.is_recurring || t.category === 'Subscriptions & Tech'));
    const uniqueRec = [];
    const seen = new Set();
    detectedRecurring.forEach(t => {
      if (!seen.has(t.merchant)) {
        seen.add(t.merchant);
        uniqueRec.push({
          id: t.id,
          merchant: t.merchant,
          amount: t.amount,
          billing_cycle: 'Monthly',
          status: 'Active'
        });
      }
    });
    setRecurring(uniqueRec);
  };

  useEffect(() => {
    recalculateIntelligence(transactions, budgets);
  }, [transactions, budgets]);

  // Data Mutation Handlers
  const addTransaction = async (tx) => {
    const cleanMerchant = normalizeMerchantName(tx.merchant);
    const category = tx.category || autoCategorize(cleanMerchant, tx.raw_description, tx.amount, tx.type);

    const newTx = {
      ...tx,
      id: tx.id || `tx_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      merchant: cleanMerchant,
      category,
      amount: Number(tx.amount),
      date: tx.date || new Date().toISOString().split('T')[0]
    };

    if (supabase && session) {
      const { data, error } = await supabase
        .from('transactions')
        .insert([{ ...newTx, user_id: session.user.id }])
        .select();

      if (error) {
        showToast(`Supabase insert error: ${error.message}`, 'error');
        return;
      }
      if (data && data[0]) {
        setTransactions(prev => [data[0], ...prev]);
        showToast('Transaction saved to Supabase database!', 'success');
        return;
      }
    }

    // Local / Offline fallback
    setTransactions(prev => [newTx, ...prev]);
    showToast('Transaction added to session dataset.', 'success');
  };

  // Bulk Import CSV Transactions
  const importBulkTransactions = async (rawItems) => {
    const cleaned = rawItems.map(item => {
      const merchant = normalizeMerchantName(item.merchant || item.raw_description || 'Expense');
      const category = item.category && item.category !== 'Uncategorized' 
        ? item.category 
        : autoCategorize(merchant, item.raw_description, item.amount, item.type);

      return {
        id: `csv_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
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

    if (supabase && session) {
      const supabasePayload = cleaned.map(t => ({ ...t, user_id: session.user.id }));
      const { data, error } = await supabase
        .from('transactions')
        .insert(supabasePayload)
        .select();

      if (error) {
        showToast(`Supabase bulk insert failed: ${error.message}`, 'error');
      } else {
        showToast(`Successfully imported ${data.length} transactions to Supabase!`, 'success');
        setTransactions(prev => [...data, ...prev]);
        return;
      }
    }

    setTransactions(prev => [...cleaned, ...prev]);
    showToast(`Imported ${cleaned.length} transactions into FINLY!`, 'success');
  };

  const deleteTransaction = async (id) => {
    if (supabase && session) {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) {
        showToast(`Failed to delete from Supabase: ${error.message}`, 'error');
        return;
      }
    }
    setTransactions(prev => prev.filter(t => t.id !== id));
    showToast('Transaction removed.', 'info');
  };

  const addBudget = async (budget) => {
    if (supabase && session) {
      const { data, error } = await supabase
        .from('budgets')
        .upsert([{ ...budget, user_id: session.user.id }], { onConflict: 'user_id, category' })
        .select();
      if (!error && data) {
        setBudgets(prev => [...prev.filter(b => b.category !== budget.category), data[0]]);
        showToast('Budget saved to Supabase.', 'success');
        return;
      }
    }
    setBudgets(prev => [...prev.filter(b => b.category !== budget.category), budget]);
    showToast('Budget limit saved.', 'success');
  };

  const addGoal = async (goal) => {
    if (supabase && session) {
      const { data, error } = await supabase
        .from('goals')
        .insert([{ ...goal, user_id: session.user.id }])
        .select();
      if (!error && data) {
        setGoals(prev => [...prev, data[0]]);
        showToast('Goal created in Supabase!', 'success');
        return;
      }
    }
    setGoals(prev => [...prev, { ...goal, id: `goal_${Date.now()}` }]);
    showToast('Goal created!', 'success');
  };

  const depositToGoal = async (goalId, amount) => {
    setGoals(prev => prev.map(g => {
      if (g.id === goalId) {
        const updated = { ...g, current_amount: Number(g.current_amount || 0) + Number(amount) };
        if (supabase && session) {
          supabase.from('goals').update({ current_amount: updated.current_amount }).eq('id', goalId);
        }
        return updated;
      }
      return g;
    }));
    showToast(`Added ${currency}${amount} to goal!`, 'success');
  };

  const clearAllData = () => {
    setTransactions([]);
    setBudgets([]);
    setGoals([]);
    setRecurring([]);
    showToast('All transaction records cleared.', 'info');
  };

  return (
    <FinanceContext.Provider value={{
      supabaseConfig,
      supabase,
      session,
      loading,
      updateSupabaseCredentials,
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
      clearAllData,
      fetchSupabaseData
    }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => useContext(FinanceContext);
