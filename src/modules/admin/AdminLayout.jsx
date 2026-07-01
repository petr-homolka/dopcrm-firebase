/**
 * AdminLayout.jsx — jednoduchý shell pro nové B2B SaaS dashboardy
 * (SuperAdmin / OrgAdmin / Klíčová osoba)
 *
 * Záměrně NENÍ sdílený se starým core/Layout.jsx (ten patří legacy
 * user_roles modulům s vlastní sidebar navigací MVP_NAV). Tyhle tři
 * dashboardy mají odlišnou hierarchii (napříč organizacemi u superadmina)
 * a jednodušší topbar postačí — bez zbytečné vazby na starou navigaci.
 */

import React, { useCallback } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Avatar, Chip, IconButton, Tooltip, Box, Container } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';

import { useAuthStore } from '../../store/authStore.js';
import { signOut } from '../../services/orgAuth.js';

const ROLE_LABELS = {
  superadmin: 'SaaS Superadmin',
  org_admin: 'Org. Admin',
  klicova_osoba: 'Klíčová osoba',
};

export default function AdminLayout({ title }) {
  const navigate = useNavigate();
  const { currentUser, role } = useAuthStore();

  const handleSignOut = useCallback(async () => {
    await signOut();
    navigate('/login', { replace: true });
  }, [navigate]);

  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default' }}>
      <AppBar position="sticky" color="default" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar sx={{ gap: 1.5 }}>
          <Avatar variant="rounded" sx={{ bgcolor: 'secondary.main', color: 'secondary.contrastText', fontWeight: 800 }}>
            D
          </Avatar>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mr: 1 }}>
            Doprovázení CRM
          </Typography>
          {title && (
            <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
              / {title}
            </Typography>
          )}
          <Box sx={{ flex: 1 }} />
          <Chip size="small" label={ROLE_LABELS[role] ?? role ?? '—'} color="primary" variant="outlined" sx={{ mr: 1 }} />
          <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
            {currentUser?.displayName ?? currentUser?.email}
          </Typography>
          <Tooltip title="Odhlásit se">
            <IconButton onClick={handleSignOut} size="small" aria-label="Odhlásit se">
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: { xs: 2.5, sm: 4 } }}>
        <Outlet />
      </Container>
    </Box>
  );
}
