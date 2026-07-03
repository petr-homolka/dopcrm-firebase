/**
 * Login.jsx — přihlašovací obrazovka (B2B SaaS), Tailwind + sdílené ui/ komponenty
 *
 * Využívá services/orgAuth.js (NOVÉ schéma, 2026-07-01):
 *   - identita ověřena přes Firebase Auth (e-mail + heslo)
 *   - role/organizace načtena z Firestore users/{uid}, NIKDY z Custom Claims
 *   - po přihlášení redirect podle role (homePathForRole): superadmin/org_admin
 *     na svůj dashboard, klicova_osoba na obrazovku Dnes ("/"), ostatní
 *     (legacy user_roles účty) padají na starší /prehled.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';

import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase.js';
import { signIn, homePathForRole } from '../../services/orgAuth.js';
import { useAuthStore } from '../../store/authStore.js';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';

// ── Mapování Firebase chybových kódů na klíče překladu ─────────

const ERROR_KEY_MAP = {
  'auth/user-not-found': 'userNotFound',
  'auth/wrong-password': 'wrongPassword',
  'auth/invalid-email': 'invalidEmail',
  'auth/user-disabled': 'userDisabled',
  'auth/too-many-requests': 'tooManyRequests',
  'auth/network-request-failed': 'networkFailed',
  'auth/invalid-credential': 'invalidCredential',
};

const fieldBaseClass =
  'w-full rounded-xl bg-stone-100 py-2.5 pl-10 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-primary-600 disabled:opacity-50';
const emailFieldClass = `${fieldBaseClass} pr-4`;
const passwordFieldClass = `${fieldBaseClass} pr-10`;

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser: authUser, role: authRole, loading: authLoading } = useAuthStore();

  // Explicitní "from" (deep-link) má přednost; jinak se určí až podle role po přihlášení.
  // Bug (2026-07-02): "/" NENÍ opravdový deep-link — je to jen index route, kterou legacy
  // RequireAuth zagarduje ještě PŘED vlastním <Navigate to="/prehled">, takže by jinak KAŽDÉ
  // přihlášení (i org_admin/klíčová osoba) skončilo na "/" → legacy MVP dashboardu místo
  // správného /admin/* dashboardu dle role. Bere se proto jen skutečný hlubší odkaz.
  const rawFrom = location.state?.from?.pathname;
  const explicitFrom = rawFrom && rawFrom !== '/' ? rawFrom : undefined;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' });

  // Pokud je uživatel už přihlášen (store stihl dotáhnout roli), přesměruj okamžitě.
  useEffect(() => {
    if (!authLoading && authUser) {
      navigate(explicitFrom ?? homePathForRole(authRole), { replace: true });
    }
  }, [authLoading, authUser, authRole, explicitFrom, navigate]);

  // Validace polí před odesláním
  function validate() {
    const errs = { email: '', password: '' };
    let ok = true;

    if (!email.trim()) {
      errs.email = t('auth.login.errors.emailRequired');
      ok = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = t('auth.login.errors.emailInvalid');
      ok = false;
    }

    if (!password) {
      errs.password = t('auth.login.errors.passwordRequired');
      ok = false;
    } else if (password.length < 6) {
      errs.password = t('auth.login.errors.passwordTooShort');
      ok = false;
    }

    setFieldErrors(errs);
    return ok;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!validate()) return;

    setLoading(true);
    try {
      // signIn(): Firebase Auth. Role/organizace se čte z users/{uid} (nikdy z tokenu) —
      // authStore ji dotáhne přes onSnapshot asynchronně, ale pro okamžitý redirect
      // po loginu ji zde ještě jednou přečteme přímo (rychlejší než čekat na store).
      const user = await signIn(email.trim(), password);
      const profileSnap = await getDoc(doc(db, 'users', user.uid));
      const role = profileSnap.exists() ? profileSnap.data().role : null;
      navigate(explicitFrom ?? homePathForRole(role), { replace: true });
    } catch (err) {
      setError(t(`auth.login.errors.${ERROR_KEY_MAP[err.code] ?? 'generic'}`));
    } finally {
      setLoading(false);
    }
  }

  function handleEmailChange(e) {
    setEmail(e.target.value);
    if (fieldErrors.email) setFieldErrors((fe) => ({ ...fe, email: '' }));
    if (error) setError('');
  }

  function handlePasswordChange(e) {
    setPassword(e.target.value);
    if (fieldErrors.password) setFieldErrors((fe) => ({ ...fe, password: '' }));
    if (error) setError('');
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-stone-50 px-4 py-8">
      <div className="w-full max-w-sm">
        <Card className="p-6 sm:p-8">
          <div className="mb-6 flex flex-col items-center">
            <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 text-2xl font-semibold text-white">
              D
            </span>
            <h1 className="text-center text-lg font-semibold text-stone-800">{t('auth.login.title')}</h1>
            <p className="mt-1 text-center text-sm text-stone-500">
              {t('auth.login.subtitle')}
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-4 flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              <AlertCircle size={18} strokeWidth={1.75} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <div>
              <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-stone-700">
                {t('auth.login.emailLabel')}
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  strokeWidth={1.75}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={handleEmailChange}
                  placeholder={t('auth.login.emailPlaceholder')}
                  disabled={loading}
                  className={emailFieldClass}
                />
              </div>
              <p className="mt-1 min-h-[1rem] text-xs text-red-600">{fieldErrors.email || ' '}</p>
            </div>

            <div>
              <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium text-stone-700">
                {t('auth.login.passwordLabel')}
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  strokeWidth={1.75}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                />
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                  disabled={loading}
                  className={passwordFieldClass}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  aria-label={showPass ? t('auth.login.hidePassword') : t('auth.login.showPassword')}
                  tabIndex={-1}
                  disabled={loading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-stone-500 hover:bg-stone-200 disabled:opacity-50"
                >
                  {showPass ? (
                    <EyeOff size={18} strokeWidth={1.75} />
                  ) : (
                    <Eye size={18} strokeWidth={1.75} />
                  )}
                </button>
              </div>
              <p className="mt-1 min-h-[1rem] text-xs text-red-600">{fieldErrors.password || ' '}</p>
            </div>

            <Button type="submit" variant="primary" size="lg" disabled={loading} className="mt-1 w-full">
              {loading && <Loader2 size={18} strokeWidth={2} className="animate-spin" />}
              {loading ? t('auth.login.submitting') : t('auth.login.submit')}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-stone-500">
            {t('auth.login.forgotPassword')}
          </p>
          <p className="mt-2 text-center text-sm text-stone-700">
            {t('auth.login.noOrgPrompt')}{' '}
            <a href="/registrace" className="font-semibold text-primary-600 hover:text-primary-700">
              {t('auth.login.noOrgCta')}
            </a>
          </p>
        </Card>
      </div>
    </div>
  );
}
