'use client';

import { useState } from 'react';
import { useApp } from '@/lib/store';
import { t } from '@/lib/i18n';
import { taxCategories, paymentMethods } from '@/lib/categories';
import type { ReceiptData, Expense } from '@/lib/store';
import type { Destination, TaxSheetType } from '@/lib/categories';

interface Props {
  receiptData: ReceiptData;
  receiptImage: string;
  onReset: () => void;
}

export function ReviewForm({ receiptData, receiptImage, onReset }: Props) {
  const { locale, addExpense } = useApp();
  const [data, setData] = useState<ReceiptData>(receiptData);
  const [destination, setDestination] = useState<Destination>('both');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const update = (field: keyof ReceiptData, value: string | number) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);

    const expense: Expense = {
      id: crypto.randomUUID(),
      date: data.date,
      amount: data.amount,
      vendor: data.vendor,
      category: data.category,
      taxCategory: data.taxCategory,
      notes: data.notes,
      paymentMethod: data.paymentMethod,
      destination,
      taxSheetType: data.taxSheetType,
      createdAt: new Date().toISOString(),
    };

    // Save to local storage
    addExpense(expense);

    // Save to Google Sheets
    try {
      const res = await fetch('/api/save-expense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: data.date,
          amount: data.amount,
          vendor: data.vendor,
          category: data.category,
          taxCategory: data.taxCategory,
          notes: data.notes,
          paymentMethod: data.paymentMethod,
          destination,
          taxSheetType: data.taxSheetType,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        console.warn('Google Sheets save failed:', err.error);
        setSaveError(err.error);
      }
    } catch (err) {
      console.warn('Google Sheets save failed:', err);
    }

    setSaving(false);
    setSaved(true);

    setTimeout(() => {
      onReset();
    }, 2000);
  };

  if (saved) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">✅</div>
        <p className="text-lg font-semibold text-green-600">{t(locale, 'actionSaved')}</p>
        {saveError && (
          <p className="text-sm text-yellow-600 mt-2">
            {locale === 'ja' ? '⚠️ ローカル保存済み。Googleシートへの保存に失敗: ' : '⚠️ Saved locally. Google Sheets failed: '}
            {saveError}
          </p>
        )}
        {!saveError && (
          <p className="text-sm text-gray-400 mt-2">
            {locale === 'ja' ? '📊 Googleシートに保存しました' : '📊 Saved to Google Sheets'}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">{t(locale, 'scanReview')}</h2>

      {/* Receipt thumbnail */}
      <div className="flex gap-3 items-start">
        <img src={receiptImage} alt="Receipt" className="w-20 h-20 object-cover rounded-lg border" />
        <div className="flex-1 text-sm text-gray-500">
          {locale === 'ja' ? 'AI信頼度' : 'AI Confidence'}: {data.confidence}%
          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
            <div
              className={`h-2 rounded-full ${data.confidence >= 80 ? 'bg-green-500' : data.confidence >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
              style={{ width: `${data.confidence}%` }}
            />
          </div>
        </div>
      </div>

      {/* Editable Fields */}
      <div className="space-y-3">
        <label className="block">
          <span className="text-sm font-medium text-gray-700">{t(locale, 'fieldDate')}</span>
          <input
            type="date"
            value={data.date}
            onChange={(e) => update('date', e.target.value)}
            className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:border-blue-500 focus:ring-blue-500"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">{t(locale, 'fieldAmount')} (¥)</span>
          <input
            type="number"
            value={data.amount}
            onChange={(e) => update('amount', parseFloat(e.target.value) || 0)}
            className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-3 text-base font-semibold text-lg focus:border-blue-500 focus:ring-blue-500"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">{t(locale, 'fieldVendor')}</span>
          <input
            type="text"
            value={data.vendor}
            onChange={(e) => update('vendor', e.target.value)}
            className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:border-blue-500 focus:ring-blue-500"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">{t(locale, 'taxCatTitle')}</span>
          <select
            value={data.taxCategory}
            onChange={(e) => update('taxCategory', e.target.value)}
            className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:border-blue-500 focus:ring-blue-500"
          >
            {taxCategories.map(cat => (
              <option key={cat.ja} value={cat.ja}>
                {cat.ja} — {cat.en}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">{t(locale, 'fieldPaymentMethod')}</span>
          <select
            value={data.paymentMethod}
            onChange={(e) => update('paymentMethod', e.target.value)}
            className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:border-blue-500 focus:ring-blue-500"
          >
            {paymentMethods.map(pm => (
              <option key={pm.ja} value={pm.ja}>
                {locale === 'ja' ? pm.ja : pm.en}
              </option>
            ))}
          </select>
        </label>

        {/* Tax sheet type */}
        <label className="block">
          <span className="text-sm font-medium text-gray-700">
            {locale === 'ja' ? 'シート区分' : 'Tax Sheet Type'}
          </span>
          <select
            value={data.taxSheetType}
            onChange={(e) => update('taxSheetType', e.target.value)}
            className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="bank">{t(locale, 'taxSheetBank')}</option>
            <option value="other">{t(locale, 'taxSheetOther')}</option>
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">
            {t(locale, 'fieldNotes')}
            {locale === 'en' && data.notesEn && (
              <span className="text-xs text-gray-400 ml-2">({data.notesEn})</span>
            )}
          </span>
          <textarea
            value={data.notes}
            onChange={(e) => update('notes', e.target.value)}
            rows={2}
            placeholder={locale === 'en' ? data.notesEn : ''}
            className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:border-blue-500 focus:ring-blue-500"
          />
          <span className="text-xs text-gray-400 mt-1 block">
            {locale === 'en' ? '* Notes saved in Japanese for tax filing' : '* 日本語で保存されます（確定申告用）'}
          </span>
        </label>
      </div>

      {/* Destination Selector */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">{t(locale, 'destTitle')}</p>
        <div className="grid grid-cols-3 gap-2">
          {(['monthly', 'tax', 'both'] as Destination[]).map(dest => (
            <button
              key={dest}
              onClick={() => setDestination(dest)}
              className={`p-3 rounded-xl border-2 text-center transition-all ${
                destination === dest
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-xl mb-1">
                {dest === 'monthly' ? '📊' : dest === 'tax' ? '🏛️' : '📊🏛️'}
              </div>
              <div className="text-xs font-medium">
                {t(locale, dest === 'monthly' ? 'destMonthly' : dest === 'tax' ? 'destTax' : 'destBoth')}
              </div>
              <div className="text-[10px] text-gray-500 mt-0.5">
                {t(locale, dest === 'monthly' ? 'destMonthlyDesc' : dest === 'tax' ? 'destTaxDesc' : 'destBothDesc')}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onReset}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-medium transition-colors"
        >
          {t(locale, 'actionCancel')}
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-8 rounded-xl font-semibold transition-colors"
        >
          {saving ? t(locale, 'actionSaving') : t(locale, 'actionSave')}
        </button>
      </div>
    </div>
  );
}
