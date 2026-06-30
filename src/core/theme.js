/**
 * theme.js — MUI Theme (Material Design 3 + Bento Grid styl) — Doprovázení CRM
 *
 * Barvy:
 *   primary   — indigo (akce, odkazy, aktivní stavy v navigaci)
 *   secondary — žlutá brand barva (--accent z původního vanilla prototypu),
 *               použita pro logo/avatary/akcenty, aby appka zůstala vizuálně
 *               navázaná na claude.doprovazeni.com
 *
 * Vizuální styl: Bento Grid (Apple-style) — modulární karty různých velikostí,
 * hodně negativního prostoru, zaoblené rohy (20px), jemné stíny místo
 * výrazných okrajů, hover scale 1.02 na interaktivních kartách.
 * Tokeny níže (bento.*) jsou sdílené konstanty pro stránky, které bento
 * layout používají (viz DashboardPage.jsx).
 */

import { createTheme } from '@mui/material/styles';

// ── Bento Grid tokeny (sdíleno mezi theme.js a stránkami) ──────
export const bento = {
  radius: 20,
  gap: 2.5, // MUI spacing units (×8px = 20px)
  shadow: '0 4px 6px rgba(15,23,42,0.05)',
  shadowHover: '0 12px 28px rgba(15,23,42,0.12)',
  hoverScale: 'scale(1.02)',
  transition: 'transform .2s ease, box-shadow .2s ease',
};

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#4F46E5',
      light: '#7C73F0',
      dark: '#3730A3',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#FFDB4D',
      light: '#FFE780',
      dark: '#E0B82E',
      contrastText: '#111111',
    },
    background: {
      default: '#F7F7FB',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A1A2E',
      secondary: '#6B6B80',
    },
    divider: '#E6E6F0',
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    button: { fontWeight: 600, textTransform: 'none' },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: bento.radius,
          border: '1px solid rgba(15,23,42,.04)',
          boxShadow: bento.shadow,
          transition: bento.transition,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
        },
      },
    },
  },
});

export default theme;
