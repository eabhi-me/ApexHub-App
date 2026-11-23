const express = require('express');
const auth = require('../middleware/auth');
const Todo = require('../models/Todo');
const { Transaction } = require('../models/Finance');
const { StudySession, StudyPlan } = require('../models/Study');
const aiService = require('../services/aiService');

const router = express.Router();

/**
 * Helper to mask an API key for safe display
 */
function maskApiKey(key) {
  if (!key) return '';
  const trimmed = key.trim();
  if (trimmed.length > 8) {
    return `${trimmed.slice(0, 4)}••••${trimmed.slice(-4)}`;
  }
  return '••••••••';
}

/**
 * Resolve effective AI config based on request overrides or user settings
 */
function resolveConfig(req) {
  // Determine mode: check body override, header, or user preference (default: general)
  const bodyConfig = req.body.aiConfig || {};
  const mode = req.body.mode || bodyConfig.mode || req.headers['x-ai-mode'] || req.user?.aiConfig?.mode || 'general';

  if (mode === 'byok') {
    const provider = req.body.provider || bodyConfig.provider || req.headers['x-ai-provider'] || req.user?.aiConfig?.provider || 'gemini';
    const apiKey = req.body.apiKey || bodyConfig.apiKey || req.headers['x-ai-key'] || req.user?.aiConfig?.apiKey || '';
    const model = req.body.model || bodyConfig.model || req.headers['x-ai-model'] || req.user?.aiConfig?.model || aiService.getDefaultModel(provider);
    const customEndpoint = req.body.customEndpoint || bodyConfig.customEndpoint || req.user?.aiConfig?.customEndpoint || '';

    if (!apiKey || !apiKey.trim()) {
      const error = new Error('BYOK (Bring Your Own Key) mode is active, but no API key is configured. Please provide your API key in AI settings or switch to General Method.');
      error.status = 400;
      error.code = 'BYOK_KEY_MISSING';
      throw error;
    }

    return {
      mode: 'byok',
      provider,
      apiKey: apiKey.trim(),
      model,
      customEndpoint: customEndpoint.trim()
    };
  }

  // General method: managed by platform environment
  const serverKey = process.env.GEMINI_API_KEY;
  if (!serverKey || serverKey === 'MISSING_API_KEY') {
    const error = new Error('General Method is currently unavailable because the server GEMINI_API_KEY is not configured. Please switch to BYOK mode to use your own API key.');
    error.status = 503;
    error.code = 'GENERAL_KEY_NOT_CONFIGURED';
    throw error;
  }

  return {
    mode: 'general',
    provider: 'gemini',
    apiKey: serverKey.trim(),
    model: 'gemini-flash-latest'
  };
}

// @route   GET api/ai/config
// @desc    Get user's AI configuration and platform status
// @access  Private
router.get('/config', auth, async (req, res) => {
  try {
    const userConfig = req.user?.aiConfig || {};
    const rawKey = userConfig.apiKey || '';
    const serverKeyAvailable = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MISSING_API_KEY');

    res.json({
      success: true,
      config: {
        mode: userConfig.mode || 'general',
        provider: userConfig.provider || 'gemini',
        model: userConfig.model || '',
        customEndpoint: userConfig.customEndpoint || '',
        hasCustomKey: Boolean(rawKey && rawKey.trim().length > 0),
        maskedKey: maskApiKey(rawKey),
        generalAvailable: serverKeyAvailable
      }
    });
  } catch (error) {
    console.error('Error fetching AI config:', error);
    res.status(500).json({ message: 'Failed to fetch AI configuration' });
  }
});

// @route   POST api/ai/config
// @desc    Update user's AI mode, provider, model, or custom API key
// @access  Private
router.post('/config', auth, async (req, res) => {
  try {
    const { mode, provider, apiKey, model, customEndpoint, clearKey } = req.body;

    if (!req.user.aiConfig) {
      req.user.aiConfig = {};
    }

    if (mode && ['general', 'byok'].includes(mode)) {
      req.user.aiConfig.mode = mode;
    }

    if (provider && ['gemini', 'openai', 'groq', 'openrouter'].includes(provider)) {
      req.user.aiConfig.provider = provider;
    }

    if (typeof model === 'string') {
      req.user.aiConfig.model = model.trim();
    }

    if (typeof customEndpoint === 'string') {
      req.user.aiConfig.customEndpoint = customEndpoint.trim();
    }

    if (clearKey === true) {
      req.user.aiConfig.apiKey = '';
    } else if (typeof apiKey === 'string' && apiKey.trim().length > 0) {
      req.user.aiConfig.apiKey = apiKey.trim();
    }

    await req.user.save();

    const rawKey = req.user.aiConfig.apiKey || '';
    const serverKeyAvailable = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MISSING_API_KEY');

    res.json({
      success: true,
      message: 'AI configuration updated successfully',
      config: {
        mode: req.user.aiConfig.mode || 'general',
        provider: req.user.aiConfig.provider || 'gemini',
        model: req.user.aiConfig.model || '',
        customEndpoint: req.user.aiConfig.customEndpoint || '',
        hasCustomKey: Boolean(rawKey && rawKey.trim().length > 0),
        maskedKey: maskApiKey(rawKey),
        generalAvailable: serverKeyAvailable
      }
    });
  } catch (error) {
    console.error('Error updating AI config:', error);
    res.status(500).json({ message: 'Failed to update AI configuration', error: error.message });
  }
});

// @route   POST api/ai/test
// @desc    Test connection for a given provider and API key
// @access  Private
router.post('/test', auth, async (req, res) => {
  try {
    const provider = req.body.provider || req.user?.aiConfig?.provider || 'gemini';
    const apiKey = req.body.apiKey || req.user?.aiConfig?.apiKey;
    const model = req.body.model || req.user?.aiConfig?.model;
    const customEndpoint = req.body.customEndpoint || req.user?.aiConfig?.customEndpoint;

    if (!apiKey) {
      return res.status(400).json({
        success: false,
        message: 'No API Key provided. Please enter an API key to test.'
      });
    }

    const testResult = await aiService.testConnection({
      provider,
      apiKey,
      model,
      customEndpoint
    });

    res.json(testResult);
  } catch (error) {
    console.error('AI Test Connection Error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Connection test failed'
    });
  }
});

// @route   POST api/ai/chat
// @desc    Process user chat message with tools according to active AI mode
// @access  Private
router.post('/chat', auth, async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Resolve active configuration (General vs BYOK)
    let config;
    try {
      config = resolveConfig(req);
    } catch (cfgErr) {
      return res.status(cfgErr.status || 400).json({
        message: cfgErr.message,
        code: cfgErr.code,
        requiresConfig: cfgErr.code === 'BYOK_KEY_MISSING'
      });
    }

    const { reply, functionCalls } = await aiService.executeChat({
      provider: config.provider,
      apiKey: config.apiKey,
      model: config.model,
      customEndpoint: config.customEndpoint,
      message
    });

    // Handle tool function calls
    if (functionCalls && functionCalls.length > 0) {
      const call = functionCalls[0];
      
      if (call.name === 'create_task') {
        const { title, priority, dueDate } = call.args;
        const newTodo = new Todo({
          title: title || 'Untitled Task',
          priority: priority || 'medium',
          dueDate: dueDate ? new Date(dueDate) : undefined,
          userId: req.user._id
        });
        await newTodo.save();
        return res.json({ 
          success: true, 
          reply: `I have successfully created the task: "${title}".`,
          meta: { mode: config.mode, provider: config.provider, model: config.model }
        });
      }

      if (call.name === 'create_transaction') {
        const { type, amount, category, description } = call.args;
        const newTx = new Transaction({
          type: type || 'expense',
          amount: Number(amount) || 0,
          category: category || 'General',
          description: description || '',
          userId: req.user._id
        });
        await newTx.save();
        return res.json({
          success: true,
          reply: `Successfully logged an ${type} of ₹${amount} for ${category}.`,
          meta: { mode: config.mode, provider: config.provider, model: config.model }
        });
      }

      if (call.name === 'create_study_session') {
        const { durationMinutes, topic } = call.args;
        const newSession = new StudySession({
          durationMinutes: Number(durationMinutes) || 25,
          topic: topic || 'Study Session',
          userId: req.user._id
        });
        await newSession.save();
        return res.json({
          success: true,
          reply: `Great job! I logged ${durationMinutes} minutes of study for ${topic}.`,
          meta: { mode: config.mode, provider: config.provider, model: config.model }
        });
      }
    }

    return res.json({ 
      success: true, 
      reply: reply || "I've processed your request.",
      meta: { mode: config.mode, provider: config.provider, model: config.model }
    });

  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ 
      message: error.message || 'An error occurred while processing your request.',
      meta: req.user?.aiConfig?.mode ? { mode: req.user.aiConfig.mode } : undefined
    });
  }
});

// @route   POST api/ai/plan/day
// @desc    Generate a daily plan based on pending tasks according to active AI mode
// @access  Private
router.post('/plan/day', auth, async (req, res) => {
  try {
    let config;
    try {
      config = resolveConfig(req);
    } catch (cfgErr) {
      return res.status(cfgErr.status || 400).json({
        message: cfgErr.message,
        code: cfgErr.code,
        requiresConfig: cfgErr.code === 'BYOK_KEY_MISSING'
      });
    }

    // 1. Get Context (Pending tasks)
    const pendingTodos = await Todo.find({ userId: req.user._id, completed: false }).limit(10);
    
    if (pendingTodos.length === 0) {
      return res.json({ message: "You have no pending tasks to plan today! Relax!" });
    }

    const taskContext = pendingTodos.map(t => `- [${t.priority}] ${t.title} (Due: ${t.dueDate ? t.dueDate.toDateString() : 'None'})`).join('\n');

    // 2. Ask model to generate structured plan
    const planItems = await aiService.executeDailyPlan({
      provider: config.provider,
      apiKey: config.apiKey,
      model: config.model,
      customEndpoint: config.customEndpoint,
      taskContext
    });

    // 3. Save the plan to the database
    const newPlan = new StudyPlan({
      userId: req.user._id,
      date: new Date(),
      items: planItems
    });
    await newPlan.save();

    return res.json({ 
      success: true, 
      plan: newPlan,
      meta: { mode: config.mode, provider: config.provider, model: config.model }
    });

  } catch (error) {
    console.error('AI Plan Error:', error);
    res.status(500).json({ message: 'Failed to generate plan', error: error.message });
  }
});

module.exports = router;
