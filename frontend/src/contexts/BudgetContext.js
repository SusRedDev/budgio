import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockTransactions, mockBudgets } from '../data/mockData';

const BudgetContext = createContext();

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

  // Load data from localStorage or use mock data
  useEffect(() => {
    const savedTransactions = localStorage.getItem('budget-transactions');
    const savedBudgets = localStorage.getItem('budget-budgets');
    
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    } else {
      setTransactions(mockTransactions);
    }
    
    if (savedBudgets) {
      setBudgets(JSON.parse(savedBudgets));
    } else {
      setBudgets(mockBudgets);
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('budget-transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('budget-budgets', JSON.stringify(budgets));
  }, [budgets]);

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