import React, { useState } from 'react';
import {
  Wallet,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Calendar,
  Sliders,
  DollarSign,
  ArrowRight,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { useExpense } from '../context/ExpenseContext';
import { formatCurrency, getCategoryLabel } from '../utils/formatters';

export const BudgetView: React.FC = () => {
  const {
    monthlyBudget,
    setMonthlyBudget,
    thisMonthExpenses,
    remainingBudget,
    budgetConsumptionPercent,
    isBudgetNearLimit,
    isBudgetExceeded,
    dailySpendingAllowance,
    daysRemainingInMonth,
    currentElapsedDays,
    daysInCurrentMonth,
    categoryBreakdown,
  } = useExpense();

  const [isEditing, setIsEditing] = useState(false);
  const [budgetInput, setBudgetInput] = useState(String(monthlyBudget));
  const [validationError, setValidationError] = useState('');

  const currentDailyBurn = Math.round(thisMonthExpenses / currentElapsedDays);
  const projectedMonthlyTotal = currentDailyBurn * daysInCurrentMonth;

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Number(budgetInput.replace(/,/g, '').trim());
    if (isNaN(parsed) || parsed <= 0) {
      setValidationError('Please enter a valid positive budget amount in ₹.');
      return;
    }
    setValidationError('');
    setMonthlyBudget(parsed);
    setIsEditing(false);
  };

  const handleApplyPreset = (amount: number) => {
    setBudgetInput(String(amount));
    setMonthlyBudget(amount);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Exceeded / Near Limit Status Alert */}
      {isBudgetExceeded && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm">
            <span className="font-semibold text-red-200">Exceeded Monthly Budget: </span>
            <span className="text-red-300">
              You have spent {formatCurrency(thisMonthExpenses)} against your ₹{monthlyBudget.toLocaleString('en-IN')} budget.
              You are currently over by {formatCurrency(Math.abs(remainingBudget))}.
            </span>
          </div>
        </div>
      )}

      {isBudgetNearLimit && !isBudgetExceeded && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm">
            <span className="font-semibold text-amber-200">Budget Warning (80% threshold reached): </span>
            <span className="text-amber-300">
              You have consumed {budgetConsumptionPercent}% of your monthly limit. You have{' '}
              {formatCurrency(remainingBudget)} left for the next {daysRemainingInMonth} days (~{formatCurrency(dailySpendingAllowance)}/day).
            </span>
          </div>
        </div>
      )}

      {!isBudgetNearLimit && !isBudgetExceeded && (
        <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm">
            <span className="font-semibold text-emerald-200">Healthy Budget Pace: </span>
            <span className="text-emerald-300">
              {budgetConsumptionPercent}% consumed so far. You have {formatCurrency(remainingBudget)} remaining with {daysRemainingInMonth} days left in the cycle.
            </span>
          </div>
        </div>
      )}

      {/* Main Budget Card */}
      <div className="p-6 rounded-xl bg-[#121622] border border-[#1C2436] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1C2436]">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-400" />
              <span>Monthly Budget Allocation</span>
            </h3>
            <p className="text-xs text-slate-400">
              Define your spending threshold for the current calendar month
            </p>
          </div>

          {!isEditing && (
            <button
              onClick={() => {
                setBudgetInput(String(monthlyBudget));
                setIsEditing(true);
              }}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-[#1A2335] hover:bg-[#222E46] border border-[#26344E] rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
            >
              Modify Budget
            </button>
          )}
        </div>

        {/* Inline Budget Editor */}
        {isEditing ? (
          <form onSubmit={handleSaveBudget} className="p-4 rounded-lg bg-[#0E131E] border border-[#212C42] space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Set Monthly Spending Target (INR ₹)
              </label>
              <div className="relative max-w-sm">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-slate-400 font-bold">
                  ₹
                </span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={budgetInput}
                  onChange={(e) => {
                    setBudgetInput(e.target.value);
                    setValidationError('');
                  }}
                  className="w-full bg-[#141B2B] border border-[#2A3752] rounded-lg pl-8 pr-4 py-2 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. 25000"
                  autoFocus
                />
              </div>
              {validationError && (
                <p className="text-xs text-red-400 mt-1">{validationError}</p>
              )}
            </div>

            {/* Quick Presets */}
            <div>
              <span className="text-[11px] text-slate-400 block mb-1.5 font-medium">Quick Presets:</span>
              <div className="flex flex-wrap gap-2">
                {[15000, 25000, 35000, 50000, 75000, 100000].map((amt) => (
                  <button
                    type="button"
                    key={amt}
                    onClick={() => handleApplyPreset(amt)}
                    className="px-2.5 py-1 rounded bg-[#182133] hover:bg-[#202C44] border border-[#283652] text-xs font-mono text-slate-300 cursor-pointer"
                  >
                    {formatCurrency(amt)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium cursor-pointer"
              >
                Save Budget
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 text-slate-400 hover:text-white rounded-lg text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-[#0E131E] border border-[#1B2335]">
              <span className="text-xs text-slate-400 block mb-1">Set Target</span>
              <div className="text-2xl font-bold font-mono text-white tabular-nums">
                {formatCurrency(monthlyBudget)}
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">Full monthly cap</span>
            </div>

            <div className="p-4 rounded-lg bg-[#0E131E] border border-[#1B2335]">
              <span className="text-xs text-slate-400 block mb-1">Total Spent So Far</span>
              <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
                {formatCurrency(thisMonthExpenses)}
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">{budgetConsumptionPercent}% of budget</span>
            </div>

            <div className="p-4 rounded-lg bg-[#0E131E] border border-[#1B2335]">
              <span className="text-xs text-slate-400 block mb-1">Remaining Balance</span>
              <div
                className={`text-2xl font-bold font-mono tabular-nums ${
                  remainingBudget < 0 ? 'text-red-400' : 'text-slate-100'
                }`}
              >
                {formatCurrency(remainingBudget)}
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                {remainingBudget >= 0 ? `${100 - budgetConsumptionPercent}% available` : 'Over limit'}
              </span>
            </div>
          </div>
        )}

        {/* Consumption Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium">Budget Consumption</span>
            <span className="font-mono font-bold text-white tabular-nums">{budgetConsumptionPercent}%</span>
          </div>

          <div className="w-full bg-[#0E131E] h-3.5 rounded-full p-0.5 border border-[#1C2436] overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
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
            <span>₹0 (Start of Month)</span>
            <span className="text-amber-400/80">80% Warning Mark</span>
            <span>{formatCurrency(monthlyBudget)}</span>
          </div>
        </div>
      </div>

      {/* Burn Rate & Runway Projections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Daily Spending Allowance */}
        <div className="p-5 rounded-xl bg-[#121622] border border-[#1C2436] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Safe Daily Spending Allowance</span>
            <Calendar className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-white tabular-nums">
              {formatCurrency(dailySpendingAllowance)}
              <span className="text-xs font-sans text-slate-400 font-normal"> / day</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              To remain within budget, limit spending to this amount for the remaining {daysRemainingInMonth} days.
            </p>
          </div>
        </div>

        {/* Projected Monthly Spend */}
        <div className="p-5 rounded-xl bg-[#121622] border border-[#1C2436] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Projected Month-End Spend</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-white tabular-nums">
              {formatCurrency(projectedMonthlyTotal)}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Based on your current burn rate of {formatCurrency(currentDailyBurn)}/day across {currentElapsedDays} elapsed calendar {currentElapsedDays === 1 ? 'day' : 'days'}.
            </p>
          </div>
        </div>
      </div>

      {/* Category Consumption Breakdown */}
      <div className="p-5 rounded-xl bg-[#121622] border border-[#1C2436]">
        <div className="flex items-center justify-between pb-3 border-b border-[#1C2436] mb-4">
          <div>
            <h4 className="text-sm font-semibold text-white">Category Budget Breakdown</h4>
            <p className="text-xs text-slate-400">Distribution of spent amount against your monthly ceiling</p>
          </div>
          <span className="text-xs font-mono text-slate-400">{categoryBreakdown.length} active categories</span>
        </div>

        {categoryBreakdown.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No expenses logged this month.</p>
        ) : (
          <div className="space-y-3">
            {categoryBreakdown.map((cat) => {
              const shareOfBudget = monthlyBudget > 0 ? Math.round((cat.amount / monthlyBudget) * 100) : 0;
              return (
                <div key={cat.category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-200 font-medium">{getCategoryLabel(cat.category)}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-white font-medium">{formatCurrency(cat.amount)}</span>
                      <span className="text-slate-400 font-mono text-[11px] w-12 text-right">
                        {shareOfBudget}% cap
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-[#182133] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${Math.min(100, shareOfBudget)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
