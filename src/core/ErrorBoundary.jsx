/**
 * ErrorBoundary.jsx — poslední záchranná síť proti bílé obrazovce
 *
 * Přidáno 2026-07-01 po produkčním incidentu: chybějící Firebase env
 * proměnné v CI buildu způsobily, že `getAuth(app)` shodil celou appku
 * hned při načtení modulu (SYNCHRONNĚ, ještě před prvním renderem),
 * a appka neměla ŽÁDNÝ error boundary — výsledkem byla úplně bílá
 * stránka bez jakékoli zprávy pro uživatele.
 *
 * Tenhle boundary NEŘEŠÍ chyby při importu modulu (ty se stanou dřív,
 * než React vůbec začne renderovat — proti tomu chrání až oprava env
 * proměnných v CI, viz .github/workflows/*.yml). Řeší ale VŠECHNY
 * budoucí neočekávané chyby při renderu (špatný Zustand selector,
 * Firestore permission-denied vyhozená synchronně v komponentě, bug
 * v nové lazy-loaded stránce…) — místo tiché bílé obrazovky se ukáže
 * čitelná hláška s tlačítkem na obnovení.
 */

import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary] Neočekávaná chyba při renderu:', error, info?.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div
        style={{
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          padding: 32,
          textAlign: 'center',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          background: '#F7F7FB',
          color: '#1A1A2E',
        }}
      >
        <div style={{ fontSize: 40 }}>⚠</div>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Něco se nepovedlo</h1>
        <p style={{ fontSize: 14, color: '#6B6B80', maxWidth: 420, margin: 0 }}>
          Aplikace narazila na neočekávanou chybu a nemůže pokračovat. Zkuste stránku obnovit;
          pokud problém přetrvává, kontaktujte správce systému.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '10px 20px',
            borderRadius: 10,
            border: 'none',
            background: '#4F46E5',
            color: '#fff',
            fontWeight: 600,
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          Obnovit stránku
        </button>
      </div>
    );
  }
}
