/**
 * FosterDocumentScreen.jsx — dokument očima pěstouna (2026-07-06 §D). Pěstoun
 * si přečte obsah a buď Schválí, nebo Komentuje (připomínka putuje KO). Vidí
 * jen dokumenty své rodiny zpřístupněné jemu (firestore.rules). Route
 * /moje/dokumenty/:docId.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore.js';
import { getDocument, fosterApprove, fosterComment } from '../../../services/orgService.js';
import { docStatusLabel, docStatusTone, isClosedStatus } from '../../../shared/documentConstants.js';
import { toast } from '../../../store/toastStore.js';
import MobileTopNav from '../../ui/MobileTopNav.jsx';
import NativeHero, { HeroBody } from '../../ui/NativeHero.jsx';
import NativeButton from '../../ui/NativeButton.jsx';
import NativeSheet from '../../ui/NativeSheet.jsx';
import { NativeChip } from '../../ui/NativeBits.jsx';
import { NativeFormGroup, NativeFormRow, RowTextarea } from '../../ui/NativeFormRow.jsx';
import MarkdownView from '../documents/MarkdownView.jsx';

export default function FosterDocumentScreen() {
  const { docId } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const familyId = profile?.fosterFamilyId;

  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [commentOpen, setCommentOpen] = useState(false);
  const [comment, setComment] = useState('');

  const load = useCallback(async () => {
    if (!familyId) { setLoading(false); return; }
    setLoading(true);
    try { setDoc(await getDocument(familyId, docId)); }
    catch (err) { console.error('[FosterDocumentScreen] Načtení selhalo:', err); }
    finally { setLoading(false); }
  }, [familyId, docId]);

  useEffect(() => { load(); }, [load]);

  async function approve() {
    setBusy(true);
    try { await fosterApprove(familyId, docId); toast.info('Dokument schválen.'); await load(); }
    catch (err) { toast.error(err.message ?? 'Schválení selhalo.'); }
    finally { setBusy(false); }
  }

  async function sendComment() {
    setBusy(true);
    try { await fosterComment(familyId, docId, comment); setCommentOpen(false); setComment(''); toast.info('Připomínka odeslána.'); await load(); }
    catch (err) { toast.error(err.message ?? 'Odeslání selhalo.'); }
    finally { setBusy(false); }
  }

  if (loading) {
    return <div><MobileTopNav title="Dokument" onBack={() => navigate('/moje')} /><p className="py-16 text-center text-[15px] text-native-textMuted">Načítám…</p></div>;
  }
  if (!doc) {
    return <div><MobileTopNav title="Dokument" onBack={() => navigate('/moje')} /><p className="py-16 text-center text-[15px] text-native-textMuted">Dokument není dostupný.</p></div>;
  }

  const canAct = doc.status === 'foster_review';
  const done = isClosedStatus(doc.status) || doc.status === 'approved_foster' || doc.status === 'sent' || doc.status === 'filed';

  return (
    <div>
      <MobileTopNav variant="hero" title="Dokument" onBack={() => navigate('/moje')} />
      <NativeHero title={doc.title} subtitle={<NativeChip tone={docStatusTone(doc.status)}>{docStatusLabel(doc.status)}</NativeChip>} />

      <HeroBody>
        <div className="flex flex-col gap-4 p-4 pb-10">
          <div className="rounded-native-card bg-native-surface p-4">
            {doc.kind === 'md'
              ? <MarkdownView text={doc.content} />
              : <p className="text-[15px] text-native-textMuted">Soubor {doc.fileName ?? ''}. Náhled přibude s nahráváním souborů.</p>}
          </div>

          {canAct && (
            <div className="flex flex-col gap-2.5">
              <NativeButton onClick={approve} disabled={busy}>Schválit dokument</NativeButton>
              <NativeButton variant="secondary" onClick={() => setCommentOpen(true)} disabled={busy}>Mám připomínku</NativeButton>
            </div>
          )}
          {!canAct && !done && (
            <p className="px-1 text-[13px] text-native-textMuted">Dokument teď zpracovává klíčová osoba.</p>
          )}
          {done && (
            <p className="px-1 text-[13px] text-native-textMuted">Tento dokument už je vyřízený — děkujeme.</p>
          )}
        </div>
      </HeroBody>

      {commentOpen && (
        <NativeSheet
          title="Připomínka k dokumentu"
          onClose={() => !busy && setCommentOpen(false)}
          submitting={busy}
          footer={<NativeButton onClick={sendComment} disabled={busy || !comment.trim()}>Odeslat klíčové osobě</NativeButton>}
        >
          <NativeFormGroup>
            <NativeFormRow label="Vaše připomínka" isLast stacked>
              <RowTextarea rows={5} value={comment} onChange={(e) => setComment(e.target.value)} autoFocus placeholder="Co byste rádi upravili…" />
            </NativeFormRow>
          </NativeFormGroup>
        </NativeSheet>
      )}
    </div>
  );
}
