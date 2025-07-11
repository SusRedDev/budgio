import React from 'react';
import { Link } from 'react-router-dom';
import { useBudget } from '../contexts/BudgetContext';
import { ArrowUpRight, ArrowDownRight, Eye } from 'lucide-react';

const RecentTransactions = () => {
  const { getMonthlyTransactions } = useBudget();
  const recentTransactions = getMonthlyTransactions()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Recent Transactions</h3>
        <Link
          to="/transactions"
          className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          <Eye className="w-4 h-4" />
          View All
        </Link>
      </div>

      <div className="space-y-3">
        {recentTransactions.length > 0 ? (
          recentTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${
                  transaction.type === 'income' 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                    : 'bg-gradient-to-r from-red-500 to-pink-600'
                }`}>
                  {transaction.type === 'income' ? (
                    <ArrowUpRight className="w-4 h-4 text-white" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-white" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{transaction.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">{transaction.category}</span>
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                    <span className="text-xs text-gray-500">{formatDate(transaction.date)}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No transactions this month</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentTransactions;