import React from 'react';
import PeriodFilter from './PeriodFilter';

const Header = ({ title }) => {
  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-white/20 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          <p className="text-gray-600 mt-1">Track your finances with ease</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-xl px-4 py-2 shadow-sm">
            <span className="text-sm text-gray-700">Current Period</span>
          </div>
          
          <PeriodFilter />
        </div>
      </div>
    </header>
  );
};

export default Header;