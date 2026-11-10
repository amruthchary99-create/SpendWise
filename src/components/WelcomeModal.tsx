import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Database } from 'lucide-react';
import { useExpense } from '../context/ExpenseContext';

export const WelcomeModal: React.FC = () => {
  const { isWelcomeOpen, completeOnboarding } = useExpense();

  if (!isWelcomeOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg rounded-2xl bg-[#121622] border border-[#1E293B] shadow-2xl p-6 md:p-8 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Emblem */}
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-2xl shadow-inner">
          ₹
        </div>

        {/* Headings strictly adhering to spec */}
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Welcome to SpendWise
          </h2>
          <p className="text-sm md:text-base text-emerald-400 font-medium mt-1">
            Your money deserves better management.
          </p>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            SpendWise gives you full command over your expenses in Indian Rupees (₹) with real-time budget tracking and Spending Pulse insights. Everything is stored privately in your browser.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-[#0E131E] border border-[#1A2335]">
            <span className="font-semibold text-white block mb-0.5">Offline & Private</span>
            <span className="text-slate-400 text-[11px]">No login, accounts, or cloud tracking</span>
          </div>
          <div className="p-3 rounded-xl bg-[#0E131E] border border-[#1A2335]">
            <span className="font-semibold text-white block mb-0.5">Spending Pulse</span>
            <span className="text-slate-400 text-[11px]">Instant behavioral smart insights</span>
          </div>
        </div>

        {/* Two Options */}
        <div className="space-y-3 pt-2 border-t border-[#1C263B]">
          <button
            onClick={() => completeOnboarding(true)}
            className="w-full p-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold text-sm transition-all flex items-center justify-between group cursor-pointer shadow-md"
          >
            <div className="text-left">
              <div className="font-bold">Explore with sample data</div>
              <div className="text-xs text-emerald-100/80 font-normal">
                Pre-populate realistic expenses to inspect charts & insights immediately
              </div>
            </div>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform shrink-0" />
          </button>

          <button
            onClick={() => completeOnboarding(false)}
            className="w-full p-3.5 rounded-xl bg-[#0E131E] hover:bg-[#151D2C] border border-[#1F293D] text-slate-300 hover:text-white font-medium text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Start with a blank dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};
