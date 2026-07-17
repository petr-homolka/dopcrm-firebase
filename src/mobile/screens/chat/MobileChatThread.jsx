/**
 * MobileChatThread.jsx — vlákno chatu rodiny (2026-07-06, messenger vzor).
 * Sdílené KO i pěstounem. `mode`:
 *   'staff'  — odesílatel volí úroveň (Poznámka sobě / Interní / Pěstounovi),
 *              u interní volitelně příjemce; vidí barevný štítek úrovně.
 *   'foster' — vždy jen 'foster' (jednosměrně KO), bez volby a bez štítků.
 *
 * Bubliny: vlastní zprávy vpravo (modrá), cizí vlevo (bílá). Hranici soukromí
 * (co se vůbec načte) řeší firestore.rules — tady jen zobrazení a odeslání.
 */

import React, { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Trash2 } from 'lucide-react';
import { cn } from '../../../components/ui/cn.js';
import { useAuthStore } from '../../../store/authStore.js';
import { MESSAGE_AUDIENCES, messageAudienceLabel } from '../../../shared/chatConstants.js';
import { toDate } from '../../../modules/admin/useTodayPage.js';

const AUDIENCE_TONE = {
  private: 'bg-native-textMuted/15 text-native-textMuted',
  internal: 'bg-native-warning/15 text-native-warning',
  foster: 'bg-native-primary/15 text-native-primary',
  ospod: 'bg-native-danger/15 text-native-danger',
};

function timeLabel(v) {
  const d = toDate(v);
  return d ? d.toLocaleString('cs-CZ', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
}

function Bubble({ msg, mine, showAudience, onDelete }) {
  const { t } = useTranslation();
  return (
    <div className={cn('flex flex-col', mine ? 'items-end' : 'items-start')}>
      <div
        className={cn(
          'max-w-[82%] rounded-native-card px-3.5 py-2.5',
          mine ? 'bg-native-primary text-white' : 'bg-native-surface text-native-text'
        )}
      >
        {!mine && <p className="mb-0.5 text-[12px] font-semibold text-native-textMuted">{msg.authorName}</p>}
        <p className="whitespace-pre-wrap text-[15px]">{msg.body}</p>
      </div>
      <div className="mt-1 flex items-center gap-2 px-1">
        {showAudience && (
          <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-semibold', AUDIENCE_TONE[msg.audience])}>
            {messageAudienceLabel(msg.audience)}
          </span>
        )}
        <span className="text-[11px] text-native-textMuted">{timeLabel(msg.createdAt)}</span>
        {mine && onDelete && (
          <button type="button" onClick={() => onDelete(msg.id)} aria-label={t('m.chat.delete', 'Smazat')} className="text-native-textMuted">
            <Trash2 size={13} strokeWidth={2} />
          </button>
        )}
      </div>
    </div>
  );
}

export default function MobileChatThread({ mode, messages, loading, sending, onSend, onDelete, emptyHint }) {
  const { t } = useTranslation();
  const { currentUser } = useAuthStore();
  const uid = currentUser?.uid;
  const [text, setText] = useState('');
  const [audience, setAudience] = useState('foster');
  const [filter, setFilter] = useState(null); // null = všechny kategorie
  const endRef = useRef(null);

  const staffAudiences = useMemo(() => Object.keys(MESSAGE_AUDIENCES), []);
  const shown = mode === 'staff' && filter ? messages.filter((m) => m.audience === filter) : messages;

  function handleSend() {
    if (!text.trim() || sending) return;
    onSend({ body: text, audience });
    setText('');
  }

  return (
    <div className="flex min-h-[60vh] flex-col">
      {mode === 'staff' && messages.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto px-4 pt-3 [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => setFilter(null)}
            className={cn('shrink-0 rounded-full px-3 py-1 text-[13px] font-medium', !filter ? 'bg-native-primary/15 text-native-primary' : 'text-native-textMuted')}
          >
            {t('m.chat.filterAll', 'Vše')}
          </button>
          {staffAudiences.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={cn('shrink-0 rounded-full px-3 py-1 text-[13px] font-medium', filter === key ? 'bg-native-primary/15 text-native-primary' : 'text-native-textMuted')}
            >
              {MESSAGE_AUDIENCES[key].label}
            </button>
          ))}
        </div>
      )}
      <div className="flex flex-1 flex-col gap-3 px-4 pb-4 pt-3">
        {loading && <p className="py-8 text-center text-[15px] text-native-textMuted">{t('m.chat.loading', 'Načítám…')}</p>}
        {!loading && shown.length === 0 && (
          <p className="py-8 text-center text-[15px] text-native-textMuted">{emptyHint}</p>
        )}
        {!loading && shown.map((msg) => (
          <Bubble
            key={msg.id}
            msg={msg}
            mine={msg.authorUid === uid}
            showAudience={mode === 'staff'}
            onDelete={onDelete}
          />
        ))}
        <div ref={endRef} />
      </div>

      <div className="sticky bottom-0 border-t border-native-separator bg-native-surface px-3 pb-[calc(env(safe-area-inset-bottom)+8px)] pt-2">
        {mode === 'staff' && (
          <div className="mb-2 flex gap-1.5 overflow-x-auto [&::-webkit-scrollbar]:hidden">
            {staffAudiences.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setAudience(key)}
                className={cn(
                  'shrink-0 rounded-full px-3 py-1.5 text-[13px] font-medium transition-transform duration-100 active:scale-[0.96]',
                  audience === key ? 'bg-native-primary text-white' : 'bg-native-bg text-native-textMuted'
                )}
              >
                {MESSAGE_AUDIENCES[key].label}
              </button>
            ))}
          </div>
        )}
        {mode === 'staff' && (
          <p className="mb-1.5 px-1 text-[12px] text-native-textMuted">{MESSAGE_AUDIENCES[audience].hint}</p>
        )}
        <div className="flex items-end gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={1}
            placeholder={mode === 'foster' ? t('m.chat.placeholderFoster', 'Napište klíčové osobě…') : t('m.chat.placeholderStaff', 'Napište zprávu…')}
            className="max-h-28 flex-1 resize-none rounded-native-input bg-native-bg px-3.5 py-2.5 text-[16px] text-native-text placeholder:text-native-textMuted focus:outline-none"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!text.trim() || sending}
            aria-label={t('m.chat.send', 'Odeslat')}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-native-primary text-white transition-transform duration-100 active:scale-[0.94] disabled:bg-native-separator disabled:text-native-textMuted"
          >
            <Send size={18} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}
