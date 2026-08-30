import React, { useState } from 'react';
import { 
  Plus, 
  Filter, 
  Search, 
  Kanban, 
  List, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Sparkles,
  Layers
} from 'lucide-react';
import { useTodos } from '../contexts/TodoContext';
import TodoForm from '../components/TodoForm';
import TodoItem from '../components/TodoItem';

const Dashboard = () => {
  const { todos, loading } = useTodos();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all'); // all, active, completed, high, medium, low
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'kanban'

  const filteredTodos = todos.filter(todo => {
    const matchesSearch = 
      todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      todo.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'active') return !todo.completed && matchesSearch;
    if (filter === 'completed') return todo.completed && matchesSearch;
    if (['high', 'medium', 'low'].includes(filter)) return todo.priority === filter && matchesSearch;
    return matchesSearch;
  });

  const todoStats = {
    total: todos.length,
    completed: todos.filter(todo => todo.completed).length,
    pending: todos.filter(todo => !todo.completed).length,
    high: todos.filter(todo => todo.priority === 'high' && !todo.completed).length
  };

  const kanbanColumns = [
    { id: 'todo', title: 'To Do', items: filteredTodos.filter(t => !t.completed && t.priority !== 'high'), color: 'border-blue-400' },
    { id: 'urgent', title: 'Urgent / High Priority', items: filteredTodos.filter(t => !t.completed && t.priority === 'high'), color: 'border-rose-400' },
    { id: 'completed', title: 'Completed', items: filteredTodos.filter(t => t.completed), color: 'border-emerald-400' }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Tasks & Notes Workspace</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Organize tasks, attach structured notes, and manage daily execution.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200/60 text-xs font-semibold">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition-all ${
                viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <List className="h-4 w-4" />
              <span>List</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition-all ${
                viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Kanban className="h-4 w-4" />
              <span>Kanban</span>
            </button>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all active:scale-95"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add Task
          </button>
        </div>
      </div>

      {/* 4 Stat Overview Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 font-mono">{todoStats.total}</div>
            <div className="text-xs text-slate-500 font-medium">Total Tasks</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-black text-amber-600 font-mono">{todoStats.pending}</div>
            <div className="text-xs text-slate-500 font-medium">In Progress</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-black text-rose-600 font-mono">{todoStats.high}</div>
            <div className="text-xs text-slate-500 font-medium">Urgent / High</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-black text-emerald-600 font-mono">{todoStats.completed}</div>
            <div className="text-xs text-slate-500 font-medium">Completed</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks, descriptions, notes..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700"
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

      {/* Loading state */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      ) : viewMode === 'kanban' ? (
        
        /* Kanban View */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {kanbanColumns.map((col) => (
            <div key={col.id} className="bg-slate-100/70 rounded-3xl p-4 border border-slate-200/80 space-y-3 min-h-[400px]">
              <div className="flex items-center justify-between px-2 py-1">
                <div className="flex items-center space-x-2">
                  <span className={`w-2.5 h-2.5 rounded-full border-2 ${col.color} bg-white`} />
                  <h3 className="font-bold text-sm text-slate-800">{col.title}</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-white text-xs font-bold text-slate-600 shadow-sm">
                  {col.items.length}
                </span>
              </div>

              <div className="space-y-3">
                {col.items.length === 0 ? (
                  <div className="text-center py-10 text-xs text-slate-400">
                    No tasks in this lane.
                  </div>
                ) : (
                  col.items.map(todo => (
                    <TodoItem key={todo._id} todo={todo} />
                  ))
                )}
              </div>
            </div>
          ))}
        </div>

      ) : (
        
        /* List View */
        <div className="space-y-3">
          {filteredTodos.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8">
              <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">
                {searchTerm || filter !== 'all' ? 'No tasks found' : 'Workspace is clear!'}
              </h3>
              <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                {searchTerm || filter !== 'all' 
                  ? 'Try modifying your search or priority filter.'
                  : 'Start by creating your first task to track progress.'}
              </p>
              {!searchTerm && filter === 'all' && (
                <div className="mt-5">
                  <button
                    onClick={() => setShowForm(true)}
                    className="inline-flex items-center px-4 py-2 text-xs font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm"
                  >
                    <Plus className="h-4 w-4 mr-1.5" />
                    Create Task
                  </button>
                </div>
              )}
            </div>
          ) : (
            filteredTodos.map((todo) => (
              <TodoItem key={todo._id} todo={todo} />
            ))
          )}
        </div>
      )}

      {/* Todo Form Modal */}
      {showForm && (
        <TodoForm onClose={() => setShowForm(false)} />
      )}
    </div>
  );
};

export default Dashboard;
