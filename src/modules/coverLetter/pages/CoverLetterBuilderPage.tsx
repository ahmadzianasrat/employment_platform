import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../../lib/auth/AuthContext';
import { useLanguage } from '../../../lib/i18n/LanguageContext';
import { loadCoverLetterProfile, saveCoverLetterProfile } from '../api/coverLetterProfileApi';
import type { CoverLetterTemplate } from '../api/coverLetterProfileApi';
import { loadCvProfile } from '../../cv/api/cvProfileApi';
import { generateCoverLetterPdf } from '../lib/generateCoverLetterPdf';
import { trackEvent } from '../../../lib/analytics/ga';
import { CoverLetterPreview } from '../components/CoverLetterPreview';
import { EMPTY_COVER_LETTER } from '../types/coverLetter';
import type { CoverLetterData } from '../types/coverLetter';
import { btnPrimary, btnSecondarySm } from '../../../components/ui/buttonStyles';
import { IconDownload, IconCheck } from '../../../components/ui/icons';

const TEMPLATE_OPTIONS: { value: CoverLetterTemplate; labelKey: string; descKey: string }[] = [
  { value: 'formal', labelKey: 'templateFormal', descKey: 'templateFormalDesc' },
  { value: 'modern', labelKey: 'templateModern', descKey: 'templateModernDesc' },
  { value: 'banner', labelKey: 'templateBanner', descKey: 'templateBannerDesc' },
];

const FIELD_CLASS =
  'w-full rounded-(--radius-md) border border-(--color-line) bg-(--color-paper) px-3 py-2 text-sm outline-none focus:border-(--color-lapis)';

export function CoverLetterBuilderPage() {
  const { user } = useAuth();
  const { tr } = useLanguage();
  const [letter, setLetter] = useState<CoverLetterData>(EMPTY_COVER_LETTER);
  const [template, setTemplate] = useState<CoverLetterTemplate>('formal');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [canPrefillFromCv, setCanPrefillFromCv] = useState(false);
  const loadedRef = useRef(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!user) {
      loadedRef.current = true;
      return;
    }
    loadedRef.current = false;
    loadCoverLetterProfile(user.id).then((profile) => {
      if (profile) {
        setLetter(profile.data);
        setTemplate(profile.template);
      }
      loadedRef.current = true;
    });
    loadCvProfile(user.id).then((cv) => {
      if (cv?.data.fullName) setCanPrefillFromCv(true);
    });
  }, [user]);

  useEffect(() => {
    if (!user || !loadedRef.current) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    setSaveStatus('saving');
    saveTimeoutRef.current = setTimeout(() => {
      saveCoverLetterProfile(user.id, { data: letter, template }).then(() => setSaveStatus('saved'));
    }, 1200);
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [letter, template, user]);

  function update<K extends keyof CoverLetterData>(key: K, value: CoverLetterData[K]) {
    setLetter((prev) => ({ ...prev, [key]: value }));
  }

  async function handlePrefillFromCv() {
    if (!user) return;
    const cv = await loadCvProfile(user.id);
    if (!cv) return;
    setLetter((prev) => ({
      ...prev,
      fullName: prev.fullName || cv.data.fullName,
      email: prev.email || cv.data.email,
      phone: prev.phone || cv.data.phone,
      address: prev.address || cv.data.address || cv.data.location,
    }));
  }

  function handleDownload() {
    generateCoverLetterPdf(letter, template);
    trackEvent({ name: 'cover_letter_pdf_downloaded', template });
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 className="font-display text-2xl font-semibold text-(--color-ink)">{tr('coverLetter', 'title')}</h1>
          <p className="mt-1 text-(--color-muted)">{tr('coverLetter', 'subtitle')}</p>
        </div>
        {user && (
          <span className="mt-1 text-xs text-(--color-muted)">
            {saveStatus === 'saving' && tr('coverLetter', 'saving')}
            {saveStatus === 'saved' && (
              <span className="inline-flex items-center gap-1 text-(--color-success)">
                <IconCheck className="h-3 w-3" />
                {tr('coverLetter', 'saved')}
              </span>
            )}
          </span>
        )}
      </div>

      {!user && (
        <p className="mt-3 rounded-(--radius-md) border border-(--color-line) bg-(--color-lapis)/5 px-4 py-2.5 text-sm text-(--color-muted)">
          {tr('coverLetter', 'signInHint')}
        </p>
      )}

      {canPrefillFromCv && (
        <button onClick={handlePrefillFromCv} className={`mt-3 ${btnSecondarySm}`}>
          {tr('coverLetter', 'prefillFromCv')}
        </button>
      )}

      <div className="mt-6 grid grid-cols-3 gap-3 sm:max-w-2xl">
        {TEMPLATE_OPTIONS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTemplate(t.value)}
            className={`overflow-hidden rounded-(--radius-lg) border-2 text-left transition-colors ${
              template === t.value
                ? 'border-(--color-lapis) bg-(--color-lapis)/5'
                : 'border-(--color-line) hover:border-(--color-lapis)/40'
            }`}
          >
            <div className="pointer-events-none px-2 pt-2">
              <CoverLetterPreview letter={letter} template={t.value} sticky={false} showFooterNote={false} />
            </div>
            <div className="flex items-center justify-between px-3 pb-2 pt-1.5">
              <span className="text-xs font-semibold text-(--color-ink)">{tr('coverLetter', t.labelKey)}</span>
              {template === t.value && <IconCheck className="h-3.5 w-3.5 shrink-0 text-(--color-lapis)" />}
            </div>
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px] lg:items-start">
        <div className="space-y-6 pb-24">
          <section className="rounded-(--radius-lg) border border-(--color-line) bg-(--color-paper-raised) p-5">
            <h2 className="font-display text-lg font-semibold text-(--color-lapis)">{tr('coverLetter', 'sectionYourDetails')}</h2>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input className={FIELD_CLASS} placeholder={tr('coverLetter', 'fullNamePlaceholder')} value={letter.fullName} onChange={(e) => update('fullName', e.target.value)} />
              <input className={FIELD_CLASS} placeholder={tr('coverLetter', 'emailPlaceholder')} value={letter.email} onChange={(e) => update('email', e.target.value)} />
              <input className={FIELD_CLASS} placeholder={tr('coverLetter', 'phonePlaceholder')} value={letter.phone} onChange={(e) => update('phone', e.target.value)} />
              <input className={FIELD_CLASS} placeholder={tr('coverLetter', 'addressPlaceholder')} value={letter.address} onChange={(e) => update('address', e.target.value)} />
              <input className={FIELD_CLASS} placeholder={tr('coverLetter', 'datePlaceholder')} value={letter.date} onChange={(e) => update('date', e.target.value)} />
              <input className={FIELD_CLASS} placeholder={tr('coverLetter', 'jobTitlePlaceholder')} value={letter.jobTitle} onChange={(e) => update('jobTitle', e.target.value)} />
            </div>
          </section>

          <section className="rounded-(--radius-lg) border border-(--color-line) bg-(--color-paper-raised) p-5">
            <h2 className="font-display text-lg font-semibold text-(--color-lapis)">{tr('coverLetter', 'sectionRecipient')}</h2>
            <p className="mt-1 text-xs text-(--color-muted)">{tr('coverLetter', 'recipientHint')}</p>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input className={FIELD_CLASS} placeholder={tr('coverLetter', 'recipientNamePlaceholder')} value={letter.recipientName} onChange={(e) => update('recipientName', e.target.value)} />
              <input className={FIELD_CLASS} placeholder={tr('coverLetter', 'recipientTitlePlaceholder')} value={letter.recipientTitle} onChange={(e) => update('recipientTitle', e.target.value)} />
              <input className={FIELD_CLASS} placeholder={tr('coverLetter', 'organizationNamePlaceholder')} value={letter.organizationName} onChange={(e) => update('organizationName', e.target.value)} />
              <input className={FIELD_CLASS} placeholder={tr('coverLetter', 'organizationAddressPlaceholder')} value={letter.organizationAddress} onChange={(e) => update('organizationAddress', e.target.value)} />
            </div>
          </section>

          <section className="rounded-(--radius-lg) border border-(--color-line) bg-(--color-paper-raised) p-5">
            <h2 className="font-display text-lg font-semibold text-(--color-lapis)">{tr('coverLetter', 'sectionYourLetter')}</h2>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-(--color-muted)">{tr('coverLetter', 'openingLabel')}</label>
                <textarea
                  className={`${FIELD_CLASS} mt-1`}
                  rows={3}
                  value={letter.opening}
                  onChange={(e) => update('opening', e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-(--color-muted)">{tr('coverLetter', 'motivationLabel')}</label>
                <textarea
                  className={`${FIELD_CLASS} mt-1`}
                  rows={5}
                  value={letter.motivation}
                  onChange={(e) => update('motivation', e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-(--color-muted)">{tr('coverLetter', 'closingLabel')}</label>
                <textarea
                  className={`${FIELD_CLASS} mt-1`}
                  rows={3}
                  value={letter.closing}
                  onChange={(e) => update('closing', e.target.value)}
                />
              </div>
              <input
                className={FIELD_CLASS}
                placeholder={tr('coverLetter', 'signOffPlaceholder')}
                value={letter.signOff}
                onChange={(e) => update('signOff', e.target.value)}
              />
            </div>
          </section>
        </div>

        <CoverLetterPreview letter={letter} template={template} />
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-(--color-line) bg-(--color-paper-raised)/95 px-6 py-3 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl justify-end">
          <button onClick={handleDownload} className={`${btnPrimary} px-6 py-3`}>
            <IconDownload className="h-4 w-4" />
            {tr('coverLetter', 'downloadPdf')}
          </button>
        </div>
      </div>
    </div>
  );
}
