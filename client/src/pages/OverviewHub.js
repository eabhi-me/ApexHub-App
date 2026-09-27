import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, Flame, Clock, CheckCircle2, Circle, AlertCircle,
  Plus, ArrowUpRight, Sparkles, Calendar, DollarSign, GraduationCap,
  Play, Pause, RotateCcw, CheckSquare
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTodos } from '../contexts/TodoContext';
import { useFinance } from '../contexts/FinanceContext';
import { useStudy } from '../contexts/StudyContext';

/* ── reusable inline-style helpers ── */
const neo = {
  card: {
    background: '#eef0f5',
    boxShadow: '8px 8px 20px rgba(174,180,200,0.6), -8px -8px 20px rgba(255,255,255,0.85)',
    border: '1px solid rgba(255,255,255,0.8)',
    borderRadius: '22px',
  },
  cardSm: {
    background: '#eef0f5',
    boxShadow: '5px 5px 12px rgba(174,180,200,0.55), -5px -5px 12px rgba(255,255,255,0.85)',
    border: '1px solid rgba(255,255,255,0.75)',
    borderRadius: '16px',
  },
  inset: {
    background: '#e4e6ef',
    boxShadow: 'inset 3px 3px 7px rgba(174,180,200,0.5), inset -3px -3px 7px rgba(255,255,255,0.8)',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.4)',
  },
  progressTrack: {
    background: '#e4e6ef',
    boxShadow: 'inset 2px 2px 5px rgba(174,180,200,0.55), inset -2px -2px 5px rgba(255,255,255,0.85)',
    borderRadius: '999px',
    overflow: 'hidden',
    height: '8px',
  },
};

const GradientIcon = ({ color1, color2, children, shadow }) => (
  <div
    className="flex items-center justify-center h-11 w-11 rounded-2xl text-white flex-shrink-0"
    style={{
      background: `linear-gradient(135deg, ${color1}, ${color2})`,
      boxShadow: shadow || `4px 4px 10px rgba(0,0,0,0.12), -2px -2px 8px rgba(255,255,255,0.6)`,
    }}
  >
    {children}
  </div>
);

const OverviewHub = () => {
  const { user } = useAuth();
  const { todos, updateTodo } = useTodos();
  const { netBalance, totalIncome, totalExpense, savingsRate, categoryExpenses } = useFinance();
  const { streak, totalHours, upcomingDeadlines, toggleDeadline, timerMode, timeLeft, isTimerRunning, setIsTimerRunning, resetTimer } = useStudy();

  const [quickTaskTitle, setQuickTaskTitle] = useState('');
  const { createTodo } = useTodos();

  const handleQuickAddTodo = async (e) => {
    e.preventDefault();
    if (!quickTaskTitle.trim()) return;
    await createTodo({ title: quickTaskTitle.trim(), priority: 'medium' });
    setQuickTaskTitle('');
  };

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const pendingTodos = todos.filter(t => !t.completed);
  const completedTodos = todos.filter(t => t.completed);
  const completionPct = todos.length > 0 ? Math.round((completedTodos.length / todos.length) * 100) : 0;
  const topDeadlines = upcomingDeadlines.slice(0, 3);
  const topCategories = Object.entries(categoryExpenses).sort(([, a], [, b]) => b - a).slice(0, 3);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const statCards = [
    {
      label: 'Net Balance', value: `₹${netBalance.toLocaleString()}`,
      sub: `${savingsRate}% savings rate`,
      subColor: netBalance >= 0 ? '#10b981' : '#f43f5e',
      icon: <DollarSign className="h-5 w-5 text-white" />,
      c1: '#10b981', c2: '#059669',
      footer: `In: +₹${totalIncome.toLocaleString()}   Out: -₹${totalExpense.toLocaleString()}`,
    },
    {
      label: 'Study Streak', value: `${streak} days`,
      sub: `${totalHours} total hours logged`,
      subColor: '#6366f1',
      icon: <Flame className="h-5 w-5 text-white fill-white" />,
      c1: '#f59e0b', c2: '#d97706',
      footer: 'Keep the fire burning!', link: '/study',
    },
    {
      label: 'Task Completion', value: `${completionPct}%`,
      sub: `${completedTodos.length}/${todos.length} tasks done`,
      subColor: '#6366f1',
      icon: <CheckSquare className="h-5 w-5 text-white" />,
      c1: '#6366f1', c2: '#8b5cf6',
      progress: completionPct,
      footer: `Pending: ${pendingTodos.length}`, link: '/dashboard',
    },
    {
      label: 'Next Deadline',
      value: topDeadlines[0]?.title || 'All Clear! 🎉',
      sub: topDeadlines[0]
        ? `Due ${new Date(topDeadlines[0].dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
        : 'No urgent deadlines',
      subColor: topDeadlines[0] ? '#f43f5e' : '#10b981',
      icon: <Calendar className="h-5 w-5 text-white" />,
      c1: '#f43f5e', c2: '#e11d48',
      footer: `${upcomingDeadlines.length} total upcoming`, link: '/study',
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">

      {/* ── WELCOME BANNER ── */}
      <div
        className="relative overflow-hidden p-7 text-white"
        style={{
          borderRadius: '28px',
          background: 'linear-gradient(135deg, #0f1223 0%, #1a1f45 50%, #0e1535 100%)',
          boxShadow: '10px 10px 30px rgba(99,102,241,0.25), -4px -4px 20px rgba(255,255,255,0.5)',
        }}
      >
        {/* Glow orbs */}
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)' }} />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="space-y-2">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold text-indigo-200"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              Personal Command Center
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {greeting},{' '}
              <span style={{ background: 'linear-gradient(90deg, #a5b4fc, #c4b5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {user?.username || 'Learner'}
              </span> 👋
            </h1>
            <p className="text-sm text-slate-300 max-w-lg">
              You have{' '}
              <span className="font-bold text-amber-400">{pendingTodos.length} tasks pending</span> and a{' '}
              <span className="font-bold text-emerald-400">{streak}-day study streak</span>. Let's make today count!
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link to="/study"
              className="inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-bold text-slate-900"
              style={{ background: 'white', boxShadow: '4px 4px 10px rgba(0,0,0,0.15)' }}>
              <GraduationCap className="h-4 w-4 mr-2 text-indigo-600" />
              Start Studying
            </Link>
            <Link to="/finance"
              className="inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-bold text-white"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}>
              <DollarSign className="h-4 w-4 mr-2 text-emerald-400" />
              Track Expense
            </Link>
          </div>
        </div>
      </div>

      {/* ── 4 STAT CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card) => (
          <div key={card.label} style={neo.card} className="p-5 hover:-translate-y-0.5 transition-transform duration-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{card.label}</span>
              <GradientIcon color1={card.c1} color2={card.c2}>{card.icon}</GradientIcon>
            </div>
            <div className="text-xl font-black text-slate-800 font-mono-display truncate">{card.value}</div>

            {card.progress !== undefined && (
              <div style={{ ...neo.progressTrack, marginTop: '0.5rem' }}>
                <div style={{ width: `${card.progress}%`, height: '100%', borderRadius: '999px', background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', transition: 'width 0.6s ease' }} />
              </div>
            )}

            <div className="mt-2 text-xs font-semibold" style={{ color: card.subColor }}>
              {card.sub}
            </div>

            <div className="mt-3 pt-3 flex justify-between items-center text-[11px] text-slate-400 font-medium"
              style={{ borderTop: '1px solid rgba(174,180,200,0.35)' }}>
              <span>{card.footer}</span>
              {card.link && (
                <Link to={card.link} className="text-indigo-500 font-bold hover:underline flex items-center gap-0.5">
                  Open <ArrowUpRight className="h-3 w-3" />
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── MAIN 2-COLUMN LAYOUT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* LEFT: Focus Timer + Deadlines */}
        <div className="lg:col-span-7 space-y-5">

          {/* Mini Pomodoro */}
          <div
            className="relative overflow-hidden p-6 text-white"
            style={{
              borderRadius: '22px',
              background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
              boxShadow: '8px 8px 20px rgba(99,102,241,0.25), -4px -4px 14px rgba(255,255,255,0.5)',
            }}
          >
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at 80% 20%, rgba(139,92,246,0.25) 0%, transparent 60%)' }} />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400" style={{ boxShadow: isTimerRunning ? '0 0 6px 2px rgba(52,211,153,0.6)' : 'none', animation: isTimerRunning ? 'pulse 2s infinite' : 'none' }} />
                  <span className="text-xs font-bold uppercase tracking-widest text-indigo-200">
                    Quick Focus — {timerMode === 'focus' ? 'Deep Study' : 'Break'}
                  </span>
                </div>
                <Link to="/study" className="text-xs font-bold text-indigo-300 hover:text-white flex items-center gap-1">
                  Full Studio <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                <div>
                  <div className="text-5xl font-black font-mono-display tracking-tight">{formatTimer(timeLeft)}</div>
                  <p className="text-xs text-indigo-300 mt-1.5 font-medium">
                    {isTimerRunning ? 'Session in progress... Stay in the flow!' : 'Ready to lock in for deep study?'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className="inline-flex items-center px-6 py-3 rounded-2xl text-sm font-bold text-white"
                    style={isTimerRunning
                      ? { background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '4px 4px 12px rgba(245,158,11,0.4)' }
                      : { background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '4px 4px 12px rgba(16,185,129,0.4)' }
                    }
                  >
                    {isTimerRunning ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                    {isTimerRunning ? 'Pause' : 'Start Focus'}
                  </button>
                  <button
                    onClick={resetTimer}
                    className="p-3 rounded-2xl text-white"
                    style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div style={neo.card} className="p-6">
            <div className="flex items-center justify-between pb-4 mb-4"
              style={{ borderBottom: '1px solid rgba(174,180,200,0.35)' }}>
              <div>
                <h3 className="text-base font-bold text-slate-800">Upcoming Deadlines & Exams</h3>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">Stay on top of submissions and test dates</p>
              </div>
              <Link to="/study" className="text-xs font-bold text-indigo-500 hover:underline flex items-center gap-0.5">
                View all ({upcomingDeadlines.length}) <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {topDeadlines.length === 0 ? (
                <div className="py-10 text-center text-slate-400 text-sm font-medium">
                  No upcoming deadlines! 🎉
                </div>
              ) : topDeadlines.map((item) => {
                const daysLeft = Math.ceil((new Date(item.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
                const isUrgent = daysLeft <= 2;
                return (
                  <div key={item._id} style={neo.cardSm} className="px-4 py-3.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <button onClick={() => toggleDeadline(item._id)} className="text-slate-400 hover:text-indigo-500 flex-shrink-0">
                        <Circle className="h-5 w-5" />
                      </button>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-700 truncate">{item.title}</p>
                        <span className="text-[10px] font-bold uppercase text-indigo-600 px-2 py-0.5 rounded-lg"
                          style={{ background: '#ede9fe' }}>{item.type}</span>
                      </div>
                    </div>
                    <span className={`flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-xl ${isUrgent ? 'animate-pulse' : ''}`}
                      style={{ background: isUrgent ? '#ffe4e6' : '#f1f5f9', color: isUrgent ? '#f43f5e' : '#64748b' }}>
                      {daysLeft < 0 ? 'Overdue' : daysLeft === 0 ? 'Today!' : daysLeft === 1 ? 'Tomorrow' : `${daysLeft}d`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT: Tasks + Finance */}
        <div className="lg:col-span-5 space-y-5">

          {/* Quick Task Card */}
          <div style={neo.card} className="p-6">
            <div className="flex items-center justify-between pb-4 mb-4"
              style={{ borderBottom: '1px solid rgba(174,180,200,0.35)' }}>
              <h3 className="text-base font-bold text-slate-800">Today's Tasks</h3>
              <Link to="/dashboard" className="text-xs font-bold text-indigo-500 hover:underline flex items-center gap-0.5">
                All Tasks <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <form onSubmit={handleQuickAddTodo} className="flex gap-2 mb-4">
              <input
                type="text" value={quickTaskTitle}
                onChange={e => setQuickTaskTitle(e.target.value)}
                placeholder="Quick add a task..."
                className="flex-1 px-3.5 py-2 text-sm font-medium"
                style={neo.inset}
              />
              <button type="submit"
                className="px-3.5 py-2 rounded-xl text-white flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '3px 3px 8px rgba(99,102,241,0.35)' }}>
                <Plus className="h-4 w-4" />
              </button>
            </form>

            <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
              {todos.slice(0, 5).map(todo => (
                <div key={todo._id} style={todo.completed ? { ...neo.cardSm, opacity: 0.55 } : neo.cardSm}
                  className="flex items-center justify-between px-3.5 py-2.5 gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <button onClick={() => updateTodo(todo._id, { completed: !todo.completed })}
                      className="flex-shrink-0 text-slate-400 hover:text-indigo-500">
                      {todo.completed
                        ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        : <Circle className="h-4 w-4" />}
                    </button>
                    <span className={`text-xs font-semibold truncate ${todo.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                      {todo.title}
                    </span>
                  </div>
                  <span className="flex-shrink-0 text-[9px] font-black uppercase px-2 py-0.5 rounded-lg"
                    style={{
                      background: todo.priority === 'high' ? '#ffe4e6' : todo.priority === 'medium' ? '#fef3c7' : '#f1f5f9',
                      color: todo.priority === 'high' ? '#f43f5e' : todo.priority === 'medium' ? '#d97706' : '#64748b',
                    }}>
                    {todo.priority}
                  </span>
                </div>
              ))}
              {todos.length === 0 && (
                <div className="py-6 text-center text-slate-400 text-xs font-medium">No tasks yet. Type above to create one!</div>
              )}
            </div>
          </div>

          {/* Spending Breakdown */}
          <div style={neo.card} className="p-6">
            <div className="flex items-center justify-between pb-4 mb-4"
              style={{ borderBottom: '1px solid rgba(174,180,200,0.35)' }}>
              <h3 className="text-base font-bold text-slate-800">Spending Breakdown</h3>
              <Link to="/finance" className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-0.5">
                Finance Hub <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="space-y-4">
              {topCategories.length === 0
                ? <div className="py-6 text-center text-slate-400 text-xs font-medium">No expense records yet.</div>
                : topCategories.map(([category, amount]) => {
                  const pct = totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0;
                  return (
                    <div key={category} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-600">{category}</span>
                        <span className="text-slate-800">₹{amount.toLocaleString()} <span className="text-slate-400">({pct}%)</span></span>
                      </div>
                      <div style={neo.progressTrack}>
                        <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #10b981, #059669)', borderRadius: '999px', transition: 'width 0.6s ease' }} />
                      </div>
                    </div>
                  );
                })}
            </div>

            <Link to="/finance"
              className="mt-5 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-slate-600"
              style={{ ...neo.cardSm, borderRadius: '14px' }}>
              <Plus className="h-3.5 w-3.5 text-emerald-600" />
              Record New Transaction
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OverviewHub;
