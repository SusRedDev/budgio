import React from 'react';
import { useBudget } from '../contexts/BudgetContext';
import StatsCards from '../components/StatsCards';
import ExpenseChart from '../components/ExpenseChart';
import IncomeExpenseChart from '../components/IncomeExpenseChart';
import RecentTransactions from '../components/RecentTransactions';
import BudgetAlerts from '../components/BudgetAlerts';

const Dashboard = () => {
  const { getMonthlyIncome, getMonthlyExpenses, getCategoryTotals } = useBudget();

  const monthlyIncome = getMonthlyIncome();
  const monthlyExpenses = getMonthlyExpenses();
  const categoryTotals = getCategoryTotals();

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