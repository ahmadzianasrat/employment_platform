import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../lib/i18n/LanguageContext';
import { useAuth } from '../../../lib/auth/AuthContext';
import { trackEvent } from '../../../lib/analytics/ga';

const inputClass =
  'w-full rounded-(--radius-md) border border-(--color-line) bg-(--color-paper-raised) px-3 py-2.5 text-sm outline-none focus:border-(--color-lapis)';
const labelClass = 'mb-1 block text-sm font-medium text-(--color-ink)';

export function AuthPage() {
  const { tr } = useLanguage();
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // OrderPage redirects here with state.redirectTo when a signed-out user
  // tries to submit a paid-service request, so they land back on the form
  // (not the homepage) right after signing in.
  const redirectTo = (location.state as { redirectTo?: string } | null)?.redirectTo ?? '/';

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setSubmitting(true);

    if (mode === 'signin') {
      const { error } = await signIn(email, password);
      setSubmitting(false);
      if (error) {
        setError(error);
        return;
      }
      trackEvent({ name: 'sign_in_completed' });
      navigate(redirectTo);
    } else {
      const { error } = await signUp(email, password);
      setSubmitting(false);
      if (error) {
        setError(error);
        return;
      }
      trackEvent({ name: 'sign_up_completed' });
      setInfo(tr('auth', 'checkEmail'));
      setMode('signin');
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-6 py-16">
      <h1 className="font-display text-2xl font-semibold text-(--color-ink)">
        {mode === 'signin' ? tr('auth', 'signInTitle') : tr('auth', 'signUpTitle')}
      </h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className={labelClass}>{tr('auth', 'email')}</label>
          <input
            type="email"
            required
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>{tr('auth', 'password')}</label>
          <input
            type="password"
            required
            minLength={6}
            className={inputClass}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <p className="rounded-(--radius-md) bg-(--color-danger)/10 px-3 py-2 text-sm text-(--color-danger)">
            {error}
          </p>
        )}
        {info && (
          <p className="rounded-(--radius-md) bg-(--color-success)/10 px-3 py-2 text-sm text-(--color-success)">
            {info}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-(--radius-md) bg-(--color-saffron) px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-(--color-saffron-light) disabled:opacity-60"
        >
          {mode === 'signin' ? tr('auth', 'signInButton') : tr('auth', 'signUpButton')}
        </button>
      </form>

      <p className="mt-5 text-sm text-(--color-muted)">
        {mode === 'signin' ? tr('auth', 'noAccount') : tr('auth', 'haveAccount')}{' '}
        <button
          onClick={() => {
            setMode(mode === 'signin' ? 'signup' : 'signin');
            setError(null);
            setInfo(null);
          }}
          className="font-medium text-(--color-lapis) hover:underline"
        >
          {mode === 'signin' ? tr('auth', 'switchToSignUp') : tr('auth', 'switchToSignIn')}
        </button>
      </p>
    </div>
  );
}
