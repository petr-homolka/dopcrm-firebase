/**
 * KlicovaOsobaDashboard.jsx — Krok 3 zadání (2026-07-01)
 *
 * Terénní pohled klíčové osoby: Bento Grid karty přidělených pěstounských
 * rodin (assignedTo == její uid). Klik na kartu → FosterFamilyDetailPage.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Box, Typography, Card, CardActionArea, CardContent, Chip, CircularProgress, Alert, Avatar } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import PhoneIcon from '@mui/icons-material/Phone';
import PlaceIcon from '@mui/icons-material/Place';

import { bento } from '../../core/theme.js';
import { useAuthStore } from '../../store/authStore.js';
import { listFostersAssignedTo } from '../../services/orgService.js';

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

export default function KlicovaOsobaDashboard() {
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

  const activeCount = families.filter((f) => f.status === 'active').length;

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>Moje rodiny</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {loading ? 'Načítám…' : `${families.length} přidělených rodin, z toho ${activeCount} aktivních.`}
      </Typography>

      {loading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 6, justifyContent: 'center' }}>
          <CircularProgress size={28} />
        </Box>
      )}

      {!loading && error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && families.length === 0 && (
        <Alert severity="info" icon={<HomeIcon fontSize="inherit" />}>
          Zatím vám nejsou přidělené žádné rodiny. Přiřazení řeší Org. Admin vaší organizace.
        </Alert>
      )}

      {!loading && !error && families.length > 0 && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: bento.gap }}>
          {families.map((family) => (
            <FamilyCard key={family.id} family={family} onClick={() => navigate(`/admin/terenni/${family.id}`)} />
          ))}
        </Box>
      )}
    </Box>
  );
}
