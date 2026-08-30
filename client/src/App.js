import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './contexts/AuthContext';
import { TodoProvider } from './contexts/TodoContext';
import { FinanceProvider } from './contexts/FinanceContext';
import { StudyProvider } from './contexts/StudyContext';

import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import OverviewHub from './pages/OverviewHub';
import Dashboard from './pages/Dashboard';
import FinanceTracker from './pages/FinanceTracker';
import StudyPlanner from './pages/StudyPlanner';

function App() {
  return (
    <Router>
      <AuthProvider>
        <TodoProvider>
          <FinanceProvider>
            <StudyProvider>
              <div className="min-h-screen bg-slate-50 font-sans">
                <Routes>
                  {/* Public Authentication Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  {/* Private Application Routes */}
                  <Route
                    path="/overview"
                    element={
                      <PrivateRoute>
                        <Layout>
                          <OverviewHub />
                        </Layout>
                      </PrivateRoute>
                    }
                  />

                  <Route
                    path="/dashboard"
                    element={
                      <PrivateRoute>
                        <Layout>
                          <Dashboard />
                        </Layout>
                      </PrivateRoute>
                    }
                  />

                  <Route
                    path="/finance"
                    element={
                      <PrivateRoute>
                        <Layout>
                          <FinanceTracker />
                        </Layout>
                      </PrivateRoute>
                    }
                  />

                  <Route
                    path="/study"
                    element={
                      <PrivateRoute>
                        <Layout>
                          <StudyPlanner />
                        </Layout>
                      </PrivateRoute>
                    }
                  />

                  {/* Default redirect to /overview */}
                  <Route path="/" element={<Navigate to="/overview" replace />} />
                  <Route path="*" element={<Navigate to="/overview" replace />} />
                </Routes>

                <ToastContainer
                  position="top-right"
                  autoClose={3000}
                  hideProgressBar={false}
                  newestOnTop={false}
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                  theme="colored"
                />
              </div>
            </StudyProvider>
          </FinanceProvider>
        </TodoProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
