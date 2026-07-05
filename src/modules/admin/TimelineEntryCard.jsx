/**
 * TimelineEntryCard.jsx — jedna karta záznamu (docs/domain/timeline.md §2/§3).
 * Immutability pozastavena 2026-07-05 (do odvolání) — celá karta (mimo pin
 * tlačítko) je teď klikací a otevírá editaci existujícího obsahu, ne jen
 * náhled/rozbalení dlouhého textu. Systémové karty jsou vizuálně tišší a
 * NEJDOU editovat (jsou generované appkou, ne ručním zápisem); chybový stav
 * ukazuje Zkusit znovu/Zahodit, text zůstává zachovaný (§4).
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pin, AlertCircle } from 'lucide-react';
import Avatar from '../../components/ui/Avatar.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { cn } from '../../components/ui/cn.js';
import { TIMELINE_TYPE_META, toDate, formatTime } from './timelineShared.js';

export default function TimelineEntryCard({ entry, childrenById, authorName, onTogglePin, onEdit, onRetry, onDiscard, canManage = true }) {
  const { t } = useTranslation();

  const typeMeta = TIMELINE_TYPE_META[entry.type] ?? TIMELINE_TYPE_META.note;
  const Icon = typeMeta.icon;
  const isSystem = entry.type === 'system';
  const isError = entry._status === 'error';
  const isSaving = entry._status === 'saving';
  const canEdit = canManage && !isSystem && !entry._pending;

  return (
    <div
      role={canEdit ? 'button' : undefined}
      tabIndex={canEdit ? 0 : undefined}
      onClick={canEdit ? () => onEdit(entry) : undefined}
      onKeyDown={canEdit ? (e) => { if (e.key === 'Enter') onEdit(entry); } : undefined}
      className={cn(
        'rounded-2xl bg-white px-4 py-3 text-left shadow-sm',
        canEdit && 'cursor-pointer transition hover:bg-surface-muted active:opacity-80',
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
            <Avatar name={authorName} size="sm" moduleClassName={typeMeta.moduleClassName} moduleIcon={Icon} />
          )}
          <span className="truncate text-sm font-medium text-ink-800">{entry.title}</span>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <span className="text-xs text-ink-400">{formatTime(toDate(entry.occurredAt))}</span>
          {canManage && !isSystem && !entry._pending && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onTogglePin(entry); }}
              aria-label={entry.pinned ? t('timeline.unpin') : t('timeline.pin')}
              className="rounded p-1 text-ink-400 hover:bg-surface-muted"
            >
              <Pin size={14} strokeWidth={1.75} className={entry.pinned ? 'fill-brand-600 text-brand-600' : undefined} />
            </button>
          )}
        </div>
      </div>

      {entry.body && (
        <p className="mt-1 whitespace-pre-wrap text-sm text-ink-600">{entry.body}</p>
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
          <button type="button" onClick={(e) => { e.stopPropagation(); onRetry(entry.id); }} className="text-xs font-medium text-brand-700 hover:underline">
            {t('timeline.retry')}
          </button>
          <button type="button" onClick={(e) => { e.stopPropagation(); onDiscard(entry.id); }} className="text-xs font-medium text-ink-500 hover:underline">
            {t('timeline.discard')}
          </button>
        </div>
      )}
    </div>
  );
}
