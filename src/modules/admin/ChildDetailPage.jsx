/**
 * ChildDetailPage.jsx — nejnižší úroveň hierarchie (2026-07-02)
 *
 * Karta dítěte: identita (RČ, datum narození, typ péče) + biologičtí/širší
 * příbuzní (jmenovití, s typem vztahu a právním statusem — REL_TYPES).
 * Dostupné superadmin/org_admin (celá organizace) i klíčové osobě —
 * dokončuje hierarchickou viditelnost "nadřazený vidí vše podřízené" až
 * na úroveň dítěte.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Chip, CircularProgress, Alert,
  IconButton, Stack, Button, TextField, MenuItem, Dialog, DialogTitle,
  DialogContent, DialogActions, List, ListItem, ListItemText, Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import CakeOutlinedIcon from '@mui/icons-material/CakeOutlined';

import { bento } from '../../core/theme.js';
import { careLabel, REL_TYPES, relGroups, relLegalLabel, relLegalColor } from '../../shared/domainConstants.js';
import { getChild, setChildRelatives } from '../../services/orgService.js';

function formatDate(value) {
  if (!value) return '—';
  const date = typeof value.toDate === 'function' ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('cs-CZ');
}

const emptyForm = { name: '', rc: '', rel: REL_TYPES[0].key, note: '' };

export default function ChildDetailPage() {
  const { familyId, childId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [child, setChild] = useState(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getChild(childId);
      if (!data) throw new Error('Dítě nenalezeno.');
      setChild(data);
    } catch (err) {
      console.error('[ChildDetailPage] getChild selhalo:', err);
      setError(err.message ?? 'Data se nepodařilo načíst.');
    } finally {
      setLoading(false);
    }
  }, [childId]);

  useEffect(() => { load(); }, [load]);

  async function handleAddRelative(e) {
    e.preventDefault();
    setSubmitError('');
    if (!form.name.trim()) {
      setSubmitError('Zadejte jméno příbuzného.');
      return;
    }
    setSubmitting(true);
    try {
      const relType = REL_TYPES.find((r) => r.key === form.rel);
      const relatives = [
        ...(child.relatives ?? []),
        { name: form.name.trim(), rc: form.rc.trim(), rel: form.rel, legal: relType?.legal ?? false, note: form.note.trim() },
      ];
      await setChildRelatives(childId, relatives);
      setDialogOpen(false);
      setForm(emptyForm);
      await load();
    } catch (err) {
      console.error('[ChildDetailPage] Přidání příbuzného selhalo:', err);
      setSubmitError(err.message ?? 'Přidání se nezdařilo.');
    } finally {
      setSubmitting(false);
    }
  }

  const groups = relGroups();

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
        <IconButton onClick={() => navigate(`/admin/terenni/${familyId}`)} aria-label="Zpět na rodinu"><ArrowBackIcon /></IconButton>
        <Typography variant="h4" fontWeight={700}>
          {loading ? 'Načítám…' : `${child?.firstName ?? ''} ${child?.lastName ?? ''}`.trim()}
        </Typography>
        {child && <Chip label={careLabel(child.careType)} />}
      </Stack>

      {loading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 6, justifyContent: 'center' }}>
          <CircularProgress size={28} />
        </Box>
      )}

      {!loading && error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && child && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: bento.gap }}>
          <Card sx={{ gridColumn: { xs: 'span 1', md: 'span 1' } }}>
            <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Typography variant="overline" color="text.secondary" fontWeight={700}>Identita</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                <BadgeOutlinedIcon fontSize="small" />
                <Typography variant="body2">{child.rc ? `RČ ${child.rc}` : 'Rodné číslo nezadáno'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                <CakeOutlinedIcon fontSize="small" />
                <Typography variant="body2">Narození {formatDate(child.birthDate)}</Typography>
              </Box>
              {child.note && (
                <>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, textTransform: 'uppercase', fontWeight: 600 }}>Poznámka</Typography>
                  <Typography variant="body2">{child.note}</Typography>
                </>
              )}
            </CardContent>
          </Card>

          <Card sx={{ gridColumn: { xs: 'span 1', md: 'span 2' } }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="h6" fontWeight={700}>Příbuzní ({(child.relatives ?? []).length})</Typography>
                <Button size="small" startIcon={<PersonAddOutlinedIcon />} onClick={() => setDialogOpen(true)}>Přidat příbuzného</Button>
              </Stack>
              <List dense>
                {(child.relatives ?? []).length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>Zatím žádní evidovaní příbuzní.</Typography>
                )}
                {(child.relatives ?? []).map((rel, idx) => {
                  const relType = REL_TYPES.find((r) => r.key === rel.rel);
                  return (
                    <ListItem key={idx} disableGutters divider>
                      <ListItemText
                        primary={rel.name}
                        secondary={[relType?.label ?? rel.rel, rel.rc && `RČ ${rel.rc}`, rel.note].filter(Boolean).join(' · ')}
                      />
                      <Chip size="small" label={relLegalLabel(rel.legal)} color={relLegalColor(rel.legal)} variant="outlined" />
                    </ListItem>
                  );
                })}
              </List>
            </CardContent>
          </Card>
        </Box>
      )}

      <Dialog open={dialogOpen} onClose={() => !submitting && setDialogOpen(false)} maxWidth="xs" fullWidth>
        <Box component="form" onSubmit={handleAddRelative}>
          <DialogTitle>Přidat příbuzného</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            {submitError && <Alert severity="error">{submitError}</Alert>}
            <TextField label="Jméno a příjmení" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} fullWidth required disabled={submitting} autoFocus />
            <TextField label="Rodné číslo" placeholder="např. 654321/0987" value={form.rc} onChange={(e) => setForm((f) => ({ ...f, rc: e.target.value }))} fullWidth disabled={submitting} />
            <TextField select label="Typ vztahu" value={form.rel} onChange={(e) => setForm((f) => ({ ...f, rel: e.target.value }))} fullWidth disabled={submitting}>
              {Object.entries(groups).map(([groupName, items]) => [
                <Divider key={`div-${groupName}`} textAlign="left" sx={{ '&::before, &::after': { borderColor: 'transparent' }, fontSize: 11, color: 'text.disabled', textTransform: 'uppercase', pl: 1 }}>{groupName}</Divider>,
                ...items.map((r) => <MenuItem key={r.key} value={r.key}>{r.label}</MenuItem>),
              ])}
            </TextField>
            <TextField label="Poznámka" placeholder="např. styk 1× měsíčně" value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} fullWidth multiline minRows={2} disabled={submitting} />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={() => setDialogOpen(false)} disabled={submitting}>Zrušit</Button>
            <Button type="submit" variant="contained" disabled={submitting}>Přidat</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
