/**
 * MobileVisitTimerScreen.jsx — "Giant Timer" pro měření času návštěvy
 * (2026-07-06, Connecteam Time Clock vzor — ověřeno proti reálným
 * screenshotům appky): běžící stav = modrá karta s vloženou časomírou a
 * textovou adresou (reverzní geokódování, ne jen odkaz na mapu), ukončení =
 * červená PILULKA s textem, ne holý kruh. Poloha se zaznamená JEDNOU při
 * zahájení (ne trasa — viz geoUtils.js). Běžící návštěva žije v localStorage
 * (visitTimerStorage.js), do Firestore se zapíše jediný `timeline` záznam
 * typu `visit` až při ukončení. Čistě mobilní — bez desktop ekvivalentu.
 *
 * Rekapitulace (2026-07-05, Connecteam „konec směny" vzor): „Ukončit" nezapíše
 * hned — otevře sheet se souhrnem trvání a polem pro poznámku z návštěvy
 * (zápis vzniká na místě, ne až večer u počítače). Zavření sheetu křížkem =
 * návštěva dál běží, nic se nezapsalo.
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Square } from 'lucide-react';
import { getFoster, createTimelineEntry } from '../../services/orgService.js';
import { captureLocation, reverseGeocode } from '../../shared/geoUtils.js';
import {
  getActiveVisit, startActiveVisit, updateActiveVisitLocation, clearActiveVisit,
  formatDuration, formatDurationShort,
} from '../../shared/visitTimerStorage.js';
import MobileTopNav from '../ui/MobileTopNav.jsx';
import NativeButton from '../ui/NativeButton.jsx';
import NativeSheet from '../ui/NativeSheet.jsx';
import { NativeFormGroup, NativeFormRow, RowTextarea } from '../ui/NativeFormRow.jsx';

export default function MobileVisitTimerScreen() {
  const { familyId } = useParams();
  const navigate = useNavigate();
  const routeState = useLocation();

  const [visit, setVisit] = useState(null); // { familyId, familyName, startedAt, location }
  const [conflict, setConflict] = useState(null); // aktivní návštěva JINÉ rodiny
  const [elapsed, setElapsed] = useState(0);
  const [ending, setEnding] = useState(false);
  const [familyName, setFamilyName] = useState(routeState.state?.familyName ?? '');
  const [recap, setRecap] = useState(null); // { endedAt, durationSeconds } — otevřený souhrn
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!familyName) {
      getFoster(familyId).then((f) => f && setFamilyName(f.name)).catch(() => {});
    }
  }, [familyId, familyName]);

  useEffect(() => {
    const existing = getActiveVisit();
    if (existing && existing.familyId !== familyId) {
      setConflict(existing);
      return;
    }
    if (existing) {
      setVisit(existing);
      return;
    }
    captureLocation().then((loc) => {
      const started = startActiveVisit({ familyId, familyName: familyName || 'rodina', location: loc });
      setVisit(started);
      if (loc) {
        reverseGeocode(loc.lat, loc.lng).then((address) => {
          if (!address) return;
          const withAddress = { ...loc, address };
          updateActiveVisitLocation(withAddress);
          setVisit((v) => (v ? { ...v, location: withAddress } : v));
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [familyId]);

  useEffect(() => {
    if (!visit) return undefined;
    const tick = () => setElapsed(Math.floor((Date.now() - visit.startedAt.getTime()) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [visit]);

  function handleStop() {
    if (!visit || ending) return;
    const endedAt = new Date();
    const durationSeconds = Math.max(0, Math.floor((endedAt.getTime() - visit.startedAt.getTime()) / 1000));
    setRecap({ endedAt, durationSeconds });
  }

  async function handleSaveRecap() {
    if (!visit || !recap || ending) return;
    setEnding(true);
    try {
      await createTimelineEntry(familyId, {
        type: 'visit',
        title: `Návštěva (${formatDurationShort(recap.durationSeconds)})`,
        body: note.trim(),
        subjectRefs: [],
        occurredAt: visit.startedAt,
        startedAt: visit.startedAt,
        endedAt: recap.endedAt,
        durationSeconds: recap.durationSeconds,
        location: visit.location,
      });
      clearActiveVisit();
      navigate(`/admin/terenni/${familyId}`, { replace: true });
    } catch (err) {
      console.error('[MobileVisitTimerScreen] Uložení návštěvy selhalo:', err);
      setEnding(false);
    }
  }

  if (conflict) {
    return (
      <div>
        <MobileTopNav title="Návštěva" onBack={() => navigate(-1)} />
        <div className="mx-4 mt-6 flex flex-col gap-3 rounded-native-card bg-native-surface p-5 text-center">
          <p className="text-[15px] font-medium text-native-text">
            Máte již rozjetou návštěvu u rodiny {conflict.familyName}.
          </p>
          <p className="text-[14px] text-native-textMuted">Nejdřív ji dokončete, než začnete další.</p>
          <NativeButton className="mt-2 h-12" onClick={() => navigate(`/admin/terenni/${conflict.familyId}/navsteva`, { state: { familyName: conflict.familyName } })}>
            Přejít na rozjetou návštěvu
          </NativeButton>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-native-bg">
      <MobileTopNav title="Návštěva" onBack={() => navigate(-1)} />
      <div className="flex flex-col gap-5 px-4 pt-5">
        <div className="overflow-hidden rounded-native-card bg-native-primary">
          <div className="flex items-center justify-between px-4 pt-4">
            <p className="text-[14px] font-medium text-white/80">Probíhá návštěva</p>
            <span className="truncate rounded-full bg-white/20 px-3 py-1 text-[13px] font-semibold text-white">{familyName || 'Rodina'}</span>
          </div>
          <p className="py-5 text-center text-[56px] font-bold leading-none tabular-nums text-white">
            {formatDuration(elapsed)}
          </p>
          <div className="flex items-center gap-2 border-t border-white/15 px-4 py-3">
            <MapPin size={15} strokeWidth={2} className="shrink-0 text-white/80" />
            <p className="truncate text-[13px] text-white/90">
              {!visit ? 'Zjišťuji polohu…' : visit.location?.address ? `Příchod označen v: ${visit.location.address}` : visit.location ? 'Poloha zaznamenána (adresa se nepodařilo dohledat)' : 'Poloha nedostupná'}
            </p>
          </div>
        </div>

        <NativeButton variant="danger" className="h-14" onClick={handleStop} disabled={!visit || ending}>
          <Square size={18} strokeWidth={2.25} fill="currentColor" />
          Ukončit návštěvu
        </NativeButton>
      </div>

      {recap && (
        <NativeSheet
          title="Souhrn návštěvy"
          onClose={() => !ending && setRecap(null)}
          submitting={ending}
          footer={
            <NativeButton onClick={handleSaveRecap} disabled={ending}>
              {ending ? 'Ukládám…' : 'Uložit záznam'}
            </NativeButton>
          }
        >
          <div className="rounded-native-card bg-native-bg p-4 text-center">
            <p className="text-[13px] font-semibold uppercase tracking-wide text-native-textMuted">
              {familyName || 'Rodina'}
            </p>
            <p className="mt-1 text-[28px] font-bold leading-tight tabular-nums text-native-primary">
              {formatDuration(recap.durationSeconds)}
            </p>
            <p className="mt-0.5 text-[13px] text-native-textMuted">
              {visit?.location?.address ? `Zahájeno v: ${visit.location.address}` : visit?.location ? 'Poloha zaznamenána' : 'Bez záznamu polohy'}
            </p>
          </div>
          <NativeFormGroup>
            {/* Textarea se do horizontálního řádku (v4) nevejde → stacked */}
            <NativeFormRow label="Poznámka z návštěvy" isLast stacked hint="Můžete doplnit hned, nebo později rozkliknutím záznamu na Ose.">
              <RowTextarea rows={4} value={note} onChange={(e) => setNote(e.target.value)} autoFocus placeholder="Co se při návštěvě dělo…" />
            </NativeFormRow>
          </NativeFormGroup>
        </NativeSheet>
      )}
    </div>
  );
}
