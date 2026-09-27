import React, { useState } from 'react';
import {
  Flame, Clock, Play, Pause, RotateCcw, Plus, CheckCircle2, Circle,
  BookOpen, Trash2, X, ChevronDown, ChevronUp, Award, Calendar
} from 'lucide-react';
import { useStudy } from '../contexts/StudyContext';

/* ── style helpers ── */
const neo = {
  card: { background: '#ffffff', boxShadow: 'none', border: '1px solid rgba(255,255,255,0.8)', borderRadius: '22px' },
  cardSm: { background: '#ffffff', boxShadow: 'none', border: '1px solid rgba(255,255,255,0.75)', borderRadius: '16px' },
  inset: { background: '#f8fafc', boxShadow: 'none', borderRadius: '12px', border: '1px solid #cbd5e1' },
  progress: { background: '#f8fafc', boxShadow: 'none', borderRadius: '999px', overflow: 'hidden', height: '8px' },
};

const NeoInput = ({ ...props }) => (
  <input {...props} style={{ ...neo.inset, width: '100%', padding: '0.65rem 1rem', fontSize: '0.875rem', fontWeight: '500', color: '#1e2332', outline: 'none', fontFamily: 'Plus Jakarta Sans, sans-serif', ...props.style }} />
);

const NeoSelect = ({ children, ...props }) => (
  <select {...props} style={{ ...neo.inset, width: '100%', padding: '0.65rem 1rem', fontSize: '0.875rem', fontWeight: '600', color: '#1e2332', outline: 'none', appearance: 'none', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', ...props.style }}>
    {children}
  </select>
);

const LabelTxt = ({ t }) => <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">{t}</label>;

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
    style={{ background: 'rgba(15,18,35,0.55)', backdropFilter: 'blur(6px)' }}>
    <div className="w-full max-w-md max-h-[90vh] overflow-y-auto p-7 animate-scaleIn custom-scrollbar"
      style={{ ...neo.card, borderRadius: '28px', boxShadow: 'none' }}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-black text-slate-800">{title}</h3>
        <button onClick={onClose} className="h-9 w-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-rose-500" style={neo.cardSm}>
          <X className="h-4 w-4" />
        </button>
      </div>
      {children}
    </div>
  </div>
);

const GradBtn = ({ color1 = '#6366f1', color2 = '#8b5cf6', className = '', disabled, children, ...props }) => (
  <button {...props} disabled={disabled} className={`font-bold text-white rounded-2xl flex items-center justify-center gap-2 ${className}`}
    style={{ background: disabled ? '#9ba5bc' : `linear-gradient(135deg, ${color1}, ${color2})`, boxShadow: 'none', cursor: disabled ? 'not-allowed' : 'pointer' }}>
    {children}
  </button>
);

const StudyPlanner = () => {
  const {
    subjects, deadlines, sessions,
    timerMode, timeLeft, isTimerRunning, focusDuration, shortBreakDuration, longBreakDuration,
    selectedSubjectId, currentSessionTopic, completedPomodorosCount, totalHours, streak,
    setIsTimerRunning, setSelectedSubjectId, setCurrentSessionTopic,
    switchTimerMode, resetTimer, logStudySession,
    addSubject, deleteSubject, addTopicToSubject, toggleTopicCompletion,
    addDeadline, toggleDeadline, deleteDeadline,
  } = useStudy();

  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showDeadlineModal, setShowDeadlineModal] = useState(false);
  const [showManualLogModal, setShowManualLogModal] = useState(false);
  const [expandedSubjectId, setExpandedSubjectId] = useState(subjects[0]?._id || null);
  const [newTopicTitles, setNewTopicTitles] = useState({});

  const [subjectForm, setSubjectForm] = useState({ name: '', code: '', instructor: '', targetHoursPerWeek: 6, color: '#6366f1' });
  const [deadlineForm, setDeadlineForm] = useState({ title: '', subjectId: '', type: 'Exam', dueDate: '', priority: 'high', weightage: '', notes: '' });
  const [manualLogForm, setManualLogForm] = useState({ subjectId: '', durationMinutes: 45, topic: '', date: new Date().toISOString().slice(0, 10) });

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const totalSecs = timerMode === 'focus' ? focusDuration * 60 : timerMode === 'shortBreak' ? shortBreakDuration * 60 : longBreakDuration * 60;
  const progressPct = Math.max(0, Math.min(100, Math.round(((totalSecs - timeLeft) / totalSecs) * 100)));

  const handleSubjectSubmit = async (e) => {
    e.preventDefault();
    if (!subjectForm.name.trim()) return;
    await addSubject({ ...subjectForm, topics: [] });
    setSubjectForm({ name: '', code: '', instructor: '', targetHoursPerWeek: 6, color: '#6366f1' });
    setShowSubjectModal(false);
  };

  const handleDeadlineSubmit = async (e) => {
    e.preventDefault();
    if (!deadlineForm.title.trim() || !deadlineForm.dueDate) return;
    await addDeadline(deadlineForm);
    setDeadlineForm({ title: '', subjectId: '', type: 'Exam', dueDate: '', priority: 'high', weightage: '', notes: '' });
    setShowDeadlineModal(false);
  };

  const handleManualLogSubmit = async (e) => {
    e.preventDefault();
    if (!manualLogForm.durationMinutes) return;
    await logStudySession(Number(manualLogForm.durationMinutes), manualLogForm.topic, manualLogForm.subjectId);
    setManualLogForm({ subjectId: '', durationMinutes: 45, topic: '', date: new Date().toISOString().slice(0, 10) });
    setShowManualLogModal(false);
  };

  const handleAddTopic = (subjectId) => {
    const title = newTopicTitles[subjectId];
    if (!title?.trim()) return;
    addTopicToSubject(subjectId, title.trim());
    setNewTopicTitles(prev => ({ ...prev, [subjectId]: '' }));
  };

  const upcomingDeadlines = [...(deadlines || [])].filter(d => !d.completed).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  return (
    <div className="space-y-6 animate-fadeIn">

      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Study & Exam Planner</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Pomodoro timer, subject syllabus tracker, and exam countdown matrix.</p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {[
            { lbl: 'Log Session',  Icon: Clock,     onClick: () => setShowManualLogModal(true), c1: '#6b7280', c2: '#4b5563' },
            { lbl: 'Add Subject',  Icon: BookOpen,  onClick: () => setShowSubjectModal(true),   c1: '#6366f1', c2: '#8b5cf6' },
            { lbl: 'Add Deadline', Icon: Plus,      onClick: () => setShowDeadlineModal(true),  c1: '#8b5cf6', c2: '#7c3aed' },
          ].map(({ lbl, Icon, onClick, c1, c2 }) => (
            <GradBtn key={lbl} color1={c1} color2={c2} onClick={onClick} className="px-4 py-2.5 text-sm">
              <Icon className="h-4 w-4" />{lbl}
            </GradBtn>
          ))}
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Hours',    value: `${totalHours}h`,            sub: `${sessions.length} sprints`,          c1: '#6366f1', c2: '#8b5cf6', icon: Clock },
          { label: 'Study Streak',   value: `${streak} days`,            sub: 'Consecutive study days',               c1: '#f59e0b', c2: '#d97706', icon: Flame },
          { label: 'Pomodoros Done', value: completedPomodorosCount,     sub: 'Sessions completed',                   c1: '#10b981', c2: '#059669', icon: Award },
          { label: 'Subjects',       value: subjects.length,             sub: `${upcomingDeadlines.length} upcoming`, c1: '#8b5cf6', c2: '#7c3aed', icon: BookOpen },
        ].map(({ label, value, sub, c1, c2, icon: Icon }) => (
          <div key={label} style={neo.card} className="p-5 hover:-translate-y-0.5 transition-transform duration-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
              <div className="h-9 w-9 rounded-xl flex items-center justify-center text-white"
                style={{ background: `linear-gradient(135deg, ${c1}, ${c2})`, boxShadow: 'none' }}>
                <Icon className="h-4.5 w-4.5" style={{ height: '1.1rem', width: '1.1rem' }} />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-800 font-mono-display">{value}</div>
            <div className="text-xs font-medium text-slate-500 mt-1">{sub}</div>
          </div>
        ))}
      </div>

      {/* ── MAIN 2-COLUMN ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* LEFT: Pomodoro */}
        <div className="lg:col-span-5 space-y-5">

          {/* The Timer Card */}
          <div
            className="relative overflow-hidden p-7"
            style={{
              borderRadius: '28px',
              background: '#0f1223',
              boxShadow: 'none',
            }}
          >
            {/* Glow orb */}
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at 70% 30%, rgba(139,92,246,0.2) 0%, transparent 65%)' }} />

            <div className="relative z-10">
              {/* Mode Tabs */}
              <div className="flex gap-1.5 mb-7 p-1.5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.08)' }}>
                {[
                  { mode: 'focus',      label: 'Focus',       mins: focusDuration },
                  { mode: 'shortBreak', label: 'Short Break', mins: shortBreakDuration },
                  { mode: 'longBreak',  label: 'Long Break',  mins: longBreakDuration },
                ].map(({ mode, label, mins }) => (
                  <button key={mode} onClick={() => switchTimerMode(mode)}
                    className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
                    style={timerMode === mode ? {
                      background: '#6366f1',
                      color: 'white',
                      boxShadow: 'none',
                    } : { color: 'rgba(165,180,252,0.6)' }}>
                    {label} ({mins}m)
                  </button>
                ))}
              </div>

              {/* Circular progress ring */}
              <div className="flex justify-center mb-6">
                <div className="relative" style={{ width: '170px', height: '170px' }}>
                  <svg width="170" height="170" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="85" cy="85" r="76" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="10" />
                    <circle cx="85" cy="85" r="76" fill="none"
                      stroke="url(#ring-grad)" strokeWidth="10" strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 76}`}
                      strokeDashoffset={`${2 * Math.PI * 76 * (1 - progressPct / 100)}`}
                      style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                    />
                    <defs>
                      <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-black text-white font-mono-display tracking-tight">{formatTime(timeLeft)}</span>
                    <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest mt-1">{timerMode === 'focus' ? 'Focus' : 'Break'}</span>
                  </div>
                </div>
              </div>

              {/* Session context */}
              <div className="space-y-2.5 mb-5">
                <select value={selectedSubjectId || ''}
                  onChange={e => setSelectedSubjectId(e.target.value || null)}
                  className="w-full py-2.5 px-3.5 rounded-xl text-sm font-bold"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none', appearance: 'none' }}>
                  <option value="">— Select Subject —</option>
                  {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
                <input
                  type="text" placeholder="Session topic (optional)"
                  value={currentSessionTopic}
                  onChange={e => setCurrentSessionTopic(e.target.value)}
                  className="w-full py-2.5 px-3.5 rounded-xl text-sm font-medium"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }}
                />
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="flex-1 py-3.5 rounded-2xl text-sm font-black text-white flex items-center justify-center gap-2"
                  style={isTimerRunning
                    ? { background: '#f59e0b', boxShadow: 'none' }
                    : { background: '#10b981', boxShadow: 'none' }
                  }>
                  {isTimerRunning ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  {isTimerRunning ? 'Pause Session' : 'Start Focus'}
                </button>
                <button onClick={resetTimer}
                  className="p-3.5 rounded-2xl text-white"
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>

              {/* Running status */}
              {isTimerRunning && (
                <p className="text-center text-xs text-emerald-400 font-bold mt-4 animate-pulse">
                  🔥 Session in progress — stay in the flow!
                </p>
              )}
            </div>
          </div>

          {/* Recent Sessions */}
          <div style={neo.card} className="p-5">
            <h3 className="text-base font-bold text-slate-800 mb-4 pb-4" style={{ borderBottom: '1px solid rgba(174,180,200,0.35)' }}>
              Recent Sessions
            </h3>
            <div className="space-y-2.5 max-h-56 overflow-y-auto custom-scrollbar">
              {sessions.slice(0, 8).length === 0 ? (
                <p className="text-xs text-slate-400 font-medium text-center py-6">No sessions logged yet. Start a timer!</p>
              ) : sessions.slice(0, 8).map(s => (
                <div key={s._id} style={neo.cardSm} className="flex items-center justify-between px-4 py-3 gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-8 w-8 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                      style={{ background: `linear-gradient(135deg, ${s.subjectId?.color || '#6366f1'}, ${s.subjectId?.color || '#8b5cf6'})`, boxShadow: 'none' }}>
                      <Clock className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-700 truncate">{s.topic || s.subjectId?.name || 'General Study'}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{new Date(s.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-indigo-600 flex-shrink-0">{s.durationMinutes}m</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Subjects + Deadlines */}
        <div className="lg:col-span-7 space-y-5">

          {/* Subjects & Syllabus */}
          <div style={neo.card} className="p-5">
            <div className="flex items-center justify-between mb-4 pb-4" style={{ borderBottom: '1px solid rgba(174,180,200,0.35)' }}>
              <h3 className="text-base font-bold text-slate-800">Subjects & Syllabus</h3>
              <GradBtn color1="#6366f1" color2="#8b5cf6" onClick={() => setShowSubjectModal(true)} className="px-4 py-2 text-xs">
                <Plus className="h-3.5 w-3.5" /> Add Subject
              </GradBtn>
            </div>

            <div className="space-y-3 max-h-[420px] overflow-y-auto custom-scrollbar pr-1">
              {subjects.length === 0 ? (
                <div className="text-center py-10">
                  <BookOpen className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                  <p className="text-sm font-bold text-slate-500">No subjects yet</p>
                  <p className="text-xs text-slate-400 mt-1">Add your first subject to start tracking progress</p>
                </div>
              ) : subjects.map(subject => {
                const topicsDone = subject.topics?.filter(t => t.completed).length || 0;
                const totalTopics = subject.topics?.length || 0;
                const topicPct = totalTopics > 0 ? Math.round((topicsDone / totalTopics) * 100) : 0;
                const isExpanded = expandedSubjectId === subject._id;

                return (
                  <div key={subject._id} style={neo.cardSm}>
                    {/* Subject header */}
                    <div
                      className="flex items-center justify-between p-4 cursor-pointer"
                      onClick={() => setExpandedSubjectId(isExpanded ? null : subject._id)}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0"
                          style={{ background: `linear-gradient(135deg, ${subject.color || '#6366f1'}, ${subject.color || '#8b5cf6'})`, boxShadow: 'none' }}>
                          {subject.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-800 truncate">{subject.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {subject.code && <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg" style={{ background: '#ede9fe', color: '#7c3aed' }}>{subject.code}</span>}
                            <span className="text-[10px] text-slate-400 font-medium">{topicsDone}/{totalTopics} topics</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        {totalTopics > 0 && (
                          <div className="text-right hidden sm:block">
                            <span className="text-sm font-black" style={{ color: subject.color || '#6366f1' }}>{topicPct}%</span>
                          </div>
                        )}
                        <button onClick={e => { e.stopPropagation(); deleteSubject(subject._id); }}
                          className="h-8 w-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-all"
                          style={{ background: '#ffffff', boxShadow: 'none' }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#f43f5e'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = '#eef0f5'; }}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                      </div>
                    </div>

                    {/* Progress */}
                    {totalTopics > 0 && (
                      <div className="px-4 pb-2">
                        <div style={neo.progress}>
                          <div style={{ height: '100%', width: `${topicPct}%`, borderRadius: '999px', background: `linear-gradient(90deg, ${subject.color || '#6366f1'}, ${subject.color || '#8b5cf6'})`, transition: 'width 0.5s ease' }} />
                        </div>
                      </div>
                    )}

                    {/* Topics accordion */}
                    {isExpanded && (
                      <div className="px-4 pb-4 space-y-2 border-t pt-4" style={{ borderColor: 'rgba(174,180,200,0.3)' }}>
                        {subject.topics?.map(topic => (
                          <div key={topic._id} className="flex items-center gap-2.5">
                            <button onClick={() => toggleTopicCompletion(subject._id, topic._id)}
                              className="flex-shrink-0 text-slate-400 hover:text-indigo-500 transition-colors">
                              {topic.completed
                                ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                : <Circle className="h-4 w-4" />}
                            </button>
                            <span className={`text-xs font-semibold ${topic.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                              {topic.title}
                            </span>
                          </div>
                        ))}

                        {/* Add topic input */}
                        <div className="flex gap-2 mt-3">
                          <input
                            type="text" placeholder="Add topic..."
                            value={newTopicTitles[subject._id] || ''}
                            onChange={e => setNewTopicTitles(prev => ({ ...prev, [subject._id]: e.target.value }))}
                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTopic(subject._id); } }}
                            className="flex-1 text-xs py-2 px-3"
                            style={{ ...neo.inset, borderRadius: '10px', fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 500, color: '#374151', outline: 'none' }}
                          />
                          <button onClick={() => handleAddTopic(subject._id)}
                            className="px-3 py-2 rounded-xl text-white text-xs font-bold"
                            style={{ background: '#6366f1', boxShadow: 'none' }}>
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Deadlines Matrix */}
          <div style={neo.card} className="p-5">
            <div className="flex items-center justify-between mb-4 pb-4" style={{ borderBottom: '1px solid rgba(174,180,200,0.35)' }}>
              <h3 className="text-base font-bold text-slate-800">Exam & Deadline Matrix</h3>
              <GradBtn color1="#8b5cf6" color2="#7c3aed" onClick={() => setShowDeadlineModal(true)} className="px-4 py-2 text-xs">
                <Plus className="h-3.5 w-3.5" /> Add
              </GradBtn>
            </div>

            <div className="space-y-2.5 max-h-96 overflow-y-auto custom-scrollbar">
              {(deadlines || []).length === 0 ? (
                <div className="text-center py-10">
                  <Calendar className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                  <p className="text-sm font-bold text-slate-500">No deadlines added yet</p>
                </div>
              ) : [...(deadlines || [])].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).map(item => {
                const daysLeft = Math.ceil((new Date(item.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
                const isUrgent = daysLeft <= 3 && !item.completed;
                const prioColors = { high: { bg: '#ffe4e6', text: '#f43f5e' }, medium: { bg: '#fef3c7', text: '#d97706' }, low: { bg: '#d1fae5', text: '#10b981' } };
                const pc = prioColors[item.priority] || prioColors.medium;

                return (
                  <div key={item._id} style={neo.cardSm}
                    className={`flex items-center justify-between px-4 py-3.5 gap-3 transition-all ${item.completed ? 'opacity-50' : ''}`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <button onClick={() => toggleDeadline(item._id)} className="text-slate-400 hover:text-indigo-500 flex-shrink-0">
                        {item.completed ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <Circle className="h-5 w-5" />}
                      </button>
                      <div className="min-w-0">
                        <p className={`text-sm font-bold text-slate-700 truncate ${item.completed ? 'line-through' : ''}`}>{item.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg" style={pc}>{item.type}</span>
                          {item.weightage && <span className="text-[10px] text-slate-400 font-medium">Weight: {item.weightage}</span>}
                          <span className="text-[10px] text-slate-400 font-medium">{new Date(item.dueDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!item.completed && (
                        <span className={`text-xs font-black px-2.5 py-1 rounded-xl ${isUrgent ? 'animate-pulse' : ''}`}
                          style={{ background: isUrgent ? '#ffe4e6' : '#f1f5f9', color: isUrgent ? '#f43f5e' : '#64748b' }}>
                          {daysLeft < 0 ? 'Overdue' : daysLeft === 0 ? 'Today!' : daysLeft === 1 ? '1d' : `${daysLeft}d`}
                        </span>
                      )}
                      <button onClick={() => deleteDeadline(item._id)}
                        className="h-7 w-7 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-all"
                        style={{ background: '#ffffff', boxShadow: 'none' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#f43f5e'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#eef0f5'; }}>
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ======================== MODALS ======================== */}

      {/* Add Subject Modal */}
      {showSubjectModal && (
        <Modal title="Add New Subject" onClose={() => setShowSubjectModal(false)}>
          <form onSubmit={handleSubjectSubmit} className="space-y-4">
            <div><LabelTxt t="Subject Name *" /><NeoInput required placeholder="e.g. Operating Systems" value={subjectForm.name} onChange={e => setSubjectForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><LabelTxt t="Course Code" /><NeoInput placeholder="e.g. CS301" value={subjectForm.code} onChange={e => setSubjectForm(p => ({ ...p, code: e.target.value }))} /></div>
              <div><LabelTxt t="Target Hrs/Week" /><NeoInput type="number" min="1" max="40" value={subjectForm.targetHoursPerWeek} onChange={e => setSubjectForm(p => ({ ...p, targetHoursPerWeek: Number(e.target.value) }))} /></div>
            </div>
            <div><LabelTxt t="Instructor" /><NeoInput placeholder="e.g. Prof. Sharma" value={subjectForm.instructor} onChange={e => setSubjectForm(p => ({ ...p, instructor: e.target.value }))} /></div>
            <div>
              <LabelTxt t="Color" />
              <div className="flex gap-2">
                {['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#3b82f6', '#ec4899'].map(color => (
                  <button key={color} type="button" onClick={() => setSubjectForm(p => ({ ...p, color }))}
                    className="h-8 w-8 rounded-full transition-transform"
                    style={{ background: color, transform: subjectForm.color === color ? 'scale(1.3)' : 'scale(1)', boxShadow: subjectForm.color === color ? `0 0 0 3px white, 0 0 0 5px ${color}` : 'none' }} />
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowSubjectModal(false)} className="flex-1 py-3 rounded-2xl text-sm font-bold text-slate-600" style={neo.cardSm}>Cancel</button>
              <GradBtn type="submit" color1="#6366f1" color2="#8b5cf6" className="flex-1 py-3 text-sm">Add Subject</GradBtn>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Deadline Modal */}
      {showDeadlineModal && (
        <Modal title="Add Deadline / Exam" onClose={() => setShowDeadlineModal(false)}>
          <form onSubmit={handleDeadlineSubmit} className="space-y-4">
            <div><LabelTxt t="Title *" /><NeoInput required placeholder="e.g. DBMS Mid-Semester Exam" value={deadlineForm.title} onChange={e => setDeadlineForm(p => ({ ...p, title: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <LabelTxt t="Type" />
                <NeoSelect value={deadlineForm.type} onChange={e => setDeadlineForm(p => ({ ...p, type: e.target.value }))}>
                  {['Exam', 'Assignment', 'Quiz', 'Project', 'Presentation', 'Lab', 'Other'].map(t => <option key={t} value={t}>{t}</option>)}
                </NeoSelect>
              </div>
              <div>
                <LabelTxt t="Priority" />
                <NeoSelect value={deadlineForm.priority} onChange={e => setDeadlineForm(p => ({ ...p, priority: e.target.value }))}>
                  {['high', 'medium', 'low'].map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                </NeoSelect>
              </div>
            </div>
            <div>
              <LabelTxt t="Subject (optional)" />
              <NeoSelect value={deadlineForm.subjectId} onChange={e => setDeadlineForm(p => ({ ...p, subjectId: e.target.value }))}>
                <option value="">— No subject —</option>
                {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </NeoSelect>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><LabelTxt t="Due Date *" /><NeoInput type="date" required value={deadlineForm.dueDate} onChange={e => setDeadlineForm(p => ({ ...p, dueDate: e.target.value }))} /></div>
              <div><LabelTxt t="Weightage" /><NeoInput placeholder="e.g. 30%" value={deadlineForm.weightage} onChange={e => setDeadlineForm(p => ({ ...p, weightage: e.target.value }))} /></div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowDeadlineModal(false)} className="flex-1 py-3 rounded-2xl text-sm font-bold text-slate-600" style={neo.cardSm}>Cancel</button>
              <GradBtn type="submit" color1="#8b5cf6" color2="#7c3aed" className="flex-1 py-3 text-sm">Add Deadline</GradBtn>
            </div>
          </form>
        </Modal>
      )}

      {/* Manual Log Modal */}
      {showManualLogModal && (
        <Modal title="Log Study Session" onClose={() => setShowManualLogModal(false)}>
          <form onSubmit={handleManualLogSubmit} className="space-y-4">
            <div>
              <LabelTxt t="Duration (minutes) *" />
              <NeoInput type="number" min="1" required placeholder="45" value={manualLogForm.durationMinutes} onChange={e => setManualLogForm(p => ({ ...p, durationMinutes: e.target.value }))} />
            </div>
            <div>
              <LabelTxt t="Subject (optional)" />
              <NeoSelect value={manualLogForm.subjectId} onChange={e => setManualLogForm(p => ({ ...p, subjectId: e.target.value }))}>
                <option value="">— No subject —</option>
                {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </NeoSelect>
            </div>
            <div><LabelTxt t="Topic / Notes" /><NeoInput placeholder="e.g. Chapter 5 — Memory Management" value={manualLogForm.topic} onChange={e => setManualLogForm(p => ({ ...p, topic: e.target.value }))} /></div>
            <div><LabelTxt t="Date" /><NeoInput type="date" value={manualLogForm.date} onChange={e => setManualLogForm(p => ({ ...p, date: e.target.value }))} /></div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowManualLogModal(false)} className="flex-1 py-3 rounded-2xl text-sm font-bold text-slate-600" style={neo.cardSm}>Cancel</button>
              <GradBtn type="submit" color1="#10b981" color2="#059669" className="flex-1 py-3 text-sm">Log Session</GradBtn>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};

export default StudyPlanner;
