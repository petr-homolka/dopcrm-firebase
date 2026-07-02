/**
 * FosterFamilyDetailPage.jsx — Krok 3/4 zadání (2026-07-01), obohaceno 2026-07-02
 *
 * Detail pěstounské rodiny: pěstouni (osoby, RČ, vzdělávání) + svěřené děti
 * (klikací → ChildDetailPage). Přístupné superadmin/org_admin (celá
 * organizace) i klíčové osobě (přidělené i cizí rodiny ke čtení) — viz
 * firestore.rules.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Chip, CircularProgress, Alert,
  IconButton, List, ListItem, ListItemAvatar, ListItemText, Avatar, Stack,
  Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
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

import { bento } from '../../core/theme.js';
import { careLabel } from '../../shared/domainConstants.js';
import { getFoster, listChildrenByFamily, setFosterPersons, createChild } from '../../services/orgService.js';

const STATUS_LABELS = { active: 'Aktivní', paused: 'Pozastaveno', exited: 'Ukončeno' };
const STATUS_COLOR = { active: 'success', paused: 'warning', exited: 'default' };

function formatBirthDate(value) {
  if (!value) return '—';
  const date = typeof value.toDate === 'function' ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('cs-CZ');
}

const emptyFosterForm = { name: '', rc: '', phone: '', email: '' };
const emptyChildForm = { firstName: '', lastName: '', rc: '', birthDate: '' };

export default function FosterFamilyDetailPage() {
  const { familyId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [family, setFamily] = useState(null);
  const [children, setChildren] = useState([]);

  const [fosterDialogOpen, setFosterDialogOpen] = useState(false);
  const [fosterForm, setFosterForm] = useState(emptyFosterForm);
  const [childDialogOpen, setChildDialogOpen] = useState(false);
  const [childForm, setChildForm] = useState(emptyChildForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [familyData, childrenData] = await Promise.all([
        getFoster(familyId),
        listChildrenByFamily(familyId),
      ]);
      if (!familyData) throw new Error('Rodina nenalezena.');
      setFamily(familyData);
      setChildren(childrenData);
    } catch (err) {
      console.error('[FosterFamilyDetailPage] Načtení selhalo:', err);
      setError(err.message ?? 'Data se nepodařilo načíst.');
    } finally {
      setLoading(false);
    }
  }, [familyId]);

  useEffect(() => { load(); }, [load]);

  async function handleAddFoster(e) {
    e.preventDefault();
    setSubmitError('');
    if (!fosterForm.name.trim()) {
      setSubmitError('Zadejte jméno pěstouna.');
      return;
    }
    setSubmitting(true);
    try {
      const fosters = [...(family.fosters ?? []), { ...fosterForm, name: fosterForm.name.trim() }];
      await setFosterPersons(familyId, fosters);
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
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: bento.gap }}>
          <Card sx={{ gridColumn: { xs: 'span 1', md: 'span 1' } }}>
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
              {!family.address && !family.contactPhone && !family.contactEmail && (
                <Typography variant="body2" color="text.secondary">Zatím bez kontaktních údajů.</Typography>
              )}
              {family.note && (
                <>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, textTransform: 'uppercase', fontWeight: 600 }}>Poznámka</Typography>
                  <Typography variant="body2">{family.note}</Typography>
                </>
              )}
            </CardContent>
          </Card>

          <Card sx={{ gridColumn: { xs: 'span 1', md: 'span 2' } }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="h6" fontWeight={700}>Pěstouni ({(family.fosters ?? []).length})</Typography>
                <Button size="small" startIcon={<PersonAddOutlinedIcon />} onClick={() => setFosterDialogOpen(true)}>Přidat pěstouna</Button>
              </Stack>
              <List dense>
                {(family.fosters ?? []).length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>Zatím žádný pěstoun v evidenci.</Typography>
                )}
                {(family.fosters ?? []).map((foster, idx) => (
                  <ListItem key={idx} disableGutters divider>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: (t) => alpha(t.palette.primary.main, 0.14), color: 'primary.main' }}>
                        <PersonIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={foster.name}
                      secondary={[foster.rc && `RČ ${foster.rc}`, foster.phone, foster.email].filter(Boolean).join(' · ') || '—'}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          <Card sx={{ gridColumn: { xs: 'span 1', md: 'span 3' } }}>
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
        </Box>
      )}

      <Dialog open={fosterDialogOpen} onClose={() => !submitting && setFosterDialogOpen(false)} maxWidth="xs" fullWidth>
        <Box component="form" onSubmit={handleAddFoster}>
          <DialogTitle>Přidat pěstouna</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            {submitError && <Alert severity="error">{submitError}</Alert>}
            <TextField label="Jméno a příjmení" value={fosterForm.name} onChange={(e) => setFosterForm((f) => ({ ...f, name: e.target.value }))} fullWidth required disabled={submitting} autoFocus />
            <TextField label="Rodné číslo" placeholder="např. 765912/3210" value={fosterForm.rc} onChange={(e) => setFosterForm((f) => ({ ...f, rc: e.target.value }))} fullWidth disabled={submitting} helperText="Primární identifikátor osoby — nemění se." />
            <TextField label="Telefon" value={fosterForm.phone} onChange={(e) => setFosterForm((f) => ({ ...f, phone: e.target.value }))} fullWidth disabled={submitting} />
            <TextField label="E-mail" value={fosterForm.email} onChange={(e) => setFosterForm((f) => ({ ...f, email: e.target.value }))} fullWidth disabled={submitting} />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={() => setFosterDialogOpen(false)} disabled={submitting}>Zrušit</Button>
            <Button type="submit" variant="contained" disabled={submitting}>Přidat</Button>
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
