/**
 * MobileFamilyDetailScreen.jsx — Detail rodiny, čistě mobilní (STRICT UI/UX
 * DESIGN MANDATE, 2026-07-05/06). Reuse `useFosterFamilyDetail` hook (data) —
 * žádná sdílená JSX s desktop FosterFamilyDetailPage.jsx/Foster*Tab.jsx.
 * Hlavička s jménem/badge, kontaktní karta, NativeSegmented pro 5 tabů.
 *
 * RČ→datum narození (2026-07-06): pole "Datum narození" se dopočítá z
 * platného RČ při psaní (KO ho nemusí zadávat ručně) — zůstává editovatelné
 * pro výjimky, kdy se skutečné datum s RČ rozchází.
 */

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CARE_TYPES } from '../../shared/domainConstants.js';
import { parseRc, toDateInputValue } from '../../shared/rcUtils.js';
import useFosterFamilyDetail from '../../modules/admin/useFosterFamilyDetail.js';
import { useAuthStore } from '../../store/authStore.js';
import { isReadOnlyManager } from '../../services/orgAuth.js';
import MobileTopNav from '../ui/MobileTopNav.jsx';
import { HeroBody } from '../ui/NativeHero.jsx';
import NativeSegmented from '../ui/NativeSegmented.jsx';
import NativeSheet from '../ui/NativeSheet.jsx';
import NativeButton from '../ui/NativeButton.jsx';
import { NativeFormGroup, NativeFormRow, RowInput } from '../ui/NativeFormRow.jsx';
import MobileFamilyHeader from './familyDetail/MobileFamilyHeader.jsx';
import MobileTimelineTab from './familyDetail/MobileTimelineTab.jsx';
import MobileChatTab from './familyDetail/MobileChatTab.jsx';
import MobileFostersTab from './familyDetail/MobileFostersTab.jsx';
import MobileRespitTab from './familyDetail/MobileRespitTab.jsx';
import MobileSocialTab from './familyDetail/MobileSocialTab.jsx';
import MobileChildrenTab from './familyDetail/MobileChildrenTab.jsx';

const noop = { preventDefault: () => {} };

export default function MobileFamilyDetailScreen() {
  const { familyId } = useParams();
  const navigate = useNavigate();
  const { role } = useAuthStore();
  const canManage = !isReadOnlyManager(role);
  const state = useFosterFamilyDetail(familyId);
  const {
    loading, error, family, children,
    respitEvents, fosterCourses,
    tab, setTab,
    fosterForm, setFosterForm,
    childDialogOpen, setChildDialogOpen, childForm, setChildForm,
    courseDialogFor, setCourseDialogFor, courseForm, setCourseForm,
    respitForm, setRespitForm,
    socialForm, socialDialogOpen, setSocialDialogOpen, socialKind, socialEntry, setSocialEntry,
    submitting, submitError,
    vykazano, realny, limit, eligible,
    handleAddFoster, handleAddChild, handleAddCourse, handleAddRespit,
    handleSaveSocial, openSocialDialog,
  } = state;

  const requiredHours = family ? CARE_TYPES[family.careType]?.requiredHours ?? 24 : 24;
  const tabItems = [
    { value: 'osa', label: 'Osa' },
    { value: 'chat', label: 'Chat' },
    { value: 'pestouni', label: 'Pěstouni' },
    { value: 'respit', label: 'Respit' },
    { value: 'social', label: 'Sociální prostor' },
    { value: 'deti', label: `Děti (${children.length})` },
  ];

  const childRc = parseRc(childForm.rc);
  function handleChildRcChange(value) {
    const parsed = parseRc(value);
    setChildForm((f) => ({ ...f, rc: value, birthDate: parsed.valid ? toDateInputValue(parsed.birthDate) : f.birthDate }));
  }

  const socialRc = parseRc(socialEntry.rc);
  function handleSocialRcChange(value) {
    const parsed = parseRc(value);
    setSocialEntry((s) => ({
      ...s,
      rc: value,
      birthDate: socialKind === 'child' && parsed.valid ? toDateInputValue(parsed.birthDate) : s.birthDate,
    }));
  }

  return (
    <div>
      <MobileTopNav variant="hero" title={loading ? 'Načítám…' : 'Rodina'} onBack={() => navigate(-1)} />

      {error && <p className="px-4 py-6 text-center text-[15px] text-native-danger">{error}</p>}

      {!error && family && (
        <>
          <MobileFamilyHeader family={family} familyId={familyId} canManage={canManage} />

          <HeroBody>
          <div className="sticky top-11 z-10 bg-native-bg pt-1">
            <NativeSegmented items={tabItems} value={tab} onChange={setTab} />
          </div>

          {tab === 'osa' && <MobileTimelineTab familyId={familyId} familyName={family.name} childrenList={children} canManage={canManage} />}

          {tab === 'chat' && <MobileChatTab familyId={familyId} />}

          {tab === 'pestouni' && (
            <MobileFostersTab
              familyId={familyId}
              organizationId={family.organizationId}
              fosters={family.fosters ?? []}
              fosterCourses={fosterCourses}
              requiredHours={requiredHours}
              canManage={canManage}
              fosterForm={fosterForm}
              setFosterForm={setFosterForm}
              submitting={submitting}
              submitError={submitError}
              onAddFoster={() => handleAddFoster(noop)}
              courseDialogFor={courseDialogFor}
              setCourseDialogFor={setCourseDialogFor}
              courseForm={courseForm}
              setCourseForm={setCourseForm}
              onAddCourse={() => handleAddCourse(noop)}
            />
          )}

          {tab === 'respit' && (
            <MobileRespitTab
              vykazano={vykazano}
              limit={limit}
              realny={realny}
              eligible={eligible}
              odmenaStatus={eligible ? 'Nárok na SPVPP/PPPD odměnu' : 'Bez nároku na odměnu'}
              childrenList={children}
              respitEvents={respitEvents}
              canManage={canManage}
              respitForm={respitForm}
              setRespitForm={setRespitForm}
              submitting={submitting}
              submitError={submitError}
              onAddRespit={() => handleAddRespit(noop)}
            />
          )}

          {tab === 'social' && (
            <MobileSocialTab
              socialForm={socialForm}
              canManage={canManage}
              onAddPartner={() => openSocialDialog('partner', { name: '', rc: '', phone: '', relationship: '' })}
              onAddChild={() => openSocialDialog('child', { name: '', rc: '', birthDate: '' })}
              onAddParent={() => openSocialDialog('parent', { name: '', rc: '', phone: '' })}
            />
          )}

          {tab === 'deti' && (
            <MobileChildrenTab
              childrenList={children}
              canManage={canManage}
              onOpenChild={(childId) => navigate(`/admin/terenni/${familyId}/deti/${childId}`)}
              onAddChild={() => setChildDialogOpen(true)}
            />
          )}
          </HeroBody>
        </>
      )}

      {childDialogOpen && (
        <NativeSheet
          title="Přidat dítě"
          onClose={() => setChildDialogOpen(false)}
          submitting={submitting}
          footer={
            <NativeButton
              onClick={() => handleAddChild(noop)}
              disabled={submitting || !childForm.firstName.trim() || !childForm.lastName.trim() || !!childRc.error}
            >
              {submitting ? 'Ukládám…' : 'Uložit'}
            </NativeButton>
          }
        >
          {submitError && <p className="text-[14px] text-native-danger">{submitError}</p>}
          <NativeFormGroup>
            <NativeFormRow label="Jméno">
              <RowInput value={childForm.firstName} onChange={(e) => setChildForm((f) => ({ ...f, firstName: e.target.value }))} autoFocus />
            </NativeFormRow>
            <NativeFormRow label="Příjmení">
              <RowInput value={childForm.lastName} onChange={(e) => setChildForm((f) => ({ ...f, lastName: e.target.value }))} />
            </NativeFormRow>
            <NativeFormRow
              label="Rodné číslo"
              hint={childRc.error ?? (childRc.checksumWarning ? 'Kontrolní součet RČ nesedí — zkontrolujte, prosím.' : undefined)}
              hintTone={childRc.error ? 'danger' : 'warning'}
            >
              <RowInput value={childForm.rc} onChange={(e) => handleChildRcChange(e.target.value)} />
            </NativeFormRow>
            <NativeFormRow label="Datum narození" isLast>
              <RowInput type="date" value={childForm.birthDate} onChange={(e) => setChildForm((f) => ({ ...f, birthDate: e.target.value }))} />
            </NativeFormRow>
          </NativeFormGroup>
        </NativeSheet>
      )}

      {socialDialogOpen && (
        <NativeSheet
          title={socialKind === 'partner' ? 'Přidat partnera' : socialKind === 'child' ? 'Přidat biologické dítě' : 'Přidat rodiče'}
          onClose={() => setSocialDialogOpen(false)}
          submitting={submitting}
          footer={
            <NativeButton onClick={() => handleSaveSocial(noop)} disabled={submitting || !socialEntry.name.trim() || !!socialRc.error}>
              {submitting ? 'Ukládám…' : 'Uložit'}
            </NativeButton>
          }
        >
          {submitError && <p className="text-[14px] text-native-danger">{submitError}</p>}
          <NativeFormGroup>
            <NativeFormRow label="Jméno">
              <RowInput value={socialEntry.name} onChange={(e) => setSocialEntry((s) => ({ ...s, name: e.target.value }))} autoFocus />
            </NativeFormRow>
            <NativeFormRow
              label="Rodné číslo"
              hint={socialRc.error ?? (socialRc.checksumWarning ? 'Kontrolní součet RČ nesedí — zkontrolujte, prosím.' : undefined)}
              hintTone={socialRc.error ? 'danger' : 'warning'}
            >
              <RowInput value={socialEntry.rc} onChange={(e) => handleSocialRcChange(e.target.value)} />
            </NativeFormRow>
            {socialKind === 'child' ? (
              <NativeFormRow label="Datum narození" isLast>
                <RowInput type="date" value={socialEntry.birthDate} onChange={(e) => setSocialEntry((s) => ({ ...s, birthDate: e.target.value }))} />
              </NativeFormRow>
            ) : (
              <NativeFormRow label="Telefon" isLast>
                <RowInput type="tel" value={socialEntry.phone} onChange={(e) => setSocialEntry((s) => ({ ...s, phone: e.target.value }))} />
              </NativeFormRow>
            )}
          </NativeFormGroup>
        </NativeSheet>
      )}

    </div>
  );
}
