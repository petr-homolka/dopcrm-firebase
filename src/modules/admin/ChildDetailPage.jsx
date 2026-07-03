/**
 * ChildDetailPage.jsx — nejnižší úroveň hierarchie (2026-07-02, obohaceno Fáze 3;
 * Tailwind migrace 2026-07-02)
 *
 * Karta dítěte: identita (RČ/OP/pas), adresy s historií, škola, OSPOD, soud,
 * biologická rodina (REL_TYPES) a sociální prostor, předchozí pěstouni, trvalé
 * poznámky a historie změn ("nic se nepřepisuje" — port App.histAdd/histList
 * z vanilla prototypu). Dostupné superadmin/org_admin (celá organizace) i
 * klíčové osobě — dokončuje hierarchickou viditelnost až na úroveň dítěte.
 *
 * Rozděleno na sedm tabů (< 300 řádků/soubor dle CLAUDE.md):
 * - childDetailShared.js — formátovací helpery + výchozí tvary formulářů
 * - useChildDetailForms.js — veškerý stav dialogů/formulářů + mutační handlery
 * - ChildDetailTabs.jsx — dispatch aktivního tabu na jeho subkomponentu
 * - ChildIdentityTab / ChildSchoolTab / ChildOspodCourtTab / ChildFamilyTab
 *   (+ AddRelativeModal) / ChildSocialSpaceTab / ChildNotesHistoryTab
 * Tento soubor drží jen načítání dat a tab-strip; chování je 1:1 s předchozí
 * MUI verzí.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';

import Badge from '../../components/ui/Badge.jsx';
import { cn } from '../../components/ui/cn.js';
import { careLabel } from '../../shared/domainConstants.js';
import { getChild, getFoster } from '../../services/orgService.js';
import { useAuthStore } from '../../store/authStore.js';
import { isReadOnlyManager } from '../../services/orgAuth.js';

import { useChildDetailForms } from './useChildDetailForms.js';
import { useChildDetailLists } from './useChildDetailLists.js';
import ChildDetailTabs from './ChildDetailTabs.jsx';

const TABS = [
  { key: 'identita', label: 'Identita' },
  { key: 'skola', label: 'Škola' },
  { key: 'ospod', label: 'OSPOD a soud' },
  { key: 'rodina', label: 'Biologická rodina' },
  { key: 'socialni', label: 'Sociální prostor' },
  { key: 'poznamky', label: 'Poznámky' },
  { key: 'historie', label: 'Historie' },
];

export default function ChildDetailPage() {
  const { familyId, childId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [child, setChild] = useState(null);
  const [family, setFamily] = useState(null);
  const [tab, setTab] = useState('identita');
  const { lists, loadAll: loadLists, loadMore } = useChildDetailLists(childId);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [data] = await Promise.all([getChild(childId), loadLists()]);
      if (!data) throw new Error('Dítě nenalezeno.');
      setChild(data);
      setFamily(await getFoster(data.fosterFamilyId));
    } catch (err) {
      console.error('[ChildDetailPage] Načtení selhalo:', err);
      setError(err.message ?? 'Data se nepodařilo načíst.');
    } finally {
      setLoading(false);
    }
  }, [childId, loadLists]);

  useEffect(() => { load(); }, [load]);

  const forms = useChildDetailForms({ childId, child, reload: load });
  const { role } = useAuthStore();
  const canManage = !isReadOnlyManager(role);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start gap-3">
        <button
          type="button"
          onClick={() => navigate(`/admin/terenni/${familyId}`)}
          aria-label="Zpět na rodinu"
          className="mt-0.5 rounded-lg p-1.5 text-stone-500 hover:bg-stone-100"
        >
          <ArrowLeft size={20} strokeWidth={1.75} />
        </button>
        <h1 className="min-w-0 flex-1 break-words text-lg font-semibold text-stone-800 sm:text-xl">
          {loading ? 'Načítám…' : `${child?.firstName ?? ''} ${child?.lastName ?? ''}`.trim()}
        </h1>
        {child && <Badge tone="family" className="mt-0.5">{careLabel(child.careType)}</Badge>}
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-14 text-stone-500">
          <Loader2 size={22} strokeWidth={1.75} className="animate-spin" />
        </div>
      )}

      {!loading && error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {!loading && !error && child && (
        <>
          <div className="mb-5 flex flex-nowrap gap-2 overflow-x-auto border-b border-stone-100">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={cn(
                  'shrink-0 border-b-2 px-3 py-2.5 text-sm font-medium transition duration-150',
                  tab === t.key
                    ? 'border-primary-600 text-primary-700'
                    : 'border-transparent text-stone-500 hover:text-stone-700'
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          <ChildDetailTabs tab={tab} child={child} family={family} lists={lists} onLoadMore={loadMore} forms={forms} canManage={canManage} />
        </>
      )}
    </div>
  );
}
