import { getSourceTrustLevel } from '../data/sourceTrust';
import { IconShieldCheck } from '../../../components/ui/icons';

export function SourceBadge({ source, label }: { source: string; label: string }) {
  const trust = getSourceTrustLevel(source);

  if (trust === 'verified') {
    return (
      <span
        title="Sourced from an established NGO/UN job aggregator"
        className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-(--color-success)/10 px-2 py-0.5 text-xs font-medium text-(--color-success)"
      >
        <IconShieldCheck className="h-3 w-3" />
        {label}
      </span>
    );
  }

  if (trust === 'manual') {
    return (
      <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-(--color-saffron)/10 px-2 py-0.5 text-xs font-medium text-(--color-saffron)">
        {label}
      </span>
    );
  }

  return (
    <span className="whitespace-nowrap rounded-full bg-(--color-lapis)/10 px-2 py-0.5 text-xs font-medium text-(--color-lapis)">
      {label}
    </span>
  );
}
