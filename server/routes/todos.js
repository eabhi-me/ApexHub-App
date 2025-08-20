const express = require('express');
const { body, validationResult } = require('express-validator');
const Todo = require('../models/Todo');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET api/todos
// @desc    Get all todos for the authenticated user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const todos = await Todo.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    
    res.json(todos);
  } catch (error) {
    console.error('Get todos error:', error);
    res.status(500).json({ message: 'Server error while fetching todos' });
  }
});

// @route   POST api/todos
// @desc    Create a new todo
// @access  Private
router.post('/', [
  auth,
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title is required and must be less than 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { title, description, priority, dueDate } = req.body;

    const todo = new Todo({
      title,
      description,
      priority,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      userId: req.user._id
    });

    await todo.save();
    res.status(201).json(todo);

  } catch (error) {
    console.error('Create todo error:', error);
    res.status(500).json({ message: 'Server error while creating todo' });
  }
});

// @route   PUT api/todos/:id
// @desc    Update a todo
// @access  Private
router.put('/:id', [
  auth,
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  body('completed')
    .optional()
    .isBoolean()
    .withMessage('Completed must be a boolean'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const todo = await Todo.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    const { title, description, priority, completed, dueDate } = req.body;

    if (title !== undefined) todo.title = title;
    if (description !== undefined) todo.description = description;
    if (priority !== undefined) todo.priority = priority;
    if (completed !== undefined) todo.completed = completed;
    if (dueDate !== undefined) todo.dueDate = dueDate ? new Date(dueDate) : null;

    await todo.save();
    res.json(todo);

  } catch (error) {
    console.error('Update todo error:', error);
    res.status(500).json({ message: 'Server error while updating todo' });
  }
});

// @route   DELETE api/todos/:id
// @desc    Delete a todo
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const todo = await Todo.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    res.json({ message: 'Todo deleted successfully' });

  } catch (error) {
    console.error('Delete todo error:', error);
    res.status(500).json({ message: 'Server error while deleting todo' });
  }
});

// @route   POST api/todos/:id/notes
// @desc    Add a note to a todo
// @access  Private
router.post('/:id/notes', [
  auth,
  body('content')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Note content is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const todo = await Todo.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    const note = {
      content: req.body.content
    };

    todo.notes.push(note);
    await todo.save();

    res.status(201).json(todo);

  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({ message: 'Server error while adding note' });
  }
});

// @route   PUT api/todos/:id/notes/:noteId
// @desc    Update a note
// @access  Private
router.put('/:id/notes/:noteId', [
  auth,
  body('content')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Note content is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const todo = await Todo.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    const note = todo.notes.id(req.params.noteId);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    note.content = req.body.content;
    await todo.save();

    res.json(todo);

  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ message: 'Server error while updating note' });
  }
});

// @route   DELETE api/todos/:id/notes/:noteId
// @desc    Delete a note
// @access  Private
router.delete('/:id/notes/:noteId', auth, async (req, res) => {
  try {
    const todo = await Todo.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    const note = todo.notes.id(req.params.noteId);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    note.deleteOne();
    await todo.save();

    res.json({ message: 'Note deleted successfully', todo });

  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ message: 'Server error while deleting note' });
  }
});

module.exports = router;
