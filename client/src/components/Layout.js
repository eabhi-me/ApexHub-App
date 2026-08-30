import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Wallet, 
  GraduationCap, 
  LogOut, 
  User, 
  Menu, 
  X,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { 
      name: 'Overview', 
      path: '/overview', 
      icon: LayoutDashboard,
      color: 'text-blue-600',
      badge: 'Hub'
    },
    { 
      name: 'Tasks & Notes', 
      path: '/dashboard', 
      icon: CheckSquare,
      color: 'text-indigo-600',
      badge: null
    },
    { 
      name: 'Finance Tracker', 
      path: '/finance', 
      icon: Wallet,
      color: 'text-emerald-600',
      badge: 'Budget'
    },
    { 
      name: 'Study Planner', 
      path: '/study', 
      icon: GraduationCap,
      color: 'text-violet-600',
      badge: 'Pomodoro'
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Brand Logo */}
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center shadow-md shadow-blue-500/20 text-white font-black text-lg tracking-wider">
                <Sparkles className="h-5 w-5 animate-pulse-subtle" />
              </div>
              <div>
                <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900">
                  ApexHub
                </span>
                <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-gradient-to-r from-blue-50 to-indigo-50 text-indigo-700 border border-indigo-100/80 rounded-full">
                  All-in-One Suite
                </span>
              </div>
            </div>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden md:flex items-center space-x-1 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || (item.path === '/overview' && location.pathname === '/');
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-white text-slate-900 shadow-sm shadow-slate-200/80 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? item.color : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                    {item.badge && (
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${
                        isActive 
                          ? 'bg-slate-100 text-slate-700' 
                          : 'bg-white text-slate-500 border border-slate-200/60'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>

            {/* User Profile & Logout */}
            <div className="hidden sm:flex items-center space-x-3">
              <div className="flex items-center space-x-2.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100/80 rounded-full border border-slate-200 transition-colors">
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                  {user?.username ? user.username.charAt(0).toUpperCase() : <User className="h-3.5 w-3.5" />}
                </div>
                <span className="text-xs font-semibold text-slate-700 max-w-[120px] truncate">
                  {user?.username || 'Student User'}
                </span>
              </div>

              <button
                onClick={logout}
                title="Logout"
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-transparent hover:border-rose-100"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden items-center space-x-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
            <div className="px-3 py-2 border-b border-slate-100 mb-2 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-7 w-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                  {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="text-sm font-semibold text-slate-800">{user?.username}</span>
              </div>
              <button
                onClick={logout}
                className="text-xs font-semibold text-rose-600 flex items-center space-x-1"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Logout</span>
              </button>
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path === '/overview' && location.pathname === '/');
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`h-5 w-5 ${isActive ? item.color : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300" />
                </NavLink>
              );
            })}
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/60 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} ApexHub Productivity Suite. Todos, Finance & Study Management.</p>
          <div className="flex items-center space-x-4 text-slate-400">
            <span>Tasks</span>
            <span>•</span>
            <span>Budgets</span>
            <span>•</span>
            <span>Pomodoro Focus</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
