'use client';

import { useState } from 'react';
import { useApp } from '@/lib/store';
import { t } from '@/lib/i18n';
import { TrashIcon, ChartIcon, TaxIcon, ListIcon, WalletIcon } from '@/components/Icons';
import Link from 'next/link';

export default function ExpensesPage() {
  const { locale, expenses, deleteExpense } = useApp();
  const [filter, setFilter] = useState<'all' | 'monthly' | 'tax'>('all');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = expenses.filter(e => {
    if (filter === 'all') return true;
    if (filter === 'monthly') return e.destination === 'monthly' || e.destination === 'both';
    if (filter === 'tax') return e.destination === 'tax' || e.destination === 'both';
    return true;
  });

  const countFor = (f: 'all' | 'monthly' | 'tax') => expenses.filter(e => {
    if (f === 'all') return true;
    if (f === 'monthly') return e.destination === 'monthly' || e.destination === 'both';
    return e.destination === 'tax' || e.destination === 'both';
  }).length;

  const formatJPY = (n: number) => '¥' + n.toLocaleString('ja-JP');

  const handleDelete = (id: string) => {
    deleteExpense(id);
    setConfirmDelete(null);
  };

  return (
    <div className="px-4 pt-6">
      <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent mb-4">
        {t(locale, 'navExpenses')}
      </h1>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 bg-white rounded-xl p-1 border border-gray-100 shadow-sm">
        {(['all', 'monthly', 'tax'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              filter === f
                ? 'bg-gradient-primary text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {f === 'all' ? (
              <ListIcon size={14} />
            ) : f === 'monthly' ? (
              <ChartIcon size={14} />
            ) : (
              <TaxIcon size={14} />
            )}
            <span>
              {f === 'all'
                ? (locale === 'ja' ? 'すべて' : 'All')
                : f === 'monthly'
                ? (locale === 'ja' ? '月次' : 'Monthly')
                : (locale === 'ja' ? '税務' : 'Tax')}
            </span>
            <span className={`text-[10px] ${filter === f ? 'opacity-70' : 'opacity-50'}`}>
              {countFor(f)}
            </span>
          </button>
        ))}
      </div>

      {/* Expense List */}
      {filtered.length > 0 ? (
        <div className="space-y-2">
          {filtered.map((expense, index) => (
            <div
              key={expense.id}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-violet-50 flex items-center justify-center shrink-0 mt-0.5">
                  <WalletIcon size={18} className="text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{expense.vendor}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">
                          {expense.taxCategory}
                        </span>
                        <span className="text-[10px] text-gray-400">{expense.paymentMethod}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-bold">{formatJPY(expense.amount)}</span>
                      <p className="text-[10px] text-gray-400 mt-0.5">{expense.date}</p>
                    </div>
                  </div>

                  {/* Destination badges + delete */}
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                    <div className="flex gap-1.5">
                      {(expense.destination === 'monthly' || expense.destination === 'both') && (
                        <span className="flex items-center gap-1 text-[10px] text-gray-400">
                          <ChartIcon size={10} /> {locale === 'ja' ? '月次' : 'Monthly'}
                        </span>
                      )}
                      {(expense.destination === 'tax' || expense.destination === 'both') && (
                        <span className="flex items-center gap-1 text-[10px] text-gray-400">
                          <TaxIcon size={10} /> {locale === 'ja' ? '税務' : 'Tax'}
                        </span>
                      )}
                    </div>
                    {confirmDelete === expense.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDelete(expense.id)}
                          className="text-[10px] px-2 py-1 bg-red-500 text-white rounded-md font-medium"
                        >
                          {locale === 'ja' ? '削除する' : 'Confirm'}
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="text-[10px] px-2 py-1 bg-gray-100 text-gray-500 rounded-md font-medium"
                        >
                          {t(locale, 'actionCancel')}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(expense.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 transition-colors"
                      >
                        <TrashIcon size={14} />
                      </button>
                    )}
                  </div>

                  {expense.notes && (
                    <p className="text-[11px] text-gray-400 mt-1.5">{expense.notes}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-100 to-violet-100 flex items-center justify-center mb-4">
            <ListIcon size={28} className="text-blue-500" />
          </div>
          <p className="text-gray-500 font-medium">
            {locale === 'ja' ? '経費がまだありません' : 'No expenses yet'}
          </p>
          <Link
            href="/"
            className="inline-block mt-4 px-6 py-2.5 bg-gradient-primary text-white rounded-xl font-medium text-sm shadow-md hover:shadow-lg"
          >
            {locale === 'ja' ? 'スキャンする' : 'Scan Receipt'}
          </Link>
        </div>
      )}
    </div>
  );
}
