/**
 * useIsMobile.js — JEDINÉ místo, které rozhoduje mobil vs. desktop (STRICT
 * UI/UX DESIGN MANDATE, 2026-07-05). Žádné Tailwind `lg:`/`sm:` mixování
 * uvnitř sdílených komponent — každá obrazovka renderuje buď svůj
 * `src/mobile/` strom, nebo svůj `src/modules/` desktop strom, nikdy obojí
 * v jedné JSX větvi. Breakpoint 1024px sjednocen s dosavadní `lg` konvencí.
 */

import { useEffect, useState } from 'react';

const BREAKPOINT = 1024;

function computeIsMobile() {
  return typeof window !== 'undefined' && window.innerWidth < BREAKPOINT;
}

export default function useIsMobile() {
  const [isMobile, setIsMobile] = useState(computeIsMobile);

  useEffect(() => {
    const onResize = () => setIsMobile(computeIsMobile());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return isMobile;
}
