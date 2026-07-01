/**
 * OrgAdminDashboard.jsx — Krok 3 zadání (2026-07-01)
 *
 * Pohled managementu organizace: seznam zaměstnanců (Management/Service/
 * Klíčové osoby) + formulář na přidání nového (typicky Klíčová osoba).
 * Vše scoped na vlastní organizationId — viz firestore.rules SEKCE B.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Button, TextField, MenuItem,
  Table, TableHead, TableBody, TableRow, TableCell, Chip, Alert,
  CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Stack, Switch,
} from '@mui/material';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import GroupsIcon from '@mui/icons-material/Groups';
import { alpha } from '@mui/material/styles';

import { bento } from '../../core/theme.js';
import { useAuthStore } from '../../store/authStore.js';
import { listUsersByOrg, createEmployee, setUserActive } from '../../services/orgService.js';

const ROLE_LABELS = { org_admin: 'Org. Admin', klicova_osoba: 'Klíčová osoba' };
const DEPARTMENT_LABELS = { management: 'Management', service: 'Servisní tým', terenni: 'Terén (klíčové osoby)' };

function StatCard({ icon, label, value, color = 'primary' }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 3 }}>
        <Box sx={{
          width: 44, height: 44, borderRadius: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundColor: (theme) => alpha(theme.palette[color].main, 0.12), color: `${color}.main`,
        }}>
          {icon}
        </Box>
        <Typography sx={{ fontSize: 32, fontWeight: 700, lineHeight: 1.1, mt: 1 }}>{value}</Typography>
        <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '.06em', color: 'text.secondary', fontWeight: 600 }}>
          {label}
        </Typography>
      </CardContent>
    </Card>
  );
}

const emptyForm = { name: '', email: '', password: '', role: 'klicova_osoba', department: 'terenni' };

export default function OrgAdminDashboard() {
  const { organizationId } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const load = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    setError('');
    try {
      setUsers(await listUsersByOrg(organizationId));
    } catch (err) {
      console.error('[OrgAdminDashboard] listUsersByOrg selhalo:', err);
      setError(err.message ?? 'Zaměstnance se nepodařilo načíst.');
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => { load(); }, [load]);

  function updateForm(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleCreateEmployee(e) {
    e.preventDefault();
    setSubmitError('');
    if (!form.name.trim() || !form.email.trim() || form.password.length < 6) {
      setSubmitError('Vyplňte všechna pole. Heslo musí mít alespoň 6 znaků.');
      return;
    }
    setSubmitting(true);
    try {
      await createEmployee({
        email: form.email.trim(),
        password: form.password,
        displayName: form.name.trim(),
        role: form.role,
        organizationId,
        department: form.department,
      });
      setDialogOpen(false);
      setForm(emptyForm);
      await load();
    } catch (err) {
      console.error('[OrgAdminDashboard] Přidání zaměstnance selhalo:', err);
      setSubmitError(err.message ?? 'Přidání se nezdařilo.');
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(u) {
    try {
      await setUserActive(u.id, !u.active);
      setUsers((list) => list.map((x) => (x.id === u.id ? { ...x, active: !u.active } : x)));
    } catch (err) {
      console.error('[OrgAdminDashboard] setUserActive selhalo:', err);
    }
  }

  const koCount = users.filter((u) => u.role === 'klicova_osoba').length;

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>Naše organizace</Typography>
          <Typography variant="body2" color="text.secondary">Zaměstnanci — management, servisní tým a klíčové osoby v terénu.</Typography>
        </Box>
        <Button variant="contained" startIcon={<PersonAddAlt1Icon />} onClick={() => setDialogOpen(true)}>
          Přidat zaměstnance
        </Button>
      </Stack>

      {loading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 6, justifyContent: 'center' }}>
          <CircularProgress size={28} />
          <Typography variant="body2" color="text.secondary">Načítám zaměstnance…</Typography>
        </Box>
      )}

      {!loading && error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {!loading && !error && (
        <>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: bento.gap, mb: 3 }}>
            <StatCard icon={<GroupsIcon />} label="Zaměstnanců celkem" value={users.length} color="primary" />
            <StatCard icon={<GroupsIcon />} label="Klíčových osob" value={koCount} color="secondary" />
          </Box>

          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Zaměstnanci</Typography>
              <Box sx={{ overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Jméno</TableCell>
                      <TableCell>E-mail</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Oddělení</TableCell>
                      <TableCell align="center">Aktivní</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ color: 'text.secondary', py: 4 }}>
                          Zatím žádní zaměstnanci — přidejte prvního přes tlačítko výše.
                        </TableCell>
                      </TableRow>
                    )}
                    {users.map((u) => (
                      <TableRow key={u.id} hover>
                        <TableCell>{u.displayName}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell><Chip size="small" label={ROLE_LABELS[u.role] ?? u.role} /></TableCell>
                        <TableCell>{DEPARTMENT_LABELS[u.department] ?? '—'}</TableCell>
                        <TableCell align="center">
                          <Switch size="small" checked={!!u.active} onChange={() => toggleActive(u)} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </CardContent>
          </Card>
        </>
      )}

      <Dialog open={dialogOpen} onClose={() => !submitting && setDialogOpen(false)} maxWidth="sm" fullWidth>
        <Box component="form" onSubmit={handleCreateEmployee}>
          <DialogTitle>Nový zaměstnanec</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            {submitError && <Alert severity="error">{submitError}</Alert>}
            <TextField label="Jméno" value={form.name} onChange={updateForm('name')} fullWidth required disabled={submitting} autoFocus />
            <TextField label="E-mail" type="email" value={form.email} onChange={updateForm('email')} fullWidth required disabled={submitting} />
            <TextField label="Počáteční heslo" type="password" value={form.password} onChange={updateForm('password')} fullWidth required disabled={submitting} helperText="Alespoň 6 znaků." />
            <TextField select label="Role" value={form.role} onChange={updateForm('role')} fullWidth disabled={submitting}>
              <MenuItem value="klicova_osoba">Klíčová osoba (terén)</MenuItem>
              <MenuItem value="org_admin">Org. Admin (management)</MenuItem>
            </TextField>
            <TextField select label="Oddělení" value={form.department} onChange={updateForm('department')} fullWidth disabled={submitting}>
              <MenuItem value="terenni">Terén (klíčové osoby)</MenuItem>
              <MenuItem value="service">Servisní tým</MenuItem>
              <MenuItem value="management">Management</MenuItem>
            </TextField>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={() => setDialogOpen(false)} disabled={submitting}>Zrušit</Button>
            <Button type="submit" variant="contained" disabled={submitting} startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}>
              {submitting ? 'Přidávám…' : 'Přidat zaměstnance'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
