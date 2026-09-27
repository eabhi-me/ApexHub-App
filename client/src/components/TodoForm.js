import React, { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';
import { useTodos } from '../contexts/TodoContext';

const neoInset = {
  background: '#e4e6ef',
  boxShadow: 'inset 3px 3px 7px rgba(174,180,200,0.5), inset -3px -3px 7px rgba(255,255,255,0.8)',
  borderRadius: '12px',
  border: '1px solid rgba(255,255,255,0.5)',
  width: '100%',
  padding: '0.625rem 1rem',
  fontSize: '0.875rem',
  fontWeight: '500',
  color: '#1e2332',
  outline: 'none',
  fontFamily: 'Plus Jakarta Sans, sans-serif',
};

const TodoForm = ({ todo, onClose }) => {
  const { createTodo, updateTodo } = useTodos();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: todo?.title || '',
    description: todo?.description || '',
    priority: todo?.priority || 'medium',
    dueDate: todo?.dueDate ? new Date(todo.dueDate).toISOString().split('T')[0] : '',
  });

  const isEditing = !!todo;
  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) { toast.error('Title is required'); return; }
    setLoading(true);
    try {
      const data = { ...formData, title: formData.title.trim(), description: formData.description.trim(), dueDate: formData.dueDate || undefined };
      const result = isEditing ? await updateTodo(todo._id, data) : await createTodo(data);
      if (result.success) onClose();
    } catch { toast.error('Something went wrong'); }
    finally { setLoading(false); }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,18,35,0.55)', backdropFilter: 'blur(6px)' }}
    >
      <div
        className="w-full max-w-md p-7 animate-scaleIn"
        style={{
          background: '#eef0f5',
          borderRadius: '28px',
          boxShadow: '20px 20px 50px rgba(174,180,200,0.65), -10px -10px 30px rgba(255,255,255,0.9)',
          border: '1px solid rgba(255,255,255,0.8)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-black text-slate-800">
            {isEditing ? 'Edit Task' : 'Create New Task'}
          </h3>
          <button
            onClick={onClose}
            className="h-9 w-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-rose-500 transition-colors"
            style={{
              background: '#eef0f5',
              boxShadow: '3px 3px 7px rgba(174,180,200,0.5), -3px -3px 7px rgba(255,255,255,0.85)',
              border: '1px solid rgba(255,255,255,0.7)',
            }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Title *
            </label>
            <input
              name="title" type="text" required
              value={formData.title} onChange={handleChange}
              placeholder="Enter task title..."
              style={neoInset}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Description
            </label>
            <textarea
              name="description" rows={3}
              value={formData.description} onChange={handleChange}
              placeholder="Add more details... (optional)"
              style={{ ...neoInset, resize: 'none', lineHeight: '1.5' }}
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Priority
            </label>
            <div className="flex gap-2">
              {[
                { value: 'low',    label: 'Low',    bg: '#d1fae5', color: '#10b981', activeBg: '#10b981' },
                { value: 'medium', label: 'Medium', bg: '#fef3c7', color: '#d97706', activeBg: '#f59e0b' },
                { value: 'high',   label: 'High',   bg: '#ffe4e6', color: '#f43f5e', activeBg: '#f43f5e' },
              ].map(p => (
                <button
                  key={p.value} type="button"
                  onClick={() => setFormData(prev => ({ ...prev, priority: p.value }))}
                  className="flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                  style={formData.priority === p.value ? {
                    background: `linear-gradient(135deg, ${p.activeBg}, ${p.activeBg}dd)`,
                    color: 'white',
                    boxShadow: `3px 3px 8px ${p.activeBg}50`,
                  } : {
                    background: '#eef0f5',
                    color: p.color,
                    boxShadow: '2px 2px 6px rgba(174,180,200,0.45), -2px -2px 6px rgba(255,255,255,0.85)',
                    border: '1px solid rgba(255,255,255,0.7)',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Due Date
            </label>
            <div className="relative">
              <input
                name="dueDate" type="date"
                value={formData.dueDate} onChange={handleChange}
                style={{ ...neoInset, paddingLeft: '2.5rem' }}
              />
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-slate-600"
              style={{
                background: '#eef0f5',
                boxShadow: '3px 3px 8px rgba(174,180,200,0.5), -3px -3px 8px rgba(255,255,255,0.85)',
                border: '1px solid rgba(255,255,255,0.7)',
              }}
            >
              Cancel
            </button>
            <button
              type="submit" disabled={loading}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
              style={{
                background: loading ? '#9ba5bc' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                boxShadow: loading ? 'none' : '4px 4px 12px rgba(99,102,241,0.4)',
              }}
            >
              {loading && <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />}
              {loading ? 'Saving...' : (isEditing ? 'Update Task' : 'Create Task')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TodoForm;
