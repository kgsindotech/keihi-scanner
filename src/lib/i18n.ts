export type Locale = 'en' | 'ja';

export const translations = {
  en: {
    // App
    appName: 'Keihi Scanner',
    appTagline: 'Scan receipts. Track expenses. File taxes.',

    // Navigation
    navScan: 'Scan Receipt',
    navDashboard: 'Dashboard',
    navExpenses: 'Expenses',
    navSettings: 'Settings',

    // Scanner
    scanTitle: 'Scan Receipt',
    scanUpload: 'Upload or take a photo of your receipt',
    scanDragDrop: 'Drag & drop or tap to select',
    scanTakePhoto: 'Take Photo',
    scanChooseFile: 'Choose File',
    scanProcessing: 'Reading receipt with AI...',
    scanReview: 'Review Extracted Data',

    // Receipt fields
    fieldDate: 'Date',
    fieldAmount: 'Amount',
    fieldVendor: 'Vendor',
    fieldCategory: 'Category',
    fieldNotes: 'Notes',
    fieldPaymentMethod: 'Payment Method',

    // Destination
    destTitle: 'Save to:',
    destMonthly: 'Monthly Tracker',
    destMonthlyDesc: 'Personal expense tracking',
    destTax: 'Tax Sheet',
    destTaxDesc: 'For 確定申告 (tax filing)',
    destBoth: 'Both',
    destBothDesc: 'Track & file',

    // Tax categories (勘定科目)
    taxCatTitle: 'Tax Category (勘定科目)',
    taxSheetBank: 'Bank Transfer (通帳)',
    taxSheetOther: 'Cash/Card/PayPay (その他)',

    // Actions
    actionSave: 'Save',
    actionCancel: 'Cancel',
    actionEdit: 'Edit',
    actionDelete: 'Delete',
    actionRetry: 'Retry',
    actionSaving: 'Saving...',
    actionSaved: 'Saved!',

    // Dashboard
    dashTitle: 'Dashboard',
    dashTotalSpent: 'Total Spent',
    dashThisMonth: 'This Month',
    dashReceiptsScanned: 'Receipts Scanned',
    dashRecentExpenses: 'Recent Expenses',

    // Settings
    settingsTitle: 'Settings',
    settingsLanguage: 'Language',
    settingsGoogleSheet: 'Google Sheet Connection',
    settingsConnected: 'Connected',
    settingsNotConnected: 'Not Connected',

    // Messages
    msgSuccess: 'Expense saved successfully!',
    msgError: 'Something went wrong. Please try again.',
    msgNoReceipt: 'No receipt detected in the image.',

    // Language
    langEnglish: 'English',
    langJapanese: '日本語',
  },

  ja: {
    // App
    appName: '経費スキャナー',
    appTagline: 'レシートをスキャン。経費を管理。確定申告に。',

    // Navigation
    navScan: 'スキャン',
    navDashboard: 'ダッシュボード',
    navExpenses: '経費一覧',
    navSettings: '設定',

    // Scanner
    scanTitle: 'レシートスキャン',
    scanUpload: 'レシートの写真をアップロードまたは撮影',
    scanDragDrop: 'ドラッグ＆ドロップ または タップして選択',
    scanTakePhoto: '写真を撮る',
    scanChooseFile: 'ファイルを選択',
    scanProcessing: 'AIがレシートを読み取り中...',
    scanReview: '読み取り結果を確認',

    // Receipt fields
    fieldDate: '日付',
    fieldAmount: '金額',
    fieldVendor: '取引先',
    fieldCategory: 'カテゴリ',
    fieldNotes: '備考',
    fieldPaymentMethod: '支払方法',

    // Destination
    destTitle: '保存先:',
    destMonthly: '月次トラッカー',
    destMonthlyDesc: '個人の経費管理',
    destTax: '確定申告用',
    destTaxDesc: '税務申告用シート',
    destBoth: '両方',
    destBothDesc: '管理＆申告',

    // Tax categories
    taxCatTitle: '勘定科目',
    taxSheetBank: '通帳から払ったもの',
    taxSheetOther: '現金・カード・PayPay等',

    // Actions
    actionSave: '保存',
    actionCancel: 'キャンセル',
    actionEdit: '編集',
    actionDelete: '削除',
    actionRetry: 'やり直す',
    actionSaving: '保存中...',
    actionSaved: '保存しました！',

    // Dashboard
    dashTitle: 'ダッシュボード',
    dashTotalSpent: '合計支出',
    dashThisMonth: '今月',
    dashReceiptsScanned: 'スキャン済みレシート',
    dashRecentExpenses: '最近の経費',

    // Settings
    settingsTitle: '設定',
    settingsLanguage: '言語',
    settingsGoogleSheet: 'Googleシート接続',
    settingsConnected: '接続済み',
    settingsNotConnected: '未接続',

    // Messages
    msgSuccess: '経費を保存しました！',
    msgError: 'エラーが発生しました。もう一度お試しください。',
    msgNoReceipt: '画像からレシートを検出できませんでした。',

    // Language
    langEnglish: 'English',
    langJapanese: '日本語',
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

export function t(locale: Locale, key: TranslationKey): string {
  return translations[locale][key] || translations.en[key] || key;
}
