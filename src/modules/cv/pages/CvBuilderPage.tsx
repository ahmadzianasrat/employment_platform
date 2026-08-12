import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../../../lib/i18n/LanguageContext';
import { useAuth } from '../../../lib/auth/AuthContext';
import { generateCvPdf } from '../lib/generatePdf';
import { trackEvent } from '../../../lib/analytics/ga';
import { loadCvProfile, saveCvProfile } from '../api/cvProfileApi';
import type { CvTemplate } from '../api/cvProfileApi';
import { btnPrimary, btnDashed, btnDangerOutlineSm } from '../../../components/ui/buttonStyles';
import { IconDownload, IconPlus, IconTrash, IconCheck } from '../../../components/ui/icons';
import { CvPreview } from '../components/CvPreview';
import {
  EMPTY_CV,
  type CvData,
  type CvEducationEntry,
  type CvExperienceEntry,
  type CvLanguageEntry,
  type LanguageProficiency,
} from '../types/cv';

const PROFICIENCY_LEVELS: { value: LanguageProficiency; labelKey: string }[] = [
  { value: 'native', labelKey: 'proficiencyNative' },
  { value: 'fluent', labelKey: 'proficiencyFluent' },
  { value: 'advanced', labelKey: 'proficiencyAdvanced' },
  { value: 'intermediate', labelKey: 'proficiencyIntermediate' },
  { value: 'basic', labelKey: 'proficiencyBasic' },
];

const TEMPLATE_OPTIONS: { value: CvTemplate; labelKey: string; descKey: string }[] = [
  { value: 'classic', labelKey: 'templateClassic', descKey: 'templateClassicDesc' },
  { value: 'modern', labelKey: 'templateModern', descKey: 'templateModernDesc' },
  { value: 'minimal', labelKey: 'templateMinimal', descKey: 'templateMinimalDesc' },
  { value: 'compact', labelKey: 'templateCompact', descKey: 'templateCompactDesc' },
];

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

const inputClass =
  'w-full rounded-(--radius-md) border border-(--color-line) bg-(--color-paper-raised) px-3 py-2 text-sm outline-none focus:border-(--color-lapis)';
const labelClass = 'mb-1 block text-sm font-medium text-(--color-ink)';

export function CvBuilderPage() {
  const { tr } = useLanguage();
  const { user } = useAuth();
  const [cv, setCv] = useState<CvData>(EMPTY_CV);
  const [template, setTemplate] = useState<CvTemplate>('classic');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const loadedRef = useRef(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load any previously-saved CV once we know who's signed in.
  useEffect(() => {
    if (!user) {
      loadedRef.current = true;
      return;
    }
    loadedRef.current = false;
    loadCvProfile(user.id).then((profile) => {
      if (profile) {
        setCv(profile.data);
        setTemplate(profile.template);
      }
      loadedRef.current = true;
    });
  }, [user]);

  // Autosave, debounced — skips the load that just happened above so we
  // don't immediately re-save the data we just fetched.
  useEffect(() => {
    if (!user || !loadedRef.current) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    setSaveStatus('saving');
    saveTimeoutRef.current = setTimeout(() => {
      saveCvProfile(user.id, { data: cv, template }).then(() => setSaveStatus('saved'));
    }, 1200);
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cv, template, user]);

  function updateField<K extends keyof CvData>(key: K, value: CvData[K]) {
    setCv((prev) => ({ ...prev, [key]: value }));
  }

  function addEducation() {
    const entry: CvEducationEntry = { id: makeId(), institution: '', degree: '', year: '' };
    setCv((prev) => ({ ...prev, education: [...prev.education, entry] }));
  }

  function updateEducation(id: string, patch: Partial<CvEducationEntry>) {
    setCv((prev) => ({
      ...prev,
      education: prev.education.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));
  }

  function removeEducation(id: string) {
    setCv((prev) => ({ ...prev, education: prev.education.filter((e) => e.id !== id) }));
  }

  function addExperience() {
    const entry: CvExperienceEntry = { id: makeId(), employer: '', role: '', duration: '', description: '' };
    setCv((prev) => ({ ...prev, experience: [...prev.experience, entry] }));
  }

  function updateExperience(id: string, patch: Partial<CvExperienceEntry>) {
    setCv((prev) => ({
      ...prev,
      experience: prev.experience.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));
  }

  function removeExperience(id: string) {
    setCv((prev) => ({ ...prev, experience: prev.experience.filter((e) => e.id !== id) }));
  }

  function addLanguage() {
    const entry: CvLanguageEntry = { id: makeId(), name: '', proficiency: 'intermediate' };
    setCv((prev) => ({ ...prev, languages: [...prev.languages, entry] }));
  }

  function updateLanguage(id: string, patch: Partial<CvLanguageEntry>) {
    setCv((prev) => ({
      ...prev,
      languages: prev.languages.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    }));
  }

  function removeLanguage(id: string) {
    setCv((prev) => ({ ...prev, languages: prev.languages.filter((l) => l.id !== id) }));
  }

  function handleDownload() {
    generateCvPdf(cv, template);
    trackEvent({ name: 'cv_pdf_downloaded', template });
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 className="font-display text-2xl font-semibold text-(--color-ink)">{tr('cv', 'title')}</h1>
          <p className="mt-1 text-(--color-muted)">{tr('cv', 'subtitle')}</p>
        </div>
        {user && (
          <span className="mt-1 text-xs text-(--color-muted)">
            {saveStatus === 'saving' && tr('cv', 'saving')}
            {saveStatus === 'saved' && (
              <span className="inline-flex items-center gap-1 text-(--color-success)">
                <IconCheck className="h-3 w-3" />
                {tr('cv', 'saved')}
              </span>
            )}
          </span>
        )}
      </div>

      {!user && (
        <p className="mt-3 rounded-(--radius-md) border border-(--color-line) bg-(--color-lapis)/5 px-4 py-2.5 text-sm text-(--color-muted)">
          {tr('cv', 'signInToSaveHint')}
        </p>
      )}

      {/* Template selector */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {TEMPLATE_OPTIONS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTemplate(t.value)}
            className={`rounded-(--radius-lg) border-2 p-3 text-left transition-colors ${
              template === t.value
                ? 'border-(--color-lapis) bg-(--color-lapis)/5'
                : 'border-(--color-line) hover:border-(--color-lapis)/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-(--color-ink)">{tr('cv', t.labelKey)}</span>
              {template === t.value && <IconCheck className="h-4 w-4 shrink-0 text-(--color-lapis)" />}
            </div>
            <p className="mt-1 text-xs text-(--color-muted)">{tr('cv', t.descKey)}</p>
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px] lg:items-start">
        <div className="space-y-6 pb-24">
        {/* Personal info */}
        <section className="rounded-(--radius-lg) border border-(--color-line) bg-(--color-paper-raised) p-5">
          <h2 className="font-display text-lg font-semibold text-(--color-lapis)">
            {tr('cv', 'sectionPersonal')}
          </h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>{tr('cv', 'fullName')}</label>
              <input
                className={inputClass}
                value={cv.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>{tr('cv', 'email')}</label>
              <input
                type="email"
                className={inputClass}
                value={cv.email}
                onChange={(e) => updateField('email', e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>{tr('cv', 'phone')}</label>
              <input
                className={inputClass}
                value={cv.phone}
                onChange={(e) => updateField('phone', e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>{tr('cv', 'location')}</label>
              <input
                className={inputClass}
                value={cv.location}
                onChange={(e) => updateField('location', e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>{tr('cv', 'address')}</label>
              <input
                className={inputClass}
                value={cv.address}
                onChange={(e) => updateField('address', e.target.value)}
              />
            </div>
          </div>
          <div className="mt-4">
            <label className={labelClass}>{tr('cv', 'summary')}</label>
            <textarea
              className={inputClass}
              rows={3}
              placeholder={tr('cv', 'summaryPlaceholder')}
              value={cv.summary}
              onChange={(e) => updateField('summary', e.target.value)}
            />
          </div>
        </section>

        {/* Experience */}
        <section className="rounded-(--radius-lg) border border-(--color-line) bg-(--color-paper-raised) p-5">
          <h2 className="font-display text-lg font-semibold text-(--color-lapis)">
            {tr('cv', 'sectionExperience')}
          </h2>
          <div className="mt-3 space-y-4">
            {cv.experience.map((exp) => (
              <div key={exp.id} className="rounded-(--radius-md) border border-(--color-line) p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>{tr('cv', 'employer')}</label>
                    <input
                      className={inputClass}
                      value={exp.employer}
                      onChange={(e) => updateExperience(exp.id, { employer: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{tr('cv', 'role')}</label>
                    <input
                      className={inputClass}
                      value={exp.role}
                      onChange={(e) => updateExperience(exp.id, { role: e.target.value })}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>{tr('cv', 'duration')}</label>
                    <input
                      className={inputClass}
                      placeholder="2022 — Present"
                      value={exp.duration}
                      onChange={(e) => updateExperience(exp.id, { duration: e.target.value })}
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className={labelClass}>{tr('cv', 'description')}</label>
                  <textarea
                    className={inputClass}
                    rows={2}
                    value={exp.description}
                    onChange={(e) => updateExperience(exp.id, { description: e.target.value })}
                  />
                </div>
                <button onClick={() => removeExperience(exp.id)} className={`mt-3 ${btnDangerOutlineSm}`}>
                  <IconTrash />
                  {tr('cv', 'remove')}
                </button>
              </div>
            ))}
            <button onClick={addExperience} className={btnDashed}>
              <IconPlus />
              {tr('cv', 'addExperience')}
            </button>
          </div>
        </section>

        {/* Education */}
        <section className="rounded-(--radius-lg) border border-(--color-line) bg-(--color-paper-raised) p-5">
          <h2 className="font-display text-lg font-semibold text-(--color-lapis)">
            {tr('cv', 'sectionEducation')}
          </h2>
          <div className="mt-3 space-y-4">
            {cv.education.map((edu) => (
              <div key={edu.id} className="rounded-(--radius-md) border border-(--color-line) p-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="sm:col-span-2">
                    <label className={labelClass}>{tr('cv', 'institution')}</label>
                    <input
                      className={inputClass}
                      value={edu.institution}
                      onChange={(e) => updateEducation(edu.id, { institution: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{tr('cv', 'year')}</label>
                    <input
                      className={inputClass}
                      value={edu.year}
                      onChange={(e) => updateEducation(edu.id, { year: e.target.value })}
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className={labelClass}>{tr('cv', 'degree')}</label>
                    <input
                      className={inputClass}
                      value={edu.degree}
                      onChange={(e) => updateEducation(edu.id, { degree: e.target.value })}
                    />
                  </div>
                </div>
                <button onClick={() => removeEducation(edu.id)} className={`mt-3 ${btnDangerOutlineSm}`}>
                  <IconTrash />
                  {tr('cv', 'remove')}
                </button>
              </div>
            ))}
            <button onClick={addEducation} className={btnDashed}>
              <IconPlus />
              {tr('cv', 'addEducation')}
            </button>
          </div>
        </section>

        {/* Skills */}
        <section className="rounded-(--radius-lg) border border-(--color-line) bg-(--color-paper-raised) p-5">
          <h2 className="font-display text-lg font-semibold text-(--color-lapis)">
            {tr('cv', 'sectionSkills')}
          </h2>
          <textarea
            className={`mt-3 ${inputClass}`}
            rows={2}
            placeholder={tr('cv', 'skillsPlaceholder')}
            value={cv.skills}
            onChange={(e) => updateField('skills', e.target.value)}
          />
        </section>

        {/* Languages */}
        <section className="rounded-(--radius-lg) border border-(--color-line) bg-(--color-paper-raised) p-5">
          <h2 className="font-display text-lg font-semibold text-(--color-lapis)">
            {tr('cv', 'sectionLanguages')}
          </h2>
          <div className="mt-3 space-y-3">
            {cv.languages.map((lang) => {
              const isNative = lang.proficiency === 'native';
              return (
                <div
                  key={lang.id}
                  className={`flex flex-wrap items-center gap-3 rounded-(--radius-md) border p-3 transition-colors ${
                    isNative
                      ? 'border-(--color-saffron) bg-(--color-saffron)/8'
                      : 'border-(--color-line)'
                  }`}
                >
                  <input
                    className={`${inputClass} max-w-[220px]`}
                    placeholder={tr('cv', 'languageName')}
                    value={lang.name}
                    onChange={(e) => updateLanguage(lang.id, { name: e.target.value })}
                  />
                  <select
                    className={`${inputClass} max-w-[180px]`}
                    value={lang.proficiency}
                    onChange={(e) =>
                      updateLanguage(lang.id, { proficiency: e.target.value as LanguageProficiency })
                    }
                  >
                    {PROFICIENCY_LEVELS.map((level) => (
                      <option key={level.value} value={level.value}>
                        {tr('cv', level.labelKey)}
                      </option>
                    ))}
                  </select>

                  {isNative && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-(--color-saffron) px-2.5 py-0.5 text-xs font-semibold text-white">
                      ★ {tr('cv', 'nativeLabel')}
                    </span>
                  )}

                  <button onClick={() => removeLanguage(lang.id)} className={`ml-auto ${btnDangerOutlineSm}`}>
                    <IconTrash />
                    {tr('cv', 'remove')}
                  </button>
                </div>
              );
            })}
            <button onClick={addLanguage} className={btnDashed}>
              <IconPlus />
              {tr('cv', 'addLanguage')}
            </button>
          </div>
        </section>

        </div>

        <CvPreview cv={cv} template={template} />
      </div>

      {/* Sticky so the primary action stays reachable while scrolling a long form, especially on mobile */}
      <div className="fixed inset-x-0 bottom-0 border-t border-(--color-line) bg-(--color-paper-raised)/95 px-6 py-3 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl justify-end">
          <button onClick={handleDownload} className={`${btnPrimary} px-6 py-3`}>
            <IconDownload className="h-4 w-4" />
            {tr('cv', 'downloadPdf')}
          </button>
        </div>
      </div>
    </div>
  );
}
