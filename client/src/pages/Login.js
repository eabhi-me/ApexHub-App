import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Eye, EyeOff, Sparkles, CheckSquare, Wallet, GraduationCap, ArrowRight, KeyRound, Copy } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login, loginDemo, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/overview');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleAutofillDemo = () => {
    setFormData({
      email: 'demo@example.com',
      password: 'password123'
    });
    toast.info('Demo credentials auto-filled!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        toast.success('Welcome back!');
        navigate('/overview');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Login failed. Please try again or use Demo Mode.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    loginDemo();
    toast.success('Logged in with Demo Mode! 🎉');
    navigate('/overview');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12 relative overflow-hidden">
      
      {/* Ambient background glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-14 w-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 items-center justify-center shadow-xl shadow-indigo-600/30 text-white mx-auto">
            <Sparkles className="h-7 w-7" />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">
            ApexHub
          </h2>
          <p className="text-sm text-slate-400">
            Productivity Suite: Tasks, Finance Tracker (₹) & Study Planner
          </p>
        </div>

        {/* Demo Credentials Box */}
        <div className="bg-gradient-to-r from-indigo-950/80 to-slate-900/80 border border-indigo-500/30 rounded-2xl p-4 text-xs space-y-2 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="font-bold text-indigo-300 flex items-center gap-1.5">
              <KeyRound className="h-4 w-4 text-amber-400" />
              Demo Account (Preloaded Sample Data)
            </span>
            <button
              type="button"
              onClick={handleAutofillDemo}
              className="px-2.5 py-1 rounded-lg bg-indigo-600/40 hover:bg-indigo-600 text-indigo-200 hover:text-white font-semibold flex items-center gap-1 transition-all"
            >
              <Copy className="h-3 w-3" /> Auto-fill
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-slate-300 bg-slate-950/60 p-2.5 rounded-xl font-mono text-[11px]">
            <div>Email: <strong className="text-indigo-200">demo@example.com</strong></div>
            <div>Password: <strong className="text-indigo-200">password123</strong></div>
          </div>
          <p className="text-[11px] text-slate-400">
            ✨ Preloaded with sample INR expenses, budgets, course syllabi & pomodoro sessions. Newly registered accounts get their own clean workspace.
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Email Address
              </label>
              <input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="name@domain.com"
                className="w-full px-4 py-3 text-sm bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 text-sm bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Or Instant 1-Click
            </span>
            <div className="border-t border-slate-800 w-full" />
          </div>

          <button
            type="button"
            onClick={handleDemoLogin}
            className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-emerald-500/15 via-indigo-500/15 to-violet-500/15 border border-indigo-500/30 text-indigo-200 hover:text-white hover:bg-indigo-500/25 transition-all flex items-center justify-center space-x-2"
          >
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>Explore with 1-Click Demo Mode</span>
          </button>

          <div className="text-center pt-2">
            <span className="text-xs text-slate-400">
              New user?{' '}
              <Link to="/register" className="font-semibold text-indigo-400 hover:underline">
                Create your own private workspace
              </Link>
            </span>
          </div>
        </div>

        {/* Feature Pills */}
        <div className="grid grid-cols-3 gap-2 text-center text-[11px] text-slate-400">
          <div className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-900/50 border border-slate-800">
            <CheckSquare className="h-3.5 w-3.5 text-blue-400" />
            <span>Kanban Tasks</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-900/50 border border-slate-800">
            <Wallet className="h-3.5 w-3.5 text-emerald-400" />
            <span>INR (₹) Budgets</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-900/50 border border-slate-800">
            <GraduationCap className="h-3.5 w-3.5 text-violet-400" />
            <span>Study Pomodoro</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
