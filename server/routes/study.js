const express = require('express');
const { body, validationResult } = require('express-validator');
const { Subject, StudySession, Deadline } = require('../models/Study');
const auth = require('../middleware/auth');

const router = express.Router();

// ==================== SUBJECTS ==================== //

// @route   GET api/study/subjects
// @desc    Get all subjects for the user
// @access  Private
router.get('/subjects', auth, async (req, res) => {
  try {
    const subjects = await Subject.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(subjects);
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({ message: 'Server error while fetching subjects' });
  }
});

// @route   POST api/study/subjects
// @desc    Create a new subject
// @access  Private
router.post('/subjects', [
  auth,
  body('name').trim().notEmpty().withMessage('Subject name is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, code, color, instructor, targetHoursPerWeek, topics } = req.body;

    const subject = new Subject({
      userId: req.user._id,
      name,
      code: code || '',
      color: color || '#6366f1',
      instructor: instructor || '',
      targetHoursPerWeek: Number(targetHoursPerWeek) || 5,
      topics: Array.isArray(topics) ? topics : []
    });

    await subject.save();
    res.status(201).json(subject);
  } catch (error) {
    console.error('Create subject error:', error);
    res.status(500).json({ message: 'Server error while creating subject' });
  }
});

// @route   PUT api/study/subjects/:id
// @desc    Update a subject or its topics
// @access  Private
router.put('/subjects/:id', auth, async (req, res) => {
  try {
    const subject = await Subject.findOne({ _id: req.params.id, userId: req.user._id });
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    const { name, code, color, instructor, targetHoursPerWeek, topics } = req.body;

    if (name !== undefined) subject.name = name;
    if (code !== undefined) subject.code = code;
    if (color !== undefined) subject.color = color;
    if (instructor !== undefined) subject.instructor = instructor;
    if (targetHoursPerWeek !== undefined) subject.targetHoursPerWeek = Number(targetHoursPerWeek);
    if (topics !== undefined) subject.topics = topics;

    await subject.save();
    res.json(subject);
  } catch (error) {
    console.error('Update subject error:', error);
    res.status(500).json({ message: 'Server error while updating subject' });
  }
});

// @route   DELETE api/study/subjects/:id
// @desc    Delete a subject
// @access  Private
router.delete('/subjects/:id', auth, async (req, res) => {
  try {
    const subject = await Subject.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    // Also cleanup related sessions and deadlines
    await StudySession.deleteMany({ subjectId: req.params.id, userId: req.user._id });
    await Deadline.deleteMany({ subjectId: req.params.id, userId: req.user._id });

    res.json({ message: 'Subject and associated data deleted', id: req.params.id });
  } catch (error) {
    console.error('Delete subject error:', error);
    res.status(500).json({ message: 'Server error deleting subject' });
  }
});

// ==================== STUDY SESSIONS & STATS ==================== //

// @route   GET api/study/sessions
// @desc    Get recent study sessions
// @access  Private
router.get('/sessions', auth, async (req, res) => {
  try {
    const sessions = await StudySession.find({ userId: req.user._id })
      .populate('subjectId', 'name color code')
      .sort({ date: -1 })
      .limit(50);
    res.json(sessions);
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ message: 'Server error fetching study sessions' });
  }
});

// @route   POST api/study/sessions
// @desc    Log a new study session / completed pomodoro
// @access  Private
router.post('/sessions', [
  auth,
  body('durationMinutes').isInt({ min: 1 }).withMessage('Duration in minutes is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { subjectId, durationMinutes, topic, notes, pomodorosCompleted, date } = req.body;

    const session = new StudySession({
      userId: req.user._id,
      subjectId: subjectId || null,
      durationMinutes: Number(durationMinutes),
      topic: topic || '',
      notes: notes || '',
      pomodorosCompleted: Number(pomodorosCompleted) || 1,
      date: date ? new Date(date) : new Date()
    });

    await session.save();
    const populated = await StudySession.findById(session._id).populate('subjectId', 'name color code');
    res.status(201).json(populated);
  } catch (error) {
    console.error('Create study session error:', error);
    res.status(500).json({ message: 'Server error logging study session' });
  }
});

// @route   GET api/study/stats
// @desc    Get study analytics (weekly minutes, streaks, subject distribution)
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const sessions = await StudySession.find({ userId: req.user._id }).populate('subjectId', 'name color');

    let totalMinutes = 0;
    let totalPomodoros = 0;
    const subjectDistribution = {};
    const dailyMinutes = {};

    // Get last 7 days keys
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      dailyMinutes[dateKey] = 0;
    }

    sessions.forEach(s => {
      totalMinutes += s.durationMinutes;
      totalPomodoros += (s.pomodorosCompleted || 1);

      const subjName = s.subjectId?.name || 'General Study';
      subjectDistribution[subjName] = (subjectDistribution[subjName] || 0) + s.durationMinutes;

      const dateKey = new Date(s.date).toISOString().split('T')[0];
      if (dailyMinutes[dateKey] !== undefined) {
        dailyMinutes[dateKey] += s.durationMinutes;
      }
    });

    // Calculate streak (consecutive days with at least 1 session)
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

    res.json({
      totalMinutes,
      totalHours: Number((totalMinutes / 60).toFixed(1)),
      totalPomodoros,
      streak,
      subjectDistribution,
      dailyMinutes
    });
  } catch (error) {
    console.error('Study stats error:', error);
    res.status(500).json({ message: 'Server error computing study stats' });
  }
});

// ==================== DEADLINES & EXAMS ==================== //

// @route   GET api/study/deadlines
// @desc    Get all upcoming and completed deadlines
// @access  Private
router.get('/deadlines', auth, async (req, res) => {
  try {
    const deadlines = await Deadline.find({ userId: req.user._id })
      .populate('subjectId', 'name color code')
      .sort({ dueDate: 1 });
    res.json(deadlines);
  } catch (error) {
    console.error('Get deadlines error:', error);
    res.status(500).json({ message: 'Server error fetching deadlines' });
  }
});

// @route   POST api/study/deadlines
// @desc    Create a new deadline / exam countdown
// @access  Private
router.post('/deadlines', [
  auth,
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('dueDate').isISO8601().withMessage('Valid due date is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, subjectId, type, dueDate, priority, weightage, notes } = req.body;

    const deadline = new Deadline({
      userId: req.user._id,
      title,
      subjectId: subjectId || null,
      type: type || 'Exam',
      dueDate: new Date(dueDate),
      priority: priority || 'medium',
      weightage: weightage || '',
      notes: notes || '',
      completed: false
    });

    await deadline.save();
    const populated = await Deadline.findById(deadline._id).populate('subjectId', 'name color code');
    res.status(201).json(populated);
  } catch (error) {
    console.error('Create deadline error:', error);
    res.status(500).json({ message: 'Server error creating deadline' });
  }
});

// @route   PUT api/study/deadlines/:id
// @desc    Update deadline status or details
// @access  Private
router.put('/deadlines/:id', auth, async (req, res) => {
  try {
    const deadline = await Deadline.findOne({ _id: req.params.id, userId: req.user._id });
    if (!deadline) {
      return res.status(404).json({ message: 'Deadline not found' });
    }

    const { title, subjectId, type, dueDate, priority, weightage, notes, completed } = req.body;

    if (title !== undefined) deadline.title = title;
    if (subjectId !== undefined) deadline.subjectId = subjectId || null;
    if (type !== undefined) deadline.type = type;
    if (dueDate !== undefined) deadline.dueDate = new Date(dueDate);
    if (priority !== undefined) deadline.priority = priority;
    if (weightage !== undefined) deadline.weightage = weightage;
    if (notes !== undefined) deadline.notes = notes;
    if (completed !== undefined) deadline.completed = completed;

    await deadline.save();
    const populated = await Deadline.findById(deadline._id).populate('subjectId', 'name color code');
    res.json(populated);
  } catch (error) {
    console.error('Update deadline error:', error);
    res.status(500).json({ message: 'Server error updating deadline' });
  }
});

// @route   DELETE api/study/deadlines/:id
// @desc    Delete a deadline
// @access  Private
router.delete('/deadlines/:id', auth, async (req, res) => {
  try {
    const deadline = await Deadline.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!deadline) {
      return res.status(404).json({ message: 'Deadline not found' });
    }
    res.json({ message: 'Deadline deleted', id: req.params.id });
  } catch (error) {
    console.error('Delete deadline error:', error);
    res.status(500).json({ message: 'Server error deleting deadline' });
  }
});

module.exports = router;
