import React, { useState } from 'react';
import { Plus, Filter, Search, Kanban, List, CheckCircle2, Clock, AlertCircle, Sparkles, Layers } from 'lucide-react';
import { useTodos } from '../contexts/TodoContext';
import TodoForm from '../components/TodoForm';
import TodoItem from '../components/TodoItem';

const neo = {
  card: {
    background: '#ffffff',
    boxShadow: 'none',
    border: '1px solid rgba(255,255,255,0.8)',
    borderRadius: '22px',
  },
  inset: {
    background: '#f8fafc',
    boxShadow: 'none',
    borderRadius: '12px',
    border: '1px solid #cbd5e1',
  },
};

const Dashboard = () => {
  const { todos, loading } = useTodos();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list');

  const filteredTodos = todos.filter(todo => {
    const matchesSearch =
      todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      todo.description?.toLowerCase().includes(searchTerm.toLowerCase());
    if (filter === 'active') return !todo.completed && matchesSearch;
    if (filter === 'completed') return todo.completed && matchesSearch;
    if (['high', 'medium', 'low'].includes(filter)) return todo.priority === filter && matchesSearch;
    return matchesSearch;
  });

  const stats = {
    total: todos.length,
    pending: todos.filter(t => !t.completed).length,
    high: todos.filter(t => t.priority === 'high' && !t.completed).length,
    completed: todos.filter(t => t.completed).length,
  };

  const kanbanColumns = [
    { id: 'todo',      title: 'To Do',              items: filteredTodos.filter(t => !t.completed && t.priority !== 'high'), accent: '#6366f1' },
    { id: 'urgent',    title: 'Urgent / High',       items: filteredTodos.filter(t => !t.completed && t.priority === 'high'), accent: '#f43f5e' },
    { id: 'completed', title: 'Completed',           items: filteredTodos.filter(t => t.completed), accent: '#10b981' },
  ];

  const statCards = [
    { label: 'Total Tasks', value: stats.total,     icon: Layers,       c1: '#6366f1', c2: '#8b5cf6' },
    { label: 'In Progress', value: stats.pending,   icon: Clock,        c1: '#f59e0b', c2: '#d97706' },
    { label: 'Urgent',      value: stats.high,      icon: AlertCircle,  c1: '#f43f5e', c2: '#e11d48' },
    { label: 'Completed',   value: stats.completed, icon: CheckCircle2, c1: '#10b981', c2: '#059669' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">

      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Tasks & Notes Workspace</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Organize tasks, attach notes, and manage daily execution.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* View Toggle */}
          <div
            className="flex p-1.5 gap-1"
            style={{ ...neo.card, borderRadius: '16px', padding: '6px' }}
          >
            {[
              { mode: 'list',   Icon: List,   label: 'List' },
              { mode: 'kanban', Icon: Kanban, label: 'Kanban' },
            ].map(({ mode, Icon, label }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                style={viewMode === mode ? {
                  background: '#6366f1',
                  color: 'white',
                  boxShadow: 'none',
                } : {
                  background: '#ffffff',
                  color: '#6b7280',
                  boxShadow: 'none',
                }}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2.5 rounded-2xl text-sm font-bold text-white gap-1.5"
            style={{
              background: '#6366f1',
              boxShadow: 'none',
            }}
          >
            <Plus className="h-4 w-4" />
            Add Task
          </button>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, c1, c2 }) => (
          <div key={label} style={neo.card} className="p-5 flex items-center gap-4 hover:-translate-y-0.5 transition-transform duration-200">
            <div
              className="h-11 w-11 rounded-2xl flex items-center justify-center text-white flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${c1}, ${c2})`, boxShadow: 'none' }}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-800 font-mono-display">{value}</div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── SEARCH & FILTER ── */}
      <div style={neo.card} className="flex flex-col sm:flex-row gap-4 p-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks, descriptions..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm font-medium"
            style={neo.inset}
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400 flex-shrink-0" />
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="text-sm font-bold px-3 py-2.5"
            style={{ ...neo.inset, cursor: 'pointer', appearance: 'none', minWidth: '140px' }}
          >
            <option value="all">All Tasks</option>
            <option value="active">Active Only</option>
            <option value="completed">Completed</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
      </div>

      {/* ── CONTENT ── */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 rounded-full border-4 border-transparent animate-spin"
            style={{ borderTopColor: '#6366f1', boxShadow: 'none' }} />
        </div>

      ) : viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {kanbanColumns.map(col => (
            <div key={col.id} style={{ ...neo.card, padding: '1.25rem' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ background: col.accent, boxShadow: 'none' }} />
                  <h3 className="text-sm font-bold text-slate-700">{col.title}</h3>
                </div>
                <span
                  className="text-xs font-black px-2.5 py-1 rounded-xl"
                  style={{
                    background: '#ffffff',
                    color: col.accent,
                    boxShadow: 'none',
                  }}
                >
                  {col.items.length}
                </span>
              </div>
              <div className="space-y-3 min-h-[200px]">
                {col.items.length === 0
                  ? <div className="text-center text-xs text-slate-400 font-medium py-8">No tasks here.</div>
                  : col.items.map(t => <TodoItem key={t._id} todo={t} />)
                }
              </div>
            </div>
          ))}
        </div>

      ) : (
        <div className="space-y-3">
          {filteredTodos.length === 0 ? (
            <div style={neo.card} className="text-center py-16 p-8">
              <div
                className="h-14 w-14 mx-auto rounded-3xl flex items-center justify-center mb-4"
                style={{ background: '#6366f1', boxShadow: 'none' }}
              >
                <Sparkles className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-base font-bold text-slate-700">
                {searchTerm || filter !== 'all' ? 'No tasks found' : 'Workspace is clear!'}
              </h3>
              <p className="text-sm text-slate-400 mt-1 font-medium max-w-xs mx-auto">
                {searchTerm || filter !== 'all'
                  ? 'Try modifying your search or filter.'
                  : 'Start by creating your first task to track your progress.'}
              </p>
              {!searchTerm && filter === 'all' && (
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold text-white"
                  style={{ background: '#6366f1', boxShadow: 'none' }}
                >
                  <Plus className="h-4 w-4" />
                  Create Task
                </button>
              )}
            </div>
          ) : (
            filteredTodos.map(todo => <TodoItem key={todo._id} todo={todo} />)
          )}
        </div>
      )}

      {showForm && <TodoForm onClose={() => setShowForm(false)} />}
    </div>
  );
};

export default Dashboard;
