/**
 * FosterFamilyDetailPage.jsx — Krok 3/4 zadání (2026-07-01)
 *
 * Detail pěstounské rodiny + seznam jí svěřených dětí (children, filtr
 * fosterFamilyId). Přístupné klíčové osobě (přidělené rodině) i org_adminovi
 * (celá organizace) — read už řeší firestore.rules, tady jen UI.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Chip, CircularProgress, Alert,
  IconButton, List, ListItem, ListItemAvatar, ListItemText, Avatar, Stack,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import PlaceIcon from '@mui/icons-material/Place';

import { bento } from '../../core/theme.js';
import { getFoster, listChildrenByFamily } from '../../services/orgService.js';

const STATUS_LABELS = { active: 'Aktivní', paused: 'Pozastaveno', exited: 'Ukončeno' };
const STATUS_COLOR = { active: 'success', paused: 'warning', exited: 'default' };

function formatBirthDate(value) {
  if (!value) return '—';
  const date = typeof value.toDate === 'function' ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('cs-CZ');
}

export default function FosterFamilyDetailPage() {
  const { familyId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [family, setFamily] = useState(null);
  const [children, setChildren] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [familyData, childrenData] = await Promise.all([
        getFoster(familyId),
        listChildrenByFamily(familyId),
      ]);
      if (!familyData) throw new Error('Rodina nenalezena.');
      setFamily(familyData);
      setChildren(childrenData);
    } catch (err) {
      console.error('[FosterFamilyDetailPage] Načtení selhalo:', err);
      setError(err.message ?? 'Data se nepodařilo načíst.');
    } finally {
      setLoading(false);
    }
  }, [familyId]);

  useEffect(() => { load(); }, [load]);

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} aria-label="Zpět"><ArrowBackIcon /></IconButton>
        <Typography variant="h4" fontWeight={700}>{loading ? 'Načítám…' : (family?.name ?? 'Rodina')}</Typography>
      </Stack>

      {loading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 6, justifyContent: 'center' }}>
          <CircularProgress size={28} />
        </Box>
      )}

      {!loading && error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && family && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: bento.gap }}>
          <Card sx={{ gridColumn: { xs: 'span 1', md: 'span 1' } }}>
            <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Chip size="small" label={STATUS_LABELS[family.status] ?? family.status} color={STATUS_COLOR[family.status] ?? 'default'} sx={{ alignSelf: 'flex-start' }} />
              {family.address && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                  <PlaceIcon fontSize="small" /><Typography variant="body2">{family.address}</Typography>
                </Box>
              )}
              {family.contactPhone && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                  <PhoneIcon fontSize="small" /><Typography variant="body2">{family.contactPhone}</Typography>
                </Box>
              )}
              {family.contactEmail && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                  <EmailIcon fontSize="small" /><Typography variant="body2">{family.contactEmail}</Typography>
                </Box>
              )}
              {family.note && (
                <>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, textTransform: 'uppercase', fontWeight: 600 }}>Poznámka</Typography>
                  <Typography variant="body2">{family.note}</Typography>
                </>
              )}
            </CardContent>
          </Card>

          <Card sx={{ gridColumn: { xs: 'span 1', md: 'span 2' } }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                Svěřené děti ({children.length})
              </Typography>
              <List>
                {children.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    Této rodině zatím nejsou přiřazené žádné děti.
                  </Typography>
                )}
                {children.map((child) => (
                  <ListItem key={child.id} disableGutters divider>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: (t) => alpha(t.palette.secondary.main, 0.2), color: 'secondary.dark' }}>
                        <ChildCareIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${child.firstName ?? ''} ${child.lastName ?? ''}`.trim() || '(bez jména)'}
                      secondary={`Narození: ${formatBirthDate(child.birthDate)}`}
                    />
                    <Chip size="small" label={child.status ?? 'active'} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
}
