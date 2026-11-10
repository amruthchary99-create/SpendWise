import { Transaction } from '../types';

export function generateSampleTransactions(): Transaction[] {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed

  // Format date helper
  const makeDate = (year: number, month: number, day: number) => {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  const currentDay = Math.min(now.getDate(), 28);

  const sampleList: Array<Omit<Transaction, 'id' | 'createdAt'>> = [
    // Current Month Transactions
    {
      title: 'Blinkit Quick Grocery',
      amount: 780,
      category: 'Food',
      paymentMethod: 'UPI',
      date: makeDate(currentYear, currentMonth, Math.max(1, currentDay - 1)),
      notes: 'Vegetables, milk, bread and oats',
      isSample: true,
    },
    {
      title: 'Electricity & Water Bill',
      amount: 2450,
      category: 'Bills',
      paymentMethod: 'UPI',
      date: makeDate(currentYear, currentMonth, Math.max(1, currentDay - 3)),
      notes: 'State electricity board monthly bill',
      isSample: true,
    },
    {
      title: 'Metro Smart Card Recharge',
      amount: 500,
      category: 'Transport',
      paymentMethod: 'UPI',
      date: makeDate(currentYear, currentMonth, Math.max(1, currentDay - 4)),
      notes: 'Commute reload for 2 weeks',
      isSample: true,
    },
    {
      title: 'Dinner at Punjabi Rasoi',
      amount: 1420,
      category: 'Food',
      paymentMethod: 'Credit Card',
      date: makeDate(currentYear, currentMonth, Math.max(1, currentDay - 6)),
      notes: 'Family weekend dinner',
      isSample: true,
    },
    {
      title: 'Zudio Cotton Shirt & Socks',
      amount: 1199,
      category: 'Shopping',
      paymentMethod: 'Debit Card',
      date: makeDate(currentYear, currentMonth, Math.max(1, currentDay - 8)),
      notes: 'Weekend casual wear',
      isSample: true,
    },
    {
      title: 'Health Pharmacy Medicine',
      amount: 650,
      category: 'Health',
      paymentMethod: 'UPI',
      date: makeDate(currentYear, currentMonth, Math.max(1, currentDay - 10)),
      notes: 'Vitamin D & daily supplements',
      isSample: true,
    },
    {
      title: 'WiFi Broadband Bill',
      amount: 943,
      category: 'Bills',
      paymentMethod: 'UPI',
      date: makeDate(currentYear, currentMonth, Math.max(1, currentDay - 12)),
      notes: 'Airtel Fiber 100Mbps plan',
      isSample: true,
    },
    {
      title: 'Movie Tickets: IMAX',
      amount: 880,
      category: 'Entertainment',
      paymentMethod: 'UPI',
      date: makeDate(currentYear, currentMonth, Math.max(1, currentDay - 14)),
      notes: '2 tickets + small popcorn',
      isSample: true,
    },
    {
      title: 'Auto Rickshaw & Cabs',
      amount: 320,
      category: 'Transport',
      paymentMethod: 'Cash',
      date: makeDate(currentYear, currentMonth, Math.max(1, currentDay - 15)),
      notes: 'Office commute cash fare',
      isSample: true,
    },
    {
      title: 'Course Subscription',
      amount: 1299,
      category: 'Education',
      paymentMethod: 'Debit Card',
      date: makeDate(currentYear, currentMonth, Math.max(1, currentDay - 18)),
      notes: 'Financial literacy & coding book',
      isSample: true,
    },

    // Previous Month Transactions (for Spending Pulse comparative analytics)
    {
      title: 'Previous Month Rent Share',
      amount: 8500,
      category: 'Bills',
      paymentMethod: 'UPI',
      date: makeDate(prevYear, prevMonth, 5),
      notes: 'Monthly apartment rent share',
      isSample: true,
    },
    {
      title: 'Previous Month Grocery Bulk',
      amount: 3400,
      category: 'Food',
      paymentMethod: 'Debit Card',
      date: makeDate(prevYear, prevMonth, 8),
      notes: 'Monthly provisions from DMart',
      isSample: true,
    },
    {
      title: 'Train Ticket to Hometown',
      amount: 1850,
      category: 'Travel',
      paymentMethod: 'UPI',
      date: makeDate(prevYear, prevMonth, 16),
      notes: 'IRCTC 2-tier AC return ticket',
      isSample: true,
    },
    {
      title: 'Sneakers Sale',
      amount: 2499,
      category: 'Shopping',
      paymentMethod: 'Credit Card',
      date: makeDate(prevYear, prevMonth, 22),
      notes: 'Running shoes on discount',
      isSample: true,
    },
    {
      title: 'Previous Month Broadband',
      amount: 943,
      category: 'Bills',
      paymentMethod: 'UPI',
      date: makeDate(prevYear, prevMonth, 25),
      notes: 'Monthly fiber internet',
      isSample: true,
    },
  ];

  return sampleList.map((item, index) => ({
    ...item,
    id: `sample-${Date.now()}-${index}`,
    createdAt: Date.now() - (index * 86400000),
  }));
}
