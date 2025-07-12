import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

const translations = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    transactions: 'Transactions',
    budget: 'Budget',
    settings: 'Settings',
    chat: 'Chat',
    logout: 'Logout',
    
    // Dashboard
    monthlyIncome: 'Monthly Income',
    monthlyExpenses: 'Monthly Expenses',
    netBalance: 'Net Balance',
    savingsRate: 'Savings Rate',
    thisMonth: 'This month',
    expenseBreakdown: 'Expense Breakdown',
    monthlyOverview: 'Monthly Overview',
    recentTransactions: 'Recent Transactions',
    budgetStatus: 'Budget Status',
    
    // Transactions
    allTransactions: 'All Transactions',
    addTransaction: 'Add Transaction',
    transactionType: 'Transaction Type',
    category: 'Category',
    search: 'Search',
    amountRange: 'Amount Range',
    sortBy: 'Sort By',
    date: 'Date',
    amount: 'Amount',
    name: 'Name',
    description: 'Description',
    
    // Budget
    totalBudgeted: 'Total Budgeted',
    totalSpent: 'Total Spent',
    remaining: 'Remaining',
    addBudget: 'Add Budget',
    
    // Settings
    accountSettings: 'Account Settings',
    username: 'Username',
    email: 'Email',
    fullName: 'Full Name',
    travelModeSettings: 'Travel Mode Settings',
    changePassword: 'Change Password',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmPassword: 'Confirm Password',
    save: 'Save',
    dangerZone: 'Danger Zone',
    deleteAccount: 'Delete Account',
    
    // Common
    loading: 'Loading...',
    cancel: 'Cancel',
    confirm: 'Confirm',
    yes: 'Yes',
    no: 'No',
    error: 'Error',
    success: 'Success'
  },
  fr: {
    // Navigation
    dashboard: 'Tableau de bord',
    transactions: 'Transactions',
    budget: 'Budget',
    settings: 'Paramètres',
    chat: 'Chat',
    logout: 'Déconnexion',
    
    // Dashboard
    monthlyIncome: 'Revenus mensuels',
    monthlyExpenses: 'Dépenses mensuelles',
    netBalance: 'Solde net',
    savingsRate: 'Taux d\'épargne',
    thisMonth: 'Ce mois-ci',
    expenseBreakdown: 'Répartition des dépenses',
    monthlyOverview: 'Aperçu mensuel',
    recentTransactions: 'Transactions récentes',
    budgetStatus: 'État du budget',
    
    // Transactions
    allTransactions: 'Toutes les transactions',
    addTransaction: 'Ajouter une transaction',
    transactionType: 'Type de transaction',
    category: 'Catégorie',
    search: 'Rechercher',
    amountRange: 'Plage de montant',
    sortBy: 'Trier par',
    date: 'Date',
    amount: 'Montant',
    name: 'Nom',
    description: 'Description',
    
    // Budget
    totalBudgeted: 'Total budgété',
    totalSpent: 'Total dépensé',
    remaining: 'Restant',
    addBudget: 'Ajouter un budget',
    
    // Settings
    accountSettings: 'Paramètres du compte',
    username: 'Nom d\'utilisateur',
    email: 'E-mail',
    fullName: 'Nom complet',
    travelModeSettings: 'Paramètres du mode voyage',
    changePassword: 'Changer le mot de passe',
    currentPassword: 'Mot de passe actuel',
    newPassword: 'Nouveau mot de passe',
    confirmPassword: 'Confirmer le mot de passe',
    save: 'Enregistrer',
    dangerZone: 'Zone de danger',
    deleteAccount: 'Supprimer le compte',
    
    // Common
    loading: 'Chargement...',
    cancel: 'Annuler',
    confirm: 'Confirmer',
    yes: 'Oui',
    no: 'Non',
    error: 'Erreur',
    success: 'Succès'
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key) => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
  };

  const value = {
    language,
    changeLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};