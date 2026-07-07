/**
 * MobileDocumentsTab.jsx — záložka Dokumenty na kartě rodiny (strana KO/týmu,
 * 2026-07-06 §C/§D). Seznam dokumentů se stavem workflow + založení interního
 * (markdown) dokumentu. Detail a schvalovací akce jsou na samostatné obrazovce
 * (/admin/terenni/:familyId/dokumenty/:docId).
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ChevronRight, Plus } from 'lucide-react';
import { cn } from '../../../components/ui/cn.js';
import { listDocuments, createMarkdownDocument } from '../../../services/orgService.js';
import { docStatusLabel, docStatusTone, DOC_KINDS } from '../../../shared/documentConstants.js';
import { toast } from '../../../store/toastStore.js';
import NativeSheet from '../../ui/NativeSheet.jsx';
import NativeButton from '../../ui/NativeButton.jsx';
import { NativeFormGroup, NativeFormRow, RowInput, RowTextarea } from '../../ui/NativeFormRow.jsx';
import { NativeChip, NativeEmptyState } from '../../ui/NativeBits.jsx';

export default function MobileDocumentsTab({ familyId, organizationId, assignedTo, canManage }) {
  const navigate = useNavigate();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [form, setForm] = useState({ title: '', content: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setDocs(await listDocuments(familyId)); }
    catch (err) { console.error('[MobileDocumentsTab] Načtení selhalo:', err); }
    finally { setLoading(false); }
  }, [familyId]);

  useEffect(() => { load(); }, [load]);

  async function handleCreate() {
    setSubmitting(true);
    try {
      const id = await createMarkdownDocument(familyId, {
        title: form.title, content: form.content, organizationId, assignedTo, subjectRefs: [],
      });
      setSheetOpen(false);
      setForm({ title: '', content: '' });
      navigate(`/admin/terenni/${familyId}/dokumenty/${id}`);
    } catch (err) {
      console.error('[MobileDocumentsTab] Založení selhalo:', err);
      toast.error(err.message ?? 'Dokument se nepodařilo založit.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 px-4 pb-6 pt-3">
      {loading && <p className="py-6 text-center text-[15px] text-native-textMuted">Načítám…</p>}

      {!loading && docs.length === 0 && (
        <NativeEmptyState
          icon={FileText}
          title="Zatím žádné dokumenty"
          description="Založte interní dokument, pošlete ho pěstounovi ke schválení a nakonec uzavřete."
        />
      )}

      {!loading && docs.length > 0 && (
        <div className="overflow-hidden rounded-native-card bg-native-surface">
          {docs.map((d, i) => (
            <button
              key={d.id}
              type="button"
              onClick={() => navigate(`/admin/terenni/${familyId}/dokumenty/${d.id}`)}
              className="flex w-full items-center gap-3 pl-4 text-left active:bg-native-bg"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-native-primary/10 text-native-primary">
                <FileText size={18} strokeWidth={1.75} />
              </span>
              <div className={cn('flex min-w-0 flex-1 items-center gap-2 py-3 pr-4', i < docs.length - 1 && 'border-b border-native-separator')}>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-medium text-native-text">{d.title}</p>
                  <p className="truncate text-[13px] text-native-textMuted">{DOC_KINDS[d.kind] ?? d.kind}</p>
                </div>
                <NativeChip tone={docStatusTone(d.status)}>{docStatusLabel(d.status)}</NativeChip>
                <ChevronRight size={18} strokeWidth={2} className="shrink-0 text-native-textMuted" />
              </div>
            </button>
          ))}
        </div>
      )}

      {canManage && (
        <NativeButton variant="secondary" className="mt-1 h-12" onClick={() => setSheetOpen(true)}>
          <Plus size={16} strokeWidth={2} /> Nový dokument
        </NativeButton>
      )}

      {sheetOpen && (
        <NativeSheet
          title="Nový dokument"
          onClose={() => !submitting && setSheetOpen(false)}
          submitting={submitting}
          footer={
            <NativeButton onClick={handleCreate} disabled={submitting || !form.title.trim()}>
              {submitting ? 'Zakládám…' : 'Vytvořit koncept'}
            </NativeButton>
          }
        >
          <NativeFormGroup>
            <NativeFormRow label="Název">
              <RowInput value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} autoFocus placeholder="např. Zpráva o průběhu pěstounské péče" />
            </NativeFormRow>
            <NativeFormRow label="Obsah" isLast stacked hint="Podporuje jednoduchý markdown: # nadpis, **tučně**, - odrážka.">
              <RowTextarea rows={8} value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} placeholder="Text dokumentu…" />
            </NativeFormRow>
          </NativeFormGroup>
        </NativeSheet>
      )}
    </div>
  );
}
