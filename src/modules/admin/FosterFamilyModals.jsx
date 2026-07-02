/**
 * FosterFamilyModals.jsx — vykreslí všech 5 formulářových dialogů karty
 * rodiny (pěstoun, kurz, respit, sociální prostor, dítě) podle stavu z
 * useFosterFamilyDetail.js. Vytaženo z FosterFamilyDetailPage.jsx, aby
 * hlavní soubor zůstal pod 300 řádky (viz CLAUDE.md). Čistě prezentační.
 */

import React from 'react';

import FosterPersonFormModal from './FosterPersonFormModal.jsx';
import FosterCourseFormModal from './FosterCourseFormModal.jsx';
import RespitEventFormModal from './RespitEventFormModal.jsx';
import SocialSpaceEntryFormModal from './SocialSpaceEntryFormModal.jsx';
import AddChildToFamilyModal from './AddChildToFamilyModal.jsx';

export default function FosterFamilyModals({ state }) {
  const {
    children,
    fosterDialogOpen, setFosterDialogOpen, fosterForm, setFosterForm,
    childDialogOpen, setChildDialogOpen, childForm, setChildForm,
    courseDialogFor, setCourseDialogFor, courseForm, setCourseForm,
    respitDialogOpen, setRespitDialogOpen, respitForm, setRespitForm,
    socialDialogOpen, setSocialDialogOpen, socialKind, socialEntry, setSocialEntry,
    submitting, submitError,
    handleAddFoster, handleAddChild, handleAddCourse, handleAddRespit, handleSaveSocial,
  } = state;

  return (
    <>
      {fosterDialogOpen && (
        <FosterPersonFormModal
          form={fosterForm}
          onChange={(field, value) => setFosterForm((f) => ({ ...f, [field]: value }))}
          submitting={submitting}
          submitError={submitError}
          onClose={() => setFosterDialogOpen(false)}
          onSubmit={handleAddFoster}
        />
      )}

      {!!courseDialogFor && (
        <FosterCourseFormModal
          form={courseForm}
          onChange={(field, value) => setCourseForm((f) => ({ ...f, [field]: value }))}
          submitting={submitting}
          submitError={submitError}
          onClose={() => setCourseDialogFor(null)}
          onSubmit={handleAddCourse}
        />
      )}

      {respitDialogOpen && (
        <RespitEventFormModal
          form={respitForm}
          onChange={(field, value) => setRespitForm((f) => ({ ...f, [field]: value }))}
          childrenList={children}
          onToggleChild={(childId, checked) => setRespitForm((f) => ({
            ...f,
            childIds: checked ? [...f.childIds, childId] : f.childIds.filter((id) => id !== childId),
          }))}
          submitting={submitting}
          submitError={submitError}
          onClose={() => setRespitDialogOpen(false)}
          onSubmit={handleAddRespit}
        />
      )}

      {socialDialogOpen && (
        <SocialSpaceEntryFormModal
          kind={socialKind}
          entry={socialEntry}
          onChange={(field, value) => setSocialEntry((f) => ({ ...f, [field]: value }))}
          submitting={submitting}
          submitError={submitError}
          onClose={() => setSocialDialogOpen(false)}
          onSubmit={handleSaveSocial}
        />
      )}

      {childDialogOpen && (
        <AddChildToFamilyModal
          form={childForm}
          onChange={(field, value) => setChildForm((f) => ({ ...f, [field]: value }))}
          submitting={submitting}
          submitError={submitError}
          onClose={() => setChildDialogOpen(false)}
          onSubmit={handleAddChild}
        />
      )}
    </>
  );
}
