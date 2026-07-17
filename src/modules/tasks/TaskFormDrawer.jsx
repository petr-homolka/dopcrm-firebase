/**
 * TaskFormDrawer.jsx — založení / úprava úkolu (2026-07-13). Termín, přiřazení
 * klíčové osobě, poznámka. Zakládá do top-level `tasks` (org-scoped).
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createTask, updateTask } from '../../services/orgService.js';
import { toast } from '../../store/toastStore.js';
import Drawer from '../../components/ui/Drawer.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';

const fieldClass = 'h-10 w-full rounded-lg border border-border-strong bg-white px-3.5 text-sm text-ink-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100';
const textareaClass = 'w-full rounded-lg border border-border-strong bg-white px-3.5 py-2.5 text-sm text-ink-800 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100';
const labelClass = 'mb-1 block text-[13px] font-medium text-ink-700';

function dueISO(task) {
  const v = task?.dueDate;
  if (!v) return '';
  const d = typeof v.toDate === 'function' ? v.toDate() : new Date(v);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
}

export default function TaskFormDrawer({ organizationId, kos = [], task = null, onClose, onSaved }) {
  const { t } = useTranslation();
  const editing = !!task;
  const [form, setForm] = useState({
    title: task?.title ?? '',
    note: task?.note ?? '',
    dueDate: dueISO(task),
    assignedTo: task?.assignedTo ?? '',
  });
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setBusy(true);
    try {
      const payload = {
        title: form.title,
        note: form.note,
        dueDate: form.dueDate ? new Date(`${form.dueDate}T12:00:00`) : null,
        assignedTo: form.assignedTo || null,
      };
      if (editing) await updateTask(task.id, payload);
      else await createTask({ organizationId, ...payload });
      onSaved?.();
    } catch (err) {
      console.error('[TaskFormDrawer] Uložení selhalo:', err);
      toast.error(err.message ?? t('dsk.tasks.saveFailed', 'Úkol se nepodařilo uložit.'));
      setBusy(false);
    }
  }

  return (
    <Drawer
      title={editing ? t('dsk.tasks.editTitle', 'Upravit úkol') : t('dsk.tasks.newTitle', 'Nový úkol')}
      onClose={() => !busy && onClose()}
      footer={<Button type="submit" form="task-form" disabled={busy || !form.title.trim()}>{busy ? t('dsk.common.saving', 'Ukládám…') : (editing ? t('dsk.common.save', 'Uložit') : t('dsk.tasks.create', 'Vytvořit úkol'))}</Button>}
    >
      <form id="task-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label={t('dsk.tasks.name', 'Název úkolu')} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} autoFocus placeholder={t('dsk.tasks.namePlaceholder', 'např. Zavolat na OSPOD')} />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className={labelClass}>{t('dsk.tasks.due', 'Termín')}</span>
            <input type="date" className={fieldClass} value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} />
          </div>
          <div>
            <span className={labelClass}>{t('dsk.tasks.assignee', 'Řešitel')}</span>
            <select className={fieldClass} value={form.assignedTo} onChange={(e) => setForm((f) => ({ ...f, assignedTo: e.target.value }))}>
              <option value="">{t('dsk.tasks.unassigned', '— nepřiřazeno —')}</option>
              {kos.map((k) => <option key={k.id} value={k.id}>{k.displayName ?? k.email}</option>)}
            </select>
          </div>
        </div>
        <div>
          <span className={labelClass}>{t('dsk.common.note', 'Poznámka')}</span>
          <textarea rows={4} className={textareaClass} value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} placeholder={t('dsk.tasks.notePlaceholder', 'Detaily úkolu…')} />
        </div>
      </form>
    </Drawer>
  );
}
