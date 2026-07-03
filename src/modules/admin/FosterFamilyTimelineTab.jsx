/**
 * FosterFamilyTimelineTab.jsx — Osa: hlavní tab detailu rodiny (docs/domain/
 * timeline.md). Filtr typu a osoby kombinovaný jedním dotazem, seskupení
 * podle dne, připnuté nahoře, optimistické UI se zachováním textu při
 * selhání zápisu. Stav/mutace v useFamilyTimeline.js, aby soubor zůstal
 * pod 300 řádků (CLAUDE.md).
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Pin as PinIcon } from 'lucide-react';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import LoadMoreButton from '../../components/ui/LoadMoreButton.jsx';
import { cn } from '../../components/ui/cn.js';
import useFamilyTimeline from './useFamilyTimeline.js';
import TimelineEntryCard from './TimelineEntryCard.jsx';
import TimelineEntryForm from './TimelineEntryForm.jsx';
import { TIMELINE_FILTERS, groupByDay, formatDayHeading } from './timelineShared.js';

export default function FosterFamilyTimelineTab({ familyId, childrenList, canManage = true }) {
  const { t } = useTranslation();
  const {
    entries, pinned, pending, loading, hasMore, loadMore,
    typeFilter, setTypeFilter, childFilter, setChildFilter,
    dialogOpen, setDialogOpen, form, setForm, correctingEntry,
    openAdd, openCorrection, submitEntry, retryPending, discardPending, togglePin, pinError, loadError,
  } = useFamilyTimeline(familyId);

  const childrenById = Object.fromEntries(childrenList.map((c) => [c.id, c]));
  const allItems = [...pending, ...entries];

  // Nejlepší dostupné zjištění — jen v rámci aktuálně načtené stránky/pending (viz timeline.md §5 bod 4).
  const correctionOf = {};
  allItems.forEach((e) => { if (e.correctsEntryId) correctionOf[e.correctsEntryId] = e; });

  const dayGroups = groupByDay(allItems);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {TIMELINE_FILTERS.map((f) => (
            <button
              key={f.labelKey}
              type="button"
              onClick={() => setTypeFilter(f.key)}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium transition',
                typeFilter === f.key ? 'bg-primary-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              )}
            >
              {t(f.labelKey)}
            </button>
          ))}
          {childrenList.map((child) => (
            <button
              key={child.id}
              type="button"
              onClick={() => setChildFilter((v) => (v === child.id ? null : child.id))}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium transition',
                childFilter === child.id ? 'bg-primary-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              )}
            >
              {child.firstName}
            </button>
          ))}
        </div>
        {canManage && (
          <Button variant="primary" size="sm" onClick={openAdd}>
            <Plus size={16} strokeWidth={1.75} />
            {t('timeline.record')}
          </Button>
        )}
      </div>

      {pinError && <div className="rounded-xl bg-red-50 px-3.5 py-2 text-sm text-red-700">{pinError}</div>}
      {loadError && <div className="rounded-xl bg-red-50 px-3.5 py-2 text-sm text-red-700">{loadError}</div>}

      {pinned.length > 0 && (
        <Card>
          <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-stone-400">
            <PinIcon size={13} strokeWidth={1.75} />
            {t('timeline.pinned')}
          </div>
          <div className="flex flex-col gap-2">
            {pinned.map((entry) => (
              <TimelineEntryCard
                key={entry.id}
                entry={entry}
                childrenById={childrenById}
                correctedBy={correctionOf[entry.id]}
                onTogglePin={togglePin}
                onCorrect={openCorrection}
                onRetry={retryPending}
                onDiscard={discardPending}
                canManage={canManage}
              />
            ))}
          </div>
        </Card>
      )}

      {loading && <p className="py-6 text-center text-sm text-stone-500">{t('common.loading')}</p>}

      {!loading && dayGroups.length === 0 && (
        <Card className="py-8 text-center text-sm text-stone-500">
          {t('timeline.emptyTitle')}{canManage && ` ${t('timeline.emptyCta')}`}
          {canManage && (
            <div className="mt-3">
              <Button variant="secondary" size="sm" onClick={openAdd}>{t('timeline.addNote')}</Button>
            </div>
          )}
        </Card>
      )}

      {!loading && dayGroups.map((group) => (
        <div key={group.key} className="flex flex-col gap-2">
          <p className="sticky top-0 bg-stone-50 py-1 text-xs font-semibold uppercase tracking-wide text-stone-400">
            {formatDayHeading(group.date, t)}
          </p>
          <div className="flex flex-col gap-2 border-l-2 border-stone-200 pl-4">
            {group.items.map((entry) => (
              <TimelineEntryCard
                key={entry.id}
                entry={entry}
                childrenById={childrenById}
                correctedBy={correctionOf[entry.id]}
                onTogglePin={togglePin}
                onCorrect={openCorrection}
                onRetry={retryPending}
                onDiscard={discardPending}
                canManage={canManage}
              />
            ))}
          </div>
        </div>
      ))}

      {!loading && hasMore && <LoadMoreButton onClick={loadMore} />}

      {dialogOpen && (
        <TimelineEntryForm
          form={form}
          setForm={setForm}
          childrenList={childrenList}
          correctingEntry={correctingEntry}
          onClose={() => setDialogOpen(false)}
          onSubmit={submitEntry}
        />
      )}
    </div>
  );
}
