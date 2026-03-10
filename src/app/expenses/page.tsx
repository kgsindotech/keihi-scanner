'use client';

import { useState } from 'react';
import { useApp } from '@/lib/store';
import { t } from '@/lib/i18n';

export default function ExpensesPage() {
  const { locale, expenses } = useApp();
  const [filter, setFilter] = useState<'all' | 'monthly' | 'tax'>('all');

  const filtered = expenses.filter(e => {
    if (filter === 'all') return true;
    if (filter === 'monthly') return e.destination === 'monthly' || e.destination === 'both';
    if (filter === 'tax') return e.destination === 'tax' || e.destination === 'both';
    return true;
  });

  const formatJPY = (n: number) => '¥' + n.toLocaleString('ja-JP');

  return (
    <div className="px-4 pt-6">
      <h1 className="text-2xl font-bold mb-4">{t(locale, 'navExpenses')}</h1>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {(['all', 'monthly', 'tax'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f === 'all'
              ? (locale === 'ja' ? 'すべて' : 'All')
              : f === 'monthly'
              ? t(locale, 'destMonthly')
              : t(locale, 'destTax')}
            <span className="ml-1 text-xs opacity-75">
              ({expenses.filter(e => {
                if (f === 'all') return true;
                if (f === 'monthly') return e.destination === 'monthly' || e.destination === 'both';
                return e.destination === 'tax' || e.destination === 'both';
              }).length})
            </span>
          </button>
        ))}
      </div>

      {/* Expense List */}
      {filtered.length > 0 ? (
        <div className="space-y-2">
          {filtered.map(expense => (
            <div key={expense.id} className="bg-white rounded-xl p-4 shadow-sm border flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">{expense.vendor}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                    {expense.taxCategory}
                  </span>
                </div>
                <div className="text-xs text-gray-500 flex gap-3">
                  <span>{expense.date}</span>
                  <span>{expense.paymentMethod}</span>
                  <span className="flex gap-1">
                    {(expense.destination === 'monthly' || expense.destination === 'both') && (
                      <span title="Monthly Tracker">📊</span>
                    )}
                    {(expense.destination === 'tax' || expense.destination === 'both') && (
                      <span title="Tax Sheet">🏛️</span>
                    )}
                  </span>
                </div>
                {expense.notes && (
                  <p className="text-xs text-gray-400 mt-1">{expense.notes}</p>
                )}
              </div>
              <div className="text-right">
                <span className="font-bold text-lg">{formatJPY(expense.amount)}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-2">📋</div>
          <p>{locale === 'ja' ? '経費がまだありません' : 'No expenses yet'}</p>
        </div>
      )}
    </div>
  );
}
