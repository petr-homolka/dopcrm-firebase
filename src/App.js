/**
 * App.js — kořenová komponenta aplikace
 *
 * Obaluje celý strom do MUI <ThemeProvider> (Material Design 3 theme,
 * viz src/core/theme.js) a <CssBaseline> (reset stylů, sjednocené
 * pozadí/typografie napříč prohlížeči).
 *
 * AppRouter (AuthProvider + RouterProvider + lazy stránky) zůstává
 * beze změny — App.js je čistě vizuální obal.
 */

import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './core/theme.js';
import AppRouter from './core/router.jsx';
import ErrorBoundary from './core/ErrorBoundary.jsx';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <AppRouter />
      </ErrorBoundary>
    </ThemeProvider>
  );
}
