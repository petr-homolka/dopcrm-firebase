/**
 * ReportGenerateDrawer.jsx — generátor reportu pro OSPOD (2026-07-13). Výběr
 * období → sestaví „Zprávu o průběhu NRP" z časové osy + vzdělávání a založí ji
 * jako DOKUMENT (koncept), který dál projde schvalovacím workflow. Po vytvoření
 * přejde na detail dokumentu (úpravy, verze, uzavření, tisk/PDF, odeslání OSPOD).
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText } from 'lucide-react';
import { generateOspodReport } from '../../../services/orgService.js';
import { toast } from '../../../store/toastStore.js';
import Drawer from '../../../components/ui/Drawer.jsx';
import Button from '../../../components/ui/Button.jsx';

const fieldClass = 'h-10 w-full rounded-lg border border-border-strong bg-white px-3.5 text-sm text-ink-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100';
const labelClass = 'mb-1 block text-[13px] font-medium text-ink-700';

function iso(d) { return d.toISOString().slice(0, 10); }

/** Výchozí období = poslední 3 měsíce po dnešek. `new Date()` je v prohlížeči v pořádku. */
function defaultRange() {
  const to = new Date();
  const from = new Date();
  from.setMonth(from.getMonth() - 3);
  return { from: iso(from), to: iso(to) };
}

export default function ReportGenerateDrawer({
  familyId, family, childrenList = [], courses = [], organizationId, assignedTo, requiredHours = 24, onClose, onCreated,
}) {
  const { t } = useTranslation();
  const [range, setRange] = useState(defaultRange);
  const [busy, setBusy] = useState(false);

  async function handleGenerate(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const docId = await generateOspodReport(familyId, {
        from: new Date(range.from), to: new Date(`${range.to}T23:59:59`),
        family, children: childrenList, courses, organizationId, assignedTo, requiredHours,
      });
      toast.info(t('dsk.report.created', 'Report vytvořen jako koncept dokumentu.'));
      onCreated?.(docId);
    } catch (err) {
      console.error('[ReportGenerateDrawer] Generování selhalo:', err);
      toast.error(err.message ?? t('dsk.report.failed', 'Report se nepodařilo vytvořit.'));
      setBusy(false);
    }
  }

  return (
    <Drawer
      title={t('dsk.report.title', 'Report pro OSPOD')}
      onClose={() => !busy && onClose()}
      footer={<Button type="submit" form="report-form" disabled={busy}>{busy ? t('dsk.report.building', 'Sestavuji…') : t('dsk.report.create', 'Vytvořit report')}</Button>}
    >
      <form id="report-form" onSubmit={handleGenerate} className="flex flex-col gap-4">
        <div className="flex items-start gap-3 rounded-xl border border-border-subtle bg-surface-tint p-4">
          <FileText size={18} strokeWidth={1.75} className="mt-0.5 shrink-0 text-brand-600" />
          <p className="text-xs leading-relaxed text-ink-600">
            {t('dsk.report.intro', 'Sestaví „Zprávu o průběhu náhradní rodinné péče“ z časové osy (návštěvy, poznámky), svěřených dětí a vzdělávání za zvolené období. Vznikne koncept dokumentu, který upravíte a pošlete běžným schvalovacím postupem až na OSPOD.')}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className={labelClass}>{t('dsk.report.from', 'Období od')}</span>
            <input type="date" className={fieldClass} value={range.from} max={range.to} onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))} />
          </div>
          <div>
            <span className={labelClass}>{t('dsk.report.to', 'Období do')}</span>
            <input type="date" className={fieldClass} value={range.to} min={range.from} onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))} />
          </div>
        </div>
        <p className="text-xs text-ink-400">
          {family?.name}{childrenList.length ? ` · ${childrenList.length} ${childrenList.length === 1 ? t('dsk.report.child1', 'dítě') : t('dsk.report.childN', 'dětí')}` : ''}
        </p>
      </form>
    </Drawer>
  );
}
