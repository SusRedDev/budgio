import React, { useState } from 'react';
import { useBudget } from '../contexts/BudgetContext';
import { CATEGORIES } from '../data/mockData';
import { Target, TrendingUp, AlertCircle, Plus } from 'lucide-react';

const Budget = () => {
  const { budgets, getCategoryTotals, updateBudget } = useBudget();
  const [editingBudget, setEditingBudget] = useState(null);
  const [newBudgetAmount, setNewBudgetAmount] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  const categoryTotals = getCategoryTotals();
  const expenseCategories = CATEGORIES.expense;

  const getBudgetForCategory = (category) => {
    return budgets.find(b => b.category === category);
  };

  const handleUpdateBudget = (category, amount) => {
    updateBudget(category, parseFloat(amount));
    setEditingBudget(null);
    setNewBudgetAmount('');
  };

  const handleAddBudget = () => {
    if (newCategory && newBudgetAmount) {
      updateBudget(newCategory, parseFloat(newBudgetAmount));
      setNewCategory('');
      setNewBudgetAmount('');
      setShowAddForm(false);
    }
  };

  const getBudgetStatus = (category) => {
    const budget = getBudgetForCategory(category);
    const spent = categoryTotals[category]?.expense || 0;
    
    if (!budget) return { status: 'none', percentage: 0, remaining: 0 };
    
    const percentage = (spent / budget.amount) * 100;
    const remaining = budget.amount - spent;
    
    return {
      status: percentage >= 100 ? 'over' : percentage >= 80 ? 'warning' : 'good',
      percentage: Math.round(percentage),
      remaining,
      budget: budget.amount,
      spent
    };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'over': return 'bg-red-500';
      case 'warning': return 'bg-orange-500';
      case 'good': return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'over': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning': return <TrendingUp className="w-5 h-5 text-orange-500" />;
      case 'good': return <Target className="w-5 h-5 text-green-500" />;
      default: return <Plus className="w-5 h-5 text-gray-500" />;
    }
  };

  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = Object.values(categoryTotals).reduce((sum, cat) => sum + cat.expense, 0);

  return (
    <div className="space-y-6">
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Budget Overview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Target className="w-8 h-8 text-white" />
            </div>
            <p className="text-sm text-gray-600">Total Budget</p>
            <p className="text-2xl font-bold text-gray-800">${totalBudget.toLocaleString()}</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <p className="text-sm text-gray-600">Total Spent</p>
            <p className="text-2xl font-bold text-gray-800">${totalSpent.toLocaleString()}</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
            <p className="text-sm text-gray-600">Remaining</p>
            <p className={`text-2xl font-bold ${totalBudget - totalSpent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${(totalBudget - totalSpent).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Category Budgets</h3>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            Add Budget
          </button>
        </div>

        {showAddForm && (
          <div className="mb-6 p-4 border border-gray-200 rounded-xl bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select category</option>
                {expenseCategories.filter(cat => !getBudgetForCategory(cat)).map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              
              <input
                type="number"
                value={newBudgetAmount}
                onChange={(e) => setNewBudgetAmount(e.target.value)}
                placeholder="Budget amount"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              <div className="flex gap-2">
                <button
                  onClick={handleAddBudget}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Add
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {expenseCategories.map((category) => {
            const status = getBudgetStatus(category);
            
            return (
              <div
                key={category}
                className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(status.status)}
                    <h4 className="font-medium text-gray-800">{category}</h4>
                  </div>
                  
                  {editingBudget === category ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={newBudgetAmount}
                        onChange={(e) => setNewBudgetAmount(e.target.value)}
                        className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Amount"
                      />
                      <button
                        onClick={() => handleUpdateBudget(category, newBudgetAmount)}
                        className="px-2 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingBudget(null)}
                        className="px-2 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingBudget(category);
                        setNewBudgetAmount(status.budget?.toString() || '');
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      {status.status === 'none' ? 'Set Budget' : 'Edit'}
                    </button>
                  )}
                </div>

                {status.status !== 'none' && (
                  <>
                    <div className="mb-2">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>${status.spent.toLocaleString()} spent</span>
                        <span>${status.budget.toLocaleString()} budget</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${getStatusColor(status.status)}`}
                          style={{ width: `${Math.min(status.percentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="text-sm">
                      <span className={`font-medium ${
                        status.status === 'over' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {status.percentage}% used
                      </span>
                      {status.remaining > 0 && (
                        <span className="text-gray-500 ml-2">
                          (${status.remaining.toLocaleString()} remaining)
                        </span>
                      )}
                      {status.remaining < 0 && (
                        <span className="text-red-500 ml-2">
                          (${Math.abs(status.remaining).toLocaleString()} over)
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Budget;