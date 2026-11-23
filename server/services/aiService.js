const { GoogleGenerativeAI } = require('@google/generative-ai');

// Function declarations for Google Gemini
const geminiTools = [
  {
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
  },
  {
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
  },
  {
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
  }
];

// Tool definitions for OpenAI / Groq / OpenRouter
const openAiTools = [
  {
    type: "function",
    function: {
      name: "create_task",
      description: "Creates a new task or reminder for the user. Use this when the user asks to add or create a task, todo, or assignment.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "The name or title of the task" },
          priority: { type: "string", enum: ["low", "medium", "high"], description: "The priority of the task." },
          dueDate: { type: "string", description: "An ISO 8601 date string for when the task is due, e.g. 2026-09-28T18:00:00Z" }
        },
        required: ["title"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_transaction",
      description: "Logs a new financial transaction (income or expense). Use this when the user says they spent money, bought something, or got paid.",
      parameters: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["income", "expense"], description: "Either 'income' or 'expense'" },
          amount: { type: "number", description: "The amount of money" },
          category: { type: "string", description: "Category of transaction (e.g., Food, Salary, Bills, Shopping)" },
          description: { type: "string", description: "A short description of the transaction" }
        },
        required: ["type", "amount", "category"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_study_session",
      description: "Logs a study session or pomodoro. Use this when the user says they studied, read, or practiced something for a certain amount of time.",
      parameters: {
        type: "object",
        properties: {
          durationMinutes: { type: "number", description: "Duration in minutes" },
          topic: { type: "string", description: "The topic or subject studied" }
        },
        required: ["durationMinutes", "topic"]
      }
    }
  }
];

function getDefaultModel(provider) {
  switch (provider) {
    case 'gemini':
      return 'gemini-1.5-flash';
    case 'openai':
      return 'gpt-4o-mini';
    case 'groq':
      return 'llama-3.3-70b-versatile';
    case 'openrouter':
      return 'google/gemini-2.0-flash-001';
    default:
      return 'gemini-1.5-flash';
  }
}

function getProviderBaseUrl(provider, customEndpoint) {
  if (customEndpoint && customEndpoint.trim()) {
    return customEndpoint.trim().replace(/\/+$/, '');
  }
  switch (provider) {
    case 'groq':
      return 'https://api.groq.com/openai/v1';
    case 'openrouter':
      return 'https://openrouter.ai/api/v1';
    case 'openai':
    default:
      return 'https://api.openai.com/v1';
  }
}

/**
 * Execute chat request with function calling / tools
 */
async function executeChat({ provider, apiKey, model, customEndpoint, message }) {
  const chosenModel = model || getDefaultModel(provider);

  if (provider === 'gemini') {
    const genAI = new GoogleGenerativeAI(apiKey);
    const genModel = genAI.getGenerativeModel({
      model: chosenModel,
      tools: [{ functionDeclarations: geminiTools }]
    });

    const prompt = `You are ApexHub AI, a helpful personal productivity assistant.
You manage the user's tasks, finances, and studies.
Always invoke the provided tools if the user is asking to perform an action (e.g. creating a task, logging money spent/earned, or logging a study session).
User's message: "${message}"`;

    const result = await genModel.generateContent(prompt);
    const response = await result.response;
    const rawCalls = (typeof response.functionCalls === 'function' ? response.functionCalls() : []) || [];
    const functionCalls = rawCalls.map(call => ({
      name: call.name,
      args: call.args || {}
    }));

    let reply = '';
    try {
      reply = response.text ? response.text() : '';
    } catch (e) {
      // response.text() might throw if function calls exist and no text was output
      reply = '';
    }

    return { reply, functionCalls };
  }

  // OpenAI-compatible providers: OpenAI, Groq, OpenRouter
  const baseUrl = getProviderBaseUrl(provider, customEndpoint);
  const url = `${baseUrl}/chat/completions`;

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  };
  if (provider === 'openrouter') {
    headers['HTTP-Referer'] = 'https://apexhub.app';
    headers['X-Title'] = 'ApexHub AI';
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: chosenModel,
      messages: [
        {
          role: 'system',
          content: `You are ApexHub AI, a helpful personal productivity assistant. You manage the user's tasks, finances, and studies. Always invoke the provided tools if the user asks to add/create a task, log an expense or income, or log a study session.`
        },
        {
          role: 'user',
          content: message
        }
      ],
      tools: openAiTools,
      tool_choice: 'auto'
    })
  });

  if (!res.ok) {
    let errMessage = `AI provider (${provider}) returned status ${res.status}`;
    try {
      const errJson = await res.json();
      errMessage = errJson.error?.message || errJson.message || errMessage;
    } catch (_) {
      const errText = await res.text();
      if (errText) errMessage = `${errMessage}: ${errText.slice(0, 200)}`;
    }
    throw new Error(errMessage);
  }

  const data = await res.json();
  const choice = data.choices?.[0];
  const toolCalls = choice?.message?.tool_calls || [];

  const functionCalls = toolCalls.map(tc => {
    let args = {};
    try {
      args = typeof tc.function?.arguments === 'string' ? JSON.parse(tc.function.arguments) : (tc.function?.arguments || {});
    } catch (e) {
      args = {};
    }
    return {
      name: tc.function?.name,
      args
    };
  });

  return {
    reply: choice?.message?.content || '',
    functionCalls
  };
}

/**
 * Execute daily planner structured JSON schedule
 */
async function executeDailyPlan({ provider, apiKey, model, customEndpoint, taskContext }) {
  const chosenModel = model || getDefaultModel(provider);

  const prompt = `You are an AI Daily Planner. Generate a realistic, time-blocked daily schedule for today based on these pending tasks:

${taskContext}

Return ONLY a JSON array of objects with these exact keys:
"time" (e.g. "09:00 - 10:00")
"activity" (the task title)
"type" (e.g. "Study", "Work", "Break")
"estimatedDuration" (in minutes)
"priority" (high/medium/low)
"reason" (short reason why you scheduled it here)`;

  if (provider === 'gemini') {
    const genAI = new GoogleGenerativeAI(apiKey);
    const genModel = genAI.getGenerativeModel({
      model: chosenModel,
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const result = await genModel.generateContent(prompt);
    const text = result.response.text();
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : (parsed.items || parsed.schedule || []);
  }

  // OpenAI-compatible
  const baseUrl = getProviderBaseUrl(provider, customEndpoint);
  const url = `${baseUrl}/chat/completions`;

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  };
  if (provider === 'openrouter') {
    headers['HTTP-Referer'] = 'https://apexhub.app';
    headers['X-Title'] = 'ApexHub AI';
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: chosenModel,
      messages: [
        {
          role: 'system',
          content: 'You are an AI Daily Planner that outputs only valid JSON arrays according to user specifications.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    })
  });

  if (!res.ok) {
    let errMessage = `AI provider (${provider}) returned status ${res.status}`;
    try {
      const errJson = await res.json();
      errMessage = errJson.error?.message || errJson.message || errMessage;
    } catch (_) {}
    throw new Error(errMessage);
  }

  const data = await res.json();
  const rawContent = data.choices?.[0]?.message?.content || '[]';
  let parsed;
  try {
    parsed = JSON.parse(rawContent);
  } catch (e) {
    const jsonMatch = rawContent.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error("Could not parse JSON schedule from AI output");
    }
  }

  if (Array.isArray(parsed)) return parsed;
  if (parsed.items && Array.isArray(parsed.items)) return parsed.items;
  if (parsed.schedule && Array.isArray(parsed.schedule)) return parsed.schedule;
  if (parsed.plan && Array.isArray(parsed.plan)) return parsed.plan;
  return [];
}

/**
 * Test API key / provider connection
 */
async function testConnection({ provider, apiKey, model, customEndpoint }) {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('API Key is required to test connection');
  }

  const chosenModel = model || getDefaultModel(provider);

  if (provider === 'gemini') {
    const genAI = new GoogleGenerativeAI(apiKey.trim());
    const genModel = genAI.getGenerativeModel({ model: chosenModel });
    const result = await genModel.generateContent("Reply with 'OK'");
    const text = result.response.text();
    return { success: true, message: `Connected to Google Gemini (${chosenModel}) successfully! Response: ${text.trim()}` };
  }

  const baseUrl = getProviderBaseUrl(provider, customEndpoint);
  const url = `${baseUrl}/chat/completions`;

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey.trim()}`
  };
  if (provider === 'openrouter') {
    headers['HTTP-Referer'] = 'https://apexhub.app';
    headers['X-Title'] = 'ApexHub AI';
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: chosenModel,
      messages: [{ role: 'user', content: "Reply with 'OK'" }],
      max_tokens: 10
    })
  });

  if (!res.ok) {
    let errDetail = `Status ${res.status}`;
    try {
      const errJson = await res.json();
      errDetail = errJson.error?.message || errJson.message || errDetail;
    } catch (_) {
      const text = await res.text();
      if (text) errDetail = text.slice(0, 150);
    }
    throw new Error(`${provider.toUpperCase()} connection failed: ${errDetail}`);
  }

  const data = await res.json();
  const reply = data.choices?.[0]?.message?.content || 'OK';
  return { success: true, message: `Connected to ${provider.toUpperCase()} (${chosenModel}) successfully! Response: ${reply.trim()}` };
}

module.exports = {
  executeChat,
  executeDailyPlan,
  testConnection,
  getDefaultModel,
  geminiTools,
  openAiTools
};
