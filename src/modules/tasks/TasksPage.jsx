/**
 * TasksPage.jsx — úkoly a termíny organizace (2026-07-13, vzor: Úkoly z
 * desktopového prototypu). Kanban dle termínu: Po termínu / Dnes / Tento týden /
 * Později (+ bez termínu), hotové zvlášť. Checkbox = dokončit, „+ Úkol" zakládá.
 * Data z `tasks` (org-scoped); řešitelé z klíčových osob organizace.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Loader2, Trash2, Check, CalendarClock } from 'lucide-react';
import { cn } from '../../components/ui/cn.js';
import { useAuthStore } from '../../store/authStore.js';
import { isReadOnlyManager } from '../../services/orgAuth.js';
import { listTasksByOrg, listKlicoveOsobyByOrg, setTaskStatus, deleteTask } from '../../services/orgService.js';
import Button from '../../components/ui/Button.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import TaskFormDrawer from './TaskFormDrawer.jsx';

function toDate(v) {
  if (!v) return null;
  if (typeof v.toDate === 'function') return v.toDate();
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}
function startOfDay(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }

const COLS = [
  { key: 'overdue', label: 'Po termínu', tone: 'text-danger-600', dot: 'bg-danger-500' },
  { key: 'today', label: 'Dnes', tone: 'text-brand-700', dot: 'bg-brand-500' },
  { key: 'week', label: 'Tento týden', tone: 'text-warning-700', dot: 'bg-warning-500' },
  { key: 'later', label: 'Později / bez termínu', tone: 'text-ink-500', dot: 'bg-ink-300' },
];

function bucketOf(task, today) {
  const d = toDate(task.dueDate);
  if (!d) return 'later';
  const day = startOfDay(d);
  const t0 = startOfDay(today);
  if (day < t0) return 'overdue';
  if (day.getTime() === t0.getTime()) return 'today';
  const week = new Date(t0); week.setDate(week.getDate() + 7);
  if (day <= week) return 'week';
  return 'later';
}

function dueDateLabel(v) {
  const d = toDate(v);
  return d ? d.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric' }) : null;
}

export default function TasksPage() {
  const { t } = useTranslation();
  const { role, organizationId, currentUser } = useAuthStore();
  const canManage = !isReadOnlyManager(role);
  const [tasks, setTasks] = useState([]);
  const [kos, setKos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scope, setScope] = useState('all'); // all | mine
  const [drawerOpen, setDrawerOpen] = useState(false);
  const today = useMemo(() => new Date(), []);

  const load = useCallback(async () => {
    if (!organizationId) { setLoading(false); return; }
    setLoading(true);
    try {
      const [ts, ko] = await Promise.all([
        listTasksByOrg(organizationId),
        listKlicoveOsobyByOrg(organizationId).catch(() => []),
      ]);
      setTasks(ts); setKos(ko);
    } catch (err) { console.error('[TasksPage] Načtení selhalo:', err); }
    finally { setLoading(false); }
  }, [organizationId]);

  useEffect(() => { load(); }, [load]);

  const koName = useCallback((uid) => kos.find((k) => k.id === uid)?.displayName ?? null, [kos]);

  const visible = useMemo(
    () => (scope === 'mine' ? tasks.filter((x) => x.assignedTo === currentUser?.uid) : tasks),
    [tasks, scope, currentUser],
  );
  const open = visible.filter((x) => x.status !== 'done');
  const done = visible.filter((x) => x.status === 'done');
  const byBucket = (key) => open.filter((x) => bucketOf(x, today) === key);

  async function toggleDone(task) {
    if (!canManage) return;
    setTasks((prev) => prev.map((x) => (x.id === task.id ? { ...x, status: task.status === 'done' ? 'open' : 'done' } : x)));
    try { await setTaskStatus(task.id, task.status === 'done' ? 'open' : 'done'); } catch { load(); }
  }
  async function remove(task) {
    if (!canManage) return;
    setTasks((prev) => prev.filter((x) => x.id !== task.id));
    try { await deleteTask(task.id); } catch { load(); }
  }

  function Card({ task }) {
    const overdue = task.status !== 'done' && bucketOf(task, today) === 'overdue';
    return (
      <div className="group rounded-xl border border-border-subtle bg-white p-3 shadow-sm">
        <div className="flex items-start gap-2.5">
          {canManage && (
            <button
              type="button"
              onClick={() => toggleDone(task)}
              aria-label={task.status === 'done' ? t('dsk.tasks.markUndone', 'Označit jako nehotové') : t('dsk.tasks.markDone', 'Označit jako hotové')}
              className={cn('mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border', task.status === 'done' ? 'border-brand-500 bg-brand-500 text-white' : 'border-border-strong text-transparent hover:border-brand-400')}
            >
              <Check size={13} strokeWidth={3} />
            </button>
          )}
          <div className="min-w-0 flex-1">
            <p className={cn('text-sm font-medium', task.status === 'done' ? 'text-ink-400 line-through' : 'text-ink-900')}>{task.title}</p>
            {task.note && <p className="mt-0.5 line-clamp-2 text-xs text-ink-500">{task.note}</p>}
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
              <span className={cn('inline-flex items-center gap-1', overdue ? 'font-semibold text-danger-600' : 'text-ink-400')}>
                <CalendarClock size={12} strokeWidth={1.75} /> {dueDateLabel(task.dueDate) ?? t('dsk.tasks.noDue', 'bez termínu')}
              </span>
              {koName(task.assignedTo) && <span className="text-ink-400">· {koName(task.assignedTo)}</span>}
            </div>
          </div>
          {canManage && (
            <button type="button" onClick={() => remove(task)} aria-label={t('dsk.common.delete', 'Smazat')} className="opacity-0 transition-opacity hover:text-danger-600 group-hover:opacity-100 text-ink-300">
              <Trash2 size={14} strokeWidth={1.75} />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">{t('dsk.tasks.title', 'Úkoly')}</h1>
          <p className="mt-0.5 text-sm text-ink-500">{t('dsk.tasks.counts', '{{open}} otevřených · {{done}} hotových', { open: open.length, done: done.length })}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 rounded-lg bg-surface-canvas p-0.5">
            {[['all', t('dsk.common.all', 'Všechny')], ['mine', t('dsk.common.mine', 'Moje')]].map(([k, l]) => (
              <button key={k} type="button" onClick={() => setScope(k)} className={cn('rounded-md px-3 py-1.5 text-xs font-semibold transition-colors', scope === k ? 'bg-white text-brand-700 shadow-sm' : 'text-ink-500 hover:text-ink-700')}>{l}</button>
            ))}
          </div>
          {canManage && <Button size="sm" onClick={() => setDrawerOpen(true)}><Plus size={15} strokeWidth={2} /> {t('dsk.tasks.task', 'Úkol')}</Button>}
        </div>
      </div>

      {loading && <div className="flex items-center justify-center gap-2 py-16 text-ink-500"><Loader2 size={22} strokeWidth={1.75} className="animate-spin text-brand-600" /></div>}

      {!loading && open.length === 0 && done.length === 0 && (
        <div className="rounded-xl border border-border-subtle bg-white shadow-sm">
          <EmptyState icon={<CalendarClock size={28} strokeWidth={1.5} />} title={t('dsk.tasks.emptyTitle', 'Žádné úkoly')} description={t('dsk.tasks.emptyDesc', 'Založte první úkol a přiřaďte mu termín a klíčovou osobu.')} action={canManage && <Button size="sm" onClick={() => setDrawerOpen(true)}><Plus size={15} strokeWidth={2} /> {t('dsk.tasks.newTitle', 'Nový úkol')}</Button>} />
        </div>
      )}

      {!loading && (open.length > 0 || done.length > 0) && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {COLS.map((c) => {
            const items = byBucket(c.key);
            return (
              <div key={c.key} className="flex flex-col gap-2.5">
                <div className="flex items-center gap-2">
                  <span className={cn('h-2 w-2 rounded-full', c.dot)} />
                  <span className={cn('text-xs font-semibold uppercase tracking-wide', c.tone)}>{t(`dsk.tasks.col.${c.key}`, c.label)}</span>
                  <span className="text-xs text-ink-400">{items.length}</span>
                </div>
                {items.length === 0 && <p className="rounded-xl border border-dashed border-border-default px-3 py-6 text-center text-xs text-ink-400">{t('dsk.tasks.colEmpty', 'Nic zde')}</p>}
                {items.map((x) => <Card key={x.id} task={x} />)}
              </div>
            );
          })}
        </div>
      )}

      {!loading && done.length > 0 && (
        <div className="mt-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">{t('dsk.tasks.doneCount', 'Hotové ({{count}})', { count: done.length })}</p>
          <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 xl:grid-cols-4">
            {done.map((x) => <Card key={x.id} task={x} />)}
          </div>
        </div>
      )}

      {drawerOpen && (
        <TaskFormDrawer
          organizationId={organizationId}
          kos={kos}
          onClose={() => setDrawerOpen(false)}
          onSaved={() => { setDrawerOpen(false); load(); }}
        />
      )}
    </div>
  );
}
