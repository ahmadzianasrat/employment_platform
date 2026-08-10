import type { CoverLetterData } from '../types/coverLetter';
import type { CoverLetterTemplate } from '../api/coverLetterProfileApi';

function orPlaceholder(value: string, placeholder: string) {
  return value.trim() ? value : placeholder;
}

export function CoverLetterPreview({ letter, template }: { letter: CoverLetterData; template: CoverLetterTemplate }) {
  const salutation = letter.recipientName ? `Dear ${letter.recipientName},` : 'Dear Hiring Manager,';
  const body = [letter.opening, letter.motivation, letter.closing].filter((p) => p.trim());

  return (
    <div className="sticky top-4">
      <div className="aspect-[210/297] w-full overflow-hidden rounded-(--radius-md) border border-(--color-line) bg-white shadow-sm">
        <div className="h-full w-full text-[6.2px] leading-relaxed text-[#101B2D]">
          {template === 'modern' ? (
            <div>
              <div className="p-[5%] text-white" style={{ background: '#1B4B6B' }}>
                <p className="text-[10px] font-bold">{orPlaceholder(letter.fullName, 'Your Name')}</p>
                <p className="mt-[2px]">{[letter.email, letter.phone, letter.address].filter(Boolean).join('   ·   ')}</p>
                {letter.jobTitle && (
                  <p className="mt-[2px]" style={{ color: '#FFDCB4' }}>Application for: {letter.jobTitle}</p>
                )}
              </div>
              <div className="p-[5%]">
                {letter.date && <p style={{ color: '#646464' }}>{letter.date}</p>}
                {[letter.recipientName, letter.recipientTitle, letter.organizationName, letter.organizationAddress]
                  .filter(Boolean)
                  .map((l, i) => <p key={i} className="mt-[1px]">{l}</p>)}
                <div className="mt-[6px] h-[1px] w-full" style={{ background: '#C87A2E' }} />
                <p className="mt-[6px] font-bold">{salutation}</p>
                <div className="mt-[4px] space-y-[4px]">
                  {body.length > 0 ? body.map((p, i) => <p key={i}>{p}</p>) : <p style={{ color: '#9a9a9a' }}>Your letter content will appear here.</p>}
                </div>
                <p className="mt-[6px]">{letter.signOff || 'Sincerely,'}</p>
                <p className="mt-[8px] font-bold" style={{ color: '#1B4B6B' }}>{orPlaceholder(letter.fullName, 'Your Name')}</p>
              </div>
            </div>
          ) : (
            <div className="p-[6%]">
              <p className="text-[9px] font-bold">{orPlaceholder(letter.fullName, 'Your Name')}</p>
              {[letter.address, [letter.email, letter.phone].filter(Boolean).join('  ·  ')].filter(Boolean).map((l, i) => (
                <p key={i} style={{ color: '#646464' }}>{l}</p>
              ))}
              {letter.date && <p className="mt-[6px]">{letter.date}</p>}
              <div className="mt-[6px]">
                {[letter.recipientName, letter.recipientTitle, letter.organizationName, letter.organizationAddress]
                  .filter(Boolean)
                  .map((l, i) => <p key={i}>{l}</p>)}
              </div>
              <p className="mt-[8px]">{salutation}</p>
              <div className="mt-[6px] space-y-[4px]">
                {body.length > 0 ? body.map((p, i) => <p key={i}>{p}</p>) : <p style={{ color: '#9a9a9a' }}>Your letter content will appear here.</p>}
              </div>
              <p className="mt-[8px]">{letter.signOff || 'Sincerely,'}</p>
              <p className="mt-[10px] font-bold">{orPlaceholder(letter.fullName, 'Your Name')}</p>
            </div>
          )}
        </div>
      </div>
      <p className="mt-2 text-center text-xs text-(--color-muted)">Live preview — actual PDF may wrap slightly differently</p>
    </div>
  );
}
