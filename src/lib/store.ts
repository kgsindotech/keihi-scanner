'use client';

import { createContext, useContext } from 'react';
import type { Locale } from './i18n';
import type { Destination, TaxSheetType } from './categories';

// Receipt data extracted by AI
export interface ReceiptData {
  date: string;
  amount: number;
  vendor: string;
  category: string;
  taxCategory: string;
  notes: string;      // Always Japanese (for Google Sheet)
  notesEn: string;    // English version (for UI display)
  paymentMethod: string;
  taxSheetType: TaxSheetType;
  confidence: number; // 0-100 AI confidence score
}

// Saved expense record
export interface Expense {
  id: string;
  date: string;
  amount: number;
  vendor: string;
  category: string;
  taxCategory: string;
  notes: string;
  paymentMethod: string;
  destination: Destination;
  taxSheetType: TaxSheetType;
  receiptImageUrl?: string;
  createdAt: string;
}

// App state
export interface AppState {
  locale: Locale;
  expenses: Expense[];
}

export interface AppContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  expenses: Expense[];
  addExpense: (expense: Expense) => void;
}

export const AppContext = createContext<AppContextType>({
  locale: 'en',
  setLocale: () => {},
  expenses: [],
  addExpense: () => {},
});

export const useApp = () => useContext(AppContext);
