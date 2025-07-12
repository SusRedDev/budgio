import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navigation from './Navigation';
import MobileMenu from './MobileMenu';
import Header from './Header';
import { Menu } from 'lucide-react';

const Layout = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Dashboard';
      case '/transactions':
        return 'Transactions';
      case '/budget':
        return 'Budget';
      case '/settings':
        return 'Settings';
      case '/chat':
        return 'Chat';
      default:
        return 'Budget Planner';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <div className="flex">
        {/* Desktop Navigation */}
        <Navigation />
        
        {/* Mobile Menu */}
        <MobileMenu 
          isOpen={isMobileMenuOpen} 
          onClose={() => setIsMobileMenuOpen(false)} 
        />
        
        {/* Main Content */}
        <div className="flex-1 lg:ml-64">
          {/* Mobile Header with Menu Button */}
          <div className="lg:hidden flex items-center justify-between p-4 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold text-gray-800">{getPageTitle()}</h1>
            <div className="w-10" /> {/* Spacer for balance */}
          </div>
          
          {/* Desktop Header */}
          <div className="hidden lg:block">
            <Header title={getPageTitle()} />
          </div>
          
          {/* Page Content */}
          <main className="p-4 lg:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;