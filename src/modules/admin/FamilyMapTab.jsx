/**
 * FamilyMapTab.jsx — záložka „Mapa" v detailu rodiny (2026-07-13, vzor: sekce
 * Mapa z prototypu). PRIVACY: adresa rodiny (citlivá PII) se NEODESÍLÁ nikam
 * automaticky. Mapa (geokódování přes Nominatim + vložený OpenStreetMap) se
 * načte až na výslovné kliknutí „Zobrazit mapu"; „Otevřít v Mapách" je odkaz,
 * který spouští uživatel. Žádný API klíč.
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, ExternalLink, Loader2, Map as MapIcon } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';

export default function FamilyMapTab({ family }) {
  const { t } = useTranslation();
  const address = (family?.address ?? '').trim();
  const [state, setState] = useState('idle'); // idle | loading | ready | none
  const [coords, setCoords] = useState(null);

  async function showMap() {
    if (!address) return;
    setState('loading');
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`,
        { headers: { Accept: 'application/json' } },
      );
      const data = await res.json();
      if (Array.isArray(data) && data[0]) {
        setCoords({ lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) });
        setState('ready');
      } else {
        setState('none');
      }
    } catch (err) {
      console.error('[FamilyMapTab] Geokódování selhalo:', err);
      setState('none');
    }
  }

  const mapsHref = address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}` : null;
  const embedSrc = coords
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${coords.lon - 0.008}%2C${coords.lat - 0.006}%2C${coords.lon + 0.008}%2C${coords.lat + 0.006}&layer=mapnik&marker=${coords.lat}%2C${coords.lon}`
    : null;

  if (!address) {
    return (
      <div className="rounded-xl border border-border-subtle bg-white p-6 text-center shadow-sm">
        <MapPin size={26} strokeWidth={1.5} className="mx-auto mb-2 text-ink-300" />
        <p className="text-sm text-ink-500">{t('dsk.map.noAddress', 'Adresa rodiny není vyplněná — doplňte ji v profilu.')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="rounded-xl border border-border-subtle bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-tint text-brand-600">
            <MapPin size={20} strokeWidth={1.75} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">{t('dsk.common.address', 'Adresa')}</p>
            <p className="text-sm text-ink-800">{address}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {state !== 'ready' && (
            <Button size="sm" onClick={showMap} disabled={state === 'loading'}>
              {state === 'loading' ? <Loader2 size={15} strokeWidth={1.75} className="animate-spin" /> : <MapIcon size={15} strokeWidth={1.75} />}
              {state === 'loading' ? t('dsk.map.loading', 'Načítám mapu…') : t('dsk.map.show', 'Zobrazit mapu')}
            </Button>
          )}
          <a
            href={mapsHref}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex h-8 items-center gap-2 rounded-lg border border-border-strong bg-white px-3 text-xs font-semibold text-ink-800 hover:bg-surface-muted"
          >
            <ExternalLink size={14} strokeWidth={1.75} /> {t('dsk.map.openExternal', 'Otevřít v Mapách')}
          </a>
        </div>

        <p className="mt-2 text-[11px] text-ink-400">
          {t('dsk.map.privacyHint', 'Mapa se načte z OpenStreetMap až na vaše kliknutí — adresa se do té doby nikam neodesílá.')}
        </p>

        {state === 'none' && (
          <p className="mt-3 rounded-lg bg-warning-50 px-3 py-2 text-xs text-warning-700">
            {t('dsk.map.notFound', 'Adresu se nepodařilo najít na mapě. Zkuste ji zpřesnit, nebo použijte „Otevřít v Mapách“.')}
          </p>
        )}
      </div>

      {state === 'ready' && embedSrc && (
        <div className="mt-4 overflow-hidden rounded-xl border border-border-subtle shadow-sm">
          <iframe
            title={t('dsk.map.iframeTitle', 'Mapa — poloha rodiny')}
            src={embedSrc}
            className="h-80 w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        </div>
      )}
    </div>
  );
}
