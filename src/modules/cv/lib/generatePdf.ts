import { jsPDF } from 'jspdf';
import type { CvData } from '../types/cv';
import type { CvTemplate } from '../api/cvProfileApi';

const MARGIN = 18;
const PAGE_WIDTH = 210; // A4 mm
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

function addWrappedText(doc: jsPDF, text: string, x: number, y: number, maxWidth: number, lineHeight = 5.2): number {
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
}

export function generateCvPdf(cv: CvData, template: CvTemplate = 'classic'): void {
  if (template === 'modern') {
    generateModernTemplate(cv);
  } else {
    generateClassicTemplate(cv);
  }
}

function generateClassicTemplate(cv: CvData): void {
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

// "Modern" template: a colored left sidebar for contact/skills/languages,
// main column for summary/experience/education. Visually distinct from
// the classic single-column template rather than a re-skin of it.
function generateModernTemplate(cv: CvData): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const PAGE_HEIGHT = 297;
  const SIDEBAR_WIDTH = 62;
  const SIDEBAR_PAD = 10;
  const MAIN_X = SIDEBAR_WIDTH + 14;
  const MAIN_WIDTH = PAGE_WIDTH - MAIN_X - MARGIN;

  const LAPIS: [number, number, number] = [27, 75, 107];
  const LAPIS_DARK: [number, number, number] = [18, 52, 76];
  const SAFFRON: [number, number, number] = [200, 122, 46];
  const INK: [number, number, number] = [16, 27, 45];
  const MUTED: [number, number, number] = [90, 90, 90];

  function drawSidebar() {
    doc.setFillColor(...LAPIS_DARK);
    doc.rect(0, 0, SIDEBAR_WIDTH, PAGE_HEIGHT, 'F');
  }

  drawSidebar();

  let sy = 20;
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  const nameLines = doc.splitTextToSize(cv.fullName || 'Your Name', SIDEBAR_WIDTH - SIDEBAR_PAD * 2);
  doc.text(nameLines, SIDEBAR_PAD, sy);
  sy += nameLines.length * 6.5 + 6;

  doc.setDrawColor(...SAFFRON);
  doc.setLineWidth(0.6);
  doc.line(SIDEBAR_PAD, sy, SIDEBAR_WIDTH - SIDEBAR_PAD, sy);
  sy += 8;

  function sidebarHeading(label: string) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...SAFFRON);
    doc.text(label.toUpperCase(), SIDEBAR_PAD, sy);
    sy += 5.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(235, 240, 245);
  }

  const contactLines = [cv.email, cv.phone, cv.location, cv.address].filter(Boolean);
  if (contactLines.length) {
    sidebarHeading('Contact');
    for (const line of contactLines) {
      const wrapped = doc.splitTextToSize(line, SIDEBAR_WIDTH - SIDEBAR_PAD * 2);
      doc.text(wrapped, SIDEBAR_PAD, sy);
      sy += wrapped.length * 4.6;
    }
    sy += 6;
  }

  if (cv.skills.trim()) {
    sidebarHeading('Skills');
    const wrapped = doc.splitTextToSize(cv.skills, SIDEBAR_WIDTH - SIDEBAR_PAD * 2);
    doc.text(wrapped, SIDEBAR_PAD, sy);
    sy += wrapped.length * 4.6 + 6;
  }

  if (cv.languages.length) {
    sidebarHeading('Languages');
    const proficiencyLabels: Record<string, string> = {
      native: 'Native',
      fluent: 'Fluent',
      advanced: 'Advanced',
      intermediate: 'Intermediate',
      basic: 'Basic',
    };
    for (const lang of cv.languages) {
      if (!lang.name.trim()) continue;
      const isNative = lang.proficiency === 'native';
      doc.setFont('helvetica', isNative ? 'bold' : 'normal');
      if (isNative) doc.setTextColor(...SAFFRON);
      else doc.setTextColor(235, 240, 245);
      const label = `${lang.name}${isNative ? ' ★' : ''} — ${proficiencyLabels[lang.proficiency]}`;
      const wrapped = doc.splitTextToSize(label, SIDEBAR_WIDTH - SIDEBAR_PAD * 2);
      doc.text(wrapped, SIDEBAR_PAD, sy);
      sy += wrapped.length * 4.6;
    }
  }

  // Main column
  let y = MARGIN;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...LAPIS);
  doc.text('Profile', MAIN_X, y);
  y += 3;
  doc.setDrawColor(...SAFFRON);
  doc.setLineWidth(0.6);
  doc.line(MAIN_X, y, PAGE_WIDTH - MARGIN, y);
  y += 8;

  function sectionHeading(label: string) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...LAPIS);
    doc.text(label.toUpperCase(), MAIN_X, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    doc.setTextColor(...INK);
  }

  function ensureSpace(needed: number) {
    if (y + needed > PAGE_HEIGHT - MARGIN) {
      doc.addPage();
      drawSidebar();
      y = MARGIN;
    }
  }

  if (cv.summary.trim()) {
    ensureSpace(20);
    sectionHeading('Summary');
    y = addWrappedText(doc, cv.summary, MAIN_X, y, MAIN_WIDTH);
    y += 6;
  }

  if (cv.experience.length) {
    ensureSpace(20);
    sectionHeading('Work Experience');
    for (const exp of cv.experience) {
      ensureSpace(20);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...INK);
      doc.text(`${exp.role || 'Role'}${exp.employer ? ' — ' + exp.employer : ''}`, MAIN_X, y);
      if (exp.duration) {
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...MUTED);
        doc.text(exp.duration, PAGE_WIDTH - MARGIN, y, { align: 'right' });
      }
      y += 5.5;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...INK);
      if (exp.description) {
        y = addWrappedText(doc, exp.description, MAIN_X, y, MAIN_WIDTH);
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
      doc.setTextColor(...INK);
      doc.text(`${edu.degree || 'Degree'}${edu.institution ? ' — ' + edu.institution : ''}`, MAIN_X, y);
      if (edu.year) {
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...MUTED);
        doc.text(edu.year, PAGE_WIDTH - MARGIN, y, { align: 'right' });
      }
      y += 6;
    }
  }

  const fileName = (cv.fullName || 'cv').trim().replace(/\s+/g, '_').toLowerCase();
  doc.save(`${fileName}_cv_modern.pdf`);
}
