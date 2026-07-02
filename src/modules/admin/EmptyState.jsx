/**
 * EmptyState.jsx — sdílený vzhled prázdného stavu napříč admin dashboardy
 *
 * Přidáno 2026-07-02 po zpětné vazbě: holá tabulka s jednou řádkou textu
 * ("Zatím žádné organizace…") působí jako neošetřený edge-case, ne jako
 * promyšlený design. Tohle je jasně čitelný "hero" moment — ikona v kolečku,
 * nadpis, popisek, volitelná akce — použitý ve všech třech dashboardech
 * (SuperAdmin/OrgAdmin/Klíčová osoba) pro konzistentní první dojem.
 */

import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { bento } from '../../core/theme.js';

export default function EmptyState({ icon, title, description, action }) {
  return (
    <Card sx={{ border: 'none', boxShadow: 'none', bgcolor: 'transparent' }}>
      <CardContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 1.5,
          py: { xs: 6, sm: 8 },
          px: 3,
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
            color: 'primary.main',
            mb: 1,
          }}
        >
          {icon}
        </Box>
        <Typography variant="h6" fontWeight={700}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 380 }}>
          {description}
        </Typography>
        {action && <Box sx={{ mt: 1.5, display: 'grid', gap: bento.gap }}>{action}</Box>}
      </CardContent>
    </Card>
  );
}
