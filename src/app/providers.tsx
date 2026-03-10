'use client';

import { useState, useEffect, useCallback } from 'react';
import { AppContext } from '@/lib/store';
import type { Expense } from '@/lib/store';
import type { Locale } from '@/lib/i18n';

export function Providers({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('keihi-locale');
    if (saved === 'ja' || saved === 'en') setLocaleState(saved);

    const savedExpenses = localStorage.getItem('keihi-expenses');
    if (savedExpenses) {
      try { setExpenses(JSON.parse(savedExpenses)); } catch {}
    }
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem('keihi-locale', l);
  }, []);

  const addExpense = useCallback((expense: Expense) => {
    setExpenses(prev => {
      const next = [expense, ...prev];
      localStorage.setItem('keihi-expenses', JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <AppContext.Provider value={{ locale, setLocale, expenses, addExpense }}>
      {children}
    </AppContext.Provider>
  );
}
