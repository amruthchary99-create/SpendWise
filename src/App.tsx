/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ExpenseProvider, useExpense } from './context/ExpenseContext';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { TransactionsView } from './components/TransactionsView';
import { AnalyticsView } from './components/AnalyticsView';
import { BudgetView } from './components/BudgetView';
import { SettingsView } from './components/SettingsView';
import { AddExpenseModal } from './components/AddExpenseModal';
import { SetBudgetModal } from './components/SetBudgetModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { WelcomeModal } from './components/WelcomeModal';
import { Toast } from './components/Toast';

const AppContent: React.FC = () => {
  const { activeTab } = useExpense();

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'transactions':
        return <TransactionsView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'budget':
        return <BudgetView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0B0E14] text-[#F8FAFC]">
      {/* Desktop Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
          <div className="max-w-6xl mx-auto">
            {renderActiveScreen()}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation & FAB */}
      <BottomNav />

      {/* Global Interactive Modals & Overlays */}
      <AddExpenseModal />
      <SetBudgetModal />
      <DeleteConfirmModal />
      <WelcomeModal />
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <ExpenseProvider>
      <AppContent />
    </ExpenseProvider>
  );
}
