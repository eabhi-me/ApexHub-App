import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Send, Bot, User, Sparkles, ArrowRight, Calendar, Clock, Activity, MessageSquare,
  KeyRound, Sliders, Eye, EyeOff, Check, AlertCircle, ExternalLink, Trash2, Zap, CheckCircle2, X, RefreshCw
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../utils/api';

const neo = {
  card: {
    background: '#ffffff',
    boxShadow: 'none',
    border: '1px solid rgba(255,255,255,0.8)',
    borderRadius: '22px',
  },
  inset: {
    background: '#f8fafc',
    boxShadow: 'none',
    borderRadius: '999px',
    border: '1px solid #cbd5e1',
  },
};

const PROVIDER_INFO = {
  gemini: {
    name: 'Google Gemini',
    description: 'Fast multimodal intelligence with generous free tier.',
    defaultModel: 'gemini-1.5-flash',
    models: [
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash (Recommended - Fast & Capable)' },
      { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash (Experimental - Next-Gen)' },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro (Deep Reasoning & Analysis)' },
    ],
    keyPlaceholder: 'AIzaSy...',
    keyUrl: 'https://aistudio.google.com/app/apikey',
    keyUrlLabel: 'Get free Gemini API Key'
  },
  openai: {
    name: 'OpenAI',
    description: 'Industry standard reasoning with GPT-4o & GPT-4o-mini.',
    defaultModel: 'gpt-4o-mini',
    models: [
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini (Recommended - Efficient & Fast)' },
      { id: 'gpt-4o', name: 'GPT-4o (Flagship Model)' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo (Legacy)' },
    ],
    keyPlaceholder: 'sk-...',
    keyUrl: 'https://platform.openai.com/api-keys',
    keyUrlLabel: 'Get OpenAI API Key'
  },
  groq: {
    name: 'Groq',
    description: 'Ultra-low latency open-weight models at near-instant speed.',
    defaultModel: 'llama-3.3-70b-versatile',
    models: [
      { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile (Recommended)' },
      { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant (Blazing Fast)' },
    ],
    keyPlaceholder: 'gsk_...',
    keyUrl: 'https://console.groq.com/keys',
    keyUrlLabel: 'Get free Groq API Key'
  },
  openrouter: {
    name: 'OpenRouter',
    description: 'Unified gateway to 100+ models from Claude, Mistral & Meta.',
    defaultModel: 'google/gemini-2.0-flash-001',
    models: [
      { id: 'google/gemini-2.0-flash-001', name: 'Google Gemini 2.0 Flash (via OpenRouter)' },
      { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B Instruct' },
    ],
    keyPlaceholder: 'sk-or-v1-...',
    keyUrl: 'https://openrouter.ai/keys',
    keyUrlLabel: 'Get OpenRouter API Key'
  }
};

const ApexAI = () => {
  const [viewMode, setViewMode] = useState('chat');

  // AI Configuration State
  const [aiConfig, setAiConfig] = useState({
    mode: 'general', // 'general' | 'byok'
    provider: 'gemini',
    model: 'gemini-1.5-flash',
    customEndpoint: '',
    hasCustomKey: false,
    maskedKey: '',
    generalAvailable: true
  });
  const [isConfigLoading, setIsConfigLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempConfig, setTempConfig] = useState({
    mode: 'general',
    provider: 'gemini',
    model: 'gemini-1.5-flash',
    apiKey: '',
    customEndpoint: '',
    useCustomModel: false,
    customModelName: ''
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  // Chat State
  const [messages, setMessages] = useState([{
    id: 1, 
    role: 'ai',
    content: "Hello! I am Apex AI. I can help you manage your tasks, finances, and study plans. How can I assist you today?",
    meta: { mode: 'general', provider: 'gemini', model: 'gemini-flash' }
  }]);
  const [input, setInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Planner State
  const [dailyPlan, setDailyPlan] = useState(null);
  const [isPlannerLoading, setIsPlannerLoading] = useState(false);

  const suggestedPrompts = [
    "Plan my day",
    "Create a high priority task to finish my DBMS assignment",
    "I studied Operating Systems for 90 minutes",
    "I just spent ₹500 on food",
  ];

  // Load user's AI config on component mount
  useEffect(() => {
    fetchAiConfig();
  }, []);

  const fetchAiConfig = async () => {
    try {
      setIsConfigLoading(true);
      const res = await api.get('/ai/config');
      if (res.data?.config) {
        setAiConfig(res.data.config);
      }
    } catch (err) {
      console.warn('Could not fetch AI config from server, using local fallback:', err);
      // Fallback to local storage if present
      const savedMode = localStorage.getItem('apex_ai_mode') || 'general';
      setAiConfig(prev => ({ ...prev, mode: savedMode }));
    } finally {
      setIsConfigLoading(false);
    }
  };

  useEffect(() => {
    if (viewMode === 'chat') messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, viewMode]);

  // Handle switching between General Method and BYOK
  const handleSwitchMode = async (newMode) => {
    if (newMode === aiConfig.mode) return;

    if (newMode === 'byok' && !aiConfig.hasCustomKey) {
      // User switched to BYOK but has no key yet -> switch and open configuration modal
      setAiConfig(prev => ({ ...prev, mode: 'byok' }));
      localStorage.setItem('apex_ai_mode', 'byok');
      openModalWithMode('byok');
      toast.info('Switched to BYOK Mode. Please configure your API key below.');
      return;
    }

    try {
      const res = await api.post('/ai/config', { mode: newMode });
      if (res.data?.config) {
        setAiConfig(res.data.config);
      } else {
        setAiConfig(prev => ({ ...prev, mode: newMode }));
      }
      localStorage.setItem('apex_ai_mode', newMode);
      toast.success(
        newMode === 'general'
          ? 'Switched to General Method (Apex System AI)'
          : 'Switched to BYOK Mode (Using your API Key)'
      );
    } catch (err) {
      toast.error('Failed to update AI mode on server');
      setAiConfig(prev => ({ ...prev, mode: newMode }));
    }
  };

  // Open settings modal pre-populated with current settings
  const openModalWithMode = (forcedMode) => {
    const currentMode = forcedMode || aiConfig.mode;
    const provider = aiConfig.provider || 'gemini';
    const providerPresetModels = PROVIDER_INFO[provider]?.models.map(m => m.id) || [];
    const isCustomModel = Boolean(aiConfig.model && !providerPresetModels.includes(aiConfig.model));

    setTempConfig({
      mode: currentMode,
      provider: provider,
      model: aiConfig.model || PROVIDER_INFO[provider]?.defaultModel || '',
      apiKey: '',
      customEndpoint: aiConfig.customEndpoint || '',
      useCustomModel: isCustomModel,
      customModelName: isCustomModel ? aiConfig.model : ''
    });
    setShowApiKey(false);
    setTestResult(null);
    setIsModalOpen(true);
  };

  // Handle provider change in settings modal
  const handleTempProviderChange = (newProvider) => {
    const defaultModel = PROVIDER_INFO[newProvider]?.defaultModel || '';
    setTempConfig(prev => ({
      ...prev,
      provider: newProvider,
      model: defaultModel,
      useCustomModel: false,
      customModelName: ''
    }));
    setTestResult(null);
  };

  // Test the key connection
  const handleTestConnection = async () => {
    const effectiveKey = tempConfig.apiKey.trim() || (aiConfig.hasCustomKey ? 'ALREADY_SAVED' : '');
    if (!effectiveKey) {
      toast.warn('Please enter an API key to test');
      return;
    }

    setIsTestingKey(true);
    setTestResult(null);

    try {
      const payload = {
        provider: tempConfig.provider,
        model: tempConfig.useCustomModel ? tempConfig.customModelName.trim() : tempConfig.model,
        customEndpoint: tempConfig.customEndpoint.trim()
      };
      // If user entered a new key, pass it; otherwise server will use existing saved key
      if (tempConfig.apiKey.trim()) {
        payload.apiKey = tempConfig.apiKey.trim();
      }

      const res = await api.post('/ai/test', payload);
      setTestResult({
        success: true,
        message: res.data.message || 'Connected successfully!'
      });
      toast.success('Connection verified successfully! 🎉');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Connection test failed';
      setTestResult({
        success: false,
        message: msg
      });
      toast.error('Connection test failed');
    } finally {
      setIsTestingKey(false);
    }
  };

  // Clear saved key
  const handleClearKey = async () => {
    if (!window.confirm('Are you sure you want to remove your saved API key?')) return;
    try {
      const res = await api.post('/ai/config', { clearKey: true });
      if (res.data?.config) {
        setAiConfig(res.data.config);
      }
      setTempConfig(prev => ({ ...prev, apiKey: '' }));
      setTestResult(null);
      toast.info('Saved API key removed');
    } catch (err) {
      toast.error('Failed to clear key');
    }
  };

  // Save modal settings
  const handleSaveConfig = async () => {
    setIsSavingConfig(true);
    try {
      const effectiveModel = tempConfig.useCustomModel
        ? tempConfig.customModelName.trim()
        : tempConfig.model;

      const payload = {
        mode: tempConfig.mode,
        provider: tempConfig.provider,
        model: effectiveModel,
        customEndpoint: tempConfig.customEndpoint.trim()
      };

      if (tempConfig.apiKey.trim()) {
        payload.apiKey = tempConfig.apiKey.trim();
      }

      const res = await api.post('/ai/config', payload);
      if (res.data?.config) {
        setAiConfig(res.data.config);
      } else {
        setAiConfig(prev => ({
          ...prev,
          mode: tempConfig.mode,
          provider: tempConfig.provider,
          model: effectiveModel,
          customEndpoint: tempConfig.customEndpoint.trim(),
          hasCustomKey: Boolean(tempConfig.apiKey.trim() || prev.hasCustomKey)
        }));
      }

      localStorage.setItem('apex_ai_mode', tempConfig.mode);
      toast.success('AI configuration saved!');
      setIsModalOpen(false);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save configuration';
      toast.error(msg);
    } finally {
      setIsSavingConfig(false);
    }
  };

  // Chat handling
  const handleSendChat = async (text) => {
    if (!text.trim()) return;

    if (text.toLowerCase().includes('plan my day') || text.toLowerCase().includes('plan my schedule')) {
      setViewMode('planner');
      generateDailyPlan();
      return;
    }

    const userMsg = { id: Date.now(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsChatLoading(true);

    try {
      const res = await api.post('/ai/chat', { 
        message: text,
        mode: aiConfig.mode 
      });
      const data = res.data;
      setMessages(prev => [
        ...prev, 
        { 
          id: Date.now(), 
          role: 'ai', 
          content: data.reply,
          meta: data.meta || { mode: aiConfig.mode, provider: aiConfig.provider, model: aiConfig.model }
        }
      ]);
      if (data.success && data.reply && data.reply.includes('successfully')) toast.success('Action completed!');
    } catch (error) {
      const data = error.response?.data || {};
      const errorMessage = data.message || 'Failed to process request';
      toast.error(errorMessage);

      const requiresConfig = data.requiresConfig || data.code === 'BYOK_KEY_MISSING';
      setMessages(prev => [
        ...prev, 
        { 
          id: Date.now(), 
          role: 'ai', 
          content: `Error: ${errorMessage}`,
          isError: true,
          requiresConfig
        }
      ]);

      if (requiresConfig) {
        openModalWithMode('byok');
      }
    } finally {
      setIsChatLoading(false);
    }
  };

  // Daily plan generation
  const generateDailyPlan = async () => {
    setIsPlannerLoading(true);
    try {
      const res = await api.post('/ai/plan/day', { mode: aiConfig.mode });
      const data = res.data;
      if (data.plan) { 
        setDailyPlan(data.plan); 
        toast.success('Daily plan generated!'); 
      } else {
        toast.info(data.message || 'Nothing to plan today.');
      }
    } catch (error) {
      const data = error.response?.data || {};
      toast.error(data.message || 'Failed to generate plan');
      if (data.requiresConfig || data.code === 'BYOK_KEY_MISSING') {
        openModalWithMode('byok');
      }
    } finally {
      setIsPlannerLoading(false);
    }
  };

  return (
    <div
      className="flex flex-col max-w-5xl mx-auto overflow-hidden relative"
      style={{
        height: 'calc(100vh - 8rem)',
        minHeight: '620px',
        background: '#ffffff',
        borderRadius: '28px',
        boxShadow: 'none',
        border: '1px solid rgba(255,255,255,0.85)',
      }}
    >

      {/* ── HEADER ── */}
      <div
        className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 sm:p-6 relative overflow-hidden"
        style={{
          background: '#0f1223',
          borderRadius: '28px 28px 0 0',
        }}
      >
        {/* Glow orbs */}
        <div className="absolute -top-20 -left-20 w-52 h-52 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)' }} />

        <div className="relative z-10 flex items-center gap-4">
          <div
            className="h-12 w-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{
              background: '#6366f1',
              boxShadow: 'none',
              animation: 'pulse 3s ease-in-out infinite',
            }}
          >
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white tracking-tight">Apex AI</h2>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                {aiConfig.mode === 'byok' ? 'BYOK Mode' : 'General Mode'}
              </span>
            </div>
            <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-[0.2em]">Intelligence Layer</p>
          </div>
        </div>

        {/* View Mode Toggle (Assistant vs Planner) */}
        <div
          className="relative z-10 flex p-1.5 gap-1"
          style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          {[
            { mode: 'chat',    Icon: MessageSquare, label: 'Assistant' },
            { mode: 'planner', Icon: Calendar,      label: 'Planner' },
          ].map(({ mode, Icon, label }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className="flex items-center gap-2 px-5 py-2 rounded-2xl text-sm font-bold transition-all duration-300"
              style={viewMode === mode ? {
                background: '#6366f1',
                color: 'white',
                boxShadow: 'none',
              } : {
                color: 'rgba(165,180,252,0.8)',
                background: 'transparent',
              }}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── AI ENGINE SWITCHER & STATUS BAR ── */}
      <div className="bg-slate-50 border-b border-slate-200/90 px-5 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Left: Quick Switcher Between General Method & BYOK */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
            <Zap className="h-3 w-3 text-amber-500" />
            AI Method:
          </span>

          <div className="inline-flex p-1 bg-slate-200/70 rounded-xl border border-slate-300/50">
            {/* General Method Button */}
            <button
              onClick={() => handleSwitchMode('general')}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all duration-200 ${
                aiConfig.mode === 'general'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Use built-in platform AI with server key"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>General Method</span>
            </button>

            {/* BYOK Button */}
            <button
              onClick={() => handleSwitchMode('byok')}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all duration-200 ${
                aiConfig.mode === 'byok'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Bring Your Own Key (Gemini, OpenAI, Groq, OpenRouter)"
            >
              <KeyRound className="h-3.5 w-3.5 text-indigo-600" />
              <span>BYOK</span>
            </button>
          </div>
        </div>

        {/* Right: Status Pill & Configuration Button */}
        <div className="flex items-center gap-2">
          {isConfigLoading ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-500 font-semibold text-[11px]">
              <RefreshCw className="h-3 w-3 animate-spin" />
              Loading configuration...
            </span>
          ) : aiConfig.mode === 'general' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-semibold text-[11px]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Managed Gemini (System Key)
            </span>
          ) : (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold text-[11px] border ${
              aiConfig.hasCustomKey
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${aiConfig.hasCustomKey ? 'bg-indigo-500' : 'bg-amber-500'}`} />
              {aiConfig.hasCustomKey
                ? `${(aiConfig.provider || 'gemini').toUpperCase()} (${aiConfig.model || 'Default'}) · ${aiConfig.maskedKey || 'Key Active'}`
                : 'Custom Key Missing'}
            </span>
          )}

          <button
            onClick={() => openModalWithMode()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 hover:text-indigo-600 font-bold transition-colors shadow-sm"
            title="Configure BYOK and AI Providers"
          >
            <Sliders className="h-3.5 w-3.5 text-slate-500" />
            <span>AI Settings</span>
          </button>
        </div>
      </div>

      {/* ── WARNING BANNER IF BYOK ACTIVE WITHOUT KEY ── */}
      {aiConfig.mode === 'byok' && !aiConfig.hasCustomKey && (
        <div className="bg-amber-50 border-b border-amber-200 px-5 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-amber-900 animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
            <span>
              <strong>BYOK Mode is active:</strong> You haven't added an API key yet. Add your personal key or switch back to General Method.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSwitchMode('general')}
              className="px-2.5 py-1 bg-white hover:bg-amber-100/60 border border-amber-300 rounded-lg font-bold text-amber-900 transition-colors"
            >
              Switch to General
            </button>
            <button
              onClick={() => openModalWithMode('byok')}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold transition-colors shadow-sm"
            >
              Add API Key
            </button>
          </div>
        </div>
      )}

      {/* ── CHAT MODE ── */}
      {viewMode === 'chat' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>

                  {/* Avatar */}
                  <div
                    className="flex-shrink-0 h-9 w-9 rounded-2xl flex items-center justify-center"
                    style={msg.role === 'user' ? {
                      background: '#ffffff',
                      boxShadow: 'none',
                      border: '1px solid rgba(255,255,255,0.7)',
                    } : {
                      background: msg.isError ? '#ef4444' : '#6366f1',
                      boxShadow: 'none',
                    }}
                  >
                    {msg.role === 'user'
                      ? <User className="h-4 w-4 text-slate-500" />
                      : <Bot className="h-4 w-4 text-white" />
                    }
                  </div>

                  {/* Bubble */}
                  <div
                    className="px-5 py-3.5"
                    style={msg.role === 'user' ? {
                      background: '#1e1b4b',
                      borderRadius: '20px 6px 20px 20px',
                      color: 'white',
                      boxShadow: 'none',
                    } : {
                      background: msg.isError ? '#fef2f2' : '#ffffff',
                      boxShadow: 'none',
                      border: msg.isError ? '1px solid #fecaca' : '1px solid rgba(255,255,255,0.75)',
                      borderRadius: '6px 20px 20px 20px',
                      color: msg.isError ? '#991b1b' : '#374151',
                    }}
                  >
                    <p className="whitespace-pre-wrap text-sm leading-relaxed font-medium">{msg.content}</p>

                    {/* Quick action buttons if error is related to missing key */}
                    {msg.requiresConfig && (
                      <div className="mt-3 pt-2.5 border-t border-red-200/80 flex items-center gap-2">
                        <button
                          onClick={() => openModalWithMode('byok')}
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors"
                        >
                          Configure BYOK Key
                        </button>
                        <button
                          onClick={() => handleSwitchMode('general')}
                          className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                        >
                          Switch to General Method
                        </button>
                      </div>
                    )}

                    {/* Metadata badge on AI reply */}
                    {msg.role === 'ai' && msg.meta && !msg.isError && (
                      <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
                        {msg.meta.mode === 'byok' ? (
                          <>
                            <KeyRound className="h-3 w-3 text-indigo-500" />
                            <span>BYOK ({msg.meta.provider || 'Custom'}{msg.meta.model ? ` · ${msg.meta.model}` : ''})</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-3 w-3 text-amber-500" />
                            <span>General Method (Apex Managed)</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isChatLoading && (
              <div className="flex justify-start">
                <div className="flex gap-3">
                  <div
                    className="h-9 w-9 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: '#6366f1', boxShadow: 'none' }}
                  >
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div
                    className="px-5 py-4 flex items-center gap-2"
                    style={{ background: '#ffffff', boxShadow: 'none', border: '1px solid rgba(255,255,255,0.75)', borderRadius: '6px 20px 20px 20px' }}
                  >
                    {[0, 150, 300].map(delay => (
                      <div key={delay} className="h-2 w-2 rounded-full animate-bounce"
                        style={{ background: `hsl(${240 + delay / 5}, 70%, 65%)`, animationDelay: `${delay}ms` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Prompts */}
          {messages.length === 1 && (
            <div className="px-5 py-3" style={{ borderTop: '1px solid rgba(174,180,200,0.35)' }}>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">Quick Actions</p>
              <div className="flex flex-wrap gap-2">
                {suggestedPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendChat(prompt)}
                    className="text-xs font-bold text-slate-600 flex items-center gap-1.5 px-4 py-2 rounded-2xl hover:text-indigo-700 transition-colors"
                    style={{ background: '#ffffff', boxShadow: 'none', border: '1px solid rgba(255,255,255,0.7)' }}
                  >
                    <span>{prompt}</span>
                    <ArrowRight className="h-3 w-3 opacity-50" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-5" style={{ borderTop: '1px solid rgba(174,180,200,0.35)' }}>
            <form onSubmit={e => { e.preventDefault(); handleSendChat(input); }} className="flex items-center gap-3">
              <input
                type="text" value={input} onChange={e => setInput(e.target.value)}
                placeholder={aiConfig.mode === 'byok' && !aiConfig.hasCustomKey ? "Configure your API key to chat..." : "Message Apex AI..."}
                disabled={isChatLoading}
                className="flex-1 px-5 py-3.5 text-sm font-medium"
                style={neo.inset}
              />
              <button
                type="submit"
                disabled={isChatLoading || !input.trim()}
                className="h-12 w-12 rounded-2xl flex items-center justify-center text-white flex-shrink-0"
                style={isChatLoading || !input.trim() ? {
                  background: '#d1d5db',
                  boxShadow: 'none',
                  cursor: 'not-allowed',
                } : {
                  background: '#6366f1',
                  boxShadow: 'none',
                }}
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── PLANNER MODE ── */}
      {viewMode === 'planner' && (
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {!dailyPlan && !isPlannerLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-7">
              <div
                className="h-28 w-28 rounded-3xl flex items-center justify-center"
                style={{
                  background: '#ffffff',
                  boxShadow: 'none',
                  border: '1px solid rgba(255,255,255,0.8)',
                }}
              >
                <Calendar className="h-12 w-12 text-indigo-600" />
              </div>
              <div className="max-w-md">
                <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">AI Daily Planner</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed mb-7">
                  Let Apex synthesize your pending tasks and deadlines into an optimized, time-blocked schedule.
                </p>
                <button
                  onClick={generateDailyPlan}
                  className="px-8 py-4 rounded-2xl text-white font-bold text-sm flex items-center gap-3 mx-auto"
                  style={{
                    background: '#6366f1',
                    boxShadow: 'none',
                  }}
                >
                  <Sparkles className="h-5 w-5" />
                  Generate My Schedule
                </button>
              </div>
            </div>

          ) : isPlannerLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-6">
              <div
                className="relative h-24 w-24 rounded-full"
                style={{ background: '#ffffff', boxShadow: 'none' }}
              >
                <div className="absolute inset-2 rounded-full border-4 border-transparent animate-spin"
                  style={{ borderTopColor: '#6366f1' }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Bot className="h-7 w-7 text-indigo-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-700">Synthesizing Data</h3>
                <p className="text-sm text-slate-400 font-medium mt-1">
                  Using {aiConfig.mode === 'byok' ? `BYOK (${(aiConfig.provider || 'Gemini').toUpperCase()})` : 'General Method'}...
                </p>
              </div>
            </div>

          ) : (
            <div className="max-w-3xl mx-auto pb-8">
              {/* Planner header */}
              <div style={neo.card} className="p-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-black text-slate-800">Today's Schedule</h3>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                      {aiConfig.mode === 'byok' ? `BYOK · ${(aiConfig.provider || '').toUpperCase()}` : 'General Method'}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-indigo-600">
                    {new Date(dailyPlan.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <button
                  onClick={generateDailyPlan}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold text-slate-600"
                  style={{ background: '#ffffff', boxShadow: 'none', border: '1px solid rgba(255,255,255,0.7)' }}
                >
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  Regenerate
                </button>
              </div>

              {/* Timeline */}
              <div className="relative pl-6 sm:pl-10">
                <div
                  className="absolute left-[2.8rem] sm:left-[3.7rem] top-4 bottom-4 w-0.5"
                  style={{ background: '#6366f1', boxShadow: '0 0 8px rgba(99,102,241,0.3)' }}
                />

                <div className="space-y-6">
                  {dailyPlan.items.map((item, idx) => {
                    const typeColor = item.type?.toLowerCase().includes('study')
                      ? { bg: '#ede9fe', text: '#7c3aed' }
                      : item.type?.toLowerCase().includes('break')
                        ? { bg: '#d1fae5', text: '#059669' }
                        : { bg: '#dbeafe', text: '#1d4ed8' };

                    const prioStyle = item.priority === 'high'
                      ? { bg: '#ffe4e6', accent: '#f43f5e' }
                      : item.priority === 'medium'
                        ? { bg: '#fef3c7', accent: '#d97706' }
                        : { bg: '#d1fae5', accent: '#10b981' };

                    return (
                      <div key={idx} className="relative flex items-start gap-6"
                        style={{ animation: `fadeIn 0.4s ease-out ${idx * 80}ms both` }}>

                        {/* Time node */}
                        <div
                          className="flex-shrink-0 h-16 w-16 rounded-2xl flex flex-col items-center justify-center z-10"
                          style={{
                            background: prioStyle.bg,
                            boxShadow: 'none',
                            border: `2px solid ${prioStyle.accent}40`,
                          }}
                        >
                          <span className="text-[11px] font-black text-slate-700">{item.time?.split(' - ')[0]}</span>
                        </div>

                        {/* Content card */}
                        <div
                          style={{
                            flex: 1,
                            background: '#ffffff',
                            borderRadius: '20px',
                            boxShadow: 'none',
                            border: '1px solid rgba(255,255,255,0.8)',
                            padding: '1.25rem 1.5rem',
                          }}
                        >
                          <div className="flex justify-between items-start gap-3 mb-2">
                            <h4 className="text-base font-bold text-slate-800">{item.activity}</h4>
                            <span className="flex-shrink-0 text-[10px] font-black uppercase px-2.5 py-1.5 rounded-xl"
                              style={{ background: typeColor.bg, color: typeColor.text }}>{item.type}</span>
                          </div>
                          <p className="text-sm text-slate-500 font-medium mb-4 leading-relaxed">{item.reason}</p>
                          <div className="flex items-center gap-3">
                            <span
                              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl"
                              style={{ background: '#ffffff', boxShadow: 'none', color: '#6b7280' }}
                            >
                              <Clock className="h-3.5 w-3.5" />
                              {item.estimatedDuration}m
                            </span>
                            <span
                              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl capitalize"
                              style={{ background: prioStyle.bg, color: prioStyle.accent }}
                            >
                              <Activity className="h-3.5 w-3.5" />
                              {item.priority} Priority
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── BYOK & AI CONFIGURATION MODAL ── */}
      {isModalOpen && createPortal(
        <div
          className="modal-backdrop"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="modal-card max-w-xl max-h-[90vh] flex flex-col overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                  <Sliders className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight">AI Engine & BYOK Settings</h3>
                  <p className="text-xs text-indigo-200">Choose between General Method and your own API Key</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">

              {/* 1. Operating Mode Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Operating Mode
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                  {/* General Method Option Card */}
                  <div
                    onClick={() => setTempConfig(prev => ({ ...prev, mode: 'general' }))}
                    className={`p-4 rounded-2xl cursor-pointer border-2 transition-all ${
                      tempConfig.mode === 'general'
                        ? 'border-indigo-600 bg-indigo-50/40 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${tempConfig.mode === 'general' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                          <Sparkles className="h-4 w-4" />
                        </div>
                        <span className="font-bold text-sm text-slate-800">General Method</span>
                      </div>
                      {tempConfig.mode === 'general' && (
                        <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Zero configuration. Uses ApexHub's managed AI server key. Ready immediately.
                    </p>
                    <div className="mt-3 flex items-center gap-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                        Platform Ready
                      </span>
                    </div>
                  </div>

                  {/* BYOK Option Card */}
                  <div
                    onClick={() => setTempConfig(prev => ({ ...prev, mode: 'byok' }))}
                    className={`p-4 rounded-2xl cursor-pointer border-2 transition-all ${
                      tempConfig.mode === 'byok'
                        ? 'border-indigo-600 bg-indigo-50/40 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${tempConfig.mode === 'byok' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                          <KeyRound className="h-4 w-4" />
                        </div>
                        <span className="font-bold text-sm text-slate-800">BYOK (Bring Your Own Key)</span>
                      </div>
                      {tempConfig.mode === 'byok' && (
                        <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Use your own API key for Gemini, OpenAI, Groq, or OpenRouter with full privacy and custom models.
                    </p>
                    <div className="mt-3 flex items-center gap-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                        Personal API Key
                      </span>
                    </div>
                  </div>

                </div>
              </div>

              {/* BYOK Specific Settings */}
              {tempConfig.mode === 'byok' && (
                <div className="space-y-5 pt-3 border-t border-slate-100">

                  {/* 2. Provider Selection */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Choose AI Provider
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {Object.entries(PROVIDER_INFO).map(([key, provider]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => handleTempProviderChange(key)}
                          className={`p-3 rounded-xl border-2 text-left transition-all ${
                            tempConfig.provider === key
                              ? 'border-indigo-600 bg-indigo-50/50'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="font-bold text-xs text-slate-800">{provider.name}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5 truncate">{key === 'gemini' ? 'Free tier' : key === 'groq' ? 'Ultra fast' : 'Full power'}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3. API Key Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        {PROVIDER_INFO[tempConfig.provider]?.name} API Key
                      </label>
                      <a
                        href={PROVIDER_INFO[tempConfig.provider]?.keyUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                      >
                        <span>{PROVIDER_INFO[tempConfig.provider]?.keyUrlLabel}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>

                    <div className="relative">
                      <input
                        type={showApiKey ? 'text' : 'password'}
                        value={tempConfig.apiKey}
                        onChange={e => setTempConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                        placeholder={
                          aiConfig.hasCustomKey && tempConfig.provider === aiConfig.provider
                            ? `Key saved (${aiConfig.maskedKey}) · Type to replace`
                            : `Paste your key here (e.g. ${PROVIDER_INFO[tempConfig.provider]?.keyPlaceholder})`
                        }
                        className="w-full px-4 py-2.5 pr-11 text-sm font-mono border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/60"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      >
                        {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>

                    {/* Saved key status & Clear button */}
                    {aiConfig.hasCustomKey && (
                      <div className="mt-2 flex items-center justify-between text-xs text-slate-500 bg-slate-100/70 p-2 rounded-xl">
                        <div className="flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Currently saved key: <strong className="font-mono text-slate-700">{aiConfig.maskedKey}</strong></span>
                        </div>
                        <button
                          type="button"
                          onClick={handleClearKey}
                          className="text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 px-2 py-0.5 rounded-lg hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Remove</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 4. Model Selection */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Model
                      </label>
                      <button
                        type="button"
                        onClick={() => setTempConfig(prev => ({ ...prev, useCustomModel: !prev.useCustomModel }))}
                        className="text-xs font-bold text-slate-500 hover:text-indigo-600"
                      >
                        {tempConfig.useCustomModel ? 'Choose from presets' : '+ Use custom model name'}
                      </button>
                    </div>

                    {!tempConfig.useCustomModel ? (
                      <select
                        value={tempConfig.model}
                        onChange={e => setTempConfig(prev => ({ ...prev, model: e.target.value }))}
                        className="w-full px-3.5 py-2.5 text-sm font-medium border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      >
                        {PROVIDER_INFO[tempConfig.provider]?.models.map(m => (
                          <option key={m.id} value={m.id}>
                            {m.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={tempConfig.customModelName}
                        onChange={e => setTempConfig(prev => ({ ...prev, customModelName: e.target.value }))}
                        placeholder="e.g. gemini-1.5-pro, gpt-4o, etc."
                        className="w-full px-4 py-2.5 text-sm font-mono border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      />
                    )}
                  </div>

                  {/* 5. Custom Endpoint (Optional) */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Custom Base URL / Endpoint <span className="font-normal text-slate-400 normal-case">(optional for proxies/custom servers)</span>
                    </label>
                    <input
                      type="text"
                      value={tempConfig.customEndpoint}
                      onChange={e => setTempConfig(prev => ({ ...prev, customEndpoint: e.target.value }))}
                      placeholder="e.g. https://api.openai.com/v1"
                      className="w-full px-4 py-2 text-xs font-mono border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                  </div>

                  {/* 6. Real-time Connection Test */}
                  <div>
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={handleTestConnection}
                        disabled={isTestingKey}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 flex items-center gap-2 transition-colors disabled:opacity-50"
                      >
                        {isTestingKey ? (
                          <>
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            <span>Testing Connection...</span>
                          </>
                        ) : (
                          <>
                            <Zap className="h-3.5 w-3.5 text-indigo-600" />
                            <span>Test API Key Connection</span>
                          </>
                        )}
                      </button>
                    </div>

                    {testResult && (
                      <div className={`mt-2.5 p-3 rounded-xl text-xs flex items-start gap-2 ${
                        testResult.success
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}>
                        {testResult.success ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0 mt-0.5" />
                        )}
                        <span className="leading-relaxed">{testResult.message}</span>
                      </div>
                    )}
                  </div>

                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveConfig}
                disabled={isSavingConfig}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {isSavingConfig ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Save & Apply Settings</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default ApexAI;
