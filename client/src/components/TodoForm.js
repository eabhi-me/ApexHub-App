import React, { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';
import { useTodos } from '../contexts/TodoContext';

const TodoForm = ({ todo, onClose }) => {
  const { createTodo, updateTodo } = useTodos();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: todo?.title || '',
    description: todo?.description || '',
    priority: todo?.priority || 'medium',
    dueDate: todo?.dueDate ? new Date(todo.dueDate).toISOString().split('T')[0] : ''
  });

  const isEditing = !!todo;

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    setLoading(true);

    try {
      const todoData = {
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim(),
        dueDate: formData.dueDate || undefined
      };

      const result = isEditing 
        ? await updateTodo(todo._id, todoData)
        : await createTodo(todoData);

      if (result.success) {
        onClose();
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'text-green-600' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { value: 'high', label: 'High', color: 'text-red-600' }
  ];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {isEditing ? 'Edit Todo' : 'Create New Todo'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Enter todo title"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Enter description (optional)"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              value={formData.priority}
              onChange={handleChange}
            >
              {priorityOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
              Due Date
            </label>
            <div className="mt-1 relative">
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                className="block w-full border border-gray-300 rounded-md px-3 py-2 pl-10 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={formData.dueDate}
                onChange={handleChange}
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                isEditing ? 'Update Todo' : 'Create Todo'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TodoForm;
