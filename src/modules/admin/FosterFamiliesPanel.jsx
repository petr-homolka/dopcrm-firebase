/**
 * FosterFamiliesPanel.jsx — pěstounské rodiny jedné organizace (2026-07-02)
 *
 * Sdílený panel pro plnou hierarchickou viditelnost: nadřazená role vidí
 * VŠECHNY rodiny (a jejich děti, o úroveň níž) své organizace — ne jen
 * zaměstnance. Použito v OrganizationDetailPage (superadmin, cizí org) i
 * OrgAdminDashboard (vlastní org). Klíčová osoba má vlastní dashboard
 * (KlicovaOsobaDashboard) scoped na "moje rodiny", ale i ta smí tenhle
 * panel použít pro pohled na "celou organizaci" (viz firestore.rules —
 * čtení má povolené celá organizace, jen zápis je omezený na přidělené).
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Button, TextField, MenuItem,
  Table, TableHead, TableBody, TableRow, TableCell, Chip, Alert,
  CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import GroupAddOutlinedIcon from '@mui/icons-material/GroupAddOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

import { listFostersByOrg, listKlicoveOsobyByOrg, createFoster } from '../../services/orgService.js';
import { CARE_TYPES, careLabel } from '../../shared/domainConstants.js';
import EmptyState from './EmptyState.jsx';

const STATUS_LABEL = { active: 'Aktivní', paused: 'Pozastaveno', exited: 'Ukončeno' };
const STATUS_COLOR = { active: 'success', paused: 'warning', exited: 'default' };

const emptyForm = { name: '', address: '', contactPhone: '', careType: 'long', assignedTo: '' };

export default function FosterFamiliesPanel({ organizationId, basePath, canCreate = true }) {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [families, setFamilies] = useState([]);
  const [kos, setKos] = useState([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const load = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    setError('');
    try {
      const [familiesData, kosData] = await Promise.all([
        listFostersByOrg(organizationId),
        listKlicoveOsobyByOrg(organizationId),
      ]);
      setFamilies(familiesData);
      setKos(kosData);
    } catch (err) {
      console.error('[FosterFamiliesPanel] načtení selhalo:', err);
      setError(err.message ?? 'Rodiny se nepodařilo načíst.');
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => { load(); }, [load]);

  function updateForm(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleCreate(e) {
    e.preventDefault();
    setSubmitError('');
    if (!form.name.trim()) {
      setSubmitError('Zadejte název rodiny.');
      return;
    }
    setSubmitting(true);
    try {
      await createFoster({
        organizationId,
        name: form.name.trim(),
        address: form.address.trim(),
        contactPhone: form.contactPhone.trim(),
        careType: form.careType,
        assignedTo: form.assignedTo || null,
      });
      setDialogOpen(false);
      setForm(emptyForm);
      await load();
    } catch (err) {
      console.error('[FosterFamiliesPanel] Založení rodiny selhalo:', err);
      setSubmitError(err.message ?? 'Založení se nezdařilo.');
    } finally {
      setSubmitting(false);
    }
  }

  function koName(uid) {
    return kos.find((k) => k.id === uid)?.displayName ?? '—';
  }

  return (
    <Box>
      {canCreate && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button variant="contained" startIcon={<GroupAddOutlinedIcon />} onClick={() => setDialogOpen(true)}>
            Přidat rodinu
          </Button>
        </Box>
      )}

      {loading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 6, justifyContent: 'center' }}>
          <CircularProgress size={28} />
          <Typography variant="body2" color="text.secondary">Načítám rodiny…</Typography>
        </Box>
      )}

      {!loading && error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {!loading && !error && families.length === 0 && (
        <Card>
          <EmptyState
            icon={<GroupAddOutlinedIcon sx={{ fontSize: 32 }} />}
            title="Zatím žádné pěstounské rodiny"
            description={canCreate
              ? 'Přidejte první rodinu a přiřaďte ji klíčové osobě, která se o ni bude starat.'
              : 'V organizaci zatím nejsou žádné pěstounské rodiny.'}
            action={canCreate && (
              <Button variant="contained" startIcon={<GroupAddOutlinedIcon />} onClick={() => setDialogOpen(true)}>
                Přidat první rodinu
              </Button>
            )}
          />
        </Card>
      )}

      {!loading && !error && families.length > 0 && (
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>Pěstounské rodiny</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Klikněte na řádek pro detail rodiny — svěřené děti a jejich příbuzné.
            </Typography>
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Rodina</TableCell>
                    <TableCell>Typ péče</TableCell>
                    <TableCell>Klíčová osoba</TableCell>
                    <TableCell>Stav</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {families.map((family) => (
                    <TableRow
                      key={family.id}
                      hover
                      onClick={() => navigate(`${basePath}/${family.id}`)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell sx={{ fontWeight: 600 }}>{family.name}</TableCell>
                      <TableCell>{careLabel(family.careType)}</TableCell>
                      <TableCell>{koName(family.assignedTo)}</TableCell>
                      <TableCell>
                        <Chip size="small" label={STATUS_LABEL[family.status] ?? family.status} color={STATUS_COLOR[family.status] ?? 'default'} />
                      </TableCell>
                      <TableCell align="right" sx={{ color: 'text.disabled' }}><ChevronRightIcon fontSize="small" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onClose={() => !submitting && setDialogOpen(false)} maxWidth="sm" fullWidth>
        <Box component="form" onSubmit={handleCreate}>
          <DialogTitle>Nová pěstounská rodina</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            {submitError && <Alert severity="error">{submitError}</Alert>}
            <TextField label="Název rodiny" placeholder="např. Rodina Nováková" value={form.name} onChange={updateForm('name')} fullWidth required disabled={submitting} autoFocus />
            <TextField label="Adresa" value={form.address} onChange={updateForm('address')} fullWidth disabled={submitting} />
            <TextField label="Telefon" value={form.contactPhone} onChange={updateForm('contactPhone')} fullWidth disabled={submitting} />
            <TextField select label="Typ péče" value={form.careType} onChange={updateForm('careType')} fullWidth disabled={submitting}>
              {Object.entries(CARE_TYPES).map(([key, c]) => (
                <MenuItem key={key} value={key}>{c.label}</MenuItem>
              ))}
            </TextField>
            <TextField select label="Klíčová osoba" value={form.assignedTo} onChange={updateForm('assignedTo')} fullWidth disabled={submitting} helperText={kos.length === 0 ? 'Organizace zatím nemá žádnou klíčovou osobu.' : ' '}>
              <MenuItem value="">— zatím nepřiřazovat —</MenuItem>
              {kos.map((ko) => (
                <MenuItem key={ko.id} value={ko.id}>{ko.displayName}</MenuItem>
              ))}
            </TextField>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={() => setDialogOpen(false)} disabled={submitting}>Zrušit</Button>
            <Button type="submit" variant="contained" disabled={submitting} startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}>
              {submitting ? 'Zakládám…' : 'Přidat rodinu'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
