import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const FinanceContext = createContext();

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};

export const CURRENCY_SYMBOL = '₹';

// Initial realistic INR sample data for Demo User
const INITIAL_TRANSACTIONS = [
  {
    _id: 'tx-1',
    type: 'income',
    amount: 45000,
    category: 'Salary',
    description: 'Monthly Tech Internship Stipend',
    paymentMethod: 'UPI / Bank',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    isRecurring: true,
    tags: ['salary', 'tech']
  },
  {
    _id: 'tx-2',
    type: 'expense',
    amount: 3200,
    category: 'Food & Dining',
    description: 'Weekly grocery & healthy snacks',
    paymentMethod: 'Credit Card',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    isRecurring: false,
    tags: ['groceries']
  },
  {
    _id: 'tx-3',
    type: 'expense',
    amount: 1999,
    category: 'Education',
    description: 'React & Algorithm Mastery Course',
    paymentMethod: 'Debit Card',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    isRecurring: false,
    tags: ['learning', 'career']
  },
  {
    _id: 'tx-4',
    type: 'expense',
    amount: 699,
    category: 'Entertainment',
    description: 'Spotify & Cloud storage subs',
    paymentMethod: 'UPI / Bank',
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    isRecurring: true,
    tags: ['subs']
  },
  {
    _id: 'tx-5',
    type: 'income',
    amount: 12500,
    category: 'Freelance',
    description: 'Landing Page UI design gig',
    paymentMethod: 'UPI / Bank',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    isRecurring: false,
    tags: ['freelance', 'ui']
  },
  {
    _id: 'tx-6',
    type: 'expense',
    amount: 1450,
    category: 'Transportation',
    description: 'Metro pass & ride share',
    paymentMethod: 'Cash',
    date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    isRecurring: false,
    tags: ['transit']
  }
];

const INITIAL_BUDGETS = [
  { _id: 'b-1', category: 'Food & Dining', monthlyLimit: 10000, monthYear: new Date().toISOString().slice(0, 7) },
  { _id: 'b-2', category: 'Education', monthlyLimit: 5000, monthYear: new Date().toISOString().slice(0, 7) },
  { _id: 'b-3', category: 'Entertainment', monthlyLimit: 3000, monthYear: new Date().toISOString().slice(0, 7) },
  { _id: 'b-4', category: 'Shopping', monthlyLimit: 6000, monthYear: new Date().toISOString().slice(0, 7) }
];

const INITIAL_GOALS = [
  { _id: 'g-1', title: 'New M3 MacBook Pro', targetAmount: 125000, currentAmount: 85000, targetDate: '2026-12-15', color: '#6366f1', icon: 'Laptop' },
  { _id: 'g-2', title: 'Emergency Fund', targetAmount: 100000, currentAmount: 65000, targetDate: '2027-01-01', color: '#10b981', icon: 'Shield' },
  { _id: 'g-3', title: 'Hackathon Travel & Stay', targetAmount: 15000, currentAmount: 10500, targetDate: '2026-10-20', color: '#f59e0b', icon: 'Plane' }
];

export const CATEGORIES = {
  expense: [
    { name: 'Food & Dining', icon: 'Utensils', color: '#f59e0b' },
    { name: 'Housing & Rent', icon: 'Home', color: '#6366f1' },
    { name: 'Transportation', icon: 'Car', color: '#3b82f6' },
    { name: 'Education', icon: 'GraduationCap', color: '#10b981' },
    { name: 'Entertainment', icon: 'Film', color: '#ec4899' },
    { name: 'Shopping', icon: 'ShoppingBag', color: '#8b5cf6' },
    { name: 'Health & Fitness', icon: 'HeartPulse', color: '#ef4444' },
    { name: 'Utilities & Bills', icon: 'Zap', color: '#14b8a6' },
    { name: 'Other Expense', icon: 'MoreHorizontal', color: '#64748b' }
  ],
  income: [
    { name: 'Salary', icon: 'Briefcase', color: '#10b981' },
    { name: 'Freelance', icon: 'Code', color: '#3b82f6' },
    { name: 'Investments', icon: 'TrendingUp', color: '#8b5cf6' },
    { name: 'Scholarship', icon: 'Award', color: '#f59e0b' },
    { name: 'Gifts & Allowance', icon: 'Gift', color: '#ec4899' },
    { name: 'Other Income', icon: 'DollarSign', color: '#059669' }
  ]
};

export const FinanceProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(false);

  const isDemoUser = user?.email === 'demo@example.com' || user?.email === 'alex.carter@example.com' || user?._id === 'demo-user-id';
  const userKey = user?.email || user?._id || 'guest';

  // Load state from API or user-isolated localStorage
  const fetchFinanceData = useCallback(async () => {
    if (!isAuthenticated) {
      setTransactions([]);
      setBudgets([]);
      setGoals([]);
      return;
    }
    setLoading(true);

    try {
      const [txRes, bRes, gRes] = await Promise.all([
        api.get('/finance/transactions'),
        api.get('/finance/budgets'),
        api.get('/finance/goals')
      ]);

      // If backend has items, use them
      if (txRes.data && txRes.data.length > 0) {
        setTransactions(txRes.data);
      } else {
        const localTxs = localStorage.getItem(`finance_txs_${userKey}`);
        if (localTxs) {
          setTransactions(JSON.parse(localTxs));
        } else if (isDemoUser) {
          setTransactions(INITIAL_TRANSACTIONS);
        } else {
          setTransactions([]);
        }
      }

      if (bRes.data && bRes.data.length > 0) {
        setBudgets(bRes.data);
      } else {
        const localB = localStorage.getItem(`finance_budgets_${userKey}`);
        if (localB) {
          setBudgets(JSON.parse(localB));
        } else if (isDemoUser) {
          setBudgets(INITIAL_BUDGETS);
        } else {
          setBudgets([]);
        }
      }

      if (gRes.data && gRes.data.length > 0) {
        setGoals(gRes.data);
      } else {
        const localG = localStorage.getItem(`finance_goals_${userKey}`);
        if (localG) {
          setGoals(JSON.parse(localG));
        } else if (isDemoUser) {
          setGoals(INITIAL_GOALS);
        } else {
          setGoals([]);
        }
      }
    } catch (error) {
      const localTxs = localStorage.getItem(`finance_txs_${userKey}`);
      const localB = localStorage.getItem(`finance_budgets_${userKey}`);
      const localG = localStorage.getItem(`finance_goals_${userKey}`);

      if (localTxs) {
        setTransactions(JSON.parse(localTxs));
      } else if (isDemoUser) {
        setTransactions(INITIAL_TRANSACTIONS);
      } else {
        setTransactions([]);
      }

      if (localB) {
        setBudgets(JSON.parse(localB));
      } else if (isDemoUser) {
        setBudgets(INITIAL_BUDGETS);
      } else {
        setBudgets([]);
      }

      if (localG) {
        setGoals(JSON.parse(localG));
      } else if (isDemoUser) {
        setGoals(INITIAL_GOALS);
      } else {
        setGoals([]);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isDemoUser, userKey]);

  useEffect(() => {
    fetchFinanceData();
  }, [fetchFinanceData]);

  // Persist locally under user-isolated key
  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem(`finance_txs_${userKey}`, JSON.stringify(transactions));
      localStorage.setItem(`finance_budgets_${userKey}`, JSON.stringify(budgets));
      localStorage.setItem(`finance_goals_${userKey}`, JSON.stringify(goals));
    }
  }, [transactions, budgets, goals, isAuthenticated, userKey]);

  // Add Transaction
  const addTransaction = async (data) => {
    try {
      const payload = {
        ...data,
        amount: Number(data.amount),
        date: data.date || new Date().toISOString()
      };
      
      let newTx;
      try {
        const res = await api.post('/finance/transactions', payload);
        newTx = res.data;
      } catch (err) {
        newTx = { ...payload, _id: 'tx-' + Date.now(), createdAt: new Date().toISOString() };
      }

      setTransactions(prev => [newTx, ...prev]);
      toast.success('Transaction recorded successfully!');
      return { success: true, transaction: newTx };
    } catch (error) {
      toast.error('Failed to add transaction');
      return { success: false };
    }
  };

  // Delete Transaction
  const deleteTransaction = async (id) => {
    try {
      try {
        await api.delete(`/finance/transactions/${id}`);
      } catch (e) {}
      setTransactions(prev => prev.filter(t => t._id !== id));
      toast.success('Transaction removed');
      return { success: true };
    } catch (error) {
      toast.error('Failed to delete transaction');
      return { success: false };
    }
  };

  // Set / Update Budget
  const setBudget = async (category, monthlyLimit) => {
    const monthYear = new Date().toISOString().slice(0, 7);
    try {
      let savedBudget;
      try {
        const res = await api.post('/finance/budgets', { category, monthlyLimit, monthYear });
        savedBudget = res.data;
      } catch (err) {
        savedBudget = { _id: 'b-' + Date.now(), category, monthlyLimit: Number(monthlyLimit), monthYear };
      }

      setBudgets(prev => {
        const filtered = prev.filter(b => b.category !== category);
        return [...filtered, savedBudget];
      });
      toast.success(`Budget for ${category} updated!`);
      return { success: true };
    } catch (error) {
      toast.error('Failed to update budget');
      return { success: false };
    }
  };

  // Add / Edit Savings Goal
  const addGoal = async (goalData) => {
    try {
      let newGoal;
      try {
        const res = await api.post('/finance/goals', goalData);
        newGoal = res.data;
      } catch (e) {
        newGoal = { ...goalData, _id: 'g-' + Date.now(), currentAmount: Number(goalData.currentAmount || 0) };
      }
      setGoals(prev => [newGoal, ...prev]);
      toast.success('Savings Goal created!');
      return { success: true };
    } catch (error) {
      toast.error('Failed to create goal');
      return { success: false };
    }
  };

  // Add Deposit to Goal
  const depositToGoal = async (goalId, amount) => {
    try {
      const goal = goals.find(g => g._id === goalId);
      if (!goal) return;
      const updatedAmount = Number(goal.currentAmount) + Number(amount);

      try {
        await api.put(`/finance/goals/${goalId}`, { currentAmount: updatedAmount });
      } catch (e) {}

      setGoals(prev => prev.map(g => g._id === goalId ? { ...g, currentAmount: updatedAmount } : g));
      toast.success(`Deposited ₹${amount.toLocaleString()} to ${goal.title}! 🎉`);
      return { success: true };
    } catch (error) {
      toast.error('Failed to add funds');
      return { success: false };
    }
  };

  // Delete Goal
  const deleteGoal = async (goalId) => {
    try {
      try {
        await api.delete(`/finance/goals/${goalId}`);
      } catch (e) {}
      setGoals(prev => prev.filter(g => g._id !== goalId));
      toast.success('Savings goal deleted');
      return { success: true };
    } catch (error) {
      toast.error('Failed to delete goal');
      return { success: false };
    }
  };

  // Calculated Metrics
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + Number(t.amount || 0), 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + Number(t.amount || 0), 0);

  const netBalance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? ((netBalance / totalIncome) * 100).toFixed(1) : 0;

  // Category breakdown for expenses
  const categoryExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount || 0);
      return acc;
    }, {});

  // Export CSV
  const exportToCSV = () => {
    const headers = ['Date,Type,Category,Description,Amount (INR),Payment Method'];
    const rows = transactions.map(t => 
      `"${new Date(t.date).toLocaleDateString()}","${t.type}","${t.category}","${(t.description || '').replace(/"/g, '""')}","${t.amount}","${t.paymentMethod}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Finance_Transactions_INR_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.info('Exported transactions to CSV');
  };

  const value = {
    transactions,
    budgets,
    goals,
    loading,
    totalIncome,
    totalExpense,
    netBalance,
    savingsRate,
    categoryExpenses,
    CATEGORIES,
    CURRENCY_SYMBOL,
    addTransaction,
    deleteTransaction,
    setBudget,
    addGoal,
    depositToGoal,
    deleteGoal,
    exportToCSV,
    fetchFinanceData
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
};
