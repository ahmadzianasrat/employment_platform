import { jsPDF } from 'jspdf';
import type { CvData } from '../types/cv';

const MARGIN = 18;
const PAGE_WIDTH = 210; // A4 mm
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

function addWrappedText(doc: jsPDF, text: string, x: number, y: number, maxWidth: number, lineHeight = 5.2): number {
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
}

export function generateCvPdf(cv: CvData): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  let y = MARGIN;

  // Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(16, 27, 45); // ink
  doc.text(cv.fullName || 'Your Name', MARGIN, y);
  y += 8;

  // Contact line
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(90, 90, 90);
  const contactParts = [cv.email, cv.phone, cv.location, cv.address].filter(Boolean);
  if (contactParts.length) {
    doc.text(contactParts.join('   •   '), MARGIN, y);
    y += 8;
  } else {
    y += 4;
  }

  doc.setDrawColor(200, 122, 46); // saffron
  doc.setLineWidth(0.6);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 8;

  function sectionHeading(label: string) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(27, 75, 107); // lapis
    doc.text(label.toUpperCase(), MARGIN, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    doc.setTextColor(16, 27, 45);
  }

  function ensureSpace(needed: number) {
    if (y + needed > 297 - MARGIN) {
      doc.addPage();
      y = MARGIN;
    }
  }

  if (cv.summary.trim()) {
    ensureSpace(20);
    sectionHeading('Summary');
    y = addWrappedText(doc, cv.summary, MARGIN, y, CONTENT_WIDTH);
    y += 6;
  }

  if (cv.experience.length) {
    ensureSpace(20);
    sectionHeading('Work Experience');
    for (const exp of cv.experience) {
      ensureSpace(20);
      doc.setFont('helvetica', 'bold');
      doc.text(`${exp.role || 'Role'}${exp.employer ? ' — ' + exp.employer : ''}`, MARGIN, y);
      doc.setFont('helvetica', 'normal');
      if (exp.duration) {
        doc.setTextColor(90, 90, 90);
        doc.text(exp.duration, PAGE_WIDTH - MARGIN, y, { align: 'right' });
        doc.setTextColor(16, 27, 45);
      }
      y += 5.5;
      if (exp.description) {
        y = addWrappedText(doc, exp.description, MARGIN, y, CONTENT_WIDTH);
      }
      y += 4;
    }
    y += 2;
  }

  if (cv.education.length) {
    ensureSpace(20);
    sectionHeading('Education');
    for (const edu of cv.education) {
      ensureSpace(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`${edu.degree || 'Degree'}${edu.institution ? ' — ' + edu.institution : ''}`, MARGIN, y);
      doc.setFont('helvetica', 'normal');
      if (edu.year) {
        doc.setTextColor(90, 90, 90);
        doc.text(edu.year, PAGE_WIDTH - MARGIN, y, { align: 'right' });
        doc.setTextColor(16, 27, 45);
      }
      y += 6;
    }
    y += 2;
  }

  if (cv.skills.trim()) {
    ensureSpace(16);
    sectionHeading('Skills');
    y = addWrappedText(doc, cv.skills, MARGIN, y, CONTENT_WIDTH);
    y += 6;
  }

  if (cv.languages.length) {
    ensureSpace(16);
    sectionHeading('Languages');
    const proficiencyLabels: Record<string, string> = {
      native: 'Native',
      fluent: 'Fluent',
      advanced: 'Advanced',
      intermediate: 'Intermediate',
      basic: 'Basic',
    };
    for (const lang of cv.languages) {
      if (!lang.name.trim()) continue;
      ensureSpace(8);
      const isNative = lang.proficiency === 'native';
      doc.setFont('helvetica', isNative ? 'bold' : 'normal');
      const label = `${lang.name}${isNative ? ' ★' : ''} — ${proficiencyLabels[lang.proficiency]}`;
      if (isNative) doc.setTextColor(200, 122, 46); // saffron for native language
      doc.text(label, MARGIN, y);
      doc.setTextColor(16, 27, 45);
      doc.setFont('helvetica', 'normal');
      y += 5.5;
    }
  }

  const fileName = (cv.fullName || 'cv').trim().replace(/\s+/g, '_').toLowerCase();
  doc.save(`${fileName}_cv.pdf`);
}
