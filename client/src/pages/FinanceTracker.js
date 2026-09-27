import React, { useState } from 'react';
import {
  TrendingUp, TrendingDown, Plus, Download, Search, Trash2,
  PiggyBank, Target, CreditCard, X, ArrowDownLeft, ArrowUpRight,
  Wallet, AlertTriangle
} from 'lucide-react';
import { useFinance, CATEGORIES } from '../contexts/FinanceContext';

/* ── style helpers ── */
const neo = {
  card: { background: '#eef0f5', boxShadow: '8px 8px 20px rgba(174,200,200,0.6), -8px -8px 20px rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.8)', borderRadius: '22px' },
  cardSm: { background: '#eef0f5', boxShadow: '5px 5px 12px rgba(174,180,200,0.55), -5px -5px 12px rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.75)', borderRadius: '16px' },
  inset: { background: '#e4e6ef', boxShadow: 'inset 3px 3px 7px rgba(174,180,200,0.5), inset -3px -3px 7px rgba(255,255,255,0.8)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.4)' },
  progress: { background: '#e4e6ef', boxShadow: 'inset 2px 2px 5px rgba(174,180,200,0.55), inset -2px -2px 5px rgba(255,255,255,0.85)', borderRadius: '999px', overflow: 'hidden', height: '8px' },
};

const NeoInput = ({ style, ...props }) => (
  <input
    {...props}
    style={{
      ...neo.inset,
      width: '100%',
      padding: '0.65rem 1rem',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#1e2332',
      outline: 'none',
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      ...style,
    }}
  />
);

const NeoSelect = ({ style, ...props }) => (
  <select
    {...props}
    style={{
      ...neo.inset,
      width: '100%',
      padding: '0.65rem 1rem',
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#1e2332',
      outline: 'none',
      appearance: 'none',
      cursor: 'pointer',
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      ...style,
    }}
  />
);

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
    style={{ background: 'rgba(15,18,35,0.55)', backdropFilter: 'blur(6px)' }}>
    <div className="w-full max-w-md p-7 animate-scaleIn"
      style={{ ...neo.card, borderRadius: '28px', boxShadow: '20px 20px 50px rgba(174,180,200,0.65), -10px -10px 30px rgba(255,255,255,0.9)' }}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-black text-slate-800">{title}</h3>
        <button onClick={onClose}
          className="h-9 w-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-rose-500"
          style={{ ...neo.cardSm }}>
          <X className="h-4 w-4" />
        </button>
      </div>
      {children}
    </div>
  </div>
);

const GradBtn = ({ children, color1 = '#10b981', color2 = '#059669', className = '', ...props }) => (
  <button
    {...props}
    className={`font-bold text-white rounded-2xl flex items-center justify-center gap-2 transition-transform active:scale-95 ${className}`}
    style={{ background: `linear-gradient(135deg, ${color1}, ${color2})`, boxShadow: `4px 4px 12px ${color1}40`, ...(props.disabled ? { opacity: 0.6, cursor: 'not-allowed' } : {}) }}
  >
    {children}
  </button>
);

const FinanceTracker = () => {
  const {
    transactions, budgets, goals,
    totalIncome, totalExpense, netBalance, savingsRate, categoryExpenses,
    addTransaction, deleteTransaction, setBudget, addGoal, depositToGoal, deleteGoal, exportToCSV
  } = useFinance();

  const [showTxModal, setShowTxModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [txForm, setTxForm] = useState({ type: 'expense', amount: '', category: CATEGORIES.expense[0].name, description: '', paymentMethod: 'UPI / Bank', date: new Date().toISOString().slice(0, 10), isRecurring: false, tags: '' });
  const [budgetForm, setBudgetForm] = useState({ category: CATEGORIES.expense[0].name, monthlyLimit: '' });
  const [goalForm, setGoalForm] = useState({ title: '', targetAmount: '', currentAmount: '', targetDate: '', color: '#6366f1' });
  const [depositAmount, setDepositAmount] = useState('');

  const handleTxSubmit = async (e) => {
    e.preventDefault();
    if (!txForm.amount || Number(txForm.amount) <= 0) return;
    await addTransaction({ ...txForm, amount: parseFloat(txForm.amount), tags: txForm.tags ? txForm.tags.split(',').map(t => t.trim()) : [] });
    setTxForm({ type: 'expense', amount: '', category: CATEGORIES.expense[0].name, description: '', paymentMethod: 'UPI / Bank', date: new Date().toISOString().slice(0, 10), isRecurring: false, tags: '' });
    setShowTxModal(false);
  };

  const handleBudgetSubmit = async (e) => {
    e.preventDefault();
    if (!budgetForm.monthlyLimit || Number(budgetForm.monthlyLimit) <= 0) return;
    await setBudget(budgetForm.category, parseFloat(budgetForm.monthlyLimit));
    setBudgetForm({ category: CATEGORIES.expense[0].name, monthlyLimit: '' });
    setShowBudgetModal(false);
  };

  const handleGoalSubmit = async (e) => {
    e.preventDefault();
    if (!goalForm.title || !goalForm.targetAmount) return;
    await addGoal({ ...goalForm, targetAmount: parseFloat(goalForm.targetAmount), currentAmount: parseFloat(goalForm.currentAmount || 0) });
    setGoalForm({ title: '', targetAmount: '', currentAmount: '', targetDate: '', color: '#6366f1' });
    setShowGoalModal(false);
  };

  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    if (!depositAmount || Number(depositAmount) <= 0 || !showDepositModal) return;
    await depositToGoal(showDepositModal._id, parseFloat(depositAmount));
    setDepositAmount('');
    setShowDepositModal(null);
  };

  const filteredTx = transactions.filter(t => {
    const matchTab = activeTab === 'all' || t.type === activeTab;
    const matchCat = selectedCategory === 'all' || t.category === selectedCategory;
    const matchSearch = (t.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchTab && matchCat && matchSearch;
  });

  const label = (txt) => <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">{txt}</label>;

  return (
    <div className="space-y-6 animate-fadeIn">

      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Finance & Expense Tracker</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Monitor cashflow, manage budgets, and reach savings goals (₹ INR)</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {[
            { label: 'Export CSV',       icon: Download,  onClick: exportToCSV,                    c1: '#6b7280', c2: '#4b5563' },
            { label: 'Set Budget',       icon: Target,    onClick: () => setShowBudgetModal(true),  c1: '#6366f1', c2: '#8b5cf6' },
            { label: 'New Goal',         icon: PiggyBank, onClick: () => setShowGoalModal(true),   c1: '#8b5cf6', c2: '#7c3aed' },
            { label: 'Add Transaction',  icon: Plus,      onClick: () => setShowTxModal(true),     c1: '#10b981', c2: '#059669' },
          ].map(({ label: lbl, icon: Icon, onClick, c1, c2 }) => (
            <GradBtn key={lbl} color1={c1} color2={c2} onClick={onClick} className="px-4 py-2.5 text-sm">
              <Icon className="h-4 w-4" />{lbl}
            </GradBtn>
          ))}
        </div>
      </div>

      {/* ── 4 STAT CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Net Balance',    value: `₹${netBalance.toLocaleString()}`,   sub: `${savingsRate}% savings rate`, subColor: netBalance >= 0 ? '#10b981' : '#f43f5e', c1: '#0f1223', c2: '#1a1f45', icon: Wallet, textColor: 'white' },
          { label: 'Total Income',   value: `₹${totalIncome.toLocaleString()}`,  sub: 'All income recorded',           subColor: '#10b981',  c1: '#10b981', c2: '#059669', icon: TrendingUp, textColor: 'white' },
          { label: 'Total Expenses', value: `₹${totalExpense.toLocaleString()}`, sub: 'All expenses recorded',         subColor: '#f43f5e',  c1: '#f43f5e', c2: '#e11d48', icon: TrendingDown, textColor: 'white' },
          { label: 'Savings Rate',   value: `${savingsRate}%`,                   sub: netBalance >= 0 ? 'Positive cashflow' : 'Deficit — watch spending', subColor: savingsRate > 30 ? '#10b981' : '#f59e0b', c1: '#6366f1', c2: '#8b5cf6', icon: Target, textColor: 'white' },
        ].map(({ label: lbl, value, sub, subColor, c1, c2, icon: Icon }) => (
          <div key={lbl} style={neo.card} className="p-5 hover:-translate-y-0.5 transition-transform duration-200 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-20 h-20 rounded-full pointer-events-none"
              style={{ background: `radial-gradient(circle, ${c1}15 0%, transparent 70%)`, transform: 'translate(20%, -20%)' }} />
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{lbl}</span>
              <div className="h-9 w-9 rounded-xl flex items-center justify-center text-white"
                style={{ background: `linear-gradient(135deg, ${c1}, ${c2})`, boxShadow: `3px 3px 8px ${c1}40` }}>
                <Icon className="h-4.5 w-4.5" style={{ height: '1.1rem', width: '1.1rem' }} />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-800 font-mono-display">{value}</div>
            <div className="text-xs font-bold mt-1.5" style={{ color: subColor }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* ── MAIN GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* LEFT: Transactions */}
        <div className="lg:col-span-8 space-y-5">

          {/* Filter Bar */}
          <div style={neo.card} className="p-4 flex flex-col sm:flex-row gap-3">
            {/* Type tabs */}
            <div className="flex p-1 gap-1 rounded-xl" style={{ background: '#e4e6ef', boxShadow: 'inset 2px 2px 5px rgba(174,180,200,0.4), inset -2px -2px 5px rgba(255,255,255,0.8)' }}>
              {['all', 'expense', 'income'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-all"
                  style={activeTab === tab ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', boxShadow: '2px 2px 6px rgba(99,102,241,0.35)' } : { color: '#6b7280' }}>
                  {tab}
                </button>
              ))}
            </div>
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input type="text" placeholder="Search transactions..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm font-medium" style={neo.inset} />
            </div>
            {/* Category */}
            <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}
              className="text-sm font-bold py-2.5 px-3" style={{ ...neo.inset, cursor: 'pointer', appearance: 'none', minWidth: '140px' }}>
              <option value="all">All Categories</option>
              {CATEGORIES.expense.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
          </div>

          {/* Transaction List */}
          <div style={neo.card} className="p-5">
            <div className="flex items-center justify-between mb-4 pb-4"
              style={{ borderBottom: '1px solid rgba(174,180,200,0.35)' }}>
              <h3 className="text-base font-bold text-slate-800">Transaction History</h3>
              <span className="text-xs font-bold text-slate-500">{filteredTx.length} entries</span>
            </div>

            <div className="space-y-2.5 max-h-[520px] overflow-y-auto custom-scrollbar pr-1">
              {filteredTx.length === 0 ? (
                <div className="py-16 text-center">
                  <CreditCard className="h-10 w-10 mx-auto text-slate-300 mb-3" />
                  <p className="text-sm font-bold text-slate-500">No transactions found</p>
                  <p className="text-xs text-slate-400 mt-1">Add your first transaction using the button above</p>
                </div>
              ) : filteredTx.map(t => (
                <div key={t._id} style={neo.cardSm} className="flex items-center justify-between px-4 py-3.5 gap-3 hover:-translate-y-px transition-transform duration-150">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={t.type === 'income'
                        ? { background: '#d1fae5', color: '#10b981' }
                        : { background: '#ffe4e6', color: '#f43f5e' }}>
                      {t.type === 'income' ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-700 truncate">{t.description || t.category}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-lg"
                          style={{ background: '#ede9fe', color: '#7c3aed' }}>{t.category}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                        {t.paymentMethod && <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">{t.paymentMethod}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-sm font-black" style={{ color: t.type === 'income' ? '#10b981' : '#f43f5e' }}>
                      {t.type === 'income' ? '+' : '-'}₹{Number(t.amount).toLocaleString()}
                    </span>
                    <button onClick={() => deleteTransaction(t._id)}
                      className="h-7 w-7 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-all"
                      style={{ background: '#eef0f5', boxShadow: '2px 2px 5px rgba(174,180,200,0.4), -2px -2px 5px rgba(255,255,255,0.85)' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#f43f5e'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#eef0f5'; }}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Budget + Goals */}
        <div className="lg:col-span-4 space-y-5">

          {/* Budget Overview */}
          <div style={neo.card} className="p-5">
            <div className="flex items-center justify-between mb-4 pb-4"
              style={{ borderBottom: '1px solid rgba(174,180,200,0.35)' }}>
              <h3 className="text-base font-bold text-slate-800">Category Budgets</h3>
              <button onClick={() => setShowBudgetModal(true)}
                className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-0.5">
                <Plus className="h-3 w-3" /> Set
              </button>
            </div>

            <div className="space-y-4 max-h-72 overflow-y-auto custom-scrollbar pr-1">
              {Object.entries(categoryExpenses).length === 0 ? (
                <p className="text-xs text-slate-400 font-medium text-center py-4">No expense categories yet</p>
              ) : Object.entries(categoryExpenses).sort(([, a], [, b]) => b - a).map(([cat, spent]) => {
                const budget = budgets[cat];
                const pct = budget ? Math.min(100, Math.round((spent / budget) * 100)) : null;
                const isOver = pct && pct >= 100;
                return (
                  <div key={cat}>
                    <div className="flex justify-between text-xs font-bold mb-1.5">
                      <span className="text-slate-600 flex items-center gap-1">
                        {isOver && <AlertTriangle className="h-3 w-3 text-rose-500" />}
                        {cat}
                      </span>
                      <span className="text-slate-800">₹{spent.toLocaleString()}{budget ? ` / ₹${budget.toLocaleString()}` : ''}</span>
                    </div>
                    {budget && (
                      <div style={neo.progress}>
                        <div style={{
                          height: '100%', borderRadius: '999px',
                          width: `${pct}%`,
                          background: isOver ? 'linear-gradient(90deg, #f43f5e, #e11d48)' : pct > 75 ? 'linear-gradient(90deg, #f59e0b, #d97706)' : 'linear-gradient(90deg, #10b981, #059669)',
                          transition: 'width 0.5s ease',
                        }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Savings Goals */}
          <div style={neo.card} className="p-5">
            <div className="flex items-center justify-between mb-4 pb-4"
              style={{ borderBottom: '1px solid rgba(174,180,200,0.35)' }}>
              <h3 className="text-base font-bold text-slate-800">Savings Goals</h3>
              <button onClick={() => setShowGoalModal(true)}
                className="text-xs font-bold text-violet-600 hover:underline flex items-center gap-0.5">
                <Plus className="h-3 w-3" /> Add
              </button>
            </div>

            <div className="space-y-4 max-h-80 overflow-y-auto custom-scrollbar pr-1">
              {goals.length === 0 ? (
                <div className="text-center py-8">
                  <PiggyBank className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                  <p className="text-xs text-slate-400 font-medium">No savings goals yet</p>
                </div>
              ) : goals.map(goal => {
                const pct = goal.targetAmount > 0 ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) : 0;
                return (
                  <div key={goal._id} style={{ ...neo.cardSm, padding: '1rem' }}>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-xl flex-shrink-0"
                          style={{ background: `linear-gradient(135deg, ${goal.color || '#6366f1'}, ${goal.color || '#6366f1'}aa)`, boxShadow: `3px 3px 8px ${goal.color || '#6366f1'}35` }}>
                          <PiggyBank className="h-full w-full p-1.5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-700 truncate max-w-[120px]">{goal.title}</p>
                          <p className="text-[10px] text-slate-400 font-medium">₹{goal.currentAmount.toLocaleString()} / ₹{goal.targetAmount.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => setShowDepositModal(goal)}
                          className="text-[10px] font-black px-2.5 py-1.5 rounded-xl text-white"
                          style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '2px 2px 5px rgba(16,185,129,0.35)' }}>
                          +₹
                        </button>
                        <button onClick={() => deleteGoal(goal._id)}
                          className="h-7 w-7 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-all"
                          style={{ ...neo.cardSm, borderRadius: '10px' }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#f43f5e'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = '#eef0f5'; }}>
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <div style={neo.progress}>
                      <div style={{ height: '100%', borderRadius: '999px', width: `${pct}%`, background: `linear-gradient(90deg, ${goal.color || '#6366f1'}, ${goal.color || '#8b5cf6'})`, transition: 'width 0.5s ease' }} />
                    </div>
                    <p className="text-[10px] font-bold mt-1.5" style={{ color: goal.color || '#6366f1' }}>{pct}% saved</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ======================== MODALS ======================== */}

      {/* Add Transaction Modal */}
      {showTxModal && (
        <Modal title="Add Transaction" onClose={() => setShowTxModal(false)}>
          <form onSubmit={handleTxSubmit} className="space-y-4">
            {/* Type Toggle */}
            <div>
              {label('Type')}
              <div className="flex gap-2">
                {['expense', 'income'].map(t => (
                  <button key={t} type="button" onClick={() => setTxForm(p => ({ ...p, type: t }))}
                    className="flex-1 py-2.5 rounded-2xl text-sm font-bold capitalize transition-all"
                    style={txForm.type === t ? {
                      background: t === 'income' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #f43f5e, #e11d48)',
                      color: 'white', boxShadow: `3px 3px 8px ${t === 'income' ? 'rgba(16,185,129,0.4)' : 'rgba(244,63,94,0.4)'}`,
                    } : { ...neo.cardSm, color: '#6b7280' }}>
                    {t === 'income' ? '+ Income' : '- Expense'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              {label('Amount (₹) *')}
              <NeoInput type="number" min="0.01" step="0.01" required placeholder="0.00" value={txForm.amount} onChange={e => setTxForm(p => ({ ...p, amount: e.target.value }))} />
            </div>
            <div>
              {label('Category')}
              <NeoSelect value={txForm.category} onChange={e => setTxForm(p => ({ ...p, category: e.target.value }))}>
                {(txForm.type === 'income' ? CATEGORIES.income : CATEGORIES.expense).map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
              </NeoSelect>
            </div>
            <div>
              {label('Description')}
              <NeoInput type="text" placeholder="e.g. Lunch at Café" value={txForm.description} onChange={e => setTxForm(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                {label('Payment Method')}
                <NeoSelect value={txForm.paymentMethod} onChange={e => setTxForm(p => ({ ...p, paymentMethod: e.target.value }))}>
                  {['UPI / Bank', 'Cash', 'Credit Card', 'Debit Card', 'Net Banking', 'Wallet'].map(m => <option key={m} value={m}>{m}</option>)}
                </NeoSelect>
              </div>
              <div>
                {label('Date')}
                <NeoInput type="date" value={txForm.date} onChange={e => setTxForm(p => ({ ...p, date: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowTxModal(false)}
                className="flex-1 py-3 rounded-2xl text-sm font-bold text-slate-600"
                style={{ ...neo.cardSm }}>Cancel</button>
              <GradBtn type="submit" color1={txForm.type === 'income' ? '#10b981' : '#f43f5e'} color2={txForm.type === 'income' ? '#059669' : '#e11d48'}
                className="flex-1 py-3 text-sm">
                Add {txForm.type === 'income' ? 'Income' : 'Expense'}
              </GradBtn>
            </div>
          </form>
        </Modal>
      )}

      {/* Set Budget Modal */}
      {showBudgetModal && (
        <Modal title="Set Category Budget" onClose={() => setShowBudgetModal(false)}>
          <form onSubmit={handleBudgetSubmit} className="space-y-4">
            <div>
              {label('Category')}
              <NeoSelect value={budgetForm.category} onChange={e => setBudgetForm(p => ({ ...p, category: e.target.value }))}>
                {CATEGORIES.expense.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
              </NeoSelect>
            </div>
            <div>
              {label('Monthly Limit (₹) *')}
              <NeoInput type="number" min="1" required placeholder="e.g. 5000" value={budgetForm.monthlyLimit} onChange={e => setBudgetForm(p => ({ ...p, monthlyLimit: e.target.value }))} />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowBudgetModal(false)} className="flex-1 py-3 rounded-2xl text-sm font-bold text-slate-600" style={neo.cardSm}>Cancel</button>
              <GradBtn type="submit" color1="#6366f1" color2="#8b5cf6" className="flex-1 py-3 text-sm">Save Budget</GradBtn>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Goal Modal */}
      {showGoalModal && (
        <Modal title="New Savings Goal" onClose={() => setShowGoalModal(false)}>
          <form onSubmit={handleGoalSubmit} className="space-y-4">
            <div>
              {label('Goal Title *')}
              <NeoInput type="text" required placeholder="e.g. Emergency Fund" value={goalForm.title} onChange={e => setGoalForm(p => ({ ...p, title: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                {label('Target Amount (₹) *')}
                <NeoInput type="number" min="1" required placeholder="50000" value={goalForm.targetAmount} onChange={e => setGoalForm(p => ({ ...p, targetAmount: e.target.value }))} />
              </div>
              <div>
                {label('Already Saved (₹)')}
                <NeoInput type="number" min="0" placeholder="0" value={goalForm.currentAmount} onChange={e => setGoalForm(p => ({ ...p, currentAmount: e.target.value }))} />
              </div>
            </div>
            <div>
              {label('Target Date')}
              <NeoInput type="date" value={goalForm.targetDate} onChange={e => setGoalForm(p => ({ ...p, targetDate: e.target.value }))} />
            </div>
            <div>
              {label('Accent Color')}
              <div className="flex gap-2">
                {['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#3b82f6'].map(color => (
                  <button key={color} type="button" onClick={() => setGoalForm(p => ({ ...p, color }))}
                    className="h-8 w-8 rounded-full transition-transform"
                    style={{ background: color, transform: goalForm.color === color ? 'scale(1.25)' : 'scale(1)', boxShadow: goalForm.color === color ? `0 0 0 3px white, 0 0 0 5px ${color}` : 'none' }} />
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowGoalModal(false)} className="flex-1 py-3 rounded-2xl text-sm font-bold text-slate-600" style={neo.cardSm}>Cancel</button>
              <GradBtn type="submit" color1="#8b5cf6" color2="#7c3aed" className="flex-1 py-3 text-sm">Create Goal</GradBtn>
            </div>
          </form>
        </Modal>
      )}

      {/* Deposit Modal */}
      {showDepositModal && (
        <Modal title={`Deposit to "${showDepositModal.title}"`} onClose={() => setShowDepositModal(null)}>
          <form onSubmit={handleDepositSubmit} className="space-y-4">
            <div>
              {label('Deposit Amount (₹) *')}
              <NeoInput type="number" min="1" required placeholder="Enter amount" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} autoFocus />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowDepositModal(null)} className="flex-1 py-3 rounded-2xl text-sm font-bold text-slate-600" style={neo.cardSm}>Cancel</button>
              <GradBtn type="submit" color1="#10b981" color2="#059669" className="flex-1 py-3 text-sm">Add Deposit</GradBtn>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};

export default FinanceTracker;
