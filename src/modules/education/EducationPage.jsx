/**
 * EducationPage.jsx — sledování vzdělávání pěstounů (2026-07-13, vzor:
 * „Vzdělávání pod plánem" z prototypu). Agreguje hodiny kurzů napříč pěstouny
 * organizace vůči zákonnému limitu (24 h dlouhodobá/přechodná, 18 h
 * příbuzenská — z CARE_TYPES) a ukazuje, kdo je „pod plánem". Kurzy se vážou na
 * pěstouna přes `personId` (stejně jako v záložce Pěstouni).
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { cn } from '../../components/ui/cn.js';
import { useAuthStore } from '../../store/authStore.js';
import { listFostersByOrg, listFostersAssignedTo, listFosterCourses } from '../../services/orgService.js';
import { CARE_TYPES } from '../../shared/domainConstants.js';
import Avatar from '../../components/ui/Avatar.jsx';

function reqFor(careType) { return CARE_TYPES[careType]?.requiredHours ?? 24; }

export default function EducationPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role, organizationId, currentUser } = useAuthStore();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('under'); // under | all

  const load = useCallback(async () => {
    if (!organizationId) { setLoading(false); return; }
    setLoading(true);
    try {
      const families = role === 'klicova_osoba'
        ? await listFostersAssignedTo(currentUser.uid, organizationId)
        : await listFostersByOrg(organizationId);
      const capped = families.slice(0, 40);
      const courseLists = await Promise.all(capped.map((f) => listFosterCourses(f.id).then((p) => p.items ?? p).catch(() => [])));
      const out = [];
      capped.forEach((fam, i) => {
        const courses = courseLists[i] ?? [];
        const req = reqFor(fam.careType);
        (fam.fosters ?? []).forEach((p) => {
          const hours = courses.filter((c) => c.personId === p.id).reduce((s, c) => s + (Number(c.hodiny) || 0), 0);
          out.push({ id: `${fam.id}:${p.id}`, familyId: fam.id, familyName: fam.name, name: p.name, hours, req, met: hours >= req });
        });
      });
      out.sort((a, b) => (a.hours / a.req) - (b.hours / b.req));
      setRows(out);
    } catch (err) { console.error('[EducationPage] Načtení selhalo:', err); }
    finally { setLoading(false); }
  }, [organizationId, role, currentUser]);

  useEffect(() => { load(); }, [load]);

  const under = rows.filter((r) => !r.met);
  const met = rows.filter((r) => r.met);
  const shown = filter === 'under' ? under : rows;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">{t('dsk.edu.title', 'Vzdělávání pěstounů')}</h1>
          <p className="mt-0.5 text-sm text-ink-500">{t('dsk.edu.subtitle', 'Zákonné hodiny: 24 h dlouhodobá/přechodná, 18 h příbuzenská (za 12 měsíců).')}</p>
        </div>
        <div className="flex gap-1 rounded-lg bg-surface-canvas p-0.5">
          {[['under', t('dsk.edu.underN', 'Pod plánem ({{count}})', { count: under.length })], ['all', t('dsk.edu.allN', 'Vše ({{count}})', { count: rows.length })]].map(([k, l]) => (
            <button key={k} type="button" onClick={() => setFilter(k)} className={cn('rounded-md px-3 py-1.5 text-xs font-semibold transition-colors', filter === k ? 'bg-white text-brand-700 shadow-sm' : 'text-ink-500 hover:text-ink-700')}>{l}</button>
          ))}
        </div>
      </div>

      {loading && <div className="flex items-center justify-center gap-2 py-16 text-ink-500"><Loader2 size={22} strokeWidth={1.75} className="animate-spin text-brand-600" /></div>}

      {!loading && rows.length > 0 && (
        <div className="mb-5 grid grid-cols-2 gap-4 sm:max-w-md">
          <div className="rounded-xl border border-border-subtle bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-warning-700"><AlertTriangle size={18} strokeWidth={1.75} /><span className="text-2xl font-bold">{under.length}</span></div>
            <p className="mt-1 text-xs text-ink-500">{t('dsk.edu.underLabel', 'pěstounů pod plánem')}</p>
          </div>
          <div className="rounded-xl border border-border-subtle bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-success-700"><CheckCircle2 size={18} strokeWidth={1.75} /><span className="text-2xl font-bold">{met.length}</span></div>
            <p className="mt-1 text-xs text-ink-500">{t('dsk.edu.metLabel', 'splňuje limit')}</p>
          </div>
        </div>
      )}

      {!loading && shown.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-border-subtle bg-white py-14 text-center shadow-sm">
          <GraduationCap size={30} strokeWidth={1.5} className="text-ink-300" />
          <p className="text-sm text-ink-500">{filter === 'under' ? t('dsk.edu.allMet', 'Všichni pěstouni splňují plán vzdělávání.') : t('dsk.edu.none', 'Zatím žádní pěstouni.')}</p>
        </div>
      )}

      {!loading && shown.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border-subtle bg-white shadow-sm">
          {shown.map((r, i) => {
            const pct = Math.min(100, Math.round((r.hours / r.req) * 100));
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => navigate(`/admin/terenni/${r.familyId}`)}
                className={cn('flex w-full items-center gap-4 px-4 py-3 text-left hover:bg-surface-muted', i > 0 && 'border-t border-border-subtle')}
              >
                <Avatar name={r.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink-900">{r.name}</p>
                  <p className="truncate text-xs text-ink-400">{r.familyName}</p>
                </div>
                <div className="w-40 shrink-0">
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className={cn('font-semibold', r.met ? 'text-success-700' : 'text-warning-700')}>{t('dsk.edu.hours', '{{done}} / {{req}} h', { done: r.hours, req: r.req })}</span>
                    {r.met && <CheckCircle2 size={13} strokeWidth={2} className="text-success-600" />}
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
                    <div className={cn('h-full rounded-full', r.met ? 'bg-success-500' : 'bg-warning-500')} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
