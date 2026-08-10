import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../../lib/auth/AuthContext';
import { loadCoverLetterProfile, saveCoverLetterProfile } from '../api/coverLetterProfileApi';
import type { CoverLetterTemplate } from '../api/coverLetterProfileApi';
import { loadCvProfile } from '../../cv/api/cvProfileApi';
import { generateCoverLetterPdf } from '../lib/generateCoverLetterPdf';
import { CoverLetterPreview } from '../components/CoverLetterPreview';
import { EMPTY_COVER_LETTER } from '../types/coverLetter';
import type { CoverLetterData } from '../types/coverLetter';
import { btnPrimary, btnSecondarySm } from '../../../components/ui/buttonStyles';
import { IconDownload, IconCheck } from '../../../components/ui/icons';

const TEMPLATE_OPTIONS: { value: CoverLetterTemplate; label: string; desc: string }[] = [
  { value: 'formal', label: 'Formal', desc: 'Traditional business letter layout' },
  { value: 'modern', label: 'Modern', desc: 'Colored header band with your details' },
];

const FIELD_CLASS =
  'w-full rounded-(--radius-md) border border-(--color-line) bg-(--color-paper) px-3 py-2 text-sm outline-none focus:border-(--color-lapis)';

export function CoverLetterBuilderPage() {
  const { user } = useAuth();
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
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 className="font-display text-2xl font-semibold text-(--color-ink)">Cover Letter Builder</h1>
          <p className="mt-1 text-(--color-muted)">
            Write a motivation letter to go with your application — fill it in once, download it for every job.
          </p>
        </div>
        {user && (
          <span className="mt-1 text-xs text-(--color-muted)">
            {saveStatus === 'saving' && 'Saving…'}
            {saveStatus === 'saved' && (
              <span className="inline-flex items-center gap-1 text-(--color-success)">
                <IconCheck className="h-3 w-3" />
                Saved
              </span>
            )}
          </span>
        )}
      </div>

      {!user && (
        <p className="mt-3 rounded-(--radius-md) border border-(--color-line) bg-(--color-lapis)/5 px-4 py-2.5 text-sm text-(--color-muted)">
          Sign in to save your cover letter and come back to finish it later.
        </p>
      )}

      {canPrefillFromCv && (
        <button onClick={handlePrefillFromCv} className={`mt-3 ${btnSecondarySm}`}>
          Fill in my contact details from my CV
        </button>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3 sm:max-w-md">
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
              <span className="text-sm font-semibold text-(--color-ink)">{t.label}</span>
              {template === t.value && <IconCheck className="h-4 w-4 shrink-0 text-(--color-lapis)" />}
            </div>
            <p className="mt-1 text-xs text-(--color-muted)">{t.desc}</p>
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px] lg:items-start">
        <div className="space-y-6 pb-24">
          <section className="rounded-(--radius-lg) border border-(--color-line) bg-(--color-paper-raised) p-5">
            <h2 className="font-display text-lg font-semibold text-(--color-lapis)">Your details</h2>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input className={FIELD_CLASS} placeholder="Full name" value={letter.fullName} onChange={(e) => update('fullName', e.target.value)} />
              <input className={FIELD_CLASS} placeholder="Email" value={letter.email} onChange={(e) => update('email', e.target.value)} />
              <input className={FIELD_CLASS} placeholder="Phone" value={letter.phone} onChange={(e) => update('phone', e.target.value)} />
              <input className={FIELD_CLASS} placeholder="Address / city" value={letter.address} onChange={(e) => update('address', e.target.value)} />
              <input className={FIELD_CLASS} placeholder="Date (e.g. August 9, 2026)" value={letter.date} onChange={(e) => update('date', e.target.value)} />
              <input className={FIELD_CLASS} placeholder="Position you're applying for" value={letter.jobTitle} onChange={(e) => update('jobTitle', e.target.value)} />
            </div>
          </section>

          <section className="rounded-(--radius-lg) border border-(--color-line) bg-(--color-paper-raised) p-5">
            <h2 className="font-display text-lg font-semibold text-(--color-lapis)">Recipient</h2>
            <p className="mt-1 text-xs text-(--color-muted)">Leave blank if you don't have a contact name — we'll use "Dear Hiring Manager" instead.</p>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input className={FIELD_CLASS} placeholder="Recipient name (optional)" value={letter.recipientName} onChange={(e) => update('recipientName', e.target.value)} />
              <input className={FIELD_CLASS} placeholder="Recipient title (optional)" value={letter.recipientTitle} onChange={(e) => update('recipientTitle', e.target.value)} />
              <input className={FIELD_CLASS} placeholder="Organization name" value={letter.organizationName} onChange={(e) => update('organizationName', e.target.value)} />
              <input className={FIELD_CLASS} placeholder="Organization address (optional)" value={letter.organizationAddress} onChange={(e) => update('organizationAddress', e.target.value)} />
            </div>
          </section>

          <section className="rounded-(--radius-lg) border border-(--color-line) bg-(--color-paper-raised) p-5">
            <h2 className="font-display text-lg font-semibold text-(--color-lapis)">Your letter</h2>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-(--color-muted)">Opening — why you're writing, where you saw the role</label>
                <textarea
                  className={`${FIELD_CLASS} mt-1`}
                  rows={3}
                  placeholder="I am writing to apply for the Nurse Team Supervisor position advertised on Hamqar…"
                  value={letter.opening}
                  onChange={(e) => update('opening', e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-(--color-muted)">Why you're a good fit — relevant skills and experience</label>
                <textarea
                  className={`${FIELD_CLASS} mt-1`}
                  rows={5}
                  placeholder="With over 7 years of clinical experience in medical-surgical and emergency nursing…"
                  value={letter.motivation}
                  onChange={(e) => update('motivation', e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-(--color-muted)">Closing — call to action, thanks</label>
                <textarea
                  className={`${FIELD_CLASS} mt-1`}
                  rows={3}
                  placeholder="I would welcome the opportunity to discuss my application further. Thank you for your consideration."
                  value={letter.closing}
                  onChange={(e) => update('closing', e.target.value)}
                />
              </div>
              <input
                className={FIELD_CLASS}
                placeholder="Sign-off (e.g. Sincerely,)"
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
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}
