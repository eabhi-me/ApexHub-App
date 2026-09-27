import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Eye, EyeOff, Sparkles, CheckSquare, Wallet, GraduationCap, ArrowRight, KeyRound, Copy, Bot } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login, loginDemo, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (isAuthenticated) navigate('/overview');
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleAutofillDemo = () => {
    setFormData({ email: 'demo@example.com', password: 'password123' });
    toast.info('Demo credentials auto-filled!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await login(formData.email, formData.password);
      if (result.success) { toast.success('Welcome back!'); navigate('/overview'); }
      else toast.error(result.message);
    } catch { toast.error('Login failed. Please try again.'); }
    finally { setLoading(false); }
  };

  const handleDemoLogin = () => {
    loginDemo();
    toast.success('Logged in with Demo Mode! 🎉');
    navigate('/overview');
  };

  const neoCard = {
    background: '#ffffff',
    boxShadow: 'none',
    borderRadius: '24px',
    border: '1px solid rgba(255,255,255,0.8)',
  };

  const neoInset = {
    background: '#e8eaf2',
    boxShadow: 'none',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.5)',
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden"
      style={{ background: '#e8eaf2' }}>
      
      {/* Ambient glows */}
      <div className="absolute top-0 left-0 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)', filter: 'blur(40px)' }} />

      <div className="max-w-md w-full space-y-5 relative z-10">

        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div
            className="inline-flex h-16 w-16 rounded-2xl items-center justify-center mx-auto"
            style={{
              background: '#6366f1',
              boxShadow: 'none',
            }}
          >
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Apex<span className="text-indigo-600">Hub</span>
          </h1>
          <p className="text-sm text-slate-500 font-medium">Your AI-powered personal operating system</p>
        </div>

        {/* Demo Credentials Box */}
        <div style={{ ...neoCard, borderRadius: '18px', padding: '1rem' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-indigo-700 flex items-center gap-1.5">
              <KeyRound className="h-3.5 w-3.5 text-amber-500" />
              Demo Account — Preloaded Sample Data
            </span>
            <button
              onClick={handleAutofillDemo}
              className="text-xs font-bold text-indigo-600 px-3 py-1.5 rounded-xl flex items-center gap-1"
              style={{ background: '#ffffff', boxShadow: 'none', border: '1px solid rgba(255,255,255,0.7)' }}
            >
              <Copy className="h-3 w-3" /> Auto-fill
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono" style={{ ...neoInset, padding: '0.6rem 0.75rem' }}>
            <div className="text-slate-600">Email: <strong className="text-indigo-600">demo@example.com</strong></div>
            <div className="text-slate-600">Pass: <strong className="text-indigo-600">password123</strong></div>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 font-medium">✨ Preloaded with INR expenses, study sessions & pomodoro logs.</p>
        </div>

        {/* Login Card */}
        <div style={{ ...neoCard, padding: '1.75rem' }}>
          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Email Address
              </label>
              <input
                name="email" type="email" required
                value={formData.email} onChange={handleChange}
                placeholder="name@domain.com"
                className="w-full px-4 py-3 text-sm font-medium"
                style={neoInset}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  name="password" type={showPassword ? 'text' : 'password'} required
                  value={formData.password} onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-11 text-sm font-medium"
                  style={neoInset}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full py-3.5 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2"
              style={{
                background: loading ? '#9ba5bc' : '#6366f1',
                boxShadow: loading ? 'none' : '4px 4px 12px rgba(99,102,241,0.4), -2px -2px 8px rgba(255,255,255,0.5)',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading
                ? <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                : <><span>Sign In</span><ArrowRight className="h-4 w-4" /></>
              }
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center my-5">
            <div className="flex-1" style={{ height: '1px', background: 'rgba(174,180,200,0.4)' }} />
            <span className="mx-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">or instant access</span>
            <div className="flex-1" style={{ height: '1px', background: 'rgba(174,180,200,0.4)' }} />
          </div>

          <button
            type="button" onClick={handleDemoLogin}
            className="w-full py-3 rounded-2xl text-sm font-bold text-indigo-700 flex items-center justify-center gap-2"
            style={{
              background: '#ffffff',
              boxShadow: 'none',
              border: '1px solid rgba(255,255,255,0.7)',
            }}
          >
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>Explore with 1-Click Demo Mode</span>
          </button>

          <p className="text-center text-xs text-slate-400 mt-4">
            New user?{' '}
            <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-700">
              Create your own workspace
            </Link>
          </p>
        </div>

        {/* Feature Pills */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: CheckSquare, label: 'Kanban Tasks', color: '#6366f1' },
            { icon: Wallet,      label: 'INR Finance',  color: '#10b981' },
            { icon: GraduationCap, label: 'Pomodoro',   color: '#8b5cf6' },
            { icon: Bot,         label: 'Apex AI',      color: '#f59e0b' },
          ].map(({ icon: Icon, label, color }) => (
            <div key={label} className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl text-center"
              style={{ background: '#ffffff', boxShadow: 'none', border: '1px solid rgba(255,255,255,0.7)' }}>
              <Icon className="h-4 w-4" style={{ color }} />
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Login;
