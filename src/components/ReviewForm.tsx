'use client';

import { useState, useMemo } from 'react';
import { useApp } from '@/lib/store';
import { t } from '@/lib/i18n';
import { taxCategories, paymentMethods } from '@/lib/categories';
import { CheckCircleIcon, ChartIcon, TaxIcon, SpinnerIcon, AlertIcon } from './Icons';
import type { ReceiptData, Expense } from '@/lib/store';
import type { Destination, TaxSheetType } from '@/lib/categories';

interface Props {
  receiptData: ReceiptData;
  receiptImage: string;
  onReset: () => void;
}

export function ReviewForm({ receiptData, receiptImage, onReset }: Props) {
  const { locale, addExpense, expenses } = useApp();
  const [data, setData] = useState<ReceiptData>(receiptData);
  const [destination, setDestination] = useState<Destination>('both');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [duplicateOverride, setDuplicateOverride] = useState(false);

  const update = (field: keyof ReceiptData, value: string | number) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  // Check for duplicate: same date + amount, or same date + similar vendor
  const duplicate = useMemo(() => {
    return expenses.find(e =>
      e.date === data.date &&
      e.amount === data.amount &&
      (e.vendor === data.vendor || e.vendor.includes(data.vendor) || data.vendor.includes(e.vendor))
    );
  }, [expenses, data.date, data.amount, data.vendor]);

  // Input validation
  const validationErrors = useMemo(() => {
    const errors: string[] = [];
    if (!data.vendor.trim()) errors.push(locale === 'ja' ? '取引先を入力してください' : 'Vendor is required');
    if (!data.amount || data.amount <= 0) errors.push(locale === 'ja' ? '金額は0より大きい値を入力' : 'Amount must be greater than 0');
    if (!data.date) errors.push(locale === 'ja' ? '日付を入力してください' : 'Date is required');
    const today = new Date().toISOString().split('T')[0];
    if (data.date > today) errors.push(locale === 'ja' ? '未来の日付は使用できません' : 'Future dates are not allowed');
    return errors;
  }, [data.vendor, data.amount, data.date, locale]);

  const handleSave = async () => {
    // Block save if validation fails or duplicate not overridden
    if (validationErrors.length > 0) return;
    if (duplicate && !duplicateOverride) return;
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
    }, 2500);
  };

  if (saved) {
    return (
      <div className="text-center py-16 animate-fade-in-up">
        <div className="animate-success-bounce inline-block">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-success flex items-center justify-center shadow-lg">
            <CheckCircleIcon size={40} className="text-white" />
          </div>
        </div>
        <p className="text-xl font-bold text-gray-800 mt-6">{t(locale, 'actionSaved')}</p>
        {saveError ? (
          <div className="mt-3 flex items-center justify-center gap-2 text-amber-600">
            <AlertIcon size={16} />
            <p className="text-sm">
              {locale === 'ja' ? 'ローカル保存済み。Googleシートへの保存に失敗' : 'Saved locally. Google Sheets failed'}
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-400 mt-2">
            {locale === 'ja' ? 'Googleシートに保存しました' : 'Saved to Google Sheets'}
          </p>
        )}
      </div>
    );
  }

  const confidenceColor = data.confidence >= 80 ? 'from-emerald-500 to-green-400' : data.confidence >= 50 ? 'from-amber-500 to-yellow-400' : 'from-red-500 to-rose-400';
  const confidenceText = data.confidence >= 80 ? 'text-emerald-600' : data.confidence >= 50 ? 'text-amber-600' : 'text-red-600';

  return (
    <div className="space-y-4 animate-fade-in-up">
      <h2 className="text-lg font-bold">{t(locale, 'scanReview')}</h2>

      {/* Receipt thumbnail + confidence */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="flex gap-4 items-start">
          <img src={receiptImage} alt="Receipt" className="w-20 h-24 object-cover rounded-xl border border-gray-100 shadow-sm" />
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-xs font-medium text-gray-500">
                {locale === 'ja' ? 'AI信頼度' : 'AI Confidence'}
              </span>
              <span className={`text-sm font-bold ${confidenceText}`}>{data.confidence}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full bg-gradient-to-r ${confidenceColor} transition-all duration-500`}
                style={{ width: `${data.confidence}%` }}
              />
            </div>
            <p className="text-lg font-bold mt-3">¥{data.amount.toLocaleString('ja-JP')}</p>
            <p className="text-sm text-gray-500 truncate">{data.vendor}</p>
          </div>
        </div>
      </div>

      {/* Editable Fields */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-4">
        <label className="block">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t(locale, 'fieldDate')}</span>
          <input
            type="date"
            value={data.date}
            onChange={(e) => update('date', e.target.value)}
            className="mt-1.5 block w-full rounded-xl border border-gray-200 px-4 py-3 text-base bg-gray-50/50"
          />
        </label>

        <label className="block">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t(locale, 'fieldAmount')} (¥)</span>
          <input
            type="number"
            value={data.amount}
            onChange={(e) => update('amount', parseFloat(e.target.value) || 0)}
            className="mt-1.5 block w-full rounded-xl border border-gray-200 px-4 py-3 text-lg font-bold bg-gray-50/50"
          />
        </label>

        <label className="block">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t(locale, 'fieldVendor')}</span>
          <input
            type="text"
            value={data.vendor}
            onChange={(e) => update('vendor', e.target.value)}
            className="mt-1.5 block w-full rounded-xl border border-gray-200 px-4 py-3 text-base bg-gray-50/50"
          />
        </label>

        <label className="block">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t(locale, 'taxCatTitle')}</span>
          <select
            value={data.taxCategory}
            onChange={(e) => update('taxCategory', e.target.value)}
            className="mt-1.5 block w-full rounded-xl border border-gray-200 px-4 py-3 text-base bg-gray-50/50 appearance-none"
          >
            {taxCategories.map(cat => (
              <option key={cat.ja} value={cat.ja}>
                {cat.ja} — {cat.en}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t(locale, 'fieldPaymentMethod')}</span>
          <select
            value={data.paymentMethod}
            onChange={(e) => update('paymentMethod', e.target.value)}
            className="mt-1.5 block w-full rounded-xl border border-gray-200 px-4 py-3 text-base bg-gray-50/50 appearance-none"
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
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {locale === 'ja' ? 'シート区分' : 'Tax Sheet Type'}
          </span>
          <select
            value={data.taxSheetType}
            onChange={(e) => update('taxSheetType', e.target.value)}
            className="mt-1.5 block w-full rounded-xl border border-gray-200 px-4 py-3 text-base bg-gray-50/50 appearance-none"
          >
            <option value="bank">{t(locale, 'taxSheetBank')}</option>
            <option value="other">{t(locale, 'taxSheetOther')}</option>
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {t(locale, 'fieldNotes')}
            {locale === 'en' && data.notesEn && (
              <span className="text-gray-400 normal-case font-normal ml-2">({data.notesEn})</span>
            )}
          </span>
          <textarea
            value={data.notes}
            onChange={(e) => update('notes', e.target.value)}
            rows={2}
            placeholder={locale === 'en' ? data.notesEn : ''}
            className="mt-1.5 block w-full rounded-xl border border-gray-200 px-4 py-3 text-base bg-gray-50/50 resize-none"
          />
          <span className="text-[10px] text-gray-400 mt-1 block">
            {locale === 'en' ? '* Notes saved in Japanese for tax filing' : '* 日本語で保存されます（確定申告用）'}
          </span>
        </label>
      </div>

      {/* Destination Selector */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{t(locale, 'destTitle')}</p>
        <div className="grid grid-cols-3 gap-2">
          {(['monthly', 'tax', 'both'] as Destination[]).map(dest => (
            <button
              key={dest}
              onClick={() => setDestination(dest)}
              className={`p-3 rounded-xl border-2 text-center transition-all active:scale-[0.97] ${
                destination === dest
                  ? 'border-blue-500 bg-blue-50 shadow-sm'
                  : 'border-gray-100 hover:border-gray-200 bg-gray-50/50'
              }`}
            >
              <div className={`mx-auto w-8 h-8 rounded-lg flex items-center justify-center mb-1.5 ${
                destination === dest ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                {dest === 'monthly' ? (
                  <ChartIcon size={16} className={destination === dest ? 'text-blue-600' : 'text-gray-400'} />
                ) : dest === 'tax' ? (
                  <TaxIcon size={16} className={destination === dest ? 'text-blue-600' : 'text-gray-400'} />
                ) : (
                  <div className="flex -space-x-1">
                    <ChartIcon size={12} className={destination === dest ? 'text-blue-600' : 'text-gray-400'} />
                    <TaxIcon size={12} className={destination === dest ? 'text-blue-600' : 'text-gray-400'} />
                  </div>
                )}
              </div>
              <div className={`text-xs font-semibold ${destination === dest ? 'text-blue-700' : 'text-gray-600'}`}>
                {t(locale, dest === 'monthly' ? 'destMonthly' : dest === 'tax' ? 'destTax' : 'destBoth')}
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5 leading-tight">
                {t(locale, dest === 'monthly' ? 'destMonthlyDesc' : dest === 'tax' ? 'destTaxDesc' : 'destBothDesc')}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Low Confidence Warning */}
      {data.confidence < 50 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 animate-fade-in-up">
          <div className="flex items-start gap-3">
            <AlertIcon size={20} className="text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-800">
                {locale === 'ja' ? 'AI読み取り精度が低いです' : 'Low AI Confidence'}
              </p>
              <p className="text-xs text-red-600 mt-1">
                {locale === 'ja'
                  ? '各項目を手動で確認・修正してから保存してください。'
                  : 'Please manually verify all fields before saving.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 animate-fade-in-up">
          <div className="flex items-start gap-3">
            <AlertIcon size={20} className="text-red-500 shrink-0 mt-0.5" />
            <div>
              {validationErrors.map((err, i) => (
                <p key={i} className="text-xs text-red-600">{err}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Duplicate Warning */}
      {duplicate && !duplicateOverride && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 animate-fade-in-up">
          <div className="flex items-start gap-3">
            <AlertIcon size={20} className="text-amber-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800">
                {locale === 'ja' ? '重複の可能性があります' : 'Possible Duplicate'}
              </p>
              <p className="text-xs text-amber-600 mt-1">
                {locale === 'ja'
                  ? `${duplicate.date} に ${duplicate.vendor} ¥${duplicate.amount.toLocaleString('ja-JP')} が既に登録されています。`
                  : `${duplicate.vendor} ¥${duplicate.amount.toLocaleString('ja-JP')} on ${duplicate.date} already exists.`}
              </p>
              <button
                onClick={() => setDuplicateOverride(true)}
                className="mt-2.5 text-xs font-semibold text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors"
              >
                {locale === 'ja' ? 'それでも保存する' : 'Save Anyway'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-1 pb-4">
        <button
          onClick={onReset}
          className="flex-1 bg-white hover:bg-gray-50 text-gray-600 py-3.5 rounded-xl font-medium border border-gray-200 shadow-sm active:scale-[0.98]"
        >
          {t(locale, 'actionCancel')}
        </button>
        <button
          onClick={handleSave}
          disabled={saving || validationErrors.length > 0 || (!!duplicate && !duplicateOverride)}
          className={`flex-[2] py-3.5 px-8 rounded-xl font-semibold shadow-md active:scale-[0.98] transition-all ${
            validationErrors.length > 0 || (duplicate && !duplicateOverride)
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-primary hover:shadow-lg disabled:opacity-60 text-white'
          }`}
        >
          {saving ? (
            <span className="flex items-center justify-center gap-2">
              <SpinnerIcon size={18} />
              {t(locale, 'actionSaving')}
            </span>
          ) : (
            t(locale, 'actionSave')
          )}
        </button>
      </div>
    </div>
  );
}
