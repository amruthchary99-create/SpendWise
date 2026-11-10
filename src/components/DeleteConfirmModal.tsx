import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { useExpense } from '../context/ExpenseContext';
import { toTitleCase } from '../utils/formatters';

export const DeleteConfirmModal: React.FC = () => {
  const {
    deleteConfirmItem,
    setDeleteConfirmItem,
    deleteTransaction,
    clearSampleData,
    clearAllData,
  } = useExpense();

  if (!deleteConfirmItem) return null;

  const handleClose = () => setDeleteConfirmItem(null);

  const handleConfirm = () => {
    if (deleteConfirmItem.type === 'single' && deleteConfirmItem.transactionId) {
      deleteTransaction(deleteConfirmItem.transactionId);
    } else if (deleteConfirmItem.type === 'sample') {
      clearSampleData();
    } else if (deleteConfirmItem.type === 'all') {
      clearAllData();
    }
    handleClose();
  };

  const getTitle = () => {
    if (deleteConfirmItem.type === 'single') return 'Delete Transaction?';
    if (deleteConfirmItem.type === 'sample') return 'Clear Sample Data?';
    return 'Wipe All Transactions?';
  };

  const getMessage = () => {
    if (deleteConfirmItem.type === 'single') {
      const displayTitle = deleteConfirmItem.title ? toTitleCase(deleteConfirmItem.title) : 'this item';
      return `Are you sure you want to delete "${displayTitle}"? This action cannot be undone.`;
    }
    if (deleteConfirmItem.type === 'sample') {
      return 'Are you sure you want to remove all pre-populated sample transactions? Any real expenses you entered will be preserved.';
    }
    return 'Are you sure you want to permanently erase ALL stored transaction records from your browser? This action cannot be reversed.';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-md rounded-2xl bg-[#121622] border border-[#1E293B] shadow-2xl p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-500/30 flex items-center justify-center text-red-400">
          <Trash2 className="w-6 h-6" />
        </div>

        <div>
          <h3 className="text-base font-bold text-white tracking-tight">{getTitle()}</h3>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{getMessage()}</p>
        </div>

        <div className="pt-2 flex items-center justify-end gap-2.5">
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-[#182133] hover:bg-[#202C44] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-500 active:bg-red-700 transition-colors cursor-pointer shadow-sm"
          >
            Confirm & Delete
          </button>
        </div>
      </div>
    </div>
  );
};
