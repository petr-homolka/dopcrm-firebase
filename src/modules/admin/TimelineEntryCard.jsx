/**
 * TimelineEntryCard.jsx — jedna karta záznamu (docs/domain/timeline.md §2/§3).
 * Klik na text rozbalí inline (line-clamp); systémové karty jsou vizuálně
 * tišší a bez menu „⋯"; chybový stav ukazuje Zkusit znovu/Zahodit, text
 * zůstává zachovaný (§4).
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MoreHorizontal, Pin, AlertCircle } from 'lucide-react';
import Avatar from '../../components/ui/Avatar.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { cn } from '../../components/ui/cn.js';
import { TIMELINE_TYPE_META, toDate, formatTime } from './timelineShared.js';

const CORRECTABLE_TYPES = ['visit', 'note', 'audio_note'];

export default function TimelineEntryCard({ entry, childrenById, correctedBy, authorName, onTogglePin, onCorrect, onRetry, onDiscard, canManage = true }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const typeMeta = TIMELINE_TYPE_META[entry.type] ?? TIMELINE_TYPE_META.note;
  const Icon = typeMeta.icon;
  const isSystem = entry.type === 'system';
  const isError = entry._status === 'error';
  const isSaving = entry._status === 'saving';
  const canCorrect = canManage && !isSystem && !entry._pending && CORRECTABLE_TYPES.includes(entry.type);

  const body = entry.body ?? '';
  const bodyLong = body.length > 180;
  const bodyShown = expanded || !bodyLong ? body : `${body.slice(0, 180)}…`;

  return (
    <div
      className={cn(
        'rounded-2xl bg-white px-4 py-3 shadow-sm',
        isSystem && 'bg-surface-muted py-2 shadow-none',
        isError && 'bg-danger-50 ring-1 ring-danger-200',
        isSaving && 'animate-pulse opacity-70'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          {isSystem ? (
            <Icon size={18} strokeWidth={1.75} className={isError ? 'shrink-0 text-danger-600' : 'shrink-0 text-ink-500'} />
          ) : (
            // Double-avatar (DESIGN.md §5.5/§5.7, signature Connecteam vzor):
            // autor + kroužek barvy modulu s ikonou typu záznamu.
            <Avatar name={authorName} size="sm" moduleClassName={typeMeta.moduleClassName} moduleIcon={Icon} />
          )}
          <span className="truncate text-sm font-medium text-ink-800">{entry.title}</span>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <span className="text-xs text-ink-400">{formatTime(toDate(entry.occurredAt))}</span>
          {canManage && !isSystem && !entry._pending && (
            <button
              type="button"
              onClick={() => onTogglePin(entry)}
              aria-label={entry.pinned ? t('timeline.unpin') : t('timeline.pin')}
              className="rounded p-1 text-ink-400 hover:bg-surface-muted"
            >
              <Pin size={14} strokeWidth={1.75} className={entry.pinned ? 'fill-brand-600 text-brand-600' : undefined} />
            </button>
          )}
          {canCorrect && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label={t('timeline.moreOptions')}
                className="rounded p-1 text-ink-400 hover:bg-surface-muted"
              >
                <MoreHorizontal size={16} strokeWidth={1.75} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 z-10 mt-1 w-40 rounded-xl border border-border-subtle bg-white py-1 shadow-lg">
                  <button
                    type="button"
                    onClick={() => { setMenuOpen(false); onCorrect(entry); }}
                    className="w-full px-3 py-1.5 text-left text-sm text-ink-700 hover:bg-surface-muted"
                  >
                    {t('timeline.writeCorrection')}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {body && (
        <p
          onClick={() => bodyLong && setExpanded((v) => !v)}
          className={cn('mt-1 whitespace-pre-wrap text-sm text-ink-600', bodyLong && !expanded && 'line-clamp-3 cursor-pointer')}
        >
          {bodyShown}
          {bodyLong && !expanded && <span className="ml-1 font-medium text-brand-700">{t('timeline.showMore')}</span>}
        </p>
      )}

      {correctedBy && (
        <p className="mt-1 text-xs italic text-ink-400">{t('timeline.correctedNote')}</p>
      )}

      {entry.subjectRefs?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {entry.subjectRefs.map((ref) => (
            <Badge key={ref.id} tone="family" className="text-[11px]">
              {childrenById[ref.id]?.firstName ?? '—'}
            </Badge>
          ))}
        </div>
      )}

      {isError && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <AlertCircle size={14} strokeWidth={1.75} className="shrink-0 text-danger-600" />
          <span className="text-xs text-danger-700">{t('timeline.saveFailed')}</span>
          <button type="button" onClick={() => onRetry(entry.id)} className="text-xs font-medium text-brand-700 hover:underline">
            {t('timeline.retry')}
          </button>
          <button type="button" onClick={() => onDiscard(entry.id)} className="text-xs font-medium text-ink-500 hover:underline">
            {t('timeline.discard')}
          </button>
        </div>
      )}
    </div>
  );
}
