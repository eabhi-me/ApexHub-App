import React, { useState } from 'react';
import {
  Check, Edit, Trash2, Calendar, MessageSquare,
  ChevronDown, ChevronRight, AlertCircle, Clock
} from 'lucide-react';
import { format, isBefore, startOfDay } from 'date-fns';
import { useTodos } from '../contexts/TodoContext';
import TodoForm from './TodoForm';
import NotesList from './NotesList';

const priorityConfig = {
  high:   { bg: '#ffe4e6', color: '#f43f5e', border: 'rgba(244,63,94,0.2)' },
  medium: { bg: '#fef3c7', color: '#d97706', border: 'rgba(217,119,6,0.2)' },
  low:    { bg: '#d1fae5', color: '#10b981', border: 'rgba(16,185,129,0.2)' },
};

const TodoItem = ({ todo }) => {
  const { updateTodo, deleteTodo } = useTodos();
  const [showEditForm, setShowEditForm] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleToggleComplete = async () => {
    setLoading(true);
    await updateTodo(todo._id, { completed: !todo.completed });
    setLoading(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Delete this task?')) await deleteTodo(todo._id);
  };

  const getDueDateStatus = (dueDate) => {
    if (!dueDate) return null;
    const today = startOfDay(new Date());
    const due = startOfDay(new Date(dueDate));
    if (isBefore(due, today)) return { color: '#f43f5e', icon: AlertCircle };
    if (due.getTime() === today.getTime()) return { color: '#f59e0b', icon: Clock };
    return { color: '#6366f1', icon: Calendar };
  };

  const dueDateStatus = getDueDateStatus(todo.dueDate);
  const pc = priorityConfig[todo.priority] || priorityConfig.low;

  return (
    <div
      className="transition-all duration-200 hover:-translate-y-0.5"
      style={{
        background: '#eef0f5',
        borderRadius: '18px',
        boxShadow: todo.completed
          ? 'inset 3px 3px 7px rgba(174,180,200,0.4), inset -3px -3px 7px rgba(255,255,255,0.7)'
          : '6px 6px 16px rgba(174,180,200,0.55), -6px -6px 16px rgba(255,255,255,0.85)',
        border: '1px solid rgba(255,255,255,0.75)',
        opacity: todo.completed ? 0.65 : 1,
      }}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">

          {/* Neomorphic Checkbox */}
          <button
            onClick={handleToggleComplete}
            disabled={loading}
            className="flex-shrink-0 mt-0.5 h-5 w-5 rounded-lg flex items-center justify-center transition-all"
            style={todo.completed ? {
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              boxShadow: '2px 2px 5px rgba(99,102,241,0.4)',
            } : {
              background: '#eef0f5',
              boxShadow: 'inset 2px 2px 5px rgba(174,180,200,0.5), inset -2px -2px 5px rgba(255,255,255,0.85)',
              border: '1px solid rgba(255,255,255,0.5)',
            }}
          >
            {todo.completed && <Check className="h-3 w-3 text-white" />}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className={`text-sm font-bold truncate ${todo.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                  {todo.title}
                </h3>
                {todo.description && (
                  <p className="mt-0.5 text-xs font-medium text-slate-400 line-clamp-2">{todo.description}</p>
                )}

                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span
                    className="text-[10px] font-black uppercase px-2.5 py-1 rounded-xl"
                    style={{ background: pc.bg, color: pc.color }}
                  >
                    {todo.priority}
                  </span>

                  {todo.dueDate && dueDateStatus && (
                    <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: dueDateStatus.color }}>
                      <dueDateStatus.icon className="h-3 w-3" />
                      <span>{format(new Date(todo.dueDate), 'MMM d, yyyy')}</span>
                    </div>
                  )}

                  {todo.notes?.length > 0 && (
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                      <MessageSquare className="h-3 w-3" />
                      {todo.notes.length} note{todo.notes.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {[
                  { onClick: () => setShowNotes(!showNotes), icon: showNotes ? ChevronDown : ChevronRight, title: 'Notes', color: '#6366f1' },
                  { onClick: () => setShowEditForm(true), icon: Edit, title: 'Edit', color: '#6366f1' },
                  { onClick: handleDelete, icon: Trash2, title: 'Delete', color: '#f43f5e' },
                ].map(({ onClick, icon: Icon, title, color }) => (
                  <button
                    key={title} onClick={onClick} title={title}
                    className="h-8 w-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-all"
                    style={{
                      background: '#eef0f5',
                      boxShadow: '2px 2px 6px rgba(174,180,200,0.45), -2px -2px 6px rgba(255,255,255,0.85)',
                      border: '1px solid rgba(255,255,255,0.7)',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = color; e.currentTarget.style.boxShadow = `2px 2px 8px ${color}60`; e.currentTarget.querySelector('svg').style.color = 'white'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#eef0f5'; e.currentTarget.style.boxShadow = '2px 2px 6px rgba(174,180,200,0.45), -2px -2px 6px rgba(255,255,255,0.85)'; e.currentTarget.querySelector('svg').style.color = ''; }}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Notes Panel */}
        {showNotes && (
          <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(174,180,200,0.35)' }}>
            <NotesList todoId={todo._id} notes={todo.notes || []} />
          </div>
        )}
      </div>

      {showEditForm && <TodoForm todo={todo} onClose={() => setShowEditForm(false)} />}
    </div>
  );
};

export default TodoItem;
