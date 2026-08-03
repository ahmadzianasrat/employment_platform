import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../lib/i18n/LanguageContext';
import { useAuth } from '../../../lib/auth/AuthContext';

const inputClass =
  'w-full rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-paper-raised)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-lapis)]';
const labelClass = 'mb-1 block text-sm font-medium text-[var(--color-ink)]';

export function AuthPage() {
  const { tr } = useLanguage();
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

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
      navigate('/');
    } else {
      const { error } = await signUp(email, password);
      setSubmitting(false);
      if (error) {
        setError(error);
        return;
      }
      setInfo(tr('auth', 'checkEmail'));
      setMode('signin');
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-6 py-16">
      <h1 className="font-display text-2xl font-semibold text-[var(--color-ink)]">
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
          <p className="rounded-[var(--radius-md)] bg-[var(--color-danger)]/10 px-3 py-2 text-sm text-[var(--color-danger)]">
            {error}
          </p>
        )}
        {info && (
          <p className="rounded-[var(--radius-md)] bg-[var(--color-success)]/10 px-3 py-2 text-sm text-[var(--color-success)]">
            {info}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-[var(--radius-md)] bg-[var(--color-saffron)] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-saffron-light)] disabled:opacity-60"
        >
          {mode === 'signin' ? tr('auth', 'signInButton') : tr('auth', 'signUpButton')}
        </button>
      </form>

      <p className="mt-5 text-sm text-[var(--color-muted)]">
        {mode === 'signin' ? tr('auth', 'noAccount') : tr('auth', 'haveAccount')}{' '}
        <button
          onClick={() => {
            setMode(mode === 'signin' ? 'signup' : 'signin');
            setError(null);
            setInfo(null);
          }}
          className="font-medium text-[var(--color-lapis)] hover:underline"
        >
          {mode === 'signin' ? tr('auth', 'switchToSignUp') : tr('auth', 'switchToSignIn')}
        </button>
      </p>
    </div>
  );
}
