export const mockTransactions = [
  {
    id: '1',
    type: 'income',
    category: 'Salary',
    amount: 5000,
    description: 'Monthly salary',
    date: '2025-01-15',
    createdAt: '2025-01-15T10:00:00Z'
  },
  {
    id: '2',
    type: 'expense',
    category: 'Food',
    amount: 120,
    description: 'Grocery shopping',
    date: '2025-01-14',
    createdAt: '2025-01-14T15:30:00Z'
  },
  {
    id: '3',
    type: 'expense',
    category: 'Transportation',
    amount: 45,
    description: 'Gas station',
    date: '2025-01-13',
    createdAt: '2025-01-13T08:45:00Z'
  },
  {
    id: '4',
    type: 'income',
    category: 'Freelance',
    amount: 800,
    description: 'Website design project',
    date: '2025-01-12',
    createdAt: '2025-01-12T14:20:00Z'
  },
  {
    id: '5',
    type: 'expense',
    category: 'Entertainment',
    amount: 25,
    description: 'Movie tickets',
    date: '2025-01-11',
    createdAt: '2025-01-11T19:00:00Z'
  },
  {
    id: '6',
    type: 'expense',
    category: 'Housing',
    amount: 1200,
    description: 'Monthly rent',
    date: '2025-01-01',
    createdAt: '2025-01-01T09:00:00Z'
  },
  {
    id: '7',
    type: 'expense',
    category: 'Utilities',
    amount: 85,
    description: 'Electricity bill',
    date: '2025-01-05',
    createdAt: '2025-01-05T11:30:00Z'
  },
  {
    id: '8',
    type: 'expense',
    category: 'Healthcare',
    amount: 60,
    description: 'Pharmacy',
    date: '2025-01-08',
    createdAt: '2025-01-08T16:45:00Z'
  }
];

export const mockBudgets = [
  { category: 'Food', amount: 400 },
  { category: 'Transportation', amount: 200 },
  { category: 'Entertainment', amount: 150 },
  { category: 'Housing', amount: 1200 },
  { category: 'Utilities', amount: 150 },
  { category: 'Healthcare', amount: 200 },
  { category: 'Shopping', amount: 300 },
];

export const CATEGORIES = {
  income: ['Salary', 'Freelance', 'Business', 'Investment', 'Other'],
  expense: ['Food', 'Housing', 'Transportation', 'Entertainment', 'Healthcare', 'Utilities', 'Shopping', 'Other']
};

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];