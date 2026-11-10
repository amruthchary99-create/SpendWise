import React from 'react';
import {
  LayoutDashboard,
  ReceiptText,
  PieChart,
  Wallet,
  Settings,
  Plus,
  TrendingDown,
} from 'lucide-react';
import { useExpense } from '../context/ExpenseContext';
import { NavigationTab } from '../types';
import { formatCurrency } from '../utils/formatters';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    setIsAddExpenseOpen,
    thisMonthExpenses,
    monthlyBudget,
    remainingBudget,
    budgetConsumptionPercent,
  } = useExpense();

  const navItems: { id: NavigationTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: ReceiptText },
    { id: 'analytics', label: 'Analytics', icon: PieChart },
    { id: 'budget', label: 'Budget Manager', icon: Wallet },
    { id: 'settings', label: 'Settings & Data', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-[#0E121B] border-r border-[#1A2333] shrink-0 select-none">
      {/* Brand Zone */}
      <div className="p-6 border-b border-[#1A2333]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 font-bold text-lg shadow-sm">
            ₹
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
              SpendWise
            </h1>
            <p className="text-[11px] text-slate-400 font-medium tracking-wide">
              Take Control of Your Money
            </p>
          </div>
        </div>
      </div>

      {/* Add Expense Action Button */}
      <div className="px-4 pt-5 pb-3">
        <button
          onClick={() => setIsAddExpenseOpen(true)}
          className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-medium text-sm rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors text-left cursor-pointer ${
                isActive
                  ? 'bg-slate-800/70 text-emerald-400 font-semibold border border-slate-700/60'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Monthly Budget Glance in Sidebar */}
      <div className="p-4 mx-3 mb-4 rounded-xl bg-[#131926] border border-[#1E293B]">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-slate-400 font-medium">Monthly Budget</span>
          <span className="text-slate-300 font-mono font-medium">{budgetConsumptionPercent}%</span>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2.5">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              budgetConsumptionPercent >= 100
                ? 'bg-red-500'
                : budgetConsumptionPercent >= 80
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(100, budgetConsumptionPercent)}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>Spent: <span className="font-mono text-slate-300">{formatCurrency(thisMonthExpenses)}</span></span>
          <span>Left: <span className={`font-mono ${remainingBudget < 0 ? 'text-red-400' : 'text-slate-300'}`}>{formatCurrency(remainingBudget)}</span></span>
        </div>
      </div>

      {/* Currency Footer Note */}
      <div className="px-6 py-3 border-t border-[#1A2333] flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <TrendingDown className="w-3.5 h-3.5 text-slate-400" />
          <span>Local Storage Only</span>
        </span>
        <span className="font-mono text-slate-400 font-medium">INR (₹)</span>
      </div>
    </aside>
  );
};
