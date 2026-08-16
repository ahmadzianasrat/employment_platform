import { useState, type FormEvent } from 'react';
import { Navigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../lib/auth/AuthContext';
import { useLanguage } from '../../../lib/i18n/LanguageContext';
import { submitServiceRequest } from '../api/serviceRequestsApi';
import { trackEvent } from '../../../lib/analytics/ga';
import { btnPrimary, btnSecondary, btnSecondarySm } from '../../../components/ui/buttonStyles';
import { FileInputButton } from '../../../components/ui/FileInputButton';
import { JobTargetFields } from '../components/JobTargetFields';
import { IconCheck, IconPlus, IconTrash, IconUser, IconPhone, IconWallet, IconWhatsapp } from '../../../components/ui/icons';
import type { PaymentMethod, PricingTier, JobTargetInput } from '../types/order';

const EMPTY_JOB: JobTargetInput = { targetJobLink: '', targetJobNote: '', screenshotFile: null };

export function OrderPage() {
  const { user, loading: authLoading } = useAuth();
  const { tr } = useLanguage();
  const [searchParams] = useSearchParams();
  const tierParam = searchParams.get('tier');

  const [tier, setTier] = useState<PricingTier>(tierParam === '3' ? '3' : '1');
  const [jobs, setJobs] = useState<JobTargetInput[]>([{ ...EMPTY_JOB }]);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('easy_load');
  const [paymentSenderNumber, setPaymentSenderNumber] = useState('');
  const [paymentAccountOwner, setPaymentAccountOwner] = useState('');
  const [paymentTransactionId, setPaymentTransactionId] = useState('');
  const [paymentSentAt, setPaymentSentAt] = useState('');
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (authLoading) return null;
  if (!user) {
    return <Navigate to="/sign-in" replace state={{ redirectTo: '/order' }} />;
  }

  function handleTierChange(t: PricingTier) {
    setTier(t);
    if (t === '1') setJobs((prev) => prev.slice(0, 1));
  }

  function addJobSlot() {
    setJobs((prev) => (prev.length < 3 ? [...prev, { ...EMPTY_JOB }] : prev));
  }

  function removeJobSlot(index: number) {
    setJobs((prev) => prev.filter((_, i) => i !== index));
  }

  function updateJob(index: number, value: JobTargetInput) {
    setJobs((prev) => prev.map((j, i) => (i === index ? value : j)));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const hasEmptyJob = jobs.some((j) => !j.targetJobLink.trim() && !j.targetJobNote.trim() && !j.screenshotFile);
    if (hasEmptyJob) {
      setError(tr('order', 'errorNeedJob'));
      return;
    }
    if (!contactName.trim() || !contactPhone.trim()) {
      setError(tr('order', 'errorNeedContact'));
      return;
    }
    if (!paymentProofFile) {
      setError(tr('order', 'errorNeedProof'));
      return;
    }
    if (paymentMethod === 'hesab_pay' && (!paymentSenderNumber.trim() || !paymentAccountOwner.trim() || !paymentSentAt)) {
      setError(tr('order', 'errorNeedHesabPay'));
      return;
    }
    if (paymentMethod === 'easy_load' && (!paymentSenderNumber.trim() || !paymentSentAt)) {
      setError(tr('order', 'errorNeedEasyLoad'));
      return;
    }

    setSubmitting(true);
    const { error: submitError } = await submitServiceRequest(user!.id, {
      tier,
      jobs: jobs.map((j) => ({ targetJobLink: j.targetJobLink.trim(), targetJobNote: j.targetJobNote.trim(), screenshotFile: j.screenshotFile })),
      contactName: contactName.trim(),
      contactPhone: contactPhone.trim(),
      paymentMethod,
      paymentSenderNumber: paymentSenderNumber.trim(),
      paymentAccountOwner: paymentAccountOwner.trim(),
      paymentTransactionId: paymentTransactionId.trim(),
      paymentSentAt,
      notes: notes.trim(),
      paymentProofFile,
    });
    setSubmitting(false);

    if (submitError) {
      setError(submitError);
      return;
    }
    trackEvent({ name: 'service_request_submitted', tier, payment_method: paymentMethod });
    setDone(true);
  }

  if (done) {
    return (
      <div className="mx-auto max-w-xl px-6 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-(--color-success)/15 text-(--color-success)">
          <IconCheck className="h-7 w-7" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-semibold text-(--color-ink)">{tr('order', 'successTitle')}</h1>
        <p className="mt-2 text-(--color-muted)">{tr('order', 'successBody')}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/profile" className={btnPrimary}>
            {tr('order', 'goToProfile')}
          </Link>
          <Link to="/" className={btnSecondary}>
            {tr('order', 'backHome')}
          </Link>
        </div>
      </div>
    );
  }

  const inputClass =
    'mt-1 w-full rounded-(--radius-md) border border-(--color-line) bg-(--color-paper-raised) px-3 py-2 text-sm text-(--color-ink) outline-none transition-colors focus:border-(--color-lapis)';
  const labelClass = 'text-sm font-medium text-(--color-ink)';

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="font-display text-2xl font-semibold text-(--color-ink)">{tr('order', 'title')}</h1>
      <p className="mt-1 text-(--color-muted)">{tr('order', 'subtitle')}</p>
      <p className="mt-2 flex items-center gap-1.5 text-sm text-(--color-muted)">
        <IconWhatsapp className="h-3.5 w-3.5 text-(--color-success)" />
        {tr('order', 'guideHint')}{' '}
        <Link to="/guide" className="text-(--color-lapis) hover:underline">
          {tr('order', 'guideLinkLabel')}
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        {/* Tier */}
        <fieldset>
          <legend className="font-display text-base font-semibold text-(--color-lapis)">{tr('order', 'tierHeading')}</legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {(['1', '3'] as PricingTier[]).map((t) => (
              <label
                key={t}
                className={`flex cursor-pointer flex-col rounded-(--radius-md) border-2 px-4 py-3 transition-colors ${
                  tier === t ? 'border-(--color-saffron) bg-(--color-saffron)/5' : 'border-(--color-line)'
                }`}
              >
                <span className="flex items-center gap-2">
                  <input type="radio" name="tier" checked={tier === t} onChange={() => handleTierChange(t)} />
                  <span className="font-semibold text-(--color-ink)">
                    {t === '1' ? tr('pricing', 'tier1Name') : tr('pricing', 'tier3Name')}
                  </span>
                </span>
                <span className="mt-1 text-sm text-(--color-muted)">
                  {t === '1' ? tr('pricing', 'tier1Price') : tr('pricing', 'tier3Price')}
                </span>
              </label>
            ))}
          </div>
          {tier === '3' && <p className="mt-2 text-xs text-(--color-muted)">{tr('pricing', 'tier3Clarify')}</p>}
        </fieldset>

        {/* Target job(s) */}
        <fieldset className="space-y-4">
          <legend className="font-display text-base font-semibold text-(--color-lapis)">{tr('order', 'jobHeading')}</legend>
          <p className="text-sm text-(--color-muted)">{tier === '3' ? tr('order', 'jobHintTier3') : tr('order', 'jobHint')}</p>

          {jobs.map((job, i) => (
            <div key={i} className="rounded-(--radius-md) border border-(--color-line) p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-(--color-muted)">
                  {tr('order', 'jobSlotLabel')} {i + 1}
                </p>
                {tier === '3' && jobs.length > 1 && (
                  <button type="button" onClick={() => removeJobSlot(i)} className="text-(--color-danger) hover:opacity-80">
                    <IconTrash />
                  </button>
                )}
              </div>
              <div className="mt-2">
                <JobTargetFields value={job} onChange={(v) => updateJob(i, v)} />
              </div>
            </div>
          ))}

          {tier === '3' && jobs.length < 3 && (
            <button type="button" onClick={addJobSlot} className={btnSecondarySm}>
              <IconPlus />
              {tr('order', 'addAnotherJob')} ({jobs.length}/3)
            </button>
          )}
          {tier === '3' && (
            <p className="text-xs text-(--color-muted)">{tr('order', 'jobSlotsLaterHint')}</p>
          )}
        </fieldset>

        {/* Contact */}
        <fieldset className="space-y-3">
          <legend className="flex items-center gap-2 font-display text-base font-semibold text-(--color-lapis)">
            <IconUser className="h-4 w-4" />
            {tr('order', 'contactHeading')}
          </legend>
          <div>
            <label className={labelClass}>{tr('order', 'contactNameLabel')}</label>
            <input type="text" value={contactName} onChange={(e) => setContactName(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>{tr('order', 'contactPhoneLabel')}</label>
            <div className="relative mt-1">
              <IconPhone className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-muted)" />
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full rounded-(--radius-md) border border-(--color-line) bg-(--color-paper-raised) py-2 ps-9 pe-3 text-sm text-(--color-ink) outline-none transition-colors focus:border-(--color-lapis)"
              />
            </div>
          </div>
        </fieldset>

        {/* Payment */}
        <fieldset className="space-y-3">
          <legend className="flex items-center gap-2 font-display text-base font-semibold text-(--color-lapis)">
            <IconWallet className="h-4 w-4" />
            {tr('order', 'paymentHeading')}
          </legend>
          <p className="text-sm text-(--color-muted)">{tr('order', 'paymentHint')}</p>

          <div className="flex gap-3">
            {(['easy_load', 'hesab_pay'] as PaymentMethod[]).map((m) => (
              <label
                key={m}
                className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-(--radius-md) border-2 px-3 py-2.5 text-center text-sm font-semibold transition-colors ${
                  paymentMethod === m ? 'border-(--color-saffron) bg-(--color-saffron)/5 text-(--color-ink)' : 'border-(--color-line) text-(--color-muted)'
                }`}
              >
                <input type="radio" name="paymentMethod" className="sr-only" checked={paymentMethod === m} onChange={() => setPaymentMethod(m)} />
                {m === 'hesab_pay' && <IconWallet className="h-4 w-4" />}
                {m === 'easy_load' ? tr('order', 'easyLoad') : tr('order', 'hesabPay')}
              </label>
            ))}
          </div>

          {paymentMethod === 'hesab_pay' ? (
            <div className="space-y-3 rounded-(--radius-md) border border-(--color-line) p-4">
              <div>
                <label className={labelClass}>{tr('order', 'hesabNumberLabel')}</label>
                <input type="text" value={paymentSenderNumber} onChange={(e) => setPaymentSenderNumber(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{tr('order', 'hesabOwnerLabel')}</label>
                <input type="text" value={paymentAccountOwner} onChange={(e) => setPaymentAccountOwner(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{tr('order', 'paymentSentAtLabel')}</label>
                <input type="datetime-local" value={paymentSentAt} onChange={(e) => setPaymentSentAt(e.target.value)} className={inputClass} />
              </div>
            </div>
          ) : (
            <div className="space-y-3 rounded-(--radius-md) border border-(--color-line) p-4">
              <div>
                <label className={labelClass}>{tr('order', 'easyLoadNumberLabel')}</label>
                <input type="text" value={paymentSenderNumber} onChange={(e) => setPaymentSenderNumber(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{tr('order', 'paymentSentAtLabel')}</label>
                <input type="datetime-local" value={paymentSentAt} onChange={(e) => setPaymentSentAt(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{tr('order', 'transactionIdLabel')}</label>
                <input type="text" value={paymentTransactionId} onChange={(e) => setPaymentTransactionId(e.target.value)} className={inputClass} />
              </div>
            </div>
          )}

          <div>
            <label className={labelClass}>{tr('order', 'paymentProofLabel')}</label>
            <FileInputButton
              label={tr('order', 'chooseProof')}
              selectedLabel={tr('order', 'screenshotSelected')}
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              file={paymentProofFile}
              onChange={setPaymentProofFile}
            />
          </div>
        </fieldset>

        <fieldset>
          <label className={labelClass}>{tr('order', 'notesLabel')}</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className={inputClass} />
        </fieldset>

        {error && <p className="rounded-(--radius-md) bg-(--color-danger)/10 px-3 py-2 text-sm text-(--color-danger)">{error}</p>}

        <div className="flex gap-3">
          <button type="submit" disabled={submitting} className={btnPrimary}>
            {submitting ? tr('order', 'submitting') : tr('order', 'submit')}
          </button>
          <Link to="/pricing" className={btnSecondary}>
            {tr('order', 'backToPricing')}
          </Link>
        </div>
      </form>
    </div>
  );
}
