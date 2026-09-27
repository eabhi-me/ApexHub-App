const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const auth = require('../middleware/auth');
const Todo = require('../models/Todo');
const { Transaction } = require('../models/Finance');
const { StudySession, StudyPlan } = require('../models/Study');

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'MISSING_API_KEY');

const createTaskTool = {
  name: "create_task",
  description: "Creates a new task or reminder for the user. Use this when the user asks to add or create a task, todo, or assignment.",
  parameters: {
    type: "OBJECT",
    properties: {
      title: { type: "STRING", description: "The name or title of the task" },
      priority: { type: "STRING", description: "The priority of the task. Can be 'low', 'medium', or 'high'." },
      dueDate: { type: "STRING", description: "An ISO 8601 date string for when the task is due, e.g. 2026-09-28T18:00:00Z" }
    },
    required: ["title"]
  }
};

const createTransactionTool = {
  name: "create_transaction",
  description: "Logs a new financial transaction (income or expense). Use this when the user says they spent money, bought something, or got paid.",
  parameters: {
    type: "OBJECT",
    properties: {
      type: { type: "STRING", description: "Either 'income' or 'expense'" },
      amount: { type: "NUMBER", description: "The amount of money" },
      category: { type: "STRING", description: "Category of transaction (e.g., Food, Salary, Bills, Shopping)" },
      description: { type: "STRING", description: "A short description of the transaction" }
    },
    required: ["type", "amount", "category"]
  }
};

const createStudySessionTool = {
  name: "create_study_session",
  description: "Logs a study session or pomodoro. Use this when the user says they studied, read, or practiced something for a certain amount of time.",
  parameters: {
    type: "OBJECT",
    properties: {
      durationMinutes: { type: "NUMBER", description: "Duration in minutes" },
      topic: { type: "STRING", description: "The topic or subject studied" }
    },
    required: ["durationMinutes", "topic"]
  }
};

router.post('/chat', auth, async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: 'GEMINI_API_KEY is not configured on the server. Please add it to your .env file.' });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
      tools: [{ functionDeclarations: [createTaskTool, createTransactionTool, createStudySessionTool] }]
    });

    const prompt = `You are ApexHub AI, a helpful productivity assistant. 
    You manage the user's tasks, finances, and studies. 
    Always use the provided tools if the user is asking to perform an action. 
    User's message: "${message}"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    const functionCalls = response.functionCalls();
    
    if (functionCalls && functionCalls.length > 0) {
      const call = functionCalls[0];
      
      if (call.name === 'create_task') {
        const { title, priority, dueDate } = call.args;
        const newTodo = new Todo({
          title,
          priority: priority || 'medium',
          dueDate: dueDate ? new Date(dueDate) : undefined,
          userId: req.user._id
        });
        await newTodo.save();
        return res.json({ 
          success: true, 
          reply: `I have successfully created the task: "${title}".` 
        });
      }

      if (call.name === 'create_transaction') {
        const { type, amount, category, description } = call.args;
        const newTx = new Transaction({
          type,
          amount,
          category,
          description,
          userId: req.user._id
        });
        await newTx.save();
        return res.json({
          success: true,
          reply: `Successfully logged an ${type} of $${amount} for ${category}.`
        });
      }

      if (call.name === 'create_study_session') {
        const { durationMinutes, topic } = call.args;
        const newSession = new StudySession({
          durationMinutes,
          topic,
          userId: req.user._id
        });
        await newSession.save();
        return res.json({
          success: true,
          reply: `Great job! I logged ${durationMinutes} minutes of study for ${topic}.`
        });
      }
    }

    return res.json({ 
      success: true, 
      reply: response.text()
    });

  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ message: 'An error occurred while processing your request.', error: error.message });
  }
});

// @route   POST api/ai/plan/day
// @desc    Generate a daily plan based on pending tasks
// @access  Private
router.post('/plan/day', auth, async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: 'GEMINI_API_KEY is not configured.' });
    }

    // 1. Get Context (Pending tasks)
    const pendingTodos = await Todo.find({ userId: req.user._id, completed: false }).limit(10);
    
    if (pendingTodos.length === 0) {
      return res.json({ message: "You have no pending tasks to plan today! Relax!" });
    }

    const taskContext = pendingTodos.map(t => `- [${t.priority}] ${t.title} (Due: ${t.dueDate ? t.dueDate.toDateString() : 'None'})`).join('\n');

    // 2. Ask Gemini to generate a structured JSON plan
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const prompt = `You are an AI Daily Planner. Generate a realistic, time-blocked daily schedule for today based on these pending tasks:
    
    ${taskContext}
    
    Return ONLY a JSON array of objects with these exact keys:
    "time" (e.g. "09:00 - 10:00")
    "activity" (the task title)
    "type" (e.g. "Study", "Work", "Break")
    "estimatedDuration" (in minutes)
    "priority" (high/medium/low)
    "reason" (short reason why you scheduled it here)`;

    const result = await model.generateContent(prompt);
    const planItems = JSON.parse(result.response.text());

    // 3. Save the plan to the database
    const newPlan = new StudyPlan({
      userId: req.user._id,
      date: new Date(),
      items: planItems
    });
    await newPlan.save();

    return res.json({ success: true, plan: newPlan });

  } catch (error) {
    console.error('AI Plan Error:', error);
    res.status(500).json({ message: 'Failed to generate plan', error: error.message });
  }
});

module.exports = router;
