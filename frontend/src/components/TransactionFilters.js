import React from 'react';
import { CATEGORIES } from '../data/mockData';
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

const TransactionFilters = ({ filters, onFiltersChange, sortConfig, onSortChange }) => {
  const handleFilterChange = (key, value) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleSort = (field) => {
    let direction = 'asc';
    
    if (sortConfig.field === field) {
      direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
    }
    
    onSortChange({ field, direction });
  };

  const getSortIcon = (field) => {
    if (sortConfig.field !== field) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="w-4 h-4 text-purple-600" />
      : <ArrowDown className="w-4 h-4 text-purple-600" />;
  };

  const allCategories = [...CATEGORIES.income, ...CATEGORIES.expense];

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Transaction Type
          </label>
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50"
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50"
          >
            <option value="all">All Categories</option>
            {allCategories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search transactions..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount Range
          </label>
          <select
            value={filters.amountRange}
            onChange={(e) => handleFilterChange('amountRange', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50"
          >
            <option value="all">All Amounts</option>
            <option value="0-100">$0 - $100</option>
            <option value="100-500">$100 - $500</option>
            <option value="500-1000">$500 - $1,000</option>
            <option value="1000+">$1,000+</option>
          </select>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="border-t border-gray-200 pt-4">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Sort By
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleSort('date')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              sortConfig.field === 'date'
                ? 'bg-purple-100 text-purple-700 border border-purple-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Date
            {getSortIcon('date')}
          </button>
          
          <button
            onClick={() => handleSort('amount')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              sortConfig.field === 'amount'
                ? 'bg-purple-100 text-purple-700 border border-purple-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Amount
            {getSortIcon('amount')}
          </button>
          
          <button
            onClick={() => handleSort('description')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              sortConfig.field === 'description'
                ? 'bg-purple-100 text-purple-700 border border-purple-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Name
            {getSortIcon('description')}
          </button>
          
          <button
            onClick={() => handleSort('category')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              sortConfig.field === 'category'
                ? 'bg-purple-100 text-purple-700 border border-purple-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Category
            {getSortIcon('category')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionFilters;