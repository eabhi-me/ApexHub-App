import React, { useState } from 'react';
import { 
  Flame, 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  Plus, 
  CheckCircle2, 
  Circle, 
  BookOpen, 
  Trash2, 
  PlusCircle, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Award
} from 'lucide-react';
import { useStudy } from '../contexts/StudyContext';

const StudyPlanner = () => {
  const { 
    subjects, 
    deadlines, 
    sessions,
    timerMode,
    timeLeft,
    isTimerRunning,
    focusDuration,
    shortBreakDuration,
    longBreakDuration,
    selectedSubjectId,
    currentSessionTopic,
    completedPomodorosCount,
    totalHours,
    streak,
    setIsTimerRunning,
    setSelectedSubjectId,
    setCurrentSessionTopic,
    switchTimerMode,
    resetTimer,
    logStudySession,
    addSubject,
    deleteSubject,
    addTopicToSubject,
    toggleTopicCompletion,
    addDeadline,
    toggleDeadline,
    deleteDeadline
  } = useStudy();

  // Modals
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showDeadlineModal, setShowDeadlineModal] = useState(false);
  const [showManualLogModal, setShowManualLogModal] = useState(false);

  // Expanded subject topics accordion
  const [expandedSubjectId, setExpandedSubjectId] = useState(subjects[0]?._id || null);
  const [newTopicTitles, setNewTopicTitles] = useState({});

  // Subject Form State
  const [subjectForm, setSubjectForm] = useState({
    name: '',
    code: '',
    instructor: '',
    targetHoursPerWeek: 6,
    color: '#6366f1'
  });

  // Deadline Form State
  const [deadlineForm, setDeadlineForm] = useState({
    title: '',
    subjectId: '',
    type: 'Exam',
    dueDate: '',
    priority: 'high',
    weightage: '',
    notes: ''
  });

  // Manual Log Form State
  const [manualLogForm, setManualLogForm] = useState({
    subjectId: '',
    durationMinutes: 45,
    topic: '',
    date: new Date().toISOString().slice(0, 10)
  });

  // Pomodoro formatted time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Timer Progress Percentage
  const currentTotalSeconds = timerMode === 'focus' 
    ? focusDuration * 60 
    : timerMode === 'shortBreak' 
      ? shortBreakDuration * 60 
      : longBreakDuration * 60;
  const progressPercent = Math.max(0, Math.min(100, Math.round(((currentTotalSeconds - timeLeft) / currentTotalSeconds) * 100)));

  // Handle Add Subject
  const handleSubjectSubmit = async (e) => {
    e.preventDefault();
    if (!subjectForm.name.trim()) return;
    await addSubject({
      ...subjectForm,
      topics: []
    });
    setSubjectForm({ name: '', code: '', instructor: '', targetHoursPerWeek: 6, color: '#6366f1' });
    setShowSubjectModal(false);
  };

  // Handle Add Deadline
  const handleDeadlineSubmit = async (e) => {
    e.preventDefault();
    if (!deadlineForm.title.trim() || !deadlineForm.dueDate) return;
    await addDeadline(deadlineForm);
    setDeadlineForm({ title: '', subjectId: '', type: 'Exam', dueDate: '', priority: 'high', weightage: '', notes: '' });
    setShowDeadlineModal(false);
  };

  // Handle Manual Log
  const handleManualLogSubmit = async (e) => {
    e.preventDefault();
    if (!manualLogForm.durationMinutes) return;
    await logStudySession(Number(manualLogForm.durationMinutes), manualLogForm.topic, manualLogForm.subjectId);
    setManualLogForm({ subjectId: '', durationMinutes: 45, topic: '', date: new Date().toISOString().slice(0, 10) });
    setShowManualLogModal(false);
  };

  // Handle Add Topic to subject
  const handleAddTopic = (subjectId) => {
    const title = newTopicTitles[subjectId];
    if (!title || !title.trim()) return;
    addTopicToSubject(subjectId, title.trim());
    setNewTopicTitles(prev => ({ ...prev, [subjectId]: '' }));
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Study & Exam Planner</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Pomodoro focus timer, subject syllabus tracker, and exam countdown matrix.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowManualLogModal(true)}
            className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm transition-all"
          >
            <Clock className="h-4 w-4 mr-1.5 text-slate-500" />
            Log Session
          </button>
          <button
            onClick={() => setShowSubjectModal(true)}
            className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-50 border border-indigo-100 text-indigo-700 hover:bg-indigo-100 transition-all"
          >
            <BookOpen className="h-4 w-4 mr-1.5" />
            Add Subject
          </button>
          <button
            onClick={() => setShowDeadlineModal(true)}
            className="inline-flex items-center px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-600/20 transition-all active:scale-95"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add Deadline
          </button>
        </div>
      </div>

      {/* Top 4 Study Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Total Study Hours */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Study Time</span>
            <div className="h-8 w-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
              {totalHours} <span className="text-base font-semibold text-slate-500">hours</span>
            </div>
            <div className="mt-2 text-xs text-slate-500">
              Across {sessions.length} recorded study sprints
            </div>
          </div>
        </div>

        {/* Study Streak */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Daily Streak</span>
            <div className="h-8 w-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
              <Flame className="h-4 w-4 fill-amber-500" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-amber-600 font-mono flex items-center">
              {streak} <span className="text-base font-semibold text-slate-500 ml-1">days</span>
            </div>
            <div className="mt-2 text-xs text-slate-500">
              Consecutive days of focused study
            </div>
          </div>
        </div>

        {/* Completed Pomodoros */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Pomodoros Done</span>
            <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono">
              {completedPomodorosCount} <span className="text-base font-semibold text-slate-500">sprints</span>
            </div>
            <div className="mt-2 text-xs text-slate-500">
              High productivity focus blocks
            </div>
          </div>
        </div>

        {/* Active Subjects */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Subjects</span>
            <div className="h-8 w-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <BookOpen className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-violet-600 font-mono">
              {subjects.length} <span className="text-base font-semibold text-slate-500">courses</span>
            </div>
            <div className="mt-2 text-xs text-slate-500">
              {subjects.reduce((acc, s) => acc + (s.topics?.length || 0), 0)} syllabus topics tracked
            </div>
          </div>
        </div>

      </div>

      {/* Main Focus Hub & Deadlines Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Pomodoro Studio */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col items-center text-center">
            
            {/* Mode Switcher Tabs */}
            <div className="flex items-center space-x-1 p-1 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-xs font-semibold mb-6">
              <button
                onClick={() => switchTimerMode('focus')}
                className={`px-4 py-2 rounded-xl transition-all ${
                  timerMode === 'focus' ? 'bg-white text-slate-900 shadow-md font-bold' : 'text-indigo-200 hover:text-white'
                }`}
              >
                Focus ({focusDuration}m)
              </button>
              <button
                onClick={() => switchTimerMode('shortBreak')}
                className={`px-4 py-2 rounded-xl transition-all ${
                  timerMode === 'shortBreak' ? 'bg-white text-slate-900 shadow-md font-bold' : 'text-indigo-200 hover:text-white'
                }`}
              >
                Short Break (5m)
              </button>
              <button
                onClick={() => switchTimerMode('longBreak')}
                className={`px-4 py-2 rounded-xl transition-all ${
                  timerMode === 'longBreak' ? 'bg-white text-slate-900 shadow-md font-bold' : 'text-indigo-200 hover:text-white'
                }`}
              >
                Long Break (15m)
              </button>
            </div>

            {/* Circular Timer Visual */}
            <div className="relative w-56 h-56 flex items-center justify-center my-2">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  className="text-white/10"
                  strokeWidth="6"
                  stroke="currentColor"
                  fill="transparent"
                />
                {/* Active Progress Circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  className="text-indigo-400 transition-all duration-1000 ease-linear"
                  strokeWidth="6"
                  strokeDasharray={276.46}
                  strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                />
              </svg>

              <div className="absolute flex flex-col items-center">
                <span className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-white">
                  {formatTime(timeLeft)}
                </span>
                <span className="text-xs font-semibold text-indigo-300 uppercase tracking-widest mt-1">
                  {timerMode === 'focus' ? 'Deep Work' : 'Break Rest'}
                </span>
              </div>
            </div>

            {/* Session Subject & Topic Inputs */}
            <div className="w-full max-w-sm mt-4 space-y-2.5">
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-semibold bg-white/10 border border-white/15 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="" className="text-slate-800">Select Subject (Optional)</option>
                {subjects.map(s => (
                  <option key={s._id} value={s._id} className="text-slate-800">{s.name} ({s.code || 'Course'})</option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Topic or task you are working on..."
                value={currentSessionTopic}
                onChange={(e) => setCurrentSessionTopic(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white/10 border border-white/15 rounded-xl text-white placeholder-indigo-200/60 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            {/* Control Buttons */}
            <div className="flex items-center space-x-4 mt-6">
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className={`inline-flex items-center px-8 py-3 rounded-2xl text-base font-bold shadow-lg transition-all active:scale-95 ${
                  isTimerRunning
                    ? 'bg-amber-500 hover:bg-amber-600 text-white'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/30'
                }`}
              >
                {isTimerRunning ? <Pause className="h-5 w-5 mr-2" /> : <Play className="h-5 w-5 mr-2" />}
                {isTimerRunning ? 'Pause Session' : 'Start Focus'}
              </button>

              <button
                onClick={resetTimer}
                title="Reset timer"
                className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-colors"
              >
                <RotateCcw className="h-5 w-5" />
              </button>
            </div>

          </div>
        </div>

        {/* Right Column: Exam & Assignment Deadlines */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Exam & Deadline Matrix</h3>
              <p className="text-xs text-slate-500">Never miss an assignment or test submission</p>
            </div>
            <button
              onClick={() => setShowDeadlineModal(true)}
              className="text-xs font-semibold text-violet-600 hover:underline flex items-center"
            >
              <PlusCircle className="h-3.5 w-3.5 mr-1" /> Add Deadline
            </button>
          </div>

          <div className="space-y-3 max-h-[460px] overflow-y-auto custom-scrollbar">
            {deadlines.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                No deadlines scheduled yet. Add your upcoming exams & assignments!
              </div>
            ) : (
              deadlines.map((item) => {
                const daysLeft = Math.ceil((new Date(item.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
                const isOverdue = daysLeft < 0;
                const isUrgent = daysLeft >= 0 && daysLeft <= 2;

                return (
                  <div
                    key={item._id}
                    className={`p-4 rounded-2xl border transition-all ${
                      item.completed 
                        ? 'bg-slate-50/60 border-slate-200/50 opacity-60' 
                        : 'bg-white border-slate-200/80 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      
                      <div className="flex items-start space-x-3 min-w-0">
                        <button
                          onClick={() => toggleDeadline(item._id)}
                          className="mt-0.5 text-slate-400 hover:text-violet-600 transition-colors flex-shrink-0"
                        >
                          {item.completed ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          ) : (
                            <Circle className="h-5 w-5" />
                          )}
                        </button>

                        <div>
                          <h4 className={`text-sm font-bold text-slate-900 ${item.completed ? 'line-through text-slate-400' : ''}`}>
                            {item.title}
                          </h4>
                          <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-500">
                            <span className="px-2 py-0.5 rounded-md font-semibold bg-violet-50 text-violet-700">
                              {item.type}
                            </span>
                            {item.weightage && <span>Weight: {item.weightage}</span>}
                            {item.notes && <span className="text-slate-400 italic truncate max-w-xs">"{item.notes}"</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 flex-shrink-0">
                        <div className="text-right">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                            item.completed 
                              ? 'bg-emerald-50 text-emerald-700' 
                              : isOverdue 
                                ? 'bg-rose-100 text-rose-700' 
                                : isUrgent 
                                  ? 'bg-amber-100 text-amber-700 animate-pulse' 
                                  : 'bg-slate-100 text-slate-700'
                          }`}>
                            {item.completed 
                              ? 'Done' 
                              : isOverdue 
                                ? 'Overdue' 
                                : daysLeft === 0 
                                  ? 'Today!' 
                                  : daysLeft === 1 
                                    ? 'Tomorrow' 
                                    : `In ${daysLeft} days`}
                          </span>
                          <div className="text-[11px] text-slate-400 mt-1">
                            {new Date(item.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                        </div>

                        <button
                          onClick={() => deleteDeadline(item._id)}
                          className="p-1 text-slate-300 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Subjects & Syllabus Topics Manager */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Subject Courses & Syllabus Progress</h3>
            <p className="text-xs text-slate-500">Track topic mastery for every course</p>
          </div>
          <button
            onClick={() => setShowSubjectModal(true)}
            className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all"
          >
            <Plus className="h-4 w-4 mr-1" /> Add Subject
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => {
            const isExpanded = expandedSubjectId === subject._id;
            const completedCount = (subject.topics || []).filter(t => t.completed).length;
            const totalCount = subject.topics?.length || 0;
            const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

            return (
              <div 
                key={subject._id}
                className="rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="h-10 w-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0"
                        style={{ backgroundColor: subject.color || '#6366f1' }}
                      >
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-900 leading-tight">{subject.name}</h4>
                        <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
                          {subject.code && <span className="font-semibold text-indigo-600">{subject.code}</span>}
                          {subject.instructor && <span>• {subject.instructor}</span>}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteSubject(subject._id)}
                      className="p-1 text-slate-300 hover:text-rose-500 transition-colors"
                      title="Delete subject"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Syllabus Completion</span>
                      <span>{completedCount}/{totalCount} topics ({progress}%)</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${progress}%`,
                          backgroundColor: progress === 100 ? '#10b981' : (subject.color || '#6366f1')
                        }}
                      />
                    </div>
                  </div>

                  {/* Topics Accordion */}
                  <div className="mt-4 pt-3 border-t border-slate-200/60">
                    <button
                      onClick={() => setExpandedSubjectId(isExpanded ? null : subject._id)}
                      className="flex items-center justify-between w-full text-xs font-bold text-slate-700 hover:text-indigo-600 transition-colors"
                    >
                      <span>Syllabus Checklist ({totalCount})</span>
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>

                    {isExpanded && (
                      <div className="mt-3 space-y-2 animate-fadeIn">
                        {/* Topic list */}
                        <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                          {subject.topics && subject.topics.map((t) => (
                            <div 
                              key={t._id}
                              className="flex items-center space-x-2 text-xs py-1 px-2 rounded-lg hover:bg-slate-100 transition-colors"
                            >
                              <button
                                onClick={() => toggleTopicCompletion(subject._id, t._id)}
                                className="text-slate-400 hover:text-indigo-600 transition-colors flex-shrink-0"
                              >
                                {t.completed ? (
                                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                ) : (
                                  <Circle className="h-4 w-4" />
                                )}
                              </button>
                              <span className={`font-medium ${t.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                                {t.title}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Add Topic Input */}
                        <div className="flex gap-1.5 pt-2">
                          <input
                            type="text"
                            placeholder="Add new topic..."
                            value={newTopicTitles[subject._id] || ''}
                            onChange={(e) => setNewTopicTitles({ ...newTopicTitles, [subject._id]: e.target.value })}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddTopic(subject._id)}
                            className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                          <button
                            onClick={() => handleAddTopic(subject._id)}
                            className="px-2.5 py-1.5 bg-slate-200 hover:bg-indigo-600 hover:text-white rounded-lg text-xs font-semibold transition-colors"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-2 text-[11px] text-slate-400 flex justify-between">
                  <span>Target: {subject.targetHoursPerWeek || 5} hrs/week</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= MODALS ================= */}

      {/* 1. Add Subject Modal */}
      {showSubjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">Add Course Subject</h3>
              <button onClick={() => setShowSubjectModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubjectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Subject Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Operating Systems, Calculus III"
                  value={subjectForm.name}
                  onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Course Code
                  </label>
                  <input
                    type="text"
                    placeholder="CS-202"
                    value={subjectForm.code}
                    onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Instructor
                  </label>
                  <input
                    type="text"
                    placeholder="Prof. John Doe"
                    value={subjectForm.instructor}
                    onChange={(e) => setSubjectForm({ ...subjectForm, instructor: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Target Study (Hours / Week)
                </label>
                <input
                  type="number"
                  min="1"
                  max="40"
                  value={subjectForm.targetHoursPerWeek}
                  onChange={(e) => setSubjectForm({ ...subjectForm, targetHoursPerWeek: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Course Color Accent
                </label>
                <div className="flex gap-3">
                  {['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#8b5cf6'].map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSubjectForm({ ...subjectForm, color })}
                      className={`h-8 w-8 rounded-full transition-transform ${subjectForm.color === color ? 'scale-125 ring-2 ring-offset-2 ring-slate-400' : ''}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSubjectModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md"
                >
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Add Deadline Modal */}
      {showDeadlineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">Add Exam / Deadline</h3>
              <button onClick={() => setShowDeadlineModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleDeadlineSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Midterm Examination, Final Project"
                  value={deadlineForm.title}
                  onChange={(e) => setDeadlineForm({ ...deadlineForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Type
                  </label>
                  <select
                    value={deadlineForm.type}
                    onChange={(e) => setDeadlineForm({ ...deadlineForm, type: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                  >
                    <option value="Exam">Exam</option>
                    <option value="Assignment">Assignment</option>
                    <option value="Project">Project</option>
                    <option value="Quiz">Quiz</option>
                    <option value="Presentation">Presentation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Subject
                  </label>
                  <select
                    value={deadlineForm.subjectId}
                    onChange={(e) => setDeadlineForm({ ...deadlineForm, subjectId: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                  >
                    <option value="">General</option>
                    {subjects.map(s => (
                      <option key={s._id} value={s._id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={deadlineForm.dueDate}
                    onChange={(e) => setDeadlineForm({ ...deadlineForm, dueDate: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Weightage
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 25%"
                    value={deadlineForm.weightage}
                    onChange={(e) => setDeadlineForm({ ...deadlineForm, weightage: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Notes & Key Topics
                </label>
                <textarea
                  rows="2"
                  placeholder="Chapter 1-4, bring calculator..."
                  value={deadlineForm.notes}
                  onChange={(e) => setDeadlineForm({ ...deadlineForm, notes: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeadlineModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold bg-violet-600 hover:bg-violet-700 text-white rounded-xl shadow-md"
                >
                  Schedule Deadline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Manual Session Log Modal */}
      {showManualLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-slate-100 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">Log Study Session</h3>
              <button onClick={() => setShowManualLogModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleManualLogSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Duration (Minutes) *
                </label>
                <input
                  type="number"
                  min="5"
                  step="5"
                  required
                  value={manualLogForm.durationMinutes}
                  onChange={(e) => setManualLogForm({ ...manualLogForm, durationMinutes: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Subject
                </label>
                <select
                  value={manualLogForm.subjectId}
                  onChange={(e) => setManualLogForm({ ...manualLogForm, subjectId: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">General Study</option>
                  {subjects.map(s => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Topic Covered
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chapter 4 Practice Exercises"
                  value={manualLogForm.topic}
                  onChange={(e) => setManualLogForm({ ...manualLogForm, topic: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowManualLogModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md"
                >
                  Record Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default StudyPlanner;
