import { google } from 'googleapis';

function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!email || !key) {
    throw new Error('Google Sheets credentials not configured');
  }

  return new google.auth.JWT({
    email,
    key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

function getSheets() {
  return google.sheets({ version: 'v4', auth: getAuth() });
}

function getSpreadsheetId() {
  const id = process.env.GOOGLE_SHEETS_ID;
  if (!id) throw new Error('GOOGLE_SHEETS_ID not configured');
  return id;
}

// Append a row to a specific sheet tab
export async function appendRow(sheetName: string, values: (string | number)[]) {
  const sheets = getSheets();
  const spreadsheetId = getSpreadsheetId();

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `'${sheetName}'!A:Z`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [values],
    },
  });
}

// Get all tab names
async function getTabNames(): Promise<string[]> {
  const sheets = getSheets();
  const spreadsheetId = getSpreadsheetId();
  const res = await sheets.spreadsheets.get({ spreadsheetId });
  return res.data.sheets?.map(s => s.properties?.title || '') || [];
}

// Ensure a sheet tab exists, create if not
export async function ensureSheet(sheetName: string, headers?: string[]) {
  const sheets = getSheets();
  const spreadsheetId = getSpreadsheetId();
  const existing = await getTabNames();

  if (!existing.includes(sheetName)) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{
          addSheet: { properties: { title: sheetName } }
        }]
      }
    });

    if (headers) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `'${sheetName}'!A1`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [headers],
        },
      });
    }
  }
}

// Find the correct monthly tab for a given date
// Your tabs are named like "2026-02-15 ~ 03-14" (15th to 14th cycle)
function findMonthlyTab(tabs: string[], expenseDate: string): string | null {
  const date = new Date(expenseDate);

  for (const tab of tabs) {
    // Match pattern like "2025-03-15 ~ 04-14" or "2026-02-15 ~ 03-14"
    const match = tab.match(/^(\d{4})-(\d{2})-(\d{2})\s*~\s*(\d{2})-(\d{2})$/);
    if (!match) continue;

    const startYear = parseInt(match[1]);
    const startMonth = parseInt(match[2]) - 1;
    const startDay = parseInt(match[3]);
    const endMonth = parseInt(match[4]) - 1;
    const endDay = parseInt(match[5]);

    const start = new Date(startYear, startMonth, startDay);
    // End month: if endMonth < startMonth, it's next year
    const endYear = endMonth < startMonth ? startYear + 1 : startYear;
    const end = new Date(endYear, endMonth, endDay, 23, 59, 59);

    if (date >= start && date <= end) {
      return tab;
    }
  }
  return null;
}

// Initialize tax sheets if they don't exist
export async function initTaxSheets() {
  await ensureSheet('Tax: Bank (通帳)', [
    '発生日', '勘定科目', '金額', '備考', '取引先', 'Source'
  ]);
  await ensureSheet('Tax: Other (その他)', [
    '発生日', '勘定科目', '金額', '備考', '取引先', 'Source'
  ]);
}

// Write expense to the appropriate sheet(s)
export async function saveExpenseToSheets(expense: {
  date: string;
  amount: number;
  vendor: string;
  category: string;
  taxCategory: string;
  notes: string;
  paymentMethod: string;
  destination: 'monthly' | 'tax' | 'both';
  taxSheetType: 'bank' | 'other';
}) {
  // Ensure tax sheets exist
  await initTaxSheets();

  const promises: Promise<void>[] = [];

  // Save to monthly tracker tab (date-range based tabs)
  // Your sheet columns: Period, Accounts, Category, Subcategory, Note, JPY, Income/Expense, Description
  if (expense.destination === 'monthly' || expense.destination === 'both') {
    const tabs = await getTabNames();
    const monthlyTab = findMonthlyTab(tabs, expense.date);

    if (monthlyTab) {
      promises.push(
        appendRow(monthlyTab, [
          expense.date,              // Period (date)
          expense.paymentMethod,     // Accounts (Cash/PayPay/Card etc)
          expense.taxCategory,       // Category (勘定科目)
          expense.category,          // Subcategory
          expense.vendor,            // Note
          expense.amount,            // JPY
          'Expense',                 // Income/Expense
          expense.notes + ' [Keihi Scanner]', // Description
        ])
      );
    } else {
      // Create new monthly tab if none exists for this date
      const d = new Date(expense.date);
      const day = d.getDate();
      let startMonth, startYear;
      if (day >= 15) {
        startMonth = d.getMonth();
        startYear = d.getFullYear();
      } else {
        startMonth = d.getMonth() - 1;
        startYear = d.getFullYear();
        if (startMonth < 0) { startMonth = 11; startYear--; }
      }
      const endMonth = startMonth + 1;
      const endYear = endMonth > 11 ? startYear + 1 : startYear;
      const tabName = `${startYear}-${String(startMonth + 1).padStart(2, '0')}-15 ~ ${String((endMonth % 12) + 1).padStart(2, '0')}-14`;

      await ensureSheet(tabName, [
        'Period', 'Accounts', 'Category', 'Subcategory', 'Note', 'JPY', 'Income/Expense', 'Description'
      ]);

      promises.push(
        appendRow(tabName, [
          expense.date,
          expense.paymentMethod,
          expense.taxCategory,
          expense.category,
          expense.vendor,
          expense.amount,
          'Expense',
          expense.notes + ' [Keihi Scanner]',
        ])
      );
    }
  }

  // Save to tax sheet
  if (expense.destination === 'tax' || expense.destination === 'both') {
    const taxSheet = expense.taxSheetType === 'bank'
      ? 'Tax: Bank (通帳)'
      : 'Tax: Other (その他)';

    promises.push(
      appendRow(taxSheet, [
        expense.date,
        expense.taxCategory,
        expense.amount,
        expense.notes,
        expense.vendor,
        'Keihi Scanner',
      ])
    );
  }

  await Promise.all(promises);
}
