/**
 * RegisterPage.jsx — veřejná registrace organizace (2026-07-02)
 *
 * Kdokoli si tu založí VLASTNÍ organizaci a stane se jejím zástupcem
 * (role org_admin) — bez zásahu Superadmina, viz registrationService.js.
 * Veřejná route (`/registrace`), stejný vizuální jazyk jako Login.jsx.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Paper, Avatar, Typography, TextField, Button, Alert,
  CircularProgress, Divider, Checkbox, FormControlLabel, Grid,
} from '@mui/material';
import { registerOrganization } from '../../services/registrationService.js';
import { dashboardPathForRole } from '../../services/orgAuth.js';

function mapFirebaseError(code) {
  const map = {
    'auth/email-already-in-use': 'Tento e-mail už je zaregistrovaný. Zkuste se přihlásit.',
    'auth/invalid-email': 'Neplatný formát e-mailu.',
    'auth/weak-password': 'Heslo je příliš slabé — zvolte alespoň 6 znaků.',
    'auth/network-request-failed': 'Síťová chyba. Zkontrolujte připojení.',
  };
  return map[code] ?? 'Registrace se nezdařila. Zkuste to znovu.';
}

const emptyForm = {
  orgName: '', ico: '', dataBoxId: '',
  sidloStreet: '', sidloCity: '', sidloZip: '',
  sameAsSidlo: true,
  provStreet: '', provCity: '', provZip: '',
  zFirstName: '', zLastName: '', zFunkce: 'Zástupce organizace', zRc: '', zPhone: '',
  email: '', password: '',
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function updateForm(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.orgName.trim() || !form.zFirstName.trim() || !form.zLastName.trim() || !form.email.trim() || form.password.length < 6) {
      setError('Vyplňte prosím povinná pole. Heslo musí mít alespoň 6 znaků.');
      return;
    }

    setSubmitting(true);
    try {
      const { role } = await (async () => {
        await registerOrganization({
          orgName: form.orgName.trim(),
          ico: form.ico.trim(),
          dataBoxId: form.dataBoxId.trim(),
          sidlo: { street: form.sidloStreet.trim(), city: form.sidloCity.trim(), zip: form.sidloZip.trim() },
          provozovna: form.sameAsSidlo ? null : { street: form.provStreet.trim(), city: form.provCity.trim(), zip: form.provZip.trim() },
          zastupce: { firstName: form.zFirstName.trim(), lastName: form.zLastName.trim(), funkce: form.zFunkce.trim(), rc: form.zRc.trim(), phone: form.zPhone.trim() },
          email: form.email.trim(),
          password: form.password,
        });
        return { role: 'org_admin' };
      })();
      navigate(dashboardPathForRole(role), { replace: true });
    } catch (err) {
      console.error('[RegisterPage] registerOrganization selhalo:', err);
      setError(mapFirebaseError(err.code) ?? err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', py: 4 }}>
      <Container maxWidth="sm">
        <Paper elevation={0} sx={{ p: { xs: 3, sm: 5 }, borderRadius: 4, border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 16px rgba(20,20,43,.08)' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Avatar variant="rounded" sx={{ bgcolor: 'secondary.main', color: 'secondary.contrastText', width: 56, height: 56, fontSize: 26, fontWeight: 800, mb: 2 }}>D</Avatar>
            <Typography variant="h5" fontWeight={700} textAlign="center">Založit organizaci</Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 0.5 }}>
              Doprovázení CRM — registrace nové doprovázející organizace
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }} role="alert">{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Typography variant="overline" color="text.secondary" fontWeight={700}>Organizace</Typography>
            <TextField label="Název organizace" value={form.orgName} onChange={updateForm('orgName')} fullWidth required disabled={submitting} autoFocus />
            <Grid container spacing={2}>
              <Grid item xs={6}><TextField label="IČO" value={form.ico} onChange={updateForm('ico')} fullWidth disabled={submitting} /></Grid>
              <Grid item xs={6}><TextField label="Datová schránka" value={form.dataBoxId} onChange={updateForm('dataBoxId')} fullWidth disabled={submitting} /></Grid>
            </Grid>

            <Divider />
            <Typography variant="overline" color="text.secondary" fontWeight={700}>Adresa sídla</Typography>
            <TextField label="Ulice a číslo" value={form.sidloStreet} onChange={updateForm('sidloStreet')} fullWidth disabled={submitting} />
            <Grid container spacing={2}>
              <Grid item xs={8}><TextField label="Město" value={form.sidloCity} onChange={updateForm('sidloCity')} fullWidth disabled={submitting} /></Grid>
              <Grid item xs={4}><TextField label="PSČ" value={form.sidloZip} onChange={updateForm('sidloZip')} fullWidth disabled={submitting} /></Grid>
            </Grid>

            <FormControlLabel
              control={<Checkbox checked={form.sameAsSidlo} onChange={(e) => setForm((f) => ({ ...f, sameAsSidlo: e.target.checked }))} disabled={submitting} />}
              label="Adresa provozovny je stejná jako sídlo"
            />
            {!form.sameAsSidlo && (
              <>
                <Typography variant="overline" color="text.secondary" fontWeight={700}>Adresa provozovny</Typography>
                <TextField label="Ulice a číslo" value={form.provStreet} onChange={updateForm('provStreet')} fullWidth disabled={submitting} />
                <Grid container spacing={2}>
                  <Grid item xs={8}><TextField label="Město" value={form.provCity} onChange={updateForm('provCity')} fullWidth disabled={submitting} /></Grid>
                  <Grid item xs={4}><TextField label="PSČ" value={form.provZip} onChange={updateForm('provZip')} fullWidth disabled={submitting} /></Grid>
                </Grid>
              </>
            )}

            <Divider />
            <Typography variant="overline" color="text.secondary" fontWeight={700}>Zástupce organizace (váš účet)</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}><TextField label="Jméno" value={form.zFirstName} onChange={updateForm('zFirstName')} fullWidth required disabled={submitting} /></Grid>
              <Grid item xs={6}><TextField label="Příjmení" value={form.zLastName} onChange={updateForm('zLastName')} fullWidth required disabled={submitting} /></Grid>
            </Grid>
            <TextField label="Funkce v organizaci" value={form.zFunkce} onChange={updateForm('zFunkce')} fullWidth disabled={submitting} />
            <Grid container spacing={2}>
              <Grid item xs={6}><TextField label="Rodné číslo" placeholder="např. 765912/3210" value={form.zRc} onChange={updateForm('zRc')} fullWidth disabled={submitting} /></Grid>
              <Grid item xs={6}><TextField label="Telefon" value={form.zPhone} onChange={updateForm('zPhone')} fullWidth disabled={submitting} /></Grid>
            </Grid>
            <TextField label="Přihlašovací e-mail" type="email" value={form.email} onChange={updateForm('email')} fullWidth required disabled={submitting} />
            <TextField label="Heslo" type="password" value={form.password} onChange={updateForm('password')} fullWidth required disabled={submitting} helperText="Alespoň 6 znaků." />

            <Button type="submit" variant="contained" size="large" fullWidth disabled={submitting} startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : null} sx={{ mt: 1, py: 1.2 }}>
              {submitting ? 'Zakládám organizaci…' : 'Založit organizaci a pokračovat'}
            </Button>
          </Box>

          <Typography variant="caption" color="text.secondary" textAlign="center" sx={{ display: 'block', mt: 3 }}>
            Už máte účet? <Box component="a" href="/login" sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none' }}>Přihlaste se</Box>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
