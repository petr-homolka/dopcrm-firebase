/**
 * OrgEmployeesPanel.jsx — sdílený pohled na zaměstnance jedné organizace
 * (2026-07-02, plná hierarchie: zástupce → vedoucí pobočky → teamleader →
 * klíčová osoba → asistent KO; + zaměstnanec bez řídicí role)
 *
 * Vytaženo z OrgAdminDashboard.jsx, aby stejný pohled mohl superadmin otevřít
 * i pro CIZÍ organizaci (klik na řádek v SuperAdminDashboard tabulce →
 * OrganizationDetailPage). Oprávnění řeší firestore.rules (superadmin má
 * vždy plný přístup, org_admin jen ke své organizaci).
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Button, TextField, MenuItem,
  Table, TableHead, TableBody, TableRow, TableCell, Chip, Alert,
  CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Switch,
} from '@mui/material';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import GroupsIcon from '@mui/icons-material/Groups';
import { alpha } from '@mui/material/styles';

import { bento } from '../../core/theme.js';
import { EMPLOYEE_ROLES, employeeRoleLabel } from '../../shared/domainConstants.js';
import { listUsersByOrg, createEmployee, setUserActive } from '../../services/orgService.js';

const CREATABLE_ROLES = EMPLOYEE_ROLES; // org_admin smí založit kohokoli až po sebe, viz firestore.rules

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

const emptyForm = { name: '', email: '', password: '', role: 'klicova_osoba', rc: '', funkce: '', phone: '', nadrizeny: '' };

export default function OrgEmployeesPanel({ organizationId }) {
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
      console.error('[OrgEmployeesPanel] listUsersByOrg selhalo:', err);
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
        rc: form.rc.trim(),
        funkce: form.funkce.trim(),
        phone: form.phone.trim(),
        nadrizeny: form.nadrizeny || null,
      });
      setDialogOpen(false);
      setForm(emptyForm);
      await load();
    } catch (err) {
      console.error('[OrgEmployeesPanel] Přidání zaměstnance selhalo:', err);
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
      console.error('[OrgEmployeesPanel] setUserActive selhalo:', err);
    }
  }

  function nadrizenyName(uid) {
    return users.find((u) => u.id === uid)?.displayName ?? '—';
  }

  const koCount = users.filter((u) => u.role === 'klicova_osoba').length;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" startIcon={<PersonAddAlt1Icon />} onClick={() => setDialogOpen(true)}>
          Přidat zaměstnance
        </Button>
      </Box>

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
                      <TableCell>Funkce / Role</TableCell>
                      <TableCell>Nadřízený</TableCell>
                      <TableCell>Kontakt</TableCell>
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
                        <TableCell sx={{ fontWeight: 600 }}>{u.displayName}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'flex-start' }}>
                            {u.funkce && <Typography variant="body2">{u.funkce}</Typography>}
                            <Chip size="small" label={employeeRoleLabel(u.role)} />
                          </Box>
                        </TableCell>
                        <TableCell sx={{ color: 'text.secondary' }}>{u.nadrizeny ? nadrizenyName(u.nadrizeny) : '—'}</TableCell>
                        <TableCell sx={{ color: 'text.secondary' }}>
                          <Typography variant="body2">{u.email}</Typography>
                          {u.phone && <Typography variant="caption" color="text.secondary">{u.phone}</Typography>}
                        </TableCell>
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
            <TextField label="Rodné číslo" placeholder="např. 765912/3210" value={form.rc} onChange={updateForm('rc')} fullWidth disabled={submitting} />
            <TextField label="Telefon" value={form.phone} onChange={updateForm('phone')} fullWidth disabled={submitting} />
            <TextField label="E-mail" type="email" value={form.email} onChange={updateForm('email')} fullWidth required disabled={submitting} />
            <TextField label="Počáteční heslo" type="password" value={form.password} onChange={updateForm('password')} fullWidth required disabled={submitting} helperText="Alespoň 6 znaků." />
            <TextField select label="Role" value={form.role} onChange={updateForm('role')} fullWidth disabled={submitting}>
              {CREATABLE_ROLES.map((r) => (
                <MenuItem key={r.key} value={r.key}>{r.label}</MenuItem>
              ))}
            </TextField>
            <TextField label="Konkrétní funkce (volitelné)" placeholder="např. Vedoucí pobočky Brno" value={form.funkce} onChange={updateForm('funkce')} fullWidth disabled={submitting} />
            <TextField select label="Nadřízený" value={form.nadrizeny} onChange={updateForm('nadrizeny')} fullWidth disabled={submitting} helperText="Komu se tento zaměstnanec zodpovídá — volitelné.">
              <MenuItem value="">— bez nadřízeného (nejvyšší úroveň) —</MenuItem>
              {users.map((u) => (
                <MenuItem key={u.id} value={u.id}>{u.displayName} ({employeeRoleLabel(u.role)})</MenuItem>
              ))}
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
