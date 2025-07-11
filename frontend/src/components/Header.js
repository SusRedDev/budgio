import React from 'react';
import { useBudget } from '../contexts/BudgetContext';
import { MONTHS } from '../data/mockData';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

const Header = ({ title }) => {
  const { currentMonth, currentYear, setCurrentMonth, setCurrentYear } = useBudget();

  const navigateMonth = (direction) => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-white/20 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          <p className="text-gray-600 mt-1">Track your finances with ease</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-xl px-4 py-2 shadow-sm">
            <Calendar className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-gray-700">Current Period</span>
          </div>
          
          <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-xl shadow-sm">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-white/80 rounded-l-xl transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            
            <div className="px-4 py-2 min-w-[140px] text-center">
              <span className="font-semibold text-gray-800">
                {MONTHS[currentMonth]} {currentYear}
              </span>
            </div>
            
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-white/80 rounded-r-xl transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;