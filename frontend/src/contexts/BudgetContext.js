import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const BudgetContext = createContext();

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL + '/api';

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
};

export const BudgetProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load data from API
  useEffect(() => {
    loadData();
  }, [currentMonth, currentYear]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load transactions with current month/year filter
      const transactionsResponse = await axios.get(`${API_BASE_URL}/transactions`, {
        params: {
          month: currentMonth + 1, // API expects 1-12, JS uses 0-11
          year: currentYear,
          limit: 1000
        }
      });
      
      // Load budgets
      const budgetsResponse = await axios.get(`${API_BASE_URL}/budgets`);
      
      setTransactions(transactionsResponse.data);
      setBudgets(budgetsResponse.data);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = (transaction) => {
    const newTransaction = {
      id: Date.now().toString(),
      ...transaction,
      createdAt: new Date().toISOString(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const updateTransaction = (id, updatedTransaction) => {
    setTransactions(prev => 
      prev.map(transaction => 
        transaction.id === id ? { ...transaction, ...updatedTransaction } : transaction
      )
    );
  };

  const deleteTransaction = (id) => {
    setTransactions(prev => prev.filter(transaction => transaction.id !== id));
  };

  const updateBudget = (category, amount) => {
    setBudgets(prev => {
      const existingBudget = prev.find(b => b.category === category);
      if (existingBudget) {
        return prev.map(b => 
          b.category === category ? { ...b, amount } : b
        );
      } else {
        return [...prev, { category, amount }];
      }
    });
  };

  const getMonthlyTransactions = () => {
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear;
    });
  };

  const getMonthlyIncome = () => {
    return getMonthlyTransactions()
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getMonthlyExpenses = () => {
    return getMonthlyTransactions()
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getCategoryTotals = () => {
    const monthlyTransactions = getMonthlyTransactions();
    const categoryTotals = {};
    
    monthlyTransactions.forEach(transaction => {
      if (!categoryTotals[transaction.category]) {
        categoryTotals[transaction.category] = { income: 0, expense: 0 };
      }
      categoryTotals[transaction.category][transaction.type] += transaction.amount;
    });
    
    return categoryTotals;
  };

  const value = {
    transactions,
    budgets,
    currentMonth,
    currentYear,
    setCurrentMonth,
    setCurrentYear,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    updateBudget,
    getMonthlyTransactions,
    getMonthlyIncome,
    getMonthlyExpenses,
    getCategoryTotals,
  };

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  );
};