/**
 * MobileParticipantDetailScreen.jsx — správa externího účastníka (strana KO,
 * 2026-07-06, docs/domain/externi-ucastnici.md §4/§5). Modrý hero, seznam
 * VŠECH oprávnění z katalogu s aktuálním stavem (výchozí = vypnuto), klepnutí
 * otevře správu grantu (PermissionGrantSheet), níže neměnná auditní stopa.
 * Route /admin/terenni/:familyId/deti/:childId/ucastnici/:epId.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { cn } from '../../../components/ui/cn.js';
import { getExternalParticipant, listGrants, listEpAudit } from '../../../services/orgService.js';
import {
  EXTERNAL_PERMISSIONS, PERMISSION_CATEGORIES, GRANT_STATUS, isGrantActive, isSensitivePermission,
} from '../../../shared/externalPermissions.js';
import { toDate } from '../../../modules/admin/useTodayPage.js';
import MobileTopNav from '../../ui/MobileTopNav.jsx';
import NativeHero, { HeroBody } from '../../ui/NativeHero.jsx';
import { NativeChip, SectionLabel } from '../../ui/NativeBits.jsx';
import PermissionGrantSheet from './PermissionGrantSheet.jsx';

function ts(v) {
  const d = toDate(v);
  return d ? d.toLocaleString('cs-CZ', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
}

/** Nejnovější grant pro klíč + jeho zobrazovaný stav. */
function grantState(grants, key) {
  const gs = grants.filter((g) => g.permissionKey === key).sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
  const latest = gs[0] ?? null;
  if (!latest) return { latest: null, label: 'Vypnuto', tone: 'muted' };
  if (isGrantActive(latest)) return { latest, label: 'Aktivní', tone: 'primary' };
  if (latest.status === 'requested') return { latest, label: GRANT_STATUS.requested, tone: 'warning' };
  if (latest.status === 'approved') return { latest, label: GRANT_STATUS.approved, tone: 'warning' };
  if (latest.status === 'active') return { latest, label: 'Mimo platnost/okno', tone: 'muted' };
  return { latest, label: 'Vypnuto', tone: 'muted' };
}

export default function MobileParticipantDetailScreen() {
  const { epId } = useParams();
  const navigate = useNavigate();
  const [ep, setEp] = useState(null);
  const [grants, setGrants] = useState([]);
  const [audit, setAudit] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sheet, setSheet] = useState(null); // { permissionKey, grant }

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [e, g, a] = await Promise.all([getExternalParticipant(epId), listGrants(epId), listEpAudit(epId, 100)]);
      setEp(e); setGrants(g); setAudit(a);
    } catch (err) {
      console.error('[Participant] Načtení selhalo:', err);
    } finally { setLoading(false); }
  }, [epId]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return <div><MobileTopNav title="Účastník" onBack={() => navigate(-1)} /><p className="py-16 text-center text-[15px] text-native-textMuted">Načítám…</p></div>;
  }
  if (!ep) {
    return <div><MobileTopNav title="Účastník" onBack={() => navigate(-1)} /><p className="py-16 text-center text-[15px] text-native-textMuted">Účastník nenalezen.</p></div>;
  }

  const cats = ['view', 'chat', 'action'];

  return (
    <div>
      <MobileTopNav variant="hero" title="Účastník" onBack={() => navigate(-1)} />
      <NativeHero
        title={ep.displayName}
        subtitle={
          <>
            {ep.relationLabel && <span className="inline-flex items-center rounded-full bg-white/20 px-2.5 py-1 text-[12px] font-semibold text-white">{ep.relationLabel}</span>}
            {ep.childName && <span className="inline-flex items-center rounded-full bg-white/20 px-2.5 py-1 text-[12px] font-semibold text-white">{ep.childName}</span>}
          </>
        }
      />

      <HeroBody>
        <div className="p-4 pb-10">
          {cats.map((cat) => (
            <div key={cat}>
              <SectionLabel>{PERMISSION_CATEGORIES[cat]}</SectionLabel>
              <div className="overflow-hidden rounded-native-card bg-native-surface">
                {EXTERNAL_PERMISSIONS.filter((p) => p.category === cat).map((p, i, arr) => {
                  const st = grantState(grants, p.key);
                  return (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => setSheet({ permissionKey: p.key, grant: st.latest })}
                      className={cn('flex w-full items-center gap-2 px-4 py-3.5 text-left active:bg-native-bg', i < arr.length - 1 && 'border-b border-native-separator')}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5 text-[15px] text-native-text">
                          {p.label}
                          {isSensitivePermission(p.key) && <ShieldAlert size={14} strokeWidth={2} className="text-native-warning" />}
                        </span>
                      </span>
                      <NativeChip tone={st.tone}>{st.label}</NativeChip>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <SectionLabel><span className="inline-flex items-center gap-1"><ShieldCheck size={14} strokeWidth={2} /> Auditní stopa</span></SectionLabel>
          {audit.length === 0 ? (
            <p className="px-1 text-[13px] text-native-textMuted">Zatím žádné záznamy.</p>
          ) : (
            <div className="overflow-hidden rounded-native-card bg-native-surface">
              {audit.map((a, i) => (
                <div key={a.id} className={cn('px-4 py-2.5', i < audit.length - 1 && 'border-b border-native-separator')}>
                  <p className="text-[15px] text-native-text">{a.action}{a.note ? `: ${a.note}` : ''}</p>
                  <p className="text-[13px] text-native-textMuted">{a.actorName} · {ts(a.ts)} · {a.result}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </HeroBody>

      {sheet && (
        <PermissionGrantSheet
          epId={epId}
          childId={ep.childId}
          permissionKey={sheet.permissionKey}
          grant={sheet.grant}
          onClose={() => setSheet(null)}
          onChanged={load}
        />
      )}
    </div>
  );
}
