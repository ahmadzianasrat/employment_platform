import { PDFDocument } from 'pdf-lib';
import { getSignedUrl } from '../api/documentsApi';
import { downloadFile } from '../../../lib/utils/downloadFile';
import type { DocumentEntry } from '../types/document';

/**
 * Converts a WEBP (or any non-JPEG/PNG) image blob to PNG via canvas —
 * pdf-lib can only embed JPEG or PNG images, not WEBP.
 */
async function toEmbeddablePng(blob: Blob): Promise<ArrayBuffer> {
  const bitmap = await createImageBitmap(blob);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  const pngBlob: Blob = await new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('PNG conversion failed'))), 'image/png')
  );
  return pngBlob.arrayBuffer();
}

export interface MergeProgress {
  current: number;
  total: number;
  currentFileName: string;
}

/**
 * Merges every file across the given document entries into one PDF and
 * triggers a download. PDFs are merged page-by-page; images become their
 * own page, scaled to fit A4. Files that fail to merge (corrupt PDF,
 * unreadable image) are skipped rather than aborting the whole merge —
 * reported back via the returned `skipped` list so the caller can tell
 * the user which ones didn't make it in.
 */
export async function mergeAndDownloadDocuments(
  entries: DocumentEntry[],
  onProgress?: (progress: MergeProgress) => void
): Promise<{ skipped: string[] }> {
  const files = entries.flatMap((entry) => entry.files.map((f) => ({ entry, file: f })));
  const merged = await PDFDocument.create();
  const skipped: string[] = [];

  const A4_WIDTH = 595.28;
  const A4_HEIGHT = 841.89;

  for (let i = 0; i < files.length; i++) {
    const { file } = files[i];
    onProgress?.({ current: i + 1, total: files.length, currentFileName: file.original_filename });

    try {
      const url = await getSignedUrl(file.storage_path);
      if (!url) throw new Error('Could not get file URL');
      const response = await fetch(url);
      const blob = await response.blob();

      if (file.mime_type === 'application/pdf') {
        const bytes = await blob.arrayBuffer();
        const sourceDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
        const pages = await merged.copyPages(sourceDoc, sourceDoc.getPageIndices());
        for (const page of pages) merged.addPage(page);
      } else {
        let embedded;
        if (file.mime_type === 'image/jpeg') {
          embedded = await merged.embedJpg(await blob.arrayBuffer());
        } else if (file.mime_type === 'image/png') {
          embedded = await merged.embedPng(await blob.arrayBuffer());
        } else {
          // webp or anything else pdf-lib can't embed directly
          embedded = await merged.embedPng(await toEmbeddablePng(blob));
        }

        const page = merged.addPage([A4_WIDTH, A4_HEIGHT]);
        const scale = Math.min((A4_WIDTH - 40) / embedded.width, (A4_HEIGHT - 40) / embedded.height, 1);
        const w = embedded.width * scale;
        const h = embedded.height * scale;
        page.drawImage(embedded, {
          x: (A4_WIDTH - w) / 2,
          y: (A4_HEIGHT - h) / 2,
          width: w,
          height: h,
        });
      }
    } catch {
      skipped.push(file.original_filename);
    }
  }

  if (merged.getPageCount() === 0) {
    throw new Error('No files could be merged.');
  }

  const bytes = await merged.save();
  const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
  const objectUrl = URL.createObjectURL(blob);
  await downloadFile(objectUrl, 'my_documents_merged.pdf');
  URL.revokeObjectURL(objectUrl);

  return { skipped };
}
