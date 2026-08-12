import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../lib/i18n/LanguageContext';
import { useAuth } from '../../lib/auth/AuthContext';
import { useIsAdmin } from '../../modules/admin/hooks/useIsAdmin';
import { LanguageSwitcher } from './LanguageSwitcher';
import { BrandMark } from './BrandMark';
import { IconMenu, IconClose } from '../ui/icons';

export function Header() {
  const { tr } = useLanguage();
  const { user, signOut } = useAuth();
  const { isAdmin } = useIsAdmin();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `relative py-1 text-[13px] font-semibold uppercase tracking-[0.12em] transition-colors ${
      isActive ? 'text-white' : 'text-white/60 hover:text-white/90'
    }`;

  const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block rounded-(--radius-md) px-3 py-2.5 text-[15px] font-semibold transition-colors ${
      isActive ? 'bg-white/15 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'
    }`;

  async function handleSignOut() {
    setMobileOpen(false);
    await signOut();
    navigate('/');
  }

  function closeMobile() {
    setMobileOpen(false);
  }

  return (
    <header
      className="relative border-b-2 border-(--color-saffron) bg-(--color-ink) shadow-[0_1px_0_rgba(0,0,0,0.15)]"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-3.5 sm:px-6">
        <NavLink to="/" className="flex items-center gap-2.5" onClick={closeMobile}>
          <BrandMark className="h-14 w-14 shrink-0 rounded-(--radius-md)" />
        </NavLink>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 lg:flex">
          <nav className="flex items-center gap-5 border-x border-white/15 px-5">
            <NavLink to="/" end className={linkClass}>
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute -top-[7px] left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-(--color-saffron)" />
                  )}
                  {tr('nav', 'jobs')}
                </>
              )}
            </NavLink>
            <NavLink to="/cv-builder" className={linkClass}>
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute -top-[7px] left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-(--color-saffron)" />
                  )}
                  {tr('nav', 'cvBuilder')}
                </>
              )}
            </NavLink>
            <NavLink to="/cover-letter" className={linkClass}>
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute -top-[7px] left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-(--color-saffron)" />
                  )}
                  {tr('nav', 'coverLetter')}
                </>
              )}
            </NavLink>
            <NavLink to="/blog" className={linkClass}>
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute -top-[7px] left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-(--color-saffron)" />
                  )}
                  {tr('nav', 'blog')}
                </>
              )}
            </NavLink>
            {user && (
              <NavLink to="/saved" className={linkClass}>
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute -top-[7px] left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-(--color-saffron)" />
                    )}
                    {tr('nav', 'savedJobs')}
                  </>
                )}
              </NavLink>
            )}
            {user && (
              <NavLink to="/documents" className={linkClass}>
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute -top-[7px] left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-(--color-saffron)" />
                    )}
                    {tr('nav', 'documents')}
                  </>
                )}
              </NavLink>
            )}
            {user && (
              <NavLink to="/job-alerts" className={linkClass}>
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute -top-[7px] left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-(--color-saffron)" />
                    )}
                    {tr('nav', 'alerts')}
                  </>
                )}
              </NavLink>
            )}
            {isAdmin && (
              <NavLink to="/admin" className={linkClass}>
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute -top-[7px] left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-(--color-saffron)" />
                    )}
                    {tr('nav', 'admin')}
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
              className="rounded-sm border border-white/30 px-3 py-1.5 text-[13px] font-semibold uppercase tracking-[0.06em] text-white hover:border-(--color-saffron) hover:text-(--color-saffron)"
            >
              {tr('nav', 'signIn')}
            </NavLink>
          )}
        </div>

        {/* Mobile controls: sign-in stays visible, everything else lives behind the menu button */}
        <div className="flex items-center gap-2 lg:hidden">
          {!user && (
            <NavLink
              to="/sign-in"
              onClick={closeMobile}
              className="rounded-sm border border-white/30 px-3 py-1.5 text-[13px] font-semibold uppercase tracking-[0.06em] text-white hover:border-(--color-saffron) hover:text-(--color-saffron)"
            >
              {tr('nav', 'signIn')}
            </NavLink>
          )}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={mobileOpen}
            className="flex h-9 w-9 items-center justify-center rounded-(--radius-md) text-white hover:bg-white/10"
          >
            {mobileOpen ? <IconClose /> : <IconMenu />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="border-t border-white/15 px-4 pb-4 pt-2 lg:hidden">
          <nav className="flex flex-col gap-1">
            <NavLink to="/" end className={mobileLinkClass} onClick={closeMobile}>
              {tr('nav', 'jobs')}
            </NavLink>
            <NavLink to="/cv-builder" className={mobileLinkClass} onClick={closeMobile}>
              {tr('nav', 'cvBuilder')}
            </NavLink>
            <NavLink to="/cover-letter" className={mobileLinkClass} onClick={closeMobile}>
              {tr('nav', 'coverLetter')}
            </NavLink>
            <NavLink to="/blog" className={mobileLinkClass} onClick={closeMobile}>
              {tr('nav', 'blog')}
            </NavLink>
            {user && (
              <NavLink to="/saved" className={mobileLinkClass} onClick={closeMobile}>
                {tr('nav', 'savedJobs')}
              </NavLink>
            )}
            {user && (
              <NavLink to="/documents" className={mobileLinkClass} onClick={closeMobile}>
                {tr('nav', 'documents')}
              </NavLink>
            )}
            {user && (
              <NavLink to="/job-alerts" className={mobileLinkClass} onClick={closeMobile}>
                {tr('nav', 'alerts')}
              </NavLink>
            )}
            {isAdmin && (
              <NavLink to="/admin" className={mobileLinkClass} onClick={closeMobile}>
                {tr('nav', 'admin')}
              </NavLink>
            )}
          </nav>

          <div className="mt-3 flex items-center justify-between border-t border-white/15 pt-3">
            <LanguageSwitcher />
            {user ? (
              <button
                onClick={handleSignOut}
                className="text-[13px] font-semibold uppercase tracking-[0.1em] text-white/70 hover:text-white"
              >
                {tr('nav', 'signOut')}
              </button>
            ) : null}
          </div>
        </div>
      )}
    </header>
  );
}
