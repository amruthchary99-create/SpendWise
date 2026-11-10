import React, { useState } from 'react';
import {
  Download,
  Share2,
  Copy,
  Trash2,
  Database,
  Shield,
  FileSpreadsheet,
  RefreshCw,
  Check,
  Smartphone,
  ExternalLink,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useExpense } from '../context/ExpenseContext';
import {
  exportTransactionsToCsv,
  generateMonthlySummaryText,
  formatCurrency,
} from '../utils/formatters';

export const SettingsView: React.FC = () => {
  const {
    transactions,
    monthlyBudget,
    loadSampleData,
    clearSampleData,
    setDeleteConfirmItem,
    showToast,
  } = useExpense();

  const [copied, setCopied] = useState(false);
  const sampleCount = transactions.filter((t) => t.isSample).length;
  const userCount = transactions.filter((t) => !t.isSample).length;

  const handleExportCsv = () => {
    try {
      exportTransactionsToCsv(transactions);
      showToast('Exported CSV file successfully', 'success');
    } catch (err: any) {
      showToast(err.message || 'Export failed', 'error');
    }
  };

  const handleCopySummary = async () => {
    try {
      const summary = generateMonthlySummaryText(transactions, monthlyBudget);
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      showToast('Monthly summary copied to clipboard', 'success');
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      showToast('Could not copy to clipboard', 'error');
    }
  };

  const handleShareSummary = async () => {
    const summary = generateMonthlySummaryText(transactions, monthlyBudget);
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'SpendWise Monthly Expense Report',
          text: summary,
        });
        showToast('Shared report successfully', 'success');
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          // Fallback to clipboard
          await handleCopySummary();
        }
      }
    } else {
      await handleCopySummary();
    }
  };

  // Approximate storage calculation
  const storageBytes = new Blob([
    JSON.stringify(transactions),
    String(monthlyBudget),
  ]).size;

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Share & Export Section */}
      <div className="p-6 rounded-xl bg-[#121622] border border-[#1C2436] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#1C2436]">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Share2 className="w-4 h-4 text-emerald-400" />
              <span>Share & Export Data</span>
            </h3>
            <p className="text-xs text-slate-400">
              Download your records as CSV or share a formatted summary report
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Export CSV Card */}
          <div className="p-4 rounded-lg bg-[#0E131E] border border-[#1B2335] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-white font-medium text-sm mb-1">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Export Transaction CSV</span>
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Download all {transactions.length} transactions as a formatted spreadsheet file compatible with Excel and Google Sheets.
              </p>
            </div>
            <button
              onClick={handleExportCsv}
              disabled={transactions.length === 0}
              className="w-full py-2 px-3 rounded-lg bg-[#182133] hover:bg-[#202C44] active:bg-[#283857] disabled:opacity-50 text-white text-xs font-medium border border-[#283652] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Download CSV</span>
            </button>
          </div>

          {/* Share Monthly Summary Card */}
          <div className="p-4 rounded-lg bg-[#0E131E] border border-[#1B2335] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-white font-medium text-sm mb-1">
                <Share2 className="w-4 h-4 text-blue-400" />
                <span>Monthly Summary Report</span>
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Generate a clean, shareable summary breakdown of this month's budget and top spending categories.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleShareSummary}
                className="flex-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Summary</span>
              </button>
              <button
                onClick={handleCopySummary}
                className="py-2 px-3 rounded-lg bg-[#182133] hover:bg-[#202C44] text-slate-200 text-xs font-medium border border-[#283652] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                title="Copy text to clipboard"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Sample Data Management */}
      <div className="p-6 rounded-xl bg-[#121622] border border-[#1C2436] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#1C2436]">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Sample & Demo Data</span>
            </h3>
            <p className="text-xs text-slate-400">
              Explore SpendWise features with pre-populated realistic Indian Rupee expenses
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">{sampleCount} sample items active</span>
        </div>

        <div className="p-4 rounded-lg bg-[#0E131E] border border-[#1B2335] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs sm:text-sm font-medium text-white mb-0.5">
              Sample Data Mode
            </div>
            <p className="text-xs text-slate-400">
              Sample items are explicitly flagged as 'Sample' in your ledger and will not interfere with real records.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {sampleCount > 0 ? (
              <button
                onClick={() =>
                  setDeleteConfirmItem({
                    type: 'sample',
                    title: 'Clear Sample Data',
                  })
                }
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
              >
                Clear Sample Data
              </button>
            ) : (
              <button
                onClick={loadSampleData}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Load Sample Data</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Privacy & Danger Zone */}
      <div className="p-6 rounded-xl bg-[#121622] border border-[#1C2436] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#1C2436]">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-slate-400" />
              <span>Storage & Privacy</span>
            </h3>
            <p className="text-xs text-slate-400">
              SpendWise operates strictly inside your browser's private LocalStorage
            </p>
          </div>
        </div>

        {/* Ledger Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-[#0E131E] border border-[#1B2335]">
            <span className="text-slate-400 block mb-0.5">Total Records</span>
            <span className="font-mono font-bold text-white text-base">{transactions.length}</span>
          </div>
          <div className="p-3 rounded-lg bg-[#0E131E] border border-[#1B2335]">
            <span className="text-slate-400 block mb-0.5">User Records</span>
            <span className="font-mono font-bold text-emerald-400 text-base">{userCount}</span>
          </div>
          <div className="p-3 rounded-lg bg-[#0E131E] border border-[#1B2335]">
            <span className="text-slate-400 block mb-0.5">Default Currency</span>
            <span className="font-mono font-bold text-white text-base">INR (₹)</span>
          </div>
          <div className="p-3 rounded-lg bg-[#0E131E] border border-[#1B2335]">
            <span className="text-slate-400 block mb-0.5">Storage Footprint</span>
            <span className="font-mono font-bold text-white text-base">
              {(storageBytes / 1024).toFixed(1)} KB
            </span>
          </div>
        </div>

        {/* Danger zone: Wipe data */}
        <div className="pt-4 border-t border-[#1C2436] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs sm:text-sm font-semibold text-red-300">
              Clear All Ledger Data
            </div>
            <p className="text-xs text-slate-400">
              Permanently wipe all transaction records from your browser's LocalStorage. This action cannot be undone.
            </p>
          </div>

          <button
            onClick={() =>
              setDeleteConfirmItem({
                type: 'all',
                title: 'Wipe All Transactions',
              })
            }
            disabled={transactions.length === 0}
            className="px-3.5 py-2 bg-red-950/60 hover:bg-red-900 active:bg-red-950 border border-red-500/40 text-red-200 disabled:opacity-40 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Wipe All Data</span>
          </button>
        </div>
      </div>

      {/* 4. App Info */}
      <div className="p-5 rounded-xl bg-[#0E121B] border border-[#1A2333] text-xs text-slate-400 space-y-2">
        <div className="flex items-center justify-between font-semibold text-slate-300">
          <span>SpendWise – Take Control of Your Money</span>
          <span className="font-mono">v1.0.0</span>
        </div>
        <p>
          Distraction-free, dark-themed personal finance manager. Zero tracking, zero external dependencies, 100% offline-ready.
        </p>
      </div>
    </div>
  );
};
