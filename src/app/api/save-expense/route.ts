import { NextRequest, NextResponse } from 'next/server';
import { saveExpenseToSheets } from '@/lib/google-sheets';

export async function POST(req: NextRequest) {
  try {
    const expense = await req.json();

    // Validate required fields
    if (!expense.date || !expense.amount || !expense.vendor) {
      return NextResponse.json(
        { error: 'Missing required fields: date, amount, vendor' },
        { status: 400 }
      );
    }

    // Check Google Sheets config
    if (!process.env.GOOGLE_SHEETS_ID || !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      return NextResponse.json(
        { error: 'Google Sheets not configured. Add credentials to .env.local' },
        { status: 500 }
      );
    }

    await saveExpenseToSheets(expense);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Save error:', error);
    const message = error instanceof Error ? error.message : 'Failed to save';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
