import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET() {
  try {
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

    if (!email || !key || !spreadsheetId) {
      return NextResponse.json({ error: 'Google Sheets not configured' }, { status: 500 });
    }

    const auth = new google.auth.JWT({ email, key, scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'] });
    const sheets = google.sheets({ version: 'v4', auth });

    const res = await sheets.spreadsheets.get({ spreadsheetId });
    const tabs = res.data.sheets?.map(s => s.properties?.title || '') || [];

    return NextResponse.json({ connected: true, tabs, title: res.data.properties?.title });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
