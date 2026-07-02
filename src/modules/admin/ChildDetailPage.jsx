/**
 * ChildDetailPage.jsx — nejnižší úroveň hierarchie (2026-07-02, obohaceno Fáze 3)
 *
 * Karta dítěte: identita (RČ/OP/pas), adresy s historií, škola, OSPOD, soud,
 * biologická rodina (REL_TYPES) a sociální prostor, předchozí pěstouni, trvalé
 * poznámky a historie změn ("nic se nepřepisuje" — port App.histAdd/histList
 * z vanilla prototypu). Dostupné superadmin/org_admin (celá organizace) i
 * klíčové osobě — dokončuje hierarchickou viditelnost až na úroveň dítěte.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Chip, CircularProgress, Alert,
  IconButton, Stack, Button, TextField, MenuItem, Dialog, DialogTitle,
  DialogContent, DialogActions, List, ListItem, ListItemText, Divider, Tabs, Tab,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import CakeOutlinedIcon from '@mui/icons-material/CakeOutlined';
import AddIcon from '@mui/icons-material/Add';

import { bento } from '../../core/theme.js';
import { careLabel, REL_TYPES, relGroups, relLegalLabel, relLegalColor } from '../../shared/domainConstants.js';
import {
  getChild, setChildRelatives, updateChildTracked, addPermanentNote,
  addPreviousFoster, addCourtVerdict, setChildSocialSpace, listChildHistory,
} from '../../services/orgService.js';

function formatDate(value) {
  if (!value) return '—';
  const date = typeof value.toDate === 'function' ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('cs-CZ');
}

function addressLabel(a) {
  if (!a) return null;
  return [a.street, a.city, a.zip].filter(Boolean).join(', ') || null;
}

const emptyRelForm = { name: '', rc: '', rel: REL_TYPES[0].key, phone: '', email: '', note: '' };
const emptySocialForm = { name: '', vztah: '', phone: '', email: '', note: '' };
const emptyAddressForm = { street: '', city: '', zip: '' };
const emptySchoolForm = { nazev: '', adresa: '', telefon: '', email: '', tridniUcitel: '', rocnik: '' };
const emptyOspodForm = { nazev: '', osoba: '' };
const emptyCourtForm = { spisZnacka: '', soudNazev: '', soudAdresa: '', kontaktniOsoba: '' };
const emptyVerdictForm = { datum: '', popis: '' };
const emptyDocsForm = { idCardNumber: '', idCardValidUntil: '', passportNumber: '', passportValidUntil: '' };
const emptyFosterHistForm = { name: '', from: '', to: '', note: '' };

const TABS = [
  { key: 'identita', label: 'Identita' },
  { key: 'skola', label: 'Škola' },
  { key: 'ospod', label: 'OSPOD a soud' },
  { key: 'rodina', label: 'Biologická rodina' },
  { key: 'socialni', label: 'Sociální prostor' },
  { key: 'poznamky', label: 'Poznámky' },
  { key: 'historie', label: 'Historie' },
];

export default function ChildDetailPage() {
  const { familyId, childId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [child, setChild] = useState(null);
  const [history, setHistory] = useState([]);
  const [tab, setTab] = useState('identita');

  const [relDialogOpen, setRelDialogOpen] = useState(false);
  const [relForm, setRelForm] = useState(emptyRelForm);
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

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [data, hist] = await Promise.all([getChild(childId), listChildHistory(childId)]);
      if (!data) throw new Error('Dítě nenalezeno.');
      setChild(data);
      setHistory(hist);
    } catch (err) {
      console.error('[ChildDetailPage] Načtení selhalo:', err);
      setError(err.message ?? 'Data se nepodařilo načíst.');
    } finally {
      setLoading(false);
    }
  }, [childId]);

  useEffect(() => { load(); }, [load]);

  function withSubmit(fn) {
    return async (e) => {
      e.preventDefault();
      setSubmitError('');
      setSubmitting(true);
      try {
        await fn();
        await load();
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
    setRelForm(emptyRelForm);
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

  const groups = relGroups();

  return (
    <Box>
      <Stack direction="row" alignItems="flex-start" spacing={1.5} sx={{ mb: 3, flexWrap: 'wrap', rowGap: 1 }}>
        <IconButton onClick={() => navigate(`/admin/terenni/${familyId}`)} aria-label="Zpět na rodinu" sx={{ mt: 0.5 }}><ArrowBackIcon /></IconButton>
        <Typography variant="h4" fontWeight={700} sx={{ flex: '1 1 auto', minWidth: 0, wordBreak: 'break-word' }}>
          {loading ? 'Načítám…' : `${child?.firstName ?? ''} ${child?.lastName ?? ''}`.trim()}
        </Typography>
        {child && <Chip label={careLabel(child.careType)} sx={{ mt: 0.5 }} />}
      </Stack>

      {loading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 6, justifyContent: 'center' }}>
          <CircularProgress size={28} />
        </Box>
      )}

      {!loading && error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && child && (
        <>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
            {TABS.map((t) => <Tab key={t.key} value={t.key} label={t.label} />)}
          </Tabs>

          {tab === 'identita' && (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: bento.gap }}>
              <Card>
                <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Typography variant="overline" color="text.secondary" fontWeight={700}>Základní identita</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                    <BadgeOutlinedIcon fontSize="small" />
                    <Typography variant="body2">{child.rc ? `RČ ${child.rc}` : 'Rodné číslo nezadáno'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                    <CakeOutlinedIcon fontSize="small" />
                    <Typography variant="body2">Narození {formatDate(child.birthDate)}</Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2">
                    Občanský průkaz: {child.idCard ? `${child.idCard.number}${child.idCard.validUntil ? ` (platný do ${child.idCard.validUntil})` : ''}` : 'nevydán'}
                  </Typography>
                  <Typography variant="body2">
                    Cestovní pas: {child.passport ? `${child.passport.number}${child.passport.validUntil ? ` (platný do ${child.passport.validUntil})` : ''}` : 'nevydán'}
                  </Typography>
                  <Button size="small" sx={{ alignSelf: 'flex-start', mt: 1 }} onClick={() => {
                    setDocsForm({
                      idCardNumber: child.idCard?.number ?? '', idCardValidUntil: child.idCard?.validUntil ?? '',
                      passportNumber: child.passport?.number ?? '', passportValidUntil: child.passport?.validUntil ?? '',
                    });
                    setDocsDialogOpen(true);
                  }}>
                    {child.idCard || child.passport ? 'Upravit doklady' : 'Doplnit doklady'}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Typography variant="overline" color="text.secondary" fontWeight={700}>Adresy</Typography>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>Trvalé bydliště</Typography>
                    <Typography variant="body2" color="text.secondary">{addressLabel(child.addressPermanent) ?? 'Nevyplněno'}</Typography>
                    <Button size="small" onClick={() => { setAddressForm(child.addressPermanent ?? emptyAddressForm); setAddressDialogFor('addressPermanent'); }}>Upravit</Button>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="body2" fontWeight={600}>Adresa pobytu (pokud jiná)</Typography>
                    <Typography variant="body2" color="text.secondary">{addressLabel(child.addressResidence) ?? 'Stejná jako trvalé bydliště'}</Typography>
                    <Button size="small" onClick={() => { setAddressForm(child.addressResidence ?? emptyAddressForm); setAddressDialogFor('addressResidence'); }}>Upravit</Button>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          )}

          {tab === 'skola' && (
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="h6" fontWeight={700}>Škola</Typography>
                  <Button size="small" onClick={() => { setSchoolForm(child.school ?? emptySchoolForm); setSchoolDialogOpen(true); }}>
                    {child.school ? 'Upravit' : 'Doplnit'}
                  </Button>
                </Stack>
                {child.school ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography fontWeight={600}>{child.school.nazev}</Typography>
                    <Typography variant="body2" color="text.secondary">{child.school.adresa}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {[child.school.telefon, child.school.email].filter(Boolean).join(' · ')}
                    </Typography>
                    <Typography variant="body2">Třídní učitel: {child.school.tridniUcitel || '—'}</Typography>
                    <Typography variant="body2">Ročník: {child.school.rocnik || '—'}</Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">Zatím nevyplněno.</Typography>
                )}
              </CardContent>
            </Card>
          )}

          {tab === 'ospod' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: bento.gap }}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Typography variant="h6" fontWeight={700}>Příslušnost OSPOD</Typography>
                    <Button size="small" onClick={() => { setOspodForm(child.ospod ?? emptyOspodForm); setOspodDialogOpen(true); }}>
                      {child.ospod ? 'Upravit' : 'Doplnit'}
                    </Button>
                  </Stack>
                  {child.ospod ? (
                    <Typography variant="body2">{child.ospod.nazev} — kontaktní osoba: {child.ospod.osoba || '—'}</Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">Zatím nevyplněno.</Typography>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Typography variant="h6" fontWeight={700}>Soud</Typography>
                    <Button size="small" onClick={() => { setCourtForm(child.courtCase ?? emptyCourtForm); setCourtDialogOpen(true); }}>
                      {child.courtCase ? 'Upravit' : 'Doplnit'}
                    </Button>
                  </Stack>
                  {child.courtCase ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 2 }}>
                      <Typography variant="body2">Spisová značka: <b>{child.courtCase.spisZnacka || '—'}</b></Typography>
                      <Typography variant="body2">{child.courtCase.soudNazev}</Typography>
                      <Typography variant="body2" color="text.secondary">{child.courtCase.soudAdresa}</Typography>
                      <Typography variant="body2">Kontaktní osoba: {child.courtCase.kontaktniOsoba || '—'}</Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Zatím nevyplněno.</Typography>
                  )}
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Typography variant="subtitle2" fontWeight={700}>Rozsudky a usnesení</Typography>
                    <Button size="small" startIcon={<AddIcon />} onClick={() => setVerdictDialogOpen(true)}>Přidat</Button>
                  </Stack>
                  <List dense>
                    {(child.courtCase?.rozsudky ?? []).length === 0 && <Typography variant="body2" color="text.secondary">Žádné záznamy.</Typography>}
                    {(child.courtCase?.rozsudky ?? []).map((v) => (
                      <ListItem key={v.id} disableGutters divider>
                        <ListItemText primary={v.popis} secondary={v.datum} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Box>
          )}

          {tab === 'rodina' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: bento.gap }}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Typography variant="h6" fontWeight={700}>Biologická rodina ({(child.relatives ?? []).length})</Typography>
                    <Button size="small" startIcon={<PersonAddOutlinedIcon />} onClick={() => setRelDialogOpen(true)}>Přidat příbuzného</Button>
                  </Stack>
                  <List dense>
                    {(child.relatives ?? []).length === 0 && (
                      <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>Zatím žádní evidovaní příbuzní.</Typography>
                    )}
                    {(child.relatives ?? []).map((rel, idx) => {
                      const relType = REL_TYPES.find((r) => r.key === rel.rel);
                      return (
                        <ListItem key={rel.id ?? idx} disableGutters divider alignItems="flex-start">
                          <ListItemText
                            primary={rel.name}
                            secondary={[relType?.label ?? rel.rel, rel.rc && `RČ ${rel.rc}`, rel.phone, rel.email, rel.note].filter(Boolean).join(' · ')}
                          />
                          <Chip size="small" label={relLegalLabel(rel.legal)} color={relLegalColor(rel.legal)} variant="outlined" />
                        </ListItem>
                      );
                    })}
                  </List>
                </CardContent>
              </Card>

              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Typography variant="h6" fontWeight={700}>Předchozí pěstounské rodiny ({(child.previousFosters ?? []).length})</Typography>
                    <Button size="small" startIcon={<AddIcon />} onClick={() => setFosterHistDialogOpen(true)}>Přidat</Button>
                  </Stack>
                  <List dense>
                    {(child.previousFosters ?? []).length === 0 && <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>Žádné předchozí umístění v evidenci.</Typography>}
                    {(child.previousFosters ?? []).map((pf) => (
                      <ListItem key={pf.id} disableGutters divider>
                        <ListItemText primary={pf.name} secondary={[pf.from && `od ${pf.from}`, pf.to && `do ${pf.to}`, pf.note].filter(Boolean).join(' · ')} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Box>
          )}

          {tab === 'socialni' && (
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="h6" fontWeight={700}>Sociální prostor ({(child.socialSpace ?? []).length})</Typography>
                  <Button size="small" startIcon={<PersonAddOutlinedIcon />} onClick={() => setSocialDialogOpen(true)}>Přidat osobu</Button>
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Osoby v okolí dítěte bez biologické vazby — kmotři, blízcí rodinní přátelé, širší okolí.
                </Typography>
                <List dense>
                  {(child.socialSpace ?? []).length === 0 && <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>Zatím nikdo evidován.</Typography>}
                  {(child.socialSpace ?? []).map((p) => (
                    <ListItem key={p.id} disableGutters divider>
                      <ListItemText primary={p.name} secondary={[p.vztah, p.phone, p.email, p.note].filter(Boolean).join(' · ')} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}

          {tab === 'poznamky' && (
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Trvalé poznámky</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Zápisy zůstávají navždy v evidenci beze změny nebo smazání — důkazní hodnota pro OSPOD/soud.
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                  <TextField placeholder="Nová poznámka…" value={noteText} onChange={(e) => setNoteText(e.target.value)} fullWidth multiline minRows={2} disabled={submitting} />
                  <Button variant="contained" onClick={handleAddNote} disabled={submitting} sx={{ alignSelf: 'flex-end' }}>Zapsat</Button>
                </Stack>
                {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}
                <List dense>
                  {(child.permanentNotes ?? []).length === 0 && <Typography variant="body2" color="text.secondary">Žádné poznámky.</Typography>}
                  {[...(child.permanentNotes ?? [])].reverse().map((n, i) => (
                    <ListItem key={i} disableGutters divider alignItems="flex-start">
                      <ListItemText primary={n.text} secondary={n.at ? new Date(n.at).toLocaleString('cs-CZ') : ''} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}

          {tab === 'historie' && (
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Historie změn</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  "Nic se nepřepisuje" — každá změna adresy, školy, OSPOD nebo soudního spisu zůstává dohledatelná.
                </Typography>
                <List dense>
                  {history.length === 0 && <Typography variant="body2" color="text.secondary">Zatím žádné zaznamenané změny.</Typography>}
                  {history.map((h) => (
                    <ListItem key={h.id} disableGutters divider>
                      <ListItemText primary={`${h.field}: ${h.from} → ${h.to}`} secondary={h.by} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* ── Dialogy ── */}

      <Dialog open={relDialogOpen} onClose={() => !submitting && setRelDialogOpen(false)} maxWidth="xs" fullWidth>
        <Box component="form" onSubmit={handleAddRelative}>
          <DialogTitle>Přidat příbuzného</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            {submitError && <Alert severity="error">{submitError}</Alert>}
            <TextField label="Jméno a příjmení" value={relForm.name} onChange={(e) => setRelForm((f) => ({ ...f, name: e.target.value }))} fullWidth required disabled={submitting} autoFocus />
            <TextField label="Rodné číslo" placeholder="např. 654321/0987" value={relForm.rc} onChange={(e) => setRelForm((f) => ({ ...f, rc: e.target.value }))} fullWidth disabled={submitting} />
            <TextField select label="Typ vztahu" value={relForm.rel} onChange={(e) => setRelForm((f) => ({ ...f, rel: e.target.value }))} fullWidth disabled={submitting}>
              {Object.entries(groups).map(([groupName, items]) => [
                <Divider key={`div-${groupName}`} textAlign="left" sx={{ '&::before, &::after': { borderColor: 'transparent' }, fontSize: 11, color: 'text.disabled', textTransform: 'uppercase', pl: 1 }}>{groupName}</Divider>,
                ...items.map((r) => <MenuItem key={r.key} value={r.key}>{r.label}</MenuItem>),
              ])}
            </TextField>
            <TextField label="Telefon" value={relForm.phone} onChange={(e) => setRelForm((f) => ({ ...f, phone: e.target.value }))} fullWidth disabled={submitting} />
            <TextField label="E-mail" value={relForm.email} onChange={(e) => setRelForm((f) => ({ ...f, email: e.target.value }))} fullWidth disabled={submitting} />
            <TextField label="Poznámka" placeholder="např. styk 1× měsíčně" value={relForm.note} onChange={(e) => setRelForm((f) => ({ ...f, note: e.target.value }))} fullWidth multiline minRows={2} disabled={submitting} />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={() => setRelDialogOpen(false)} disabled={submitting}>Zrušit</Button>
            <Button type="submit" variant="contained" disabled={submitting}>Přidat</Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog open={socialDialogOpen} onClose={() => !submitting && setSocialDialogOpen(false)} maxWidth="xs" fullWidth>
        <Box component="form" onSubmit={handleAddSocial}>
          <DialogTitle>Přidat do sociálního prostoru</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            {submitError && <Alert severity="error">{submitError}</Alert>}
            <TextField label="Jméno a příjmení" value={socialForm.name} onChange={(e) => setSocialForm((f) => ({ ...f, name: e.target.value }))} fullWidth required disabled={submitting} autoFocus />
            <TextField label="Vztah k dítěti" placeholder="např. kmotra, rodinná přítelkyně" value={socialForm.vztah} onChange={(e) => setSocialForm((f) => ({ ...f, vztah: e.target.value }))} fullWidth disabled={submitting} />
            <TextField label="Telefon" value={socialForm.phone} onChange={(e) => setSocialForm((f) => ({ ...f, phone: e.target.value }))} fullWidth disabled={submitting} />
            <TextField label="E-mail" value={socialForm.email} onChange={(e) => setSocialForm((f) => ({ ...f, email: e.target.value }))} fullWidth disabled={submitting} />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={() => setSocialDialogOpen(false)} disabled={submitting}>Zrušit</Button>
            <Button type="submit" variant="contained" disabled={submitting}>Přidat</Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog open={!!addressDialogFor} onClose={() => !submitting && setAddressDialogFor(null)} maxWidth="xs" fullWidth>
        <Box component="form" onSubmit={handleSaveAddress}>
          <DialogTitle>{addressDialogFor === 'addressPermanent' ? 'Adresa trvalého bydliště' : 'Adresa pobytu'}</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            {submitError && <Alert severity="error">{submitError}</Alert>}
            <TextField label="Ulice a číslo" value={addressForm.street} onChange={(e) => setAddressForm((f) => ({ ...f, street: e.target.value }))} fullWidth disabled={submitting} autoFocus />
            <TextField label="Město" value={addressForm.city} onChange={(e) => setAddressForm((f) => ({ ...f, city: e.target.value }))} fullWidth disabled={submitting} />
            <TextField label="PSČ" value={addressForm.zip} onChange={(e) => setAddressForm((f) => ({ ...f, zip: e.target.value }))} fullWidth disabled={submitting} />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={() => setAddressDialogFor(null)} disabled={submitting}>Zrušit</Button>
            <Button type="submit" variant="contained" disabled={submitting}>Uložit</Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog open={schoolDialogOpen} onClose={() => !submitting && setSchoolDialogOpen(false)} maxWidth="xs" fullWidth>
        <Box component="form" onSubmit={handleSaveSchool}>
          <DialogTitle>Škola</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            {submitError && <Alert severity="error">{submitError}</Alert>}
            <TextField label="Název školy" value={schoolForm.nazev} onChange={(e) => setSchoolForm((f) => ({ ...f, nazev: e.target.value }))} fullWidth required disabled={submitting} autoFocus />
            <TextField label="Adresa" value={schoolForm.adresa} onChange={(e) => setSchoolForm((f) => ({ ...f, adresa: e.target.value }))} fullWidth disabled={submitting} />
            <TextField label="Telefon" value={schoolForm.telefon} onChange={(e) => setSchoolForm((f) => ({ ...f, telefon: e.target.value }))} fullWidth disabled={submitting} />
            <TextField label="E-mail" value={schoolForm.email} onChange={(e) => setSchoolForm((f) => ({ ...f, email: e.target.value }))} fullWidth disabled={submitting} />
            <TextField label="Třídní učitel" value={schoolForm.tridniUcitel} onChange={(e) => setSchoolForm((f) => ({ ...f, tridniUcitel: e.target.value }))} fullWidth disabled={submitting} />
            <TextField label="Ročník" value={schoolForm.rocnik} onChange={(e) => setSchoolForm((f) => ({ ...f, rocnik: e.target.value }))} fullWidth disabled={submitting} />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={() => setSchoolDialogOpen(false)} disabled={submitting}>Zrušit</Button>
            <Button type="submit" variant="contained" disabled={submitting}>Uložit</Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog open={ospodDialogOpen} onClose={() => !submitting && setOspodDialogOpen(false)} maxWidth="xs" fullWidth>
        <Box component="form" onSubmit={handleSaveOspod}>
          <DialogTitle>Příslušnost OSPOD</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            {submitError && <Alert severity="error">{submitError}</Alert>}
            <TextField label="Název OSPOD" value={ospodForm.nazev} onChange={(e) => setOspodForm((f) => ({ ...f, nazev: e.target.value }))} fullWidth required disabled={submitting} autoFocus />
            <TextField label="Kontaktní osoba" value={ospodForm.osoba} onChange={(e) => setOspodForm((f) => ({ ...f, osoba: e.target.value }))} fullWidth disabled={submitting} />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={() => setOspodDialogOpen(false)} disabled={submitting}>Zrušit</Button>
            <Button type="submit" variant="contained" disabled={submitting}>Uložit</Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog open={courtDialogOpen} onClose={() => !submitting && setCourtDialogOpen(false)} maxWidth="xs" fullWidth>
        <Box component="form" onSubmit={handleSaveCourt}>
          <DialogTitle>Soud</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            {submitError && <Alert severity="error">{submitError}</Alert>}
            <TextField label="Spisová značka" value={courtForm.spisZnacka} onChange={(e) => setCourtForm((f) => ({ ...f, spisZnacka: e.target.value }))} fullWidth disabled={submitting} autoFocus />
            <TextField label="Název soudu" value={courtForm.soudNazev} onChange={(e) => setCourtForm((f) => ({ ...f, soudNazev: e.target.value }))} fullWidth disabled={submitting} />
            <TextField label="Adresa soudu" value={courtForm.soudAdresa} onChange={(e) => setCourtForm((f) => ({ ...f, soudAdresa: e.target.value }))} fullWidth disabled={submitting} />
            <TextField label="Kontaktní osoba" value={courtForm.kontaktniOsoba} onChange={(e) => setCourtForm((f) => ({ ...f, kontaktniOsoba: e.target.value }))} fullWidth disabled={submitting} />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={() => setCourtDialogOpen(false)} disabled={submitting}>Zrušit</Button>
            <Button type="submit" variant="contained" disabled={submitting}>Uložit</Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog open={verdictDialogOpen} onClose={() => !submitting && setVerdictDialogOpen(false)} maxWidth="xs" fullWidth>
        <Box component="form" onSubmit={handleAddVerdict}>
          <DialogTitle>Přidat rozsudek / usnesení</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            {submitError && <Alert severity="error">{submitError}</Alert>}
            <TextField label="Datum" type="date" value={verdictForm.datum} onChange={(e) => setVerdictForm((f) => ({ ...f, datum: e.target.value }))} fullWidth disabled={submitting} InputLabelProps={{ shrink: true }} />
            <TextField label="Popis" value={verdictForm.popis} onChange={(e) => setVerdictForm((f) => ({ ...f, popis: e.target.value }))} fullWidth multiline minRows={2} required disabled={submitting} />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={() => setVerdictDialogOpen(false)} disabled={submitting}>Zrušit</Button>
            <Button type="submit" variant="contained" disabled={submitting}>Přidat</Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog open={docsDialogOpen} onClose={() => !submitting && setDocsDialogOpen(false)} maxWidth="xs" fullWidth>
        <Box component="form" onSubmit={handleSaveDocs}>
          <DialogTitle>Doklady</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            {submitError && <Alert severity="error">{submitError}</Alert>}
            <TextField label="Číslo OP" value={docsForm.idCardNumber} onChange={(e) => setDocsForm((f) => ({ ...f, idCardNumber: e.target.value }))} fullWidth disabled={submitting} autoFocus />
            <TextField label="OP platný do" type="date" value={docsForm.idCardValidUntil} onChange={(e) => setDocsForm((f) => ({ ...f, idCardValidUntil: e.target.value }))} fullWidth disabled={submitting} InputLabelProps={{ shrink: true }} />
            <TextField label="Číslo cestovního pasu" value={docsForm.passportNumber} onChange={(e) => setDocsForm((f) => ({ ...f, passportNumber: e.target.value }))} fullWidth disabled={submitting} />
            <TextField label="Pas platný do" type="date" value={docsForm.passportValidUntil} onChange={(e) => setDocsForm((f) => ({ ...f, passportValidUntil: e.target.value }))} fullWidth disabled={submitting} InputLabelProps={{ shrink: true }} />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={() => setDocsDialogOpen(false)} disabled={submitting}>Zrušit</Button>
            <Button type="submit" variant="contained" disabled={submitting}>Uložit</Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog open={fosterHistDialogOpen} onClose={() => !submitting && setFosterHistDialogOpen(false)} maxWidth="xs" fullWidth>
        <Box component="form" onSubmit={handleAddFosterHist}>
          <DialogTitle>Předchozí pěstounská rodina</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            {submitError && <Alert severity="error">{submitError}</Alert>}
            <TextField label="Rodina / pěstoun" value={fosterHistForm.name} onChange={(e) => setFosterHistForm((f) => ({ ...f, name: e.target.value }))} fullWidth required disabled={submitting} autoFocus />
            <TextField label="Od" type="date" value={fosterHistForm.from} onChange={(e) => setFosterHistForm((f) => ({ ...f, from: e.target.value }))} fullWidth disabled={submitting} InputLabelProps={{ shrink: true }} />
            <TextField label="Do" type="date" value={fosterHistForm.to} onChange={(e) => setFosterHistForm((f) => ({ ...f, to: e.target.value }))} fullWidth disabled={submitting} InputLabelProps={{ shrink: true }} />
            <TextField label="Poznámka" value={fosterHistForm.note} onChange={(e) => setFosterHistForm((f) => ({ ...f, note: e.target.value }))} fullWidth multiline minRows={2} disabled={submitting} />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={() => setFosterHistDialogOpen(false)} disabled={submitting}>Zrušit</Button>
            <Button type="submit" variant="contained" disabled={submitting}>Přidat</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
