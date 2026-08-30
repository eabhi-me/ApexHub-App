import React, { createContext, useContext, useState, useEffect } from 'react';
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

export const TodoProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTodos = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const response = await api.get('/todos');
      setTodos(response.data);
    } catch (error) {
      toast.error('Failed to fetch todos');
      console.error('Fetch todos error:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTodo = async (todoData) => {
    try {
      const response = await api.post('/todos', todoData);
      setTodos(prev => [response.data, ...prev]);
      toast.success('Todo created successfully');
      return { success: true, todo: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create todo';
      toast.error(message);
      return { success: false, message };
    }
  };

  const updateTodo = async (todoId, updates) => {
    try {
      const response = await api.put(`/todos/${todoId}`, updates);
      setTodos(prev => prev.map(todo => 
        todo._id === todoId ? response.data : todo
      ));
      toast.success('Todo updated successfully');
      return { success: true, todo: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update todo';
      toast.error(message);
      return { success: false, message };
    }
  };

  const deleteTodo = async (todoId) => {
    try {
      await api.delete(`/todos/${todoId}`);
      setTodos(prev => prev.filter(todo => todo._id !== todoId));
      toast.success('Todo deleted successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete todo';
      toast.error(message);
      return { success: false, message };
    }
  };

  const addNote = async (todoId, content) => {
    try {
      const response = await api.post(`/todos/${todoId}/notes`, { content });
      setTodos(prev => prev.map(todo => 
        todo._id === todoId ? response.data : todo
      ));
      toast.success('Note added successfully');
      return { success: true, todo: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add note';
      toast.error(message);
      return { success: false, message };
    }
  };

  const updateNote = async (todoId, noteId, content) => {
    try {
      const response = await api.put(`/todos/${todoId}/notes/${noteId}`, { content });
      setTodos(prev => prev.map(todo => 
        todo._id === todoId ? response.data : todo
      ));
      toast.success('Note updated successfully');
      return { success: true, todo: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update note';
      toast.error(message);
      return { success: false, message };
    }
  };

  const deleteNote = async (todoId, noteId) => {
    try {
      const response = await api.delete(`/todos/${todoId}/notes/${noteId}`);
      setTodos(prev => prev.map(todo => 
        todo._id === todoId ? response.data.todo : todo
      ));
      toast.success('Note deleted successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete note';
      toast.error(message);
      return { success: false, message };
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchTodos();
    } else {
      setTodos([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

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
