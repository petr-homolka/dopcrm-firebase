/**
 * MobileFamiliesScreen.jsx — Rodiny jako titulní stránka lidí (Lidl v4,
 * 2026-07-06, bod 5 zpětné vazby): segmenty Rodiny / Pěstouni / Děti,
 * seskupování rodin (abecedně / město / druh PP / poslední návštěva —
 * volba se pamatuje), bohatší řádky (město, druh PP, termín poslední
 * návštěvy s varováním po 45 dnech) a session cache proti pomalému
 * načítání při každém návratu na tab (stale-while-revalidate).
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight, Users, SlidersHorizontal } from 'lucide-react';
import Avatar from '../../components/ui/Avatar.jsx';
import { cn } from '../../components/ui/cn.js';
import { useAuthStore } from '../../store/authStore.js';
import { listFostersAssignedTo, listFostersByOrg, listChildrenByOrg } from '../../services/orgService.js';
import { careLabel } from '../../shared/domainConstants.js';
import MobileTopNav from '../ui/MobileTopNav.jsx';
import NativeSegmented from '../ui/NativeSegmented.jsx';
import NativeSheet from '../ui/NativeSheet.jsx';
import { NativeEmptyState, SectionLabel } from '../ui/NativeBits.jsx';
import {
  GROUP_OPTIONS, GROUP_STORAGE_KEY, cityFromAddress, lastVisitInfo, groupFamilies, cacheGet, cacheSet,
} from './families/familiesShared.js';
import { FostersList, ChildrenList } from './families/MobilePeopleTabs.jsx';

const TABS = [
  { value: 'rodiny', label: 'Rodiny' },
  { value: 'pestouni', label: 'Pěstouni' },
  { value: 'deti', label: 'Děti' },
];

function FamilyRow({ family, onClick, isLast }) {
  const { t } = useTranslation();
  const visit = lastVisitInfo(family);
  const city = cityFromAddress(family.address);
  return (
    <button type="button" onClick={onClick} className="flex w-full items-center gap-3 pl-4 text-left active:bg-native-bg">
      <Avatar name={family.name} size="lg" tone="native" />
      <div className={cn('flex min-w-0 flex-1 items-center gap-2 py-3 pr-4', !isLast && 'border-b border-native-separator')}>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[17px] font-semibold text-native-text">{family.name || t('m.families.noName', '(bez jména)')}</p>
          <p className="truncate text-[13px] text-native-textMuted">
            {[city, careLabel(family.careType)].filter(Boolean).join(' · ')}
          </p>
        </div>
        <span className={cn('shrink-0 text-[12px] font-medium', visit.overdue ? 'text-native-warning' : 'text-native-textMuted')}>
          {visit.label}
        </span>
        <ChevronRight size={18} strokeWidth={2} className="shrink-0 text-native-textMuted" />
      </div>
    </button>
  );
}

export default function MobileFamiliesScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role, organizationId, currentUser } = useAuthStore();
  const cacheKey = `${organizationId}:${role}:${currentUser?.uid}`;
  const [tab, setTab] = useState('rodiny');
  const [families, setFamilies] = useState(() => cacheGet(`fam:${cacheKey}`) ?? []);
  const [childrenList, setChildrenList] = useState(() => cacheGet(`chl:${cacheKey}`) ?? []);
  const [loading, setLoading] = useState(families.length === 0);
  const [query, setQuery] = useState('');
  const [groupBy, setGroupBy] = useState(() => localStorage.getItem(GROUP_STORAGE_KEY) ?? 'abc');
  const [groupSheetOpen, setGroupSheetOpen] = useState(false);

  const load = useCallback(async () => {
    if (!organizationId) return;
    if (cacheGet(`fam:${cacheKey}`) === null) setLoading(true);
    try {
      const data = role === 'klicova_osoba'
        ? await listFostersAssignedTo(currentUser.uid, organizationId)
        : await listFostersByOrg(organizationId);
      setFamilies(data);
      cacheSet(`fam:${cacheKey}`, data);
    } finally {
      setLoading(false);
    }
  }, [organizationId, role, currentUser, cacheKey]);

  useEffect(() => { load(); }, [load]);

  // Děti se dotahují až při prvním přepnutí na tab Děti (org dotaz).
  useEffect(() => {
    if (tab !== 'deti' || !organizationId || cacheGet(`chl:${cacheKey}`)?.length) return;
    listChildrenByOrg(organizationId)
      .then((all) => {
        const mine = role === 'klicova_osoba'
          ? all.filter((ch) => families.some((f) => f.id === ch.fosterFamilyId))
          : all;
        setChildrenList(mine);
        cacheSet(`chl:${cacheKey}`, mine);
      })
      .catch((err) => console.error('[MobileFamiliesScreen] Načtení dětí selhalo:', err));
  }, [tab, organizationId, role, families, cacheKey]);

  const q = query.trim().toLowerCase();
  const filtered = families.filter((f) => f.name?.toLowerCase().includes(q));
  const groups = groupFamilies(filtered, groupBy, careLabel);
  const groupLabel = GROUP_OPTIONS.find((o) => o.value === groupBy)?.label ?? t('m.families.groupAbc', 'Abecedně');

  const fosters = families
    .flatMap((f) => (f.fosters ?? []).map((p) => ({ ...p, familyId: f.id, familyName: f.name })))
    .filter((p) => p.name?.toLowerCase().includes(q))
    .sort((a, b) => a.name.localeCompare(b.name, 'cs'));
  const filteredChildren = childrenList
    .filter((ch) => `${ch.firstName ?? ''} ${ch.lastName ?? ''}`.toLowerCase().includes(q))
    .sort((a, b) => (a.lastName ?? '').localeCompare(b.lastName ?? '', 'cs'));
  const familiesById = Object.fromEntries(families.map((f) => [f.id, f]));

  function chooseGroup(value) {
    setGroupBy(value);
    localStorage.setItem(GROUP_STORAGE_KEY, value);
    setGroupSheetOpen(false);
  }

  return (
    <div className="pb-6">
      <MobileTopNav title={t('m.families.title', 'Rodiny')} />

      <NativeSegmented items={TABS} value={tab} onChange={setTab} />

      <div className="flex items-center gap-2 px-4 pb-2">
        <div className="relative flex-1">
          <Search size={16} strokeWidth={2} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-native-textMuted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('m.families.searchPlaceholder', 'Vyhledávání')}
            className="h-11 w-full rounded-native-input bg-native-surface pl-9 pr-3 text-[16px] text-native-text placeholder:text-native-textMuted focus:outline-none"
          />
        </div>
        {tab === 'rodiny' && (
          <button
            type="button"
            onClick={() => setGroupSheetOpen(true)}
            className={cn(
              'flex h-11 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-medium transition-transform duration-100 active:scale-[0.96]',
              groupBy !== 'abc' ? 'bg-native-primary/15 text-native-primary' : 'bg-native-surface text-native-textMuted'
            )}
          >
            <SlidersHorizontal size={15} strokeWidth={2} />
            {groupBy === 'abc' ? t('m.families.group', 'Seskupit') : groupLabel}
          </button>
        )}
      </div>

      {loading && <p className="px-4 py-6 text-center text-[15px] text-native-textMuted">{t('m.families.loading', 'Načítám…')}</p>}

      {!loading && tab === 'rodiny' && (
        filtered.length > 0 ? (
          groups.map((group) => (
            <div key={group.title ?? 'all'} className="px-4">
              {group.title && <SectionLabel className="mt-4">{group.title}</SectionLabel>}
              <div className={cn('overflow-hidden rounded-native-card bg-native-surface', !group.title && 'mt-1')}>
                {group.items.map((family, i) => (
                  <FamilyRow
                    key={family.id}
                    family={family}
                    onClick={() => navigate(`/admin/terenni/${family.id}`)}
                    isLast={i === group.items.length - 1}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="mx-4 mt-2">
            <NativeEmptyState
              icon={Users}
              title={families.length === 0 ? t('m.families.emptyTitle', 'Zatím žádné pěstounské rodiny') : t('m.families.noMatchTitle', 'Nic neodpovídá hledání')}
              description={families.length === 0
                ? t('m.families.emptyDesc', 'Rodiny vám přiřadí administrátor vaší organizace.')
                : t('m.families.noMatchDesc', 'Zkuste kratší část názvu rodiny.')}
            />
          </div>
        )
      )}

      {!loading && tab === 'pestouni' && (
        <FostersList fosters={fosters} onOpenFamily={(familyId) => navigate(`/admin/terenni/${familyId}`)} />
      )}

      {!loading && tab === 'deti' && (
        <ChildrenList
          childrenList={filteredChildren}
          familiesById={familiesById}
          onOpenChild={(ch) => navigate(`/admin/terenni/${ch.fosterFamilyId}/deti/${ch.id}`)}
        />
      )}

      {groupSheetOpen && (
        <NativeSheet title={t('m.families.groupSheetTitle', 'Seskupit rodiny')} onClose={() => setGroupSheetOpen(false)}>
          <div className="overflow-hidden rounded-native-card bg-native-bg">
            {GROUP_OPTIONS.map((opt, i) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => chooseGroup(opt.value)}
                className={cn(
                  'flex w-full items-center justify-between px-4 py-3.5 text-left text-[15px]',
                  i > 0 && 'border-t border-native-separator',
                  opt.value === groupBy ? 'font-semibold text-native-primary' : 'text-native-text'
                )}
              >
                {opt.label}
                {opt.value === groupBy && <span className="text-[13px]">{t('m.families.selected', 'Vybráno')}</span>}
              </button>
            ))}
          </div>
        </NativeSheet>
      )}
    </div>
  );
}
