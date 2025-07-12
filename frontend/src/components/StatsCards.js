import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, PiggyBank } from 'lucide-react';

const StatsCards = ({ income, expenses, balance }) => {
  const cards = [
    {
      title: 'Monthly Income',
      value: `$${income.toLocaleString()}`,
      icon: TrendingUp,
      color: 'from-emerald-500 to-green-600',
      bgColor: 'from-emerald-50 to-green-50',
      textColor: 'text-emerald-700',
      borderColor: 'border-emerald-200'
    },
    {
      title: 'Monthly Expenses',
      value: `$${expenses.toLocaleString()}`,
      icon: TrendingDown,
      color: 'from-rose-500 to-pink-600',
      bgColor: 'from-rose-50 to-pink-50',
      textColor: 'text-rose-700',
      borderColor: 'border-rose-200'
    },
    {
      title: 'Net Balance',
      value: `$${balance.toLocaleString()}`,
      icon: balance >= 0 ? PiggyBank : DollarSign,
      color: balance >= 0 ? 'from-purple-500 to-purple-600' : 'from-orange-500 to-red-600',
      bgColor: balance >= 0 ? 'from-purple-50 to-purple-50' : 'from-orange-50 to-red-50',
      textColor: balance >= 0 ? 'text-purple-700' : 'text-orange-700',
      borderColor: balance >= 0 ? 'border-purple-200' : 'border-orange-200'
    },
    {
      title: 'Savings Rate',
      value: `${income > 0 ? Math.round((balance / income) * 100) : 0}%`,
      icon: PiggyBank,
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'from-blue-50 to-indigo-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`bg-gradient-to-br ${card.bgColor} backdrop-blur-xl rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border ${card.borderColor}`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl bg-gradient-to-r ${card.color} shadow-lg`}>
              <card.icon className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 font-medium">{card.title}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className={`text-2xl font-bold ${card.textColor}`}>
              {card.value}
            </h3>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${card.color}`}></div>
              <span className="text-xs text-gray-500">This month</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;