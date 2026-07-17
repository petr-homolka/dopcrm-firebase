/**
 * MobileDocumentDetailScreen.jsx — detail dokumentu na straně týmu (2026-07-06
 * §C/§D). Modrý hero se stavem, obsah (markdown view/edit + ukládání verzí),
 * komentář pěstouna, schvalovací akce (DocumentActions), historie verzí a
 * auditní stopa. Route /admin/terenni/:familyId/dokumenty/:docId.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { Pencil, History, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore.js';
import { isReadOnlyManager } from '../../../services/orgAuth.js';
import { getDocument, listDocumentVersions, listDocumentAudit, saveMarkdownVersion } from '../../../services/orgService.js';
import { docStatusLabel, docStatusTone, isClosedStatus, DOC_AUDIT_ACTION } from '../../../shared/documentConstants.js';
import { toDate } from '../../../modules/admin/useTodayPage.js';
import { toast } from '../../../store/toastStore.js';
import MobileTopNav from '../../ui/MobileTopNav.jsx';
import NativeHero, { HeroBody } from '../../ui/NativeHero.jsx';
import NativeButton from '../../ui/NativeButton.jsx';
import { NativeChip, SectionLabel } from '../../ui/NativeBits.jsx';
import { RowTextarea } from '../../ui/NativeFormRow.jsx';
import MarkdownView from './MarkdownView.jsx';
import DocumentActions from './DocumentActions.jsx';

function ts(v) {
  const d = toDate(v);
  return d ? d.toLocaleString('cs-CZ', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
}

export default function MobileDocumentDetailScreen() {
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
      console.error('[MobileDocumentDetailScreen] Načtení selhalo:', err);
    } finally { setLoading(false); }
  }, [familyId, docId]);

  useEffect(() => { load(); }, [load]);

  async function handleSaveVersion() {
    setSaving(true);
    try {
      await saveMarkdownVersion(familyId, docId, { content: draft });
      setEditing(false);
      await load();
      toast.info(t('m.docs.savedVersion', 'Uložena nová verze.'));
    } catch (err) {
      toast.error(err.message ?? t('m.docs.saveFailed', 'Uložení selhalo.'));
    } finally { setSaving(false); }
  }

  if (loading) {
    return <div><MobileTopNav title={t('m.docs.title', 'Dokument')} onBack={() => navigate(-1)} /><p className="py-16 text-center text-[15px] text-native-textMuted">{t('m.docs.loading', 'Načítám…')}</p></div>;
  }
  if (!doc) {
    return <div><MobileTopNav title={t('m.docs.title', 'Dokument')} onBack={() => navigate(-1)} /><p className="py-16 text-center text-[15px] text-native-textMuted">{t('m.docs.notFound', 'Dokument nenalezen.')}</p></div>;
  }

  const editable = canManage && doc.kind === 'md' && !isClosedStatus(doc.status) && doc.status !== 'sent' && doc.status !== 'filed';

  return (
    <div>
      <MobileTopNav variant="hero" title={t('m.docs.title', 'Dokument')} onBack={() => navigate(-1)} />
      <NativeHero
        title={doc.title}
        subtitle={<NativeChip tone={docStatusTone(doc.status)}>{docStatusLabel(doc.status)}</NativeChip>}
      />

      <HeroBody>
        <div className="flex flex-col gap-4 p-4 pb-10">
          {doc.status === 'commented' && doc.fosterComment && (
            <div className="rounded-native-card bg-native-warning/10 p-4">
              <p className="text-[13px] font-semibold uppercase tracking-wide text-native-warning">{t('m.docs.fosterCommentTitle', 'Připomínka pěstouna')}</p>
              <p className="mt-1 whitespace-pre-wrap text-[15px] text-native-text">{doc.fosterComment}</p>
            </div>
          )}

          <div className="rounded-native-card bg-native-surface p-4">
            {editing ? (
              <>
                <RowTextarea rows={12} value={draft} onChange={(e) => setDraft(e.target.value)} autoFocus />
                <div className="mt-3 flex gap-2">
                  <NativeButton variant="secondary" className="h-11" onClick={() => { setEditing(false); setDraft(doc.content ?? ''); }}>{t('m.docs.cancel', 'Zrušit')}</NativeButton>
                  <NativeButton className="h-11" onClick={handleSaveVersion} disabled={saving}>{saving ? t('m.docs.saving', 'Ukládám…') : t('m.docs.saveVersion', 'Uložit verzi')}</NativeButton>
                </div>
              </>
            ) : doc.kind === 'md' ? (
              <>
                <MarkdownView text={doc.content} />
                {editable && (
                  <button type="button" onClick={() => setEditing(true)} className="mt-3 flex items-center gap-1.5 text-[15px] font-medium text-native-primary">
                    <Pencil size={16} strokeWidth={2} /> {t('m.docs.editContent', 'Upravit obsah')}
                  </button>
                )}
              </>
            ) : (
              <p className="text-[15px] text-native-textMuted">
                {t('m.docs.fileNotice', 'Soubor {{name}}. Náhled a stahování přibude s nahráváním souborů (§E).', { name: doc.fileName ?? doc.kind })}
              </p>
            )}
          </div>

          {canManage && <DocumentActions doc={doc} familyId={familyId} isManagement={isManagement} onChanged={load} />}

          {versions.length > 0 && (
            <div>
              <SectionLabel><span className="inline-flex items-center gap-1"><History size={14} strokeWidth={2} /> {t('m.docs.versions', 'Verze')}</span></SectionLabel>
              <div className="overflow-hidden rounded-native-card bg-native-surface">
                {versions.map((v, i) => (
                  <div key={v.id} className={`flex items-center justify-between px-4 py-2.5 ${i < versions.length - 1 ? 'border-b border-native-separator' : ''}`}>
                    <span className="text-[15px] text-native-text">{t('m.docs.versionN', 'Verze {{n}}', { n: v.version })}</span>
                    <span className="text-[13px] text-native-textMuted">{ts(v.createdAt)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {audit.length > 0 && (
            <div>
              <SectionLabel><span className="inline-flex items-center gap-1"><ShieldCheck size={14} strokeWidth={2} /> {t('m.docs.auditTrail', 'Auditní stopa')}</span></SectionLabel>
              <div className="overflow-hidden rounded-native-card bg-native-surface">
                {audit.map((a, i) => (
                  <div key={a.id} className={`px-4 py-2.5 ${i < audit.length - 1 ? 'border-b border-native-separator' : ''}`}>
                    <p className="text-[15px] text-native-text">{DOC_AUDIT_ACTION[a.action] ?? a.action}{a.note ? `: ${a.note}` : ''}</p>
                    <p className="text-[13px] text-native-textMuted">{a.byName} · {ts(a.createdAt)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </HeroBody>
    </div>
  );
}
