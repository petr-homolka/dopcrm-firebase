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
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Loader2 } from 'lucide-react';

import Badge from '../../components/ui/Badge.jsx';
import Tabs from '../../components/ui/Tabs.jsx';
import { careLabel } from '../../shared/domainConstants.js';
import { getChild, getFoster } from '../../services/orgService.js';
import { useAuthStore } from '../../store/authStore.js';
import { isReadOnlyManager } from '../../services/orgAuth.js';

import { useChildDetailForms } from './useChildDetailForms.js';
import { useChildDetailLists } from './useChildDetailLists.js';
import ChildDetailTabs from './ChildDetailTabs.jsx';

export default function ChildDetailPage() {
  const { t } = useTranslation();
  const { familyId, childId } = useParams();
  const navigate = useNavigate();

  const TABS = [
    { value: 'identita', label: t('child.detail.tabs.identita') },
    { value: 'skola', label: t('child.detail.tabs.skola') },
    { value: 'ospod', label: t('child.detail.tabs.ospod') },
    { value: 'rodina', label: t('child.detail.tabs.rodina') },
    { value: 'socialni', label: t('child.detail.tabs.socialni') },
    { value: 'poznamky', label: t('child.detail.tabs.poznamky') },
    { value: 'historie', label: t('child.detail.tabs.historie') },
    { value: 'ucastnici', label: t('child.detail.tabs.ucastnici') },
  ];

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
      if (!data) throw new Error(t('child.detail.errors.notFound'));
      setChild(data);
      setFamily(await getFoster(data.fosterFamilyId));
    } catch (err) {
      console.error('[ChildDetailPage] Načtení selhalo:', err);
      setError(err.message ?? t('child.detail.errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [childId, loadLists, t]);

  useEffect(() => { load(); }, [load]);

  const forms = useChildDetailForms({ childId, child, reload: load });
  const { role } = useAuthStore();
  const canManage = !isReadOnlyManager(role);

  return (
    <div className="mx-auto max-w-4xl px-6 py-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-start gap-3">
        <button
          type="button"
          onClick={() => navigate(`/admin/terenni/${familyId}`)}
          aria-label={t('child.detail.backToFamily')}
          className="mt-0.5 rounded-lg p-1.5 text-ink-500 hover:bg-surface-muted"
        >
          <ArrowLeft size={20} strokeWidth={1.75} />
        </button>
        <h1 className="min-w-0 flex-1 break-words text-lg font-semibold text-ink-800 sm:text-xl">
          {loading ? t('common.loading') : `${child?.firstName ?? ''} ${child?.lastName ?? ''}`.trim()}
        </h1>
        {child && <Badge tone="family" className="mt-0.5">{careLabel(child.careType)}</Badge>}
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-14 text-ink-500">
          <Loader2 size={22} strokeWidth={1.75} className="animate-spin" />
        </div>
      )}

      {!loading && error && <div className="rounded-xl bg-danger-50 px-4 py-3 text-sm text-danger-700">{error}</div>}

      {!loading && !error && child && (
        <>
          <div className="mb-5">
            <Tabs items={TABS} value={tab} onChange={setTab} />
          </div>

          <ChildDetailTabs tab={tab} child={child} family={family} lists={lists} onLoadMore={loadMore} forms={forms} canManage={canManage} />
        </>
      )}
    </div>
  );
}
