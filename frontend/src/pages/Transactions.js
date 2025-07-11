import React, { useState } from 'react';
import { useBudget } from '../contexts/BudgetContext';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';
import TransactionFilters from '../components/TransactionFilters';
import { Plus } from 'lucide-react';

const Transactions = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [filters, setFilters] = useState({
    type: 'all',
    category: 'all',
    search: ''
  });

  const handleAddTransaction = () => {
    setEditingTransaction(null);
    setShowForm(true);
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTransaction(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">All Transactions</h2>
          <p className="text-gray-600 mt-1">Track and manage your financial transactions</p>
        </div>
        <button
          onClick={handleAddTransaction}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        >
          <Plus className="w-5 h-5" />
          Add Transaction
        </button>
      </div>

      <TransactionFilters filters={filters} onFiltersChange={setFilters} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TransactionList 
            filters={filters}
            onEdit={handleEditTransaction}
          />
        </div>
        <div>
          {showForm && (
            <TransactionForm
              transaction={editingTransaction}
              onClose={handleCloseForm}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Transactions;