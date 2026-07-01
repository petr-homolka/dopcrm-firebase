/**
 * Login.jsx — přihlašovací obrazovka (B2B SaaS), MUI + Bento Grid
 *
 * Využívá services/orgAuth.js (NOVÉ schéma, 2026-07-01):
 *   - identita ověřena přes Firebase Auth (e-mail + heslo)
 *   - role/organizace načtena z Firestore users/{uid}, NIKDY z Custom Claims
 *   - po přihlášení redirect podle role: superadmin/org_admin/klicova_osoba
 *     mají každý svůj dashboard (dashboardPathForRole), ostatní (legacy
 *     user_roles účty) padají na starší /prehled.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Avatar,
  Typography,
  TextField,
  Button,
  Alert,
  IconButton,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import MailOutlineIcon from '@mui/icons-material/MailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase.js';
import { signIn, dashboardPathForRole } from '../../services/orgAuth.js';
import { useAuthStore } from '../../store/authStore.js';

// ── Mapování Firebase chybových kódů na čitelné zprávy ─────────

function mapFirebaseError(code) {
  const map = {
    'auth/user-not-found': 'Účet s tímto e-mailem neexistuje.',
    'auth/wrong-password': 'Nesprávné heslo.',
    'auth/invalid-email': 'Neplatný formát e-mailu.',
    'auth/user-disabled': 'Tento účet byl deaktivován. Kontaktujte správce.',
    'auth/too-many-requests': 'Příliš mnoho pokusů. Zkuste to za chvíli.',
    'auth/network-request-failed': 'Síťová chyba. Zkontrolujte připojení.',
    'auth/invalid-credential': 'Nesprávný e-mail nebo heslo.',
  };
  return map[code] ?? 'Přihlášení se nezdařilo. Zkuste to znovu.';
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser: authUser, role: authRole, loading: authLoading } = useAuthStore();

  // Explicitní "from" (deep-link) má přednost; jinak se určí až podle role po přihlášení.
  const explicitFrom = location.state?.from?.pathname;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' });

  // Pokud je uživatel už přihlášen (store stihl dotáhnout roli), přesměruj okamžitě.
  useEffect(() => {
    if (!authLoading && authUser) {
      navigate(explicitFrom ?? dashboardPathForRole(authRole), { replace: true });
    }
  }, [authLoading, authUser, authRole, explicitFrom, navigate]);

  // Validace polí před odesláním
  function validate() {
    const errs = { email: '', password: '' };
    let ok = true;

    if (!email.trim()) {
      errs.email = 'E-mail je povinný.';
      ok = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Zadejte platný e-mail.';
      ok = false;
    }

    if (!password) {
      errs.password = 'Heslo je povinné.';
      ok = false;
    } else if (password.length < 6) {
      errs.password = 'Heslo musí mít alespoň 6 znaků.';
      ok = false;
    }

    setFieldErrors(errs);
    return ok;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!validate()) return;

    setLoading(true);
    try {
      // signIn(): Firebase Auth. Role/organizace se čte z users/{uid} (nikdy z tokenu) —
      // authStore ji dotáhne přes onSnapshot asynchronně, ale pro okamžitý redirect
      // po loginu ji zde ještě jednou přečteme přímo (rychlejší než čekat na store).
      const user = await signIn(email.trim(), password);
      const profileSnap = await getDoc(doc(db, 'users', user.uid));
      const role = profileSnap.exists() ? profileSnap.data().role : null;
      navigate(explicitFrom ?? dashboardPathForRole(role), { replace: true });
    } catch (err) {
      setError(mapFirebaseError(err.code));
    } finally {
      setLoading(false);
    }
  }

  function handleEmailChange(e) {
    setEmail(e.target.value);
    if (fieldErrors.email) setFieldErrors((fe) => ({ ...fe, email: '' }));
    if (error) setError('');
  }

  function handlePasswordChange(e) {
    setPassword(e.target.value);
    if (fieldErrors.password) setFieldErrors((fe) => ({ ...fe, password: '' }));
    if (error) setError('');
  }

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 5 },
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 2px 16px rgba(20,20,43,.08)',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Avatar
              variant="rounded"
              sx={{
                bgcolor: 'secondary.main',
                color: 'secondary.contrastText',
                width: 56,
                height: 56,
                fontSize: 26,
                fontWeight: 800,
                mb: 2,
              }}
            >
              D
            </Avatar>
            <Typography variant="h5" fontWeight={700} textAlign="center">
              Přihlaste se
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 0.5 }}>
              Doprovázení CRM — podpora pěstounských rodin
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} role="alert">
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              id="login-email"
              label="E-mail"
              type="email"
              autoComplete="email"
              autoFocus
              fullWidth
              value={email}
              onChange={handleEmailChange}
              placeholder="vas@email.cz"
              disabled={loading}
              error={!!fieldErrors.email}
              helperText={fieldErrors.email || ' '}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MailOutlineIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              id="login-password"
              label="Heslo"
              type={showPass ? 'text' : 'password'}
              autoComplete="current-password"
              fullWidth
              value={password}
              onChange={handlePasswordChange}
              placeholder="••••••••"
              disabled={loading}
              error={!!fieldErrors.password}
              helperText={fieldErrors.password || ' '}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPass((v) => !v)}
                      aria-label={showPass ? 'Skrýt heslo' : 'Zobrazit heslo'}
                      edge="end"
                      tabIndex={-1}
                      disabled={loading}
                    >
                      {showPass ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              disabled={loading}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
              sx={{ mt: 0.5, py: 1.2 }}
            >
              {loading ? 'Přihlašuji…' : 'Přihlásit se'}
            </Button>
          </Box>

          <Typography variant="caption" color="text.secondary" textAlign="center" sx={{ display: 'block', mt: 3 }}>
            Zapomenuté heslo? Kontaktujte správce organizace.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
