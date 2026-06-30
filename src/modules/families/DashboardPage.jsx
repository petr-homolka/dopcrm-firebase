/**
 * DashboardPage.jsx — Přehled (MVP), Bento Grid layout
 *
 * Vizuální styl: Bento Grid (Apple-style) — modulární karty různých
 * velikostí na 4-sloupcové mřížce (2 na tabletu, 1 na mobilu), hover scale
 * a jemné stíny dle tokenů v core/theme.js (`bento`).
 *
 * Načítá data přes dataService.js (tenants/{tenantId}/data_objects):
 *   - počet aktivních rodin (type='family', status='active')
 *   - počet dětí (type='child')
 *   - 5 nejnovějších rodin (seřazeno dle createdAt desc, řazeno na klientovi)
 *
 * Stavy:
 *   - loading  → CircularProgress
 *   - error    → Alert (např. chybějící tenantId nebo Firestore chyba)
 *   - prázdná data → informativní hláška v kartách i tabulce
 */

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import PeopleIcon from '@mui/icons-material/People';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import WavingHandIcon from '@mui/icons-material/WavingHand';

import { fetchFamilies, fetchChildren } from '../../services/dataService.js';
import { currentUser } from '../../services/auth.js';
import { bento } from '../../core/theme.js';

// ── Formátování data ─────────────────────────────────────────────

function formatDate(value) {
  if (!value) return '—';
  // Firestore Timestamp má metodu toDate(); jinak zkusíme rovnou Date/string.
  const date = typeof value.toDate === 'function' ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('cs-CZ');
}

function formatTodayLong() {
  return new Date().toLocaleDateString('cs-CZ', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function firstName(user) {
  const name = user?.displayName ?? user?.email?.split('@')[0] ?? '';
  return name.split(/[\s.]+/)[0] || 'tam';
}

// ── Bento bunka pro statistiku (KPI) ──────────────────────────────

function StatCard({ icon, label, value, color = 'primary' }) {
  return (
    <Card
      sx={{
        position: 'relative',
        overflow: 'hidden',
        height: '100%',
        cursor: 'default',
        '&:hover': {
          transform: bento.hoverScale,
          boxShadow: bento.shadowHover,
        },
        '&:hover .bento-accent': { opacity: 1 },
      }}
    >
      <Box
        className="bento-accent"
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          backgroundColor: `${color}.main`,
          opacity: 0,
          transition: 'opacity .2s ease',
        }}
      />
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 3 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: (theme) => alpha(theme.palette[color].main, 0.12),
            color: `${color}.main`,
          }}
        >
          {icon}
        </Box>
        <Typography sx={{ fontSize: 32, fontWeight: 700, lineHeight: 1.1, mt: 1 }}>
          {value}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            textTransform: 'uppercase',
            letterSpacing: '.06em',
            color: 'text.secondary',
            fontWeight: 600,
          }}
        >
          {label}
        </Typography>
      </CardContent>
    </Card>
  );
}

// ── Bento bunka — pozdrav / hero dlaždice ─────────────────────────

function GreetingCard() {
  const user = currentUser();
  return (
    <Card
      sx={{
        height: '100%',
        backgroundColor: (theme) => alpha(theme.palette.secondary.main, 0.16),
        border: 'none',
        boxShadow: 'none',
        '&:hover': { transform: 'none', boxShadow: 'none' },
      }}
    >
      <CardContent
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 1,
          p: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WavingHandIcon sx={{ color: 'secondary.dark' }} />
          <Typography variant="h5" fontWeight={700}>
            Dobrý den, {firstName(user)}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
          {formatTodayLong()}
        </Typography>
      </CardContent>
    </Card>
  );
}

// ── Bento bunka — tabulka nejnovějších rodin ──────────────────────

function RecentFamiliesCard({ families }) {
  return (
    <Card sx={{ gridColumn: '1 / -1' }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
          Nejnovější rodiny
        </Typography>

        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Jméno</TableCell>
                <TableCell>Stav</TableCell>
                <TableCell>Vytvořeno</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {families.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ color: 'text.secondary', py: 4 }}>
                    Žádné rodiny k zobrazení.
                  </TableCell>
                </TableRow>
              )}
              {families.map((family) => (
                <TableRow key={family.id} hover>
                  <TableCell>{family.name ?? '(bez jména)'}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={family.status ?? 'neznámý'}
                      color={family.status === 'active' ? 'success' : 'default'}
                      variant={family.status === 'active' ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                  <TableCell>{formatDate(family.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [families, setFamilies] = useState([]);
  const [childrenCount, setChildrenCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const [familiesData, childrenData] = await Promise.all([
          fetchFamilies({ orderByField: 'createdAt', orderDirection: 'desc' }),
          fetchChildren(),
        ]);
        if (cancelled) return;
        setFamilies(familiesData);
        setChildrenCount(childrenData.length);
      } catch (err) {
        if (cancelled) return;
        console.error('[DashboardPage] Načtení dat selhalo:', err);
        setError(err.message ?? 'Data se nepodařilo načíst.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const activeFamiliesCount = families.filter((f) => f.status === 'active').length;
  const recentFamilies = families.slice(0, 5);

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
        Přehled
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Souhrn aktuálního stavu doprovázených rodin a dětí.
      </Typography>

      {loading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 6, justifyContent: 'center' }}>
          <CircularProgress size={28} />
          <Typography variant="body2" color="text.secondary">
            Načítám data…
          </Typography>
        </Box>
      )}

      {!loading && error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
            gap: bento.gap,
          }}
        >
          <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 2', md: 'span 2' } }}>
            <GreetingCard />
          </Box>

          <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 1', md: 'span 1' } }}>
            <StatCard
              icon={<PeopleIcon />}
              label="Aktivní rodiny"
              value={activeFamiliesCount}
              color="primary"
            />
          </Box>

          <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 1', md: 'span 1' } }}>
            <StatCard
              icon={<ChildCareIcon />}
              label="Děti v péči"
              value={childrenCount}
              color="secondary"
            />
          </Box>

          <RecentFamiliesCard families={recentFamilies} />
        </Box>
      )}
    </Box>
  );
}
