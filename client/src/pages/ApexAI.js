import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2, ArrowRight, Calendar, Clock, Activity, MessageSquare } from 'lucide-react';
import { toast } from 'react-toastify';

const ApexAI = () => {
  const [viewMode, setViewMode] = useState('chat'); // 'chat' or 'planner'
  
  // Chat State
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'ai',
      content: "Hello! I am Apex AI. I can help you manage your tasks, finances, and study plans. How can I assist you today?"
    }
  ]);
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
    "I just spent $15 on lunch"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (viewMode === 'chat') scrollToBottom();
  }, [messages, viewMode]);

  const handleSendChat = async (text) => {
    if (!text.trim()) return;

    if (text.toLowerCase().includes("plan my day") || text.toLowerCase().includes("plan my schedule")) {
      setViewMode('planner');
      generateDailyPlan();
      return;
    }

    const userMsg = { id: Date.now(), role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsChatLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: text })
      });

      const data = await response.json();

      if (response.ok) {
        setMessages((prev) => [
          ...prev,
          { id: Date.now(), role: 'ai', content: data.reply }
        ]);
        if (data.success && data.reply.includes("successfully")) {
          toast.success("Action completed!");
        }
      } else {
        toast.error(data.message || 'Failed to process request');
        setMessages((prev) => [
          ...prev,
          { id: Date.now(), role: 'ai', content: `Error: ${data.message || 'Failed to process request'}` }
        ]);
      }
    } catch (error) {
      console.error("AI Chat error:", error);
      toast.error("Network error communicating with AI");
    } finally {
      setIsChatLoading(false);
    }
  };

  const generateDailyPlan = async () => {
    setIsPlannerLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/ai/plan/day', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (response.ok) {
        if (data.plan) {
          setDailyPlan(data.plan);
          toast.success("Daily plan generated successfully!");
        } else {
          toast.info(data.message || "Nothing to plan today.");
        }
      } else {
        toast.error(data.message || "Failed to generate plan");
      }
    } catch (error) {
      console.error("Planner error:", error);
      toast.error("Network error communicating with AI");
    } finally {
      setIsPlannerLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-8rem)] max-w-5xl mx-auto rounded-3xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] border border-slate-200/50 overflow-hidden bg-white/80 backdrop-blur-2xl">
      
      {/* Header & Mode Switcher */}
      <div className="relative bg-slate-900 p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4 overflow-hidden">
        {/* Animated Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
          <div className="absolute top-12 -right-12 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 flex items-center space-x-4">
          <div className="bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500 p-3 rounded-2xl shadow-lg shadow-purple-500/30 animate-pulse">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">Apex AI</h2>
            <p className="text-indigo-200/80 text-[11px] font-bold uppercase tracking-[0.2em] mt-0.5">Intelligence Layer</p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="relative z-10 flex p-1.5 bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-inner">
          <button
            onClick={() => setViewMode('chat')}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
              viewMode === 'chat' ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/25 scale-105' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Assistant</span>
          </button>
          <button
            onClick={() => setViewMode('planner')}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
              viewMode === 'planner' ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/25 scale-105' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>Planner</span>
          </button>
        </div>
      </div>

      {/* ================= CHAT MODE ================= */}
      {viewMode === 'chat' && (
        <div className="flex-1 flex flex-col relative bg-slate-50/50">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                <div className={`flex space-x-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  
                  {/* Avatar */}
                  <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-tr from-slate-200 to-slate-100 text-slate-600 border border-slate-300/50' 
                      : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-indigo-500/30 border border-indigo-400/50'
                  }`}>
                    {msg.role === 'user' ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                  </div>

                  {/* Message Bubble */}
                  <div className={`p-4 rounded-3xl ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-tr-sm shadow-xl shadow-slate-900/10'
                      : 'bg-white/80 backdrop-blur-xl text-slate-700 shadow-lg shadow-slate-200/50 border border-white/60 rounded-tl-sm'
                  }`}>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed font-medium">{msg.content}</p>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Loading Indicator */}
            {isChatLoading && (
              <div className="flex justify-start animate-in fade-in duration-300">
                <div className="flex space-x-3 max-w-[80%]">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-sm border border-indigo-400/50">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div className="px-5 py-4 rounded-3xl bg-white/80 backdrop-blur-xl text-slate-700 shadow-lg shadow-slate-200/50 border border-white/60 rounded-tl-sm flex items-center space-x-3">
                    <div className="flex space-x-1.5">
                      <div className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="h-2 w-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="h-2 w-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Prompts */}
          {messages.length === 1 && (
            <div className="px-6 py-4 bg-white/60 backdrop-blur-md border-t border-slate-200/60">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pl-1">Quick Actions</p>
              <div className="flex flex-wrap gap-2">
                {suggestedPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendChat(prompt)}
                    className="text-left text-xs bg-white hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 text-slate-600 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200 px-4 py-2.5 rounded-2xl transition-all duration-300 hover:shadow-md hover:scale-[1.02] flex items-center space-x-2 group"
                  >
                    <span className="font-medium">{prompt}</span>
                    <ArrowRight className="h-3.5 w-3.5 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 sm:p-6 bg-white/80 backdrop-blur-xl border-t border-slate-200/60">
            <form onSubmit={(e) => { e.preventDefault(); handleSendChat(input); }} className="relative flex items-center group">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Message Apex AI..."
                className="w-full pl-6 pr-16 py-4 bg-slate-100/50 border-2 border-transparent focus:border-indigo-500/20 focus:bg-white rounded-full text-sm font-medium transition-all duration-300 outline-none shadow-inner focus:shadow-xl focus:shadow-indigo-500/10 placeholder-slate-400"
                disabled={isChatLoading}
              />
              <button
                type="submit"
                disabled={isChatLoading || !input.trim()}
                className="absolute right-2 p-3 bg-slate-900 hover:bg-indigo-600 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-full transition-all duration-300 shadow-md hover:shadow-indigo-500/40 hover:scale-105 disabled:hover:scale-100 flex items-center justify-center"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= PLANNER MODE ================= */}
      {viewMode === 'planner' && (
        <div className="flex-1 overflow-y-auto bg-slate-50/30 p-6 sm:p-8">
          {!dailyPlan && !isPlannerLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-20 rounded-full animate-pulse"></div>
                <div className="relative h-32 w-32 bg-white rounded-full flex items-center justify-center shadow-2xl border border-slate-100">
                  <Calendar className="h-14 w-14 text-indigo-600" />
                </div>
              </div>
              <div className="max-w-md">
                <h3 className="text-3xl font-black text-slate-800 mb-3 tracking-tight">AI Daily Planner</h3>
                <p className="text-slate-500 text-sm mb-8 font-medium leading-relaxed">Let Apex synthesize your pending tasks and deadlines into an optimized, time-blocked schedule.</p>
                <button
                  onClick={generateDailyPlan}
                  className="px-8 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_100%] hover:bg-[100%_0] text-white rounded-2xl font-bold shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:-translate-y-1 transition-all duration-500 flex items-center justify-center space-x-3 mx-auto group"
                >
                  <Sparkles className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                  <span>Generate My Schedule</span>
                </button>
              </div>
            </div>
          ) : isPlannerLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
              <div className="relative h-24 w-24">
                <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
                <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Bot className="h-8 w-8 text-indigo-600 animate-pulse" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">Synthesizing Data</h3>
                <p className="text-slate-500 text-sm font-medium">Optimizing your workflow...</p>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto animate-in slide-in-from-bottom-8 duration-700 pb-10">
              {/* Planner Header Card */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 mb-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-10 -mt-10"></div>
                <div className="relative z-10">
                  <h3 className="text-2xl font-black text-slate-800 mb-1 tracking-tight">Today's Schedule</h3>
                  <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest">{new Date(dailyPlan.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                </div>
                <button onClick={generateDailyPlan} className="relative z-10 mt-4 sm:mt-0 px-5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-bold rounded-xl transition-all shadow-sm hover:shadow-md active:scale-95 flex items-center space-x-2 border border-slate-200/60">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span>Regenerate</span>
                </button>
              </div>

              {/* Timeline Container */}
              <div className="relative pl-4 sm:pl-8">
                {/* Glowing Timeline Line */}
                <div className="absolute left-11 sm:left-15 top-4 bottom-4 w-1 bg-gradient-to-b from-indigo-200 via-purple-200 to-indigo-100 rounded-full"></div>
                
                <div className="space-y-8">
                  {dailyPlan.items.map((item, idx) => (
                    <div key={idx} className="relative flex items-start space-x-6 animate-in slide-in-from-right-4 fade-in duration-500" style={{ animationDelay: `${idx * 100}ms`, animationFillMode: 'both' }}>
                      
                      {/* Timeline Node */}
                      <div className={`relative z-10 flex-shrink-0 h-16 w-16 bg-white border-4 rounded-2xl flex flex-col items-center justify-center shadow-lg transition-transform hover:scale-110 duration-300 ${
                        item.priority === 'high' ? 'border-rose-400 text-rose-600 shadow-rose-500/20' : 
                        item.priority === 'medium' ? 'border-amber-400 text-amber-600 shadow-amber-500/20' : 'border-emerald-400 text-emerald-600 shadow-emerald-500/20'
                      }`}>
                        <span className="text-[11px] font-black">{item.time.split(' - ')[0]}</span>
                      </div>

                      {/* Content Card */}
                      <div className="flex-1 bg-white p-6 rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 group relative overflow-hidden">
                        
                        {/* Subtle Background Accent */}
                        <div className={`absolute top-0 right-0 w-24 h-24 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity ${
                           item.type.toLowerCase().includes('study') ? 'bg-violet-500' :
                           item.type.toLowerCase().includes('break') ? 'bg-emerald-500' :
                           'bg-blue-500'
                        }`}></div>

                        <div className="relative z-10 flex justify-between items-start mb-3">
                          <h4 className="text-lg font-bold text-slate-800 pr-4">{item.activity}</h4>
                          <span className={`flex-shrink-0 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl ${
                            item.type.toLowerCase().includes('study') ? 'bg-violet-100 text-violet-700' :
                            item.type.toLowerCase().includes('break') ? 'bg-emerald-100 text-emerald-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {item.type}
                          </span>
                        </div>
                        
                        <p className="relative z-10 text-sm font-medium text-slate-500 mb-5 leading-relaxed">{item.reason}</p>
                        
                        <div className="relative z-10 flex items-center space-x-5 text-xs font-bold text-slate-400">
                          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-50 rounded-lg">
                            <Clock className="h-4 w-4 text-slate-500" />
                            <span>{item.estimatedDuration} mins</span>
                          </div>
                          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-50 rounded-lg">
                            <Activity className={`h-4 w-4 ${
                              item.priority === 'high' ? 'text-rose-500' : 
                              item.priority === 'medium' ? 'text-amber-500' : 'text-emerald-500'
                            }`} />
                            <span className="capitalize">{item.priority} Priority</span>
                          </div>
                        </div>

                      </div>
                    </div>
                  ))}
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
