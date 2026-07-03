/**
 * FosterFamilyDetailPage.jsx — Krok 3/4 zadání (2026-07-01), obohaceno 2026-07-02 (Fáze 2),
 * Tailwind migrace 2026-07-02 (odstranění MUI, rozdělení na dílčí soubory dle CLAUDE.md).
 *
 * Detail pěstounské rodiny: pěstouni (osoby, RČ, adresy, vzdělávání), Respit +
 * SPVPP peněženky dětí, sociální prostor domácnosti a svěřené děti (klikací →
 * ChildDetailPage). Přístupné superadmin/org_admin (celá organizace) i klíčové
 * osobě (přidělené i cizí rodiny ke čtení) — viz firestore.rules.
 *
 * Respit/SPVPP portováno z vanilla prototypu (RESPIT_LIMIT=14 dní/rok dle §47a
 * zákona 359/1999 Sb., nadstandard přes IPOD; "i hodina = celý den").
 *
 * Tento soubor drží jen skládání obrazovky; veškerý state/Firebase logika je
 * v useFosterFamilyDetail.js, dialogy v FosterFamilyModals.jsx a jednotlivé
 * záložky v sesterských FosterFamily*Tab.jsx — aby žádný soubor nepřekročil
 * 300 řádků.
 */

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Loader2, MapPin, Phone, Mail } from 'lucide-react';

import Card from '../../components/ui/Card.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { cn } from '../../components/ui/cn.js';
import { careLabel, CARE_TYPES, odmenaStatusLabel } from '../../shared/domainConstants.js';
import { useAuthStore } from '../../store/authStore.js';
import { isReadOnlyManager } from '../../services/orgAuth.js';

import useFosterFamilyDetail from './useFosterFamilyDetail.js';
import FosterFamilyTimelineTab from './FosterFamilyTimelineTab.jsx';
import FosterFamilyFostersTab from './FosterFamilyFostersTab.jsx';
import FosterFamilyRespitTab from './FosterFamilyRespitTab.jsx';
import FosterFamilySocialTab from './FosterFamilySocialTab.jsx';
import FosterFamilyChildrenTab from './FosterFamilyChildrenTab.jsx';
import FosterFamilyModals from './FosterFamilyModals.jsx';

const STATUS_LABEL_KEYS = { active: 'family.detail.status.active', paused: 'family.detail.status.paused', exited: 'family.detail.status.exited' };
const STATUS_TONE = { active: 'success', paused: 'warning', exited: 'neutral' };

const TABS = [
  { value: 'osa', label: (t) => t('family.detail.tabs.osa') },
  { value: 'pestouni', label: (t, n) => t('family.detail.tabs.pestouni', { count: n }) },
  { value: 'respit', label: (t) => t('family.detail.tabs.respit') },
  { value: 'social', label: (t) => t('family.detail.tabs.social') },
  { value: 'deti', label: (t, _n, c) => t('family.detail.tabs.deti', { count: c }) },
];

export default function FosterFamilyDetailPage() {
  const { t } = useTranslation();
  const { familyId } = useParams();
  const navigate = useNavigate();
  const state = useFosterFamilyDetail(familyId);
  const {
    loading, error, family, children,
    respitEvents, respitHasMore, loadMoreRespit,
    fosterCourses, fosterCoursesHasMore, loadMoreCourses,
    tab, setTab,
    nadstandardInput, setNadstandardInput, socialForm,
    vykazano, realny, limit, eligible,
    handleSaveNadstandard, openSocialDialog,
    setFosterDialogOpen, setCourseDialogFor, setRespitDialogOpen, setChildDialogOpen,
  } = state;

  const requiredHours = family ? CARE_TYPES[family.careType]?.requiredHours ?? 24 : 24;
  const fosters = family?.fosters ?? [];
  const { role } = useAuthStore();
  const canManage = !isReadOnlyManager(role);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-start gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label={t('common.back')}
          className="mt-0.5 rounded-lg p-1.5 text-stone-500 hover:bg-stone-100"
        >
          <ArrowLeft size={20} strokeWidth={1.75} />
        </button>
        <h1 className="min-w-0 flex-1 break-words text-lg font-semibold text-stone-800 sm:text-xl">
          {loading ? t('common.loading') : (family?.name ?? t('family.detail.fallbackName'))}
        </h1>
        {family && (
          <div className="mt-0.5 flex gap-2">
            <Badge tone="neutral">{careLabel(family.careType)}</Badge>
            <Badge tone={STATUS_TONE[family.status] ?? 'neutral'}>
              {family.status ? t(STATUS_LABEL_KEYS[family.status] ?? family.status) : family.status}
            </Badge>
          </div>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-14 text-stone-500">
          <Loader2 size={24} strokeWidth={1.75} className="animate-spin text-primary-600" />
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {!loading && !error && family && (
        <>
          <Card className="mb-5 flex flex-col gap-1.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">{t('family.detail.contactSection')}</p>
            {family.address && (
              <div className="flex items-center gap-2 text-stone-500">
                <MapPin size={16} strokeWidth={1.75} className="shrink-0" />
                <span className="text-sm">{family.address}</span>
              </div>
            )}
            {family.contactPhone && (
              <div className="flex items-center gap-2 text-stone-500">
                <Phone size={16} strokeWidth={1.75} className="shrink-0" />
                <span className="text-sm">{family.contactPhone}</span>
              </div>
            )}
            {family.contactEmail && (
              <div className="flex items-center gap-2 text-stone-500">
                <Mail size={16} strokeWidth={1.75} className="shrink-0" />
                <span className="text-sm">{family.contactEmail}</span>
              </div>
            )}
            {family.note && (
              <>
                <p className="mt-1.5 text-xs font-semibold uppercase tracking-wide text-stone-400">{t('family.detail.noteSection')}</p>
                <p className="text-sm text-stone-700">{family.note}</p>
              </>
            )}
          </Card>

          <div className="mb-5 flex gap-1 overflow-x-auto border-b border-stone-100">
            {TABS.map((tabDef) => (
              <button
                key={tabDef.value}
                type="button"
                onClick={() => setTab(tabDef.value)}
                className={cn(
                  'shrink-0 border-b-2 px-3 py-2.5 text-sm font-medium transition',
                  tab === tabDef.value
                    ? 'border-primary-600 text-primary-700'
                    : 'border-transparent text-stone-500 hover:text-stone-700'
                )}
              >
                {tabDef.label(t, fosters.length, children.length)}
              </button>
            ))}
          </div>

          {tab === 'osa' && (
            <FosterFamilyTimelineTab familyId={familyId} childrenList={children} canManage={canManage} />
          )}

          {tab === 'pestouni' && (
            <FosterFamilyFostersTab
              fosters={fosters}
              fosterCourses={fosterCourses}
              hasMoreCourses={fosterCoursesHasMore}
              onLoadMoreCourses={loadMoreCourses}
              requiredHours={requiredHours}
              onAddFoster={() => setFosterDialogOpen(true)}
              onAddCourse={(fosterId) => setCourseDialogFor(fosterId)}
              canManage={canManage}
            />
          )}

          {tab === 'respit' && (
            <FosterFamilyRespitTab
              vykazano={vykazano}
              limit={limit}
              realny={realny}
              eligible={eligible}
              odmenaStatus={odmenaStatusLabel(family.careType, children.length > 0)}
              nadstandardInput={nadstandardInput}
              onNadstandardChange={setNadstandardInput}
              onSaveNadstandard={handleSaveNadstandard}
              respitEvents={respitEvents}
              hasMoreRespit={respitHasMore}
              onLoadMoreRespit={loadMoreRespit}
              childrenList={children}
              onAddRespit={() => setRespitDialogOpen(true)}
              canManage={canManage}
            />
          )}

          {tab === 'social' && (
            <FosterFamilySocialTab
              socialForm={socialForm}
              onAddPartner={() => openSocialDialog('partner', { name: '', rc: '', phone: '', relationship: '' })}
              onAddChild={() => openSocialDialog('child', { name: '', rc: '', birthDate: '' })}
              onAddParent={() => openSocialDialog('parent', { name: '', rc: '', phone: '' })}
              canManage={canManage}
            />
          )}

          {tab === 'deti' && (
            <FosterFamilyChildrenTab
              childrenList={children}
              onAddChild={() => setChildDialogOpen(true)}
              onOpenChild={(childId) => navigate(`/admin/terenni/${familyId}/deti/${childId}`)}
              canManage={canManage}
            />
          )}
        </>
      )}

      <FosterFamilyModals state={state} />
    </div>
  );
}
