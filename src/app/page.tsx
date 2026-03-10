'use client';

import { useState, useRef } from 'react';
import { useApp } from '@/lib/store';
import { t } from '@/lib/i18n';
import { ReviewForm } from '@/components/ReviewForm';
import type { ReceiptData } from '@/lib/store';

export default function ScanPage() {
  const { locale } = useApp();
  const [image, setImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setFileName(file.name);
    setError(null);
    setReceiptData(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleScan = async () => {
    if (!image) return;
    setProcessing(true);
    setError(null);

    try {
      const res = await fetch('/api/scan-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image, locale }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Scan failed');
      }

      const data: ReceiptData = await res.json();
      setReceiptData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t(locale, 'msgError'));
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = () => {
    setImage(null);
    setFileName('');
    setReceiptData(null);
    setError(null);
  };

  return (
    <div className="px-4 pt-6">
      <h1 className="text-2xl font-bold mb-1">{t(locale, 'scanTitle')}</h1>
      <p className="text-gray-500 text-sm mb-6">{t(locale, 'scanUpload')}</p>

      {!receiptData ? (
        <>
          {/* Upload Area */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              image ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
            }`}
          >
            {image ? (
              <div className="space-y-3">
                <img src={image} alt="Receipt" className="max-h-64 mx-auto rounded-lg shadow" />
                <p className="text-sm text-gray-500">{fileName}</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-5xl">📸</div>
                <p className="text-gray-500">{t(locale, 'scanDragDrop')}</p>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />

          {/* Camera & File buttons */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={(e) => { e.stopPropagation(); cameraInputRef.current?.click(); }}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium transition-colors"
            >
              📷 {t(locale, 'scanTakePhoto')}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium transition-colors"
            >
              📁 {t(locale, 'scanChooseFile')}
            </button>
          </div>

          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />

          {/* Scan Button */}
          {image && (
            <button
              onClick={handleScan}
              disabled={processing}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-4 rounded-xl font-semibold text-lg transition-colors"
            >
              {processing ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span>
                  {t(locale, 'scanProcessing')}
                </span>
              ) : (
                `🔍 ${locale === 'ja' ? 'スキャンする' : 'Scan Receipt'}`
              )}
            </button>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}
        </>
      ) : (
        <ReviewForm
          receiptData={receiptData}
          receiptImage={image!}
          onReset={handleReset}
        />
      )}
    </div>
  );
}
