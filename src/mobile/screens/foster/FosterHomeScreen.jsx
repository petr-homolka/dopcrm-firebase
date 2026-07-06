/**
 * FosterHomeScreen.jsx — domovská obrazovka pěstouna (2026-07-06,
 * docs/domain/chat-a-pestounska-appka.md). Omezená appka: pěstoun vidí
 * VÝHRADNĚ svůj profil, své svěřené děti (omezeně), dokumenty (zatím prázdné)
 * a chat s KO. NEVIDÍ spis, kalendář, jiné rodiny — routing to hlídá
 * (RequireOrgRole pestoun) a firestore.rules navíc na úrovni dat.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Baby, MessageSquare, FileText, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore.js';
import { getFoster, listChildrenByFamily } from '../../../services/orgService.js';
import { cn } from '../../../components/ui/cn.js';
import MobileTopNav from '../../ui/MobileTopNav.jsx';
import NativeHero, { HeroBody } from '../../ui/NativeHero.jsx';
import NotificationBell from '../../ui/NotificationBell.jsx';
import { SectionLabel, NativeEmptyState } from '../../ui/NativeBits.jsx';

export default function FosterHomeScreen() {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const familyId = profile?.fosterFamilyId;
  const [family, setFamily] = useState(null);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!familyId || !profile?.organizationId) { setLoading(false); return; }
    Promise.all([getFoster(familyId), listChildrenByFamily(familyId, profile.organizationId)])
      .then(([fam, kids]) => { setFamily(fam); setChildren(kids); })
      .catch((err) => console.error('[FosterHomeScreen] Načtení selhalo:', err))
      .finally(() => setLoading(false));
  }, [familyId, profile]);

  const name = profile?.displayName ?? 'Pěstoun';

  return (
    <div>
      <MobileTopNav variant="hero" title="Doprovázení" right={<NotificationBell tone="hero" />} />

      <NativeHero
        title={`Dobrý den, ${name.split(' ')[0]}`}
        subtitle={family?.name ? (
          <span className="inline-flex items-center rounded-full bg-white/20 px-2.5 py-1 text-[12px] font-semibold text-white">
            {family.name}
          </span>
        ) : null}
      />

      <HeroBody>
        <div className="p-4">
          <button
            type="button"
            onClick={() => navigate('/moje/chat')}
            className="flex w-full items-center gap-3 rounded-native-card bg-native-primary px-4 py-3.5 text-left text-white transition-transform duration-100 active:scale-[0.98]"
          >
            <MessageSquare size={22} strokeWidth={2} />
            <span className="flex-1 text-[17px] font-semibold">Napsat klíčové osobě</span>
            <ChevronRight size={20} strokeWidth={2} />
          </button>

          <SectionLabel>Moje děti</SectionLabel>
          {loading && <p className="py-4 text-center text-[15px] text-native-textMuted">Načítám…</p>}
          {!loading && children.length === 0 && (
            <p className="py-2 text-[15px] text-native-textMuted">Zatím žádné svěřené děti.</p>
          )}
          {!loading && children.length > 0 && (
            <div className="overflow-hidden rounded-native-card bg-native-surface">
              {children.map((ch, i) => (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => navigate(`/moje/deti/${ch.id}`)}
                  className="flex w-full items-center gap-3 pl-4 text-left active:bg-native-bg"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-native-primary/10 text-native-primary">
                    <Baby size={20} strokeWidth={1.75} />
                  </span>
                  <div className={cn('flex flex-1 items-center gap-2 py-3 pr-4', i < children.length - 1 && 'border-b border-native-separator')}>
                    <span className="flex-1 truncate text-[17px] font-semibold text-native-text">
                      {[ch.firstName, ch.lastName].filter(Boolean).join(' ') || 'Dítě'}
                    </span>
                    <ChevronRight size={18} strokeWidth={2} className="shrink-0 text-native-textMuted" />
                  </div>
                </button>
              ))}
            </div>
          )}

          <SectionLabel>Dokumenty</SectionLabel>
          <NativeEmptyState
            icon={FileText}
            title="Zatím žádné dokumenty"
            description="Až vám klíčová osoba pošle dokument ke schválení nebo podpisu, objeví se tady."
          />
        </div>
      </HeroBody>
    </div>
  );
}
