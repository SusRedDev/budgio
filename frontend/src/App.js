import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { BudgetProvider } from './contexts/BudgetContext';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budget from './pages/Budget';
import Layout from './components/Layout';
import './App.css';

function App() {
  return (
    <BudgetProvider>
      <BrowserRouter>
        <div className="App">
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="budget" element={<Budget />} />
            </Route>
          </Routes>
        </div>
      </BrowserRouter>
    </BudgetProvider>
  );
}

export default App;