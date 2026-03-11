// Compress image before sending to API
// Receipts don't need high resolution — 1200px wide is plenty for text reading
export function compressImage(dataUrl: string, maxWidth = 1200, quality = 0.8): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');

      let { width, height } = img;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to JPEG (smaller than PNG for photos)
      const compressed = canvas.toDataURL('image/jpeg', quality);
      resolve(compressed);
    };
    img.onerror = () => {
      // If compression fails, return original
      resolve(dataUrl);
    };
    img.src = dataUrl;
  });
}

// Get approximate size of base64 data URL in KB
export function getBase64SizeKB(dataUrl: string): number {
  const base64 = dataUrl.split(',')[1] || dataUrl;
  return Math.round((base64.length * 3) / 4 / 1024);
}
