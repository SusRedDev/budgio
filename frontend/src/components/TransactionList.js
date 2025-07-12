import React from 'react';
import { useBudget } from '../contexts/BudgetContext';
import { Edit2, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const TransactionList = ({ filters, sortConfig, onEdit }) => {
  const { getMonthlyTransactions, deleteTransaction } = useBudget();
  
  const filteredTransactions = getMonthlyTransactions()
    .filter(transaction => {
      const matchesType = filters.type === 'all' || transaction.type === filters.type;
      const matchesCategory = filters.category === 'all' || transaction.category === filters.category;
      const matchesSearch = transaction.description.toLowerCase().includes(filters.search.toLowerCase()) ||
                           transaction.category.toLowerCase().includes(filters.search.toLowerCase());
      
      // Amount range filtering
      let matchesAmount = true;
      if (filters.amountRange !== 'all') {
        const amount = transaction.amount;
        switch (filters.amountRange) {
          case '0-100':
            matchesAmount = amount >= 0 && amount <= 100;
            break;
          case '100-500':
            matchesAmount = amount > 100 && amount <= 500;
            break;
          case '500-1000':
            matchesAmount = amount > 500 && amount <= 1000;
            break;
          case '1000+':
            matchesAmount = amount > 1000;
            break;
          default:
            matchesAmount = true;
        }
      }
      
      return matchesType && matchesCategory && matchesSearch && matchesAmount;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortConfig.field) {
        case 'date':
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'description':
          aValue = a.description.toLowerCase();
          bValue = b.description.toLowerCase();
          break;
        case 'category':
          aValue = a.category.toLowerCase();
          bValue = b.category.toLowerCase();
          break;
        default:
          aValue = new Date(a.created_at || a.date);
          bValue = new Date(b.created_at || b.date);
      }
      
      if (sortConfig.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await deleteTransaction(id);
      } catch (error) {
        alert('Error deleting transaction: ' + error.message);
      }
    }
  };

  const getStatusBadge = (transaction) => {
    const isRecent = new Date() - new Date(transaction.date) < 7 * 24 * 60 * 60 * 1000; // Within 7 days
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        isRecent 
          ? 'bg-green-100 text-green-700' 
          : 'bg-gray-100 text-gray-600'
      }`}>
        {isRecent ? 'Recent' : 'Completed'}
      </span>
    );
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">
          Transactions ({filteredTransactions.length})
        </h3>
      </div>

      <div className="space-y-3">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 hover:from-purple-50 hover:to-blue-50 transition-all duration-200 group border border-gray-100 hover:border-purple-200"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${
                  transaction.type === 'income' 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                    : 'bg-gradient-to-r from-red-500 to-pink-600'
                }`}>
                  {transaction.type === 'income' ? (
                    <ArrowUpRight className="w-5 h-5 text-white" />
                  ) : (
                    <ArrowDownRight className="w-5 h-5 text-white" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-medium text-gray-800">{transaction.description}</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      transaction.type === 'income' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {transaction.category}
                    </span>
                    {getStatusBadge(transaction)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{formatDate(transaction.date)}</span>
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                    <span className="capitalize">{transaction.type}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <p className={`font-semibold text-lg ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                </p>
                
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onEdit(transaction)}
                    className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(transaction.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>No transactions found matching your filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionList;