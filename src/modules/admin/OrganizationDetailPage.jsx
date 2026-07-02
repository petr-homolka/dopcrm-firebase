/**
 * OrganizationDetailPage.jsx — Krok 3 zadání, doplněno 2026-07-02
 *
 * SuperAdmin klikne na řádek organizace a dostane plný pohled na ni:
 * zaměstnance i pěstounské rodiny (a odtud dál na děti) — hierarchická
 * viditelnost "nadřazený vidí vše podřízené" dotažená až do UI, ne jen
 * v Firestore rules.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Chip, CircularProgress, Alert, IconButton, Stack, Tabs, Tab } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { getOrganization } from '../../services/orgService.js';
import OrgEmployeesPanel from './OrgEmployeesPanel.jsx';
import FosterFamiliesPanel from './FosterFamiliesPanel.jsx';

const STATUS_COLOR = { trial: 'warning', active: 'success', suspended: 'default', cancelled: 'error' };
const STATUS_LABEL = { trial: 'Zkušební doba', active: 'Aktivní', suspended: 'Pozastaveno', cancelled: 'Zrušeno' };

export default function OrganizationDetailPage() {
  const { orgId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [org, setOrg] = useState(null);
  const [tab, setTab] = useState('rodiny');

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
      <Stack direction="row" alignItems="flex-start" spacing={1.5} sx={{ mb: 1, flexWrap: 'wrap', rowGap: 1 }}>
        <IconButton onClick={() => navigate('/admin/superadmin')} aria-label="Zpět na organizace" sx={{ mt: 0.5 }}><ArrowBackIcon /></IconButton>
        <Box sx={{ flex: '1 1 auto', minWidth: 0 }}>
          <Typography variant="h4" fontWeight={700} sx={{ wordBreak: 'break-word' }}>{loading ? 'Načítám…' : (org?.name ?? 'Organizace')}</Typography>
          {org?.ico && <Typography variant="body2" color="text.secondary">IČO {org.ico}</Typography>}
        </Box>
        {org && <Chip label={STATUS_LABEL[org.status] ?? org.status} color={STATUS_COLOR[org.status] ?? 'default'} sx={{ mt: 0.5 }} />}
      </Stack>

      {loading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 6, justifyContent: 'center' }}>
          <CircularProgress size={28} />
        </Box>
      )}

      {!loading && error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && org && (
        <>
          <Tabs value={tab} onChange={(e, v) => setTab(v)} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
            <Tab value="rodiny" label="Pěstounské rodiny" />
            <Tab value="zamestnanci" label="Zaměstnanci" />
          </Tabs>
          {tab === 'rodiny' && <FosterFamiliesPanel organizationId={orgId} basePath="/admin/terenni" />}
          {tab === 'zamestnanci' && <OrgEmployeesPanel organizationId={orgId} />}
        </>
      )}
    </Box>
  );
}
