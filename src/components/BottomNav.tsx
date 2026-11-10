import React from 'react';
import {
  LayoutDashboard,
  ReceiptText,
  PieChart,
  Wallet,
  Settings,
  Plus,
} from 'lucide-react';
import { useExpense } from '../context/ExpenseContext';
import { NavigationTab } from '../types';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, setIsAddExpenseOpen } = useExpense();

  const items: { id: NavigationTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Expenses', icon: ReceiptText },
    { id: 'analytics', label: 'Analytics', icon: PieChart },
    { id: 'budget', label: 'Budget', icon: Wallet },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Floating Add Expense Button for Mobile */}
      <div className="md:hidden fixed bottom-20 right-4 z-40">
        <button
          onClick={() => setIsAddExpenseOpen(true)}
          className="w-13 h-13 rounded-full bg-emerald-600 active:bg-emerald-700 text-white shadow-lg shadow-emerald-900/40 flex items-center justify-center cursor-pointer border border-emerald-400/30"
          aria-label="Add Expense"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>

      {/* Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#0E121B]/95 backdrop-blur-md border-t border-[#1A2333] px-2 py-1.5 flex items-center justify-around safe-area-bottom">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-2 min-w-[56px] min-h-[48px] rounded-lg transition-colors cursor-pointer ${
                isActive ? 'text-emerald-400' : 'text-slate-400 active:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 mb-1 ${isActive ? 'text-emerald-400 stroke-[2.2]' : 'text-slate-400'}`} />
              <span className={`text-[10px] tracking-tight ${isActive ? 'font-semibold text-emerald-400' : 'font-normal'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
