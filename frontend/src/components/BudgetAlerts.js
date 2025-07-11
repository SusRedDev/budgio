import React from 'react';
import { useBudget } from '../contexts/BudgetContext';
import { AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

const BudgetAlerts = () => {
  const { budgets, getCategoryTotals } = useBudget();
  const categoryTotals = getCategoryTotals();

  const budgetStatus = budgets.map(budget => {
    const spent = categoryTotals[budget.category]?.expense || 0;
    const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
    
    return {
      ...budget,
      spent,
      percentage,
      status: percentage >= 100 ? 'over' : percentage >= 80 ? 'warning' : 'good'
    };
  }).sort((a, b) => b.percentage - a.percentage);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'over':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <TrendingUp className="w-5 h-5 text-orange-500" />;
      default:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'over':
        return 'from-red-50 to-red-100 border-red-200';
      case 'warning':
        return 'from-orange-50 to-orange-100 border-orange-200';
      default:
        return 'from-green-50 to-green-100 border-green-200';
    }
  };

  const getProgressColor = (status) => {
    switch (status) {
      case 'over':
        return 'bg-gradient-to-r from-red-500 to-red-600';
      case 'warning':
        return 'bg-gradient-to-r from-orange-500 to-orange-600';
      default:
        return 'bg-gradient-to-r from-green-500 to-green-600';
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Budget Status</h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-xs text-gray-500">This Month</span>
        </div>
      </div>

      <div className="space-y-4">
        {budgetStatus.length > 0 ? (
          budgetStatus.map((budget) => (
            <div
              key={budget.category}
              className={`p-4 rounded-xl border bg-gradient-to-r ${getStatusColor(budget.status)} transition-all duration-200`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getStatusIcon(budget.status)}
                  <div>
                    <p className="font-medium text-gray-800">{budget.category}</p>
                    <p className="text-sm text-gray-600">
                      ${budget.spent.toLocaleString()} of ${budget.amount.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    budget.status === 'over' ? 'text-red-600' : 
                    budget.status === 'warning' ? 'text-orange-600' : 'text-green-600'
                  }`}>
                    {Math.round(budget.percentage)}%
                  </p>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(budget.status)}`}
                  style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                ></div>
              </div>
              
              {budget.status === 'over' && (
                <p className="text-xs text-red-600 mt-2">
                  Over budget by ${(budget.spent - budget.amount).toLocaleString()}
                </p>
              )}
              {budget.status === 'warning' && (
                <p className="text-xs text-orange-600 mt-2">
                  ${(budget.amount - budget.spent).toLocaleString()} remaining
                </p>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No budgets set</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetAlerts;