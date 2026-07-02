/**
 * App.js — kořenová komponenta aplikace
 *
 * Čistě směrovač/obal: importuje AppRouter (AuthProvider + RouterProvider +
 * lazy stránky) do ErrorBoundary. Vizuál řídí Tailwind (src/index.css),
 * žádný runtime theme provider.
 */

import React from 'react';
import AppRouter from './core/router.jsx';
import ErrorBoundary from './core/ErrorBoundary.jsx';

export default function App() {
  return (
    <ErrorBoundary>
      <AppRouter />
    </ErrorBoundary>
  );
}
