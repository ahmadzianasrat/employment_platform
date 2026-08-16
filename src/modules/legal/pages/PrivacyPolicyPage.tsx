import { Link } from 'react-router-dom';
import { IconMail, IconWhatsapp } from '../../../components/ui/icons';
import { SUPPORT_EMAIL, WHATSAPP_URL, WHATSAPP_NUMBER_DISPLAY } from '../../../lib/config/channelLinks';
import { Ltr } from '../../../components/ui/Ltr';

// English-only, deliberately — unlike the rest of the app's UI copy,
// legal text carries real liability risk if machine/casually translated
// and something ends up meaning something subtly different in Pashto or
// Dari. This should get a proper professional translation before that
// matters, rather than an approximate one now. See CHANGES.md.

export function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <Link to="/" className="text-sm font-medium text-(--color-lapis) hover:underline">
        ← Hamqar
      </Link>
      <h1 className="mt-4 font-display text-2xl font-semibold text-(--color-ink)">Privacy Policy</h1>
      <p className="mt-1 text-sm text-(--color-muted)">
        This is a starting draft, not a substitute for legal review. It should be checked against applicable
        law before you rely on it.
      </p>

      <div className="mt-6 space-y-5 text-sm leading-relaxed text-(--color-ink)">
        <section>
          <h2 className="font-display text-base font-semibold text-(--color-lapis)">What we collect</h2>
          <p className="mt-1">
            When you create an account, we collect your email address. If you use the CV builder, cover
            letter builder, or document vault, we store the information you enter or upload — this can
            include your name, contact details, work history, and scans of identity documents such as ID
            cards, passports, or diplomas, depending on what you choose to upload. Your Profile page also
            lets you save a mobile and/or WhatsApp number, stored separately from any contact number you
            give on a specific order. If you submit a request for our paid application service, we also
            store the job link(s) or screenshot(s) you send us, your contact phone number, and the payment
            details you provide (payment method, sender number, account owner name, and a screenshot of the
            transaction) so we can confirm your payment and prepare your package — and, once we finish a
            job in your package, the delivered CV and cover letter files themselves, which stay visible on
            your Profile page for you to download.
          </p>
        </section>

        <section>
          <h2 className="font-display text-base font-semibold text-(--color-lapis)">How it's stored</h2>
          <p className="mt-1">
            Your data is stored with Supabase, our database and file storage provider. Uploaded documents,
            and any job link, screenshot, or payment proof you submit with a paid-service request, are
            private to your account — other users cannot see them. Site administrators can view them to
            verify your documents and your payment, and to prepare your application package, but cannot
            upload, edit, or delete your files on your behalf.
          </p>
        </section>

        <section>
          <h2 className="font-display text-base font-semibold text-(--color-lapis)">How it's used</h2>
          <p className="mt-1">
            We use your information to operate the site: generating your CV and cover letter PDFs, storing
            your documents, and — if you request our paid service — confirming your payment and preparing
            the customized CV, cover letter, and document package for the job you're applying to. We do not
            sell your data to third parties.
          </p>
        </section>

        <section>
          <h2 className="font-display text-base font-semibold text-(--color-lapis)">Analytics</h2>
          <p className="mt-1">
            If enabled, we use Google Analytics to understand how the site is used (which pages are visited,
            roughly how many people use the site) so we can improve it. This does not include the contents of
            your CV, cover letter, or uploaded documents.
          </p>
        </section>

        <section>
          <h2 className="font-display text-base font-semibold text-(--color-lapis)">Your choices</h2>
          <p className="mt-1">
            You can remove individual documents or edit your CV and cover letter at any time from within the
            app. Submitted paid-service requests can't be edited or deleted from within the app once sent,
            to keep the payment record clear — contact us if one needs to change. To close your account
            entirely or request removal of your data, message us on WhatsApp at{' '}
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-(--color-lapis) hover:underline">
              <IconWhatsapp className="h-3.5 w-3.5" />
              <Ltr>{WHATSAPP_NUMBER_DISPLAY}</Ltr>
            </a>{' '}
            or email{' '}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="inline-flex items-center gap-1 text-(--color-lapis) hover:underline">
              <IconMail className="h-3.5 w-3.5" />
              {SUPPORT_EMAIL}
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="font-display text-base font-semibold text-(--color-lapis)">Contact</h2>
          <p className="mt-1">
            Questions about this policy? WhatsApp is the fastest way to reach us at{' '}
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-(--color-lapis) hover:underline">
              <IconWhatsapp className="h-3.5 w-3.5" />
              <Ltr>{WHATSAPP_NUMBER_DISPLAY}</Ltr>
            </a>
            , or email{' '}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="inline-flex items-center gap-1 text-(--color-lapis) hover:underline">
              <IconMail className="h-3.5 w-3.5" />
              {SUPPORT_EMAIL}
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
