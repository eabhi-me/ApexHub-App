const express = require('express');
const { body, validationResult } = require('express-validator');
const { Transaction, Budget, SavingsGoal } = require('../models/Finance');
const auth = require('../middleware/auth');

const router = express.Router();

// ==================== TRANSACTIONS ==================== //

// @route   GET api/finance/transactions
// @desc    Get all transactions with optional filters (type, category, month, search)
// @access  Private
router.get('/transactions', auth, async (req, res) => {
  try {
    const { type, category, month, search, startDate, endDate } = req.query;
    const query = { userId: req.user._id };

    if (type && ['income', 'expense'].includes(type)) {
      query.type = type;
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    } else if (month) {
      // Month format: 'YYYY-MM'
      const start = new Date(`${month}-01T00:00:00.000Z`);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);
      query.date = { $gte: start, $lt: end };
    }

    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { paymentMethod: { $regex: search, $options: 'i' } }
      ];
    }

    const transactions = await Transaction.find(query).sort({ date: -1, createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Server error while fetching transactions' });
  }
});

// @route   POST api/finance/transactions
// @desc    Create a new transaction
// @access  Private
router.post('/transactions', [
  auth,
  body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('description').optional().trim().isLength({ max: 300 }),
  body('paymentMethod').optional().trim(),
  body('date').optional().isISO8601()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { type, amount, category, description, paymentMethod, date, isRecurring, tags } = req.body;

    const transaction = new Transaction({
      userId: req.user._id,
      type,
      amount: Number(amount),
      category: category || 'General',
      description: description || '',
      paymentMethod: paymentMethod || 'UPI / Bank',
      date: date ? new Date(date) : new Date(),
      isRecurring: !!isRecurring,
      tags: Array.isArray(tags) ? tags : []
    });

    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ message: 'Server error while creating transaction' });
  }
});

// @route   PUT api/finance/transactions/:id
// @desc    Update a transaction
// @access  Private
router.put('/transactions/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, userId: req.user._id });
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const { type, amount, category, description, paymentMethod, date, isRecurring, tags } = req.body;

    if (type !== undefined) transaction.type = type;
    if (amount !== undefined) transaction.amount = Number(amount);
    if (category !== undefined) transaction.category = category;
    if (description !== undefined) transaction.description = description;
    if (paymentMethod !== undefined) transaction.paymentMethod = paymentMethod;
    if (date !== undefined) transaction.date = new Date(date);
    if (isRecurring !== undefined) transaction.isRecurring = isRecurring;
    if (tags !== undefined) transaction.tags = tags;

    await transaction.save();
    res.json(transaction);
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ message: 'Server error while updating transaction' });
  }
});

// @route   DELETE api/finance/transactions/:id
// @desc    Delete a transaction
// @access  Private
router.delete('/transactions/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.json({ message: 'Transaction deleted successfully', id: req.params.id });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ message: 'Server error while deleting transaction' });
  }
});

// ==================== SUMMARY & ANALYTICS ==================== //

// @route   GET api/finance/summary
// @desc    Get income, expense, balance, and category breakdowns
// @access  Private
router.get('/summary', auth, async (req, res) => {
  try {
    const { month } = req.query; // YYYY-MM
    const query = { userId: req.user._id };

    if (month) {
      const start = new Date(`${month}-01T00:00:00.000Z`);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);
      query.date = { $gte: start, $lt: end };
    }

    const transactions = await Transaction.find(query);

    let totalIncome = 0;
    let totalExpense = 0;
    const categoryBreakdown = {};

    transactions.forEach(t => {
      if (t.type === 'income') {
        totalIncome += t.amount;
      } else {
        totalExpense += t.amount;
        categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
      }
    });

    const netSavings = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(1) : 0;

    res.json({
      totalIncome,
      totalExpense,
      netSavings,
      savingsRate: Number(savingsRate),
      transactionCount: transactions.length,
      categoryBreakdown
    });
  } catch (error) {
    console.error('Finance summary error:', error);
    res.status(500).json({ message: 'Server error calculating finance summary' });
  }
});

// ==================== BUDGETS ==================== //

// @route   GET api/finance/budgets
// @desc    Get all budgets for current month
// @access  Private
router.get('/budgets', auth, async (req, res) => {
  try {
    const { monthYear } = req.query;
    const currentMonth = monthYear || new Date().toISOString().slice(0, 7);
    const budgets = await Budget.find({ userId: req.user._id, monthYear: currentMonth });
    res.json(budgets);
  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({ message: 'Server error while fetching budgets' });
  }
});

// @route   POST api/finance/budgets
// @desc    Set or update a budget limit for a category
// @access  Private
router.post('/budgets', [
  auth,
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('monthlyLimit').isFloat({ min: 1 }).withMessage('Monthly limit must be positive'),
  body('monthYear').trim().notEmpty().withMessage('monthYear (YYYY-MM) is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { category, monthlyLimit, monthYear } = req.body;

    let budget = await Budget.findOne({
      userId: req.user._id,
      category,
      monthYear
    });

    if (budget) {
      budget.monthlyLimit = Number(monthlyLimit);
      await budget.save();
    } else {
      budget = new Budget({
        userId: req.user._id,
        category,
        monthlyLimit: Number(monthlyLimit),
        monthYear
      });
      await budget.save();
    }

    res.status(201).json(budget);
  } catch (error) {
    console.error('Save budget error:', error);
    res.status(500).json({ message: 'Server error saving budget' });
  }
});

// ==================== SAVINGS GOALS ==================== //

// @route   GET api/finance/goals
// @desc    Get all savings goals
// @access  Private
router.get('/goals', auth, async (req, res) => {
  try {
    const goals = await SavingsGoal.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (error) {
    console.error('Get goals error:', error);
    res.status(500).json({ message: 'Server error fetching savings goals' });
  }
});

// @route   POST api/finance/goals
// @desc    Create a new savings goal
// @access  Private
router.post('/goals', [
  auth,
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('targetAmount').isFloat({ min: 1 }).withMessage('Target amount must be greater than 0')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, targetAmount, currentAmount, targetDate, color, icon } = req.body;

    const goal = new SavingsGoal({
      userId: req.user._id,
      title,
      targetAmount: Number(targetAmount),
      currentAmount: Number(currentAmount) || 0,
      targetDate: targetDate ? new Date(targetDate) : undefined,
      color: color || '#3b82f6',
      icon: icon || 'Target'
    });

    await goal.save();
    res.status(201).json(goal);
  } catch (error) {
    console.error('Create goal error:', error);
    res.status(500).json({ message: 'Server error creating savings goal' });
  }
});

// @route   PUT api/finance/goals/:id
// @desc    Update a savings goal (e.g. add funds or edit)
// @access  Private
router.put('/goals/:id', auth, async (req, res) => {
  try {
    const goal = await SavingsGoal.findOne({ _id: req.params.id, userId: req.user._id });
    if (!goal) {
      return res.status(404).json({ message: 'Savings goal not found' });
    }

    const { title, targetAmount, currentAmount, targetDate, color, icon } = req.body;

    if (title !== undefined) goal.title = title;
    if (targetAmount !== undefined) goal.targetAmount = Number(targetAmount);
    if (currentAmount !== undefined) goal.currentAmount = Number(currentAmount);
    if (targetDate !== undefined) goal.targetDate = targetDate ? new Date(targetDate) : null;
    if (color !== undefined) goal.color = color;
    if (icon !== undefined) goal.icon = icon;

    await goal.save();
    res.json(goal);
  } catch (error) {
    console.error('Update goal error:', error);
    res.status(500).json({ message: 'Server error updating savings goal' });
  }
});

// @route   DELETE api/finance/goals/:id
// @desc    Delete a savings goal
// @access  Private
router.delete('/goals/:id', auth, async (req, res) => {
  try {
    const goal = await SavingsGoal.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!goal) {
      return res.status(404).json({ message: 'Savings goal not found' });
    }
    res.json({ message: 'Savings goal deleted', id: req.params.id });
  } catch (error) {
    console.error('Delete goal error:', error);
    res.status(500).json({ message: 'Server error deleting savings goal' });
  }
});

module.exports = router;
