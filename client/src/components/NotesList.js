import React, { useState } from 'react';
import { Plus, Edit, Trash2, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { useTodos } from '../contexts/TodoContext';

const NotesList = ({ todoId, notes }) => {
  const { addNote, updateNote, deleteNote } = useTodos();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editNoteContent, setEditNoteContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;

    setLoading(true);
    const result = await addNote(todoId, newNoteContent.trim());
    if (result.success) {
      setNewNoteContent('');
      setShowAddForm(false);
    }
    setLoading(false);
  };

  const handleEditNote = async (noteId) => {
    if (!editNoteContent.trim()) return;

    setLoading(true);
    const result = await updateNote(todoId, noteId, editNoteContent.trim());
    if (result.success) {
      setEditingNote(null);
      setEditNoteContent('');
    }
    setLoading(false);
  };

  const handleDeleteNote = async (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      await deleteNote(todoId, noteId);
    }
  };

  const startEditing = (note) => {
    setEditingNote(note._id);
    setEditNoteContent(note.content);
  };

  const cancelEditing = () => {
    setEditingNote(null);
    setEditNoteContent('');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-900 flex items-center">
          <MessageSquare className="w-4 h-4 mr-1" />
          Notes ({notes.length})
        </h4>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-xs text-primary-600 hover:text-primary-700 flex items-center"
        >
          <Plus className="w-3 h-3 mr-1" />
          Add Note
        </button>
      </div>

      {/* Add note form */}
      {showAddForm && (
        <form onSubmit={handleAddNote} className="space-y-2">
          <textarea
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            placeholder="Write a note..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            autoFocus
          />
          <div className="flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setNewNoteContent('');
              }}
              className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !newNoteContent.trim()}
              className="px-3 py-1 bg-primary-600 text-white text-xs rounded hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding...' : 'Add Note'}
            </button>
          </div>
        </form>
      )}

      {/* Notes list */}
      {notes.length === 0 ? (
        <p className="text-sm text-gray-500 italic">No notes yet</p>
      ) : (
        <div className="space-y-2">
          {notes.map((note) => (
            <div key={note._id} className="bg-gray-50 rounded-md p-3">
              {editingNote === note._id ? (
                <div className="space-y-2">
                  <textarea
                    value={editNoteContent}
                    onChange={(e) => setEditNoteContent(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    autoFocus
                  />
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      type="button"
                      onClick={cancelEditing}
                      className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleEditNote(note._id)}
                      disabled={loading || !editNoteContent.trim()}
                      className="px-3 py-1 bg-primary-600 text-white text-xs rounded hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {format(new Date(note.createdAt), 'MMM d, yyyy \'at\' h:mm a')}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1 ml-2">
                    <button
                      onClick={() => startEditing(note)}
                      className="p-1 text-gray-400 hover:text-blue-600 focus:outline-none"
                      title="Edit note"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note._id)}
                      className="p-1 text-gray-400 hover:text-red-600 focus:outline-none"
                      title="Delete note"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotesList;
