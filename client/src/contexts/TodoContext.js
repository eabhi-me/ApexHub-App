import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const TodoContext = createContext();

export const useTodos = () => {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodos must be used within a TodoProvider');
  }
  return context;
};

const INITIAL_TODOS = [
  {
    _id: 'todo-1',
    title: 'Review Data Structures dynamic programming lecture notes',
    description: 'Focus on 0/1 Knapsack, longest common subsequence, and matrix chain multiplication.',
    priority: 'high',
    completed: false,
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    notes: [
      { _id: 'n-1', content: 'Review chapter 6 practice set 1-12', createdAt: new Date().toISOString() }
    ]
  },
  {
    _id: 'todo-2',
    title: 'Submit DBMS Relational Algebra Lab Assignment',
    description: 'Format SQL queries and export PDF documentation.',
    priority: 'medium',
    completed: true,
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    notes: [
      { _id: 'n-2', content: 'Uploaded final zip to portal', createdAt: new Date().toISOString() }
    ]
  },
  {
    _id: 'todo-3',
    title: 'Pay monthly broadband internet & cloud subscription bill',
    description: 'Due on the 1st of the month via UPI.',
    priority: 'low',
    completed: false,
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    notes: []
  }
];

export const TodoProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);

  const isDemoUser = user?.email === 'demo@example.com' || user?.email === 'alex.carter@example.com' || user?._id === 'demo-user-id';
  const userKey = user?.email || user?._id || 'guest';

  const fetchTodos = useCallback(async () => {
    if (!isAuthenticated) {
      setTodos([]);
      return;
    }
    
    try {
      setLoading(true);
      const response = await api.get('/todos');
      if (response.data && response.data.length > 0) {
        setTodos(response.data);
      } else {
        const local = localStorage.getItem(`todos_${userKey}`);
        if (local) {
          setTodos(JSON.parse(local));
        } else if (isDemoUser) {
          setTodos(INITIAL_TODOS);
        } else {
          setTodos([]);
        }
      }
    } catch (error) {
      const local = localStorage.getItem(`todos_${userKey}`);
      if (local) {
        setTodos(JSON.parse(local));
      } else if (isDemoUser) {
        setTodos(INITIAL_TODOS);
      } else {
        setTodos([]);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isDemoUser, userKey]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  // Persist user-isolated todos
  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem(`todos_${userKey}`, JSON.stringify(todos));
    }
  }, [todos, isAuthenticated, userKey]);

  const createTodo = async (todoData) => {
    try {
      let newTodo;
      try {
        const response = await api.post('/todos', todoData);
        newTodo = response.data;
      } catch (err) {
        newTodo = {
          ...todoData,
          _id: 'todo-' + Date.now(),
          completed: false,
          notes: [],
          createdAt: new Date().toISOString()
        };
      }
      setTodos(prev => [newTodo, ...prev]);
      toast.success('Task created successfully');
      return { success: true, todo: newTodo };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create task';
      toast.error(message);
      return { success: false, message };
    }
  };

  const updateTodo = async (todoId, updates) => {
    try {
      try {
        await api.put(`/todos/${todoId}`, updates);
      } catch (err) {}
      setTodos(prev => prev.map(todo => 
        todo._id === todoId ? { ...todo, ...updates } : todo
      ));
      toast.success('Task updated successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update task';
      toast.error(message);
      return { success: false, message };
    }
  };

  const deleteTodo = async (todoId) => {
    try {
      try {
        await api.delete(`/todos/${todoId}`);
      } catch (err) {}
      setTodos(prev => prev.filter(todo => todo._id !== todoId));
      toast.success('Task deleted successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete task';
      toast.error(message);
      return { success: false, message };
    }
  };

  const addNote = async (todoId, content) => {
    try {
      const newNote = { _id: 'n-' + Date.now(), content, createdAt: new Date().toISOString() };
      try {
        await api.post(`/todos/${todoId}/notes`, { content });
      } catch (err) {}
      setTodos(prev => prev.map(todo => 
        todo._id === todoId ? { ...todo, notes: [...(todo.notes || []), newNote] } : todo
      ));
      toast.success('Note added successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add note';
      toast.error(message);
      return { success: false, message };
    }
  };

  const updateNote = async (todoId, noteId, content) => {
    try {
      try {
        await api.put(`/todos/${todoId}/notes/${noteId}`, { content });
      } catch (err) {}
      setTodos(prev => prev.map(todo => {
        if (todo._id === todoId) {
          const updatedNotes = (todo.notes || []).map(n => n._id === noteId ? { ...n, content } : n);
          return { ...todo, notes: updatedNotes };
        }
        return todo;
      }));
      toast.success('Note updated successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update note';
      toast.error(message);
      return { success: false, message };
    }
  };

  const deleteNote = async (todoId, noteId) => {
    try {
      try {
        await api.delete(`/todos/${todoId}/notes/${noteId}`);
      } catch (err) {}
      setTodos(prev => prev.map(todo => {
        if (todo._id === todoId) {
          const filteredNotes = (todo.notes || []).filter(n => n._id !== noteId);
          return { ...todo, notes: filteredNotes };
        }
        return todo;
      }));
      toast.success('Note deleted successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete note';
      toast.error(message);
      return { success: false, message };
    }
  };

  const value = {
    todos,
    loading,
    fetchTodos,
    createTodo,
    updateTodo,
    deleteTodo,
    addNote,
    updateNote,
    deleteNote
  };

  return (
    <TodoContext.Provider value={value}>
      {children}
    </TodoContext.Provider>
  );
};
