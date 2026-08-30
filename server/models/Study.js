const mongoose = require('mongoose');

// Topic / Syllabus Item Schema
const topicSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  }
});

// Subject Schema
const subjectSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    trim: true
  },
  color: {
    type: String,
    default: '#6366f1' // Indigo default
  },
  instructor: {
    type: String,
    trim: true
  },
  targetHoursPerWeek: {
    type: Number,
    default: 5
  },
  topics: [topicSchema]
}, {
  timestamps: true
});

// Study Session / Pomodoro Log Schema
const studySessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  },
  durationMinutes: {
    type: Number,
    required: true,
    min: 1
  },
  topic: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  pomodorosCompleted: {
    type: Number,
    default: 1
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Exam & Assignment Deadline Schema
const deadlineSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['Exam', 'Assignment', 'Quiz', 'Project', 'Presentation'],
    default: 'Exam'
  },
  dueDate: {
    type: Date,
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'high'
  },
  weightage: {
    type: String, // e.g. "30%"
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

const Subject = mongoose.model('Subject', subjectSchema);
const StudySession = mongoose.model('StudySession', studySessionSchema);
const Deadline = mongoose.model('Deadline', deadlineSchema);

module.exports = {
  Subject,
  StudySession,
  Deadline
};
