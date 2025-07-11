import React from 'react';
import { useBudget } from '../contexts/BudgetContext';
import StatsCards from '../components/StatsCards';
import ExpenseChart from '../components/ExpenseChart';
import IncomeExpenseChart from '../components/IncomeExpenseChart';
import RecentTransactions from '../components/RecentTransactions';
import BudgetAlerts from '../components/BudgetAlerts';

const Dashboard = () => {
  const { getMonthlyIncome, getMonthlyExpenses, getCategoryTotals, loading, error } = useBudget();

  const monthlyIncome = getMonthlyIncome();
  const monthlyExpenses = getMonthlyExpenses();
  const categoryTotals = getCategoryTotals();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StatsCards 
        income={monthlyIncome}
        expenses={monthlyExpenses}
        balance={monthlyIncome - monthlyExpenses}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExpenseChart categoryTotals={categoryTotals} />
        <IncomeExpenseChart />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentTransactions />
        <BudgetAlerts />
      </div>
    </div>
  );
};

export default Dashboard;