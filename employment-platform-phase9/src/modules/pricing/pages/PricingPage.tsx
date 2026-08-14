import { Link } from 'react-router-dom';
import { useLanguage } from '../../../lib/i18n/LanguageContext';
import { btnPrimary, btnSecondary } from '../../../components/ui/buttonStyles';
import { IconCheck, IconWallet } from '../../../components/ui/icons';

export function PricingPage() {
  const { tr } = useLanguage();

  const includes = [1, 2, 3, 4, 5].map((n) => tr('pricing', `include${n}`));

  const tiers: { key: '1' | '3'; name: string; price: string; highlight: boolean }[] = [
    { key: '1', name: tr('pricing', 'tier1Name'), price: tr('pricing', 'tier1Price'), highlight: false },
    { key: '3', name: tr('pricing', 'tier3Name'), price: tr('pricing', 'tier3Price'), highlight: true },
  ];

  return (
    <div className="mx-auto max-w-4xl px-6 py-14">
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold text-(--color-ink)">{tr('pricing', 'title')}</h1>
        <p className="mx-auto mt-3 max-w-xl text-(--color-muted)">{tr('pricing', 'subtitle')}</p>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {tiers.map((t) => (
          <div
            key={t.key}
            className={`flex flex-col rounded-(--radius-lg) border-2 p-6 ${
              t.highlight ? 'border-(--color-saffron) bg-(--color-saffron)/5 shadow-sm' : 'border-(--color-line) bg-(--color-paper-raised)'
            }`}
          >
            {t.highlight && (
              <span className="mb-3 inline-block w-fit rounded-full bg-(--color-saffron) px-2.5 py-0.5 text-xs font-semibold text-white">
                {tr('pricing', 'perApplication')}
              </span>
            )}
            <h2 className="font-display text-xl font-semibold text-(--color-ink)">{t.name}</h2>
            <p className="mt-1 font-display text-3xl font-bold text-(--color-lapis)">{t.price}</p>
            <ul className="mt-5 space-y-2.5 text-sm text-(--color-ink)">
              {includes.map((inc) => (
                <li key={inc} className="flex gap-2">
                  <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-(--color-success)" />
                  <span>{inc}</span>
                </li>
              ))}
            </ul>
            <Link to={`/order?tier=${t.key}`} className={`${t.highlight ? btnPrimary : btnSecondary} mt-6`}>
              {tr('pricing', 'ctaButton')}
            </Link>
          </div>
        ))}
      </div>

      <p className="mx-auto mt-6 max-w-2xl text-center text-sm text-(--color-muted)">{tr('pricing', 'deliveryNote')}</p>

      <div className="mx-auto mt-12 max-w-2xl rounded-(--radius-lg) border border-(--color-line) bg-(--color-paper-raised) p-6">
        <div className="flex items-center gap-2.5">
          <IconWallet className="h-5 w-5 text-(--color-lapis)" />
          <h2 className="font-display text-lg font-semibold text-(--color-ink)">{tr('pricing', 'paymentMethodsHeading')}</h2>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <span className="rounded-(--radius-md) border border-(--color-line) bg-(--color-paper) px-3 py-1.5 text-sm font-semibold text-(--color-ink)">
            {tr('pricing', 'easyLoad')}
          </span>
          <span className="rounded-(--radius-md) border border-(--color-line) bg-(--color-paper) px-3 py-1.5 text-sm font-semibold text-(--color-ink)">
            {tr('pricing', 'hesabPay')}
          </span>
        </div>
        <p className="mt-3 text-sm text-(--color-muted)">{tr('pricing', 'paymentMethodsBody')}</p>
        <Link to="/guide" className="mt-3 inline-block text-sm font-medium text-(--color-lapis) hover:underline">
          {tr('pricing', 'faqNote')}
        </Link>
      </div>
    </div>
  );
}
