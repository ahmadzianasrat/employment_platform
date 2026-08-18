import { jsPDF } from 'jspdf';
import type { CoverLetterData } from '../types/coverLetter';
import type { CoverLetterTemplate } from '../api/coverLetterProfileApi';

const MARGIN = 22;
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

function addWrappedText(doc: jsPDF, text: string, x: number, y: number, maxWidth: number, lineHeight = 5.8): number {
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim());
  let cursorY = y;
  for (const para of paragraphs) {
    const lines = doc.splitTextToSize(para.trim(), maxWidth);
    doc.text(lines, x, cursorY);
    cursorY += lines.length * lineHeight + lineHeight * 0.6; // paragraph gap
  }
  return cursorY;
}

export function generateCoverLetterPdf(letter: CoverLetterData, template: CoverLetterTemplate = 'formal'): void {
  if (template === 'modern') {
    generateModernLetter(letter);
  } else if (template === 'banner') {
    generateBannerLetter(letter);
  } else {
    generateFormalLetter(letter);
  }
}

function generateFormalLetter(letter: CoverLetterData): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const INK: [number, number, number] = [16, 27, 45];
  const MUTED: [number, number, number] = [100, 100, 100];

  let y = MARGIN;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...INK);
  doc.text(letter.fullName || 'Your Name', MARGIN, y);
  y += 5.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...MUTED);
  const contactLines = [letter.address, [letter.email, letter.phone].filter(Boolean).join('  ·  ')].filter(Boolean);
  for (const line of contactLines) {
    doc.text(line, MARGIN, y);
    y += 4.6;
  }

  y += 6;
  doc.setTextColor(...INK);
  if (letter.date) {
    doc.text(letter.date, MARGIN, y);
    y += 8;
  }

  const recipientLines = [
    letter.recipientName,
    letter.recipientTitle,
    letter.organizationName,
    letter.organizationAddress,
  ].filter(Boolean);
  for (const line of recipientLines) {
    doc.text(line, MARGIN, y);
    y += 4.6;
  }
  y += 8;

  const salutation = letter.recipientName ? `Dear ${letter.recipientName},` : 'Dear Hiring Manager,';
  doc.text(salutation, MARGIN, y);
  y += 9;

  doc.setFontSize(10.5);
  const body = [letter.opening, letter.motivation, letter.closing].filter((p) => p.trim()).join('\n\n');
  y = addWrappedText(doc, body || 'Your letter content will appear here.', MARGIN, y, CONTENT_WIDTH);

  y += 4;
  doc.text(letter.signOff || 'Sincerely,', MARGIN, y);
  y += 12;
  doc.setFont('helvetica', 'bold');
  doc.text(letter.fullName || 'Your Name', MARGIN, y);

  const fileName = (letter.fullName || 'cover_letter').trim().replace(/\s+/g, '_').toLowerCase();
  doc.save(`${fileName}_cover_letter.pdf`);
}

function generateModernLetter(letter: CoverLetterData): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const LAPIS: [number, number, number] = [27, 75, 107];
  const INK: [number, number, number] = [16, 27, 45];
  const MUTED: [number, number, number] = [100, 100, 100];
  const SAFFRON: [number, number, number] = [200, 122, 46];

  // Header band
  doc.setFillColor(...LAPIS);
  doc.rect(0, 0, PAGE_WIDTH, 34, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(letter.fullName || 'Your Name', MARGIN, 16);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  const headerContact = [letter.email, letter.phone, letter.address].filter(Boolean).join('   ·   ');
  doc.text(headerContact, MARGIN, 24);
  if (letter.jobTitle) {
    doc.setFontSize(10);
    doc.setTextColor(255, 220, 180);
    doc.text(`Application for: ${letter.jobTitle}`, MARGIN, 30.5);
  }

  let y = 46;
  doc.setTextColor(...MUTED);
  doc.setFontSize(9.5);
  if (letter.date) {
    doc.text(letter.date, MARGIN, y);
    y += 7;
  }

  doc.setTextColor(...INK);
  const recipientLines = [
    letter.recipientName,
    letter.recipientTitle,
    letter.organizationName,
    letter.organizationAddress,
  ].filter(Boolean);
  for (const line of recipientLines) {
    doc.text(line, MARGIN, y);
    y += 4.6;
  }
  y += 6;

  doc.setDrawColor(...SAFFRON);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 8;

  const salutation = letter.recipientName ? `Dear ${letter.recipientName},` : 'Dear Hiring Manager,';
  doc.setFont('helvetica', 'bold');
  doc.text(salutation, MARGIN, y);
  y += 9;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  const body = [letter.opening, letter.motivation, letter.closing].filter((p) => p.trim()).join('\n\n');
  y = addWrappedText(doc, body || 'Your letter content will appear here.', MARGIN, y, CONTENT_WIDTH);

  y += 4;
  doc.text(letter.signOff || 'Sincerely,', MARGIN, y);
  y += 12;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...LAPIS);
  doc.text(letter.fullName || 'Your Name', MARGIN, y);

  // Footer accent
  doc.setFillColor(...SAFFRON);
  doc.rect(0, PAGE_HEIGHT - 4, PAGE_WIDTH, 4, 'F');

  const fileName = (letter.fullName || 'cover_letter').trim().replace(/\s+/g, '_').toLowerCase();
  doc.save(`${fileName}_cover_letter_modern.pdf`);
}

// "Banner" template: a centered lapis banner announcing the applicant's
// name (and the job applied for), a saffron accent stripe under it, then
// a clean single-column letter body with the recipient block on the left
// and sender/date on the right — visually distinct from "modern" (which
// keeps the whole contact block inside the colored header). Mirrors the
// `template === 'banner'` branch in CoverLetterPreview.tsx.
function generateBannerLetter(letter: CoverLetterData): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const LAPIS: [number, number, number] = [27, 75, 107];
  const INK: [number, number, number] = [16, 27, 45];
  const MUTED: [number, number, number] = [100, 100, 100];
  const SAFFRON: [number, number, number] = [200, 122, 46];

  const BANNER_HEIGHT = letter.jobTitle ? 32 : 26;
  doc.setFillColor(...LAPIS);
  doc.rect(0, 0, PAGE_WIDTH, BANNER_HEIGHT, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(letter.fullName || 'Your Name', PAGE_WIDTH / 2, BANNER_HEIGHT / 2 - (letter.jobTitle ? 3 : 0), {
    align: 'center',
  });
  if (letter.jobTitle) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(255, 220, 180);
    doc.text(`Application for ${letter.jobTitle}`, PAGE_WIDTH / 2, BANNER_HEIGHT / 2 + 6, { align: 'center' });
  }

  doc.setFillColor(...SAFFRON);
  doc.rect(0, BANNER_HEIGHT, PAGE_WIDTH, 2, 'F');

  let y = BANNER_HEIGHT + 16;

  // Recipient block (left) and sender/date (right), side by side.
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...INK);
  const recipientLines = [
    letter.recipientName,
    letter.recipientTitle,
    letter.organizationName,
    letter.organizationAddress,
  ].filter(Boolean);
  let recipientY = y;
  for (const line of recipientLines) {
    doc.text(line, MARGIN, recipientY);
    recipientY += 4.6;
  }

  doc.setTextColor(...MUTED);
  let senderY = y;
  const senderLines = [letter.date, letter.email, letter.phone].filter(Boolean);
  for (const line of senderLines) {
    doc.text(line, PAGE_WIDTH - MARGIN, senderY, { align: 'right' });
    senderY += 4.6;
  }
  doc.setTextColor(...INK);

  y = Math.max(recipientY, senderY) + 6;

  const salutation = letter.recipientName ? `Dear ${letter.recipientName},` : 'Dear Hiring Manager,';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text(salutation, MARGIN, y);
  y += 9;

  doc.setFont('helvetica', 'normal');
  const body = [letter.opening, letter.motivation, letter.closing].filter((p) => p.trim()).join('\n\n');
  y = addWrappedText(doc, body || 'Your letter content will appear here.', MARGIN, y, CONTENT_WIDTH);

  y += 4;
  doc.text(letter.signOff || 'Sincerely,', MARGIN, y);
  y += 12;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...LAPIS);
  doc.text(letter.fullName || 'Your Name', MARGIN, y);

  const fileName = (letter.fullName || 'cover_letter').trim().replace(/\s+/g, '_').toLowerCase();
  doc.save(`${fileName}_cover_letter_banner.pdf`);
}
