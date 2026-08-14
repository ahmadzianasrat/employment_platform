import { useState, type FormEvent } from 'react';
import { Navigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../lib/auth/AuthContext';
import { useLanguage } from '../../../lib/i18n/LanguageContext';
import { submitServiceRequest } from '../api/serviceRequestsApi';
import { trackEvent } from '../../../lib/analytics/ga';
import { btnPrimary, btnSecondary } from '../../../components/ui/buttonStyles';
import { IconCheck } from '../../../components/ui/icons';
import type { PaymentMethod, PricingTier } from '../types/order';

const ACCEPTED_FILE_EXTENSIONS = '.pdf,.jpg,.jpeg,.png,.webp';

export function OrderPage() {
  const { user, loading: authLoading } = useAuth();
  const { tr } = useLanguage();
  const [searchParams] = useSearchParams();
  const tierParam = searchParams.get('tier');

  const [tier, setTier] = useState<PricingTier>(tierParam === '3' ? '3' : '1');
  const [targetJobLink, setTargetJobLink] = useState('');
  const [targetJobNote, setTargetJobNote] = useState('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
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

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!targetJobLink.trim() && !targetJobNote.trim() && !screenshotFile) {
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
      targetJobLink: targetJobLink.trim(),
      targetJobNote: targetJobNote.trim(),
      contactName: contactName.trim(),
      contactPhone: contactPhone.trim(),
      paymentMethod,
      paymentSenderNumber: paymentSenderNumber.trim(),
      paymentAccountOwner: paymentAccountOwner.trim(),
      paymentTransactionId: paymentTransactionId.trim(),
      paymentSentAt,
      notes: notes.trim(),
      screenshotFile,
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
        <Link to="/" className={`${btnPrimary} mt-6 inline-flex`}>
          {tr('order', 'backHome')}
        </Link>
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
      <p className="mt-2 text-sm text-(--color-muted)">
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
                  <input type="radio" name="tier" checked={tier === t} onChange={() => setTier(t)} />
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
        </fieldset>

        {/* Target job */}
        <fieldset className="space-y-3">
          <legend className="font-display text-base font-semibold text-(--color-lapis)">{tr('order', 'jobHeading')}</legend>
          <p className="text-sm text-(--color-muted)">{tr('order', 'jobHint')}</p>
          <div>
            <label className={labelClass}>{tr('order', 'jobLinkLabel')}</label>
            <input
              type="text"
              value={targetJobLink}
              onChange={(e) => setTargetJobLink(e.target.value)}
              placeholder={tr('order', 'jobLinkPlaceholder')}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>{tr('order', 'jobNoteLabel')}</label>
            <textarea
              value={targetJobNote}
              onChange={(e) => setTargetJobNote(e.target.value)}
              rows={3}
              placeholder={tr('order', 'jobNotePlaceholder')}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>{tr('order', 'jobScreenshotLabel')}</label>
            <input
              type="file"
              accept={ACCEPTED_FILE_EXTENSIONS}
              onChange={(e) => setScreenshotFile(e.target.files?.[0] ?? null)}
              className="mt-1 block w-full text-sm text-(--color-muted)"
            />
          </div>
        </fieldset>

        {/* Contact */}
        <fieldset className="space-y-3">
          <legend className="font-display text-base font-semibold text-(--color-lapis)">{tr('order', 'contactHeading')}</legend>
          <div>
            <label className={labelClass}>{tr('order', 'contactNameLabel')}</label>
            <input type="text" value={contactName} onChange={(e) => setContactName(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>{tr('order', 'contactPhoneLabel')}</label>
            <input type="text" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className={inputClass} />
          </div>
        </fieldset>

        {/* Payment */}
        <fieldset className="space-y-3">
          <legend className="font-display text-base font-semibold text-(--color-lapis)">{tr('order', 'paymentHeading')}</legend>
          <p className="text-sm text-(--color-muted)">{tr('order', 'paymentHint')}</p>

          <div className="flex gap-3">
            {(['easy_load', 'hesab_pay'] as PaymentMethod[]).map((m) => (
              <label
                key={m}
                className={`flex-1 cursor-pointer rounded-(--radius-md) border-2 px-3 py-2.5 text-center text-sm font-semibold transition-colors ${
                  paymentMethod === m ? 'border-(--color-saffron) bg-(--color-saffron)/5 text-(--color-ink)' : 'border-(--color-line) text-(--color-muted)'
                }`}
              >
                <input type="radio" name="paymentMethod" className="sr-only" checked={paymentMethod === m} onChange={() => setPaymentMethod(m)} />
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
            <input
              type="file"
              accept={ACCEPTED_FILE_EXTENSIONS}
              onChange={(e) => setPaymentProofFile(e.target.files?.[0] ?? null)}
              className="mt-1 block w-full text-sm text-(--color-muted)"
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
