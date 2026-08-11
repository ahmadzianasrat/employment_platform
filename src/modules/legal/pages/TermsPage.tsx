import { Link } from 'react-router-dom';

// English-only for the same reason as PrivacyPolicyPage — see that file's
// top comment.

export function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <Link to="/" className="text-sm font-medium text-(--color-lapis) hover:underline">
        ← Hamqar
      </Link>
      <h1 className="mt-4 font-display text-2xl font-semibold text-(--color-ink)">Terms of Use</h1>
      <p className="mt-1 text-sm text-(--color-muted)">
        This is a starting draft, not a substitute for legal review. It should be checked against applicable
        law before you rely on it.
      </p>

      <div className="mt-6 space-y-5 text-sm leading-relaxed text-(--color-ink)">
        <section>
          <h2 className="font-display text-base font-semibold text-(--color-lapis)">What Hamqar is</h2>
          <p className="mt-1">
            Hamqar aggregates publicly available job listings from a number of job boards, and provides tools
            to help you apply: a CV builder, a cover letter builder, and a private document vault. We are not
            the employer for any listing shown on this site, and we do not guarantee the accuracy,
            availability, or legitimacy of any listing — always verify details on the original posting before
            applying or sharing sensitive information.
          </p>
        </section>

        <section>
          <h2 className="font-display text-base font-semibold text-(--color-lapis)">Your account</h2>
          <p className="mt-1">
            You're responsible for keeping your account credentials secure and for the accuracy of the
            information you provide, including anything in your CV, cover letter, or uploaded documents.
          </p>
        </section>

        <section>
          <h2 className="font-display text-base font-semibold text-(--color-lapis)">Acceptable use</h2>
          <p className="mt-1">
            Don't use Hamqar to upload documents that aren't yours, to impersonate someone else, or to misuse
            the platform in a way that could harm other users or the service.
          </p>
        </section>

        <section>
          <h2 className="font-display text-base font-semibold text-(--color-lapis)">No warranty</h2>
          <p className="mt-1">
            Hamqar is provided as-is. We do our best to keep listings and generated documents accurate and the
            service available, but we can't guarantee uninterrupted access or that every listing is
            up to date.
          </p>
        </section>

        <section>
          <h2 className="font-display text-base font-semibold text-(--color-lapis)">Changes</h2>
          <p className="mt-1">
            We may update these terms as the platform evolves. Continued use of Hamqar after a change means
            you accept the updated terms.
          </p>
        </section>

        <section>
          <h2 className="font-display text-base font-semibold text-(--color-lapis)">Contact</h2>
          <p className="mt-1">
            Questions? Email{' '}
            <a href="mailto:support@hamqar.com" className="text-(--color-lapis) hover:underline">
              support@hamqar.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
