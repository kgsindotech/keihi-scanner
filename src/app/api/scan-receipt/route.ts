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

    const prompt = `You are an expert Japanese receipt/bill reader for expense tracking. Analyze this receipt image carefully.

IMPORTANT: The image may be ROTATED (sideways, upside down). Read the text regardless of orientation. Japanese receipts are often vertical text (縦書き) — handle this correctly.

READING RULES:
- DATE: Look for patterns like 2026年03月09日, 2026/03/09, or era dates (令和7年 = 2025, stamps like 25.1.28 = 2025-01-28, 07-03-14 = 2025-03-14). The date is usually near the top of the receipt.
- AMOUNT: Find the TOTAL (合計, 領収金額, 請求金額, 金額). Use the BIGGEST number including tax. Look for ¥ symbol.
- VENDOR: Read the FULL store/company name. It is usually the LARGEST text on the receipt, or printed at the bottom with address. Include (株) or other suffixes. Example: "SHトレーディング(株) ケバブハウス" not just "SH".
- TAX CATEGORY (勘定科目): Choose the BEST match:
  通信費 = phone/internet, 消耗品費 = supplies, 外注費 = outsourcing, 接待交際費 = meals/entertainment with clients, 地代家賃 = rent, 保険料 = insurance, 広告宣伝費 = advertising, 修繕費 = repairs, 新聞図書費 = books, 研修費 = training, 旅費交通費 = transport/travel, 水道光熱費 = utilities, 振込手数料 = bank fees, その他経費 = other
  HINT: If the receipt is from a restaurant/food shop → 接待交際費 (if business) or 消耗品費 (if personal supplies). If it says ケバブ, レストラン, 食堂, カフェ → likely 接待交際費.
- PAYMENT: Detect from receipt: 現金 (cash), PayPay, クレジットカード (credit card), 銀行振込 (bank), ICカード (IC card). If receipt says 現金 or shows cash payment → 現金.
- TAX SHEET: "bank" = bank transfer/invoice, "other" = cash/card/PayPay/IC card

CRITICAL: ALL text fields MUST be in JAPANESE. This goes to a Japanese tax filing spreadsheet.

Respond ONLY with valid JSON, no markdown:
{
  "date": "YYYY-MM-DD",
  "amount": 1234,
  "vendor": "完全な店名（日本語）",
  "category": "カテゴリ（日本語）",
  "taxCategory": "勘定科目（上記リストから選択）",
  "notes": "購入内容の説明（日本語）",
  "notesEn": "Same description in English",
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
