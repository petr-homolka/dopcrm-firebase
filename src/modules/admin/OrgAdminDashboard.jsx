/**
 * OrgAdminDashboard.jsx — Krok 3 zadání (2026-07-01)
 *
 * Pohled managementu VLASTNÍ organizace — tenká obálka nad sdíleným
 * OrgEmployeesPanel (viz ten soubor pro logiku). Superadmin dostává stejný
 * panel pro CIZÍ organizaci přes OrganizationDetailPage.jsx.
 */

import React from 'react';
import { Box, Typography } from '@mui/material';
import { useAuthStore } from '../../store/authStore.js';
import OrgEmployeesPanel from './OrgEmployeesPanel.jsx';

export default function OrgAdminDashboard() {
  const { organizationId } = useAuthStore();

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>Naše organizace</Typography>
        <Typography variant="body2" color="text.secondary">Zaměstnanci — management, servisní tým a klíčové osoby v terénu.</Typography>
      </Box>
      <OrgEmployeesPanel organizationId={organizationId} />
    </Box>
  );
}
