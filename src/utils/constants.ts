import {
  Utensils,
  Car,
  ShoppingBag,
  GraduationCap,
  Film,
  HeartPulse,
  Receipt,
  Plane,
  MoreHorizontal,
  Banknote,
  Smartphone,
  CreditCard,
  Wallet,
} from 'lucide-react';
import React from 'react';
import { Category, PaymentMethod } from '../types';

export const CATEGORIES: {
  id: Category;
  label: string;
  color: string;
  bgLight: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
}[] = [
  { id: 'Food', label: 'Food & Dining', color: '#10B981', bgLight: 'rgba(16, 185, 129, 0.12)', icon: Utensils },
  { id: 'Transport', label: 'Transport', color: '#3B82F6', bgLight: 'rgba(59, 130, 246, 0.12)', icon: Car },
  { id: 'Shopping', label: 'Shopping', color: '#8B5CF6', bgLight: 'rgba(139, 92, 246, 0.12)', icon: ShoppingBag },
  { id: 'Bills', label: 'Bills & Utilities', color: '#F59E0B', bgLight: 'rgba(245, 158, 11, 0.12)', icon: Receipt },
  { id: 'Entertainment', label: 'Entertainment', color: '#EC4899', bgLight: 'rgba(236, 72, 153, 0.12)', icon: Film },
  { id: 'Health', label: 'Health & Care', color: '#06B6D4', bgLight: 'rgba(6, 182, 212, 0.12)', icon: HeartPulse },
  { id: 'Education', label: 'Education', color: '#6366F1', bgLight: 'rgba(99, 102, 241, 0.12)', icon: GraduationCap },
  { id: 'Travel', label: 'Travel', color: '#14B8A6', bgLight: 'rgba(20, 184, 166, 0.12)', icon: Plane },
  { id: 'Other', label: 'Other', color: '#94A3B8', bgLight: 'rgba(148, 163, 184, 0.12)', icon: MoreHorizontal },
];

export const PAYMENT_METHODS: {
  id: PaymentMethod;
  label: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
}[] = [
  { id: 'UPI', label: 'UPI / GPay / PhonePe', icon: Smartphone },
  { id: 'Debit Card', label: 'Debit Card', icon: CreditCard },
  { id: 'Credit Card', label: 'Credit Card', icon: CreditCard },
  { id: 'Cash', label: 'Cash', icon: Banknote },
  { id: 'Other', label: 'Other', icon: Wallet },
];

export const DEFAULT_MONTHLY_BUDGET = 25000; // ₹25,000 standard initial monthly budget
