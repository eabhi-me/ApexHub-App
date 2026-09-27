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
  Bot
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Layout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { logout, user } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Overview',      path: '/overview', icon: LayoutDashboard, color: '#6366f1' },
    { name: 'Finance',       path: '/finance',  icon: Wallet,          color: '#10b981' },
    { name: 'Study Planner', path: '/study',    icon: BookOpen,        color: '#8b5cf6', badge: 'Pomodoro' },
    { name: 'Apex AI',       path: '/ai',       icon: Bot,             color: '#6366f1', badge: 'Beta' },
  ];

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#eef0f5' }}>
      
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: 'rgba(15, 18, 35, 0.5)', backdropFilter: 'blur(4px)' }}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ======================== SIDEBAR ======================== */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          flex flex-col
          w-72
          transition-transform duration-500 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{
          margin: '1.25rem',
          marginRight: '0',
          height: 'calc(100vh - 2.5rem)',
          borderRadius: '24px',
          background: '#eef0f5',
          boxShadow: '10px 10px 30px rgba(174, 180, 200, 0.6), -10px -10px 30px rgba(255, 255, 255, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
        }}
      >
        {/* Brand */}
        <div className="flex items-center px-6 py-6 gap-3" style={{ borderBottom: '1px solid rgba(174, 180, 200, 0.3)' }}>
          <div
            className="flex items-center justify-center h-11 w-11 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              boxShadow: '4px 4px 12px rgba(99, 102, 241, 0.4), -2px -2px 8px rgba(255,255,255,0.6)',
            }}
          >
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="text-xl font-black text-slate-800 tracking-tight">
              Apex<span className="text-indigo-600">Hub</span>
            </div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em] -mt-0.5">
              AI Workspace
            </div>
          </div>
          <button
            className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-700"
            style={{ boxShadow: '3px 3px 8px rgba(174,180,200,0.5), -3px -3px 8px rgba(255,255,255,0.85)' }}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block"
              >
                <div
                  className="flex items-center justify-between px-4 py-3.5 rounded-2xl cursor-pointer group"
                  style={isActive ? {
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    boxShadow: '4px 4px 12px rgba(99,102,241,0.35), -2px -2px 8px rgba(255,255,255,0.5)',
                  } : {
                    background: '#eef0f5',
                    boxShadow: '3px 3px 8px rgba(174,180,200,0.5), -3px -3px 8px rgba(255,255,255,0.85)',
                    border: '1px solid rgba(255,255,255,0.7)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex items-center justify-center h-8 w-8 rounded-xl"
                      style={isActive ? {
                        background: 'rgba(255,255,255,0.2)',
                      } : {
                        background: '#eef0f5',
                        boxShadow: '2px 2px 6px rgba(174,180,200,0.5), -2px -2px 6px rgba(255,255,255,0.85)',
                      }}
                    >
                      <Icon
                        className="h-4 w-4"
                        style={{ color: isActive ? 'rgba(255,255,255,0.95)' : item.color }}
                      />
                    </div>
                    <span
                      className="text-sm font-bold"
                      style={{ color: isActive ? 'white' : '#3d4663' }}
                    >
                      {item.name}
                    </span>
                  </div>
                  {item.badge && (
                    <span
                      className="text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-lg"
                      style={isActive ? {
                        background: 'rgba(255,255,255,0.2)',
                        color: 'rgba(255,255,255,0.9)',
                      } : {
                        background: '#e8eaf2',
                        color: '#6366f1',
                        boxShadow: '2px 2px 4px rgba(174,180,200,0.4), -1px -1px 4px rgba(255,255,255,0.9)',
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              </NavLink>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4" style={{ borderTop: '1px solid rgba(174, 180, 200, 0.3)' }}>
          <div
            className="rounded-2xl p-4"
            style={{
              background: '#eef0f5',
              boxShadow: 'inset 3px 3px 7px rgba(174,180,200,0.5), inset -3px -3px 7px rgba(255,255,255,0.8)',
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="h-10 w-10 rounded-full flex items-center justify-center text-indigo-600 font-black text-lg"
                style={{
                  background: '#eef0f5',
                  boxShadow: '3px 3px 8px rgba(174,180,200,0.5), -3px -3px 8px rgba(255,255,255,0.85)',
                  border: '2px solid rgba(255,255,255,0.8)',
                }}
              >
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-700 truncate">{user?.name || 'User'}</p>
                <p className="text-[11px] text-slate-400 truncate font-medium">{user?.email || ''}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-rose-600"
              style={{
                background: '#eef0f5',
                boxShadow: '3px 3px 7px rgba(174,180,200,0.5), -3px -3px 7px rgba(255,255,255,0.85)',
                border: '1px solid rgba(255,255,255,0.7)',
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = 'inset 2px 2px 5px rgba(174,180,200,0.4), inset -2px -2px 5px rgba(255,255,255,0.8)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '3px 3px 7px rgba(174,180,200,0.5), -3px -3px 7px rgba(255,255,255,0.85)'; }}
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ======================== MAIN CONTENT ======================== */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <div
          className="lg:hidden flex items-center justify-between px-5 py-4 mx-5 mt-5"
          style={{
            borderRadius: '20px',
            background: '#eef0f5',
            boxShadow: '6px 6px 16px rgba(174,180,200,0.6), -6px -6px 16px rgba(255,255,255,0.85)',
            border: '1px solid rgba(255,255,255,0.7)',
          }}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-600" />
            <span className="text-lg font-black text-slate-800">ApexHub</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-xl text-slate-500"
            style={{
              background: '#eef0f5',
              boxShadow: '3px 3px 8px rgba(174,180,200,0.5), -3px -3px 8px rgba(255,255,255,0.85)',
            }}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto custom-scrollbar p-5 lg:p-6 lg:pl-4 pb-16">
          <div className="animate-fadeIn">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
