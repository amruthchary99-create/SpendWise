import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Wallet,
  Activity,
  ArrowRight,
  Plus,
  AlertTriangle,
  Receipt,
  Download,
  Sliders,
  ChevronRight,
  Info,
  Clock,
  Tag,
} from 'lucide-react';
import { useExpense } from '../context/ExpenseContext';
import { formatCurrency, formatDate, getCategoryLabel, toTitleCase } from '../utils/formatters';
import { CATEGORIES } from '../utils/constants';
import { exportTransactionsToCsv } from '../utils/formatters';

export const DashboardView: React.FC = () => {
  const {
    todayExpenses,
    thisMonthExpenses,
    monthlyBudget,
    remainingBudget,
    budgetConsumptionPercent,
    isBudgetNearLimit,
    isBudgetExceeded,
    transactions,
    spendingPulse,
    categoryBreakdown,
    setActiveTab,
    setIsAddExpenseOpen,
    setEditingTransaction,
    setDeleteConfirmItem,
    setIsSetBudgetOpen,
    showToast,
  } = useExpense();

  // Recent 6 transactions
  const recentTransactions = transactions.slice(0, 6);

  const handleExportCsv = () => {
    try {
      exportTransactionsToCsv(transactions);
      showToast('Exported transactions to CSV', 'success');
    } catch (err: any) {
      showToast(err.message || 'Export failed', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Budget Warning Banner if approaching or exceeded */}
      {isBudgetExceeded && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm">
            <span className="font-semibold text-red-200">Budget Limit Exceeded: </span>
            <span className="text-red-300">
              You have spent {formatCurrency(thisMonthExpenses)}, exceeding your monthly budget of{' '}
              {formatCurrency(monthlyBudget)} by {formatCurrency(Math.abs(remainingBudget))}.
            </span>
          </div>
        </div>
      )}

      {isBudgetNearLimit && !isBudgetExceeded && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm">
            <span className="font-semibold text-amber-200">Budget Warning: </span>
            <span className="text-amber-300">
              You have consumed {budgetConsumptionPercent}% of your monthly budget. Only{' '}
              {formatCurrency(remainingBudget)} remaining this month.
            </span>
          </div>
        </div>
      )}

      {/* 1. Core Summary Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* Today's Expense */}
        <div className="p-4 md:p-5 rounded-xl bg-[#121622] border border-[#1C2436] flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Expenses Today</span>
            <Calendar className="w-4 h-4 text-slate-400" />
          </div>
          <div>
            <div className="text-xl md:text-2xl font-bold font-mono text-white tabular-nums tracking-tight">
              {formatCurrency(todayExpenses)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Logged today
            </p>
          </div>
        </div>

        {/* This Month's Expense */}
        <div className="p-4 md:p-5 rounded-xl bg-[#121622] border border-[#1C2436] flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>This Month</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-xl md:text-2xl font-bold font-mono text-emerald-400 tabular-nums tracking-tight">
              {formatCurrency(thisMonthExpenses)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {spendingPulse.totalTransactionsThisMonth} transactions this cycle
            </p>
          </div>
        </div>

        {/* Monthly Budget */}
        <div className="p-4 md:p-5 rounded-xl bg-[#121622] border border-[#1C2436] flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Monthly Budget</span>
            <button
              onClick={() => setIsSetBudgetOpen(true)}
              className="text-[11px] text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
            >
              Edit
            </button>
          </div>
          <div>
            <div className="text-xl md:text-2xl font-bold font-mono text-white tabular-nums tracking-tight">
              {formatCurrency(monthlyBudget)}
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  budgetConsumptionPercent >= 100
                    ? 'bg-red-500'
                    : budgetConsumptionPercent >= 80
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, budgetConsumptionPercent)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Remaining Budget */}
        <div className="p-4 md:p-5 rounded-xl bg-[#121622] border border-[#1C2436] flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Remaining Budget</span>
            <Wallet className="w-4 h-4 text-slate-400" />
          </div>
          <div>
            <div
              className={`text-xl md:text-2xl font-bold font-mono tabular-nums tracking-tight ${
                remainingBudget < 0 ? 'text-red-400' : 'text-slate-100'
              }`}
            >
              {formatCurrency(remainingBudget)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {budgetConsumptionPercent}% consumed
            </p>
          </div>
        </div>
      </div>

      {/* 2. SPENDING PULSE – SIGNATURE FEATURE */}
      <div className="rounded-xl bg-gradient-to-b from-[#131B2A] to-[#0F1420] border border-[#1F2B42] p-5 md:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#1C263B]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm md:text-base font-semibold text-white tracking-tight">
                  Spending Pulse
                </h3>
                <span className="text-[10px] font-medium text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded">
                  Smart Insights
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Contextual analysis of your local transaction patterns
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('analytics')}
            className="text-xs font-medium text-slate-300 hover:text-white flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>Detailed Analytics</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Pulse Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-4">
          {/* Highest Category */}
          <div className="p-3.5 rounded-lg bg-[#0E131E] border border-[#1B2335]">
            <span className="text-[11px] text-slate-400 block mb-1">Top Expense Category</span>
            {spendingPulse.highestCategory ? (
              <div>
                <span className="text-sm font-semibold text-white">
                  {spendingPulse.highestCategory.categoryLabel}
                </span>
                <div className="text-xs text-slate-400 mt-0.5">
                  <span className="font-mono text-slate-300">
                    {formatCurrency(spendingPulse.highestCategory.amount)}
                  </span>{' '}
                  ({spendingPulse.highestCategory.percentage}% of total)
                </div>
              </div>
            ) : (
              <span className="text-xs text-slate-400">No data yet</span>
            )}
          </div>

          {/* Daily Average */}
          <div className="p-3.5 rounded-lg bg-[#0E131E] border border-[#1B2335]">
            <span className="text-[11px] text-slate-400 block mb-1">Daily Burn Rate</span>
            <div>
              <span className="text-sm font-semibold font-mono text-white tabular-nums">
                {formatCurrency(spendingPulse.dailyAverageThisMonth)}
                <span className="text-xs font-sans text-slate-400 font-normal"> / day</span>
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {spendingPulse.totalTransactionsThisMonth > 0
                  ? `Calculated across ${spendingPulse.elapsedDaysThisMonth} elapsed calendar ${spendingPulse.elapsedDaysThisMonth === 1 ? 'day' : 'days'} this month`
                  : 'No expenses logged this month'}
              </p>
            </div>
          </div>

          {/* Peak Transaction */}
          <div className="p-3.5 rounded-lg bg-[#0E131E] border border-[#1B2335]">
            <span className="text-[11px] text-slate-400 block mb-1">Peak Single Expense</span>
            {spendingPulse.mostExpensiveTransaction ? (
              <div className="truncate">
                <span className="text-sm font-semibold text-white truncate block">
                  {toTitleCase(spendingPulse.mostExpensiveTransaction.title)}
                </span>
                <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5 truncate">
                  <span className="font-mono text-emerald-400 font-medium">
                    {formatCurrency(spendingPulse.mostExpensiveTransaction.amount)}
                  </span>
                  <span>·</span>
                  <span className="truncate">{getCategoryLabel(spendingPulse.mostExpensiveTransaction.category)}</span>
                </div>
              </div>
            ) : (
              <span className="text-xs text-slate-400">No entries yet</span>
            )}
          </div>

          {/* Month over Month */}
          <div className="p-3.5 rounded-lg bg-[#0E131E] border border-[#1B2335]">
            <span className="text-[11px] text-slate-400 block mb-1">vs. Last Month</span>
            {spendingPulse.previousMonthComparison.hasData ? (
              <div>
                <div className="flex items-center gap-1.5 text-sm font-semibold">
                  {spendingPulse.previousMonthComparison.percentageChange > 0 ? (
                    <span className="text-amber-400 flex items-center">
                      <TrendingUp className="w-3.5 h-3.5 mr-1" />
                      +{spendingPulse.previousMonthComparison.percentageChange}%
                    </span>
                  ) : spendingPulse.previousMonthComparison.percentageChange < 0 ? (
                    <span className="text-emerald-400 flex items-center">
                      <TrendingDown className="w-3.5 h-3.5 mr-1" />
                      {spendingPulse.previousMonthComparison.percentageChange}%
                    </span>
                  ) : (
                    <span className="text-slate-300">0% (Equal)</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Last month: {formatCurrency(spendingPulse.previousMonthComparison.prevMonthTotal)}
                </p>
              </div>
            ) : (
              <div>
                <span className="text-xs text-slate-400">First tracked cycle</span>
                <p className="text-[11px] text-slate-400 mt-0.5">Comparative trends will appear next month</p>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Contextual Suggestion */}
        <div className="p-3 rounded-lg bg-[#0A0E17] border border-[#182033] flex items-start gap-2.5">
          <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-300 leading-relaxed">
            {spendingPulse.actionableSuggestion}
          </p>
        </div>
      </div>

      {/* 3. Quick Actions Strip */}
      <div className="p-4 rounded-xl bg-[#121622] border border-[#1C2436]">
        <div className="text-xs font-semibold text-slate-300 mb-3 uppercase tracking-wider">
          Quick Actions
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          <button
            onClick={() => setIsAddExpenseOpen(true)}
            className="p-3 rounded-lg bg-[#182030] hover:bg-[#1E283E] active:bg-[#25324E] border border-[#232F46] text-left transition-colors cursor-pointer group"
          >
            <Plus className="w-4 h-4 text-emerald-400 mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-semibold text-white">Add Expense</div>
            <div className="text-[10px] text-slate-400">Log new payment</div>
          </button>

          <button
            onClick={() => setIsSetBudgetOpen(true)}
            className="p-3 rounded-lg bg-[#182030] hover:bg-[#1E283E] active:bg-[#25324E] border border-[#232F46] text-left transition-colors cursor-pointer group"
          >
            <Sliders className="w-4 h-4 text-blue-400 mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-semibold text-white">Set Budget</div>
            <div className="text-[10px] text-slate-400">Adjust limits</div>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className="p-3 rounded-lg bg-[#182030] hover:bg-[#1E283E] active:bg-[#25324E] border border-[#232F46] text-left transition-colors cursor-pointer group"
          >
            <TrendingUp className="w-4 h-4 text-purple-400 mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-semibold text-white">Analytics</div>
            <div className="text-[10px] text-slate-400">Charts & trends</div>
          </button>

          <button
            onClick={() => setActiveTab('transactions')}
            className="p-3 rounded-lg bg-[#182030] hover:bg-[#1E283E] active:bg-[#25324E] border border-[#232F46] text-left transition-colors cursor-pointer group"
          >
            <Receipt className="w-4 h-4 text-amber-400 mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-semibold text-white">Transactions</div>
            <div className="text-[10px] text-slate-400">Search & filter</div>
          </button>

          <button
            onClick={handleExportCsv}
            className="p-3 rounded-lg bg-[#182030] hover:bg-[#1E283E] active:bg-[#25324E] border border-[#232F46] text-left transition-colors cursor-pointer group col-span-2 sm:col-span-1"
          >
            <Download className="w-4 h-4 text-teal-400 mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-semibold text-white">Export Data</div>
            <div className="text-[10px] text-slate-400">Download CSV</div>
          </button>
        </div>
      </div>

      {/* 4. Two-Column Split: Category Breakdown + Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Spending by Category (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-xl bg-[#121622] border border-[#1C2436] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#1C2436]">
              <div>
                <h3 className="text-sm font-semibold text-white">Spending by Category</h3>
                <p className="text-xs text-slate-400">This month's allocation</p>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {categoryBreakdown.length} active
              </span>
            </div>

            {categoryBreakdown.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                <Tag className="w-8 h-8 mx-auto text-slate-400 mb-2 opacity-50" />
                No expenses logged for this month yet.
              </div>
            ) : (
              <div className="space-y-3.5 mt-4">
                {categoryBreakdown.map((item) => {
                  const catMeta = CATEGORIES.find((c) => c.id === item.category);
                  const Icon = catMeta?.icon || Tag;
                  return (
                    <div key={item.category} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded flex items-center justify-center"
                            style={{ backgroundColor: catMeta?.bgLight || 'rgba(255,255,255,0.05)' }}
                          >
                            <Icon className="w-3.5 h-3.5" style={{ color: catMeta?.color || '#94A3B8' }} />
                          </div>
                          <span className="font-medium text-slate-200">{catMeta?.label || item.category}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-white font-medium tabular-nums">
                            {formatCurrency(item.amount)}
                          </span>
                          <span className="text-slate-400 text-[11px] w-8 text-right font-mono">
                            {item.percentage}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-[#1A2334] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${item.percentage}%`,
                            backgroundColor: catMeta?.color || '#10B981',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-[#1C2436] flex items-center justify-between text-xs text-slate-400">
            <span>Total allocated this month</span>
            <span className="font-mono text-emerald-400 font-semibold">
              {formatCurrency(thisMonthExpenses)}
            </span>
          </div>
        </div>

        {/* Recent Transactions (7 cols) */}
        <div className="lg:col-span-7 p-5 rounded-xl bg-[#121622] border border-[#1C2436] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#1C2436]">
              <div>
                <h3 className="text-sm font-semibold text-white">Recent Transactions</h3>
                <p className="text-xs text-slate-400">Latest expense entries</p>
              </div>
              <button
                onClick={() => setActiveTab('transactions')}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 cursor-pointer"
              >
                <span>View All ({transactions.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentTransactions.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                <Receipt className="w-8 h-8 mx-auto text-slate-400 mb-2 opacity-50" />
                <p>No transactions yet.</p>
                <button
                  onClick={() => setIsAddExpenseOpen(true)}
                  className="mt-3 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium cursor-pointer inline-flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add First Expense</span>
                </button>
              </div>
            ) : (
              <div className="divide-y divide-[#1A2334] mt-2">
                {recentTransactions.map((tx) => {
                  const catMeta = CATEGORIES.find((c) => c.id === tx.category);
                  const Icon = catMeta?.icon || Tag;
                  return (
                    <div
                      key={tx.id}
                      className="py-3 flex items-center justify-between gap-3 group hover:bg-[#151B29] px-2 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: catMeta?.bgLight || 'rgba(255,255,255,0.05)' }}
                        >
                          <Icon className="w-4 h-4" style={{ color: catMeta?.color || '#94A3B8' }} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-white truncate block">
                              {toTitleCase(tx.title)}
                            </span>
                            {tx.isSample && (
                              <span className="text-[9px] bg-slate-800 text-slate-400 border border-slate-700 px-1 rounded uppercase tracking-wider">
                                Demo
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <span className="text-slate-300 font-medium">{getCategoryLabel(tx.category)}</span>
                            <span>·</span>
                            <span>{formatDate(tx.date)}</span>
                            <span>·</span>
                            <span>{tx.paymentMethod}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0 flex items-center gap-3">
                        <span className="font-mono text-sm font-semibold text-white tabular-nums">
                          {formatCurrency(tx.amount)}
                        </span>
                        <div className="hidden group-hover:flex items-center gap-1">
                          <button
                            onClick={() => setEditingTransaction(tx)}
                            className="p-1 hover:text-emerald-400 text-slate-400 text-[11px] cursor-pointer"
                            title="Edit"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() =>
                              setDeleteConfirmItem({
                                type: 'single',
                                transactionId: tx.id,
                                title: tx.title,
                              })
                            }
                            className="p-1 hover:text-red-400 text-slate-400 text-[11px] cursor-pointer"
                            title="Delete"
                          >
                            Del
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-[#1C2436] text-right">
            <button
              onClick={() => setActiveTab('transactions')}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              Browse complete ledger →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
