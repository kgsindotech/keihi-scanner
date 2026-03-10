'use client';

import { useState } from 'react';
import { useApp } from '@/lib/store';
import { t } from '@/lib/i18n';
import { GlobeIcon, SheetIcon, CheckCircleIcon, AlertIcon } from '@/components/Icons';
import type { Locale } from '@/lib/i18n';

export default function SettingsPage() {
  const { locale, setLocale } = useApp();
  const [sheetStatus, setSheetStatus] = useState<'idle' | 'checking' | 'connected' | 'error'>('idle');
  const [sheetError, setSheetError] = useState<string>('');

  const checkSheetConnection = async () => {
    setSheetStatus('checking');
    try {
      const res = await fetch('/api/check-sheets');
      if (res.ok) {
        setSheetStatus('connected');
      } else {
        const data = await res.json();
        setSheetError(data.error || 'Connection failed');
        setSheetStatus('error');
      }
    } catch {
      setSheetError('Network error');
      setSheetStatus('error');
    }
  };

  return (
    <div className="px-4 pt-6">
      <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent mb-6">
        {t(locale, 'settingsTitle')}
      </h1>

      <div className="space-y-4">
        {/* Language Selector */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-100 to-violet-100 flex items-center justify-center">
              <GlobeIcon size={18} className="text-blue-600" />
            </div>
            <h2 className="font-bold text-sm">{t(locale, 'settingsLanguage')}</h2>
          </div>
          <div className="flex gap-2">
            {(['en', 'ja'] as Locale[]).map(lang => (
              <button
                key={lang}
                onClick={() => setLocale(lang)}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all active:scale-[0.98] ${
                  locale === lang
                    ? 'bg-gradient-primary text-white shadow-md'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100'
                }`}
              >
                {lang === 'en' ? 'English' : '日本語'}
              </button>
            ))}
          </div>
        </div>

        {/* Google Sheet Connection */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center">
              <SheetIcon size={18} className="text-emerald-600" />
            </div>
            <h2 className="font-bold text-sm">{t(locale, 'settingsGoogleSheet')}</h2>
          </div>

          {sheetStatus === 'idle' && (
            <button
              onClick={checkSheetConnection}
              className="w-full py-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 font-medium border border-gray-100 transition-all active:scale-[0.98]"
            >
              {locale === 'ja' ? '接続をテスト' : 'Test Connection'}
            </button>
          )}

          {sheetStatus === 'checking' && (
            <div className="flex items-center gap-2 py-3 px-4 rounded-xl bg-blue-50 text-blue-600">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium">{locale === 'ja' ? '確認中...' : 'Checking...'}</span>
            </div>
          )}

          {sheetStatus === 'connected' && (
            <div className="flex items-center gap-2 py-3 px-4 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircleIcon size={18} />
              <span className="text-sm font-medium">{t(locale, 'settingsConnected')}</span>
            </div>
          )}

          {sheetStatus === 'error' && (
            <div>
              <div className="flex items-center gap-2 py-3 px-4 rounded-xl bg-red-50 text-red-600 mb-2">
                <AlertIcon size={18} />
                <span className="text-sm font-medium">{sheetError}</span>
              </div>
              <button
                onClick={checkSheetConnection}
                className="w-full py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 font-medium text-sm border border-gray-100"
              >
                {t(locale, 'actionRetry')}
              </button>
            </div>
          )}
        </div>

        {/* App Info */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-bold text-sm mb-3">
            {locale === 'ja' ? 'アプリ情報' : 'About'}
          </h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">{locale === 'ja' ? 'バージョン' : 'Version'}</span>
              <span className="text-sm font-medium bg-gray-100 px-2.5 py-0.5 rounded-full">v0.2.0</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed pt-1">
              {locale === 'ja'
                ? 'AIでレシートを読み取り、経費を自動管理。確定申告にも対応。'
                : 'AI-powered receipt scanning for expense tracking and tax filing in Japan.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
