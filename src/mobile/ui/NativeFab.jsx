/**
 * NativeFab.jsx — jediné plovoucí tlačítko se speed-dial nabídkou (vzor
 * Things / Connecteam, 2026-07-05). Dvě FAB tlačítka nad sebou byla matoucí
 * — teď jedno "+", po klepnutí ztmavne pozadí a vyjedou pojmenované akce
 * (pill s ikonou + textem). Zavření: volba akce, klepnutí na scrim, nebo ×.
 */

import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

export default function NativeFab({ actions }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 bg-black/30" onClick={() => setOpen(false)} aria-hidden="true" />
      )}
      <div className="fixed bottom-[calc(49px+env(safe-area-inset-bottom)+16px)] right-4 z-40 flex flex-col items-end gap-3">
        {open && actions.map(({ icon: Icon, label, onClick }) => (
          <button
            key={label}
            type="button"
            onClick={() => { setOpen(false); onClick(); }}
            className="flex items-center gap-2 rounded-full bg-native-surface py-2.5 pl-4 pr-5 text-[15px] font-semibold text-native-primary transition-transform duration-100 active:scale-[0.96]"
          >
            <Icon size={18} strokeWidth={2} />
            {label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Zavřít nabídku' : 'Přidat'}
          aria-expanded={open}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-native-primary text-white transition-transform duration-100 active:scale-[0.94]"
        >
          {open ? <X size={26} strokeWidth={2.25} /> : <Plus size={26} strokeWidth={2.25} />}
        </button>
      </div>
    </>
  );
}
