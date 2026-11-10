import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Transaction,
  Category,
  PaymentMethod,
  NavigationTab,
  SpendingPulseInsights,
  ToastMessage,
} from '../types';
import { DEFAULT_MONTHLY_BUDGET } from '../utils/constants';
import { generateSampleTransactions } from '../utils/sampleData';
import { getTodayDateString, getCategoryLabel, formatCurrency } from '../utils/formatters';

interface ExpenseContextType {
  transactions: Transaction[];
  monthlyBudget: number;
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  hasCompletedOnboarding: boolean;

  // Modals & Sheets
  isAddExpenseOpen: boolean;
  setIsAddExpenseOpen: (open: boolean) => void;
  editingTransaction: Transaction | null;
  setEditingTransaction: (t: Transaction | null) => void;
  isSetBudgetOpen: boolean;
  setIsSetBudgetOpen: (open: boolean) => void;
  deleteConfirmItem: {
    type: 'single' | 'all' | 'sample';
    transactionId?: string;
    title?: string;
  } | null;
  setDeleteConfirmItem: (item: {
    type: 'single' | 'all' | 'sample';
    transactionId?: string;
    title?: string;
  } | null) => void;
  isWelcomeOpen: boolean;
  setIsWelcomeOpen: (open: boolean) => void;

  // Actions
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (id: string, tx: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  setMonthlyBudget: (budget: number) => void;
  loadSampleData: () => void;
  clearSampleData: () => void;
  clearAllData: () => void;
  completeOnboarding: (seedSample: boolean) => void;

  // Derived Metrics
  todayExpenses: number;
  thisMonthExpenses: number;
  lastMonthExpenses: number;
  remainingBudget: number;
  budgetConsumptionPercent: number;
  isBudgetNearLimit: boolean;
  isBudgetExceeded: boolean;
  dailySpendingAllowance: number;
  daysRemainingInMonth: number;
  currentElapsedDays: number;
  daysInCurrentMonth: number;
  spendingPulse: SpendingPulseInsights;
  categoryBreakdown: { category: Category; amount: number; percentage: number; count: number }[];

  // Toasts
  toasts: ToastMessage[];
  showToast: (message: string, type?: ToastMessage['type']) => void;
  dismissToast: (id: string) => void;
}

const STORAGE_KEY_TX = 'spendwise_transactions_v1';
const STORAGE_KEY_BUDGET = 'spendwise_budget_v1';
const STORAGE_KEY_ONBOARDING = 'spendwise_onboarding_v1';

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Transactions State
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TX);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to read transactions from LocalStorage:', e);
    }
    return [];
  });

  // 2. Budget State
  const [monthlyBudget, setMonthlyBudgetState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BUDGET);
      if (saved) {
        const val = Number(saved);
        if (!isNaN(val) && val > 0) return val;
      }
    } catch (e) {
      console.error('Failed to read budget from LocalStorage:', e);
    }
    return DEFAULT_MONTHLY_BUDGET;
  });

  // 3. Onboarding State
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_ONBOARDING) === 'true';
    } catch {
      return false;
    }
  });

  // Navigation
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');

  // UI Modals
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isSetBudgetOpen, setIsSetBudgetOpen] = useState(false);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<{
    type: 'single' | 'all' | 'sample';
    transactionId?: string;
    title?: string;
  } | null>(null);
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(!hasCompletedOnboarding);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: ToastMessage['type'] = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Save transactions to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TX, JSON.stringify(transactions));
    } catch (e) {
      console.error('Failed to save transactions to LocalStorage:', e);
      showToast('Storage quota exceeded or unavailable', 'error');
    }
  }, [transactions, showToast]);

  // Save budget to LocalStorage
  const setMonthlyBudget = useCallback((newBudget: number) => {
    const val = Math.max(1, Math.round(newBudget));
    setMonthlyBudgetState(val);
    try {
      localStorage.setItem(STORAGE_KEY_BUDGET, String(val));
      showToast(`Monthly budget updated to ₹${val.toLocaleString('en-IN')}`, 'success');
    } catch (e) {
      console.error('Failed to save budget:', e);
    }
  }, [showToast]);

  // Complete onboarding
  const completeOnboarding = useCallback((seedSample: boolean) => {
    try {
      localStorage.setItem(STORAGE_KEY_ONBOARDING, 'true');
    } catch (e) {
      console.error(e);
    }
    setHasCompletedOnboarding(true);
    setIsWelcomeOpen(false);

    if (seedSample) {
      const samples = generateSampleTransactions();
      setTransactions(samples);
      showToast('Loaded sample data! Explore the dashboard.', 'success');
    } else {
      setTransactions([]);
      showToast('Blank canvas ready. Start by adding your first expense!', 'info');
    }
  }, [showToast]);

  // Add Transaction
  const addTransaction = useCallback((tx: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      createdAt: Date.now(),
    };
    setTransactions((prev) => [newTx, ...prev]);
    showToast(`Added "${tx.title}" — ₹${tx.amount.toLocaleString('en-IN')}`, 'success');
  }, [showToast]);

  // Update Transaction
  const updateTransaction = useCallback((id: string, updated: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updated } : t))
    );
    showToast('Transaction updated successfully', 'success');
  }, [showToast]);

  // Delete Transaction
  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    showToast('Transaction removed', 'info');
  }, [showToast]);

  // Load sample data
  const loadSampleData = useCallback(() => {
    const samples = generateSampleTransactions();
    setTransactions((prev) => {
      // Keep real non-sample user transactions if any, prepend samples
      const userOnly = prev.filter((t) => !t.isSample);
      return [...userOnly, ...samples];
    });
    showToast('Sample transactions loaded', 'success');
  }, [showToast]);

  // Clear sample data
  const clearSampleData = useCallback(() => {
    setTransactions((prev) => prev.filter((t) => !t.isSample));
    showToast('Sample transactions cleared', 'info');
  }, [showToast]);

  // Clear all data
  const clearAllData = useCallback(() => {
    setTransactions([]);
    showToast('All transaction records cleared', 'info');
  }, [showToast]);

  // Current date calculations
  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthKey = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;

  const todayStr = getTodayDateString();

  // Metrics
  const todayExpenses = useMemo(() => {
    return transactions
      .filter((t) => t.date === todayStr)
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, todayStr]);

  const thisMonthTransactions = useMemo(() => {
    return transactions.filter((t) => t.date.startsWith(currentMonthKey));
  }, [transactions, currentMonthKey]);

  const thisMonthExpenses = useMemo(() => {
    return thisMonthTransactions.reduce((sum, t) => sum + t.amount, 0);
  }, [thisMonthTransactions]);

  const lastMonthExpenses = useMemo(() => {
    return transactions
      .filter((t) => t.date.startsWith(prevMonthKey))
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, prevMonthKey]);

  const remainingBudget = monthlyBudget - thisMonthExpenses;
  const budgetConsumptionPercent = monthlyBudget > 0
    ? Math.round((thisMonthExpenses / monthlyBudget) * 100)
    : (thisMonthExpenses > 0 ? 100 : 0);

  const isBudgetNearLimit = monthlyBudget > 0 && budgetConsumptionPercent >= 80 && budgetConsumptionPercent < 100;
  const isBudgetExceeded = (monthlyBudget > 0 && budgetConsumptionPercent >= 100) || (monthlyBudget === 0 && thisMonthExpenses > 0);

  const daysInCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const currentElapsedDays = Math.max(1, now.getDate());
  const daysRemainingInMonth = Math.max(1, daysInCurrentMonth - currentElapsedDays);
  const dailySpendingAllowance = remainingBudget > 0
    ? Math.round(remainingBudget / daysRemainingInMonth)
    : 0;

  // Category breakdown this month
  const categoryBreakdown = useMemo(() => {
    const map: Record<Category, { amount: number; count: number }> = {
      Food: { amount: 0, count: 0 },
      Transport: { amount: 0, count: 0 },
      Shopping: { amount: 0, count: 0 },
      Education: { amount: 0, count: 0 },
      Entertainment: { amount: 0, count: 0 },
      Health: { amount: 0, count: 0 },
      Bills: { amount: 0, count: 0 },
      Travel: { amount: 0, count: 0 },
      Other: { amount: 0, count: 0 },
    };

    thisMonthTransactions.forEach((t) => {
      if (map[t.category]) {
        map[t.category].amount += t.amount;
        map[t.category].count += 1;
      }
    });

    const total = thisMonthExpenses || 1; // avoid divide by zero

    return Object.entries(map)
      .map(([cat, data]) => ({
        category: cat as Category,
        amount: data.amount,
        count: data.count,
        percentage: thisMonthExpenses > 0 ? Math.round((data.amount / total) * 100) : 0,
      }))
      .filter((item) => item.amount > 0)
      .sort((a, b) => b.amount - a.amount);
  }, [thisMonthTransactions, thisMonthExpenses]);

  // Spending Pulse Calculations (Real local data analytics)
  const spendingPulse = useMemo<SpendingPulseInsights>(() => {
    const hasSufficientData = thisMonthTransactions.length >= 2;

    const dailyAverageThisMonth = thisMonthTransactions.length > 0
      ? Math.round(thisMonthExpenses / currentElapsedDays)
      : 0;

    // Highest category
    const highestCategory = categoryBreakdown.length > 0
      ? {
          category: categoryBreakdown[0].category,
          categoryLabel: getCategoryLabel(categoryBreakdown[0].category),
          amount: categoryBreakdown[0].amount,
          percentage: categoryBreakdown[0].percentage,
        }
      : null;

    // Most expensive transaction this month
    let mostExpensiveTransaction: Transaction | null = null;
    if (thisMonthTransactions.length > 0) {
      mostExpensiveTransaction = thisMonthTransactions.reduce((max, t) =>
        t.amount > (max?.amount || 0) ? t : max,
        thisMonthTransactions[0]
      );
    }

    // Previous month comparison
    const hasPrevData = lastMonthExpenses > 0;
    const diff = thisMonthExpenses - lastMonthExpenses;
    const pctChange = hasPrevData
      ? Math.round((diff / lastMonthExpenses) * 100)
      : 0;

    // Actionable smart suggestions based strictly on actual user data
    let actionableSuggestion = 'No transactions logged this month yet. Log an expense to activate Spending Pulse insights.';

    if (thisMonthTransactions.length === 1) {
      actionableSuggestion = 'Personalized comparisons and habit insights require at least two transactions this month. Log another expense to activate pattern analysis.';
    } else if (hasSufficientData) {
      if (budgetConsumptionPercent >= 100) {
        actionableSuggestion = `Budget alert: You've crossed 100% of your ₹${monthlyBudget.toLocaleString('en-IN')} budget. Limit non-essential purchases like Shopping & Entertainment for the remaining ${daysRemainingInMonth} days.`;
      } else if (budgetConsumptionPercent >= 80) {
        actionableSuggestion = `Caution: 80% budget consumed. To stay on track for the remaining ${daysRemainingInMonth} days, keep spending under ₹${dailySpendingAllowance.toLocaleString('en-IN')}/day.`;
      } else if (highestCategory && highestCategory.category === 'Food' && highestCategory.percentage >= 40) {
        actionableSuggestion = `${highestCategory.categoryLabel} represents ${highestCategory.percentage}% of your expenses. Cooking meals at home or batch-prepping can save ~₹${Math.round(highestCategory.amount * 0.25).toLocaleString('en-IN')} this month.`;
      } else if (highestCategory && highestCategory.category === 'Shopping' && highestCategory.percentage >= 35) {
        actionableSuggestion = `${highestCategory.categoryLabel} makes up ${highestCategory.percentage}% of spending. Implement a 48-hour cooling-off rule before buying discretionary items.`;
      } else if (hasPrevData && pctChange < 0) {
        actionableSuggestion = `Pace is strong: Spending is down ${Math.abs(pctChange)}% compared to last month (${formatCurrency(lastMonthExpenses)}). You're projected to save surplus funds this cycle.`;
      } else if (hasPrevData && pctChange > 25) {
        actionableSuggestion = `Spending has risen ${pctChange}% compared to last month (${formatCurrency(lastMonthExpenses)}). Review your top expenses to verify if these were planned one-offs.`;
      } else {
        actionableSuggestion = `Balanced pace: Spending ~₹${dailyAverageThisMonth.toLocaleString('en-IN')}/day across ${currentElapsedDays} elapsed calendar ${currentElapsedDays === 1 ? 'day' : 'days'}. You have ~₹${dailySpendingAllowance.toLocaleString('en-IN')}/day available for the remaining ${daysRemainingInMonth} days.`;
      }
    }

    return {
      highestCategory,
      dailyAverageThisMonth,
      elapsedDaysThisMonth: currentElapsedDays,
      mostExpensiveTransaction,
      previousMonthComparison: {
        hasData: hasPrevData,
        prevMonthTotal: lastMonthExpenses,
        difference: diff,
        percentageChange: pctChange,
      },
      budgetConsumptionPercent,
      actionableSuggestion,
      hasSufficientData,
      totalTransactionsThisMonth: thisMonthTransactions.length,
    };
  }, [
    thisMonthTransactions,
    thisMonthExpenses,
    categoryBreakdown,
    lastMonthExpenses,
    monthlyBudget,
    remainingBudget,
    budgetConsumptionPercent,
    currentElapsedDays,
    daysRemainingInMonth,
    dailySpendingAllowance,
  ]);

  return (
    <ExpenseContext.Provider
      value={{
        transactions,
        monthlyBudget,
        activeTab,
        setActiveTab,
        hasCompletedOnboarding,

        isAddExpenseOpen,
        setIsAddExpenseOpen,
        editingTransaction,
        setEditingTransaction,
        isSetBudgetOpen,
        setIsSetBudgetOpen,
        deleteConfirmItem,
        setDeleteConfirmItem,
        isWelcomeOpen,
        setIsWelcomeOpen,

        addTransaction,
        updateTransaction,
        deleteTransaction,
        setMonthlyBudget,
        loadSampleData,
        clearSampleData,
        clearAllData,
        completeOnboarding,

        todayExpenses,
        thisMonthExpenses,
        lastMonthExpenses,
        remainingBudget,
        budgetConsumptionPercent,
        isBudgetNearLimit,
        isBudgetExceeded,
        dailySpendingAllowance,
        daysRemainingInMonth,
        currentElapsedDays,
        daysInCurrentMonth,
        spendingPulse,
        categoryBreakdown,

        toasts,
        showToast,
        dismissToast,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpense = (): ExpenseContextType => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpense must be used within an ExpenseProvider');
  }
  return context;
};
