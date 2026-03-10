'use client';

import { useApp } from '@/lib/store';
import { t } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n';

export default function SettingsPage() {
  const { locale, setLocale } = useApp();

  return (
    <div className="px-4 pt-6">
      <h1 className="text-2xl font-bold mb-6">{t(locale, 'settingsTitle')}</h1>

      <div className="space-y-4">
        {/* Language Selector */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border">
          <h2 className="font-semibold mb-3">{t(locale, 'settingsLanguage')}</h2>
          <div className="flex gap-2">
            {(['en', 'ja'] as Locale[]).map(lang => (
              <button
                key={lang}
                onClick={() => setLocale(lang)}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                  locale === lang
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {lang === 'en' ? '🇬🇧 English' : '🇯🇵 日本語'}
              </button>
            ))}
          </div>
        </div>

        {/* Google Sheet Connection */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border">
          <h2 className="font-semibold mb-2">{t(locale, 'settingsGoogleSheet')}</h2>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
            <span className="text-sm text-gray-500">
              {locale === 'ja' ? '次のアップデートで対応予定' : 'Coming in next update'}
            </span>
          </div>
        </div>

        {/* App Info */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border">
          <h2 className="font-semibold mb-2">
            {locale === 'ja' ? 'アプリ情報' : 'About'}
          </h2>
          <div className="text-sm text-gray-500 space-y-1">
            <p>Keihi Scanner v0.1.0</p>
            <p>{locale === 'ja'
              ? 'AIでレシートを読み取り、経費を自動管理。確定申告にも対応。'
              : 'AI-powered receipt scanning for expense tracking and tax filing in Japan.'
            }</p>
          </div>
        </div>
      </div>
    </div>
  );
}
