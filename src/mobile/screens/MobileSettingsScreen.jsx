/**
 * MobileSettingsScreen.jsx — Nastavení, čistě mobilní (STRICT UI/UX DESIGN
 * MANDATE, 2026-07-05/06). Dřív `/nastaveni` vedlo i na mobilu na starou
 * legacy `Layout.jsx` (Sekce A sidebar) MIMO AdminLayout/MobileShell — bez
 * spodního tab baru, uživatel z Profilu spadl mimo appku. Opraveno zapojením
 * pod Responsive stejně jako ostatní /admin-přilehlé trasy.
 *
 * Jediné reálné nastavení dnes je adresa organizace (org_admin) — žádná
 * on/off pole v datovém modelu neexistují, proto zde není NativeSwitch:
 * nebyl by čím řízen (viz NativeSwitch.jsx, prozatím nevyužitý primitiv).
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings as SettingsIcon, Check, X, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';
import { getOrganization, isSlugAvailable, changeOrganizationSlug } from '../../services/orgService.js';
import { sanitizeSlugInput } from '../../shared/slugUtils.js';
import useSlugStatus from '../../shared/useSlugStatus.js';
import MobileTopNav from '../ui/MobileTopNav.jsx';
import NativeButton from '../ui/NativeButton.jsx';
import { NativeFormGroup, NativeFormRow, RowInput } from '../ui/NativeFormRow.jsx';

const STATUS_ICON = {
  checking: <Loader2 size={16} className="animate-spin text-native-textMuted" />,
  ok: <Check size={16} className="text-native-primary" />,
  taken: <X size={16} className="text-native-danger" />,
  invalid: <X size={16} className="text-native-danger" />,
};
const HINT_TONE = { ok: 'muted', taken: 'danger', invalid: 'danger', checking: 'muted', idle: 'muted' };

export default function MobileSettingsScreen() {
  const { t } = useTranslation();
  const { role, organizationId } = useAuthStore();
  const canManage = role === 'org_admin';

  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [slug, setSlug] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const { status, message } = useSlugStatus(slug, org?.slug ?? '', isSlugAvailable);

  const load = useCallback(async () => {
    if (!organizationId) { setLoading(false); return; }
    setLoading(true);
    try {
      const data = await getOrganization(organizationId);
      setOrg(data);
      setSlug(data?.slug ?? '');
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => { load(); }, [load]);

  async function handleSave() {
    if (status !== 'ok') return;
    setSaving(true);
    setSaveMessage('');
    try {
      await changeOrganizationSlug(organizationId, slug);
      setSaveMessage(t('m.settings.slugSaved', 'Adresa organizace byla uložena.'));
      await load();
    } catch (err) {
      setSaveMessage(err.message ?? t('m.settings.saveFailed', 'Uložení se nezdařilo.'));
    } finally {
      setSaving(false);
    }
  }

  if (!canManage) {
    return (
      <div>
        <MobileTopNav title={t('m.settings.title', 'Nastavení')} />
        <div className="mx-4 mt-6 flex flex-col items-center gap-2 rounded-native-card bg-native-surface py-10 text-center">
          <SettingsIcon size={28} strokeWidth={1.75} className="text-native-textMuted" />
          <p className="text-[15px] font-medium text-native-text">{t('m.settings.orgSettings', 'Nastavení organizace')}</p>
          <p className="px-6 text-[14px] text-native-textMuted">
            {t('m.settings.adminOnly', 'Tuto sekci může upravovat pouze administrátor organizace.')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <MobileTopNav title={t('m.settings.title', 'Nastavení')} />

      {loading ? (
        <p className="py-16 text-center text-[15px] text-native-textMuted">{t('m.settings.loading', 'Načítám…')}</p>
      ) : (
        <div className="flex flex-col gap-4 px-4 pt-4">
          <p className="text-[15px] font-semibold text-native-text">{org?.name}</p>

          <NativeFormGroup>
            {/* Široký vlastní obsah (prefix + input + ikona) se do horizontálního
                řádku (v4) nevejde → stacked. RowInput je od v4 zarovnaný doprava;
                slug musí navazovat na prefix, proto !text-left (cn třídy nemerguje). */}
            <NativeFormRow label={t('m.settings.orgAddress', 'Adresa organizace')} isLast stacked hint={message} hintTone={HINT_TONE[status]}>
              <div className="flex items-center gap-2">
                <span className="shrink-0 text-[16px] text-native-textMuted">doprovazeni.com/</span>
                <RowInput className="!text-left" value={slug} onChange={(e) => setSlug(sanitizeSlugInput(e.target.value))} disabled={saving} placeholder={t('m.settings.slugPlaceholder', 'nazev-organizace')} />
                {STATUS_ICON[status]}
              </div>
            </NativeFormRow>
          </NativeFormGroup>

          {saveMessage && <p className="text-[13px] text-native-textMuted">{saveMessage}</p>}

          <NativeButton className="h-12" disabled={saving || status !== 'ok' || slug === org?.slug} onClick={handleSave}>
            {saving ? t('m.settings.saving', 'Ukládám…') : t('m.settings.saveAddress', 'Uložit adresu')}
          </NativeButton>
        </div>
      )}
    </div>
  );
}
