/**
 * useFosterFamilyDetail.js — veškerý state, načítání dat a Firebase handlery
 * pro FosterFamilyDetailPage.jsx, vytažené do vlastního hooku, aby hlavní
 * soubor (prezentace) zůstal pod 300 řádky (viz CLAUDE.md). Logika je 1:1
 * přenesená z původní MUI verze, jen přesunutá — žádná změna chování.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  respitVykazano, respitRealny, respitLimitFor, odmenaEligible,
} from '../../shared/domainConstants.js';
import {
  getFoster, listChildrenByFamily, createChild, addFosterPerson,
  addFosterCourse, listRespitEvents, addRespitEvent, setRespitNadstandard, setFamilySocialSpace,
} from '../../services/orgService.js';

const emptyFosterForm = { name: '', rc: '', phone: '', email: '', addressPermanentText: '', addressResidenceText: '' };
const emptyChildForm = { firstName: '', lastName: '', rc: '', birthDate: '' };
const emptyCourseForm = { kod: '', kde: '', kdy: '', forma: '', poradatel: '', hodiny: '', certifikat: false };
const emptyRespitForm = { from: '', to: '', typ: 'tabor_pobyt', childIds: [], kc: '' };
const emptySocialSpace = { partner: { name: '', rc: '', phone: '', relationship: '' }, biologicalChildren: [], parents: [] };

export default function useFosterFamilyDetail(familyId) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [family, setFamily] = useState(null);
  const [children, setChildren] = useState([]);
  const [respitEvents, setRespitEvents] = useState([]);
  const [tab, setTab] = useState('pestouni');

  const [fosterDialogOpen, setFosterDialogOpen] = useState(false);
  const [fosterForm, setFosterForm] = useState(emptyFosterForm);
  const [childDialogOpen, setChildDialogOpen] = useState(false);
  const [childForm, setChildForm] = useState(emptyChildForm);
  const [courseDialogFor, setCourseDialogFor] = useState(null); // fosterPerson.id | null
  const [courseForm, setCourseForm] = useState(emptyCourseForm);
  const [respitDialogOpen, setRespitDialogOpen] = useState(false);
  const [respitForm, setRespitForm] = useState(emptyRespitForm);
  const [nadstandardInput, setNadstandardInput] = useState('0');
  const [socialForm, setSocialForm] = useState(emptySocialSpace);
  const [socialDialogOpen, setSocialDialogOpen] = useState(false);
  const [socialKind, setSocialKind] = useState('partner'); // 'partner' | 'child' | 'parent'
  const [socialEntry, setSocialEntry] = useState({ name: '', rc: '', phone: '', birthDate: '', relationship: '' });

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const familyData = await getFoster(familyId);
      if (!familyData) throw new Error('Rodina nenalezena.');
      const [childrenData, respitData] = await Promise.all([
        listChildrenByFamily(familyId, familyData.organizationId),
        listRespitEvents(familyId),
      ]);
      setFamily(familyData);
      setChildren(childrenData);
      setRespitEvents(respitData);
      setNadstandardInput(String(familyData.respitNadstandard ?? 0));
      setSocialForm(familyData.socialSpace ?? emptySocialSpace);
    } catch (err) {
      console.error('[FosterFamilyDetailPage] Načtení selhalo:', err);
      setError(err.message ?? 'Data se nepodařilo načíst.');
    } finally {
      setLoading(false);
    }
  }, [familyId]);

  useEffect(() => { load(); }, [load]);

  const vykazano = useMemo(() => respitVykazano(respitEvents), [respitEvents]);
  const realny = useMemo(() => respitRealny(respitEvents, children.length), [respitEvents, children.length]);
  const limit = respitLimitFor(family?.respitNadstandard ?? 0);
  const eligible = family ? odmenaEligible(family.careType, children.length > 0) : false;

  async function handleAddFoster(e) {
    e.preventDefault();
    setSubmitError('');
    if (!fosterForm.name.trim()) { setSubmitError('Zadejte jméno pěstouna.'); return; }
    setSubmitting(true);
    try {
      await addFosterPerson(familyId, {
        name: fosterForm.name.trim(), rc: fosterForm.rc.trim(), phone: fosterForm.phone.trim(), email: fosterForm.email.trim(),
        addressPermanentText: fosterForm.addressPermanentText.trim(),
        addressResidenceText: fosterForm.addressResidenceText.trim(),
      });
      setFosterDialogOpen(false);
      setFosterForm(emptyFosterForm);
      await load();
    } catch (err) {
      console.error('[FosterFamilyDetailPage] Přidání pěstouna selhalo:', err);
      setSubmitError(err.message ?? 'Přidání se nezdařilo.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAddChild(e) {
    e.preventDefault();
    setSubmitError('');
    if (!childForm.firstName.trim() || !childForm.lastName.trim()) {
      setSubmitError('Zadejte jméno a příjmení dítěte.');
      return;
    }
    setSubmitting(true);
    try {
      await createChild({
        fosterFamilyId: familyId,
        firstName: childForm.firstName.trim(),
        lastName: childForm.lastName.trim(),
        rc: childForm.rc.trim(),
        birthDate: childForm.birthDate || null,
      });
      setChildDialogOpen(false);
      setChildForm(emptyChildForm);
      await load();
    } catch (err) {
      console.error('[FosterFamilyDetailPage] Přidání dítěte selhalo:', err);
      setSubmitError(err.message ?? 'Přidání se nezdařilo.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAddCourse(e) {
    e.preventDefault();
    setSubmitError('');
    if (!courseForm.kod.trim()) { setSubmitError('Zadejte kód/název kurzu.'); return; }
    setSubmitting(true);
    try {
      await addFosterCourse(familyId, courseDialogFor, {
        kod: courseForm.kod.trim(), kde: courseForm.kde.trim(), kdy: courseForm.kdy || null,
        forma: courseForm.forma.trim(), poradatel: courseForm.poradatel.trim(),
        hodiny: Number(courseForm.hodiny) || 0, certifikat: !!courseForm.certifikat,
      });
      setCourseDialogFor(null);
      setCourseForm(emptyCourseForm);
      await load();
    } catch (err) {
      console.error('[FosterFamilyDetailPage] Zápis kurzu selhal:', err);
      setSubmitError(err.message ?? 'Zápis se nezdařil.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAddRespit(e) {
    e.preventDefault();
    setSubmitError('');
    if (!respitForm.from) { setSubmitError('Zadejte datum od.'); return; }
    setSubmitting(true);
    try {
      await addRespitEvent(familyId, {
        childIds: respitForm.childIds, from: respitForm.from, to: respitForm.to || respitForm.from,
        typ: respitForm.typ, kc: Number(respitForm.kc) || 0,
      });
      setRespitDialogOpen(false);
      setRespitForm(emptyRespitForm);
      await load();
    } catch (err) {
      console.error('[FosterFamilyDetailPage] Zápis respitu selhal:', err);
      setSubmitError(err.message ?? 'Zápis se nezdařil.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSaveNadstandard() {
    try {
      await setRespitNadstandard(familyId, nadstandardInput);
      await load();
    } catch (err) {
      console.error('[FosterFamilyDetailPage] Uložení nadstandardu selhalo:', err);
    }
  }

  async function handleSaveSocial(e) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');
    try {
      let next = { ...socialForm };
      if (socialKind === 'partner') {
        next.partner = { ...socialEntry };
      } else if (socialKind === 'child') {
        next.biologicalChildren = [...(socialForm.biologicalChildren ?? []), { ...socialEntry }];
      } else {
        next.parents = [...(socialForm.parents ?? []), { ...socialEntry }];
      }
      await setFamilySocialSpace(familyId, next);
      setSocialDialogOpen(false);
      setSocialEntry({ name: '', rc: '', phone: '', birthDate: '', relationship: '' });
      await load();
    } catch (err) {
      console.error('[FosterFamilyDetailPage] Uložení sociálního prostoru selhalo:', err);
      setSubmitError(err.message ?? 'Uložení se nezdařilo.');
    } finally {
      setSubmitting(false);
    }
  }

  function openSocialDialog(kind, initialEntry) {
    setSocialKind(kind);
    setSocialEntry(initialEntry);
    setSocialDialogOpen(true);
  }

  return {
    loading, error, family, children, respitEvents, tab, setTab,
    fosterDialogOpen, setFosterDialogOpen, fosterForm, setFosterForm,
    childDialogOpen, setChildDialogOpen, childForm, setChildForm,
    courseDialogFor, setCourseDialogFor, courseForm, setCourseForm,
    respitDialogOpen, setRespitDialogOpen, respitForm, setRespitForm,
    nadstandardInput, setNadstandardInput,
    socialForm, socialDialogOpen, setSocialDialogOpen, socialKind, socialEntry, setSocialEntry,
    submitting, submitError,
    vykazano, realny, limit, eligible,
    handleAddFoster, handleAddChild, handleAddCourse, handleAddRespit,
    handleSaveNadstandard, handleSaveSocial, openSocialDialog,
  };
}
