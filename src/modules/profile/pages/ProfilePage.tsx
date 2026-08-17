import { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../../lib/auth/AuthContext';
import { useLanguage } from '../../../lib/i18n/LanguageContext';
import { LANGUAGES, type Language } from '../../../lib/i18n/strings';
import { loadProfile, saveProfile } from '../api/profileApi';
import { loadCvProfile } from '../../cv/api/cvProfileApi';
import { loadCoverLetterProfile } from '../../coverLetter/api/coverLetterProfileApi';
import { fetchUserDocuments } from '../../documents/api/documentsApi';
import { DOCUMENT_TYPES } from '../../documents/data/documentTypes';
import { fetchMyServiceRequests, addJobToRequest, getDeliverableFileUrl } from '../../orders/api/serviceRequestsApi';
import { JobTargetFields } from '../../orders/components/JobTargetFields';
import type { ServiceRequestWithJobs, JobTargetInput } from '../../orders/types/order';
import { btnPrimary, btnSecondary, btnSecondarySm } from '../../../components/ui/buttonStyles';
import { IconCheck, IconUser, IconFileText, IconDownload } from '../../../components/ui/icons';
import { LoadingBlock } from '../../../components/ui/Spinner';

const EMPTY_JOB: JobTargetInput = { targetJobLink: '', targetJobNote: '', screenshotFile: null };

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-(--color-line)">
      <div className="h-full rounded-full bg-(--color-lapis) transition-all" style={{ width: `${pct}%` }} />
    </div>
  );
}

function OrderQuotaCard({ order, onJobAdded }: { order: ServiceRequestWithJobs; onJobAdded: () => void }) {
  const { user } = useAuth();
  const { tr } = useLanguage();
  const [adding, setAdding] = useState(false);
  const [newJob, setNewJob] = useState<JobTargetInput>({ ...EMPTY_JOB });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urls, setUrls] = useState<Record<string, string>>({});

  const usedSlots = order.jobs.length;
  const totalSlots = order.tier === '3' ? 3 : 1;

  async function handleDownload(path: string) {
    if (urls[path]) {
      window.open(urls[path], '_blank', 'noopener,noreferrer');
      return;
    }
    const url = await getDeliverableFileUrl(path);
    if (url) {
      setUrls((prev) => ({ ...prev, [path]: url }));
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  async function handleAddJob() {
    if (!user) return;
    if (!newJob.targetJobLink.trim() && !newJob.targetJobNote.trim() && !newJob.screenshotFile) {
      setError(tr('order', 'errorNeedJob'));
      return;
    }
    setBusy(true);
    setError(null);
    const { error: addError } = await addJobToRequest(user.id, order.id, usedSlots + 1, newJob);
    setBusy(false);
    if (addError) {
      setError(addError);
      return;
    }
    setAdding(false);
    setNewJob({ ...EMPTY_JOB });
    onJobAdded();
  }

  return (
    <div className="rounded-(--radius-lg) border border-(--color-line) bg-(--color-paper-raised) p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-display text-sm font-semibold text-(--color-ink)">
            {order.tier === '1' ? tr('pricing', 'tier1Name') : tr('pricing', 'tier3Name')}
          </p>
          <p className="text-xs text-(--color-muted)">{new Date(order.created_at).toLocaleDateString()}</p>
        </div>
        <span className="rounded-full bg-(--color-lapis)/10 px-2.5 py-1 text-xs font-semibold text-(--color-lapis)">
          {tr('profile', 'quotaUsed')}: {usedSlots}/{totalSlots}
        </span>
      </div>

      {order.tier === '3' && (
        <div className="mt-3">
          <ProgressBar value={usedSlots} max={totalSlots} />
        </div>
      )}

      <div className="mt-4 space-y-2">
        {order.jobs.map((job, i) => (
          <div key={job.id} className="rounded-(--radius-md) border border-(--color-line) p-3 text-sm">
            <div className="flex items-center justify-between">
              <p className="font-medium text-(--color-ink)">
                {tr('order', 'jobSlotLabel')} {i + 1}
                {job.target_job_note && <span className="font-normal text-(--color-muted)"> — {job.target_job_note}</span>}
              </p>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  job.status === 'delivered' ? 'bg-(--color-success)/12 text-(--color-success)' : 'bg-(--color-saffron)/12 text-(--color-saffron)'
                }`}
              >
                {job.status.replace('_', ' ')}
              </span>
            </div>
            {job.status === 'delivered' && (job.delivered_cv_storage_path || job.delivered_cover_letter_storage_path) && (
              <div className="mt-2 flex flex-wrap gap-2">
                {job.delivered_cv_storage_path && (
                  <button onClick={() => handleDownload(job.delivered_cv_storage_path!)} className={btnSecondarySm}>
                    <IconDownload />
                    {tr('profile', 'downloadCv')}
                  </button>
                )}
                {job.delivered_cover_letter_storage_path && (
                  <button onClick={() => handleDownload(job.delivered_cover_letter_storage_path!)} className={btnSecondarySm}>
                    <IconDownload />
                    {tr('profile', 'downloadCoverLetter')}
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {order.tier === '3' && usedSlots < 3 && (
        <div className="mt-4 border-t border-(--color-line) pt-4">
          {!adding ? (
            <button onClick={() => setAdding(true)} className={btnSecondarySm}>
              {tr('order', 'addAnotherJob')} ({usedSlots}/3)
            </button>
          ) : (
            <div className="space-y-3">
              <JobTargetFields value={newJob} onChange={setNewJob} />
              {error && <p className="text-sm text-(--color-danger)">{error}</p>}
              <div className="flex gap-2">
                <button onClick={handleAddJob} disabled={busy} className={btnSecondarySm}>
                  {busy ? tr('order', 'submitting') : tr('order', 'submit')}
                </button>
                <button onClick={() => setAdding(false)} className={btnSecondarySm}>
                  {tr('common', 'cancel')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const { tr } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [mobilePhone, setMobilePhone] = useState('');
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState<Language>('ps');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  const [hasCv, setHasCv] = useState(false);
  const [hasCoverLetter, setHasCoverLetter] = useState(false);
  const [docTypesCovered, setDocTypesCovered] = useState(0);
  const [orders, setOrders] = useState<ServiceRequestWithJobs[]>([]);

  useEffect(() => {
    if (!user) return;
    loadAll();
  }, [user]);

  async function loadAll() {
    if (!user) return;
    setLoading(true);
    const [profile, cvProfile, coverLetterProfile, documents, requests] = await Promise.all([
      loadProfile(user.id),
      loadCvProfile(user.id),
      loadCoverLetterProfile(user.id),
      fetchUserDocuments(user.id),
      fetchMyServiceRequests(user.id),
    ]);

    setMobilePhone(profile.mobile_phone ?? '');
    setWhatsappPhone(profile.whatsapp_phone ?? '');
    setPreferredLanguage(profile.preferred_language);
    setHasCv(!!cvProfile);
    setHasCoverLetter(!!coverLetterProfile);
    const coveredTypes = new Set(documents.map((d) => d.document_type));
    setDocTypesCovered(coveredTypes.size);
    setOrders(requests);
    setLoading(false);
  }

  if (authLoading) return null;
  if (!user) return <Navigate to="/sign-in" replace state={{ redirectTo: '/profile' }} />;

  async function handleSaveProfile() {
    if (!user) return;
    setSavingProfile(true);
    setProfileSaved(false);
    const { error } = await saveProfile(user.id, {
      mobile_phone: mobilePhone.trim(),
      whatsapp_phone: whatsappPhone.trim(),
      preferred_language: preferredLanguage,
    });
    setSavingProfile(false);
    if (!error) setProfileSaved(true);
  }

  if (loading) return <LoadingBlock label={tr('common', 'loading')} className="py-16" />;

  const inputClass =
    'mt-1 w-full rounded-(--radius-md) border border-(--color-line) bg-(--color-paper-raised) px-3 py-2 text-sm text-(--color-ink) outline-none transition-colors focus:border-(--color-lapis)';

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-(--color-lapis)/10 text-(--color-lapis)">
          <IconUser />
        </span>
        <div>
          <h1 className="font-display text-2xl font-semibold text-(--color-ink)">{tr('profile', 'title')}</h1>
          <p className="text-sm text-(--color-muted)">{user.email}</p>
        </div>
      </div>

      {/* Contact numbers */}
      <section className="mt-8 rounded-(--radius-lg) border border-(--color-line) bg-(--color-paper-raised) p-5">
        <h2 className="font-display text-base font-semibold text-(--color-ink)">{tr('profile', 'contactHeading')}</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-(--color-ink)">{tr('profile', 'mobileLabel')}</label>
            <input type="text" value={mobilePhone} onChange={(e) => setMobilePhone(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="text-sm font-medium text-(--color-ink)">{tr('profile', 'whatsappLabel')}</label>
            <input type="text" value={whatsappPhone} onChange={(e) => setWhatsappPhone(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="text-sm font-medium text-(--color-ink)">{tr('profile', 'emailLanguageHeading')}</label>
            <select
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e.target.value as Language)}
              className={inputClass}
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-(--color-muted)">{tr('profile', 'emailLanguageHelp')}</p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <button onClick={handleSaveProfile} disabled={savingProfile} className={btnSecondarySm}>
            {savingProfile ? tr('common', 'saving') : tr('common', 'save')}
          </button>
          {profileSaved && (
            <span className="flex items-center gap-1 text-xs font-medium text-(--color-success)">
              <IconCheck className="h-3.5 w-3.5" />
              {tr('common', 'saved')}
            </span>
          )}
        </div>
      </section>

      {/* CV / cover letter status */}
      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-(--radius-lg) border border-(--color-line) bg-(--color-paper-raised) p-5">
          <div className="flex items-center gap-2">
            <IconFileText className="h-5 w-5 text-(--color-lapis)" />
            <h2 className="font-display text-base font-semibold text-(--color-ink)">{tr('nav', 'cvBuilder')}</h2>
          </div>
          <p className="mt-1.5 text-sm text-(--color-muted)">{hasCv ? tr('profile', 'cvSaved') : tr('profile', 'cvNotStarted')}</p>
          <Link to="/cv-builder" className={`${btnSecondarySm} mt-3`}>
            {hasCv ? tr('profile', 'editCv') : tr('profile', 'startCv')}
          </Link>
        </div>
        <div className="rounded-(--radius-lg) border border-(--color-line) bg-(--color-paper-raised) p-5">
          <div className="flex items-center gap-2">
            <IconFileText className="h-5 w-5 text-(--color-lapis)" />
            <h2 className="font-display text-base font-semibold text-(--color-ink)">{tr('nav', 'coverLetter')}</h2>
          </div>
          <p className="mt-1.5 text-sm text-(--color-muted)">{hasCoverLetter ? tr('profile', 'cvSaved') : tr('profile', 'cvNotStarted')}</p>
          <Link to="/cover-letter" className={`${btnSecondarySm} mt-3`}>
            {hasCoverLetter ? tr('profile', 'editCv') : tr('profile', 'startCv')}
          </Link>
        </div>
      </section>

      {/* Document vault progress */}
      <section className="mt-6 rounded-(--radius-lg) border border-(--color-line) bg-(--color-paper-raised) p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-semibold text-(--color-ink)">{tr('profile', 'vaultHeading')}</h2>
          <span className="text-sm font-medium text-(--color-muted)">
            {docTypesCovered}/{DOCUMENT_TYPES.length}
          </span>
        </div>
        <div className="mt-2.5">
          <ProgressBar value={docTypesCovered} max={DOCUMENT_TYPES.length} />
        </div>
        <Link to="/documents" className={`${btnSecondarySm} mt-3`}>
          {tr('nav', 'documents')}
        </Link>
      </section>

      {/* Orders / quota / delivered files */}
      <section className="mt-6">
        <h2 className="font-display text-base font-semibold text-(--color-ink)">{tr('profile', 'ordersHeading')}</h2>
        {orders.length === 0 ? (
          <div className="mt-3 rounded-(--radius-lg) border border-dashed border-(--color-line) p-5 text-center text-sm text-(--color-muted)">
            {tr('profile', 'noOrders')}
            <div className="mt-3">
              <Link to="/pricing" className={btnPrimary}>
                {tr('home', 'pricingTeaserCta')}
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-3 space-y-4">
            {orders.map((o) => (
              <OrderQuotaCard key={o.id} order={o} onJobAdded={loadAll} />
            ))}
          </div>
        )}
      </section>

      <div className="mt-8 flex justify-center">
        <Link to="/" className={btnSecondary}>
          {tr('order', 'backHome')}
        </Link>
      </div>
    </div>
  );
}
