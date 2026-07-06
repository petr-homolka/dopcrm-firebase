/**
 * useChatThread.js — data pro chat na kartě rodiny (2026-07-06,
 * docs/domain/chat-a-pestounska-appka.md). Sdílí ho KO (MobileChatTab) i
 * pěstoun (FosterChatScreen); rozdíl je jen v tom, jaké úrovně soukromí
 * smí odesílatel zvolit (řeší UI a firestore.rules).
 *
 * Po odeslání zprávy založí notifikaci protistraně (bez Cloud Functions):
 *   - zaměstnanec pošle 'foster'    → notifikace pěstounům rodiny,
 *   - zaměstnanec pošle 'internal'  → notifikace uvedeným příjemcům,
 *   - pěstoun pošle (vždy 'foster') → notifikace přiřazené KO rodiny.
 */

import { useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '../../../store/authStore.js';
import {
  getFoster, listMessages, sendMessage, deleteMessage,
  pushNotification, pushNotificationTo,
} from '../../../services/orgService.js';

export default function useChatThread(familyId) {
  const { role, profile, currentUser } = useAuthStore();
  const [family, setFamily] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!familyId) return;
    setLoading(true);
    setError('');
    try {
      const [fam, msgs] = await Promise.all([getFoster(familyId), listMessages(familyId)]);
      setFamily(fam);
      setMessages(msgs);
    } catch (err) {
      console.error('[useChatThread] Načtení chatu selhalo:', err);
      setError(err.message ?? 'Chat se nepodařilo načíst.');
    } finally {
      setLoading(false);
    }
  }, [familyId]);

  useEffect(() => { load(); }, [load]);

  const send = useCallback(async ({ body, audience, recipients = [] }) => {
    if (!body.trim()) return;
    setSending(true);
    try {
      await sendMessage(familyId, { body, audience, recipients });
      const fromName = profile?.displayName ?? currentUser?.email ?? 'Zpráva';
      // Notifikace protistraně dle úrovně.
      if (audience === 'foster' && role === 'pestoun') {
        await pushNotification(family?.assignedTo, {
          type: 'message', title: `Nová zpráva: ${family?.name ?? 'rodina'}`,
          body: body.slice(0, 80), link: `/admin/terenni/${familyId}`,
        });
      } else if (audience === 'foster') {
        await pushNotificationTo(family?.fosterUserIds ?? [], {
          type: 'message', title: `Zpráva od ${fromName}`,
          body: body.slice(0, 80), link: '/moje/chat',
        });
      } else if (audience === 'internal' && recipients.length > 0) {
        await pushNotificationTo(recipients, {
          type: 'message', title: `Interní zpráva: ${family?.name ?? 'rodina'}`,
          body: body.slice(0, 80), link: `/admin/terenni/${familyId}`,
        });
      }
      await load();
    } catch (err) {
      console.error('[useChatThread] Odeslání selhalo:', err);
      setError(err.message ?? 'Zprávu se nepodařilo odeslat.');
    } finally {
      setSending(false);
    }
  }, [familyId, family, role, profile, currentUser, load]);

  const remove = useCallback(async (id) => {
    try {
      await deleteMessage(familyId, id);
      await load();
    } catch (err) {
      console.error('[useChatThread] Smazání selhalo:', err);
    }
  }, [familyId, load]);

  return { family, messages, loading, sending, error, send, remove, reload: load };
}
