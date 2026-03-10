'use client';

import { useMemo } from 'react';
import { useApp } from '@/lib/store';
import { t } from '@/lib/i18n';
import { ScanIcon, WalletIcon, CalendarIcon } from '@/components/Icons';
import Link from 'next/link';

// Color palette for category bars
const barColors = [
  'from-blue-500 to-blue-400',
  'from-violet-500 to-violet-400',
  'from-emerald-500 to-emerald-400',
  'from-amber-500 to-amber-400',
  'from-rose-500 to-rose-400',
  'from-cyan-500 to-cyan-400',
  'from-pink-500 to-pink-400',
  'from-indigo-500 to-indigo-400',
];

export default function DashboardPage() {
  const { locale, expenses } = useApp();

  const stats = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const thisMonth = expenses.filter(e => new Date(e.date) >= monthStart);
    const totalThisMonth = thisMonth.reduce((sum, e) => sum + e.amount, 0);
    const totalAll = expenses.reduce((sum, e) => sum + e.amount, 0);

    // Group by tax category
    const byCategory: Record<string, number> = {};
    thisMonth.forEach(e => {
      const key = e.taxCategory || e.category || 'その他';
      byCategory[key] = (byCategory[key] || 0) + e.amount;
    });

    const categories = Object.entries(byCategory)
      .sort((a, b) => b[1] - a[1]);

    // Recent expenses (last 5)
    const recent = [...expenses].slice(0, 5);

    return { totalThisMonth, totalAll, count: expenses.length, monthCount: thisMonth.length, categories, recent };
  }, [expenses]);

  const formatJPY = (n: number) => '¥' + n.toLocaleString('ja-JP');

  return (
    <div className="px-4 pt-6">
      <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent mb-6">
        {t(locale, 'dashTitle')}
      </h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-gradient-primary rounded-2xl p-4 shadow-lg text-white">
          <div className="flex items-center gap-2 mb-2 opacity-80">
            <CalendarIcon size={14} />
            <p className="text-xs font-medium uppercase">{t(locale, 'dashThisMonth')}</p>
          </div>
          <p className="text-2xl font-bold">{formatJPY(stats.totalThisMonth)}</p>
          <p className="text-xs opacity-60 mt-1">{stats.monthCount} {locale === 'ja' ? '件' : 'items'}</p>
        </div>
        <div className="bg-gradient-success rounded-2xl p-4 shadow-lg text-white">
          <div className="flex items-center gap-2 mb-2 opacity-80">
            <ScanIcon size={14} />
            <p className="text-xs font-medium uppercase">{t(locale, 'dashReceiptsScanned')}</p>
          </div>
          <p className="text-2xl font-bold">{stats.count}</p>
          <p className="text-xs opacity-60 mt-1">{formatJPY(stats.totalAll)} {locale === 'ja' ? '合計' : 'total'}</p>
        </div>
      </div>

      {/* Category Breakdown */}
      {stats.categories.length > 0 ? (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
          <h2 className="font-bold text-sm mb-4">
            {locale === 'ja' ? '今月の勘定科目別' : 'This Month by Category'}
          </h2>
          <div className="space-y-3">
            {stats.categories.map(([cat, amount], i) => {
              const pct = (amount / stats.totalThisMonth) * 100;
              return (
                <div key={cat}>
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-sm text-gray-700">{cat}</span>
                    <span className="text-sm font-semibold">{formatJPY(amount)}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`bg-gradient-to-r ${barColors[i % barColors.length]} h-2 rounded-full transition-all duration-700`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center mb-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-100 to-violet-100 flex items-center justify-center mb-4">
            <ScanIcon size={28} className="text-blue-500" />
          </div>
          <p className="text-gray-500 font-medium">
            {locale === 'ja' ? 'レシートをスキャンして始めましょう' : 'Scan your first receipt to get started'}
          </p>
          <Link
            href="/"
            className="inline-block mt-4 px-6 py-2.5 bg-gradient-primary text-white rounded-xl font-medium text-sm shadow-md hover:shadow-lg"
          >
            {t(locale, 'navScan')}
          </Link>
        </div>
      )}

      {/* Recent Expenses */}
      {stats.recent.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-sm">
              {t(locale, 'dashRecentExpenses')}
            </h2>
            <Link href="/expenses" className="text-xs text-blue-600 font-medium">
              {locale === 'ja' ? 'すべて見る' : 'View all'}
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recent.map(expense => (
              <div key={expense.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                    <WalletIcon size={18} className="text-gray-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{expense.vendor}</p>
                    <p className="text-xs text-gray-400">{expense.date}</p>
                  </div>
                </div>
                <span className="font-bold text-sm ml-2 shrink-0">{formatJPY(expense.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
