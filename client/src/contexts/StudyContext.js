import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const StudyContext = createContext();

export const useStudy = () => {
  const context = useContext(StudyContext);
  if (!context) {
    throw new Error('useStudy must be used within a StudyProvider');
  }
  return context;
};

// Initial realistic sample data
const INITIAL_SUBJECTS = [
  {
    _id: 'subj-1',
    name: 'Data Structures & Algorithms',
    code: 'CS-301',
    color: '#6366f1',
    instructor: 'Prof. Sharma',
    targetHoursPerWeek: 8,
    topics: [
      { _id: 't-1', title: 'Binary Trees & Traversals', completed: true },
      { _id: 't-2', title: 'Dynamic Programming & Memoization', completed: true },
      { _id: 't-3', title: 'Graph Algorithms (Dijkstra, BFS/DFS)', completed: false },
      { _id: 't-4', title: 'Trie and Advanced String Search', completed: false }
    ]
  },
  {
    _id: 'subj-2',
    name: 'Database Management Systems',
    code: 'CS-304',
    color: '#10b981',
    instructor: 'Dr. Patel',
    targetHoursPerWeek: 6,
    topics: [
      { _id: 't-5', title: 'Relational Algebra & Normalization', completed: true },
      { _id: 't-6', title: 'ACID Properties & Concurrency Control', completed: true },
      { _id: 't-7', title: 'NoSQL & MongoDB Aggregations', completed: false }
    ]
  },
  {
    _id: 'subj-3',
    name: 'Full Stack Web Engineering',
    code: 'CS-308',
    color: '#f59e0b',
    instructor: 'Dr. Anderson',
    targetHoursPerWeek: 10,
    topics: [
      { _id: 't-8', title: 'State Management with React Context', completed: true },
      { _id: 't-9', title: 'RESTful API & JWT Authentication', completed: true },
      { _id: 't-10', title: 'Performance Optimization & SSR', completed: false }
    ]
  }
];

const INITIAL_DEADLINES = [
  {
    _id: 'dl-1',
    title: 'Mid-term DSA Examination',
    subjectId: 'subj-1',
    type: 'Exam',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 'high',
    weightage: '30%',
    completed: false,
    notes: 'Covers Trees, Graphs, DP and Heaps'
  },
  {
    _id: 'dl-2',
    title: 'Full Stack Project Milestone 2',
    subjectId: 'subj-3',
    type: 'Project',
    dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 'medium',
    weightage: '20%',
    completed: false,
    notes: 'Submit GitHub repo with live URL'
  },
  {
    _id: 'dl-3',
    title: 'DBMS SQL Assignment & ER Diagram',
    subjectId: 'subj-2',
    type: 'Assignment',
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 'high',
    weightage: '15%',
    completed: false,
    notes: 'Complete queries 1 through 10'
  }
];

const INITIAL_SESSIONS = [
  {
    _id: 'sess-1',
    subjectId: 'subj-1',
    durationMinutes: 50,
    topic: 'Graph BFS/DFS Traversal practice',
    pomodorosCompleted: 2,
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: 'sess-2',
    subjectId: 'subj-3',
    durationMinutes: 75,
    topic: 'API routes & Context architecture',
    pomodorosCompleted: 3,
    date: new Date().toISOString()
  }
];

export const StudyProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Pomodoro State
  const [timerMode, setTimerMode] = useState('focus'); // focus (25m), shortBreak (5m), longBreak (15m)
  const [focusDuration, setFocusDuration] = useState(25); // in minutes
  const [shortBreakDuration, setShortBreakDuration] = useState(5);
  const [longBreakDuration] = useState(15);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [currentSessionTopic, setCurrentSessionTopic] = useState('');
  const [completedPomodorosCount, setCompletedPomodorosCount] = useState(0);

  const timerRef = useRef(null);

  // Play clean chime bell sound using Web Audio API (no external asset required)
  const playTimerChime = useCallback(() => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const now = ctx.currentTime;
      const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 chord
      
      freqs.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.1);
        
        gain.gain.setValueAtTime(0.3, now + index * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.1 + 1.2);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(now + index * 0.1);
        osc.stop(now + index * 0.1 + 1.3);
      });
    } catch (e) {
      console.log('Audio chime error:', e);
    }
  }, []);

  // Fetch Study Data
  const fetchStudyData = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const [subjRes, dlRes, sessRes] = await Promise.all([
        api.get('/study/subjects'),
        api.get('/study/deadlines'),
        api.get('/study/sessions')
      ]);

      if (subjRes.data && subjRes.data.length > 0) {
        setSubjects(subjRes.data);
      } else {
        const local = localStorage.getItem('study_subjects');
        setSubjects(local ? JSON.parse(local) : INITIAL_SUBJECTS);
      }

      if (dlRes.data && dlRes.data.length > 0) {
        setDeadlines(dlRes.data);
      } else {
        const local = localStorage.getItem('study_deadlines');
        setDeadlines(local ? JSON.parse(local) : INITIAL_DEADLINES);
      }

      if (sessRes.data && sessRes.data.length > 0) {
        setSessions(sessRes.data);
      } else {
        const local = localStorage.getItem('study_sessions');
        setSessions(local ? JSON.parse(local) : INITIAL_SESSIONS);
      }
    } catch (error) {
      console.warn('Using offline study data fallback:', error);
      const localSub = localStorage.getItem('study_subjects');
      const localDl = localStorage.getItem('study_deadlines');
      const localSess = localStorage.getItem('study_sessions');

      setSubjects(localSub ? JSON.parse(localSub) : INITIAL_SUBJECTS);
      setDeadlines(localDl ? JSON.parse(localDl) : INITIAL_DEADLINES);
      setSessions(localSess ? JSON.parse(localSess) : INITIAL_SESSIONS);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchStudyData();
  }, [fetchStudyData]);

  // Persist offline cache
  useEffect(() => {
    if (subjects.length > 0) localStorage.setItem('study_subjects', JSON.stringify(subjects));
    if (deadlines.length > 0) localStorage.setItem('study_deadlines', JSON.stringify(deadlines));
    if (sessions.length > 0) localStorage.setItem('study_sessions', JSON.stringify(sessions));
  }, [subjects, deadlines, sessions]);

  // Log a completed study session
  const logStudySession = useCallback(async (durationMins, topic, subjectId) => {
    try {
      const payload = {
        durationMinutes: durationMins,
        topic: topic || 'Focused Study Sprint',
        subjectId: subjectId || null,
        pomodorosCompleted: 1,
        date: new Date().toISOString()
      };

      let newSession;
      try {
        const res = await api.post('/study/sessions', payload);
        newSession = res.data;
      } catch (err) {
        newSession = { ...payload, _id: 'sess-' + Date.now() };
      }

      setSessions(prev => [newSession, ...prev]);
      setCompletedPomodorosCount(prev => prev + 1);
      toast.success(`🎉 Great focus! Logged ${durationMins}m study session!`);
    } catch (err) {
      console.error('Session log error:', err);
    }
  }, []);

  // Pomodoro timer tick effect
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsTimerRunning(false);
            playTimerChime();

            if (timerMode === 'focus') {
              logStudySession(focusDuration, currentSessionTopic, selectedSubjectId);
              toast.info('Focus session complete! Time for a well-deserved break.');
              setTimerMode('shortBreak');
              return shortBreakDuration * 60;
            } else {
              toast.info('Break finished! Ready to dive back in?');
              setTimerMode('focus');
              return focusDuration * 60;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isTimerRunning, timerMode, focusDuration, shortBreakDuration, currentSessionTopic, selectedSubjectId, playTimerChime, logStudySession]);

  // Switch Timer Mode
  const switchTimerMode = (mode) => {
    setIsTimerRunning(false);
    setTimerMode(mode);
    if (mode === 'focus') setTimeLeft(focusDuration * 60);
    if (mode === 'shortBreak') setTimeLeft(shortBreakDuration * 60);
    if (mode === 'longBreak') setTimeLeft(longBreakDuration * 60);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    if (timerMode === 'focus') setTimeLeft(focusDuration * 60);
    if (timerMode === 'shortBreak') setTimeLeft(shortBreakDuration * 60);
    if (timerMode === 'longBreak') setTimeLeft(longBreakDuration * 60);
  };

  // Subject CRUD
  const addSubject = async (subjectData) => {
    try {
      let newSubject;
      try {
        const res = await api.post('/study/subjects', subjectData);
        newSubject = res.data;
      } catch (e) {
        newSubject = { ...subjectData, _id: 'subj-' + Date.now(), topics: subjectData.topics || [] };
      }
      setSubjects(prev => [newSubject, ...prev]);
      toast.success('Subject added successfully!');
      return { success: true, subject: newSubject };
    } catch (error) {
      toast.error('Failed to add subject');
      return { success: false };
    }
  };

  const updateSubject = async (subjectId, updates) => {
    try {
      try {
        await api.put(`/study/subjects/${subjectId}`, updates);
      } catch (e) {}
      setSubjects(prev => prev.map(s => s._id === subjectId ? { ...s, ...updates } : s));
      toast.success('Subject updated');
      return { success: true };
    } catch (error) {
      toast.error('Failed to update subject');
      return { success: false };
    }
  };

  const deleteSubject = async (subjectId) => {
    try {
      try {
        await api.delete(`/study/subjects/${subjectId}`);
      } catch (e) {}
      setSubjects(prev => prev.filter(s => s._id !== subjectId));
      toast.success('Subject removed');
      return { success: true };
    } catch (error) {
      toast.error('Failed to delete subject');
      return { success: false };
    }
  };

  const toggleTopicCompletion = (subjectId, topicId) => {
    setSubjects(prev => prev.map(s => {
      if (s._id === subjectId) {
        const updatedTopics = (s.topics || []).map(t => 
          t._id === topicId ? { ...t, completed: !t.completed, completedAt: !t.completed ? new Date().toISOString() : null } : t
        );
        updateSubject(subjectId, { topics: updatedTopics });
        return { ...s, topics: updatedTopics };
      }
      return s;
    }));
  };

  const addTopicToSubject = (subjectId, topicTitle) => {
    setSubjects(prev => prev.map(s => {
      if (s._id === subjectId) {
        const newTopic = { _id: 't-' + Date.now(), title: topicTitle, completed: false };
        const updatedTopics = [...(s.topics || []), newTopic];
        updateSubject(subjectId, { topics: updatedTopics });
        return { ...s, topics: updatedTopics };
      }
      return s;
    }));
    toast.success('Topic added to syllabus!');
  };

  // Deadlines CRUD
  const addDeadline = async (dlData) => {
    try {
      let newDl;
      try {
        const res = await api.post('/study/deadlines', dlData);
        newDl = res.data;
      } catch (e) {
        newDl = { ...dlData, _id: 'dl-' + Date.now(), completed: false };
      }
      setDeadlines(prev => [...prev, newDl]);
      toast.success('Deadline scheduled!');
      return { success: true };
    } catch (error) {
      toast.error('Failed to add deadline');
      return { success: false };
    }
  };

  const toggleDeadline = async (dlId) => {
    try {
      const target = deadlines.find(d => d._id === dlId);
      if (!target) return;
      const newStatus = !target.completed;
      try {
        await api.put(`/study/deadlines/${dlId}`, { completed: newStatus });
      } catch (e) {}
      setDeadlines(prev => prev.map(d => d._id === dlId ? { ...d, completed: newStatus } : d));
      toast.success(newStatus ? 'Deadline marked completed! 🎉' : 'Deadline marked pending');
    } catch (e) {
      toast.error('Failed to update deadline');
    }
  };

  const deleteDeadline = async (dlId) => {
    try {
      try {
        await api.delete(`/study/deadlines/${dlId}`);
      } catch (e) {}
      setDeadlines(prev => prev.filter(d => d._id !== dlId));
      toast.success('Deadline removed');
    } catch (e) {
      toast.error('Failed to delete deadline');
    }
  };

  // Study Analytics Calculation
  const totalMinutes = sessions.reduce((acc, s) => acc + (Number(s.durationMinutes) || 0), 0);
  const totalHours = Number((totalMinutes / 60).toFixed(1));

  // Calculate study streak
  const uniqueDates = [...new Set(sessions.map(s => new Date(s.date).toISOString().split('T')[0]))].sort().reverse();
  let streak = 0;
  let checkDate = new Date();
  checkDate.setHours(0, 0, 0, 0);

  for (const dStr of uniqueDates) {
    const sDate = new Date(dStr);
    sDate.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((checkDate - sDate) / (1000 * 60 * 60 * 24));
    if (diffDays === 0 || diffDays === 1) {
      streak++;
      checkDate = sDate;
    } else {
      break;
    }
  }

  // Next upcoming urgent deadline
  const upcomingDeadlines = deadlines
    .filter(d => !d.completed)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  const nextDeadline = upcomingDeadlines[0] || null;

  const value = {
    subjects,
    deadlines,
    sessions,
    loading,
    timerMode,
    timeLeft,
    isTimerRunning,
    focusDuration,
    shortBreakDuration,
    longBreakDuration,
    selectedSubjectId,
    currentSessionTopic,
    completedPomodorosCount,
    totalMinutes,
    totalHours,
    streak,
    nextDeadline,
    upcomingDeadlines,
    setIsTimerRunning,
    setFocusDuration,
    setShortBreakDuration,
    setSelectedSubjectId,
    setCurrentSessionTopic,
    switchTimerMode,
    resetTimer,
    logStudySession,
    addSubject,
    updateSubject,
    deleteSubject,
    addTopicToSubject,
    toggleTopicCompletion,
    addDeadline,
    toggleDeadline,
    deleteDeadline,
    fetchStudyData
  };

  return (
    <StudyContext.Provider value={value}>
      {children}
    </StudyContext.Provider>
  );
};
