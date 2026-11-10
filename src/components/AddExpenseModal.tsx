import React, { useState, useEffect } from 'react';
import { X, Check, Calendar, CreditCard, Tag, DollarSign, FileText } from 'lucide-react';
import { useExpense } from '../context/ExpenseContext';
import { Category, PaymentMethod } from '../types';
import { CATEGORIES, PAYMENT_METHODS } from '../utils/constants';
import { getTodayDateString } from '../utils/formatters';

export const AddExpenseModal: React.FC = () => {
  const {
    isAddExpenseOpen,
    setIsAddExpenseOpen,
    editingTransaction,
    setEditingTransaction,
    addTransaction,
    updateTransaction,
  } = useExpense();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>('Food');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [date, setDate] = useState(getTodayDateString());
  const [notes, setNotes] = useState('');

  // Form error state
  const [errors, setErrors] = useState<{
    title?: string;
    amount?: string;
    date?: string;
  }>({});

  const isEditing = !!editingTransaction;

  // Populate form if in edit mode
  useEffect(() => {
    if (editingTransaction) {
      setTitle(editingTransaction.title);
      setAmount(String(editingTransaction.amount));
      setCategory(editingTransaction.category);
      setPaymentMethod(editingTransaction.paymentMethod);
      setDate(editingTransaction.date);
      setNotes(editingTransaction.notes || '');
      setErrors({});
    } else {
      setTitle('');
      setAmount('');
      setCategory('Food');
      setPaymentMethod('UPI');
      setDate(getTodayDateString());
      setNotes('');
      setErrors({});
    }
  }, [editingTransaction, isAddExpenseOpen]);

  if (!isAddExpenseOpen && !editingTransaction) return null;

  const handleClose = () => {
    setIsAddExpenseOpen(false);
    setEditingTransaction(null);
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { title?: string; amount?: string; date?: string } = {};

    // Validate Title
    if (!title.trim()) {
      newErrors.title = 'Expense title or description is required.';
    }

    // Validate Amount
    const numericAmount = parseFloat(amount);
    if (!amount.trim() || isNaN(numericAmount)) {
      newErrors.amount = 'Please enter a valid amount in ₹.';
    } else if (numericAmount <= 0) {
      newErrors.amount = 'Amount must be greater than zero.';
    }

    // Validate Date
    if (!date) {
      newErrors.date = 'Date is required.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (isEditing && editingTransaction) {
      updateTransaction(editingTransaction.id, {
        title: title.trim(),
        amount: Math.round(numericAmount),
        category,
        paymentMethod,
        date,
        notes: notes.trim() || undefined,
      });
    } else {
      addTransaction({
        title: title.trim(),
        amount: Math.round(numericAmount),
        category,
        paymentMethod,
        date,
        notes: notes.trim() || undefined,
      });
    }

    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg rounded-2xl bg-[#121622] border border-[#1E293B] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#1C263B] flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              {isEditing ? 'Edit Expense' : 'Log New Expense'}
            </h3>
            <p className="text-xs text-slate-400">
              {isEditing ? 'Update details of this transaction' : 'Add an expense in Indian Rupees (₹)'}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Amount Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Amount (₹) <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-base text-emerald-400 pointer-events-none">
                ₹
              </span>
              <input
                type="number"
                step="any"
                min="0.01"
                placeholder="0"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (errors.amount) setErrors((prev) => ({ ...prev, amount: undefined }));
                }}
                className={`w-full bg-[#0E131E] border ${
                  errors.amount ? 'border-red-500' : 'border-[#1F293D]'
                } rounded-xl pl-9 pr-4 py-2.5 text-lg font-mono font-bold text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors`}
                autoFocus={!isEditing}
              />
            </div>
            {errors.amount && (
              <p className="text-xs text-red-400 mt-1 font-medium">{errors.amount}</p>
            )}
          </div>

          {/* Title Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Title / Description <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Blinkit Groceries, Swiggy Dinner, Metro Card"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
              }}
              className={`w-full bg-[#0E131E] border ${
                errors.title ? 'border-red-500' : 'border-[#1F293D]'
              } rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors`}
            />
            {errors.title && (
              <p className="text-xs text-red-400 mt-1 font-medium">{errors.title}</p>
            )}
          </div>

          {/* Category Selector Grid */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((c) => {
                const Icon = c.icon;
                const isSelected = category === c.id;
                return (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => setCategory(c.id)}
                    className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex items-center gap-2 ${
                      isSelected
                        ? 'bg-slate-800 border-emerald-500 text-emerald-400 shadow-sm'
                        : 'bg-[#0E131E] border-[#1C263B] text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                      style={{ backgroundColor: c.bgLight }}
                    >
                      <Icon className="w-3.5 h-3.5" style={{ color: c.color }} />
                    </div>
                    <span className="text-xs font-medium truncate">{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date and Payment Method Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Date <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    if (errors.date) setErrors((prev) => ({ ...prev, date: undefined }));
                  }}
                  className={`w-full bg-[#0E131E] border ${
                    errors.date ? 'border-red-500' : 'border-[#1F293D]'
                  } rounded-xl px-3.5 py-2 text-xs md:text-sm text-slate-200 focus:outline-none focus:border-emerald-500`}
                />
              </div>
              {errors.date && (
                <p className="text-xs text-red-400 mt-1 font-medium">{errors.date}</p>
              )}
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full bg-[#0E131E] border border-[#1F293D] rounded-xl px-3 py-2 text-xs md:text-sm text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {PAYMENT_METHODS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Notes <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={2}
              placeholder="Add optional notes, invoice number, or memo..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#0E131E] border border-[#1F293D] rounded-xl p-3 text-xs md:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
            />
          </div>

          {/* Modal Footer Controls */}
          <div className="pt-3 border-t border-[#1C263B] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-sm"
            >
              {isEditing ? 'Save Changes' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
