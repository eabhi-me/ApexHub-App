import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  Flame, 
  Clock, 
  CheckCircle2, 
  Circle, 
  AlertCircle, 
  Plus, 
  ArrowUpRight, 
  Sparkles,
  Calendar,
  DollarSign,
  GraduationCap,
  Play,
  Pause,
  RotateCcw,
  CheckSquare
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTodos } from '../contexts/TodoContext';
import { useFinance } from '../contexts/FinanceContext';
import { useStudy } from '../contexts/StudyContext';

const OverviewHub = () => {
  const { user } = useAuth();
  const { todos, updateTodo } = useTodos();
  const { netBalance, totalIncome, totalExpense, savingsRate, categoryExpenses } = useFinance();
  const { 
    streak, 
    totalHours, 
    upcomingDeadlines, 
    toggleDeadline,
    timerMode,
    timeLeft,
    isTimerRunning,
    setIsTimerRunning,
    resetTimer
  } = useStudy();

  const [quickTaskTitle, setQuickTaskTitle] = useState('');
  const { createTodo } = useTodos();

  const handleQuickAddTodo = async (e) => {
    e.preventDefault();
    if (!quickTaskTitle.trim()) return;
    await createTodo({
      title: quickTaskTitle.trim(),
      priority: 'medium'
    });
    setQuickTaskTitle('');
  };

  // Format pomodoro time
  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const pendingTodos = todos.filter(t => !t.completed);
  const completedTodos = todos.filter(t => t.completed);
  const completionPercentage = todos.length > 0 ? Math.round((completedTodos.length / todos.length) * 100) : 0;

  // Next 3 urgent deadlines
  const topDeadlines = upcomingDeadlines.slice(0, 3);

  // Top spending categories
  const topCategories = Object.entries(categoryExpenses)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  // Greeting based on time
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-6 sm:p-8 text-white shadow-xl shadow-indigo-950/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-indigo-200 border border-white/10">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Personal Command Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {greeting}, <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-200">{user?.username || 'Learner'}</span> 👋
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-xl">
              You have <span className="font-semibold text-amber-400">{pendingTodos.length} tasks pending</span> and a{' '}
              <span className="font-semibold text-emerald-400">{streak}-day study streak</span>. Let's make today productive!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/study"
              className="inline-flex items-center px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-white text-slate-900 hover:bg-slate-100 shadow-md transition-all active:scale-95"
            >
              <GraduationCap className="h-4 w-4 mr-2 text-indigo-600" />
              Start Studying
            </Link>
            <Link
              to="/finance"
              className="inline-flex items-center px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/15 transition-all active:scale-95"
            >
              <DollarSign className="h-4 w-4 mr-2 text-emerald-400" />
              Track Expense
            </Link>
          </div>
        </div>

        {/* Decorative background glow circles */}
        <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
      </div>

      {/* 4 Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Net Financial Balance */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Net Balance</span>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">
              ₹{netBalance.toLocaleString()}
            </div>
            <div className="mt-1 flex items-center text-xs text-slate-500">
              <span className={`inline-flex items-center font-bold mr-1.5 ${netBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {netBalance >= 0 ? <TrendingUp className="h-3.5 w-3.5 mr-0.5" /> : <TrendingDown className="h-3.5 w-3.5 mr-0.5" />}
                {savingsRate}%
              </span>
              <span>savings rate</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between text-[11px] text-slate-500">
            <span>In: <strong className="text-emerald-600 font-semibold">+₹{totalIncome.toLocaleString()}</strong></span>
            <span>Out: <strong className="text-rose-600 font-semibold">-₹{totalExpense.toLocaleString()}</strong></span>
          </div>
        </div>

        {/* Study Streak & Focus */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Study Streak</span>
            <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
              <Flame className="h-5 w-5 fill-amber-500 animate-pulse" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 flex items-center">
              {streak} <span className="text-sm font-semibold text-slate-500 ml-1.5">days streak</span>
            </div>
            <div className="mt-1 flex items-center text-xs text-slate-500">
              <Clock className="h-3.5 w-3.5 text-indigo-500 mr-1" />
              <span>{totalHours} total study hours logged</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="text-indigo-600 font-medium">Keep the fire burning!</span>
            <Link to="/study" className="text-indigo-600 font-semibold hover:underline flex items-center">
              Open <ArrowUpRight className="h-3 w-3 ml-0.5" />
            </Link>
          </div>
        </div>

        {/* Tasks & Todo Progress */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Task Completion</span>
            <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CheckSquare className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 flex items-baseline justify-between">
              <span>{completionPercentage}%</span>
              <span className="text-xs font-semibold text-slate-500">{completedTodos.length}/{todos.length} done</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between text-[11px] text-slate-500">
            <span>Pending: <strong className="text-amber-600">{pendingTodos.length}</strong></span>
            <Link to="/dashboard" className="text-indigo-600 font-semibold hover:underline flex items-center">
              View Tasks <ArrowUpRight className="h-3 w-3 ml-0.5" />
            </Link>
          </div>
        </div>

        {/* Next Urgent Exam / Deadline */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Next Deadline</span>
            <div className="h-9 w-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            {topDeadlines.length > 0 ? (
              <>
                <div className="text-base font-bold text-slate-900 truncate" title={topDeadlines[0].title}>
                  {topDeadlines[0].title}
                </div>
                <div className="mt-1 flex items-center text-xs font-semibold text-rose-600">
                  <AlertCircle className="h-3.5 w-3.5 mr-1" />
                  <span>Due {new Date(topDeadlines[0].dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                </div>
              </>
            ) : (
              <>
                <div className="text-base font-bold text-slate-700">All Clear! 🎉</div>
                <div className="mt-1 text-xs text-slate-400">No urgent deadlines scheduled</div>
              </>
            )}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between text-[11px] text-slate-500">
            <span>{upcomingDeadlines.length} total upcoming</span>
            <Link to="/study" className="text-indigo-600 font-semibold hover:underline flex items-center">
              Planner <ArrowUpRight className="h-3 w-3 ml-0.5" />
            </Link>
          </div>
        </div>

      </div>

      {/* Main 2-Column Hub Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (Focus Timer & Deadlines) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Mini Pomodoro Focus Launcher */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl p-6 shadow-md border border-indigo-800/40 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">
                  Quick Focus ({timerMode === 'focus' ? 'Study' : 'Break'})
                </span>
              </div>
              <Link to="/study" className="text-xs font-semibold text-indigo-300 hover:text-white flex items-center">
                Full Studio <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white">
                  {formatTimer(timeLeft)}
                </div>
                <p className="text-xs text-indigo-200/80 mt-1">
                  {isTimerRunning ? 'Session in progress... Stay in the flow!' : 'Ready to lock in for deep study?'}
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className={`inline-flex items-center px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all active:scale-95 ${
                    isTimerRunning
                      ? 'bg-amber-500 hover:bg-amber-600 text-white'
                      : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  }`}
                >
                  {isTimerRunning ? <Pause className="h-4 w-4 mr-1.5" /> : <Play className="h-4 w-4 mr-1.5" />}
                  {isTimerRunning ? 'Pause' : 'Start Focus'}
                </button>
                <button
                  onClick={resetTimer}
                  title="Reset Timer"
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-colors"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Upcoming Exams & Assignments */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Upcoming Deadlines & Exams</h3>
                <p className="text-xs text-slate-500">Stay on top of submissions and test dates</p>
              </div>
              <Link
                to="/study"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline flex items-center"
              >
                View all ({upcomingDeadlines.length}) <ArrowUpRight className="h-3.5 w-3.5 ml-0.5" />
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {topDeadlines.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-sm">
                  No upcoming deadlines! Take a breather or add one from Study Planner.
                </div>
              ) : (
                topDeadlines.map((item) => {
                  const daysLeft = Math.ceil((new Date(item.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
                  const isUrgent = daysLeft <= 2;

                  return (
                    <div
                      key={item._id}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/60 transition-all"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <button
                          onClick={() => toggleDeadline(item._id)}
                          className="text-slate-400 hover:text-indigo-600 transition-colors flex-shrink-0"
                        >
                          <Circle className="h-5 w-5" />
                        </button>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">{item.title}</p>
                          <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
                            <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-medium">
                              {item.type}
                            </span>
                            {item.weightage && <span>Weight: {item.weightage}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0 ml-3">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                          isUrgent ? 'bg-rose-100 text-rose-700 animate-pulse' : 'bg-slate-200/80 text-slate-700'
                        }`}>
                          {daysLeft < 0 ? 'Overdue' : daysLeft === 0 ? 'Today!' : daysLeft === 1 ? 'Tomorrow' : `In ${daysLeft} days`}
                        </span>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {new Date(item.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* Right Column (Tasks & Finance Snapshot) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Quick Task Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Today's Tasks</h3>
              <Link to="/dashboard" className="text-xs font-semibold text-indigo-600 hover:underline flex items-center">
                All Todos <ArrowUpRight className="h-3.5 w-3.5 ml-0.5" />
              </Link>
            </div>

            {/* Quick Add Form */}
            <form onSubmit={handleQuickAddTodo} className="mt-4 flex gap-2">
              <input
                type="text"
                value={quickTaskTitle}
                onChange={(e) => setQuickTaskTitle(e.target.value)}
                placeholder="Quick add a new task..."
                className="flex-1 px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <button
                type="submit"
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </form>

            {/* Tasks list preview */}
            <div className="mt-4 space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
              {todos.slice(0, 4).map((todo) => (
                <div
                  key={todo._id}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                    todo.completed ? 'bg-slate-50/60 border-slate-100 text-slate-400' : 'bg-white border-slate-200/80 text-slate-800'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <button
                      onClick={() => updateTodo(todo._id, { completed: !todo.completed })}
                      className="text-slate-400 hover:text-indigo-600 transition-colors flex-shrink-0"
                    >
                      {todo.completed ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Circle className="h-4 w-4" />
                      )}
                    </button>
                    <span className={`text-xs sm:text-sm truncate font-medium ${todo.completed ? 'line-through' : ''}`}>
                      {todo.title}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                    todo.priority === 'high' ? 'bg-rose-50 text-rose-700' : todo.priority === 'medium' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {todo.priority}
                  </span>
                </div>
              ))}
              {todos.length === 0 && (
                <div className="text-center py-6 text-slate-400 text-xs">
                  No tasks yet! Type above to create one.
                </div>
              )}
            </div>
          </div>

          {/* Financial Spending Highlights */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Spending Breakdown</h3>
              <Link to="/finance" className="text-xs font-semibold text-emerald-600 hover:underline flex items-center">
                Finance Hub <ArrowUpRight className="h-3.5 w-3.5 ml-0.5" />
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {topCategories.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  No expense records yet this month.
                </div>
              ) : (
                topCategories.map(([category, amount]) => {
                  const pct = totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0;
                  return (
                    <div key={category} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-slate-700">{category}</span>
                        <span className="font-bold text-slate-900">₹{amount.toLocaleString()} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-center">
              <Link
                to="/finance"
                className="inline-flex items-center justify-center w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200/80 transition-colors"
              >
                <Plus className="h-3.5 w-3.5 mr-1 text-emerald-600" />
                Record New Transaction
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default OverviewHub;
