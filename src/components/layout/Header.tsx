import { NavLink, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../lib/i18n/LanguageContext';
import { useAuth } from '../../lib/auth/AuthContext';
import { useIsAdmin } from '../../modules/admin/hooks/useIsAdmin';
import { LanguageSwitcher } from './LanguageSwitcher';
import { BrandMark } from './BrandMark';

export function Header() {
  const { tr } = useLanguage();
  const { user, signOut } = useAuth();
  const { isAdmin } = useIsAdmin();
  const navigate = useNavigate();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `relative py-1 text-[13px] font-semibold uppercase tracking-[0.12em] transition-colors ${
      isActive ? 'text-white' : 'text-white/60 hover:text-white/90'
    }`;

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  return (
    <header
      className="border-b-2 border-[var(--color-saffron)] shadow-[0_1px_0_rgba(0,0,0,0.15)]"
      style={{
        background: 'linear-gradient(135deg, var(--color-lapis) 0%, var(--color-lapis-dark) 100%)',
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-3.5">
        <NavLink to="/" className="flex items-center gap-2.5">
          <BrandMark className="h-7 w-7 shrink-0" />
          <span className="font-display text-[19px] font-semibold tracking-tight text-white">
            {tr('brand', 'appName')}
          </span>
        </NavLink>

        <div className="hidden items-center gap-6 sm:flex">
          <nav className="flex items-center gap-6 border-x border-white/15 px-6">
            <NavLink to="/" end className={linkClass}>
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute -top-[7px] left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[var(--color-saffron)]" />
                  )}
                  {tr('nav', 'jobs')}
                </>
              )}
            </NavLink>
            <NavLink to="/cv-builder" className={linkClass}>
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute -top-[7px] left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[var(--color-saffron)]" />
                  )}
                  {tr('nav', 'cvBuilder')}
                </>
              )}
            </NavLink>
            {user && (
              <NavLink to="/saved" className={linkClass}>
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute -top-[7px] left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[var(--color-saffron)]" />
                    )}
                    {tr('nav', 'savedJobs')}
                  </>
                )}
              </NavLink>
            )}
            {isAdmin && (
              <NavLink to="/admin" className={linkClass}>
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute -top-[7px] left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[var(--color-saffron)]" />
                    )}
                    Admin
                  </>
                )}
              </NavLink>
            )}
          </nav>

          <LanguageSwitcher />

          {user ? (
            <button
              onClick={handleSignOut}
              className="text-[13px] font-semibold uppercase tracking-[0.1em] text-white/70 hover:text-white"
            >
              {tr('nav', 'signOut')}
            </button>
          ) : (
            <NavLink
              to="/sign-in"
              className="rounded-sm border border-white/30 px-3 py-1.5 text-[13px] font-semibold uppercase tracking-[0.06em] text-white hover:border-[var(--color-saffron)] hover:text-[var(--color-saffron)]"
            >
              {tr('nav', 'signIn')}
            </NavLink>
          )}
        </div>

        <div className="flex items-center gap-2 sm:hidden">
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
