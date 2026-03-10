import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { image, locale } = await req.json();

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your-api-key-here') {
      return NextResponse.json({ error: 'API key not configured. Add your key to .env.local' }, { status: 500 });
    }

    // Extract base64 data and media type from data URL
    const matches = image.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!matches) {
      return NextResponse.json({ error: 'Invalid image format' }, { status: 400 });
    }

    const mediaType = matches[1] as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
    const base64Data = matches[2];

    const prompt = `You are a Japanese receipt/bill reader for expense tracking. Analyze this receipt image and extract the following information.

IMPORTANT RULES:
- For dates: Convert Japanese era dates (令和7年 = 2025, stamps like 25.1.28 = 2025-01-28, 07-03-14 = 2025-03-14)
- For amounts: Extract the TOTAL amount (合計, 領収金額, 請求金額, 金額). Always use the biggest/final number including tax.
- For vendor: Extract the store/company name EXACTLY as printed on the receipt (keep Japanese names in Japanese)
- For tax category (勘定科目): Choose the BEST match from this list:
  通信費, 消耗品費, 外注費, 接待交際費, 地代家賃, 保険料, 広告宣伝費, 修繕費, 新聞図書費, 研修費, 旅費交通費, 水道光熱費, 振込手数料, その他経費
- For payment method: Use JAPANESE names only: 現金, PayPay, クレジットカード, 銀行振込, ICカード
- For tax sheet type: "bank" if it's a bank transfer/invoice, "other" if paid by cash/card/PayPay/IC card
- Confidence: 0-100 based on how clearly you could read the receipt

CRITICAL: ALL fields (vendor, category, notes, paymentMethod) MUST be in JAPANESE. This data goes directly into a Japanese tax filing spreadsheet. Even if the user interface is in English, the extracted data must always be Japanese.

Respond ONLY with valid JSON, no markdown, no explanation:
{
  "date": "YYYY-MM-DD",
  "amount": 1234,
  "vendor": "店名（日本語で）",
  "category": "カテゴリ（日本語で）",
  "taxCategory": "勘定科目（日本語で）",
  "notes": "購入内容の簡単な説明（日本語で）",
  "notesEn": "Same description in English for UI display",
  "paymentMethod": "現金/PayPay/クレジットカード/銀行振込/ICカード",
  "taxSheetType": "bank or other",
  "confidence": 85
}`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64Data,
              },
            },
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
    });

    // Extract the text response
    const textBlock = response.content.find(block => block.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      return NextResponse.json({ error: 'No response from AI' }, { status: 500 });
    }

    // Parse the JSON response
    const parsed = JSON.parse(textBlock.text);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Scan error:', error);

    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'AI returned invalid data. Please retry.' }, { status: 500 });
    }

    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
