import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { BudgetProvider } from './contexts/BudgetContext';
import { LanguageProvider } from './contexts/LanguageContext';
import ProtectedRoute from './components/ProtectedRoute';
import TravelModeCheck from './components/TravelModeCheck';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budget from './pages/Budget';
import Settings from './pages/Settings';
import Chat from './pages/Chat';
import Login from './pages/Login';
import Register from './pages/Register';
import TravelLogin from './pages/TravelLogin';
import NotFound from './pages/NotFound';
import Layout from './components/Layout';
import './App.css';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="App">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={
                <TravelModeCheck>
                  <Login />
                </TravelModeCheck>
              } />
              <Route path="/register" element={
                <TravelModeCheck>
                  <Register />
                </TravelModeCheck>
              } />
              <Route path="/login-tp" element={<TravelLogin />} />
              <Route path="/404" element={<NotFound />} />
              
              {/* Protected routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <BudgetProvider>
                    <Layout />
                  </BudgetProvider>
                </ProtectedRoute>
              }>
                <Route index element={<Dashboard />} />
                <Route path="transactions" element={<Transactions />} />
                <Route path="budget" element={<Budget />} />
                <Route path="settings" element={<Settings />} />
                <Route path="chat" element={<Chat />} />
              </Route>
              
              {/* Catch all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;