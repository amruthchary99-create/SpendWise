import React, { useState, useEffect } from 'react';
import { X, Wallet, Check } from 'lucide-react';
import { useExpense } from '../context/ExpenseContext';
import { formatCurrency } from '../utils/formatters';

export const SetBudgetModal: React.FC = () => {
  const { isSetBudgetOpen, setIsSetBudgetOpen, monthlyBudget, setMonthlyBudget } = useExpense();
  const [budgetVal, setBudgetVal] = useState(String(monthlyBudget));
  const [error, setError] = useState('');

  useEffect(() => {
    if (isSetBudgetOpen) {
      setBudgetVal(String(monthlyBudget));
      setError('');
    }
  }, [isSetBudgetOpen, monthlyBudget]);

  if (!isSetBudgetOpen) return null;

  const handleClose = () => {
    setIsSetBudgetOpen(false);
    setError('');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Number(budgetVal.replace(/,/g, '').trim());
    if (isNaN(parsed) || parsed <= 0) {
      setError('Please provide a valid positive budget amount in ₹.');
      return;
    }
    setMonthlyBudget(parsed);
    handleClose();
  };

  const handlePreset = (val: number) => {
    setBudgetVal(String(val));
    setMonthlyBudget(val);
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-md rounded-2xl bg-[#121622] border border-[#1E293B] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-[#1C263B] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white tracking-tight">Set Monthly Budget</h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-4">
          <p className="text-xs text-slate-400">
            SpendWise tracks your consumption against this monthly ceiling and triggers real-time 80% and 100% warnings.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Monthly Budget (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-base text-emerald-400 pointer-events-none">
                ₹
              </span>
              <input
                type="number"
                min="1"
                step="1"
                placeholder="25000"
                value={budgetVal}
                onChange={(e) => {
                  setBudgetVal(e.target.value);
                  setError('');
                }}
                className="w-full bg-[#0E131E] border border-[#1F293D] rounded-xl pl-9 pr-4 py-2.5 text-lg font-mono font-bold text-white focus:outline-none focus:border-emerald-500 transition-colors"
                autoFocus
              />
            </div>
            {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
          </div>

          <div>
            <span className="text-[11px] text-slate-400 block mb-1.5 font-medium">Quick Presets:</span>
            <div className="grid grid-cols-3 gap-2">
              {[15000, 25000, 35000, 50000, 75000, 100000].map((amt) => (
                <button
                  type="button"
                  key={amt}
                  onClick={() => handlePreset(amt)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-mono border transition-colors cursor-pointer text-center ${
                    monthlyBudget === amt
                      ? 'bg-slate-800 border-emerald-500 text-emerald-400 font-semibold'
                      : 'bg-[#0E131E] border-[#1C263B] text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {formatCurrency(amt)}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[#1C263B] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Save Budget
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
