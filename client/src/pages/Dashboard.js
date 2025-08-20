import React, { useState } from 'react';
import { Plus, Filter, Search } from 'lucide-react';
import { useTodos } from '../contexts/TodoContext';
import TodoForm from '../components/TodoForm';
import TodoList from '../components/TodoList';

const Dashboard = () => {
  const { todos, loading } = useTodos();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all'); // all, active, completed
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTodos = todos.filter(todo => {
    const matchesSearch = todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      todo.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'active') return !todo.completed && matchesSearch;
    if (filter === 'completed') return todo.completed && matchesSearch;
    return matchesSearch;
  });

  const todoStats = {
    total: todos.length,
    completed: todos.filter(todo => todo.completed).length,
    pending: todos.filter(todo => !todo.completed).length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Todos</h1>
          <p className="mt-1 text-sm text-gray-500">
            {todoStats.total} total, {todoStats.pending} pending, {todoStats.completed} completed
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Todo
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search todos..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
          >
            <option value="all">All Todos</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Todo List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <TodoList todos={filteredTodos} />
      )}

      {/* Empty State */}
      {!loading && filteredTodos.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-gray-100">
            <Plus className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="mt-4 text-sm font-medium text-gray-900">
            {searchTerm || filter !== 'all' ? 'No todos found' : 'No todos yet'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filter !== 'all' 
              ? 'Try adjusting your search or filter.'
              : 'Get started by creating your first todo.'
            }
          </p>
          {!searchTerm && filter === 'all' && (
            <div className="mt-6">
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Todo
              </button>
            </div>
          )}
        </div>
      )}

      {/* Todo Form Modal */}
      {showForm && (
        <TodoForm
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
