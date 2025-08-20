import React, { useState } from 'react';
import { 
  Check, 
  Edit, 
  Trash2, 
  Calendar, 
  MessageSquare,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Clock
} from 'lucide-react';
import { format, isBefore, startOfDay } from 'date-fns';
import { useTodos } from '../contexts/TodoContext';
import TodoForm from './TodoForm';
import NotesList from './NotesList';

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
    if (window.confirm('Are you sure you want to delete this todo?')) {
      await deleteTodo(todo._id);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getDueDateStatus = (dueDate) => {
    if (!dueDate) return null;
    
    const today = startOfDay(new Date());
    const due = startOfDay(new Date(dueDate));
    
    if (isBefore(due, today)) {
      return { status: 'overdue', color: 'text-red-600', icon: AlertCircle };
    } else if (due.getTime() === today.getTime()) {
      return { status: 'today', color: 'text-orange-600', icon: Clock };
    } else {
      return { status: 'upcoming', color: 'text-blue-600', icon: Calendar };
    }
  };

  const dueDateStatus = getDueDateStatus(todo.dueDate);

  return (
    <div className={`bg-white rounded-lg border ${todo.completed ? 'opacity-75' : ''} shadow-sm hover:shadow-md transition-shadow`}>
      <div className="p-4">
        <div className="flex items-start space-x-3">
          {/* Checkbox */}
          <button
            onClick={handleToggleComplete}
            disabled={loading}
            className={`flex-shrink-0 mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              todo.completed
                ? 'bg-primary-600 border-primary-600'
                : 'border-gray-300 hover:border-primary-500'
            } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {todo.completed && <Check className="w-3 h-3 text-white" />}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className={`text-sm font-medium ${todo.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                  {todo.title}
                </h3>
                {todo.description && (
                  <p className={`mt-1 text-sm ${todo.completed ? 'line-through text-gray-400' : 'text-gray-600'}`}>
                    {todo.description}
                  </p>
                )}
                
                {/* Meta information */}
                <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                  {/* Priority */}
                  <span className={`px-2 py-1 rounded-full border text-xs font-medium ${getPriorityColor(todo.priority)}`}>
                    {todo.priority}
                  </span>

                  {/* Due date */}
                  {todo.dueDate && dueDateStatus && (
                    <div className={`flex items-center space-x-1 ${dueDateStatus.color}`}>
                      <dueDateStatus.icon className="w-3 h-3" />
                      <span>{format(new Date(todo.dueDate), 'MMM d, yyyy')}</span>
                    </div>
                  )}

                  {/* Notes count */}
                  {todo.notes && todo.notes.length > 0 && (
                    <div className="flex items-center space-x-1">
                      <MessageSquare className="w-3 h-3" />
                      <span>{todo.notes.length} note{todo.notes.length !== 1 ? 's' : ''}</span>
                    </div>
                  )}

                  {/* Created date */}
                  <span>Created {format(new Date(todo.createdAt), 'MMM d')}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => setShowNotes(!showNotes)}
                  className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                  title="Toggle notes"
                >
                  {showNotes ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => setShowEditForm(true)}
                  className="p-1 text-gray-400 hover:text-blue-600 focus:outline-none"
                  title="Edit todo"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-1 text-gray-400 hover:text-red-600 focus:outline-none"
                  title="Delete todo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notes section */}
        {showNotes && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <NotesList todoId={todo._id} notes={todo.notes || []} />
          </div>
        )}
      </div>

      {/* Edit form modal */}
      {showEditForm && (
        <TodoForm
          todo={todo}
          onClose={() => setShowEditForm(false)}
        />
      )}
    </div>
  );
};

export default TodoItem;
