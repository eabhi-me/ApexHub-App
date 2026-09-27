import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Wallet, 
  BookOpen, 
  LogOut, 
  Menu, 
  X,
  Sparkles,
  ChevronRight,
  Bot
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Layout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { logout, user } = useAuth();
  const location = useLocation();

  const navItems = [
    { 
      name: 'Overview', 
      path: '/overview', 
      icon: LayoutDashboard,
      color: 'text-blue-500'
    },
    { 
      name: 'Finance', 
      path: '/finance', 
      icon: Wallet,
      color: 'text-emerald-500'
    },
    { 
      name: 'Study Planner', 
      path: '/study', 
      icon: BookOpen,
      color: 'text-violet-600',
      badge: 'Pomodoro'
    },
    { 
      name: 'Apex AI', 
      path: '/ai', 
      icon: Bot,
      color: 'text-indigo-500',
      badge: 'Beta'
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-transparent">
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-72 m-4 lg:m-6 rounded-3xl
        bg-white/80 backdrop-blur-xl border border-slate-200/60
        shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)]
        transform transition-all duration-500 ease-in-out flex flex-col
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-[150%] lg:translate-x-0'}
      `}>
        {/* Brand */}
        <div className="h-24 flex items-center px-8 border-b border-slate-100/50">
          <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 p-2.5 rounded-xl shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-all duration-300 group-hover:scale-105 group-active:scale-95">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-slate-800">Apex<span className="text-indigo-600">Hub</span></span>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] -mt-1 group-hover:text-indigo-400 transition-colors">Workspace</p>
            </div>
          </div>
          <button 
            className="ml-auto lg:hidden p-2 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-xl"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-8 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  group flex items-center justify-between px-4 py-3.5 rounded-2xl
                  transition-all duration-300 font-semibold text-sm
                  ${isActive 
                    ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/10' 
                    : 'text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm'
                  }
                `}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-white/10' : 'bg-slate-50 group-hover:bg-indigo-50'}`}>
                    <Icon className={`h-5 w-5 ${isActive ? 'text-white' : item.color}`} />
                  </div>
                  <span>{item.name}</span>
                </div>
                
                {item.badge && (
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg ${
                    isActive ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-slate-100/50">
          <div className="bg-slate-50 rounded-2xl p-4 flex flex-col space-y-3">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 font-bold text-lg border border-indigo-200">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">{user?.name || 'User'}</p>
                <p className="text-xs font-medium text-slate-400 truncate">{user?.email || 'user@example.com'}</p>
              </div>
            </div>
            <button 
              onClick={logout}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-white border border-slate-200/60 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 text-slate-500 rounded-xl transition-all duration-300 text-sm font-bold shadow-sm"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Mobile Header */}
        <div className="lg:hidden h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 flex items-center justify-between px-6 z-30 shadow-sm mt-4 mx-4 rounded-3xl">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-indigo-600" />
            <span className="text-xl font-black text-slate-800">ApexHub</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl transition-colors border border-slate-200/60"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto custom-scrollbar p-4 lg:p-6 lg:pl-0 pb-12 lg:pb-12">
          <div className="min-h-full pb-12">
            {children}
          </div>
        </div>
      </main>
      
    </div>
  );
};

export default Layout;
