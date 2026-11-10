import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  X,
  CreditCard,
  Tag,
  ArrowUpDown,
  Download,
} from 'lucide-react';
import { useExpense } from '../context/ExpenseContext';
import { Category, PaymentMethod, Transaction } from '../types';
import { CATEGORIES, PAYMENT_METHODS } from '../utils/constants';
import { formatCurrency, formatDate, exportTransactionsToCsv, getCategoryLabel, toTitleCase } from '../utils/formatters';

type SortOption = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';
type DateFilterOption = 'all' | 'this-month' | 'last-month' | 'today';

export const TransactionsView: React.FC = () => {
  const {
    transactions,
    setIsAddExpenseOpen,
    setEditingTransaction,
    setDeleteConfirmItem,
    showToast,
  } = useExpense();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | 'all'>('all');
  const [dateFilter, setDateFilter] = useState<DateFilterOption>('all');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');

  // Filtered & Sorted Transactions
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const thisMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthPrefix = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    return transactions
      .filter((t) => {
        // Search filter (title & notes)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = t.title.toLowerCase().includes(q);
          const matchNotes = t.notes?.toLowerCase().includes(q) || false;
          if (!matchTitle && !matchNotes) return false;
        }

        // Category filter
        if (selectedCategory !== 'all' && t.category !== selectedCategory) {
          return false;
        }

        // Payment method filter
        if (selectedPayment !== 'all' && t.paymentMethod !== selectedPayment) {
          return false;
        }

        // Date filter
        if (dateFilter === 'this-month' && !t.date.startsWith(thisMonthPrefix)) {
          return false;
        }
        if (dateFilter === 'last-month' && !t.date.startsWith(lastMonthPrefix)) {
          return false;
        }
        if (dateFilter === 'today' && t.date !== todayStr) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') {
          return b.date.localeCompare(a.date) || b.createdAt - a.createdAt;
        }
        if (sortBy === 'date-asc') {
          return a.date.localeCompare(b.date) || a.createdAt - b.createdAt;
        }
        if (sortBy === 'amount-desc') {
          return b.amount - a.amount;
        }
        if (sortBy === 'amount-asc') {
          return a.amount - b.amount;
        }
        return 0;
      });
  }, [transactions, searchQuery, selectedCategory, selectedPayment, dateFilter, sortBy]);

  const totalFilteredAmount = useMemo(() => {
    return filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedCategory !== 'all' ||
    selectedPayment !== 'all' ||
    dateFilter !== 'all';

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedPayment('all');
    setDateFilter('all');
    setSortBy('date-desc');
  };

  const handleExportFiltered = () => {
    try {
      exportTransactionsToCsv(filteredTransactions);
      showToast(`Exported ${filteredTransactions.length} transactions`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Export failed', 'error');
    }
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Search, Filter & Action Bar */}
      <div className="p-4 rounded-xl bg-[#121622] border border-[#1C2436] space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search expenses by title or note..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0E131E] border border-[#1F293D] rounded-lg pl-9 pr-9 py-2 text-xs md:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Sort Selector */}
          <div className="flex items-center gap-2">
            <div className="relative shrink-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                aria-label="Sort transactions"
                className="bg-[#0E131E] border border-[#1F293D] text-slate-300 text-xs rounded-lg px-3 py-2 pr-7 appearance-none cursor-pointer focus:outline-none focus:border-emerald-500"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="amount-desc">Amount: High to Low</option>
                <option value="amount-asc">Amount: Low to High</option>
              </select>
              <ArrowUpDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Export Filtered */}
            <button
              onClick={handleExportFiltered}
              disabled={filteredTransactions.length === 0}
              className="px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-[#0E131E] disabled:opacity-50 border border-[#1F293D] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
              title="Export Current View"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#1A2334]">
          {/* Category Filter */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as Category | 'all')}
              aria-label="Filter by category"
              className="bg-[#0E131E] border border-[#1F293D] text-slate-300 text-xs rounded-lg px-3 py-1.5 pr-6 appearance-none cursor-pointer focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method Filter */}
          <div className="relative">
            <select
              value={selectedPayment}
              onChange={(e) => setSelectedPayment(e.target.value as PaymentMethod | 'all')}
              aria-label="Filter by payment method"
              className="bg-[#0E131E] border border-[#1F293D] text-slate-300 text-xs rounded-lg px-3 py-1.5 pr-6 appearance-none cursor-pointer focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Payment Methods</option>
              {PAYMENT_METHODS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Filter */}
          <div className="relative">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as DateFilterOption)}
              aria-label="Filter by date range"
              className="bg-[#0E131E] border border-[#1F293D] text-slate-300 text-xs rounded-lg px-3 py-1.5 pr-6 appearance-none cursor-pointer focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Dates</option>
              <option value="this-month">This Month</option>
              <option value="last-month">Last Month</option>
              <option value="today">Today</option>
            </select>
          </div>

          {/* Clear Filter Button */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 transition-colors cursor-pointer flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Ledger Overview Bar */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <div>
          Showing <span className="font-semibold text-white">{filteredTransactions.length}</span> of{' '}
          {transactions.length} transactions
        </div>
        <div>
          Total Filtered:{' '}
          <span className="font-mono font-bold text-emerald-400 text-sm">
            {formatCurrency(totalFilteredAmount)}
          </span>
        </div>
      </div>

      {/* Transactions List Table / Card View */}
      {filteredTransactions.length === 0 ? (
        <div className="p-12 rounded-xl bg-[#121622] border border-[#1C2436] text-center">
          <Filter className="w-10 h-10 mx-auto text-slate-400 mb-3 opacity-40" />
          <h4 className="text-base font-semibold text-white mb-1">No matching transactions</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            {hasActiveFilters
              ? 'Try adjusting or clearing your search filters to find what you are looking for.'
              : 'Your transaction register is empty. Click below to add your first expense.'}
          </p>
          {hasActiveFilters ? (
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium cursor-pointer"
            >
              Clear All Filters
            </button>
          ) : (
            <button
              onClick={() => setIsAddExpenseOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Expense</span>
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-xl bg-[#121622] border border-[#1C2436] overflow-hidden">
          <div className="divide-y divide-[#1A2334]">
            {filteredTransactions.map((tx) => {
              const catMeta = CATEGORIES.find((c) => c.id === tx.category);
              const Icon = catMeta?.icon || Tag;

              return (
                <div
                  key={tx.id}
                  className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-[#151C2B] transition-colors"
                >
                  {/* Left: Icon & Title & Metadata */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: catMeta?.bgLight || 'rgba(255,255,255,0.05)' }}
                    >
                      <Icon className="w-4 h-4" style={{ color: catMeta?.color || '#94A3B8' }} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white truncate block">
                          {toTitleCase(tx.title)}
                        </span>
                        {tx.isSample && (
                          <span className="text-[9px] bg-slate-800 text-slate-400 border border-slate-700 px-1.5 py-0.5 rounded uppercase font-medium tracking-wide">
                            Sample
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-400 flex flex-wrap items-center gap-1.5 mt-0.5">
                        <span className="text-slate-300 font-medium">{getCategoryLabel(tx.category)}</span>
                        <span aria-hidden="true">·</span>
                        <span>{formatDate(tx.date)}</span>
                        <span aria-hidden="true">·</span>
                        <span>{tx.paymentMethod}</span>
                        {tx.notes && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-slate-400 italic truncate max-w-[200px]">
                              "{tx.notes}"
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount & Actions */}
                  <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                    <span className="font-mono text-sm sm:text-base font-bold text-white tabular-nums">
                      {formatCurrency(tx.amount)}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingTransaction(tx)}
                        className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                        title="Edit transaction"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          setDeleteConfirmItem({
                            type: 'single',
                            transactionId: tx.id,
                            title: tx.title,
                          })
                        }
                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                        title="Delete transaction"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
