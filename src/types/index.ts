export type Category =
  | 'Food'
  | 'Transport'
  | 'Shopping'
  | 'Education'
  | 'Entertainment'
  | 'Health'
  | 'Bills'
  | 'Travel'
  | 'Other';

export type PaymentMethod =
  | 'Cash'
  | 'UPI'
  | 'Debit Card'
  | 'Credit Card'
  | 'Other';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  category: Category;
  paymentMethod: PaymentMethod;
  date: string; // ISO date format: YYYY-MM-DD
  notes?: string;
  isSample?: boolean;
  createdAt: number;
}

export interface SpendingPulseInsights {
  highestCategory: {
    category: Category;
    categoryLabel: string;
    amount: number;
    percentage: number;
  } | null;
  dailyAverageThisMonth: number;
  elapsedDaysThisMonth: number;
  mostExpensiveTransaction: Transaction | null;
  previousMonthComparison: {
    hasData: boolean;
    prevMonthTotal: number;
    difference: number;
    percentageChange: number; // e.g. +12% or -8%
  };
  budgetConsumptionPercent: number;
  actionableSuggestion: string;
  hasSufficientData: boolean;
  totalTransactionsThisMonth: number;
}

export type NavigationTab =
  | 'dashboard'
  | 'transactions'
  | 'analytics'
  | 'budget'
  | 'settings';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
}
