import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Eye, EyeOff, Sparkles, UserPlus, ArrowRight, KeyRound, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const neoInset = {
  background: '#e4e6ef',
  boxShadow: 'inset 3px 3px 7px rgba(174,180,200,0.5), inset -3px -3px 7px rgba(255,255,255,0.8)',
  borderRadius: '12px',
  border: '1px solid rgba(255,255,255,0.5)',
  width: '100%',
  padding: '0.7rem 1rem',
  fontSize: '0.875rem',
  fontWeight: '500',
  color: '#1e2332',
  outline: 'none',
  fontFamily: 'Plus Jakarta Sans, sans-serif',
};

const Register = () => {
  const navigate = useNavigate();
  const { register, loginDemo, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (isAuthenticated) navigate('/overview');
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (formData.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const result = await register(formData.username, formData.email, formData.password);
      if (result.success) { toast.success('Welcome to your private workspace!'); navigate('/overview'); }
      else toast.error(result.message);
    } catch { toast.error('Registration failed. Please try again.'); }
    finally { setLoading(false); }
  };

  const handleDemoAccess = () => {
    loginDemo();
    toast.success('Logged in with Demo Mode! 🎉');
    navigate('/overview');
  };

  const passwordStrength = (pw) => {
    if (pw.length === 0) return null;
    if (pw.length < 6) return { label: 'Too short', color: '#f43f5e', width: '25%' };
    if (pw.length < 8) return { label: 'Fair', color: '#f59e0b', width: '50%' };
    if (pw.length < 12) return { label: 'Good', color: '#6366f1', width: '75%' };
    return { label: 'Strong', color: '#10b981', width: '100%' };
  };
  const strength = passwordStrength(formData.password);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #e8eaf2 0%, #eef0f5 50%, #e6e8f0 100%)' }}>

      {/* Ambient glows */}
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%)', filter: 'blur(40px)' }} />

      <div className="max-w-md w-full space-y-5 relative z-10">

        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div
            className="inline-flex h-16 w-16 rounded-2xl items-center justify-center mx-auto"
            style={{
              background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
              boxShadow: '6px 6px 16px rgba(139,92,246,0.4), -4px -4px 12px rgba(255,255,255,0.6)',
            }}
          >
            <UserPlus className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Create Account</h1>
          <p className="text-sm text-slate-500 font-medium">Your own private workspace for tasks, INR finances & studies</p>
        </div>

        {/* Demo Hint */}
        <div
          className="flex items-center justify-between px-4 py-3 rounded-2xl text-xs"
          style={{
            background: '#eef0f5',
            boxShadow: '5px 5px 12px rgba(174,180,200,0.55), -5px -5px 12px rgba(255,255,255,0.85)',
            border: '1px solid rgba(255,255,255,0.75)',
          }}
        >
          <span className="flex items-center gap-1.5 font-bold text-indigo-700">
            <KeyRound className="h-3.5 w-3.5 text-amber-500" />
            Want to explore sample data first?
          </span>
          <Link to="/login" className="font-black text-indigo-600 hover:underline">Demo Login →</Link>
        </div>

        {/* Card */}
        <div
          className="p-7"
          style={{
            background: '#eef0f5',
            borderRadius: '28px',
            boxShadow: '10px 10px 30px rgba(174,180,200,0.6), -10px -10px 30px rgba(255,255,255,0.85)',
            border: '1px solid rgba(255,255,255,0.8)',
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Username */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Username</label>
              <input name="username" type="text" required value={formData.username} onChange={handleChange}
                placeholder="e.g. Dhairya" style={neoInset} />
            </div>

            {/* Email */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Email Address</label>
              <input name="email" type="email" required value={formData.email} onChange={handleChange}
                placeholder="name@domain.com" style={neoInset} />
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Password</label>
              <div className="relative">
                <input name="password" type={showPassword ? 'text' : 'password'} required
                  value={formData.password} onChange={handleChange}
                  placeholder="At least 6 characters"
                  style={{ ...neoInset, paddingRight: '2.75rem' }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {/* Password strength */}
              {strength && (
                <div className="mt-2">
                  <div style={{ height: '4px', borderRadius: '999px', background: '#d1d5db', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: strength.width, background: strength.color, borderRadius: '999px', transition: 'width 0.4s ease, background 0.3s ease' }} />
                  </div>
                  <p className="text-[10px] font-bold mt-1" style={{ color: strength.color }}>{strength.label}</p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Confirm Password</label>
              <div className="relative">
                <input name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} required
                  value={formData.confirmPassword} onChange={handleChange}
                  placeholder="Repeat password"
                  style={{ ...neoInset, paddingRight: '2.75rem' }} />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <CheckCircle className="absolute right-10 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                )}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit" disabled={loading}
              className="w-full py-3.5 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2 mt-2"
              style={{
                background: loading ? '#9ba5bc' : 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                boxShadow: loading ? 'none' : '4px 4px 12px rgba(139,92,246,0.4), -2px -2px 8px rgba(255,255,255,0.5)',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading
                ? <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                : <><span>Create Account</span><ArrowRight className="h-4 w-4" /></>
              }
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center my-5">
            <div className="flex-1" style={{ height: '1px', background: 'rgba(174,180,200,0.4)' }} />
            <span className="mx-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">or</span>
            <div className="flex-1" style={{ height: '1px', background: 'rgba(174,180,200,0.4)' }} />
          </div>

          <button
            type="button" onClick={handleDemoAccess}
            className="w-full py-3 rounded-2xl text-sm font-bold text-violet-700 flex items-center justify-center gap-2"
            style={{
              background: '#eef0f5',
              boxShadow: '4px 4px 10px rgba(174,180,200,0.5), -4px -4px 10px rgba(255,255,255,0.85)',
              border: '1px solid rgba(255,255,255,0.7)',
            }}
          >
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>Instant Demo Access</span>
          </button>

          <p className="text-center text-xs text-slate-400 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-700">Sign in here</Link>
          </p>
        </div>

        {/* Features */}
        <div
          className="p-4 rounded-2xl text-xs text-slate-500"
          style={{
            background: '#eef0f5',
            boxShadow: '5px 5px 12px rgba(174,180,200,0.55), -5px -5px 12px rgba(255,255,255,0.85)',
            border: '1px solid rgba(255,255,255,0.75)',
          }}
        >
          <p className="font-bold text-slate-600 mb-2">✨ Your workspace includes:</p>
          <div className="grid grid-cols-2 gap-1.5">
            {['Kanban Task Board', 'INR Finance Tracker', 'Study Planner + Pomodoro', 'Apex AI Assistant'].map(f => (
              <div key={f} className="flex items-center gap-1.5 font-medium">
                <CheckCircle className="h-3 w-3 text-emerald-500 flex-shrink-0" />
                {f}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Register;
