/**
 * FamilyDocumentsTab.jsx — DESKTOP záložka Dokumenty na kartě rodiny
 * (2026-07-13 §C/§D). Zrcadlí mobilní MobileDocumentsTab: seznam dokumentů se
 * stavem workflow, založení interního (markdown) dokumentu a záznam příchozího
 * dokumentu do časové osy. Detail + schvalovací akce jsou v DocumentDetailPanel
 * (/admin/terenni/:familyId/dokumenty/:docId).
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, Inbox, ChevronRight } from 'lucide-react';
import { listDocuments, createMarkdownDocument, ingestDocument } from '../../services/orgService.js';
import { docStatusLabel, docStatusTone, DOC_KINDS } from '../../shared/documentConstants.js';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Drawer from '../../components/ui/Drawer.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { toast } from '../../store/toastStore.js';

const DOC_BADGE_TONE = { muted: 'neutral', primary: 'info', warning: 'warning', danger: 'error' };
const textareaClass = 'w-full rounded-lg border border-border-strong bg-white px-3.5 py-2.5 text-sm text-ink-800 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100';
const labelClass = 'mb-1 block text-[13px] font-medium text-ink-700';
const selectClass = 'h-10 w-full rounded-lg border border-border-strong bg-white px-3.5 text-sm text-ink-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100';

export default function FamilyDocumentsTab({ familyId, organizationId, assignedTo, canManage }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawer, setDrawer] = useState(null); // 'create' | 'ingest' | null
  const [form, setForm] = useState({ title: '', content: '' });
  const [ingest, setIngest] = useState({ title: '', source: 'email', extractedText: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setDocs(await listDocuments(familyId)); }
    catch (err) { console.error('[FamilyDocumentsTab] Načtení selhalo:', err); }
    finally { setLoading(false); }
  }, [familyId]);

  useEffect(() => { load(); }, [load]);

  function closeDrawer() { if (!submitting) setDrawer(null); }

  async function handleCreate(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const id = await createMarkdownDocument(familyId, {
        title: form.title, content: form.content, organizationId, assignedTo, subjectRefs: [],
      });
      setDrawer(null);
      setForm({ title: '', content: '' });
      navigate(`/admin/terenni/${familyId}/dokumenty/${id}`);
    } catch (err) {
      console.error('[FamilyDocumentsTab] Založení selhalo:', err);
      toast.error(err.message ?? t('dsk.docs.createFailed', 'Dokument se nepodařilo založit.'));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleIngest(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await ingestDocument(familyId, {
        title: ingest.title, source: ingest.source, kind: ingest.source === 'foto' ? 'image' : 'pdf',
        extractedText: ingest.extractedText, subjectRefs: [], organizationId, assignedTo,
      });
      setDrawer(null);
      setIngest({ title: '', source: 'email', extractedText: '' });
      await load();
      toast.info(t('dsk.docs.ingestOk', 'Dokument zaznamenán a vložen do časové osy.'));
    } catch (err) {
      console.error('[FamilyDocumentsTab] Záznam příchozího dokumentu selhal:', err);
      toast.error(err.message ?? t('dsk.docs.ingestFailed', 'Záznam se nezdařil.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-500">{t('dsk.docs.count', '{{count}} dokumentů ve spisu', { count: docs.length })}</p>
        {canManage && (
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setDrawer('ingest')}>
              <Inbox size={15} strokeWidth={1.75} /> {t('dsk.docs.ingest', 'Zaznamenat příchozí')}
            </Button>
            <Button size="sm" onClick={() => setDrawer('create')}>
              <Plus size={15} strokeWidth={2} /> {t('dsk.docs.new', 'Nový dokument')}
            </Button>
          </div>
        )}
      </div>

      {loading && <p className="py-8 text-center text-sm text-ink-400">{t('dsk.common.loading', 'Načítám…')}</p>}

      {!loading && docs.length === 0 && (
        <div className="rounded-xl border border-border-subtle bg-white shadow-sm">
          <EmptyState
            icon={<FileText size={28} strokeWidth={1.5} />}
            title={t('dsk.docs.emptyTitle', 'Zatím žádné dokumenty')}
            description={t('dsk.docs.emptyDesc', 'Založte interní dokument, pošlete ho pěstounovi ke schválení a nakonec uzavřete a odešlete.')}
          />
        </div>
      )}

      {!loading && docs.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border-subtle bg-white shadow-sm">
          {docs.map((d, i) => (
            <button
              key={d.id}
              type="button"
              onClick={() => navigate(`/admin/terenni/${familyId}/dokumenty/${d.id}`)}
              className={`flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-surface-muted ${i > 0 ? 'border-t border-border-subtle' : ''}`}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-tint text-brand-600">
                <FileText size={17} strokeWidth={1.75} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink-900">{d.title}</p>
                <p className="truncate text-xs text-ink-500">{DOC_KINDS[d.kind] ?? d.kind}</p>
              </div>
              <Badge tone={DOC_BADGE_TONE[docStatusTone(d.status)] ?? 'neutral'}>{docStatusLabel(d.status)}</Badge>
              <ChevronRight size={17} strokeWidth={2} className="shrink-0 text-ink-300" />
            </button>
          ))}
        </div>
      )}

      {drawer === 'create' && (
        <Drawer
          title={t('dsk.docs.new', 'Nový dokument')}
          onClose={closeDrawer}
          footer={<Button type="submit" form="new-doc-form" disabled={submitting || !form.title.trim()}>{submitting ? t('dsk.docs.creating', 'Zakládám…') : t('dsk.docs.createDraft', 'Vytvořit koncept')}</Button>}
        >
          <form id="new-doc-form" onSubmit={handleCreate} className="flex flex-col gap-4">
            <Input label={t('dsk.common.name', 'Název')} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} autoFocus placeholder={t('dsk.docs.titlePlaceholder', 'např. Zpráva o průběhu pěstounské péče')} />
            <div>
              <span className={labelClass}>{t('dsk.docs.content', 'Obsah')}</span>
              <textarea rows={12} className={textareaClass} value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} placeholder={t('dsk.docs.contentPlaceholder', 'Text dokumentu…')} />
              <p className="mt-1.5 text-xs text-ink-400">{t('dsk.docs.markdownHint', 'Podporuje jednoduchý markdown: # nadpis, **tučně**, - odrážka.')}</p>
            </div>
          </form>
        </Drawer>
      )}

      {drawer === 'ingest' && (
        <Drawer
          title={t('dsk.docs.ingestTitle', 'Příchozí dokument')}
          onClose={closeDrawer}
          footer={<Button type="submit" form="ingest-doc-form" disabled={submitting || !ingest.title.trim()}>{submitting ? t('dsk.common.saving', 'Ukládám…') : t('dsk.docs.ingestSave', 'Zaznamenat do spisu')}</Button>}
        >
          <form id="ingest-doc-form" onSubmit={handleIngest} className="flex flex-col gap-4">
            <p className="text-xs leading-relaxed text-ink-500">
              {t('dsk.docs.ingestIntro', 'Dokument přijatý e-mailem (pestoun.jmeno@doprovazeni.com) nebo nahraný pěstounem se zaznamená a vloží do časové osy — data v čase pro reporty a AI. Přečtený text (OCR) zatím doplňte ručně; automatické čtení PDF přibude s napojením OCR.')}
            </p>
            <Input label={t('dsk.common.name', 'Název')} value={ingest.title} onChange={(e) => setIngest((f) => ({ ...f, title: e.target.value }))} autoFocus placeholder={t('dsk.docs.ingestTitlePlaceholder', 'např. Zpráva ze školy')} />
            <div>
              <span className={labelClass}>{t('dsk.docs.source', 'Zdroj')}</span>
              <select className={selectClass} value={ingest.source} onChange={(e) => setIngest((f) => ({ ...f, source: e.target.value }))}>
                <option value="email">{t('dsk.docs.sourceEmail', 'E-mail')}</option>
                <option value="foto">{t('dsk.docs.sourcePhoto', 'Fotka / sken')}</option>
                <option value="foster">{t('dsk.docs.sourceFoster', 'Od pěstouna')}</option>
              </select>
            </div>
            <div>
              <span className={labelClass}>{t('dsk.docs.extractedText', 'Přečtený text')}</span>
              <textarea rows={6} className={textareaClass} value={ingest.extractedText} onChange={(e) => setIngest((f) => ({ ...f, extractedText: e.target.value }))} placeholder={t('dsk.docs.contentPlaceholder2', 'Obsah dokumentu…')} />
              <p className="mt-1.5 text-xs text-ink-400">{t('dsk.docs.extractedHint', 'Co je v dokumentu napsané (pro časovou osu a reporty).')}</p>
            </div>
          </form>
        </Drawer>
      )}
    </div>
  );
}
