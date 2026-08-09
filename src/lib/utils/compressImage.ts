/**
 * Compresses an image file in the browser before upload, to keep Supabase
 * Storage usage down. Downscales oversized photos (phone camera scans of
 * documents are routinely 4000px+ on a side, far more than needed for a
 * readable document) and re-encodes as JPEG at a reasonable quality.
 *
 * PDFs are NOT compressed here — real PDF compression means re-encoding
 * embedded images inside the PDF stream, which needs a real PDF library
 * (pdf-lib, ghostscript, etc.), not a canvas trick. That's a reasonable
 * follow-up if PDF uploads turn out to dominate storage usage, but out of
 * scope for a lightweight client-side pass. See CHANGES.md.
 *
 * Falls back to the original file if compression fails, isn't worth it
 * (result would be bigger), or the file isn't a compressible image type.
 */

const COMPRESSIBLE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_DIMENSION = 2000; // px, on the longer side — plenty for a readable document scan
const JPEG_QUALITY = 0.82;
// Below this, compression usually isn't worth the quality trade-off.
const SKIP_IF_SMALLER_THAN_BYTES = 300 * 1024;

export async function compressImageIfWorthwhile(file: File): Promise<File> {
  if (!COMPRESSIBLE_TYPES.has(file.type)) return file;
  if (file.size < SKIP_IF_SMALLER_THAN_BYTES) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const targetWidth = Math.round(bitmap.width * scale);
    const targetHeight = Math.round(bitmap.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;

    // Flatten onto white first — JPEG has no alpha channel, and without
    // this transparent PNG backgrounds would turn black.
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
    ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
    bitmap.close();

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), 'image/jpeg', JPEG_QUALITY)
    );
    if (!blob || blob.size >= file.size) return file;

    const newName = file.name.replace(/\.(png|jpe?g|webp)$/i, '') + '.jpg';
    return new File([blob], newName, { type: 'image/jpeg', lastModified: Date.now() });
  } catch {
    // Any failure (unsupported format, decode error, etc.) — just upload the original.
    return file;
  }
}
