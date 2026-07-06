/**
 * ActiveVisitBanner.jsx — persistentní pruh běžící návštěvy (2026-07-06):
 * pokud KO odejde z časomíry jinam po appce, musí čas vidět a umět se
 * jedním klepnutím vrátit — viz zadání "musí být vidět v horním pruhu".
 * Žije v MobileShell.jsx (nad Outletem, mimo scroll), takže je vidět na
 * KAŽDÉ obrazovce. Localstorage nevysílá 'storage' event ve stejném tabu,
 * proto se stav zjišťuje pollingem (stejný interval jako tikání času).
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Timer, ChevronRight } from 'lucide-react';
import { getActiveVisit, formatDuration } from '../../shared/visitTimerStorage.js';

export default function ActiveVisitBanner() {
  const navigate = useNavigate();
  const routeLocation = useLocation();
  const [visit, setVisit] = useState(() => getActiveVisit());
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      const current = getActiveVisit();
      setVisit(current);
      if (current) setElapsed(Math.floor((Date.now() - current.startedAt.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const onTimerScreen = routeLocation.pathname.endsWith('/navsteva');
  if (!visit || onTimerScreen) return null;

  return (
    <button
      type="button"
      onClick={() => navigate(`/admin/terenni/${visit.familyId}/navsteva`, { state: { familyName: visit.familyName } })}
      className="flex w-full items-center gap-2 bg-native-primary px-4 py-2 text-left"
    >
      <Timer size={15} strokeWidth={2.25} className="shrink-0 text-white" />
      <span className="truncate text-[13px] font-semibold text-white">
        Probíhá návštěva — {visit.familyName}
      </span>
      <span className="ml-auto shrink-0 text-[13px] font-bold tabular-nums text-white">{formatDuration(elapsed)}</span>
      <ChevronRight size={15} strokeWidth={2.25} className="shrink-0 text-white/80" />
    </button>
  );
}
