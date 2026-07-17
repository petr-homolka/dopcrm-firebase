/**
 * EPHomeScreen.jsx — domovská obrazovka externího účastníka (2026-07-06,
 * docs/domain/externi-ucastnici.md §4/§7). Vidí VÝHRADNĚ to, co má aktivně
 * povoleno (granty + časová okna) — výchozí stav je prázdný. Každé přihlášení
 * se zaznamená do neměnného auditu; vlastní audit si účastník může zobrazit.
 * Stejná obrazovka slouží i účtu dítěte (subjectKind='child').
 */

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore.js';
import { getExternalParticipant, listGrants, logEpEvent } from '../../../services/orgService.js';
import { EXTERNAL_PERMISSIONS, permissionLabel, isGrantActive } from '../../../shared/externalPermissions.js';
import { cn } from '../../../components/ui/cn.js';
import MobileTopNav from '../../ui/MobileTopNav.jsx';
import NativeHero, { HeroBody } from '../../ui/NativeHero.jsx';
import { SectionLabel, NativeEmptyState } from '../../ui/NativeBits.jsx';

export default function EPHomeScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const epId = profile?.externalParticipantId;
  const [ep, setEp] = useState(null);
  const [grants, setGrants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!epId) { setLoading(false); return; }
    logEpEvent(epId, { action: 'login' });
    Promise.all([getExternalParticipant(epId), listGrants(epId)])
      .then(([e, g]) => { setEp(e); setGrants(g); })
      .catch((err) => console.error('[EPHome] Načtení selhalo:', err))
      .finally(() => setLoading(false));
  }, [epId]);

  const activeKeys = EXTERNAL_PERMISSIONS.filter((p) => grants.some((g) => g.permissionKey === p.key && isGrantActive(g)));
  const name = profile?.displayName ?? t('m.ep.defaultName', 'Účastník');

  return (
    <div>
      <MobileTopNav variant="hero" title={t('m.ep.homeTitle', 'Doprovázení')} />
      <NativeHero
        title={t('m.ep.greeting', 'Dobrý den, {{name}}', { name: name.split(' ')[0] })}
        subtitle={ep?.childName ? <span className="inline-flex items-center rounded-full bg-white/20 px-2.5 py-1 text-[12px] font-semibold text-white">{ep.childName}</span> : null}
      />

      <HeroBody>
        <div className="p-4 pb-10">
          <SectionLabel>{t('m.ep.whatAllowed', 'Co máte povoleno')}</SectionLabel>
          {loading && <p className="py-4 text-center text-[15px] text-native-textMuted">{t('m.common.loading', 'Načítám…')}</p>}

          {!loading && activeKeys.length === 0 && (
            <NativeEmptyState
              icon={Lock}
              title={t('m.ep.emptyPermsTitle', 'Zatím žádná oprávnění')}
              description={t('m.ep.emptyPermsDesc', 'Přístup k údajům, komunikaci nebo dokumentům vám povolí klíčová osoba. Do té doby zde nic není.')}
            />
          )}

          {!loading && activeKeys.length > 0 && (
            <div className="overflow-hidden rounded-native-card bg-native-surface">
              {activeKeys.map((p, i) => (
                <div key={p.key} className={cn('flex items-center gap-3 px-4 py-3.5', i < activeKeys.length - 1 && 'border-b border-native-separator')}>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-native-primary/10 text-native-primary">
                    <ShieldCheck size={18} strokeWidth={2} />
                  </span>
                  <span className="flex-1 text-[15px] font-medium text-native-text">{permissionLabel(p.key)}</span>
                </div>
              ))}
            </div>
          )}
          <p className="mt-3 px-1 text-[13px] text-native-textMuted">
            {t('m.ep.contentNotice', 'Konkrétní obsah (dokumenty, chat, časová osa…) se zpřístupní podle povolení v dalších krocích. Vše, co v aplikaci uděláte, se zaznamenává.')}
          </p>

          <button
            type="button"
            onClick={() => navigate('/ucastnik/audit')}
            className="mt-5 flex w-full items-center gap-3 rounded-native-card bg-native-surface px-4 py-3.5 text-left active:bg-native-bg"
          >
            <ShieldCheck size={20} strokeWidth={2} className="text-native-primary" />
            <span className="flex-1 text-[15px] font-medium text-native-text">{t('m.ep.auditHistoryLink', 'Moje auditní historie')}</span>
          </button>
        </div>
      </HeroBody>
    </div>
  );
}
