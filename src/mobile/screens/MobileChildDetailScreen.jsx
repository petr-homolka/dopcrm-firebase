/**
 * MobileChildDetailScreen.jsx — Detail dítěte, čistě mobilní (STRICT UI/UX
 * DESIGN MANDATE, 2026-07-05 dodatek). Reuse `useChildDetailForms`/
 * `useChildDetailLists` hooky (data) — žádná sdílená JSX s desktop
 * ChildDetailPage.jsx/Child*Tab.jsx. NativeSegmented pro 7 tabů shodných
 * s desktop verzí.
 *
 * v4 (2026-07-06, Lidl Plus vzor — závazná zpětná vazba): modrý hero blok
 * s velkým jménem dítěte a chipy (věk z data narození, druh péče — jen co
 * v datech reálně je); obsah najíždí zaoblenou hranou přes spodek modré
 * (HeroBody), nav bar `variant="hero"`. Shodný vzor jako Detail rodiny.
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
import NativeHero, { HeroBody } from '../ui/NativeHero.jsx';
import NativeSegmented from '../ui/NativeSegmented.jsx';
import MobileIdentityTab from './childDetail/MobileIdentityTab.jsx';
import MobileSchoolTab from './childDetail/MobileSchoolTab.jsx';
import MobileOspodCourtTab from './childDetail/MobileOspodCourtTab.jsx';
import MobileFamilyTab from './childDetail/MobileFamilyTab.jsx';
import MobileSocialSpaceTab from './childDetail/MobileSocialSpaceTab.jsx';
import { MobileNotesTab, MobileHistoryTab } from './childDetail/MobileNotesHistoryTab.jsx';
import MobileChildParticipantsTab from './childDetail/MobileChildParticipantsTab.jsx';

/** Chip na modré ploše hero — bílý tint (Lidl vzor, shodné s MobileFamilyHeader). */
function HeroChip({ children }) {
  return (
    <span className="inline-flex items-center rounded-full bg-white/20 px-2.5 py-1 text-[12px] font-semibold text-white">
      {children}
    </span>
  );
}

/** Věk v celých letech z data narození (Firestore Timestamp i string) jako český text; null bez platného data. */
function ageChipLabel(value) {
  if (!value) return null;
  const birth = typeof value.toDate === 'function' ? value.toDate() : new Date(value);
  if (Number.isNaN(birth.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const beforeBirthday =
    now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate());
  if (beforeBirthday) age -= 1;
  if (age < 0) return null;
  if (age === 1) return '1 rok';
  if (age >= 2 && age <= 4) return `${age} roky`;
  return `${age} let`;
}

const TABS = [
  { value: 'identita', label: 'Identita' },
  { value: 'skola', label: 'Škola' },
  { value: 'ospod', label: 'OSPOD a soud' },
  { value: 'rodina', label: 'Biologická rodina' },
  { value: 'socialni', label: 'Sociální prostor' },
  { value: 'poznamky', label: 'Poznámky' },
  { value: 'historie', label: 'Historie' },
  { value: 'ucastnici', label: 'Účastníci' },
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

  const ageText = ageChipLabel(child?.birthDate);

  return (
    <div>
      <MobileTopNav
        variant="hero"
        title={loading ? 'Načítám…' : 'Dítě'}
        onBack={() => navigate(`/admin/terenni/${familyId}`)}
      />

      {error && <p className="px-4 py-6 text-center text-[15px] text-native-danger">{error}</p>}

      {!error && child && (
        <>
          <NativeHero
            title={`${child.firstName ?? ''} ${child.lastName ?? ''}`.trim()}
            subtitle={
              (ageText || child.careType) ? (
                <>
                  {ageText && <HeroChip>{ageText}</HeroChip>}
                  {child.careType && <HeroChip>{careLabel(child.careType)}</HeroChip>}
                </>
              ) : null
            }
          />

          <HeroBody>
          <div className="sticky top-11 z-10 bg-native-bg pt-1">
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

          {tab === 'ucastnici' && <MobileChildParticipantsTab child={child} canManage={canManage} />}
          </HeroBody>
        </>
      )}
    </div>
  );
}
