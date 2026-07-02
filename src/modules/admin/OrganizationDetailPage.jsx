/**
 * OrganizationDetailPage.jsx — Krok 3 zadání, doplněno 2026-07-02
 *
 * SuperAdmin klikne na řádek organizace v SuperAdminDashboard tabulce a
 * dostane přesně to, co vidí Org. Admin té organizace (sdílený
 * OrgEmployeesPanel) — jen s hlavičkou navíc (název/plán/stav organizace
 * + tlačítko zpět). Firestore rules superadminovi čtení/zápis nad libovolnou
 * organizací povolují bez omezení (viz firestore.rules SEKCE B).
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Chip, CircularProgress, Alert, IconButton, Stack } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { getOrganization } from '../../services/orgService.js';
import OrgEmployeesPanel from './OrgEmployeesPanel.jsx';

const STATUS_COLOR = { trial: 'warning', active: 'success', suspended: 'default', cancelled: 'error' };
const STATUS_LABEL = { trial: 'Zkušební doba', active: 'Aktivní', suspended: 'Pozastaveno', cancelled: 'Zrušeno' };

export default function OrganizationDetailPage() {
  const { orgId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [org, setOrg] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getOrganization(orgId);
      if (!data) throw new Error('Organizace nenalezena.');
      setOrg(data);
    } catch (err) {
      console.error('[OrganizationDetailPage] getOrganization selhalo:', err);
      setError(err.message ?? 'Organizaci se nepodařilo načíst.');
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => { load(); }, [load]);

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
        <IconButton onClick={() => navigate('/admin/superadmin')} aria-label="Zpět na SuperAdmin"><ArrowBackIcon /></IconButton>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h4" fontWeight={700} noWrap>{loading ? 'Načítám…' : (org?.name ?? 'Organizace')}</Typography>
          <Typography variant="body2" color="text.secondary">Pohled Org. Admina této organizace — jako SuperAdmin vidíte totéž.</Typography>
        </Box>
        {org && <Chip label={STATUS_LABEL[org.status] ?? org.status} color={STATUS_COLOR[org.status] ?? 'default'} />}
      </Stack>

      {loading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 6, justifyContent: 'center' }}>
          <CircularProgress size={28} />
        </Box>
      )}

      {!loading && error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && org && <OrgEmployeesPanel organizationId={orgId} />}
    </Box>
  );
}
