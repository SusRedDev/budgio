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

  const addTransaction = async (transaction) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/transactions`, transaction);
      setTransactions(prev => [response.data, ...prev]);
      return response.data;
    } catch (err) {
      console.error('Error adding transaction:', err);
      throw new Error('Failed to add transaction');
    }
  };

  const updateTransaction = async (id, updatedTransaction) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/transactions/${id}`, updatedTransaction);
      setTransactions(prev => 
        prev.map(transaction => 
          transaction.id === id ? response.data : transaction
        )
      );
      return response.data;
    } catch (err) {
      console.error('Error updating transaction:', err);
      throw new Error('Failed to update transaction');
    }
  };

  const deleteTransaction = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/transactions/${id}`);
      setTransactions(prev => prev.filter(transaction => transaction.id !== id));
    } catch (err) {
      console.error('Error deleting transaction:', err);
      throw new Error('Failed to delete transaction');
    }
  };

  const updateBudget = async (category, amount) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/budgets/${category}`, { amount });
      setBudgets(prev => {
        const existingBudget = prev.find(b => b.category === category);
        if (existingBudget) {
          return prev.map(b => 
            b.category === category ? response.data : b
          );
        } else {
          return [...prev, response.data];
        }
      });
      return response.data;
    } catch (err) {
      console.error('Error updating budget:', err);
      throw new Error('Failed to update budget');
    }
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
    setBudgets,
    currentMonth,
    currentYear,
    loading,
    error,
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
    loadData,
  };

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  );
};