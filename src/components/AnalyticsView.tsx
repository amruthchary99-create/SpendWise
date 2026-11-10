import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  PieChart as PieIcon,
  BarChart3,
  Calendar,
  CreditCard,
  Info,
} from 'lucide-react';
import { useExpense } from '../context/ExpenseContext';
import { CATEGORIES } from '../utils/constants';
import { formatCurrency, getCategoryLabel, toTitleCase } from '../utils/formatters';
import { Category } from '../types';

export const AnalyticsView: React.FC = () => {
  const { transactions, thisMonthExpenses, lastMonthExpenses } = useExpense();

  // Active timeframe selector: current month, last month, or all time
  const [timeframe, setTimeframe] = useState<'this-month' | 'last-month' | 'all'>('this-month');
  const [hoveredDay, setHoveredDay] = useState<{ day: number; amount: number; dateStr: string; label?: string } | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthKey = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;

  // Timeframe transactions
  const activeTransactions = useMemo(() => {
    if (timeframe === 'this-month') {
      return transactions.filter((t) => t.date.startsWith(currentMonthKey));
    }
    if (timeframe === 'last-month') {
      return transactions.filter((t) => t.date.startsWith(prevMonthKey));
    }
    return transactions;
  }, [transactions, timeframe, currentMonthKey, prevMonthKey]);

  const totalSpent = useMemo(() => {
    return activeTransactions.reduce((sum, t) => sum + t.amount, 0);
  }, [activeTransactions]);

  // Highest-value transaction in active timeframe
  const peakTransaction = useMemo(() => {
    if (activeTransactions.length === 0) return null;
    return activeTransactions.reduce(
      (max, t) => (t.amount > (max?.amount || 0) ? t : max),
      activeTransactions[0]
    );
  }, [activeTransactions]);

  // Category breakdown for selected timeframe
  const categoryStats = useMemo(() => {
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

    activeTransactions.forEach((t) => {
      if (map[t.category]) {
        map[t.category].amount += t.amount;
        map[t.category].count += 1;
      }
    });

    const denom = totalSpent || 1;
    return Object.entries(map)
      .map(([cat, data]) => ({
        category: cat as Category,
        amount: data.amount,
        count: data.count,
        percentage: totalSpent > 0 ? Math.round((data.amount / denom) * 100) : 0,
      }))
      .filter((item) => item.amount > 0)
      .sort((a, b) => b.amount - a.amount);
  }, [activeTransactions, totalSpent]);

  // Daily Spending Chart Data
  const dailyData = useMemo(() => {
    if (timeframe === 'all') {
      if (activeTransactions.length === 0) {
        return { days: [], maxDayAmount: 0, daysInMonth: 0 };
      }
      // Recent 30 calendar days
      const daysCount = 30;
      const days = Array.from({ length: daysCount }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (daysCount - 1 - i));
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const dayStr = String(d.getDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${dayStr}`;
        const dayTx = activeTransactions.filter((t) => t.date === dateStr);
        const amount = dayTx.reduce((sum, t) => sum + t.amount, 0);
        return {
          day: d.getDate(),
          amount,
          dateStr,
          txCount: dayTx.length,
          label: d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        };
      });
      const maxDayAmount = days.reduce((m, d) => Math.max(m, d.amount), 0);
      return { days, maxDayAmount, daysInMonth: daysCount };
    }

    let targetYear = now.getFullYear();
    let targetMonth = now.getMonth(); // 0-indexed
    if (timeframe === 'last-month') {
      targetYear = prevMonthDate.getFullYear();
      targetMonth = prevMonthDate.getMonth();
    }

    const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
    const prefix = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}`;

    const days = Array.from({ length: daysInMonth }, (_, i) => {
      const dayNum = i + 1;
      const dateStr = `${prefix}-${String(dayNum).padStart(2, '0')}`;
      const dayTx = activeTransactions.filter((t) => t.date === dateStr);
      const amount = dayTx.reduce((sum, t) => sum + t.amount, 0);
      return {
        day: dayNum,
        amount,
        dateStr,
        txCount: dayTx.length,
        label: `Day ${dayNum}`,
      };
    });

    const maxDayAmount = days.reduce((m, d) => Math.max(m, d.amount), 0);
    return { days, maxDayAmount, daysInMonth };
  }, [activeTransactions, timeframe, now, prevMonthDate]);

  // Payment Method Distribution
  const paymentStats = useMemo(() => {
    const map: Record<string, number> = {};
    activeTransactions.forEach((t) => {
      map[t.paymentMethod] = (map[t.paymentMethod] || 0) + t.amount;
    });
    const denom = totalSpent || 1;
    return Object.entries(map)
      .map(([method, amount]) => ({
        method,
        amount,
        percentage: totalSpent > 0 ? Math.round((amount / denom) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [activeTransactions, totalSpent]);

  // SVG Donut calculation
  const donutSegments = useMemo(() => {
    if (totalSpent === 0) return [];
    let cumulative = 0;
    const radius = 68;
    const circumference = 2 * Math.PI * radius;

    return categoryStats.map((item) => {
      const catMeta = CATEGORIES.find((c) => c.id === item.category);
      const strokeDash = (item.amount / totalSpent) * circumference;
      const strokeDashoffset = -cumulative;
      cumulative += strokeDash;

      return {
        ...item,
        color: catMeta?.color || '#10B981',
        strokeDash: `${strokeDash} ${circumference}`,
        strokeDashoffset,
      };
    });
  }, [categoryStats, totalSpent]);

  const currentElapsedDays = timeframe === 'this-month'
    ? Math.max(1, now.getDate())
    : (timeframe === 'last-month' ? dailyData.daysInMonth : Math.max(1, dailyData.daysInMonth));

  const averageDailySpend = totalSpent > 0 ? Math.round(totalSpent / currentElapsedDays) : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Timeframe Selector & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#121622] border border-[#1C2436]">
        <div>
          <h3 className="text-sm md:text-base font-semibold text-white">Financial Reports & Analytics</h3>
          <p className="text-xs text-slate-400">
            Real data calculations generated strictly from your offline ledger
          </p>
        </div>

        {/* Timeframe tabs */}
        <div className="flex items-center p-1 bg-[#0E131E] rounded-lg border border-[#1F293D] self-start sm:self-auto">
          <button
            onClick={() => setTimeframe('this-month')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              timeframe === 'this-month'
                ? 'bg-slate-800 text-emerald-400 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setTimeframe('last-month')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              timeframe === 'last-month'
                ? 'bg-slate-800 text-emerald-400 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Last Month
          </button>
          <button
            onClick={() => setTimeframe('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              timeframe === 'all'
                ? 'bg-slate-800 text-emerald-400 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* High-Level Analytical Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* 1. Total Expenses */}
        <div className="p-4 rounded-xl bg-[#121622] border border-[#1C2436]">
          <span className="text-xs text-slate-400 block mb-1">Total Expenses</span>
          <div className="text-xl md:text-2xl font-bold font-mono text-emerald-400 tabular-nums">
            {formatCurrency(totalSpent)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {activeTransactions.length} {activeTransactions.length === 1 ? 'total entry' : 'total entries'}
          </span>
        </div>

        {/* 2. Top Category */}
        <div className="p-4 rounded-xl bg-[#121622] border border-[#1C2436]">
          <span className="text-xs text-slate-400 block mb-1">Top Category</span>
          <div className="text-lg md:text-xl font-bold text-white truncate">
            {categoryStats[0] ? getCategoryLabel(categoryStats[0].category) : 'None'}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block font-mono">
            {categoryStats[0] ? `${formatCurrency(categoryStats[0].amount)} (${categoryStats[0].percentage}%)` : '₹0 (0%)'}
          </span>
        </div>

        {/* 3. Average Daily Spend */}
        <div className="p-4 rounded-xl bg-[#121622] border border-[#1C2436]">
          <span className="text-xs text-slate-400 block mb-1">Average Daily Spend</span>
          <div className="text-xl md:text-2xl font-bold font-mono text-white tabular-nums">
            {formatCurrency(averageDailySpend)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {totalSpent > 0
              ? `Across ${currentElapsedDays} elapsed calendar ${currentElapsedDays === 1 ? 'day' : 'days'}`
              : 'No expenses in period'}
          </span>
        </div>

        {/* 4. Peak Expense */}
        <div className="p-4 rounded-xl bg-[#121622] border border-[#1C2436]">
          <span className="text-xs text-slate-400 block mb-1">Peak Expense</span>
          <div className="text-xl md:text-2xl font-bold font-mono text-white tabular-nums truncate">
            {peakTransaction ? formatCurrency(peakTransaction.amount) : '₹0'}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block truncate">
            {peakTransaction
              ? `${toTitleCase(peakTransaction.title)} · ${getCategoryLabel(peakTransaction.category)}`
              : 'No entries recorded'}
          </span>
        </div>
      </div>

      {/* Daily Spending Trend (SVG Interactive Bar Chart) */}
      <div className="p-5 md:p-6 rounded-xl bg-[#121622] border border-[#1C2436]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <span>Daily Spending Trend</span>
            </h4>
            <p className="text-xs text-slate-400">
              {totalSpent > 0
                ? 'Hover over or tap any day bar to inspect specific day spending'
                : 'No transactions recorded for this period'}
            </p>
          </div>

          {/* Hover readout indicator */}
          <div className="text-right">
            {hoveredDay ? (
              <div className="text-xs bg-[#0E131E] px-3 py-1.5 rounded-lg border border-[#232F46] inline-block">
                <span className="text-slate-400">{hoveredDay.label || `Day ${hoveredDay.day}`}: </span>
                <span className="font-mono font-bold text-emerald-400">
                  {formatCurrency(hoveredDay.amount)}
                </span>
              </div>
            ) : (
              <div className="text-xs text-slate-400">
                {dailyData.maxDayAmount > 0 ? `Peak Day: ${formatCurrency(dailyData.maxDayAmount)}` : 'Peak Day: ₹0'}
              </div>
            )}
          </div>
        </div>

        {/* SVG Daily Chart or Empty State */}
        {totalSpent === 0 || dailyData.days.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 border border-dashed border-[#1E293B] rounded-lg">
            <BarChart3 className="w-8 h-8 mx-auto text-slate-500 mb-2 opacity-40" />
            <p>No daily spending recorded for this timeframe.</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto pb-2">
            <div className="min-w-[580px] h-48 flex items-end gap-1.5 pt-6 px-1">
              {dailyData.days.map((d) => {
                const heightPct = dailyData.maxDayAmount > 0 && d.amount > 0
                  ? Math.max(8, Math.round((d.amount / dailyData.maxDayAmount) * 100))
                  : 0;
                const isToday =
                  timeframe === 'this-month' && d.day === now.getDate();
                const isPeak = d.amount === dailyData.maxDayAmount && d.amount > 0;

                return (
                  <div
                    key={`${d.dateStr}-${d.day}`}
                    onMouseEnter={() => setHoveredDay(d)}
                    onMouseLeave={() => setHoveredDay(null)}
                    className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                  >
                    {/* Tooltip bar */}
                    <div
                      className={`w-full rounded-t transition-all duration-200 ${
                        isPeak
                          ? 'bg-amber-400 group-hover:bg-amber-300'
                          : isToday
                          ? 'bg-emerald-500 group-hover:bg-emerald-400'
                          : d.amount > 0
                          ? 'bg-slate-700 group-hover:bg-emerald-500'
                          : 'bg-[#182030] h-[2px]'
                      }`}
                      style={{ height: d.amount > 0 ? `${heightPct}%` : '2px' }}
                    />
                    {/* Day label */}
                    <span
                      className={`text-[9px] mt-1.5 font-mono ${
                        isToday
                          ? 'text-emerald-400 font-bold'
                          : d.day % 5 === 0 || d.day === 1 || d.day === dailyData.daysInMonth
                          ? 'text-slate-400'
                          : 'text-slate-400 opacity-60'
                      }`}
                    >
                      {d.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Two Column Grid: Category Donut + Payment Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Spending Donut Chart & List (7 cols) */}
        <div className="lg:col-span-7 p-5 md:p-6 rounded-xl bg-[#121622] border border-[#1C2436]">
          <div className="flex items-center justify-between pb-3 border-b border-[#1C2436] mb-4">
            <div>
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-emerald-400" />
                <span>Category Distribution</span>
              </h4>
              <p className="text-xs text-slate-400">Share of expenditures by category</p>
            </div>
            <span className="text-xs font-mono text-slate-400">{categoryStats.length} active categories</span>
          </div>

          {categoryStats.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 border border-dashed border-[#1E293B] rounded-lg">
              No transactions recorded for this period.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
              {/* Left SVG Donut */}
              <div className="sm:col-span-5 flex flex-col items-center justify-center relative">
                <svg className="w-44 h-44 -rotate-90 transform" viewBox="0 0 160 160">
                  {/* Base Track */}
                  <circle
                    cx="80"
                    cy="80"
                    r="68"
                    stroke="#161D2B"
                    strokeWidth="14"
                    fill="transparent"
                  />
                  {/* Donut Segments */}
                  {donutSegments.map((segment) => (
                    <circle
                      key={segment.category}
                      cx="80"
                      cy="80"
                      r="68"
                      stroke={segment.color}
                      strokeWidth={hoveredCategory === segment.category ? '18' : '14'}
                      strokeDasharray={segment.strokeDash}
                      strokeDashoffset={segment.strokeDashoffset}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-300 cursor-pointer"
                      onMouseEnter={() => setHoveredCategory(segment.category)}
                      onMouseLeave={() => setHoveredCategory(null)}
                    />
                  ))}
                </svg>

                {/* Donut Center readout */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-2">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider truncate max-w-[100px]">
                    {hoveredCategory
                      ? getCategoryLabel(hoveredCategory as Category)
                      : 'Total'}
                  </span>
                  <span className="font-mono font-bold text-sm text-white tabular-nums">
                    {hoveredCategory
                      ? formatCurrency(
                          categoryStats.find((c) => c.category === hoveredCategory)?.amount || 0
                        )
                      : formatCurrency(totalSpent)}
                  </span>
                </div>
              </div>

              {/* Right Category Breakdown List */}
              <div className="sm:col-span-7 space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {categoryStats.map((item) => {
                  const catMeta = CATEGORIES.find((c) => c.id === item.category);
                  const isHovered = hoveredCategory === item.category;

                  return (
                    <div
                      key={item.category}
                      onMouseEnter={() => setHoveredCategory(item.category)}
                      onMouseLeave={() => setHoveredCategory(null)}
                      className={`p-2 rounded-lg transition-colors flex items-center justify-between text-xs cursor-pointer ${
                        isHovered ? 'bg-[#182132]' : 'hover:bg-[#151C2A]'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: catMeta?.color || '#10B981' }}
                        />
                        <span className="font-medium text-slate-200 truncate">
                          {getCategoryLabel(item.category)}
                        </span>
                        <span className="text-[10px] text-slate-400">({item.count})</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono text-white font-medium tabular-nums">
                          {formatCurrency(item.amount)}
                        </span>
                        <span className="text-slate-400 font-mono text-[11px] w-9 text-right">
                          {item.percentage}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Payment Channels & Monthly Contrast (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Payment Method Distribution */}
          <div className="p-5 md:p-6 rounded-xl bg-[#121622] border border-[#1C2436]">
            <div className="flex items-center justify-between pb-3 border-b border-[#1C2436] mb-3">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-400" />
                <span>Payment Channels</span>
              </h4>
              <span className="text-xs text-slate-400">By value</span>
            </div>

            {paymentStats.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No payment records for this timeframe.</p>
            ) : (
              <div className="space-y-3">
                {paymentStats.map((p) => (
                  <div key={p.method} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium">{p.method}</span>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-white font-medium">{formatCurrency(p.amount)}</span>
                        <span className="text-slate-400 text-[11px]">({p.percentage}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-[#182133] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${p.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Month vs Month Quick Comparison */}
          <div className="p-5 rounded-xl bg-[#121622] border border-[#1C2436]">
            <span className="text-xs text-slate-400 block mb-2 font-medium">Monthly Contrast</span>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-[#0E131E] border border-[#1B2335]">
                <span className="text-[11px] text-slate-400 block">Current Cycle</span>
                <span className="text-sm font-bold font-mono text-emerald-400">
                  {formatCurrency(thisMonthExpenses)}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-[#0E131E] border border-[#1B2335]">
                <span className="text-[11px] text-slate-400 block">Prior Cycle</span>
                <span className="text-sm font-bold font-mono text-slate-300">
                  {formatCurrency(lastMonthExpenses)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
