import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../lib/auth/AuthContext';
import { useLanguage } from '../../../lib/i18n/LanguageContext';
import { saveJob, unsaveJob, fetchSavedJobIds } from '../api/savedJobsApi';
import { trackEvent } from '../../../lib/analytics/ga';

// Sample/demo job ids are plain numbers ('1', '2'...) rather than real
// Supabase UUIDs, so saving is disabled for them — nothing to persist to.
function isRealJobId(id: string) {
  return id.includes('-');
}

export function SaveJobButton({ jobId, className = '' }: { jobId: string; className?: string }) {
  const { user } = useAuth();
  const { tr } = useLanguage();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user || !isRealJobId(jobId)) return;
    fetchSavedJobIds(user.id).then((ids) => setSaved(ids.has(jobId)));
  }, [user, jobId]);

  if (!isRealJobId(jobId)) return null;

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/sign-in');
      return;
    }

    setBusy(true);
    const ok = saved ? await unsaveJob(user.id, jobId) : await saveJob(user.id, jobId);
    if (ok) {
      setSaved(!saved);
      if (!saved) trackEvent({ name: 'job_saved' });
    }
    setBusy(false);
  }

  return (
    <button
      onClick={handleClick}
      disabled={busy}
      aria-pressed={saved}
      className={`rounded-(--radius-md) border px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-60 ${
        saved
          ? 'border-(--color-saffron) bg-(--color-saffron)/10 text-(--color-saffron)'
          : 'border-(--color-line) text-(--color-muted) hover:border-(--color-lapis) hover:text-(--color-lapis)'
      } ${className}`}
    >
      {saved ? `★ ${tr('jobBoard', 'saved')}` : tr('jobBoard', 'save')}
    </button>
  );
}
