/**
 * ChildDetailTabs.jsx — dispatch aktivního tabu karty dítěte na jeho
 * subkomponentu, vytaženo z ChildDetailPage.jsx (Tailwind migrace 2026-07-02),
 * aby hlavní soubor stránky zůstal pod 300 řádky (CLAUDE.md). `forms` je
 * návratová hodnota useChildDetailForms — jen se rozbaluje do props tabů.
 */

import React from 'react';
import { relGroups } from '../../shared/domainConstants.js';
import { emptyAddressForm, emptySchoolForm, emptyOspodForm, emptyCourtForm } from './childDetailShared.js';

import ChildIdentityTab from './ChildIdentityTab.jsx';
import ChildSchoolTab from './ChildSchoolTab.jsx';
import ChildOspodCourtTab from './ChildOspodCourtTab.jsx';
import ChildFamilyTab from './ChildFamilyTab.jsx';
import ChildSocialSpaceTab from './ChildSocialSpaceTab.jsx';
import { ChildNotesTab, ChildHistoryTab } from './ChildNotesHistoryTab.jsx';

export default function ChildDetailTabs({ tab, child, lists, onLoadMore, forms }) {
  const { submitting, submitError } = forms;

  if (tab === 'identita') {
    return (
      <ChildIdentityTab
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
        submitting={submitting}
        submitError={submitError}
      />
    );
  }

  if (tab === 'skola') {
    return (
      <ChildSchoolTab
        child={child}
        schoolDialogOpen={forms.schoolDialogOpen}
        schoolForm={forms.schoolForm}
        setSchoolForm={forms.setSchoolForm}
        onOpen={() => { forms.setSchoolForm(child.school ?? emptySchoolForm); forms.setSchoolDialogOpen(true); }}
        onClose={() => forms.setSchoolDialogOpen(false)}
        onSave={forms.handleSaveSchool}
        submitting={submitting}
        submitError={submitError}
      />
    );
  }

  if (tab === 'ospod') {
    return (
      <ChildOspodCourtTab
        child={child}
        courtVerdicts={lists.courtVerdicts.items}
        hasMoreVerdicts={!!lists.courtVerdicts.cursor}
        onLoadMoreVerdicts={() => onLoadMore('courtVerdicts')}
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
        submitting={submitting}
        submitError={submitError}
      />
    );
  }

  if (tab === 'rodina') {
    return (
      <ChildFamilyTab
        child={child}
        previousFosters={lists.previousFosters.items}
        hasMorePreviousFosters={!!lists.previousFosters.cursor}
        onLoadMorePreviousFosters={() => onLoadMore('previousFosters')}
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
        submitting={submitting}
        submitError={submitError}
      />
    );
  }

  if (tab === 'socialni') {
    return (
      <ChildSocialSpaceTab
        child={child}
        socialDialogOpen={forms.socialDialogOpen}
        socialForm={forms.socialForm}
        setSocialForm={forms.setSocialForm}
        onOpen={() => forms.setSocialDialogOpen(true)}
        onClose={() => forms.setSocialDialogOpen(false)}
        onAdd={forms.handleAddSocial}
        submitting={submitting}
        submitError={submitError}
      />
    );
  }

  if (tab === 'poznamky') {
    return (
      <ChildNotesTab
        notes={lists.notes.items}
        hasMoreNotes={!!lists.notes.cursor}
        onLoadMoreNotes={() => onLoadMore('notes')}
        noteText={forms.noteText}
        setNoteText={forms.setNoteText}
        onAddNote={forms.handleAddNote}
        submitting={submitting}
        submitError={submitError}
      />
    );
  }

  if (tab === 'historie') {
    return (
      <ChildHistoryTab
        history={lists.history.items}
        hasMore={!!lists.history.cursor}
        onLoadMore={() => onLoadMore('history')}
      />
    );
  }

  return null;
}
