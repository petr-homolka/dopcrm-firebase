/**
 * SuperAdminDashboard.jsx — Krok 3 zadání (2026-07-01), redesign 2026-07-02
 *
 * Pohled SaaS poskytovatele: seznam všech organizací (tenantů) + formulář
 * pro založení nové organizace SPOLU s jejím prvním org_admin uživatelem
 * (typický onboarding nového platícího zákazníka).
 *
 * Bezpečnost: firestore.rules povolují organizations/users write jen roli
 * superadmin — chráněno i na klientovi přes RequireOrgRole (router.jsx).
 *
 * Testovací data (seed/wipe) VĚDOMĚ NEJSOU v této appce — viz
 * scripts/dev-seed.mjs. Dřívější pokus je zabalit do UI přes
 * `{import.meta.env.DEV && ...}` byl zrušen: ověřilo se, že Vite/Rollup
 * dynamický import() i tak zabalí do samostatného chunku v produkčním
 * `dist/`, i když se tlačítko nikdy nevykreslí — nesplňuje to zadání
 * "v ostrém provozu tam být nesmí". Skript mimo src/ je strukturálně
 * bezpečný: appka ho nikdy neimportuje, nemůže se dostat do buildu.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Button, TextField,
  Table, TableHead, TableBody, TableRow, TableCell, Chip, Alert,
  CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Stack,
} from '@mui/material';
import AddBusinessIcon from '@mui/icons-material/AddBusiness';
import BusinessIcon from '@mui/icons-material/Business';
import DomainAddOutlinedIcon from '@mui/icons-material/DomainAddOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { alpha } from '@mui/material/styles';

import { bento } from '../../core/theme.js';
import { listOrganizations, createOrganization, createEmployee } from '../../services/orgService.js';
import EmptyState from './EmptyState.jsx';

const STATUS_COLOR = { trial: 'warning', active: 'success', suspended: 'default', cancelled: 'error' };
const STATUS_LABEL = { trial: 'Zkušební doba', active: 'Aktivní', suspended: 'Pozastaveno', cancelled: 'Zrušeno' };

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

const emptyForm = {
  orgName: '',
  orgIco: '',
  adminName: '',
  adminEmail: '',
  adminPassword: '',
};

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orgs, setOrgs] = useState([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setOrgs(await listOrganizations());
    } catch (err) {
      console.error('[SuperAdminDashboard] listOrganizations selhalo:', err);
      setError(err.message ?? 'Organizace se nepodařilo načíst.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function updateForm(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleCreateOrg(e) {
    e.preventDefault();
    setSubmitError('');
    if (!form.orgName.trim() || !form.adminName.trim() || !form.adminEmail.trim() || form.adminPassword.length < 6) {
      setSubmitError('Vyplňte všechna pole. Heslo musí mít alespoň 6 znaků.');
      return;
    }
    setSubmitting(true);
    try {
      // 1) Založí organizaci (tenant), 2) v ní prvního org_admina — atomicita
      // řešena jen na úrovni UX (obě operace navazují), rules to hlídají odděleně.
      const orgId = await createOrganization({ name: form.orgName.trim(), ico: form.orgIco.trim(), status: 'trial' });
      await createEmployee({
        email: form.adminEmail.trim(),
        password: form.adminPassword,
        displayName: form.adminName.trim(),
        role: 'org_admin',
        organizationId: orgId,
        department: 'management',
      });
      setDialogOpen(false);
      setForm(emptyForm);
      await load();
    } catch (err) {
      console.error('[SuperAdminDashboard] Založení organizace selhalo:', err);
      setSubmitError(err.message ?? 'Založení se nezdařilo.');
    } finally {
      setSubmitting(false);
    }
  }

  const activeCount = orgs.filter((o) => o.status === 'active').length;
  const trialCount = orgs.filter((o) => o.status === 'trial').length;
  const hasOrgs = orgs.length > 0;

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>SuperAdmin</Typography>
          <Typography variant="body2" color="text.secondary">Správa doprovázejících organizací (tenantů) a jejich předplatného.</Typography>
        </Box>
        {hasOrgs && (
          <Button variant="contained" size="large" startIcon={<AddBusinessIcon />} onClick={() => setDialogOpen(true)}>
            Nová organizace
          </Button>
        )}
      </Stack>

      {loading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 6, justifyContent: 'center' }}>
          <CircularProgress size={28} />
          <Typography variant="body2" color="text.secondary">Načítám organizace…</Typography>
        </Box>
      )}

      {!loading && error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {!loading && !error && !hasOrgs && (
        <Card>
          <EmptyState
            icon={<DomainAddOutlinedIcon sx={{ fontSize: 32 }} />}
            title="Zatím žádné organizace"
            description="Doprovázející organizace (tenanti) jsou platící zákazníci systému. Založte první a rovnou i jejího administrátora — ten si pak sám přidá zaměstnance."
            action={
              <Button variant="contained" size="large" startIcon={<AddBusinessIcon />} onClick={() => setDialogOpen(true)}>
                Založit první organizaci
              </Button>
            }
          />
        </Card>
      )}

      {!loading && !error && hasOrgs && (
        <>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: bento.gap, mb: 3 }}>
            <StatCard icon={<BusinessIcon />} label="Organizací celkem" value={orgs.length} color="primary" />
            <StatCard icon={<BusinessIcon />} label="Aktivní předplatné" value={activeCount} color="success" />
            <StatCard icon={<BusinessIcon />} label="Ve zkušební době" value={trialCount} color="warning" />
          </Box>

          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>Organizace</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Klikněte na řádek pro pěstounské rodiny a zaměstnance dané organizace.
              </Typography>
              <Box sx={{ overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Název</TableCell>
                      <TableCell>IČO</TableCell>
                      <TableCell>Plán</TableCell>
                      <TableCell>Stav předplatného</TableCell>
                      <TableCell>ID</TableCell>
                      <TableCell />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orgs.map((org) => (
                      <TableRow
                        key={org.id}
                        hover
                        onClick={() => navigate(`/admin/superadmin/organizace/${org.id}`)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell sx={{ fontWeight: 600 }}>{org.name}</TableCell>
                        <TableCell sx={{ color: 'text.secondary' }}>{org.ico || '—'}</TableCell>
                        <TableCell sx={{ textTransform: 'capitalize' }}>{org.plan ?? '—'}</TableCell>
                        <TableCell>
                          <Chip size="small" label={STATUS_LABEL[org.status] ?? org.status} color={STATUS_COLOR[org.status] ?? 'default'} />
                        </TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: 12, color: 'text.secondary' }}>{org.id}</TableCell>
                        <TableCell align="right" sx={{ color: 'text.disabled' }}><ChevronRightIcon fontSize="small" /></TableCell>
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
        <Box component="form" onSubmit={handleCreateOrg}>
          <DialogTitle>Nová doprovázející organizace</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Založí novou organizaci a rovnou i jejího prvního administrátora (Org. Admin),
              který si dál sám přidá zaměstnance.
            </Typography>
            {submitError && <Alert severity="error">{submitError}</Alert>}
            <TextField label="Název organizace" value={form.orgName} onChange={updateForm('orgName')} fullWidth required disabled={submitting} autoFocus />
            <TextField label="IČO" placeholder="např. 12345678" value={form.orgIco} onChange={updateForm('orgIco')} fullWidth disabled={submitting} />
            <TextField label="Jméno administrátora" value={form.adminName} onChange={updateForm('adminName')} fullWidth required disabled={submitting} />
            <TextField label="E-mail administrátora" type="email" value={form.adminEmail} onChange={updateForm('adminEmail')} fullWidth required disabled={submitting} />
            <TextField label="Počáteční heslo" type="password" value={form.adminPassword} onChange={updateForm('adminPassword')} fullWidth required disabled={submitting} helperText="Alespoň 6 znaků — doporučeno vyzvat k okamžité změně." />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={() => setDialogOpen(false)} disabled={submitting}>Zrušit</Button>
            <Button type="submit" variant="contained" disabled={submitting} startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}>
              {submitting ? 'Zakládám…' : 'Založit organizaci'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
