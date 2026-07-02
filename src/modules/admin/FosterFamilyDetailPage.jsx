/**
 * FosterFamilyDetailPage.jsx — Krok 3/4 zadání (2026-07-01), obohaceno 2026-07-02 (Fáze 2)
 *
 * Detail pěstounské rodiny: pěstouni (osoby, RČ, adresy, vzdělávání), Respit +
 * SPVPP peněženky dětí, sociální prostor domácnosti a svěřené děti (klikací →
 * ChildDetailPage). Přístupné superadmin/org_admin (celá organizace) i klíčové
 * osobě (přidělené i cizí rodiny ke čtení) — viz firestore.rules.
 *
 * Respit/SPVPP portováno z vanilla prototypu (RESPIT_LIMIT=14 dní/rok dle §47a
 * zákona 359/1999 Sb., nadstandard přes IPOD; "i hodina = celý den").
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Chip, CircularProgress, Alert,
  IconButton, List, ListItem, ListItemAvatar, ListItemText, Avatar, Stack,
  Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  Tabs, Tab, MenuItem, Checkbox, FormControlLabel, FormGroup, Divider,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import PersonIcon from '@mui/icons-material/Person';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import ChildFriendlyOutlinedIcon from '@mui/icons-material/ChildFriendlyOutlined';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import PlaceIcon from '@mui/icons-material/Place';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import SpaOutlinedIcon from '@mui/icons-material/SpaOutlined';
import AddIcon from '@mui/icons-material/Add';

import { bento } from '../../core/theme.js';
import {
  careLabel, CARE_TYPES, RESPIT_TYPES, respitTypeLabel, respitEventDays,
  respitVykazano, respitRealny, respitLimitFor, odmenaEligible, odmenaStatusLabel,
} from '../../shared/domainConstants.js';
import {
  getFoster, listChildrenByFamily, createChild, addFosterPerson, updateFosterPerson,
  addFosterCourse, listRespitEvents, addRespitEvent, setRespitNadstandard, setFamilySocialSpace,
} from '../../services/orgService.js';

const STATUS_LABELS = { active: 'Aktivní', paused: 'Pozastaveno', exited: 'Ukončeno' };
const STATUS_COLOR = { active: 'success', paused: 'warning', exited: 'default' };

function formatBirthDate(value) {
  if (!value) return '—';
  const date = typeof value.toDate === 'function' ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('cs-CZ');
}

function StatCard({ label, value, sub, color = 'primary' }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '.06em', color: 'text.secondary', fontWeight: 600 }}>{label}</Typography>
        <Typography sx={{ fontSize: 28, fontWeight: 700, lineHeight: 1.2, mt: 0.5, color: `${color}.main` }}>{value}</Typography>
        {sub && <Typography variant="body2" color="text.secondary">{sub}</Typography>}
      </CardContent>
    </Card>
  );
}

const emptyFosterForm = { name: '', rc: '', phone: '', email: '', addressPermanentText: '', addressResidenceText: '' };
const emptyChildForm = { firstName: '', lastName: '', rc: '', birthDate: '' };
const emptyCourseForm = { kod: '', kde: '', kdy: '', forma: '', poradatel: '', hodiny: '', certifikat: false };
const emptyRespitForm = { from: '', to: '', typ: 'tabor_pobyt', childIds: [], kc: '' };
const emptySocialSpace = { partner: { name: '', rc: '', phone: '', relationship: '' }, biologicalChildren: [], parents: [] };

export default function FosterFamilyDetailPage() {
  const { familyId } = useParams();
  const navigate = useNavigate();

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

  const requiredHours = family ? CARE_TYPES[family.careType]?.requiredHours ?? 24 : 24;

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} aria-label="Zpět"><ArrowBackIcon /></IconButton>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h4" fontWeight={700} noWrap>{loading ? 'Načítám…' : (family?.name ?? 'Rodina')}</Typography>
        </Box>
        {family && <Chip label={careLabel(family.careType)} />}
        {family && <Chip label={STATUS_LABELS[family.status] ?? family.status} color={STATUS_COLOR[family.status] ?? 'default'} />}
      </Stack>

      {loading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 6, justifyContent: 'center' }}>
          <CircularProgress size={28} />
        </Box>
      )}

      {!loading && error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && family && (
        <>
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Typography variant="overline" color="text.secondary" fontWeight={700}>Kontakt</Typography>
              {family.address && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                  <PlaceIcon fontSize="small" /><Typography variant="body2">{family.address}</Typography>
                </Box>
              )}
              {family.contactPhone && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                  <PhoneIcon fontSize="small" /><Typography variant="body2">{family.contactPhone}</Typography>
                </Box>
              )}
              {family.contactEmail && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                  <EmailIcon fontSize="small" /><Typography variant="body2">{family.contactEmail}</Typography>
                </Box>
              )}
              {family.note && (
                <>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, textTransform: 'uppercase', fontWeight: 600 }}>Poznámka</Typography>
                  <Typography variant="body2">{family.note}</Typography>
                </>
              )}
            </CardContent>
          </Card>

          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Tab value="pestouni" label={`Pěstouni (${(family.fosters ?? []).length})`} />
            <Tab value="respit" label="Respit a SPVPP" />
            <Tab value="social" label="Sociální prostor" />
            <Tab value="deti" label={`Svěřené děti (${children.length})`} />
          </Tabs>

          {tab === 'pestouni' && (
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h6" fontWeight={700}>Pěstouni v domácnosti</Typography>
                  <Button size="small" startIcon={<PersonAddOutlinedIcon />} onClick={() => setFosterDialogOpen(true)}>Přidat pěstouna</Button>
                </Stack>
                {(family.fosters ?? []).length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>Zatím žádný pěstoun v evidenci.</Typography>
                )}
                {(family.fosters ?? []).map((foster, idx) => {
                  const hours = (foster.courses ?? []).reduce((sum, c) => sum + (Number(c.hodiny) || 0), 0);
                  return (
                    <Box key={foster.id ?? idx} sx={{ mb: 3 }}>
                      <Stack direction="row" alignItems="flex-start" spacing={2}>
                        <Avatar sx={{ bgcolor: (t) => alpha(t.palette.primary.main, 0.14), color: 'primary.main' }}><PersonIcon /></Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography fontWeight={600}>{foster.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {[foster.rc && `RČ ${foster.rc}`, foster.phone, foster.email].filter(Boolean).join(' · ') || '—'}
                          </Typography>
                          {(foster.addressPermanentText || foster.addressResidenceText) && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              {foster.addressPermanentText && <>Trvalé bydliště: {foster.addressPermanentText}. </>}
                              {foster.addressResidenceText && <>Adresa pobytu: {foster.addressResidenceText}.</>}
                            </Typography>
                          )}
                          <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <WorkspacePremiumOutlinedIcon fontSize="small" color={hours >= requiredHours ? 'success' : 'warning'} />
                            <Typography variant="body2">
                              Vzdělávání: <b>{hours} h</b> / {requiredHours} h za posledních 12 měsíců
                              {hours >= requiredHours ? ' — splněno' : ' — pod plánem'}
                            </Typography>
                          </Box>
                          <List dense sx={{ mt: 0.5 }}>
                            {(foster.courses ?? []).map((c) => (
                              <ListItem key={c.id} disableGutters sx={{ py: 0.25 }}>
                                <ListItemText
                                  primary={c.kod}
                                  secondary={[c.kde, c.kdy, c.forma, c.poradatel, `${c.hodiny || 0} h`, c.certifikat ? 'certifikát ✓' : null].filter(Boolean).join(' · ')}
                                />
                              </ListItem>
                            ))}
                          </List>
                          <Button size="small" startIcon={<AddIcon />} onClick={() => setCourseDialogFor(foster.id)} disabled={!foster.id}>
                            Zapsat kurz
                          </Button>
                        </Box>
                      </Stack>
                      {idx < (family.fosters ?? []).length - 1 && <Divider sx={{ mt: 2 }} />}
                    </Box>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {tab === 'respit' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: bento.gap }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: bento.gap }}>
                <StatCard label="Vykázaný respit" value={`${vykazano} / ${limit} dní`} sub="legislativa/finance" color={vykazano > limit ? 'error' : 'primary'} />
                <StatCard label="Reálný odpočinek" value={`${realny} dní`} sub="všechny děti současně mimo domov" color={realny < vykazano ? 'warning' : 'success'} />
                <StatCard label="Odměna pěstouna" value={eligible ? 'Nárok' : 'Bez nároku'} sub={odmenaStatusLabel(family.careType, children.length > 0)} color={eligible ? 'success' : 'default'} />
              </Box>

              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Respit = odlehčení pěstouna, počítá se na dohodu/rodinu (ne na dítě). Zákonné minimum 14 dní/rok
                    (§47a zákona 359/1999 Sb.), nadstandard přes individuální plán ochrany dítěte (IPOD). Pravidlo: i
                    hodina hlídání se počítá jako celý den.
                  </Typography>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <TextField
                      label="Nadstandard IPOD (dní)" type="number" size="small" value={nadstandardInput}
                      onChange={(e) => setNadstandardInput(e.target.value)} sx={{ width: 200 }}
                    />
                    <Button size="small" variant="outlined" onClick={handleSaveNadstandard}>Uložit</Button>
                    <Box sx={{ flex: 1 }} />
                    <Button size="small" variant="contained" startIcon={<SpaOutlinedIcon />} onClick={() => setRespitDialogOpen(true)}>
                      Zaznamenat čerpání respitu
                    </Button>
                  </Stack>
                  <List dense>
                    {respitEvents.length === 0 && (
                      <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>Zatím žádné čerpání respitu.</Typography>
                    )}
                    {respitEvents.map((ev) => (
                      <ListItem key={ev.id} disableGutters divider>
                        <ListItemText
                          primary={`${respitTypeLabel(ev.typ)} — ${respitEventDays(ev)} ${respitEventDays(ev) === 1 ? 'den' : 'dny'}`}
                          secondary={[
                            ev.from === ev.to ? ev.from : `${ev.from} – ${ev.to}`,
                            ev.childIds?.length ? `${ev.childIds.length} dětí` : null,
                            ev.kc ? `${ev.kc} Kč` : null,
                          ].filter(Boolean).join(' · ')}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>

              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>SPVPP — finanční peněženka dítěte</Typography>
                  {children.length === 0 && <Typography variant="body2" color="text.secondary">Rodina zatím nemá svěřené dítě.</Typography>}
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: bento.gap }}>
                    {children.map((child) => {
                      const wallet = child.spvpp ?? { rozpocet: 48000, vycerpano: 0 };
                      const zustatek = wallet.rozpocet - wallet.vycerpano;
                      return (
                        <Card key={child.id} variant="outlined">
                          <CardContent>
                            <Typography fontWeight={600}>{child.firstName} {child.lastName}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              Vyčerpáno {wallet.vycerpano.toLocaleString('cs-CZ')} / {wallet.rozpocet.toLocaleString('cs-CZ')} Kč
                            </Typography>
                            <Typography variant="body2" sx={{ color: zustatek < 0 ? 'error.main' : 'success.main', fontWeight: 600 }}>
                              Zůstatek: {zustatek.toLocaleString('cs-CZ')} Kč
                            </Typography>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </Box>
                </CardContent>
              </Card>
            </Box>
          )}

          {tab === 'social' && (
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h6" fontWeight={700}>Sociální prostor domácnosti</Typography>
                </Stack>
                <Typography variant="overline" color="text.secondary" fontWeight={700}>Manžel / partner</Typography>
                {socialForm.partner?.name ? (
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {socialForm.partner.name}{socialForm.partner.rc ? ` · RČ ${socialForm.partner.rc}` : ''}{socialForm.partner.phone ? ` · ${socialForm.partner.phone}` : ''}
                  </Typography>
                ) : (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Nevyplněno.</Typography>
                    <Button size="small" onClick={() => { setSocialKind('partner'); setSocialEntry({ name: '', rc: '', phone: '', relationship: '' }); setSocialDialogOpen(true); }}>
                      Doplnit partnera
                    </Button>
                  </Box>
                )}

                <Divider sx={{ my: 2 }} />
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="overline" color="text.secondary" fontWeight={700}>Biologické děti (mimo pěstounskou péči)</Typography>
                  <Button size="small" startIcon={<AddIcon />} onClick={() => { setSocialKind('child'); setSocialEntry({ name: '', rc: '', birthDate: '' }); setSocialDialogOpen(true); }}>Přidat</Button>
                </Stack>
                <List dense>
                  {(socialForm.biologicalChildren ?? []).length === 0 && <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>Žádné.</Typography>}
                  {(socialForm.biologicalChildren ?? []).map((c, i) => (
                    <ListItem key={i} disableGutters><ListItemText primary={c.name} secondary={[c.rc && `RČ ${c.rc}`, c.birthDate].filter(Boolean).join(' · ')} /></ListItem>
                  ))}
                </List>

                <Divider sx={{ my: 2 }} />
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="overline" color="text.secondary" fontWeight={700}>Rodiče pěstouna</Typography>
                  <Button size="small" startIcon={<AddIcon />} onClick={() => { setSocialKind('parent'); setSocialEntry({ name: '', rc: '', phone: '' }); setSocialDialogOpen(true); }}>Přidat</Button>
                </Stack>
                <List dense>
                  {(socialForm.parents ?? []).length === 0 && <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>Žádní.</Typography>}
                  {(socialForm.parents ?? []).map((p, i) => (
                    <ListItem key={i} disableGutters><ListItemText primary={p.name} secondary={[p.rc && `RČ ${p.rc}`, p.phone].filter(Boolean).join(' · ')} /></ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}

          {tab === 'deti' && (
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="h6" fontWeight={700}>Svěřené děti ({children.length})</Typography>
                  <Button size="small" startIcon={<ChildFriendlyOutlinedIcon />} onClick={() => setChildDialogOpen(true)}>Přidat dítě</Button>
                </Stack>
                <List>
                  {children.length === 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                      Této rodině zatím nejsou přiřazené žádné děti.
                    </Typography>
                  )}
                  {children.map((child) => (
                    <ListItem
                      key={child.id}
                      disableGutters
                      divider
                      onClick={() => navigate(`/admin/terenni/${familyId}/deti/${child.id}`)}
                      sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: (t) => alpha(t.palette.secondary.main, 0.2), color: 'secondary.dark' }}>
                          <ChildCareIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`${child.firstName ?? ''} ${child.lastName ?? ''}`.trim() || '(bez jména)'}
                        secondary={[child.rc && `RČ ${child.rc}`, `narození ${formatBirthDate(child.birthDate)}`].filter(Boolean).join(' · ')}
                      />
                      <Chip size="small" label={child.status ?? 'active'} sx={{ mr: 1 }} />
                      <ChevronRightIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* ── Dialogy ── */}

      <Dialog open={fosterDialogOpen} onClose={() => !submitting && setFosterDialogOpen(false)} maxWidth="xs" fullWidth>
        <Box component="form" onSubmit={handleAddFoster}>
          <DialogTitle>Přidat pěstouna</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            {submitError && <Alert severity="error">{submitError}</Alert>}
            <TextField label="Jméno a příjmení" value={fosterForm.name} onChange={(e) => setFosterForm((f) => ({ ...f, name: e.target.value }))} fullWidth required disabled={submitting} autoFocus />
            <TextField label="Rodné číslo" placeholder="např. 765912/3210" value={fosterForm.rc} onChange={(e) => setFosterForm((f) => ({ ...f, rc: e.target.value }))} fullWidth disabled={submitting} helperText="Primární identifikátor osoby — nemění se." />
            <TextField label="Telefon" value={fosterForm.phone} onChange={(e) => setFosterForm((f) => ({ ...f, phone: e.target.value }))} fullWidth disabled={submitting} />
            <TextField label="E-mail" value={fosterForm.email} onChange={(e) => setFosterForm((f) => ({ ...f, email: e.target.value }))} fullWidth disabled={submitting} />
            <TextField label="Adresa trvalého bydliště" value={fosterForm.addressPermanentText} onChange={(e) => setFosterForm((f) => ({ ...f, addressPermanentText: e.target.value }))} fullWidth disabled={submitting} />
            <TextField label="Adresa pobytu (pokud jiná)" value={fosterForm.addressResidenceText} onChange={(e) => setFosterForm((f) => ({ ...f, addressResidenceText: e.target.value }))} fullWidth disabled={submitting} />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={() => setFosterDialogOpen(false)} disabled={submitting}>Zrušit</Button>
            <Button type="submit" variant="contained" disabled={submitting}>Přidat</Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog open={!!courseDialogFor} onClose={() => !submitting && setCourseDialogFor(null)} maxWidth="xs" fullWidth>
        <Box component="form" onSubmit={handleAddCourse}>
          <DialogTitle>Zapsat vzdělávání</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            {submitError && <Alert severity="error">{submitError}</Alert>}
            <TextField label="Kód / název kurzu" value={courseForm.kod} onChange={(e) => setCourseForm((f) => ({ ...f, kod: e.target.value }))} fullWidth required disabled={submitting} autoFocus />
            <TextField label="Kde" value={courseForm.kde} onChange={(e) => setCourseForm((f) => ({ ...f, kde: e.target.value }))} fullWidth disabled={submitting} />
            <TextField label="Kdy" type="date" value={courseForm.kdy} onChange={(e) => setCourseForm((f) => ({ ...f, kdy: e.target.value }))} fullWidth disabled={submitting} InputLabelProps={{ shrink: true }} />
            <TextField label="Forma" placeholder="prezenčně / online / kombinovaně" value={courseForm.forma} onChange={(e) => setCourseForm((f) => ({ ...f, forma: e.target.value }))} fullWidth disabled={submitting} />
            <TextField label="Pořadatel" value={courseForm.poradatel} onChange={(e) => setCourseForm((f) => ({ ...f, poradatel: e.target.value }))} fullWidth disabled={submitting} />
            <TextField label="Hodiny" type="number" value={courseForm.hodiny} onChange={(e) => setCourseForm((f) => ({ ...f, hodiny: e.target.value }))} fullWidth disabled={submitting} />
            <FormControlLabel
              control={<Checkbox checked={courseForm.certifikat} onChange={(e) => setCourseForm((f) => ({ ...f, certifikat: e.target.checked }))} disabled={submitting} />}
              label="Certifikát vydán"
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={() => setCourseDialogFor(null)} disabled={submitting}>Zrušit</Button>
            <Button type="submit" variant="contained" disabled={submitting}>Zapsat</Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog open={respitDialogOpen} onClose={() => !submitting && setRespitDialogOpen(false)} maxWidth="xs" fullWidth>
        <Box component="form" onSubmit={handleAddRespit}>
          <DialogTitle>Zaznamenat čerpání respitu</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            {submitError && <Alert severity="error">{submitError}</Alert>}
            <TextField label="Od" type="date" value={respitForm.from} onChange={(e) => setRespitForm((f) => ({ ...f, from: e.target.value }))} fullWidth required disabled={submitting} InputLabelProps={{ shrink: true }} />
            <TextField label="Do" type="date" value={respitForm.to} onChange={(e) => setRespitForm((f) => ({ ...f, to: e.target.value }))} fullWidth disabled={submitting} InputLabelProps={{ shrink: true }} helperText="Prázdné = jednodenní čerpání." />
            <TextField select label="Typ" value={respitForm.typ} onChange={(e) => setRespitForm((f) => ({ ...f, typ: e.target.value }))} fullWidth disabled={submitting}>
              {RESPIT_TYPES.map((t) => <MenuItem key={t.key} value={t.key}>{t.label}</MenuItem>)}
            </TextField>
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Které děti byly mimo domov</Typography>
              <FormGroup>
                {children.map((c) => (
                  <FormControlLabel
                    key={c.id}
                    control={
                      <Checkbox
                        checked={respitForm.childIds.includes(c.id)}
                        onChange={(e) => setRespitForm((f) => ({
                          ...f,
                          childIds: e.target.checked ? [...f.childIds, c.id] : f.childIds.filter((id) => id !== c.id),
                        }))}
                        disabled={submitting}
                      />
                    }
                    label={`${c.firstName} ${c.lastName}`}
                  />
                ))}
              </FormGroup>
            </Box>
            <TextField label="Náklad na respit (Kč, volitelné)" type="number" value={respitForm.kc} onChange={(e) => setRespitForm((f) => ({ ...f, kc: e.target.value }))} fullWidth disabled={submitting} helperText="Rozpočítá se rovným dílem mezi vybrané děti a odečte z jejich SPVPP." />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={() => setRespitDialogOpen(false)} disabled={submitting}>Zrušit</Button>
            <Button type="submit" variant="contained" disabled={submitting}>Zapsat</Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog open={socialDialogOpen} onClose={() => !submitting && setSocialDialogOpen(false)} maxWidth="xs" fullWidth>
        <Box component="form" onSubmit={handleSaveSocial}>
          <DialogTitle>
            {socialKind === 'partner' ? 'Manžel / partner' : socialKind === 'child' ? 'Biologické dítě' : 'Rodič pěstouna'}
          </DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            {submitError && <Alert severity="error">{submitError}</Alert>}
            <TextField label="Jméno a příjmení" value={socialEntry.name} onChange={(e) => setSocialEntry((f) => ({ ...f, name: e.target.value }))} fullWidth required disabled={submitting} autoFocus />
            <TextField label="Rodné číslo" value={socialEntry.rc} onChange={(e) => setSocialEntry((f) => ({ ...f, rc: e.target.value }))} fullWidth disabled={submitting} />
            {socialKind === 'child' ? (
              <TextField label="Datum narození" type="date" value={socialEntry.birthDate} onChange={(e) => setSocialEntry((f) => ({ ...f, birthDate: e.target.value }))} fullWidth disabled={submitting} InputLabelProps={{ shrink: true }} />
            ) : (
              <TextField label="Telefon" value={socialEntry.phone} onChange={(e) => setSocialEntry((f) => ({ ...f, phone: e.target.value }))} fullWidth disabled={submitting} />
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={() => setSocialDialogOpen(false)} disabled={submitting}>Zrušit</Button>
            <Button type="submit" variant="contained" disabled={submitting}>Uložit</Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog open={childDialogOpen} onClose={() => !submitting && setChildDialogOpen(false)} maxWidth="xs" fullWidth>
        <Box component="form" onSubmit={handleAddChild}>
          <DialogTitle>Přidat dítě</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            {submitError && <Alert severity="error">{submitError}</Alert>}
            <TextField label="Jméno" value={childForm.firstName} onChange={(e) => setChildForm((f) => ({ ...f, firstName: e.target.value }))} fullWidth required disabled={submitting} autoFocus />
            <TextField label="Příjmení" value={childForm.lastName} onChange={(e) => setChildForm((f) => ({ ...f, lastName: e.target.value }))} fullWidth required disabled={submitting} />
            <TextField label="Rodné číslo" placeholder="např. 145623/7890" value={childForm.rc} onChange={(e) => setChildForm((f) => ({ ...f, rc: e.target.value }))} fullWidth disabled={submitting} helperText="Primární identifikátor osoby — nemění se." />
            <TextField label="Datum narození" type="date" value={childForm.birthDate} onChange={(e) => setChildForm((f) => ({ ...f, birthDate: e.target.value }))} fullWidth disabled={submitting} InputLabelProps={{ shrink: true }} />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={() => setChildDialogOpen(false)} disabled={submitting}>Zrušit</Button>
            <Button type="submit" variant="contained" disabled={submitting}>Přidat</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
