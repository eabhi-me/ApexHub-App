import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, ArrowRight, Calendar, Clock, Activity, MessageSquare } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../utils/api';

const neo = {
  card: {
    background: '#eef0f5',
    boxShadow: '8px 8px 20px rgba(174,180,200,0.6), -8px -8px 20px rgba(255,255,255,0.85)',
    border: '1px solid rgba(255,255,255,0.8)',
    borderRadius: '22px',
  },
  inset: {
    background: '#e4e6ef',
    boxShadow: 'inset 3px 3px 7px rgba(174,180,200,0.5), inset -3px -3px 7px rgba(255,255,255,0.8)',
    borderRadius: '999px',
    border: '1px solid rgba(255,255,255,0.4)',
  },
};

const ApexAI = () => {
  const [viewMode, setViewMode] = useState('chat');

  const [messages, setMessages] = useState([{
    id: 1, role: 'ai',
    content: "Hello! I am Apex AI. I can help you manage your tasks, finances, and study plans. How can I assist you today?"
  }]);
  const [input, setInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const [dailyPlan, setDailyPlan] = useState(null);
  const [isPlannerLoading, setIsPlannerLoading] = useState(false);

  const suggestedPrompts = [
    "Plan my day",
    "Create a high priority task to finish my DBMS assignment",
    "I studied Operating Systems for 90 minutes",
    "I just spent ₹500 on food",
  ];

  useEffect(() => {
    if (viewMode === 'chat') messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, viewMode]);

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
      const res = await api.post('/ai/chat', { message: text });
      const data = res.data;
      setMessages(prev => [...prev, { id: Date.now(), role: 'ai', content: data.reply }]);
      if (data.success && data.reply.includes('successfully')) toast.success('Action completed!');
    } catch (error) {
      const data = error.response?.data || {};
      toast.error(data.message || 'Failed to process request');
      setMessages(prev => [...prev, { id: Date.now(), role: 'ai', content: `Error: ${data.message || 'Failed to process'}` }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const generateDailyPlan = async () => {
    setIsPlannerLoading(true);
    try {
      const res = await api.post('/ai/plan/day');
      const data = res.data;
      if (data.plan) { setDailyPlan(data.plan); toast.success('Daily plan generated!'); }
      else toast.info(data.message || 'Nothing to plan today.');
    } catch (error) {
      const data = error.response?.data || {};
      toast.error(data.message || 'Failed to generate plan');
    } finally {
      setIsPlannerLoading(false);
    }
  };

  return (
    <div
      className="flex flex-col max-w-5xl mx-auto overflow-hidden"
      style={{
        height: 'calc(100vh - 8rem)',
        minHeight: '600px',
        background: '#eef0f5',
        borderRadius: '28px',
        boxShadow: '12px 12px 30px rgba(174,180,200,0.6), -12px -12px 30px rgba(255,255,255,0.9)',
        border: '1px solid rgba(255,255,255,0.85)',
      }}
    >

      {/* ── HEADER ── */}
      <div
        className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0f1223 0%, #1a1f45 60%, #0e1535 100%)',
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
            className="h-12 w-12 rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              boxShadow: '4px 4px 12px rgba(99,102,241,0.5)',
              animation: 'pulse 3s ease-in-out infinite',
            }}
          >
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">Apex AI</h2>
            <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-[0.2em]">Intelligence Layer</p>
          </div>
        </div>

        {/* Mode Toggle */}
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
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300"
              style={viewMode === mode ? {
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: 'white',
                boxShadow: '3px 3px 10px rgba(99,102,241,0.4)',
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
                      background: '#eef0f5',
                      boxShadow: '3px 3px 8px rgba(174,180,200,0.5), -3px -3px 8px rgba(255,255,255,0.85)',
                      border: '1px solid rgba(255,255,255,0.7)',
                    } : {
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      boxShadow: '3px 3px 8px rgba(99,102,241,0.35)',
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
                      background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
                      borderRadius: '20px 6px 20px 20px',
                      color: 'white',
                      boxShadow: '4px 4px 12px rgba(30,27,75,0.3)',
                    } : {
                      background: '#eef0f5',
                      boxShadow: '5px 5px 14px rgba(174,180,200,0.55), -5px -5px 14px rgba(255,255,255,0.85)',
                      border: '1px solid rgba(255,255,255,0.75)',
                      borderRadius: '6px 20px 20px 20px',
                      color: '#374151',
                    }}
                  >
                    <p className="whitespace-pre-wrap text-sm leading-relaxed font-medium">{msg.content}</p>
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
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '3px 3px 8px rgba(99,102,241,0.35)' }}
                  >
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div
                    className="px-5 py-4 flex items-center gap-2"
                    style={{ background: '#eef0f5', boxShadow: '5px 5px 14px rgba(174,180,200,0.55), -5px -5px 14px rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.75)', borderRadius: '6px 20px 20px 20px' }}
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
                    style={{ background: '#eef0f5', boxShadow: '3px 3px 7px rgba(174,180,200,0.5), -3px -3px 7px rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.7)' }}
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
                placeholder="Message Apex AI..."
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
                  boxShadow: 'inset 2px 2px 5px rgba(174,180,200,0.4)',
                  cursor: 'not-allowed',
                } : {
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  boxShadow: '4px 4px 12px rgba(99,102,241,0.4), -2px -2px 8px rgba(255,255,255,0.5)',
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
                  background: '#eef0f5',
                  boxShadow: '12px 12px 30px rgba(174,180,200,0.6), -12px -12px 30px rgba(255,255,255,0.9)',
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
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    boxShadow: '6px 6px 16px rgba(99,102,241,0.4), -3px -3px 10px rgba(255,255,255,0.6)',
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
                style={{ background: '#eef0f5', boxShadow: '8px 8px 20px rgba(174,180,200,0.6), -8px -8px 20px rgba(255,255,255,0.9)' }}
              >
                <div className="absolute inset-2 rounded-full border-4 border-transparent animate-spin"
                  style={{ borderTopColor: '#6366f1' }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Bot className="h-7 w-7 text-indigo-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-700">Synthesizing Data</h3>
                <p className="text-sm text-slate-400 font-medium mt-1">Optimizing your workflow...</p>
              </div>
            </div>

          ) : (
            <div className="max-w-3xl mx-auto pb-8">
              {/* Planner header */}
              <div style={neo.card} className="p-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black text-slate-800">Today's Schedule</h3>
                  <p className="text-sm font-bold text-indigo-600 mt-0.5">
                    {new Date(dailyPlan.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <button
                  onClick={generateDailyPlan}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold text-slate-600"
                  style={{ background: '#eef0f5', boxShadow: '4px 4px 10px rgba(174,180,200,0.5), -4px -4px 10px rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.7)' }}
                >
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  Regenerate
                </button>
              </div>

              {/* Timeline */}
              <div className="relative pl-6 sm:pl-10">
                <div
                  className="absolute left-[2.8rem] sm:left-[3.7rem] top-4 bottom-4 w-0.5"
                  style={{ background: 'linear-gradient(to bottom, #6366f1, #8b5cf6, #c4b5fd)', boxShadow: '0 0 8px rgba(99,102,241,0.3)' }}
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
                            boxShadow: `4px 4px 10px rgba(174,180,200,0.5), -4px -4px 10px rgba(255,255,255,0.85)`,
                            border: `2px solid ${prioStyle.accent}40`,
                          }}
                        >
                          <span className="text-[11px] font-black text-slate-700">{item.time?.split(' - ')[0]}</span>
                        </div>

                        {/* Content card */}
                        <div
                          style={{
                            flex: 1,
                            background: '#eef0f5',
                            borderRadius: '20px',
                            boxShadow: '6px 6px 16px rgba(174,180,200,0.55), -6px -6px 16px rgba(255,255,255,0.85)',
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
                              style={{ background: '#eef0f5', boxShadow: '2px 2px 5px rgba(174,180,200,0.4), -2px -2px 5px rgba(255,255,255,0.85)', color: '#6b7280' }}
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
    </div>
  );
};

export default ApexAI;
