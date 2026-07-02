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
        {/* Lineart ikona (Feather styl), ne emoji — viz CLAUDE.md "Emoji = 0". Raw inline SVG,
            záměrně BEZ importu z lucide-react: boundary musí přežít i kdyby problém byl
            v samotném UI stromu, proto je nezávislý na čemkoli, co by mohlo spadnout. */}
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
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
