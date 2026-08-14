import { PDFDocument } from 'pdf-lib';

/**
 * Re-saves a PDF with object-stream compression enabled before upload.
 *
 * This is honest about its limits: pdf-lib can compress the PDF's
 * internal structure (deduplicate objects, compress cross-reference
 * streams, strip redundant metadata) but it does NOT re-encode embedded
 * images at a lower quality — that would need decoding and re-compressing
 * each embedded image stream, which pdf-lib doesn't expose a
 * straightforward API for on arbitrary existing PDFs. So this shrinks
 * text-heavy or metadata-heavy PDFs noticeably, but a scanned photo saved
 * as a PDF won't shrink much beyond what its embedded JPEG already is.
 *
 * Falls back to the original file if compression fails, or if the result
 * isn't actually smaller.
 */
export async function compressPdfIfWorthwhile(file: File): Promise<File> {
  if (file.type !== 'application/pdf') return file;

  try {
    const bytes = await file.arrayBuffer();
    const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true, updateMetadata: false });
    const compressed = await pdf.save({ useObjectStreams: true });

    if (compressed.byteLength >= bytes.byteLength) return file;

    return new File([compressed as BlobPart], file.name, { type: 'application/pdf', lastModified: Date.now() });
  } catch {
    // Encrypted, malformed, or otherwise unparseable PDF — upload the original rather than fail the upload.
    return file;
  }
}
