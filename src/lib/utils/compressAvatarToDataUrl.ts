/**
 * Turns an uploaded photo File into a small, center-cropped square JPEG
 * data URL, suitable for embedding directly inside CvData.photoDataUrl
 * (see cv.ts) — both for the React preview's <img src> and for jsPDF's
 * addImage(), which also accepts data URLs directly.
 *
 * Deliberately much smaller/more aggressive than compressImageIfWorthwhile
 * (used for document-vault scans, which need to stay readable at a larger
 * size) — a CV photo only ever renders at a few centimeters, so there's no
 * reason to keep it above ~240px, and every extra KB here bloats the
 * cv_profiles.data jsonb row on every autosave.
 */

const OUTPUT_SIZE = 240; // px, square
const JPEG_QUALITY = 0.85;

export async function compressAvatarToDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  try {
    // Center-crop to a square first, so the output isn't stretched/squashed
    // for non-square source photos.
    const side = Math.min(bitmap.width, bitmap.height);
    const sx = (bitmap.width - side) / 2;
    const sy = (bitmap.height - side) / 2;

    const canvas = document.createElement('canvas');
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not supported');

    // Flatten onto white first — JPEG has no alpha channel.
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
    ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

    return canvas.toDataURL('image/jpeg', JPEG_QUALITY);
  } finally {
    bitmap.close();
  }
}
