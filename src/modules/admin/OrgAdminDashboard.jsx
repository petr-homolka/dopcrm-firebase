/**
 * OrgAdminDashboard.jsx — Krok 3 zadání (2026-07-01), obohaceno 2026-07-02
 *
 * Pohled managementu vlastní organizace: pěstounské rodiny (a jejich děti)
 * i zaměstnanci — plná hierarchická viditelnost vlastní organizace, ne jen
 * seznam zaměstnanců.
 */

import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab } from '@mui/material';
import { useAuthStore } from '../../store/authStore.js';
import OrgEmployeesPanel from './OrgEmployeesPanel.jsx';
import FosterFamiliesPanel from './FosterFamiliesPanel.jsx';

export default function OrgAdminDashboard() {
  const { organizationId } = useAuthStore();
  const [tab, setTab] = useState('rodiny');

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>Naše organizace</Typography>

      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Tab value="rodiny" label="Pěstounské rodiny" />
        <Tab value="zamestnanci" label="Zaměstnanci" />
      </Tabs>

      {tab === 'rodiny' && <FosterFamiliesPanel organizationId={organizationId} basePath="/admin/terenni" />}
      {tab === 'zamestnanci' && <OrgEmployeesPanel organizationId={organizationId} />}
    </Box>
  );
}
