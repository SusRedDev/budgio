import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  CreditCard, 
  PiggyBank, 
  TrendingUp,
  Settings,
  LogOut,
  Shield,
  X
} from 'lucide-react';

const MobileMenu = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user, logout, isPanicMode } = useAuth();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/transactions', label: 'Transactions', icon: CreditCard },
    { path: '/budget', label: 'Budget', icon: PiggyBank },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    onClose();
  };

  const handleNavClick = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Menu */}
      <div className="fixed left-0 top-0 h-full w-80 bg-white/95 backdrop-blur-xl shadow-2xl">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-purple-600 bg-clip-text text-transparent">
                Budget Planner
              </h1>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* User info */}
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-medium text-gray-800">
                {user?.full_name || user?.username}
              </p>
              {isPanicMode && (
                <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Panic
                </span>
              )}
            </div>
            <p className="text-xs text-gray-600">{user?.email}</p>
          </div>
          
          {/* Navigation */}
          <ul className="space-y-2">
            {navItems.map(({ path, label, icon: Icon }) => (
              <li key={path}>
                <Link
                  to={path}
                  onClick={handleNavClick}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    location.pathname === path
                      ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg'
                      : 'hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100 text-gray-700'
                  }`}
                >
                  <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                    location.pathname === path ? 'text-white' : 'text-gray-500'
                  }`} />
                  <span className="font-medium">{label}</span>
                </Link>
              </li>
            ))}
          </ul>

          {/* Logout button */}
          <div className="mt-8">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group w-full text-left hover:bg-red-50 text-gray-700 hover:text-red-600"
            >
              <LogOut className="w-5 h-5 text-gray-500 group-hover:text-red-600 transition-colors" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;