// Default "No DP" SVG Data URI shown when a user has not uploaded a profile photo
export const NO_DP_AVATAR =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#1E293B"/>
      <stop offset="100%" stop-color="#0F172A"/>
    </linearGradient>
    <linearGradient id="iconGrad" x1="60" y1="40" x2="140" y2="160" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#64748B"/>
      <stop offset="100%" stop-color="#475569"/>
    </linearGradient>
  </defs>
  <rect width="200" height="200" rx="100" fill="url(#bgGrad)"/>
  <circle cx="100" cy="74" r="32" fill="url(#iconGrad)"/>
  <path d="M44 166C44 135.5 69.1 114 100 114C130.9 114 156 135.5 156 166" fill="url(#iconGrad)"/>
  <rect x="52" y="148" width="96" height="24" rx="12" fill="#0F172A" fill-opacity="0.82"/>
  <text x="100" y="164" text-anchor="middle" fill="#94A3B8" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="700" letter-spacing="1.5">NO DP</text>
</svg>
`.trim());

const LEGACY_DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80';

/**
 * Checks whether the user has a custom profile photo set.
 */
export function hasCustomAvatar(avatar?: string | null): boolean {
  if (!avatar) return false;
  const trimmed = avatar.trim();
  if (!trimmed || trimmed === LEGACY_DEFAULT_AVATAR) return false;
  return true;
}

/**
 * Returns the user's profile photo URL or the default "No DP" image if none is set.
 */
export function getAvatarUrl(avatar?: string | null): string {
  return hasCustomAvatar(avatar) ? avatar!.trim() : NO_DP_AVATAR;
}

export interface ResizedImageResult {
  base64DataUrl: string;
  width: number;
  height: number;
  originalSizeKB: number;
  compressedSizeKB: number;
}

/**
 * Reduces the resolution and file size of an image file in the React frontend
 * using an HTML5 Canvas before sending it to the backend for ImgBB upload.
 */
export function resizeImageForUpload(
  file: File,
  maxDimension: number = 360,
  quality: number = 0.8
): Promise<ResizedImageResult> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Please select a valid image file (JPG, PNG, WEBP).'));
      return;
    }

    const originalSizeKB = Math.max(1, Math.round(file.size / 1024));
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Failed to read the selected image file.'));
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) {
        reject(new Error('Empty image file.'));
        return;
      }

      const img = new Image();
      img.onerror = () => reject(new Error('Failed to decode the selected image.'));
      img.onload = () => {
        let targetWidth = img.width;
        let targetHeight = img.height;

        // Scale down proportionally so neither width nor height exceeds maxDimension
        if (targetWidth > maxDimension || targetHeight > maxDimension) {
          if (targetWidth >= targetHeight) {
            targetHeight = Math.round((targetHeight * maxDimension) / targetWidth);
            targetWidth = maxDimension;
          } else {
            targetWidth = Math.round((targetWidth * maxDimension) / targetHeight);
            targetHeight = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Browser canvas context is unavailable.'));
          return;
        }

        // Fill white background in case of transparent PNGs converted to JPEG
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, targetWidth, targetHeight);
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        const base64DataUrl = canvas.toDataURL('image/jpeg', quality);
        const base64Length = base64DataUrl.split(',')[1]?.length || 0;
        const compressedBytes = Math.ceil((base64Length * 3) / 4);
        const compressedSizeKB = Math.max(1, Math.round(compressedBytes / 1024));

        resolve({
          base64DataUrl,
          width: targetWidth,
          height: targetHeight,
          originalSizeKB,
          compressedSizeKB,
        });
      };

      img.src = dataUrl;
    };

    reader.readAsDataURL(file);
  });
}
