import type { CvData } from '../types/cv';
import type { CvTemplate } from '../api/cvProfileApi';

const PROFICIENCY_LABELS: Record<string, string> = {
  native: 'Native',
  fluent: 'Fluent',
  advanced: 'Advanced',
  intermediate: 'Intermediate',
  basic: 'Basic',
};

/** Falls back to light placeholder copy so the preview never looks broken/empty before the user starts typing. */
function orPlaceholder(value: string, placeholder: string) {
  return value.trim() ? value : placeholder;
}

export function CvPreview({ cv, template }: { cv: CvData; template: CvTemplate }) {
  return (
    <div className="sticky top-4">
      <div className="aspect-[210/297] w-full overflow-hidden rounded-(--radius-md) border border-(--color-line) bg-white shadow-sm">
        <div className="h-full w-full origin-top-left overflow-hidden text-[6.2px] leading-tight text-[#101B2D]">
          {template === 'modern' && <ModernPreview cv={cv} />}
          {template === 'minimal' && <MinimalPreview cv={cv} />}
          {template === 'compact' && <CompactPreview cv={cv} />}
          {template === 'classic' && <ClassicPreview cv={cv} />}
        </div>
      </div>
      <p className="mt-2 text-center text-xs text-(--color-muted)">Live preview — actual PDF may wrap slightly differently</p>
    </div>
  );
}

function SkillsLine({ skills }: { skills: string }) {
  return <p className="whitespace-pre-line">{orPlaceholder(skills, 'Skills you enter will appear here')}</p>;
}

function ClassicPreview({ cv }: { cv: CvData }) {
  return (
    <div className="h-full w-full p-[5%]">
      <h1 className="text-[11px] font-bold" style={{ color: '#101B2D' }}>
        {orPlaceholder(cv.fullName, 'Your Name')}
      </h1>
      <p className="mt-[2px] text-[5.5px]" style={{ color: '#6B6255' }}>
        {[cv.email, cv.phone, cv.location].filter(Boolean).join('  ·  ') || 'email · phone · location'}
      </p>
      <div className="mt-[4px] h-[1px] w-full" style={{ background: '#C87A2E' }} />

      {cv.summary.trim() && (
        <div className="mt-[6px]">
          <h2 className="font-bold" style={{ color: '#1B4B6B' }}>SUMMARY</h2>
          <p className="mt-[1px]">{cv.summary}</p>
        </div>
      )}

      {cv.experience.length > 0 && (
        <div className="mt-[6px]">
          <h2 className="font-bold" style={{ color: '#1B4B6B' }}>EXPERIENCE</h2>
          {cv.experience.map((exp) => (
            <div key={exp.id} className="mt-[2px]">
              <div className="flex justify-between font-semibold">
                <span>{orPlaceholder(exp.role, 'Role')}{exp.employer ? ` — ${exp.employer}` : ''}</span>
                <span style={{ color: '#6B6255' }}>{exp.duration}</span>
              </div>
              {exp.description && <p>{exp.description}</p>}
            </div>
          ))}
        </div>
      )}

      {cv.education.length > 0 && (
        <div className="mt-[6px]">
          <h2 className="font-bold" style={{ color: '#1B4B6B' }}>EDUCATION</h2>
          {cv.education.map((edu) => (
            <div key={edu.id} className="mt-[2px] flex justify-between">
              <span className="font-semibold">{orPlaceholder(edu.degree, 'Degree')}{edu.institution ? ` — ${edu.institution}` : ''}</span>
              <span style={{ color: '#6B6255' }}>{edu.year}</span>
            </div>
          ))}
        </div>
      )}

      {cv.skills.trim() && (
        <div className="mt-[6px]">
          <h2 className="font-bold" style={{ color: '#1B4B6B' }}>SKILLS</h2>
          <SkillsLine skills={cv.skills} />
        </div>
      )}

      {cv.languages.length > 0 && (
        <div className="mt-[6px]">
          <h2 className="font-bold" style={{ color: '#1B4B6B' }}>LANGUAGES</h2>
          {cv.languages.map((l) => (
            <p key={l.id}>{l.name} — {PROFICIENCY_LABELS[l.proficiency]}</p>
          ))}
        </div>
      )}
    </div>
  );
}

function ModernPreview({ cv }: { cv: CvData }) {
  return (
    <div className="flex h-full w-full">
      <div className="w-[32%] p-[4%] text-white" style={{ background: '#12344C' }}>
        <h1 className="text-[9px] font-bold leading-tight">{orPlaceholder(cv.fullName, 'Your Name')}</h1>
        <div className="mt-[6px] h-[1px] w-full" style={{ background: '#C87A2E' }} />
        <p className="mt-[6px] font-bold" style={{ color: '#C87A2E' }}>CONTACT</p>
        {[cv.email, cv.phone, cv.location].filter(Boolean).map((l, i) => <p key={i}>{l}</p>)}
        {cv.skills.trim() && (
          <>
            <p className="mt-[6px] font-bold" style={{ color: '#C87A2E' }}>SKILLS</p>
            <p className="whitespace-pre-line">{cv.skills}</p>
          </>
        )}
        {cv.languages.length > 0 && (
          <>
            <p className="mt-[6px] font-bold" style={{ color: '#C87A2E' }}>LANGUAGES</p>
            {cv.languages.map((l) => <p key={l.id}>{l.name} — {PROFICIENCY_LABELS[l.proficiency]}</p>)}
          </>
        )}
      </div>
      <div className="flex-1 p-[4%]">
        <h2 className="font-bold" style={{ color: '#1B4B6B' }}>PROFILE</h2>
        <div className="mt-[2px] h-[1px] w-full" style={{ background: '#C87A2E' }} />
        {cv.summary.trim() && (
          <div className="mt-[5px]">
            <p className="font-bold" style={{ color: '#1B4B6B' }}>SUMMARY</p>
            <p>{cv.summary}</p>
          </div>
        )}
        {cv.experience.length > 0 && (
          <div className="mt-[5px]">
            <p className="font-bold" style={{ color: '#1B4B6B' }}>WORK EXPERIENCE</p>
            {cv.experience.map((exp) => (
              <div key={exp.id} className="mt-[2px]">
                <div className="flex justify-between font-semibold">
                  <span>{orPlaceholder(exp.role, 'Role')}{exp.employer ? ` — ${exp.employer}` : ''}</span>
                  <span style={{ color: '#6B6255' }}>{exp.duration}</span>
                </div>
                {exp.description && <p>{exp.description}</p>}
              </div>
            ))}
          </div>
        )}
        {cv.education.length > 0 && (
          <div className="mt-[5px]">
            <p className="font-bold" style={{ color: '#1B4B6B' }}>EDUCATION</p>
            {cv.education.map((edu) => (
              <div key={edu.id} className="flex justify-between">
                <span className="font-semibold">{orPlaceholder(edu.degree, 'Degree')}</span>
                <span style={{ color: '#6B6255' }}>{edu.year}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MinimalPreview({ cv }: { cv: CvData }) {
  return (
    <div className="h-full w-full p-[6%] text-center">
      <h1 className="text-[10px]">{orPlaceholder(cv.fullName, 'Your Name')}</h1>
      <p className="mt-[2px]" style={{ color: '#6B6255' }}>
        {[cv.email, cv.phone, cv.location].filter(Boolean).join('   ·   ')}
      </p>
      <div className="mx-auto mt-[5px] h-[1px] w-[30%]" style={{ background: '#1B4B6B' }} />

      <div className="mt-[8px] text-left">
        {cv.summary.trim() && (
          <div className="mt-[4px]">
            <p className="border-b pb-[1px]" style={{ color: '#1B4B6B', borderColor: '#E4DCC8' }}>SUMMARY</p>
            <p className="mt-[2px]">{cv.summary}</p>
          </div>
        )}
        {cv.experience.length > 0 && (
          <div className="mt-[6px]">
            <p className="border-b pb-[1px]" style={{ color: '#1B4B6B', borderColor: '#E4DCC8' }}>EXPERIENCE</p>
            {cv.experience.map((exp) => (
              <div key={exp.id} className="mt-[3px]">
                <div className="flex justify-between font-semibold">
                  <span>{orPlaceholder(exp.role, 'Role')}</span>
                  <span style={{ color: '#6B6255' }}>{exp.duration}</span>
                </div>
                {exp.employer && <p className="italic" style={{ color: '#6B6255' }}>{exp.employer}</p>}
              </div>
            ))}
          </div>
        )}
        {cv.education.length > 0 && (
          <div className="mt-[6px]">
            <p className="border-b pb-[1px]" style={{ color: '#1B4B6B', borderColor: '#E4DCC8' }}>EDUCATION</p>
            {cv.education.map((edu) => (
              <div key={edu.id} className="mt-[2px] flex justify-between font-semibold">
                <span>{orPlaceholder(edu.degree, 'Degree')}</span>
                <span style={{ color: '#6B6255' }}>{edu.year}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CompactPreview({ cv }: { cv: CvData }) {
  return (
    <div className="h-full w-full p-[4%]">
      <h1 className="text-[9px] font-bold">{orPlaceholder(cv.fullName, 'Your Name')}</h1>
      <div className="mt-[3px] h-[1px] w-full" style={{ background: '#C87A2E' }} />
      <div className="mt-[5px] flex gap-[3%]">
        <div className="w-[35%] border-r pr-[3%]" style={{ borderColor: '#E4DCC8' }}>
          <p className="font-bold" style={{ color: '#1B4B6B' }}>CONTACT</p>
          {[cv.email, cv.phone].filter(Boolean).map((l, i) => <p key={i}>{l}</p>)}
          {cv.skills.trim() && (
            <>
              <p className="mt-[4px] font-bold" style={{ color: '#1B4B6B' }}>SKILLS</p>
              <p className="whitespace-pre-line">{cv.skills}</p>
            </>
          )}
          {cv.education.length > 0 && (
            <>
              <p className="mt-[4px] font-bold" style={{ color: '#1B4B6B' }}>EDUCATION</p>
              {cv.education.map((edu) => (
                <p key={edu.id} className="font-semibold">{orPlaceholder(edu.degree, 'Degree')}</p>
              ))}
            </>
          )}
        </div>
        <div className="flex-1">
          {cv.summary.trim() && (
            <>
              <p className="font-bold" style={{ color: '#1B4B6B' }}>SUMMARY</p>
              <p className="mt-[1px]">{cv.summary}</p>
            </>
          )}
          {cv.experience.length > 0 && (
            <div className="mt-[4px]">
              <p className="font-bold" style={{ color: '#1B4B6B' }}>EXPERIENCE</p>
              {cv.experience.map((exp) => (
                <div key={exp.id} className="mt-[2px]">
                  <p className="font-semibold">{orPlaceholder(exp.role, 'Role')}</p>
                  {exp.employer && <p className="italic" style={{ color: '#6B6255' }}>{exp.employer}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
