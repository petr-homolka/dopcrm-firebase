/**
 * RegisterPage.jsx — veřejná registrace organizace (2026-07-02)
 *
 * Kdokoli si tu založí VLASTNÍ organizaci a stane se jejím zástupcem
 * (role org_admin) — bez zásahu Superadmina, viz registrationService.js.
 * Veřejná route (`/registrace`), stejný vizuální jazyk jako Login.jsx.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';

import { registerOrganization } from '../../services/registrationService.js';
import { isSlugAvailable } from '../../services/orgService.js';
import { dashboardPathForRole } from '../../services/orgAuth.js';
import { slugify } from '../../shared/slugUtils.js';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import SlugField from '../../components/ui/SlugField.jsx';

const inputClass =
  'w-full rounded-xl bg-stone-100 px-4 py-2.5 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-primary-600 disabled:opacity-50';
const labelClass = 'mb-1 block text-xs font-medium text-stone-500';
const sectionLabelClass = 'text-xs font-semibold uppercase tracking-wide text-stone-400';

const ERROR_KEY_MAP = {
  'auth/email-already-in-use': 'emailInUse',
  'auth/invalid-email': 'invalidEmail',
  'auth/weak-password': 'weakPassword',
  'auth/network-request-failed': 'networkFailed',
};

const emptyForm = {
  orgName: '', slug: '', ico: '', dataBoxId: '',
  sidloStreet: '', sidloCity: '', sidloZip: '',
  sameAsSidlo: true,
  provStreet: '', provCity: '', provZip: '',
  zFirstName: '', zLastName: '', zFunkce: 'Zástupce organizace', zRc: '', zPhone: '',
  email: '', password: '',
};

function Field({ label, colSpan, ...props }) {
  return (
    <label className={colSpan ? `block ${colSpan}` : 'block'}>
      <span className={labelClass}>{label}</span>
      <input className={inputClass} {...props} />
    </label>
  );
}

export default function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [slugTouched, setSlugTouched] = useState(false);
  const [slugStatus, setSlugStatus] = useState('idle');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function updateForm(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function updateOrgName(e) {
    const orgName = e.target.value;
    setForm((f) => ({ ...f, orgName, slug: slugTouched ? f.slug : slugify(orgName) }));
  }

  function updateSlug(slug) {
    setSlugTouched(true);
    setForm((f) => ({ ...f, slug }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.orgName.trim() || !form.zFirstName.trim() || !form.zLastName.trim() || !form.email.trim() || form.password.length < 6) {
      setError(t('auth.register.errors.requiredFields'));
      return;
    }
    if (slugStatus !== 'ok') {
      setError(t('auth.register.errors.slugInvalid'));
      return;
    }

    setSubmitting(true);
    try {
      const { role } = await (async () => {
        await registerOrganization({
          orgName: form.orgName.trim(),
          slug: form.slug,
          ico: form.ico.trim(),
          dataBoxId: form.dataBoxId.trim(),
          sidlo: { street: form.sidloStreet.trim(), city: form.sidloCity.trim(), zip: form.sidloZip.trim() },
          provozovna: form.sameAsSidlo ? null : { street: form.provStreet.trim(), city: form.provCity.trim(), zip: form.provZip.trim() },
          zastupce: { firstName: form.zFirstName.trim(), lastName: form.zLastName.trim(), funkce: form.zFunkce.trim(), rc: form.zRc.trim(), phone: form.zPhone.trim() },
          email: form.email.trim(),
          password: form.password,
        });
        return { role: 'org_admin' };
      })();
      navigate(dashboardPathForRole(role), { replace: true });
    } catch (err) {
      console.error('[RegisterPage] registerOrganization selhalo:', err);
      setError(t(`auth.register.errors.${ERROR_KEY_MAP[err.code] ?? 'generic'}`));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-stone-50 px-4 py-8">
      <div className="w-full max-w-lg">
        <Card className="p-6 sm:p-8">
          <div className="mb-6 flex flex-col items-center gap-2">
            <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-600 text-2xl font-semibold text-white">
              D
            </span>
            <h1 className="text-center text-lg font-semibold text-stone-800">{t('auth.register.title')}</h1>
            <p className="text-center text-sm text-stone-500">
              {t('auth.register.subtitle')}
            </p>
          </div>

          {error && (
            <div role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <p className={sectionLabelClass}>{t('auth.register.sectionOrganization')}</p>
            <Field label={t('auth.register.orgName')} value={form.orgName} onChange={updateOrgName} required disabled={submitting} autoFocus />
            <SlugField
              value={form.slug}
              onChange={updateSlug}
              onStatusChange={setSlugStatus}
              checkAvailable={isSlugAvailable}
              disabled={submitting}
            />
            <div className="grid grid-cols-2 gap-3">
              <Field label={t('auth.register.ico')} value={form.ico} onChange={updateForm('ico')} disabled={submitting} />
              <Field label={t('auth.register.dataBoxId')} value={form.dataBoxId} onChange={updateForm('dataBoxId')} disabled={submitting} />
            </div>

            <div className="h-px bg-stone-100" />
            <p className={sectionLabelClass}>{t('auth.register.sectionSidlo')}</p>
            <Field label={t('auth.register.street')} value={form.sidloStreet} onChange={updateForm('sidloStreet')} disabled={submitting} />
            <div className="grid grid-cols-3 gap-3">
              <Field label={t('auth.register.city')} colSpan="col-span-2" value={form.sidloCity} onChange={updateForm('sidloCity')} disabled={submitting} />
              <Field label={t('auth.register.zip')} value={form.sidloZip} onChange={updateForm('sidloZip')} disabled={submitting} />
            </div>

            <label className="flex items-center gap-2.5 text-sm text-stone-700">
              <input
                type="checkbox"
                checked={form.sameAsSidlo}
                onChange={(e) => setForm((f) => ({ ...f, sameAsSidlo: e.target.checked }))}
                disabled={submitting}
                className="h-4 w-4 rounded border-0 bg-stone-100 text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
              {t('auth.register.sameAsSidlo')}
            </label>

            {!form.sameAsSidlo && (
              <>
                <p className={sectionLabelClass}>{t('auth.register.sectionProvozovna')}</p>
                <Field label={t('auth.register.street')} value={form.provStreet} onChange={updateForm('provStreet')} disabled={submitting} />
                <div className="grid grid-cols-3 gap-3">
                  <Field label={t('auth.register.city')} colSpan="col-span-2" value={form.provCity} onChange={updateForm('provCity')} disabled={submitting} />
                  <Field label={t('auth.register.zip')} value={form.provZip} onChange={updateForm('provZip')} disabled={submitting} />
                </div>
              </>
            )}

            <div className="h-px bg-stone-100" />
            <p className={sectionLabelClass}>{t('auth.register.sectionZastupce')}</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label={t('auth.register.firstName')} value={form.zFirstName} onChange={updateForm('zFirstName')} required disabled={submitting} />
              <Field label={t('auth.register.lastName')} value={form.zLastName} onChange={updateForm('zLastName')} required disabled={submitting} />
            </div>
            <Field label={t('auth.register.funkce')} value={form.zFunkce} onChange={updateForm('zFunkce')} disabled={submitting} />
            <div className="grid grid-cols-2 gap-3">
              <Field label={t('auth.register.rc')} placeholder={t('auth.register.rcPlaceholder')} value={form.zRc} onChange={updateForm('zRc')} disabled={submitting} />
              <Field label={t('auth.register.phone')} value={form.zPhone} onChange={updateForm('zPhone')} disabled={submitting} />
            </div>
            <Field label={t('auth.register.email')} type="email" value={form.email} onChange={updateForm('email')} required disabled={submitting} />
            <div>
              <Field label={t('auth.register.password')} type="password" value={form.password} onChange={updateForm('password')} required disabled={submitting} />
              <p className="mt-1 text-xs text-stone-400">{t('auth.register.passwordHint')}</p>
            </div>

            <Button type="submit" size="lg" disabled={submitting || slugStatus !== 'ok'} className="mt-1 w-full">
              {submitting && <Loader2 size={18} className="animate-spin" />}
              {submitting ? t('auth.register.submitting') : t('auth.register.submit')}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-stone-500">
            {t('auth.register.hasAccountPrompt')}{' '}
            <a href="/login" className="font-semibold text-primary-600 no-underline">
              {t('auth.register.loginCta')}
            </a>
          </p>
        </Card>
      </div>
    </div>
  );
}
