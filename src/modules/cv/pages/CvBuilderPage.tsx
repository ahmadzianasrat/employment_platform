import { useState } from 'react';
import { useLanguage } from '../../../lib/i18n/LanguageContext';
import { generateCvPdf } from '../lib/generatePdf';
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

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

const inputClass =
  'w-full rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-paper-raised)] px-3 py-2 text-sm outline-none focus:border-[var(--color-lapis)]';
const labelClass = 'mb-1 block text-sm font-medium text-[var(--color-ink)]';

export function CvBuilderPage() {
  const { tr } = useLanguage();
  const [cv, setCv] = useState<CvData>(EMPTY_CV);

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
    generateCvPdf(cv);
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="font-display text-2xl font-semibold text-[var(--color-ink)]">{tr('cv', 'title')}</h1>
      <p className="mt-1 text-[var(--color-muted)]">{tr('cv', 'subtitle')}</p>

      <div className="mt-8 space-y-8">
        {/* Personal info */}
        <section>
          <h2 className="font-display text-lg font-semibold text-[var(--color-lapis)]">
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
        <section>
          <h2 className="font-display text-lg font-semibold text-[var(--color-lapis)]">
            {tr('cv', 'sectionExperience')}
          </h2>
          <div className="mt-3 space-y-4">
            {cv.experience.map((exp) => (
              <div key={exp.id} className="rounded-[var(--radius-md)] border border-[var(--color-line)] p-4">
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
                <button
                  onClick={() => removeExperience(exp.id)}
                  className="mt-3 text-xs font-medium text-[var(--color-danger)] hover:underline"
                >
                  {tr('cv', 'remove')}
                </button>
              </div>
            ))}
            <button
              onClick={addExperience}
              className="text-sm font-medium text-[var(--color-lapis)] hover:underline"
            >
              {tr('cv', 'addExperience')}
            </button>
          </div>
        </section>

        {/* Education */}
        <section>
          <h2 className="font-display text-lg font-semibold text-[var(--color-lapis)]">
            {tr('cv', 'sectionEducation')}
          </h2>
          <div className="mt-3 space-y-4">
            {cv.education.map((edu) => (
              <div key={edu.id} className="rounded-[var(--radius-md)] border border-[var(--color-line)] p-4">
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
                <button
                  onClick={() => removeEducation(edu.id)}
                  className="mt-3 text-xs font-medium text-[var(--color-danger)] hover:underline"
                >
                  {tr('cv', 'remove')}
                </button>
              </div>
            ))}
            <button
              onClick={addEducation}
              className="text-sm font-medium text-[var(--color-lapis)] hover:underline"
            >
              {tr('cv', 'addEducation')}
            </button>
          </div>
        </section>

        {/* Skills */}
        <section>
          <h2 className="font-display text-lg font-semibold text-[var(--color-lapis)]">
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
        <section>
          <h2 className="font-display text-lg font-semibold text-[var(--color-lapis)]">
            {tr('cv', 'sectionLanguages')}
          </h2>
          <div className="mt-3 space-y-3">
            {cv.languages.map((lang) => {
              const isNative = lang.proficiency === 'native';
              return (
                <div
                  key={lang.id}
                  className={`flex flex-wrap items-center gap-3 rounded-[var(--radius-md)] border p-3 transition-colors ${
                    isNative
                      ? 'border-[var(--color-saffron)] bg-[var(--color-saffron)]/8'
                      : 'border-[var(--color-line)]'
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
                    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-saffron)] px-2.5 py-0.5 text-xs font-semibold text-white">
                      ★ {tr('cv', 'nativeLabel')}
                    </span>
                  )}

                  <button
                    onClick={() => removeLanguage(lang.id)}
                    className="ml-auto text-xs font-medium text-[var(--color-danger)] hover:underline"
                  >
                    {tr('cv', 'remove')}
                  </button>
                </div>
              );
            })}
            <button
              onClick={addLanguage}
              className="text-sm font-medium text-[var(--color-lapis)] hover:underline"
            >
              {tr('cv', 'addLanguage')}
            </button>
          </div>
        </section>

        <button
          onClick={handleDownload}
          className="rounded-[var(--radius-md)] bg-[var(--color-saffron)] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-saffron-light)]"
        >
          {tr('cv', 'downloadPdf')}
        </button>
      </div>
    </div>
  );
}
