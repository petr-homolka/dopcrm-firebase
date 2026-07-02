/**
 * useChildDetailForms.js — veškerý stav formulářů/dialogů a mutační handlery
 * karty dítěte, vytažené z ChildDetailPage.jsx (Tailwind migrace 2026-07-02),
 * aby hlavní soubor stránky zůstal pod 300 řádky (CLAUDE.md). Čistě přenos
 * existující logiky do vlastního hooku — chování 1:1 s předchozí verzí.
 */

import { useState } from 'react';
import { REL_TYPES } from '../../shared/domainConstants.js';
import {
  setChildRelatives, updateChildTracked, addPermanentNote,
  addPreviousFoster, addCourtVerdict, setChildSocialSpace,
} from '../../services/orgService.js';
import {
  addressLabel, emptyRelForm, emptySocialForm, emptyAddressForm, emptySchoolForm,
  emptyOspodForm, emptyCourtForm, emptyVerdictForm, emptyDocsForm, emptyFosterHistForm,
} from './childDetailShared.js';

export function useChildDetailForms({ childId, child, reload }) {
  const [relDialogOpen, setRelDialogOpen] = useState(false);
  const [relForm, setRelForm] = useState({ ...emptyRelForm, rel: REL_TYPES[0].key });
  const [socialDialogOpen, setSocialDialogOpen] = useState(false);
  const [socialForm, setSocialForm] = useState(emptySocialForm);
  const [addressDialogFor, setAddressDialogFor] = useState(null); // 'addressPermanent' | 'addressResidence' | null
  const [addressForm, setAddressForm] = useState(emptyAddressForm);
  const [schoolDialogOpen, setSchoolDialogOpen] = useState(false);
  const [schoolForm, setSchoolForm] = useState(emptySchoolForm);
  const [ospodDialogOpen, setOspodDialogOpen] = useState(false);
  const [ospodForm, setOspodForm] = useState(emptyOspodForm);
  const [courtDialogOpen, setCourtDialogOpen] = useState(false);
  const [courtForm, setCourtForm] = useState(emptyCourtForm);
  const [verdictDialogOpen, setVerdictDialogOpen] = useState(false);
  const [verdictForm, setVerdictForm] = useState(emptyVerdictForm);
  const [docsDialogOpen, setDocsDialogOpen] = useState(false);
  const [docsForm, setDocsForm] = useState(emptyDocsForm);
  const [noteText, setNoteText] = useState('');
  const [fosterHistDialogOpen, setFosterHistDialogOpen] = useState(false);
  const [fosterHistForm, setFosterHistForm] = useState(emptyFosterHistForm);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  function withSubmit(fn) {
    return async (e) => {
      e.preventDefault();
      setSubmitError('');
      setSubmitting(true);
      try {
        await fn();
        await reload();
      } catch (err) {
        console.error('[ChildDetailPage] Akce selhala:', err);
        setSubmitError(err.message ?? 'Akce se nezdařila.');
      } finally {
        setSubmitting(false);
      }
    };
  }

  const handleAddRelative = withSubmit(async () => {
    if (!relForm.name.trim()) throw new Error('Zadejte jméno příbuzného.');
    const relType = REL_TYPES.find((r) => r.key === relForm.rel);
    const relatives = [
      ...(child.relatives ?? []),
      { id: `${Date.now().toString(36)}`, name: relForm.name.trim(), rc: relForm.rc.trim(), rel: relForm.rel, legal: relType?.legal ?? false, phone: relForm.phone.trim(), email: relForm.email.trim(), note: relForm.note.trim() },
    ];
    await setChildRelatives(childId, relatives);
    setRelDialogOpen(false);
    setRelForm({ ...emptyRelForm, rel: REL_TYPES[0].key });
  });

  const handleAddSocial = withSubmit(async () => {
    if (!socialForm.name.trim()) throw new Error('Zadejte jméno.');
    const socialSpace = [...(child.socialSpace ?? []), { id: `${Date.now().toString(36)}`, ...socialForm }];
    await setChildSocialSpace(childId, socialSpace);
    setSocialDialogOpen(false);
    setSocialForm(emptySocialForm);
  });

  const handleSaveAddress = withSubmit(async () => {
    const field = addressDialogFor;
    const label = field === 'addressPermanent' ? 'Adresa trvalého bydliště' : 'Adresa pobytu';
    const oldValue = addressLabel(child[field]) ?? '—';
    const newValue = addressLabel(addressForm) ?? '—';
    await updateChildTracked(childId, { [field]: addressForm },
      oldValue !== newValue ? [{ field: label, from: oldValue, to: newValue }] : []);
    setAddressDialogFor(null);
    setAddressForm(emptyAddressForm);
  });

  const handleSaveSchool = withSubmit(async () => {
    const oldValue = child.school?.nazev || '—';
    await updateChildTracked(childId, { school: schoolForm },
      oldValue !== schoolForm.nazev ? [{ field: 'Škola', from: oldValue, to: schoolForm.nazev || '—' }] : []);
    setSchoolDialogOpen(false);
  });

  const handleSaveOspod = withSubmit(async () => {
    const oldValue = child.ospod?.nazev || '—';
    await updateChildTracked(childId, { ospod: ospodForm },
      oldValue !== ospodForm.nazev ? [{ field: 'OSPOD', from: oldValue, to: ospodForm.nazev || '—' }] : []);
    setOspodDialogOpen(false);
  });

  const handleSaveCourt = withSubmit(async () => {
    const oldValue = child.courtCase?.spisZnacka || '—';
    const merged = { ...(child.courtCase ?? { rozsudky: [] }), ...courtForm };
    await updateChildTracked(childId, { courtCase: merged },
      oldValue !== courtForm.spisZnacka ? [{ field: 'Spisová značka', from: oldValue, to: courtForm.spisZnacka || '—' }] : []);
    setCourtDialogOpen(false);
  });

  const handleAddVerdict = withSubmit(async () => {
    if (!verdictForm.popis.trim()) throw new Error('Popište rozsudek/usnesení.');
    await addCourtVerdict(childId, { datum: verdictForm.datum, popis: verdictForm.popis.trim() });
    setVerdictDialogOpen(false);
    setVerdictForm(emptyVerdictForm);
  });

  const handleSaveDocs = withSubmit(async () => {
    const idCard = docsForm.idCardNumber ? { number: docsForm.idCardNumber, validUntil: docsForm.idCardValidUntil || null } : null;
    const passport = docsForm.passportNumber ? { number: docsForm.passportNumber, validUntil: docsForm.passportValidUntil || null } : null;
    const entries = [];
    if (!child.idCard && idCard) entries.push({ field: 'Občanský průkaz', from: '—', to: `přidán (${idCard.number})` });
    if (!child.passport && passport) entries.push({ field: 'Cestovní pas', from: '—', to: `přidán (${passport.number})` });
    await updateChildTracked(childId, { idCard, passport }, entries);
    setDocsDialogOpen(false);
  });

  const handleAddNote = withSubmit(async () => {
    if (!noteText.trim()) throw new Error('Zadejte text poznámky.');
    await addPermanentNote(childId, noteText.trim());
    setNoteText('');
  });

  const handleAddFosterHist = withSubmit(async () => {
    if (!fosterHistForm.name.trim()) throw new Error('Zadejte název předchozí rodiny.');
    await addPreviousFoster(childId, fosterHistForm);
    setFosterHistDialogOpen(false);
    setFosterHistForm(emptyFosterHistForm);
  });

  return {
    relDialogOpen, setRelDialogOpen, relForm, setRelForm, handleAddRelative,
    socialDialogOpen, setSocialDialogOpen, socialForm, setSocialForm, handleAddSocial,
    addressDialogFor, setAddressDialogFor, addressForm, setAddressForm, handleSaveAddress,
    schoolDialogOpen, setSchoolDialogOpen, schoolForm, setSchoolForm, handleSaveSchool,
    ospodDialogOpen, setOspodDialogOpen, ospodForm, setOspodForm, handleSaveOspod,
    courtDialogOpen, setCourtDialogOpen, courtForm, setCourtForm, handleSaveCourt,
    verdictDialogOpen, setVerdictDialogOpen, verdictForm, setVerdictForm, handleAddVerdict,
    docsDialogOpen, setDocsDialogOpen, docsForm, setDocsForm, handleSaveDocs,
    noteText, setNoteText, handleAddNote,
    fosterHistDialogOpen, setFosterHistDialogOpen, fosterHistForm, setFosterHistForm, handleAddFosterHist,
    submitting, submitError,
  };
}
