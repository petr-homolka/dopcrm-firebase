/**
 * Layout.jsx — hlavní shell aplikace (MVP), MUI verze
 *
 * Struktura:
 *   <Layout>
 *     <Drawer>     — navigace (permanentní na desktopu, temporary na mobilu)
 *     <AppBar>     — viditelná jen na mobilu (hamburger + brand)
 *     <main>       — <Outlet /> (aktivní modul)
 *   </Layout>
 *
 * Navigace odpovídá MVP_NAV z router.jsx.
 * Odhlášení volá signOut() ze src/services/auth.js.
 * Logika vykreslení aktuálně přihlášeného uživatele (jméno, iniciály, role)
 * je zachována ze stávající implementace.
 */

import React, { useState, useCallback } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Avatar,
  Divider,
  Tooltip,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import BusinessIcon from '@mui/icons-material/Business';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DescriptionIcon from '@mui/icons-material/Description';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';

import { signOut, currentUser, currentRole } from '../services/auth.js';
import { MVP_NAV } from './router.jsx';

const DRAWER_WIDTH = 264;

// ── Mapování icon klíčů z MVP_NAV na MUI ikony ─────────────────

const ICON_MAP = {
  grid: DashboardIcon,
  user: PeopleIcon,
  child: ChildCareIcon,
  building: BusinessIcon,
  calendar: CalendarMonthIcon,
  file: DescriptionIcon,
  book: MenuBookIcon,
};

// ── Role badge (zkratka) ────────────────────────────────────────

const ROLE_LABELS = {
  superadmin: 'SA',
  vedeni: 'VE',
  ko: 'KO',
  asistent: 'AS',
  pestoun: 'PE',
  dite: 'DI',
  externista: 'EX',
};

// ── Iniciály z display name / e-mailu ───────────────────────────

function initials(user) {
  if (!user) return '?';
  const name = user.displayName ?? user.email ?? '';
  return (
    name
      .split(/[\s@.]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0].toUpperCase())
      .join('') || '?'
  );
}

// ── Styl aktivní položky navigace (NavLink přidává className="active") ──

const navLinkSx = {
  borderRadius: 2,
  mb: 0.5,
  color: 'text.primary',
  '&.active': {
    bgcolor: 'action.selected',
    color: 'primary.main',
    '& .MuiListItemIcon-root': { color: 'primary.main' },
  },
};

// ── Obsah postranního panelu (sdílený mezi permanent/temporary Drawer) ──

function SidebarContent({ onNavigate }) {
  const navigate = useNavigate();
  const user = currentUser();
  const role = currentRole();
  const roleKey = role?.role ?? 'ko';
  const roleLabel = ROLE_LABELS[roleKey] ?? roleKey.slice(0, 2).toUpperCase();

  const handleSignOut = useCallback(async () => {
    await signOut();
    navigate('/login', { replace: true });
  }, [navigate]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Brand */}
      <Toolbar sx={{ gap: 1.5, px: 2 }}>
        <Avatar
          variant="rounded"
          sx={{ bgcolor: 'secondary.main', color: 'secondary.contrastText', fontWeight: 800 }}
        >
          D
        </Avatar>
        <Typography variant="subtitle1" fontWeight={700} noWrap>
          Doprovázení
        </Typography>
      </Toolbar>
      <Divider />

      {/* Hlavní navigace */}
      <List sx={{ flex: 1, px: 1.5, py: 1.5, overflowY: 'auto' }}>
        {MVP_NAV.map(({ path, label, icon }) => {
          const ItemIcon = ICON_MAP[icon] ?? DescriptionIcon;
          return (
            <ListItem key={path} disablePadding>
              <ListItemButton component={NavLink} to={path} onClick={onNavigate} sx={navLinkSx}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <ItemIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={label}
                  primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider />

      {/* Nastavení */}
      <List sx={{ px: 1.5, py: 1 }}>
        <ListItem disablePadding>
          <ListItemButton component={NavLink} to="/nastaveni" onClick={onNavigate} sx={navLinkSx}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Nastavení"
              primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
            />
          </ListItemButton>
        </ListItem>
      </List>

      <Divider />

      {/* Uživatelský footer */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 2 }}>
        <Avatar
          sx={{
            bgcolor: 'secondary.main',
            color: 'secondary.contrastText',
            fontWeight: 700,
            width: 36,
            height: 36,
            fontSize: 14,
          }}
        >
          {initials(user)}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" fontWeight={600} noWrap>
            {user?.displayName ?? user?.email?.split('@')[0] ?? 'Uživatel'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {roleLabel}
          </Typography>
        </Box>
        <Tooltip title="Odhlásit se">
          <IconButton onClick={handleSignOut} size="small" aria-label="Odhlásit se">
            <LogoutIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}

// ── Layout root ───────────────────────────────────────────────────

export default function Layout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = useCallback(() => setMobileOpen((v) => !v), []);
  const handleNavigate = useCallback(() => {
    if (isMobile) setMobileOpen(false);
  }, [isMobile]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100dvh' }}>
      {/* Topbar — jen na mobilu */}
      {isMobile && (
        <AppBar
          position="fixed"
          color="default"
          elevation={0}
          sx={{
            borderBottom: '1px solid',
            borderColor: 'divider',
            zIndex: (t) => t.zIndex.drawer + 1,
          }}
        >
          <Toolbar sx={{ gap: 1 }}>
            <IconButton edge="start" onClick={handleDrawerToggle} aria-label="Otevřít navigaci">
              <MenuIcon />
            </IconButton>
            <Avatar
              variant="rounded"
              sx={{
                bgcolor: 'secondary.main',
                color: 'secondary.contrastText',
                fontWeight: 800,
                width: 28,
                height: 28,
                fontSize: 14,
              }}
            >
              D
            </Avatar>
            <Typography variant="subtitle1" fontWeight={700}>
              Doprovázení
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      {/* Postranní panel */}
      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : true}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              borderRight: '1px solid',
              borderColor: 'divider',
            },
          }}
        >
          <SidebarContent onNavigate={handleNavigate} />
        </Drawer>
      </Box>

      {/* Hlavní obsahová oblast */}
      <Box
        component="main"
        sx={{
          flex: 1,
          minWidth: 0,
          minHeight: '100dvh',
          bgcolor: 'background.default',
        }}
      >
        {isMobile && <Toolbar />}
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
