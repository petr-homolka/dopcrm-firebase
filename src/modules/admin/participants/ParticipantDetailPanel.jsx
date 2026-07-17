/**
 * ParticipantDetailPanel.jsx (desktop) — správa externího účastníka ve
 * workspace (2026-07-13, desktop varianta MobileParticipantDetailScreen).
 * Hlavička (jméno, vztah, dítě), seznam VŠECH oprávnění z katalogu po
 * kategoriích s aktuálním stavem (výchozí = vypnuto), klik otevře správu grantu
 * (PermissionGrantDrawer), níže neměnná auditní stopa.
 * Route /admin/terenni/:familyId/deti/:childId/ucastnici/:epId.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldAlert, ShieldCheck, Loader2, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore.js';
import { isReadOnlyManager } from '../../../services/orgAuth.js';
import { getExternalParticipant, listGrants, listEpAudit } from '../../../services/orgService.js';
import {
  EXTERNAL_PERMISSIONS, PERMISSION_CATEGORIES, GRANT_STATUS, isGrantActive, isSensitivePermission,
} from '../../../shared/externalPermissions.js';
import { toDate } from '../useTodayPage.js';
import Badge from '../../../components/ui/Badge.jsx';
import PermissionGrantDrawer from './PermissionGrantDrawer.jsx';

const CATS = ['view', 'chat', 'action'];
const STATE_TONE = { primary: 'info', warning: 'warning', muted: 'neutral' };

function ts(v) {
  const d = toDate(v);
  return d ? d.toLocaleString('cs-CZ', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
}

function grantState(grants, key) {
  const gs = grants
    .filter((g) => g.permissionKey === key)
    .sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
  const latest = gs[0] ?? null;
  if (!latest) return { latest: null, label: 'Vypnuto', tone: 'muted' };
  if (isGrantActive(latest)) return { latest, label: 'Aktivní', tone: 'primary' };
  if (latest.status === 'requested') return { latest, label: GRANT_STATUS.requested, tone: 'warning' };
  if (latest.status === 'approved') return { latest, label: GRANT_STATUS.approved, tone: 'warning' };
  if (latest.status === 'active') return { latest, label: 'Mimo platnost/okno', tone: 'muted' };
  return { latest, label: 'Vypnuto', tone: 'muted' };
}

export default function ParticipantDetailPanel() {
  const { t } = useTranslation();
  const { epId, familyId, childId } = useParams();
  const navigate = useNavigate();
  const { role } = useAuthStore();
  const canManage = !isReadOnlyManager(role);

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
      console.error('[ParticipantDetailPanel] Načtení selhalo:', err);
    } finally { setLoading(false); }
  }, [epId]);

  useEffect(() => { load(); }, [load]);

  const backLink = (
    <button type="button" onClick={() => navigate(`/admin/terenni/${familyId}/deti/${childId}`)} className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-800">
      <ArrowLeft size={16} strokeWidth={1.75} /> {t('dsk.epDetail.backToChild', 'Zpět na dítě')}
    </button>
  );

  if (loading) {
    return <div className="flex items-center justify-center gap-2 py-20 text-ink-500"><Loader2 size={22} strokeWidth={1.75} className="animate-spin text-brand-600" /></div>;
  }
  if (!ep) {
    return <div className="px-6 py-6 lg:px-8">{backLink}<p className="text-sm text-ink-500">{t('dsk.epDetail.notFound', 'Účastník nenalezen.')}</p></div>;
  }

  return (
    <div className="px-6 py-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {backLink}

        <div className="mb-5">
          <h1 className="text-2xl font-bold text-ink-900">{ep.displayName}</h1>
          <div className="mt-2 flex flex-wrap gap-2">
            {ep.relationLabel && <Badge tone="neutral">{ep.relationLabel}</Badge>}
            {ep.childName && <Badge tone="info">{ep.childName}</Badge>}
          </div>
        </div>

        {CATS.map((cat) => {
          const perms = EXTERNAL_PERMISSIONS.filter((p) => p.category === cat);
          if (perms.length === 0) return null;
          return (
            <div key={cat} className="mb-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">{PERMISSION_CATEGORIES[cat]}</p>
              <div className="overflow-hidden rounded-xl border border-border-subtle bg-white shadow-sm">
                {perms.map((p, i) => {
                  const st = grantState(grants, p.key);
                  return (
                    <button
                      key={p.key}
                      type="button"
                      disabled={!canManage}
                      onClick={() => canManage && setSheet({ permissionKey: p.key, grant: st.latest })}
                      className={`flex w-full items-center gap-2 px-4 py-3 text-left ${i > 0 ? 'border-t border-border-subtle' : ''} ${canManage ? 'hover:bg-surface-muted' : 'cursor-default'}`}
                    >
                      <span className="flex min-w-0 flex-1 items-center gap-1.5 text-sm text-ink-800">
                        {p.label}
                        {isSensitivePermission(p.key) && <ShieldAlert size={14} strokeWidth={2} className="text-warning-600" />}
                      </span>
                      <Badge tone={STATE_TONE[st.tone] ?? 'neutral'}>{st.label}</Badge>
                      {canManage && <ChevronRight size={16} strokeWidth={2} className="shrink-0 text-ink-300" />}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        <div>
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-400"><ShieldCheck size={14} strokeWidth={2} /> {t('dsk.common.auditTrail', 'Auditní stopa')}</p>
          {audit.length === 0 ? (
            <p className="text-sm text-ink-400">{t('dsk.common.noAudit', 'Zatím žádné záznamy.')}</p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border-subtle bg-white shadow-sm">
              {audit.map((a, i) => (
                <div key={a.id} className={`px-4 py-2.5 ${i > 0 ? 'border-t border-border-subtle' : ''}`}>
                  <p className="text-sm text-ink-800">{a.action}{a.note ? `: ${a.note}` : ''}</p>
                  <p className="text-xs text-ink-400">{a.actorName} · {ts(a.ts)} · {a.result}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {sheet && (
        <PermissionGrantDrawer
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
