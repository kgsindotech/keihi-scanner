'use client';

import { useState, useRef } from 'react';
import { useApp } from '@/lib/store';
import { t } from '@/lib/i18n';
import { ReviewForm } from '@/components/ReviewForm';
import { CameraIcon, FolderIcon, UploadIcon, SearchIcon, SpinnerIcon, AlertIcon } from '@/components/Icons';
import { compressImage, getBase64SizeKB } from '@/lib/image-utils';
import type { ReceiptData } from '@/lib/store';

export default function ScanPage() {
  const { locale } = useApp();
  const [image, setImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [imageSize, setImageSize] = useState<string>('');
  const [offline, setOffline] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setFileName(file.name);
    setError(null);
    setReceiptData(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      const originalKB = getBase64SizeKB(base64);

      // Compress if larger than 500KB
      if (originalKB > 500) {
        const compressed = await compressImage(base64);
        const compressedKB = getBase64SizeKB(compressed);
        setImageSize(`${Math.round(originalKB / 1024 * 10) / 10}MB → ${compressedKB}KB`);
        setImage(compressed);
      } else {
        setImageSize(`${originalKB}KB`);
        setImage(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleScan = async () => {
    if (!image) return;

    // Check online status
    if (!navigator.onLine) {
      setOffline(true);
      return;
    }
    setOffline(false);
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
      if (!navigator.onLine) {
        setOffline(true);
      } else {
        setError(err instanceof Error ? err.message : t(locale, 'msgError'));
      }
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
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
          {t(locale, 'scanTitle')}
        </h1>
        <p className="text-gray-400 text-sm mt-1">{t(locale, 'scanUpload')}</p>
      </div>

      {!receiptData ? (
        <div className="animate-fade-in-up">
          {/* Upload Area */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all overflow-hidden ${
              dragOver
                ? 'border-blue-500 bg-blue-50 scale-[1.02]'
                : image
                ? 'border-blue-400 bg-gradient-to-b from-blue-50/50 to-white'
                : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/30'
            }`}
          >
            {image ? (
              <div className="space-y-3 animate-scale-in">
                <img src={image} alt="Receipt" className="max-h-56 mx-auto rounded-xl shadow-lg" />
                <p className="text-xs text-gray-400 truncate max-w-[200px] mx-auto">
                  {fileName} {imageSize && <span className="text-green-500">({imageSize})</span>}
                </p>
              </div>
            ) : (
              <div className="space-y-4 py-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-100 to-violet-100 flex items-center justify-center">
                  <UploadIcon size={28} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-gray-600 font-medium">{t(locale, 'scanDragDrop')}</p>
                  <p className="text-gray-400 text-xs mt-1">JPG, PNG, WEBP</p>
                </div>
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
              className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 py-3.5 px-4 rounded-xl font-medium border border-gray-200 shadow-sm active:scale-[0.98]"
            >
              <CameraIcon size={18} />
              <span>{t(locale, 'scanTakePhoto')}</span>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 py-3.5 px-4 rounded-xl font-medium border border-gray-200 shadow-sm active:scale-[0.98]"
            >
              <FolderIcon size={18} />
              <span>{t(locale, 'scanChooseFile')}</span>
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
              className={`w-full mt-4 text-white py-4 rounded-xl font-semibold text-lg shadow-lg active:scale-[0.98] ${
                processing
                  ? 'bg-blue-400 animate-pulse-glow'
                  : 'bg-gradient-primary hover:shadow-xl'
              }`}
            >
              {processing ? (
                <span className="flex items-center justify-center gap-3">
                  <SpinnerIcon size={22} />
                  {t(locale, 'scanProcessing')}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <SearchIcon size={20} />
                  {locale === 'ja' ? 'スキャンする' : 'Scan Receipt'}
                </span>
              )}
            </button>
          )}

          {/* Offline Warning */}
          {offline && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl animate-fade-in-up">
              <div className="flex items-center gap-2 text-amber-700">
                <AlertIcon size={18} />
                <span className="text-sm font-medium">
                  {locale === 'ja' ? 'インターネット接続がありません' : 'No internet connection'}
                </span>
              </div>
              <p className="text-xs text-amber-600 mt-1 ml-6">
                {locale === 'ja' ? '接続を確認してからもう一度お試しください' : 'Check your connection and try again'}
              </p>
            </div>
          )}

          {/* Error with Retry */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl animate-fade-in-up">
              <p className="text-red-600 text-sm">{error}</p>
              <button
                onClick={handleScan}
                className="mt-2 text-xs font-semibold text-red-700 bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded-lg transition-colors"
              >
                {t(locale, 'actionRetry')}
              </button>
            </div>
          )}
        </div>
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
