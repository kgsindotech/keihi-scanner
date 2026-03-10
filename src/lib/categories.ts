// Tax categories (勘定科目) matching your 経費集計表 Excel
export const taxCategories = [
  { ja: '通信費', en: 'Phone / Internet / Postal (Communication)' },
  { ja: '消耗品費', en: 'Supplies / Equipment under ¥100k' },
  { ja: '外注費', en: 'Outsourcing / Freelancer fees' },
  { ja: '接待交際費', en: 'Client meals / Entertainment' },
  { ja: '地代家賃', en: 'Office rent / Parking rent' },
  { ja: '保険料', en: 'Business insurance' },
  { ja: '広告宣伝費', en: 'Advertising / Website / Business cards' },
  { ja: '修繕費', en: 'Repairs / Maintenance' },
  { ja: '新聞図書費', en: 'Books / Subscriptions' },
  { ja: '研修費', en: 'Training / Seminars' },
  { ja: '旅費交通費', en: 'Transport / Travel expenses' },
  { ja: '水道光熱費', en: 'Water / Electricity / Gas (Utilities)' },
  { ja: '振込手数料', en: 'Bank transfer fees' },
  { ja: 'その他経費', en: 'Other business expenses' },
] as const;

// Personal expense categories (for monthly tracker)
export const personalCategories = [
  'Food',
  'Transport',
  'Groceries',
  'Entertainment',
  'Bills',
  'Miscellaneous',
] as const;

// Payment methods
export const paymentMethods = [
  { ja: '現金', en: 'Cash' },
  { ja: 'PayPay', en: 'PayPay' },
  { ja: 'クレジットカード', en: 'Credit Card' },
  { ja: '銀行振込', en: 'Bank Transfer' },
  { ja: 'ICカード', en: 'IC Card (Suica/PASMO)' },
] as const;

// Tax sheet types
export type TaxSheetType = 'bank' | 'other';
export type Destination = 'monthly' | 'tax' | 'both';
