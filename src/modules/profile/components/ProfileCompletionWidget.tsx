import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../lib/auth/AuthContext';
import { useLanguage } from '../../../lib/i18n/LanguageContext';
import { getProfileCompletion } from '../api/profileCompletionApi';
import type { ProfileCompletion } from '../api/profileCompletionApi';
import { IconCheck } from '../../../components/ui/icons';

export function ProfileCompletionWidget() {
  const { user } = useAuth();
  const { tr } = useLanguage();
  const [completion, setCompletion] = useState<ProfileCompletion | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!user) return;
    getProfileCompletion(user.id).then(setCompletion);
  }, [user]);

  if (!user || !completion || dismissed) return null;

  const docsComplete = completion.documentTypesUploaded >= completion.documentTypesTotal;
  if (completion.cvComplete && docsComplete) return null; // nothing to nudge about

  const docPercent = Math.round((completion.documentTypesUploaded / completion.documentTypesTotal) * 100);

  return (
    <div className="mb-6 rounded-(--radius-lg) border border-(--color-line) bg-(--color-paper-raised) p-4 sm:flex sm:items-center sm:justify-between sm:gap-4">
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-(--color-ink)">{tr('profile', 'title')}</h3>
        <p className="mt-0.5 text-xs text-(--color-muted)">{tr('profile', 'subtitle')}</p>

        <div className="mt-3 flex flex-wrap gap-4">
          <Link to="/cv-builder" className="flex items-center gap-2 text-sm hover:underline">
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full ${
                completion.cvComplete ? 'bg-(--color-success) text-white' : 'border border-(--color-line)'
              }`}
            >
              {completion.cvComplete && <IconCheck className="h-3 w-3" />}
            </span>
            <span className={completion.cvComplete ? 'text-(--color-muted) line-through' : 'text-(--color-ink)'}>
              {tr('profile', 'cvBuilder')}
            </span>
          </Link>

          <Link to="/documents" className="flex items-center gap-2 text-sm hover:underline">
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full ${
                docsComplete ? 'bg-(--color-success) text-white' : 'border border-(--color-line)'
              }`}
            >
              {docsComplete && <IconCheck className="h-3 w-3" />}
            </span>
            <span className={docsComplete ? 'text-(--color-muted) line-through' : 'text-(--color-ink)'}>
              {tr('profile', 'documentsLabel')} — {completion.documentTypesUploaded}/{completion.documentTypesTotal} ({docPercent}%)
            </span>
          </Link>
        </div>
      </div>

      <button
        onClick={() => setDismissed(true)}
        className="mt-3 shrink-0 text-xs font-medium text-(--color-muted) hover:text-(--color-ink) sm:mt-0"
      >
        {tr('profile', 'dismiss')}
      </button>
    </div>
  );
}
