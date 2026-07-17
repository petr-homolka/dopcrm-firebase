/**
 * FamilyChatTab.jsx — DESKTOP chat na kartě rodiny (2026-07-13). Zrcadlí
 * mobilní MobileChatTab: sdílený datový hook `useChatThread`, tři/čtyři úrovně
 * soukromí (Poznámka sobě / Interní / Pěstounovi / Pro OSPOD), filtr kategorií
 * a bubliny (vlastní vpravo modré, cizí vlevo). Hranici, co pěstoun uvidí,
 * vynucují firestore.rules — tady jen zobrazení a odeslání.
 */

import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Trash2, MessageSquare } from 'lucide-react';
import { cn } from '../../components/ui/cn.js';
import { useAuthStore } from '../../store/authStore.js';
import { MESSAGE_AUDIENCES, messageAudienceLabel } from '../../shared/chatConstants.js';
import useChatThread from '../../mobile/screens/chat/useChatThread.js';
import { toDate } from './useTodayPage.js';

const AUDIENCE_TONE = {
  private: 'bg-ink-100 text-ink-500',
  internal: 'bg-warning-50 text-warning-700',
  foster: 'bg-brand-50 text-brand-700',
  ospod: 'bg-danger-50 text-danger-700',
};

function timeLabel(v) {
  const d = toDate(v);
  return d ? d.toLocaleString('cs-CZ', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
}

function Bubble({ msg, mine, onDelete, deleteLabel }) {
  return (
    <div className={cn('flex flex-col', mine ? 'items-end' : 'items-start')}>
      <div className={cn('max-w-[78%] rounded-2xl px-3.5 py-2.5', mine ? 'bg-brand-500 text-white' : 'border border-border-subtle bg-white text-ink-800')}>
        {!mine && <p className="mb-0.5 text-xs font-semibold text-ink-500">{msg.authorName}</p>}
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.body}</p>
      </div>
      <div className="mt-1 flex items-center gap-2 px-1">
        <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-semibold', AUDIENCE_TONE[msg.audience] ?? 'bg-ink-100 text-ink-500')}>
          {messageAudienceLabel(msg.audience)}
        </span>
        <span className="text-[11px] text-ink-400">{timeLabel(msg.createdAt)}</span>
        {mine && onDelete && (
          <button type="button" onClick={() => onDelete(msg.id)} aria-label={deleteLabel} className="text-ink-400 hover:text-danger-600">
            <Trash2 size={13} strokeWidth={2} />
          </button>
        )}
      </div>
    </div>
  );
}

export default function FamilyChatTab({ familyId, canManage = true }) {
  const { t } = useTranslation();
  const { currentUser } = useAuthStore();
  const uid = currentUser?.uid;
  const { messages, loading, sending, send, remove } = useChatThread(familyId);
  const [text, setText] = useState('');
  const [audience, setAudience] = useState('foster');
  const [filter, setFilter] = useState(null);

  const audiences = useMemo(() => Object.keys(MESSAGE_AUDIENCES), []);
  const shown = filter ? messages.filter((m) => m.audience === filter) : messages;

  function handleSend() {
    if (!text.trim() || sending) return;
    send({ body: text, audience });
    setText('');
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border-subtle bg-surface-muted shadow-sm">
      {messages.length > 0 && (
        <div className="flex flex-wrap gap-1.5 border-b border-border-subtle bg-white px-4 py-2.5">
          <button
            type="button"
            onClick={() => setFilter(null)}
            className={cn('rounded-full px-3 py-1 text-xs font-medium', !filter ? 'bg-brand-50 text-brand-700' : 'text-ink-500 hover:bg-surface-muted')}
          >
            {t('dsk.common.all', 'Vše')}
          </button>
          {audiences.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={cn('rounded-full px-3 py-1 text-xs font-medium', filter === key ? 'bg-brand-50 text-brand-700' : 'text-ink-500 hover:bg-surface-muted')}
            >
              {MESSAGE_AUDIENCES[key].label}
            </button>
          ))}
        </div>
      )}

      <div className="flex max-h-[52vh] min-h-[220px] flex-col gap-3 overflow-y-auto p-5">
        {loading && <p className="py-10 text-center text-sm text-ink-400">{t('dsk.common.loading', 'Načítám…')}</p>}
        {!loading && shown.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <MessageSquare size={26} strokeWidth={1.5} className="text-ink-300" />
            <p className="text-sm text-ink-500">{t('dsk.chat.empty', 'Zatím žádné zprávy. Napište poznámku sobě, kolegům, nebo pěstounovi.')}</p>
          </div>
        )}
        {!loading && shown.map((msg) => (
          <Bubble key={msg.id} msg={msg} mine={msg.authorUid === uid} onDelete={canManage ? remove : undefined} deleteLabel={t('dsk.common.delete', 'Smazat')} />
        ))}
      </div>

      {canManage && (
        <div className="border-t border-border-subtle bg-white p-3">
          <div className="mb-2 flex flex-wrap gap-1.5">
            {audiences.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setAudience(key)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
                  audience === key ? 'bg-brand-500 text-white' : 'bg-surface-canvas text-ink-500 hover:text-ink-700'
                )}
              >
                {MESSAGE_AUDIENCES[key].label}
              </button>
            ))}
          </div>
          <p className="mb-1.5 px-1 text-xs text-ink-400">{MESSAGE_AUDIENCES[audience].hint}</p>
          <div className="flex items-end gap-2">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); handleSend(); } }}
              rows={2}
              placeholder={t('dsk.chat.placeholder', 'Napište zprávu…  (Ctrl/⌘+Enter odešle)')}
              className="max-h-32 flex-1 resize-none rounded-lg border border-border-strong bg-white px-3.5 py-2.5 text-sm text-ink-800 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!text.trim() || sending}
              aria-label={t('dsk.chat.send', 'Odeslat')}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-500 text-white transition-colors hover:bg-brand-600 disabled:bg-border-strong disabled:text-ink-400"
            >
              <Send size={17} strokeWidth={2} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
