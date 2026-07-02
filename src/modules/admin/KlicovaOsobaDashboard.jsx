/**
 * KlicovaOsobaDashboard.jsx — Krok 3 zadání (2026-07-01), obohaceno 2026-07-02
 *
 * Terénní pohled klíčové osoby: výchozí záložka "Moje rodiny" (Bento Grid
 * karty rodin přidělených jí, assignedTo == její uid — jediné, do čeho smí
 * zapisovat). Záložka "Celá organizace" navíc ukazuje hierarchickou
 * viditelnost — čtení všech rodin organizace (zastupitelnost, přehled),
 * firestore.rules to KO povolují, jen zápis mají omezený na svoje.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Box, Typography, Card, CardActionArea, CardContent, Chip, CircularProgress, Alert, Avatar, Tabs, Tab } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import PhoneIcon from '@mui/icons-material/Phone';
import PlaceIcon from '@mui/icons-material/Place';

import { bento } from '../../core/theme.js';
import { useAuthStore } from '../../store/authStore.js';
import { listFostersAssignedTo } from '../../services/orgService.js';
import EmptyState from './EmptyState.jsx';
import FosterFamiliesPanel from './FosterFamiliesPanel.jsx';

const STATUS_LABELS = { active: 'Aktivní', paused: 'Pozastaveno', exited: 'Ukončeno' };
const STATUS_COLOR = { active: 'success', paused: 'warning', exited: 'default' };

function initials(name) {
  return (name || '?').split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('') || '?';
}

function FamilyCard({ family, onClick }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardActionArea onClick={onClick} sx={{ height: '100%' }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, p: 3, height: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Avatar sx={{ bgcolor: (t) => alpha(t.palette.primary.main, 0.14), color: 'primary.main', fontWeight: 700 }}>
              {initials(family.name)}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography fontWeight={700} noWrap>{family.name || '(bez jména)'}</Typography>
              <Chip size="small" label={STATUS_LABELS[family.status] ?? family.status} color={STATUS_COLOR[family.status] ?? 'default'} sx={{ mt: 0.5 }} />
            </Box>
          </Box>
          {family.address && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
              <PlaceIcon fontSize="small" />
              <Typography variant="body2" noWrap>{family.address}</Typography>
            </Box>
          )}
          {family.contactPhone && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
              <PhoneIcon fontSize="small" />
              <Typography variant="body2">{family.contactPhone}</Typography>
            </Box>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

function MyFamilies() {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [families, setFamilies] = useState([]);

  const load = useCallback(async () => {
    if (!currentUser?.uid) return;
    setLoading(true);
    setError('');
    try {
      setFamilies(await listFostersAssignedTo(currentUser.uid));
    } catch (err) {
      console.error('[KlicovaOsobaDashboard] listFostersAssignedTo selhalo:', err);
      setError(err.message ?? 'Rodiny se nepodařilo načíst.');
    } finally {
      setLoading(false);
    }
  }, [currentUser?.uid]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 6, justifyContent: 'center' }}>
        <CircularProgress size={28} />
      </Box>
    );
  }
  if (error) return <Alert severity="error">{error}</Alert>;
  if (families.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={<HomeOutlinedIcon sx={{ fontSize: 32 }} />}
          title="Zatím nemáte přidělené žádné rodiny"
          description="Přiřazení pěstounských rodin ke klíčovým osobám řeší Org. Admin vaší organizace."
        />
      </Card>
    );
  }
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: bento.gap }}>
      {families.map((family) => (
        <FamilyCard key={family.id} family={family} onClick={() => navigate(`/admin/terenni/${family.id}`)} />
      ))}
    </Box>
  );
}

export default function KlicovaOsobaDashboard() {
  const { organizationId } = useAuthStore();
  const [tab, setTab] = useState('moje');

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>Terén</Typography>

      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Tab value="moje" label="Moje rodiny" />
        <Tab value="organizace" label="Celá organizace" />
      </Tabs>

      {tab === 'moje' && <MyFamilies />}
      {tab === 'organizace' && <FosterFamiliesPanel organizationId={organizationId} basePath="/admin/terenni" canCreate={false} />}
    </Box>
  );
}
