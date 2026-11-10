import React from 'react';
import { Plus, Download, Sparkles } from 'lucide-react';
import { useExpense } from '../context/ExpenseContext';
import { exportTransactionsToCsv } from '../utils/formatters';

export const Header: React.FC = () => {
  const { activeTab, setIsAddExpenseOpen, transactions, showToast } = useExpense();

  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Overview';
      case 'transactions':
        return 'Transaction History';
      case 'analytics':
        return 'Spending Analytics';
      case 'budget':
        return 'Budget Manager';
      case 'settings':
        return 'Settings & Data';
      default:
        return 'SpendWise';
    }
  };

  const handleExport = () => {
    try {
      exportTransactionsToCsv(transactions);
      showToast('Exported transactions to CSV', 'success');
    } catch (err: any) {
      showToast(err.message || 'Export failed', 'error');
    }
  };

  const todayFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header className="h-16 px-4 md:px-8 border-b border-[#1A2333] bg-[#0B0E14]/80 backdrop-blur-md flex items-center justify-between gap-4 sticky top-0 z-20">
      {/* Zone 1: Section Title / Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="md:hidden w-7 h-7 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xs shrink-0">
          ₹
        </div>
        <div className="truncate">
          <h2 className="text-base md:text-lg font-bold text-white tracking-tight truncate">
            {getTitle()}
          </h2>
          <p className="hidden sm:block text-xs text-slate-400 truncate">
            {todayFormatted} · Currency in INR (₹)
          </p>
        </div>
      </div>

      {/* Zone 2: Navigation / Contextual Metadata */}
      <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400">
        <span>Local Privacy First</span>
        <span aria-hidden="true">·</span>
        <span>No Server Sync Required</span>
      </div>

      {/* Zone 3: Primary Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleExport}
          title="Export CSV"
          className="p-2 md:px-3 md:py-2 text-xs font-medium text-slate-300 hover:text-white bg-[#131926] hover:bg-[#1A2335] border border-[#222E44] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
        >
          <Download className="w-4 h-4 text-slate-400" />
          <span className="hidden md:inline">Export CSV</span>
        </button>

        <button
          onClick={() => setIsAddExpenseOpen(true)}
          className="px-3.5 py-2 text-xs md:text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm whitespace-nowrap"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Expense</span>
        </button>
      </div>
    </header>
  );
};
