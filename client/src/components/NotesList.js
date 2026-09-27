import React, { useState } from 'react';
import { Plus, Edit, Trash2, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { useTodos } from '../contexts/TodoContext';

const neoInset = {
  background: '#f8fafc',
  boxShadow: 'none',
  borderRadius: '12px',
  border: '1px solid #cbd5e1',
  width: '100%',
  padding: '0.5rem 0.75rem',
  fontSize: '0.8rem',
  fontWeight: '500',
  color: '#374151',
  outline: 'none',
  resize: 'none',
  fontFamily: 'Plus Jakarta Sans, sans-serif',
};

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
    if (result.success) { setNewNoteContent(''); setShowAddForm(false); }
    setLoading(false);
  };

  const handleEditNote = async (noteId) => {
    if (!editNoteContent.trim()) return;
    setLoading(true);
    const result = await updateNote(todoId, noteId, editNoteContent.trim());
    if (result.success) { setEditingNote(null); setEditNoteContent(''); }
    setLoading(false);
  };

  const handleDeleteNote = async (noteId) => {
    if (window.confirm('Delete this note?')) await deleteNote(todoId, noteId);
  };

  const startEditing = (note) => { setEditingNote(note._id); setEditNoteContent(note.content); };
  const cancelEditing = () => { setEditingNote(null); setEditNoteContent(''); };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-slate-600 flex items-center gap-1.5 uppercase tracking-wider">
          <MessageSquare className="h-3.5 w-3.5 text-indigo-500" />
          Notes ({notes.length})
        </h4>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 px-3 py-1.5 rounded-xl transition-colors"
          style={{
            background: '#ffffff',
            boxShadow: 'none',
            border: '1px solid rgba(255,255,255,0.7)',
          }}
        >
          <Plus className="h-3 w-3" />
          Add Note
        </button>
      </div>

      {/* Add Note Form */}
      {showAddForm && (
        <form onSubmit={handleAddNote} className="space-y-2 animate-fadeIn">
          <textarea
            value={newNoteContent}
            onChange={e => setNewNoteContent(e.target.value)}
            placeholder="Write a note..."
            rows={3}
            style={neoInset}
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => { setShowAddForm(false); setNewNoteContent(''); }}
              className="px-3 py-1.5 text-xs font-bold text-slate-500 rounded-xl"
              style={{ background: '#ffffff', boxShadow: 'none', border: '1px solid rgba(255,255,255,0.7)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !newNoteContent.trim()}
              className="px-3 py-1.5 text-xs font-bold text-white rounded-xl"
              style={{
                background: loading || !newNoteContent.trim() ? '#9ba5bc' : '#6366f1',
                boxShadow: loading || !newNoteContent.trim() ? 'none' : '2px 2px 6px rgba(99,102,241,0.35)',
              }}
            >
              {loading ? 'Adding...' : 'Add Note'}
            </button>
          </div>
        </form>
      )}

      {/* Notes List */}
      {notes.length === 0 ? (
        <p className="text-xs text-slate-400 font-medium italic pl-1">No notes yet — add one above!</p>
      ) : (
        <div className="space-y-2">
          {notes.map(note => (
            <div
              key={note._id}
              className="p-3 rounded-2xl"
              style={{
                background: '#ffffff',
                boxShadow: 'none',
                border: '1px solid rgba(255,255,255,0.5)',
              }}
            >
              {editingNote === note._id ? (
                <div className="space-y-2">
                  <textarea
                    value={editNoteContent}
                    onChange={e => setEditNoteContent(e.target.value)}
                    rows={3}
                    style={neoInset}
                    autoFocus
                  />
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={cancelEditing}
                      className="px-3 py-1.5 text-xs font-bold text-slate-500 rounded-xl"
                      style={{ background: '#ffffff', boxShadow: 'none', border: '1px solid rgba(255,255,255,0.7)' }}>
                      Cancel
                    </button>
                    <button onClick={() => handleEditNote(note._id)}
                      disabled={loading || !editNoteContent.trim()}
                      className="px-3 py-1.5 text-xs font-bold text-white rounded-xl"
                      style={{ background: '#6366f1', boxShadow: 'none' }}>
                      {loading ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-700 whitespace-pre-wrap leading-relaxed">{note.content}</p>
                    <p className="text-[10px] text-slate-400 font-medium mt-1.5">
                      {format(new Date(note.createdAt), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {[
                      { onClick: () => startEditing(note), Icon: Edit, hoverColor: '#6366f1' },
                      { onClick: () => handleDeleteNote(note._id), Icon: Trash2, hoverColor: '#f43f5e' },
                    ].map(({ onClick, Icon, hoverColor }) => (
                      <button
                        key={hoverColor}
                        onClick={onClick}
                        className="h-6 w-6 rounded-lg flex items-center justify-center text-slate-400 transition-all"
                        style={{ background: '#ffffff', boxShadow: 'none' }}
                        onMouseEnter={e => { e.currentTarget.style.background = hoverColor; e.currentTarget.querySelector('svg').style.color = 'white'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#eef0f5'; e.currentTarget.querySelector('svg').style.color = ''; }}
                      >
                        <Icon className="h-3 w-3" />
                      </button>
                    ))}
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
