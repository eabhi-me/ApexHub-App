import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Download, 
  Search, 
  Trash2, 
  PiggyBank, 
  Target, 
  CreditCard, 
  AlertTriangle,
  X,
  PlusCircle,
  ArrowDownLeft,
  ArrowUpRight
} from 'lucide-react';
import { useFinance, CATEGORIES } from '../contexts/FinanceContext';

const FinanceTracker = () => {
  const { 
    transactions, 
    budgets, 
    goals, 
    totalIncome, 
    totalExpense, 
    netBalance, 
    savingsRate, 
    categoryExpenses, 
    addTransaction, 
    deleteTransaction,
    setBudget,
    addGoal,
    depositToGoal,
    deleteGoal,
    exportToCSV 
  } = useFinance();

  // Modals state
  const [showTxModal, setShowTxModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(null); // goal object if open

  // Filtering & Search
  const [activeTab, setActiveTab] = useState('all'); // all, expense, income
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // New Transaction Form State
  const [txForm, setTxForm] = useState({
    type: 'expense',
    amount: '',
    category: 'Food & Dining',
    description: '',
    paymentMethod: 'UPI / Bank',
    date: new Date().toISOString().slice(0, 10),
    isRecurring: false,
    tags: ''
  });

  // Budget Form State
  const [budgetForm, setBudgetForm] = useState({
    category: 'Food & Dining',
    monthlyLimit: ''
  });

  // Savings Goal Form State
  const [goalForm, setGoalForm] = useState({
    title: '',
    targetAmount: '',
    currentAmount: '',
    targetDate: '',
    color: '#6366f1'
  });

  // Deposit Form State
  const [depositAmount, setDepositAmount] = useState('');

  // Handle submit transaction
  const handleTxSubmit = async (e) => {
    e.preventDefault();
    if (!txForm.amount || Number(txForm.amount) <= 0) return;
    
    await addTransaction({
      ...txForm,
      amount: parseFloat(txForm.amount),
      tags: txForm.tags ? txForm.tags.split(',').map(t => t.trim()) : []
    });

    setTxForm({
      type: 'expense',
      amount: '',
      category: 'Food & Dining',
      description: '',
      paymentMethod: 'UPI / Bank',
      date: new Date().toISOString().slice(0, 10),
      isRecurring: false,
      tags: ''
    });
    setShowTxModal(false);
  };

  // Handle submit budget
  const handleBudgetSubmit = async (e) => {
    e.preventDefault();
    if (!budgetForm.monthlyLimit || Number(budgetForm.monthlyLimit) <= 0) return;
    await setBudget(budgetForm.category, parseFloat(budgetForm.monthlyLimit));
    setBudgetForm({ category: 'Food & Dining', monthlyLimit: '' });
    setShowBudgetModal(false);
  };

  // Handle submit goal
  const handleGoalSubmit = async (e) => {
    e.preventDefault();
    if (!goalForm.title || !goalForm.targetAmount) return;
    await addGoal({
      ...goalForm,
      targetAmount: parseFloat(goalForm.targetAmount),
      currentAmount: parseFloat(goalForm.currentAmount || 0)
    });
    setGoalForm({ title: '', targetAmount: '', currentAmount: '', targetDate: '', color: '#6366f1' });
    setShowGoalModal(false);
  };

  // Handle deposit
  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    if (!depositAmount || Number(depositAmount) <= 0 || !showDepositModal) return;
    await depositToGoal(showDepositModal._id, parseFloat(depositAmount));
    setDepositAmount('');
    setShowDepositModal(null);
  };

  // Filtered transactions
  const filteredTransactions = transactions.filter(t => {
    const matchesTab = activeTab === 'all' || t.type === activeTab;
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    const matchesSearch = 
      (t.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Finance & Expense Tracker</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor cashflow, manage category budgets, and reach your savings goals in Indian Rupee (₹).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={exportToCSV}
            className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm transition-all"
          >
            <Download className="h-4 w-4 mr-1.5 text-slate-500" />
            Export CSV
          </button>
          <button
            onClick={() => setShowBudgetModal(true)}
            className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-50 border border-indigo-100 text-indigo-700 hover:bg-indigo-100 transition-all"
          >
            <Target className="h-4 w-4 mr-1.5" />
            Set Budget
          </button>
          <button
            onClick={() => setShowGoalModal(true)}
            className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-violet-50 border border-violet-100 text-violet-700 hover:bg-violet-100 transition-all"
          >
            <PiggyBank className="h-4 w-4 mr-1.5" />
            New Goal
          </button>
          <button
            onClick={() => setShowTxModal(true)}
            className="inline-flex items-center px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all active:scale-95"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add Transaction
          </button>
        </div>
      </div>

      {/* 4 Financial Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Total Net Balance */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">Total Net Balance</span>
            <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-emerald-400">
              ₹
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl sm:text-4xl font-black font-mono">
              ₹{netBalance.toLocaleString()}
            </div>
            <div className="mt-2 flex items-center text-xs text-indigo-200">
              <span className={`inline-flex items-center font-bold mr-1.5 ${netBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {netBalance >= 0 ? <TrendingUp className="h-3.5 w-3.5 mr-0.5" /> : <TrendingDown className="h-3.5 w-3.5 mr-0.5" />}
                {savingsRate}%
              </span>
              <span>savings rate</span>
            </div>
          </div>
        </div>

        {/* Total Income */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Monthly Income</span>
            <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowDownLeft className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono">
              +₹{totalIncome.toLocaleString()}
            </div>
            <div className="mt-2 text-xs text-slate-500">
              {transactions.filter(t => t.type === 'income').length} income transactions
            </div>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Monthly Expenses</span>
            <div className="h-8 w-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-rose-600 font-mono">
              -₹{totalExpense.toLocaleString()}
            </div>
            <div className="mt-2 text-xs text-slate-500">
              {transactions.filter(t => t.type === 'expense').length} expense transactions
            </div>
          </div>
        </div>

        {/* Savings Goal Total */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Saved in Goals</span>
            <div className="h-8 w-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <PiggyBank className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-violet-600 font-mono">
              ₹{goals.reduce((acc, g) => acc + (Number(g.currentAmount) || 0), 0).toLocaleString()}
            </div>
            <div className="mt-2 text-xs text-slate-500">
              Across {goals.length} active savings goals
            </div>
          </div>
        </div>

      </div>

      {/* Middle Section: Budgets & Savings Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Category Budgets & Spend Tracker */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Monthly Category Budgets</h3>
              <p className="text-xs text-slate-500">Track spending limits against real-time expenses</p>
            </div>
            <button
              onClick={() => setShowBudgetModal(true)}
              className="text-xs font-semibold text-indigo-600 hover:underline flex items-center"
            >
              <PlusCircle className="h-3.5 w-3.5 mr-1" /> Add Budget
            </button>
          </div>

          <div className="space-y-4 pt-1 max-h-80 overflow-y-auto custom-scrollbar">
            {budgets.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                No category budgets configured yet. Click "Set Budget" to set monthly spending limits!
              </div>
            ) : (
              budgets.map((b) => {
                const spent = categoryExpenses[b.category] || 0;
                const percentage = Math.round((spent / b.monthlyLimit) * 100);
                const isOverBudget = spent > b.monthlyLimit;
                const isWarning = percentage >= 80 && !isOverBudget;

                return (
                  <div key={b._id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-2">
                    <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-800">{b.category}</span>
                        {isOverBudget && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-700">
                            <AlertTriangle className="h-3 w-3 mr-0.5" /> Exceeded!
                          </span>
                        )}
                        {isWarning && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-700">
                            Near Limit
                          </span>
                        )}
                      </div>
                      <div className="text-slate-600">
                        <span className={`font-bold ${isOverBudget ? 'text-rose-600' : 'text-slate-900'}`}>
                          ₹{spent.toLocaleString()}
                        </span>
                        <span className="text-slate-400 font-normal"> / ₹{b.monthlyLimit.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOverBudget ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                    
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>{percentage}% spent</span>
                      <span>
                        {isOverBudget 
                          ? `₹${(spent - b.monthlyLimit).toLocaleString()} over limit` 
                          : `₹${(b.monthlyLimit - spent).toLocaleString()} remaining`}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Savings Goals */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Savings Goals</h3>
              <p className="text-xs text-slate-500">Fund your future milestones & big purchases</p>
            </div>
            <button
              onClick={() => setShowGoalModal(true)}
              className="text-xs font-semibold text-violet-600 hover:underline flex items-center"
            >
              <PlusCircle className="h-3.5 w-3.5 mr-1" /> New Goal
            </button>
          </div>

          <div className="space-y-4 pt-1 max-h-80 overflow-y-auto custom-scrollbar">
            {goals.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                No savings goals yet. Create one to start saving up!
              </div>
            ) : (
              goals.map((g) => {
                const percentage = Math.min(Math.round((g.currentAmount / g.targetAmount) * 100), 100);
                const isComplete = g.currentAmount >= g.targetAmount;

                return (
                  <div 
                    key={g._id} 
                    className="p-4 rounded-2xl border border-slate-200/70 bg-gradient-to-r from-white to-slate-50/50 hover:shadow-sm transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div 
                          className="h-8 w-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-sm"
                          style={{ backgroundColor: g.color || '#6366f1' }}
                        >
                          <Target className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{g.title}</h4>
                          {g.targetDate && (
                            <span className="text-[11px] text-slate-400">
                              Target: {new Date(g.targetDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setShowDepositModal(g)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60 transition-colors"
                        >
                          + Deposit
                        </button>
                        <button
                          onClick={() => deleteGoal(g._id)}
                          className="p-1 text-slate-300 hover:text-rose-500 transition-colors"
                          title="Delete goal"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                        <span>₹{g.currentAmount.toLocaleString()} saved</span>
                        <span className="text-slate-400">₹{g.targetAmount.toLocaleString()} target ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: isComplete ? '#10b981' : (g.color || '#6366f1') 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Filterable Transaction History */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
        
        {/* Table Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Transaction History</h3>
            <p className="text-xs text-slate-500">All recorded incomes and expenditures in INR</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Tab filter: All, Income, Expense */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-semibold">
              {['all', 'expense', 'income'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                    activeTab === tab 
                      ? 'bg-white text-slate-900 shadow-sm font-bold' 
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.expense.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
              {CATEGORIES.income.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 w-44 sm:w-56"
              />
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="pb-3 px-3">Transaction</th>
                <th className="pb-3 px-3">Category</th>
                <th className="pb-3 px-3">Date</th>
                <th className="pb-3 px-3">Payment</th>
                <th className="pb-3 px-3 text-right">Amount (₹)</th>
                <th className="pb-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-10 text-center text-slate-400 text-sm">
                    No transactions recorded yet. Click "Add Transaction" to create your first entry!
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const isIncome = tx.type === 'income';
                  return (
                    <tr key={tx._id} className="hover:bg-slate-50/80 transition-colors group">
                      {/* Description & recurring */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center space-x-3">
                          <div className={`h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                          }`}>
                            {isIncome ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                              <span>{tx.description || tx.category}</span>
                              {tx.isRecurring && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-blue-50 text-blue-700">
                                  Recurring
                                </span>
                              )}
                            </div>
                            {tx.tags && tx.tags.length > 0 && (
                              <div className="flex items-center gap-1 mt-0.5">
                                {tx.tags.map((tag, i) => (
                                  <span key={i} className="text-[10px] text-slate-400">#{tag}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-3">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700">
                          {tx.category}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-3 text-xs text-slate-500 font-medium">
                        {new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>

                      {/* Payment Method */}
                      <td className="py-3.5 px-3 text-xs text-slate-600">
                        <span className="flex items-center space-x-1">
                          <CreditCard className="h-3.5 w-3.5 text-slate-400" />
                          <span>{tx.paymentMethod}</span>
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-3 text-right font-bold font-mono">
                        <span className={isIncome ? 'text-emerald-600' : 'text-slate-900'}>
                          {isIncome ? '+' : '-'}₹{Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>

                      {/* Delete */}
                      <td className="py-3.5 px-3 text-center">
                        <button
                          onClick={() => deleteTransaction(tx._id)}
                          className="p-1.5 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete transaction"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODALS ================= */}

      {/* 1. Add Transaction Modal */}
      {showTxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 space-y-6 relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">Record Transaction</h3>
              <button 
                onClick={() => setShowTxModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleTxSubmit} className="space-y-4">
              
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setTxForm(prev => ({ ...prev, type: 'expense', category: 'Food & Dining' }))}
                  className={`py-2 text-xs font-bold rounded-xl transition-all ${
                    txForm.type === 'expense' 
                      ? 'bg-white text-rose-600 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setTxForm(prev => ({ ...prev, type: 'income', category: 'Salary' }))}
                  className={`py-2 text-xs font-bold rounded-xl transition-all ${
                    txForm.type === 'income' 
                      ? 'bg-white text-emerald-600 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Income
                </button>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Amount (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={txForm.amount}
                    onChange={(e) => setTxForm({ ...txForm, amount: e.target.value })}
                    className="w-full pl-8 pr-4 py-2.5 text-base font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Category *
                </label>
                <select
                  value={txForm.category}
                  onChange={(e) => setTxForm({ ...txForm, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  {(txForm.type === 'income' ? CATEGORIES.income : CATEGORIES.expense).map(c => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Monthly Grocery, Client Milestone, Electricity Bill"
                  value={txForm.description}
                  onChange={(e) => setTxForm({ ...txForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* Date & Payment Method */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={txForm.date}
                    onChange={(e) => setTxForm({ ...txForm, date: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={txForm.paymentMethod}
                    onChange={(e) => setTxForm({ ...txForm, paymentMethod: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="UPI / Bank">UPI / Net Banking</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Cash">Cash</option>
                    <option value="Crypto">Crypto</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Tags & Recurring */}
              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={txForm.isRecurring}
                    onChange={(e) => setTxForm({ ...txForm, isRecurring: e.target.checked })}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Mark as Recurring (Monthly)</span>
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowTxModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 text-sm font-bold text-white rounded-xl shadow-md transition-all ${
                    txForm.type === 'income' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  Save Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Set Category Budget Modal */}
      {showBudgetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">Set Monthly Budget</h3>
              <button onClick={() => setShowBudgetModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleBudgetSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Category
                </label>
                <select
                  value={budgetForm.category}
                  onChange={(e) => setBudgetForm({ ...budgetForm, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  {CATEGORIES.expense.map(c => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Monthly Limit (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    step="1"
                    required
                    placeholder="10000"
                    value={budgetForm.monthlyLimit}
                    onChange={(e) => setBudgetForm({ ...budgetForm, monthlyLimit: e.target.value })}
                    className="w-full pl-8 pr-4 py-2.5 text-base font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBudgetModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md"
                >
                  Save Budget Limit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. New Savings Goal Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">Create Savings Goal</h3>
              <button onClick={() => setShowGoalModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleGoalSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Goal Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. New Laptop, Emergency Fund, Trip"
                  value={goalForm.title}
                  onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Target Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="100000"
                    value={goalForm.targetAmount}
                    onChange={(e) => setGoalForm({ ...goalForm, targetAmount: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Already Saved (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="25000"
                    value={goalForm.currentAmount}
                    onChange={(e) => setGoalForm({ ...goalForm, currentAmount: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Target Date
                </label>
                <input
                  type="date"
                  value={goalForm.targetDate}
                  onChange={(e) => setGoalForm({ ...goalForm, targetDate: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Accent Color
                </label>
                <div className="flex gap-3">
                  {['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'].map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setGoalForm({ ...goalForm, color })}
                      className={`h-8 w-8 rounded-full transition-transform ${goalForm.color === color ? 'scale-125 ring-2 ring-offset-2 ring-slate-400' : ''}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold bg-violet-600 hover:bg-violet-700 text-white rounded-xl shadow-md"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Deposit Funds Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-slate-100 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Deposit Funds</h3>
                <p className="text-xs text-slate-500">Into: {showDepositModal.title}</p>
              </div>
              <button onClick={() => setShowDepositModal(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleDepositSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Deposit Amount (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    step="1"
                    required
                    autoFocus
                    placeholder="5000"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 text-lg font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDepositModal(null)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md"
                >
                  Confirm Deposit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default FinanceTracker;
