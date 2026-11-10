import { Transaction, Category } from '../types';

export function getCategoryLabel(category: Category): string {
  switch (category) {
    case 'Food': return 'Food & Dining';
    case 'Transport': return 'Transport';
    case 'Shopping': return 'Shopping';
    case 'Education': return 'Education';
    case 'Entertainment': return 'Entertainment';
    case 'Health': return 'Health & Care';
    case 'Bills': return 'Bills & Utilities';
    case 'Travel': return 'Travel';
    case 'Other': return 'Other';
    default: return category;
  }
}

export function toTitleCase(str: string): string {
  if (!str) return '';
  const minorWords = new Set(['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'from', 'by', 'with', 'in', 'of']);
  const words = str.trim().split(/\s+/);
  return words
    .map((word, index) => {
      const lower = word.toLowerCase();
      // Preserve uppercase acronyms like UPI, ATM, OTT, etc.
      if (word.length > 1 && word === word.toUpperCase() && !/[a-z]/.test(word)) {
        return word;
      }
      if (index !== 0 && index !== words.length - 1 && minorWords.has(lower)) {
        return lower;
      }
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(' ');
}

export function formatCurrency(amount: number): string {
  if (isNaN(amount)) return '₹0';
  // Standard Indian currency formatting (lakhs, crores)
  const isNegative = amount < 0;
  const absAmount = Math.abs(Math.round(amount));
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(absAmount);
  return `${isNegative ? '-' : ''}₹${formatted}`;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  
  const date = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  ) {
    return 'Today';
  }

  if (
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate()
  ) {
    return 'Yesterday';
  }

  return date.toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  });
}

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function exportTransactionsToCsv(transactions: Transaction[]): void {
  if (!transactions.length) {
    throw new Error('No transactions available to export.');
  }

  const headers = ['ID', 'Date', 'Title', 'Category', 'Payment Method', 'Amount (INR)', 'Notes', 'Is Sample'];
  const rows = transactions.map((t) => [
    t.id,
    t.date,
    `"${(t.title || '').replace(/"/g, '""')}"`,
    t.category,
    t.paymentMethod,
    t.amount.toString(),
    `"${(t.notes || '').replace(/"/g, '""')}"`,
    t.isSample ? 'Yes' : 'No',
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `SpendWise_Expenses_${getTodayDateString()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function generateMonthlySummaryText(
  transactions: Transaction[],
  budget: number,
  targetMonthStr?: string
): string {
  const now = new Date();
  const targetPrefix = targetMonthStr || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  const monthName = new Date(
    parseInt(targetPrefix.split('-')[0], 10),
    parseInt(targetPrefix.split('-')[1], 10) - 1,
    1
  ).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  const monthlyTx = transactions.filter((t) => t.date.startsWith(targetPrefix));
  const totalSpent = monthlyTx.reduce((sum, t) => sum + t.amount, 0);
  const remaining = budget - totalSpent;
  const budgetPercent = budget > 0 ? Math.round((totalSpent / budget) * 100) : 0;

  // Category breakdown
  const catMap: Record<string, number> = {};
  monthlyTx.forEach((t) => {
    catMap[t.category] = (catMap[t.category] || 0) + t.amount;
  });

  const sortedCats = Object.entries(catMap).sort((a, b) => b[1] - a[1]);

  let text = `📊 SpendWise Expense Report — ${monthName}\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `• Total Spent: ${formatCurrency(totalSpent)}\n`;
  text += `• Monthly Budget: ${formatCurrency(budget)}\n`;
  text += `• Remaining: ${formatCurrency(remaining)} (${budgetPercent}% consumed)\n`;
  text += `• Total Transactions: ${monthlyTx.length}\n\n`;

  if (sortedCats.length > 0) {
    text += `Top Spending Categories:\n`;
    sortedCats.slice(0, 5).forEach(([cat, amt]) => {
      const pct = Math.round((amt / totalSpent) * 100);
      const label = getCategoryLabel(cat as Category);
      text += `• ${label}: ${formatCurrency(amt)} (${pct}%)\n`;
    });
  } else {
    text += `No transactions logged this month.\n`;
  }

  text += `\nTracked securely with SpendWise – Take Control of Your Money.`;
  return text;
}
