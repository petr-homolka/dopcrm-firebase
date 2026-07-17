/**
 * FosterFamilyDetailPage.jsx — DETAIL panel rodiny uvnitř desktopového
 * case-management workspace (2026-07-13). Panelový hero (avatar, jméno, stavy,
 * kontakt, akce) + podtržené taby: Osa / Pěstouni / Respit / Sociální / Děti /
 * Chat / Dokumenty / Mapa. Chat a Dokumenty jsou nové desktopové moduly
 * (zrcadlí mobilní appku, sdílí datovou vrstvu). Veškerý state/Firebase je v
 * useFosterFamilyDetail.js; jednotlivé záložky v sesterských *Tab.jsx souborech
 * (limit 300 řádků, CLAUDE.md).
 *
 * Přístupné superadmin/org_admin (celá organizace) i klíčové osobě; vedoucí/
 * teamleader jen ke čtení (canManage). Renderuje se přes <Outlet> v
 * FamiliesWorkspace (na mobilu MobileFamilyDetailScreen přes Responsive).
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2, MapPin, Phone, Mail, CalendarPlus, FileText } from 'lucide-react';

import Badge from '../../components/ui/Badge.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import Button from '../../components/ui/Button.jsx';
import Tabs from '../../components/ui/Tabs.jsx';
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
import FamilyChatTab from './FamilyChatTab.jsx';
import FamilyDocumentsTab from './FamilyDocumentsTab.jsx';
import FamilyMapTab from './FamilyMapTab.jsx';
import ReportGenerateDrawer from './documents/ReportGenerateDrawer.jsx';

const STATUS_LABEL_KEYS = { active: 'family.detail.status.active', paused: 'family.detail.status.paused', exited: 'family.detail.status.exited' };
const STATUS_TONE = { active: 'success', paused: 'warning', exited: 'neutral' };

function ContactItem({ icon: Icon, children }) {
  if (!children) return null;
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-ink-500">
      <Icon size={14} strokeWidth={1.75} className="shrink-0 text-ink-400" />
      {children}
    </span>
  );
}

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
  const [reportOpen, setReportOpen] = useState(false);

  const tabItems = [
    { value: 'osa', label: t('family.detail.tabs.osa') },
    { value: 'pestouni', label: t('family.detail.tabs.pestouni', { count: fosters.length }) },
    { value: 'respit', label: t('family.detail.tabs.respit') },
    { value: 'social', label: t('family.detail.tabs.social') },
    { value: 'deti', label: t('family.detail.tabs.deti', { count: children.length }) },
    { value: 'chat', label: t('family.detail.tabs.chat') },
    { value: 'dokumenty', label: t('family.detail.tabs.dokumenty') },
    { value: 'mapa', label: t('family.detail.tabs.mapa') },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-20 text-ink-500">
        <Loader2 size={24} strokeWidth={1.75} className="animate-spin text-brand-600" />
        <span className="text-sm">{t('common.loading')}</span>
      </div>
    );
  }

  if (error) {
    return <div className="m-6 rounded-xl bg-danger-50 px-4 py-3 text-sm text-danger-700 lg:m-8">{error}</div>;
  }

  if (!family) return null;

  return (
    <div>
      <header className="bg-white">
        <div className="flex flex-wrap items-start gap-4 px-6 pt-6 lg:px-8">
          <Avatar name={family.name} size="lg" />
          <div className="min-w-0 flex-1">
            <h1 className="break-words text-2xl font-bold leading-tight text-ink-900">{family.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge tone="family">{careLabel(family.careType)}</Badge>
              <Badge tone={STATUS_TONE[family.status] ?? 'neutral'}>
                {family.status ? t(STATUS_LABEL_KEYS[family.status] ?? family.status) : family.status}
              </Badge>
              <span className="text-xs text-ink-400">{children.length} {children.length === 1 ? 'dítě' : children.length >= 2 && children.length <= 4 ? 'děti' : 'dětí'}</span>
            </div>
            {(family.address || family.contactPhone || family.contactEmail) && (
              <div className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1">
                <ContactItem icon={MapPin}>{family.address}</ContactItem>
                <ContactItem icon={Phone}>{family.contactPhone}</ContactItem>
                <ContactItem icon={Mail}>{family.contactEmail}</ContactItem>
              </div>
            )}
            {family.note && <p className="mt-2 max-w-3xl text-sm text-ink-600">{family.note}</p>}
          </div>
          {canManage && (
            <div className="flex shrink-0 flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={() => navigate('/kalendar')}>
                <CalendarPlus size={16} strokeWidth={1.75} />
                {t('today.quickActions.scheduleVisit')}
              </Button>
              <Button variant="primary" size="sm" onClick={() => setReportOpen(true)}>
                <FileText size={16} strokeWidth={1.75} />
                {t('today.quickActions.fillReport')}
              </Button>
            </div>
          )}
        </div>
        <div className="mt-4 px-6 lg:px-8">
          <Tabs items={tabItems} value={tab} onChange={setTab} />
        </div>
      </header>

      <div className="px-6 py-6 lg:px-8">
        <div className="max-w-4xl">
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

          {tab === 'chat' && <FamilyChatTab familyId={familyId} canManage={canManage} />}

          {tab === 'mapa' && <FamilyMapTab family={family} />}

          {tab === 'dokumenty' && (
            <FamilyDocumentsTab
              familyId={familyId}
              organizationId={family.organizationId}
              assignedTo={family.assignedTo}
              canManage={canManage}
            />
          )}
        </div>
      </div>

      <FosterFamilyModals state={state} />

      {reportOpen && (
        <ReportGenerateDrawer
          familyId={familyId}
          family={family}
          childrenList={children}
          courses={fosterCourses}
          organizationId={family.organizationId}
          assignedTo={family.assignedTo}
          requiredHours={requiredHours}
          onClose={() => setReportOpen(false)}
          onCreated={(docId) => { setReportOpen(false); navigate(`/admin/terenni/${familyId}/dokumenty/${docId}`); }}
        />
      )}
    </div>
  );
}
