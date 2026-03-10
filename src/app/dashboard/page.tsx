'use client';

import { useMemo } from 'react';
import { useApp } from '@/lib/store';
import { t } from '@/lib/i18n';

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

    return { totalThisMonth, totalAll, count: expenses.length, monthCount: thisMonth.length, categories };
  }, [expenses]);

  const formatJPY = (n: number) => '¥' + n.toLocaleString('ja-JP');

  return (
    <div className="px-4 pt-6">
      <h1 className="text-2xl font-bold mb-6">{t(locale, 'dashTitle')}</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm border">
          <p className="text-xs text-gray-500 uppercase">{t(locale, 'dashThisMonth')}</p>
          <p className="text-2xl font-bold text-blue-600">{formatJPY(stats.totalThisMonth)}</p>
          <p className="text-xs text-gray-400">{stats.monthCount} {locale === 'ja' ? '件' : 'items'}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border">
          <p className="text-xs text-gray-500 uppercase">{t(locale, 'dashReceiptsScanned')}</p>
          <p className="text-2xl font-bold text-green-600">{stats.count}</p>
          <p className="text-xs text-gray-400">{formatJPY(stats.totalAll)} {locale === 'ja' ? '合計' : 'total'}</p>
        </div>
      </div>

      {/* Category Breakdown */}
      {stats.categories.length > 0 ? (
        <div className="bg-white rounded-2xl p-4 shadow-sm border">
          <h2 className="font-semibold mb-3">
            {locale === 'ja' ? '勘定科目別' : 'By Category'}
          </h2>
          <div className="space-y-2">
            {stats.categories.map(([cat, amount]) => (
              <div key={cat} className="flex justify-between items-center">
                <span className="text-sm">{cat}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(amount / stats.totalThisMonth) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-24 text-right">{formatJPY(amount)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-2">📸</div>
          <p>{locale === 'ja' ? 'レシートをスキャンして始めましょう' : 'Scan your first receipt to get started'}</p>
        </div>
      )}
    </div>
  );
}
