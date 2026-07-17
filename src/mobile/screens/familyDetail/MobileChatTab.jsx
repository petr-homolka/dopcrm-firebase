/**
 * MobileChatTab.jsx — záložka Chat na kartě rodiny (strana KO/týmu, 2026-07-06).
 * Tenký wrapper: data z useChatThread, zobrazení sdíleným MobileChatThread
 * v režimu 'staff' (odesílatel volí úroveň soukromí). Hranici, co pěstoun
 * uvidí, vynucují firestore.rules — viz docs/domain/chat-a-pestounska-appka.md.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import useChatThread from '../chat/useChatThread.js';
import MobileChatThread from '../chat/MobileChatThread.jsx';

export default function MobileChatTab({ familyId }) {
  const { t } = useTranslation();
  const { messages, loading, sending, send, remove } = useChatThread(familyId);
  return (
    <MobileChatThread
      mode="staff"
      messages={messages}
      loading={loading}
      sending={sending}
      onSend={send}
      onDelete={remove}
      emptyHint={t('m.chat.emptyHint', 'Zatím žádné zprávy. Napište poznámku sobě, kolegům, nebo pěstounovi.')}
    />
  );
}
