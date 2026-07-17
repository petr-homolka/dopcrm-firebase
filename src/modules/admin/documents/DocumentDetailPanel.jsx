/**
 * DocumentDetailPanel.jsx (desktop) — detail dokumentu ve workspace (2026-07-13
 * §C/§D, desktop varianta MobileDocumentDetailScreen). Hlavička se stavem,
 * obsah (markdown view/edit + ukládání verzí), připomínka pěstouna, schvalovací
 * akce (DocumentActionsBar), historie verzí a auditní stopa.
 * Route /admin/terenni/:familyId/dokumenty/:docId.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil, History, ShieldCheck, Loader2, Printer } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore.js';
import { isReadOnlyManager } from '../../../services/orgAuth.js';
import { getDocument, listDocumentVersions, listDocumentAudit, saveMarkdownVersion } from '../../../services/orgService.js';
import { docStatusLabel, docStatusTone, isClosedStatus, DOC_AUDIT_ACTION } from '../../../shared/documentConstants.js';
import { toDate } from '../useTodayPage.js';
import { toast } from '../../../store/toastStore.js';
import Badge from '../../../components/ui/Badge.jsx';
import Button from '../../../components/ui/Button.jsx';
import MarkdownView from './MarkdownView.jsx';
import DocumentActionsBar from './DocumentActionsBar.jsx';

const DOC_BADGE_TONE = { muted: 'neutral', primary: 'info', warning: 'warning', danger: 'error' };
const textareaClass = 'w-full rounded-lg border border-border-strong bg-white px-3.5 py-2.5 text-sm text-ink-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100';

function ts(v) {
  const d = toDate(v);
  return d ? d.toLocaleString('cs-CZ', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
}

function escapeHtml(s) {
  return (s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Minimální markdown → HTML pro čisté tiskové okno (stejná sada značek jako MarkdownView). */
function mdToHtml(text) {
  const inline = (s) => escapeHtml(s).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\*([^*]+)\*/g, '<em>$1</em>');
  const lines = (text ?? '').replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let list = null;
  lines.forEach((line) => {
    const b = line.match(/^\s*[-*]\s+(.*)$/);
    if (b) { if (!list) list = []; list.push(`<li>${inline(b[1])}</li>`); return; }
    if (list) { out.push(`<ul>${list.join('')}</ul>`); list = null; }
    const h = line.match(/^(#{1,3})\s+(.*)$/);
    if (h) { const n = h[1].length; out.push(`<h${n}>${inline(h[2])}</h${n}>`); return; }
    if (line.trim() === '') return;
    out.push(`<p>${inline(line)}</p>`);
  });
  if (list) out.push(`<ul>${list.join('')}</ul>`);
  return out.join('\n');
}

function printDocument(doc) {
  const style = "body{font-family:'Inter',system-ui,sans-serif;color:#1a2b49;max-width:720px;margin:40px auto;padding:0 24px;line-height:1.55}"
    + 'h1{font-size:22px}h2{font-size:17px;margin-top:22px}h3{font-size:15px}ul{padding-left:22px}p{margin:8px 0}@media print{body{margin:0}}';
  const html = `<!doctype html><html lang="cs"><head><meta charset="utf-8"><title>${escapeHtml(doc.title)}</title><style>${style}</style></head>`
    + `<body>${mdToHtml(doc.content)}<scr` + `ipt>window.onload=function(){window.print();}</scr` + `ipt></body></html>`;
  const w = window.open('', '_blank');
  if (!w) return;
  w.document.write(html);
  w.document.close();
}

export default function DocumentDetailPanel() {
  const { t } = useTranslation();
  const { familyId, docId } = useParams();
  const navigate = useNavigate();
  const { role } = useAuthStore();
  const isManagement = ['org_admin', 'vedouci_pobocky', 'teamleader', 'superadmin'].includes(role);
  const canManage = !isReadOnlyManager(role);

  const [doc, setDoc] = useState(null);
  const [versions, setVersions] = useState([]);
  const [audit, setAudit] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [d, v, a] = await Promise.all([
        getDocument(familyId, docId), listDocumentVersions(familyId, docId), listDocumentAudit(familyId, docId),
      ]);
      setDoc(d); setVersions(v); setAudit(a); setDraft(d?.content ?? '');
    } catch (err) {
      console.error('[DocumentDetailPanel] Načtení selhalo:', err);
    } finally { setLoading(false); }
  }, [familyId, docId]);

  useEffect(() => { load(); }, [load]);

  async function handleSaveVersion() {
    setSaving(true);
    try {
      await saveMarkdownVersion(familyId, docId, { content: draft });
      setEditing(false);
      await load();
      toast.info(t('dsk.doc.versionSaved', 'Uložena nová verze.'));
    } catch (err) {
      toast.error(err.message ?? t('dsk.doc.saveFailed', 'Uložení selhalo.'));
    } finally { setSaving(false); }
  }

  const backLink = (
    <button type="button" onClick={() => navigate(`/admin/terenni/${familyId}`)} className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-800">
      <ArrowLeft size={16} strokeWidth={1.75} /> {t('dsk.doc.backToFamily', 'Zpět na rodinu')}
    </button>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-20 text-ink-500">
        <Loader2 size={22} strokeWidth={1.75} className="animate-spin text-brand-600" />
      </div>
    );
  }
  if (!doc) {
    return <div className="px-6 py-6 lg:px-8">{backLink}<p className="text-sm text-ink-500">{t('dsk.doc.notFound', 'Dokument nenalezen.')}</p></div>;
  }

  const editable = canManage && doc.kind === 'md' && !isClosedStatus(doc.status) && doc.status !== 'sent' && doc.status !== 'filed';

  return (
    <div className="px-6 py-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {backLink}

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="min-w-0 break-words text-2xl font-bold text-ink-900">{doc.title}</h1>
          <div className="flex items-center gap-2">
            <Badge tone={DOC_BADGE_TONE[docStatusTone(doc.status)] ?? 'neutral'}>{docStatusLabel(doc.status)}</Badge>
            {doc.kind === 'md' && (
              <Button variant="secondary" size="sm" onClick={() => printDocument(doc)}>
                <Printer size={15} strokeWidth={1.75} /> {t('dsk.doc.print', 'Tisk / PDF')}
              </Button>
            )}
          </div>
        </div>

        {doc.status === 'commented' && doc.fosterComment && (
          <div className="mb-4 rounded-xl border border-warning-500/30 bg-warning-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-warning-700">{t('dsk.doc.fosterComment', 'Připomínka pěstouna')}</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-ink-800">{doc.fosterComment}</p>
          </div>
        )}

        <div className="mb-4 rounded-xl border border-border-subtle bg-white p-5 shadow-sm">
          {editing ? (
            <>
              <textarea rows={14} className={textareaClass} value={draft} onChange={(e) => setDraft(e.target.value)} autoFocus />
              <div className="mt-3 flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => { setEditing(false); setDraft(doc.content ?? ''); }}>{t('dsk.common.cancel', 'Zrušit')}</Button>
                <Button size="sm" onClick={handleSaveVersion} disabled={saving}>{saving ? t('dsk.common.saving', 'Ukládám…') : t('dsk.doc.saveVersion', 'Uložit verzi')}</Button>
              </div>
            </>
          ) : doc.kind === 'md' ? (
            <>
              <MarkdownView text={doc.content} />
              {editable && (
                <button type="button" onClick={() => setEditing(true)} className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700">
                  <Pencil size={15} strokeWidth={2} /> {t('dsk.doc.editContent', 'Upravit obsah')}
                </button>
              )}
            </>
          ) : (
            <p className="text-sm text-ink-500">
              {t('dsk.doc.fileNote', 'Soubor {{name}}. Náhled a stahování přibude s nahráváním souborů (§E).', { name: doc.fileName ?? doc.kind })}
            </p>
          )}
        </div>

        {canManage && (
          <div className="mb-4">
            <DocumentActionsBar doc={doc} familyId={familyId} isManagement={isManagement} onChanged={load} />
          </div>
        )}

        {versions.length > 0 && (
          <div className="mb-4">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-400"><History size={14} strokeWidth={2} /> {t('dsk.doc.versions', 'Verze')}</p>
            <div className="overflow-hidden rounded-xl border border-border-subtle bg-white shadow-sm">
              {versions.map((v, i) => (
                <div key={v.id} className={`flex items-center justify-between px-4 py-2.5 ${i > 0 ? 'border-t border-border-subtle' : ''}`}>
                  <span className="text-sm text-ink-800">{t('dsk.doc.version', 'Verze {{n}}', { n: v.version })}</span>
                  <span className="text-xs text-ink-400">{ts(v.createdAt)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {audit.length > 0 && (
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-400"><ShieldCheck size={14} strokeWidth={2} /> {t('dsk.common.auditTrail', 'Auditní stopa')}</p>
            <div className="overflow-hidden rounded-xl border border-border-subtle bg-white shadow-sm">
              {audit.map((a, i) => (
                <div key={a.id} className={`px-4 py-2.5 ${i > 0 ? 'border-t border-border-subtle' : ''}`}>
                  <p className="text-sm text-ink-800">{DOC_AUDIT_ACTION[a.action] ?? a.action}{a.note ? `: ${a.note}` : ''}</p>
                  <p className="text-xs text-ink-400">{a.byName} · {ts(a.createdAt)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
