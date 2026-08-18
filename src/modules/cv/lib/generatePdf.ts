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

const AVATAR_PALETTE: [number, number, number][] = [
  [27, 75, 107], // lapis
  [200, 122, 46], // saffron
  [60, 122, 92], // success green
  [18, 52, 76], // lapis dark
  [168, 58, 58], // danger red
];

function avatarInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase();
}

function avatarColor(name: string): [number, number, number] {
  const seed = Array.from(name).reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return AVATAR_PALETTE[seed % AVATAR_PALETTE.length];
}

/**
 * Draws the CV photo (if any) clipped to a circle at (centerX, centerY)
 * with the given diameter; falls back to a filled circle with initials
 * — matching CvPreview.tsx's Avatar component — when there's no photo,
 * rather than leaving a blank gap. Wrapped in try/catch: a malformed
 * image data URL should never block the whole PDF from generating, just
 * silently fall back to the initials circle.
 */
function drawAvatar(doc: jsPDF, cv: CvData, centerX: number, centerY: number, diameter: number): void {
  const r = diameter / 2;
  if (cv.photoDataUrl) {
    try {
      doc.saveGraphicsState();
      doc.circle(centerX, centerY, r, null);
      doc.clip();
      doc.discardPath();
      doc.addImage(cv.photoDataUrl, 'JPEG', centerX - r, centerY - r, diameter, diameter);
      doc.restoreGraphicsState();
      return;
    } catch {
      // fall through to initials circle below
    }
  }
  const name = cv.fullName || '?';
  doc.setFillColor(...avatarColor(name));
  doc.circle(centerX, centerY, r, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(diameter * 0.9);
  doc.setTextColor(255, 255, 255);
  doc.text(avatarInitials(name), centerX, centerY, { align: 'center', baseline: 'middle' });
}

export function generateCvPdf(cv: CvData, template: CvTemplate = 'classic'): void {
  if (template === 'modern') {
    generateModernTemplate(cv);
  } else if (template === 'minimal') {
    generateMinimalTemplate(cv);
  } else if (template === 'compact') {
    generateCompactTemplate(cv);
  } else if (template === 'sidebar') {
    generateSidebarTemplate(cv);
  } else {
    generateClassicTemplate(cv);
  }
}

function generateClassicTemplate(cv: CvData): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  let y = MARGIN;

  drawAvatar(doc, cv, PAGE_WIDTH - MARGIN - 9, MARGIN + 5, 18);

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

  let sy = 16;
  drawAvatar(doc, cv, SIDEBAR_WIDTH / 2, sy, 22);
  sy += 17;

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

// "Minimal" template: centered header, generous whitespace, thin rules,
// understated — for people who want the content to speak for itself
// rather than a colored layout.
function generateMinimalTemplate(cv: CvData): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const LAPIS: [number, number, number] = [27, 75, 107];
  const INK: [number, number, number] = [16, 27, 45];
  const MUTED: [number, number, number] = [110, 110, 110];
  const PAGE_HEIGHT = 297;

  let y = 20;
  drawAvatar(doc, cv, PAGE_WIDTH / 2, y, 20);
  y += 16;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(20);
  doc.setTextColor(...INK);
  doc.text(cv.fullName || 'Your Name', PAGE_WIDTH / 2, y, { align: 'center' });
  y += 7;

  const contactLine = [cv.email, cv.phone, cv.location].filter(Boolean).join('   ·   ');
  if (contactLine) {
    doc.setFontSize(9.5);
    doc.setTextColor(...MUTED);
    doc.text(contactLine, PAGE_WIDTH / 2, y, { align: 'center' });
    y += 6;
  }

  doc.setDrawColor(...LAPIS);
  doc.setLineWidth(0.3);
  doc.line(PAGE_WIDTH / 2 - 20, y, PAGE_WIDTH / 2 + 20, y);
  y += 10;

  function sectionHeading(label: string) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...LAPIS);
    doc.text(label.toUpperCase(), MARGIN, y);
    y += 1.5;
    doc.setDrawColor(230, 226, 216);
    doc.setLineWidth(0.2);
    doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
    y += 6;
    doc.setFontSize(10);
    doc.setTextColor(...INK);
  }

  function ensureSpace(needed: number) {
    if (y + needed > PAGE_HEIGHT - MARGIN) {
      doc.addPage();
      y = MARGIN;
    }
  }

  if (cv.summary.trim()) {
    ensureSpace(20);
    sectionHeading('Summary');
    y = addWrappedText(doc, cv.summary, MARGIN, y, CONTENT_WIDTH, 5.5);
    y += 8;
  }

  if (cv.experience.length) {
    ensureSpace(16);
    sectionHeading('Experience');
    for (const exp of cv.experience) {
      ensureSpace(18);
      doc.setFont('helvetica', 'bold');
      doc.text(exp.role || 'Role', MARGIN, y);
      if (exp.duration) {
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...MUTED);
        doc.text(exp.duration, PAGE_WIDTH - MARGIN, y, { align: 'right' });
        doc.setTextColor(...INK);
      }
      y += 5;
      if (exp.employer) {
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(...MUTED);
        doc.text(exp.employer, MARGIN, y);
        doc.setTextColor(...INK);
        y += 5;
      }
      doc.setFont('helvetica', 'normal');
      if (exp.description) y = addWrappedText(doc, exp.description, MARGIN, y, CONTENT_WIDTH, 5);
      y += 6;
    }
  }

  if (cv.education.length) {
    ensureSpace(16);
    sectionHeading('Education');
    for (const edu of cv.education) {
      ensureSpace(10);
      doc.setFont('helvetica', 'bold');
      doc.text(edu.degree || 'Degree', MARGIN, y);
      if (edu.year) {
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...MUTED);
        doc.text(edu.year, PAGE_WIDTH - MARGIN, y, { align: 'right' });
        doc.setTextColor(...INK);
      }
      y += 5;
      if (edu.institution) {
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(...MUTED);
        doc.text(edu.institution, MARGIN, y);
        doc.setTextColor(...INK);
        y += 5;
      }
      y += 3;
    }
  }

  if (cv.skills.trim()) {
    ensureSpace(14);
    sectionHeading('Skills');
    doc.setFont('helvetica', 'normal');
    y = addWrappedText(doc, cv.skills, MARGIN, y, CONTENT_WIDTH, 5);
    y += 8;
  }

  if (cv.languages.length) {
    ensureSpace(14);
    sectionHeading('Languages');
    const proficiencyLabels: Record<string, string> = {
      native: 'Native', fluent: 'Fluent', advanced: 'Advanced', intermediate: 'Intermediate', basic: 'Basic',
    };
    const line = cv.languages
      .filter((l) => l.name.trim())
      .map((l) => `${l.name} (${proficiencyLabels[l.proficiency]})`)
      .join('   ·   ');
    y = addWrappedText(doc, line, MARGIN, y, CONTENT_WIDTH, 5.5);
  }

  const fileName = (cv.fullName || 'cv').trim().replace(/\s+/g, '_').toLowerCase();
  doc.save(`${fileName}_cv_minimal.pdf`);
}

// "Compact" template: dense two-column layout without a colored block —
// a thin divider line instead of a filled sidebar, smaller type, tighter
// spacing. For people with a lot of content who want it on fewer pages.
function generateCompactTemplate(cv: CvData): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const PAGE_HEIGHT = 297;
  const LAPIS: [number, number, number] = [27, 75, 107];
  const INK: [number, number, number] = [16, 27, 45];
  const MUTED: [number, number, number] = [100, 100, 100];
  const SAFFRON: [number, number, number] = [200, 122, 46];

  const LEFT_WIDTH = 55;
  const RIGHT_X = MARGIN + LEFT_WIDTH + 8;
  const RIGHT_WIDTH = PAGE_WIDTH - RIGHT_X - MARGIN;

  drawAvatar(doc, cv, PAGE_WIDTH - MARGIN - 7, MARGIN + 3, 14);

  let y = MARGIN;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(...INK);
  doc.text(cv.fullName || 'Your Name', MARGIN, y);
  y += 6;
  doc.setDrawColor(...SAFFRON);
  doc.setLineWidth(0.6);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 6;

  const topY = y;
  let leftY = y;
  let rightY = y;

  function leftHeading(label: string) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...LAPIS);
    doc.text(label.toUpperCase(), MARGIN, leftY);
    leftY += 4.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...INK);
  }

  function rightHeading(label: string) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...LAPIS);
    doc.text(label.toUpperCase(), RIGHT_X, rightY);
    rightY += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...INK);
  }

  // Left column: contact, skills, languages, education
  const contactLines = [cv.email, cv.phone, cv.location, cv.address].filter(Boolean);
  if (contactLines.length) {
    leftHeading('Contact');
    for (const line of contactLines) {
      const wrapped = doc.splitTextToSize(line, LEFT_WIDTH);
      doc.text(wrapped, MARGIN, leftY);
      leftY += wrapped.length * 4;
    }
    leftY += 4;
  }

  if (cv.skills.trim()) {
    leftHeading('Skills');
    const wrapped = doc.splitTextToSize(cv.skills, LEFT_WIDTH);
    doc.text(wrapped, MARGIN, leftY);
    leftY += wrapped.length * 4 + 4;
  }

  if (cv.languages.length) {
    leftHeading('Languages');
    const proficiencyLabels: Record<string, string> = {
      native: 'Native', fluent: 'Fluent', advanced: 'Advanced', intermediate: 'Intermediate', basic: 'Basic',
    };
    for (const lang of cv.languages) {
      if (!lang.name.trim()) continue;
      doc.text(`${lang.name} — ${proficiencyLabels[lang.proficiency]}`, MARGIN, leftY);
      leftY += 4;
    }
    leftY += 4;
  }

  if (cv.education.length) {
    leftHeading('Education');
    for (const edu of cv.education) {
      doc.setFont('helvetica', 'bold');
      const degWrapped = doc.splitTextToSize(edu.degree || 'Degree', LEFT_WIDTH);
      doc.text(degWrapped, MARGIN, leftY);
      leftY += degWrapped.length * 4;
      doc.setFont('helvetica', 'normal');
      if (edu.institution) {
        const instWrapped = doc.splitTextToSize(edu.institution, LEFT_WIDTH);
        doc.setTextColor(...MUTED);
        doc.text(instWrapped, MARGIN, leftY);
        doc.setTextColor(...INK);
        leftY += instWrapped.length * 4;
      }
      if (edu.year) {
        doc.setTextColor(...MUTED);
        doc.text(edu.year, MARGIN, leftY);
        doc.setTextColor(...INK);
        leftY += 4;
      }
      leftY += 3;
    }
  }

  // Right column: summary, experience
  if (cv.summary.trim()) {
    rightHeading('Summary');
    rightY = addWrappedText(doc, cv.summary, RIGHT_X, rightY, RIGHT_WIDTH, 4.6);
    rightY += 5;
  }

  if (cv.experience.length) {
    rightHeading('Experience');
    for (const exp of cv.experience) {
      if (rightY > PAGE_HEIGHT - MARGIN - 15) {
        doc.addPage();
        rightY = MARGIN;
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.text(exp.role || 'Role', RIGHT_X, rightY);
      if (exp.duration) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...MUTED);
        doc.text(exp.duration, PAGE_WIDTH - MARGIN, rightY, { align: 'right' });
        doc.setTextColor(...INK);
      }
      rightY += 4.5;
      if (exp.employer) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(...MUTED);
        doc.text(exp.employer, RIGHT_X, rightY);
        doc.setTextColor(...INK);
        rightY += 4.5;
      }
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      if (exp.description) rightY = addWrappedText(doc, exp.description, RIGHT_X, rightY, RIGHT_WIDTH, 4.4);
      rightY += 5;
    }
  }

  // Vertical divider between columns
  const columnBottom = Math.max(leftY, rightY, topY + 10);
  doc.setDrawColor(230, 226, 216);
  doc.setLineWidth(0.2);
  doc.line(MARGIN + LEFT_WIDTH + 3, topY - 2, MARGIN + LEFT_WIDTH + 3, Math.min(columnBottom, PAGE_HEIGHT - MARGIN));

  const fileName = (cv.fullName || 'cv').trim().replace(/\s+/g, '_').toLowerCase();
  doc.save(`${fileName}_cv_compact.pdf`);
}

// "Sidebar" template: the flagship, most visual design — a full-height
// lapis-blue sidebar with a larger centered photo, closer to the
// sidebar-with-photo style of premium resume builders, built from our own
// brand palette/layout rather than copying any specific one. Mirrors
// SidebarPreview in CvPreview.tsx.
function generateSidebarTemplate(cv: CvData): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const PAGE_HEIGHT = 297;
  const SIDEBAR_WIDTH = 74;
  const SIDEBAR_PAD = 10;
  const MAIN_X = SIDEBAR_WIDTH + 14;
  const MAIN_WIDTH = PAGE_WIDTH - MAIN_X - MARGIN;

  const LAPIS: [number, number, number] = [27, 75, 107];
  const SAFFRON: [number, number, number] = [200, 122, 46];
  const SAFFRON_LIGHT: [number, number, number] = [228, 162, 92];
  const INK: [number, number, number] = [16, 27, 45];
  const MUTED: [number, number, number] = [90, 90, 90];

  function drawSidebar() {
    doc.setFillColor(...LAPIS);
    doc.rect(0, 0, SIDEBAR_WIDTH, PAGE_HEIGHT, 'F');
  }
  drawSidebar();

  let sy = 24;
  drawAvatar(doc, cv, SIDEBAR_WIDTH / 2, sy, 34);
  sy += 24;

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  const nameLines = doc.splitTextToSize(cv.fullName || 'Your Name', SIDEBAR_WIDTH - SIDEBAR_PAD * 2);
  doc.text(nameLines, SIDEBAR_WIDTH / 2, sy, { align: 'center' });
  sy += nameLines.length * 5.5 + 5;

  doc.setDrawColor(...SAFFRON_LIGHT);
  doc.setLineWidth(0.5);
  doc.line(SIDEBAR_WIDTH / 2 - 14, sy, SIDEBAR_WIDTH / 2 + 14, sy);
  sy += 8;

  function sidebarHeading(label: string) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...SAFFRON_LIGHT);
    doc.text(label.toUpperCase(), SIDEBAR_PAD, sy);
    sy += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
  }

  const contactLines = [cv.email, cv.phone, cv.location, cv.address].filter(Boolean);
  if (contactLines.length) {
    sidebarHeading('Contact');
    for (const line of contactLines) {
      const wrapped = doc.splitTextToSize(line, SIDEBAR_WIDTH - SIDEBAR_PAD * 2);
      doc.text(wrapped, SIDEBAR_PAD, sy);
      sy += wrapped.length * 4.4;
    }
    sy += 5;
  }

  if (cv.skills.trim()) {
    sidebarHeading('Skills');
    const wrapped = doc.splitTextToSize(cv.skills, SIDEBAR_WIDTH - SIDEBAR_PAD * 2);
    doc.text(wrapped, SIDEBAR_PAD, sy);
    sy += wrapped.length * 4.4 + 5;
  }

  if (cv.languages.length) {
    sidebarHeading('Languages');
    const proficiencyLabels: Record<string, string> = {
      native: 'Native', fluent: 'Fluent', advanced: 'Advanced', intermediate: 'Intermediate', basic: 'Basic',
    };
    for (const lang of cv.languages) {
      if (!lang.name.trim()) continue;
      const label = `${lang.name} — ${proficiencyLabels[lang.proficiency]}`;
      const wrapped = doc.splitTextToSize(label, SIDEBAR_WIDTH - SIDEBAR_PAD * 2);
      doc.text(wrapped, SIDEBAR_PAD, sy);
      sy += wrapped.length * 4.4;
    }
  }

  // Main column
  let y = MARGIN;

  function sectionHeading(label: string) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...SAFFRON);
    doc.text(label.toUpperCase(), MAIN_X, y);
    y += 2;
    doc.setDrawColor(...SAFFRON);
    doc.setLineWidth(0.5);
    doc.line(MAIN_X, y, MAIN_X + 22, y);
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
    sectionHeading('Profile Summary');
    y = addWrappedText(doc, cv.summary, MAIN_X, y, MAIN_WIDTH);
    y += 6;
  }

  if (cv.experience.length) {
    ensureSpace(20);
    sectionHeading('Experience');
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
  doc.save(`${fileName}_cv_sidebar.pdf`);
}
