/**
 * MobileChildDetailScreen.jsx — Detail dítěte, čistě mobilní (STRICT UI/UX
 * DESIGN MANDATE, 2026-07-05 dodatek). Reuse `useChildDetailForms`/
 * `useChildDetailLists` hooky (data) — žádná sdílená JSX s desktop
 * ChildDetailPage.jsx/Child*Tab.jsx. Hlavička s jménem/care-type chip,
 * NativeSegmented pro 7 tabů shodných s desktop verzí.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { careLabel, relGroups } from '../../shared/domainConstants.js';
import { getChild, getFoster } from '../../services/orgService.js';
import { useAuthStore } from '../../store/authStore.js';
import { isReadOnlyManager } from '../../services/orgAuth.js';
import { useChildDetailForms } from '../../modules/admin/useChildDetailForms.js';
import { useChildDetailLists } from '../../modules/admin/useChildDetailLists.js';
import { emptyAddressForm, emptySchoolForm, emptyOspodForm, emptyCourtForm } from '../../modules/admin/childDetailShared.js';
import MobileTopNav from '../ui/MobileTopNav.jsx';
import NativeSegmented from '../ui/NativeSegmented.jsx';
import MobileIdentityTab from './childDetail/MobileIdentityTab.jsx';
import MobileSchoolTab from './childDetail/MobileSchoolTab.jsx';
import MobileOspodCourtTab from './childDetail/MobileOspodCourtTab.jsx';
import MobileFamilyTab from './childDetail/MobileFamilyTab.jsx';
import MobileSocialSpaceTab from './childDetail/MobileSocialSpaceTab.jsx';
import { MobileNotesTab, MobileHistoryTab } from './childDetail/MobileNotesHistoryTab.jsx';

const TABS = [
  { value: 'identita', label: 'Identita' },
  { value: 'skola', label: 'Škola' },
  { value: 'ospod', label: 'OSPOD a soud' },
  { value: 'rodina', label: 'Biologická rodina' },
  { value: 'socialni', label: 'Sociální prostor' },
  { value: 'poznamky', label: 'Poznámky' },
  { value: 'historie', label: 'Historie' },
];

export default function MobileChildDetailScreen() {
  const { familyId, childId } = useParams();
  const navigate = useNavigate();
  const { role } = useAuthStore();
  const canManage = !isReadOnlyManager(role);

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
      setError(err.message ?? 'Načtení se nezdařilo.');
    } finally {
      setLoading(false);
    }
  }, [childId, loadLists]);

  useEffect(() => { load(); }, [load]);

  const forms = useChildDetailForms({ childId, child, reload: load });

  return (
    <div>
      <MobileTopNav
        title={loading ? 'Načítám…' : `${child?.firstName ?? ''} ${child?.lastName ?? ''}`.trim()}
        onBack={() => navigate(`/admin/terenni/${familyId}`)}
      />

      {error && <p className="px-4 py-6 text-center text-[15px] text-native-danger">{error}</p>}

      {!error && child && (
        <>
          <div className="px-4 pt-3">
            <span className="rounded-full bg-native-primary/15 px-2.5 py-1 text-[12px] font-semibold text-native-primary">
              {careLabel(child.careType)}
            </span>
          </div>

          <div className="sticky top-11 z-10 mt-2 bg-native-bg">
            <NativeSegmented items={TABS} value={tab} onChange={setTab} />
          </div>

          {tab === 'identita' && (
            <MobileIdentityTab
              child={child}
              addressDialogFor={forms.addressDialogFor}
              addressForm={forms.addressForm}
              setAddressForm={forms.setAddressForm}
              onOpenAddress={(field, current) => { forms.setAddressForm(current ?? emptyAddressForm); forms.setAddressDialogFor(field); }}
              onCloseAddress={() => forms.setAddressDialogFor(null)}
              onSaveAddress={forms.handleSaveAddress}
              docsDialogOpen={forms.docsDialogOpen}
              docsForm={forms.docsForm}
              setDocsForm={forms.setDocsForm}
              onOpenDocs={() => {
                forms.setDocsForm({
                  idCardNumber: child.idCard?.number ?? '', idCardValidUntil: child.idCard?.validUntil ?? '',
                  passportNumber: child.passport?.number ?? '', passportValidUntil: child.passport?.validUntil ?? '',
                });
                forms.setDocsDialogOpen(true);
              }}
              onCloseDocs={() => forms.setDocsDialogOpen(false)}
              onSaveDocs={forms.handleSaveDocs}
              submitting={forms.submitting}
              submitError={forms.submitError}
              canManage={canManage}
            />
          )}

          {tab === 'skola' && (
            <MobileSchoolTab
              child={child}
              schoolDialogOpen={forms.schoolDialogOpen}
              schoolForm={forms.schoolForm}
              setSchoolForm={forms.setSchoolForm}
              onOpen={() => { forms.setSchoolForm(child.school ?? emptySchoolForm); forms.setSchoolDialogOpen(true); }}
              onClose={() => forms.setSchoolDialogOpen(false)}
              onSave={forms.handleSaveSchool}
              submitting={forms.submitting}
              submitError={forms.submitError}
              canManage={canManage}
            />
          )}

          {tab === 'ospod' && (
            <MobileOspodCourtTab
              child={child}
              courtVerdicts={lists.courtVerdicts.items}
              hasMoreVerdicts={!!lists.courtVerdicts.cursor}
              onLoadMoreVerdicts={() => loadMore('courtVerdicts')}
              ospodDialogOpen={forms.ospodDialogOpen}
              ospodForm={forms.ospodForm}
              setOspodForm={forms.setOspodForm}
              onOpenOspod={() => { forms.setOspodForm(child.ospod ?? emptyOspodForm); forms.setOspodDialogOpen(true); }}
              onCloseOspod={() => forms.setOspodDialogOpen(false)}
              onSaveOspod={forms.handleSaveOspod}
              courtDialogOpen={forms.courtDialogOpen}
              courtForm={forms.courtForm}
              setCourtForm={forms.setCourtForm}
              onOpenCourt={() => { forms.setCourtForm(child.courtCase ?? emptyCourtForm); forms.setCourtDialogOpen(true); }}
              onCloseCourt={() => forms.setCourtDialogOpen(false)}
              onSaveCourt={forms.handleSaveCourt}
              verdictDialogOpen={forms.verdictDialogOpen}
              verdictForm={forms.verdictForm}
              setVerdictForm={forms.setVerdictForm}
              onOpenVerdict={() => forms.setVerdictDialogOpen(true)}
              onCloseVerdict={() => forms.setVerdictDialogOpen(false)}
              onAddVerdict={forms.handleAddVerdict}
              submitting={forms.submitting}
              submitError={forms.submitError}
              canManage={canManage}
            />
          )}

          {tab === 'rodina' && (
            <MobileFamilyTab
              child={child}
              family={family}
              previousFosters={lists.previousFosters.items}
              hasMorePreviousFosters={!!lists.previousFosters.cursor}
              onLoadMorePreviousFosters={() => loadMore('previousFosters')}
              relGroupsData={relGroups()}
              relDialogOpen={forms.relDialogOpen}
              relForm={forms.relForm}
              setRelForm={forms.setRelForm}
              onOpenRel={() => forms.setRelDialogOpen(true)}
              onCloseRel={() => forms.setRelDialogOpen(false)}
              onAddRelative={forms.handleAddRelative}
              fosterHistDialogOpen={forms.fosterHistDialogOpen}
              fosterHistForm={forms.fosterHistForm}
              setFosterHistForm={forms.setFosterHistForm}
              onOpenFosterHist={() => forms.setFosterHistDialogOpen(true)}
              onCloseFosterHist={() => forms.setFosterHistDialogOpen(false)}
              onAddFosterHist={forms.handleAddFosterHist}
              submitting={forms.submitting}
              submitError={forms.submitError}
              canManage={canManage}
            />
          )}

          {tab === 'socialni' && (
            <MobileSocialSpaceTab
              child={child}
              socialDialogOpen={forms.socialDialogOpen}
              socialForm={forms.socialForm}
              setSocialForm={forms.setSocialForm}
              onOpen={() => forms.setSocialDialogOpen(true)}
              onClose={() => forms.setSocialDialogOpen(false)}
              onAdd={forms.handleAddSocial}
              submitting={forms.submitting}
              submitError={forms.submitError}
              canManage={canManage}
            />
          )}

          {tab === 'poznamky' && (
            <MobileNotesTab
              notes={lists.notes.items}
              hasMoreNotes={!!lists.notes.cursor}
              onLoadMoreNotes={() => loadMore('notes')}
              noteText={forms.noteText}
              setNoteText={forms.setNoteText}
              onAddNote={forms.handleAddNote}
              submitting={forms.submitting}
              submitError={forms.submitError}
              canManage={canManage}
            />
          )}

          {tab === 'historie' && (
            <MobileHistoryTab
              history={lists.history.items}
              hasMore={!!lists.history.cursor}
              onLoadMore={() => loadMore('history')}
            />
          )}
        </>
      )}
    </div>
  );
}
