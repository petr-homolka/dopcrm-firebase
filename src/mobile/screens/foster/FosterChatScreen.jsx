/**
 * FosterChatScreen.jsx — chat pěstouna s klíčovou osobou (2026-07-06).
 * Používá sdílený useChatThread + MobileChatThread v režimu 'foster':
 * pěstoun píše vždy jen úroveň 'foster' (jednosměrně KO) a vidí jen zprávy
 * této úrovně své rodiny (firestore.rules). Spis KO nikdy neuvidí.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore.js';
import useChatThread from '../chat/useChatThread.js';
import MobileChatThread from '../chat/MobileChatThread.jsx';
import MobileTopNav from '../../ui/MobileTopNav.jsx';

export default function FosterChatScreen() {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const familyId = profile?.fosterFamilyId;
  const { messages, loading, sending, send } = useChatThread(familyId);

  return (
    <div className="flex min-h-dvh flex-col">
      <MobileTopNav title="Klíčová osoba" onBack={() => navigate('/moje')} />
      <MobileChatThread
        mode="foster"
        messages={messages}
        loading={loading}
        sending={sending}
        onSend={send}
        emptyHint="Napište své klíčové osobě — odpoví vám co nejdřív."
      />
    </div>
  );
}
