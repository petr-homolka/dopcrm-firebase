/**
 * FosterFamilyTimelineTab.jsx — Osa: hlavní tab detailu rodiny (docs/domain/
 * timeline.md). Krok 3c redesignu (DESIGN.md §5.7/§6.5): double-avatar řádky
 * (autor + kroužek barvy modulu, viz TimelineEntryCard.jsx) a day-chip strip
 * pro rychlou navigaci mezi dny. Filtr typu a osoby kombinovaný jedním
 * dotazem, seskupení podle dne, připnuté nahoře, optimistické UI se
 * zachováním textu při selhání zápisu. Stav/mutace v useFamilyTimeline.js,
 * aby soubor zůstal pod 300 řádků (CLAUDE.md).
 *
 * Autor záznamu (pro double-avatar) se dohledává z `users` organizace přes
 * `createdBy` uid — malý dodatečný dotaz (desítky zaměstnanců max), ne N+1
 * (jeden dotaz pro celou organizaci, ne per záznam).
 */

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Pin as PinIcon } from 'lucide-react';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Chip from '../../components/ui/Chip.jsx';
import LoadMoreButton from '../../components/ui/LoadMoreButton.jsx';
import { useAuthStore } from '../../store/authStore.js';
import { listUsersByOrg } from '../../services/orgService.js';
import useFamilyTimeline from './useFamilyTimeline.js';
import TimelineEntryCard from './TimelineEntryCard.jsx';
import TimelineEntryForm from './TimelineEntryForm.jsx';
import { TIMELINE_FILTERS, groupByDay, formatDayHeading, formatDayChip } from './timelineShared.js';

export default function FosterFamilyTimelineTab({ familyId, childrenList, canManage = true }) {
  const { t } = useTranslation();
  const { organizationId } = useAuthStore();
  const [employeesById, setEmployeesById] = useState({});
  const {
    entries, pinned, pending, loading, hasMore, loadMore,
    typeFilter, setTypeFilter, childFilter, setChildFilter,
    dialogOpen, setDialogOpen, form, setForm, correctingEntry,
    openAdd, openCorrection, submitEntry, retryPending, discardPending, togglePin, pinError, loadError,
  } = useFamilyTimeline(familyId);

  useEffect(() => {
    if (!organizationId) return;
    listUsersByOrg(organizationId)
      .then((users) => setEmployeesById(Object.fromEntries(users.map((u) => [u.id, u]))))
      .catch((err) => console.error('[FosterFamilyTimelineTab] Načtení zaměstnanců selhalo:', err));
  }, [organizationId]);

  const childrenById = Object.fromEntries(childrenList.map((c) => [c.id, c]));
  const allItems = [...pending, ...entries];

  // Nejlepší dostupné zjištění — jen v rámci aktuálně načtené stránky/pending (viz timeline.md §5 bod 4).
  const correctionOf = {};
  allItems.forEach((e) => { if (e.correctsEntryId) correctionOf[e.correctsEntryId] = e; });

  const dayGroups = groupByDay(allItems);

  function authorName(entry) {
    return employeesById[entry.createdBy]?.displayName;
  }

  function scrollToDay(key) {
    document.getElementById(`timeline-day-${key}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {TIMELINE_FILTERS.map((f) => (
            <Chip key={f.labelKey} active={typeFilter === f.key} onClick={() => setTypeFilter(f.key)}>
              {t(f.labelKey)}
            </Chip>
          ))}
          {childrenList.map((child) => (
            <Chip key={child.id} active={childFilter === child.id} onClick={() => setChildFilter((v) => (v === child.id ? null : child.id))}>
              {child.firstName}
            </Chip>
          ))}
        </div>
        {canManage && (
          <Button variant="primary" size="sm" onClick={openAdd}>
            <Plus size={16} strokeWidth={1.75} />
            {t('timeline.record')}
          </Button>
        )}
      </div>

      {dayGroups.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {dayGroups.map((group) => (
            <button
              key={group.key}
              type="button"
              onClick={() => scrollToDay(group.key)}
              className="shrink-0 rounded-full bg-surface-muted px-3 py-1 text-xs font-medium text-ink-600 transition hover:bg-border-subtle"
            >
              {formatDayChip(group.date)}
            </button>
          ))}
        </div>
      )}

      {pinError && <div className="rounded-xl bg-danger-50 px-3.5 py-2 text-sm text-danger-700">{pinError}</div>}
      {loadError && <div className="rounded-xl bg-danger-50 px-3.5 py-2 text-sm text-danger-700">{loadError}</div>}

      {pinned.length > 0 && (
        <Card>
          <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-400">
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
                authorName={authorName(entry)}
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

      {loading && <p className="py-6 text-center text-sm text-ink-500">{t('common.loading')}</p>}

      {!loading && dayGroups.length === 0 && (
        <Card className="py-8 text-center text-sm text-ink-500">
          {t('timeline.emptyTitle')}{canManage && ` ${t('timeline.emptyCta')}`}
          {canManage && (
            <div className="mt-3">
              <Button variant="secondary" size="sm" onClick={openAdd}>{t('timeline.addNote')}</Button>
            </div>
          )}
        </Card>
      )}

      {!loading && dayGroups.map((group) => (
        <div key={group.key} id={`timeline-day-${group.key}`} className="flex scroll-mt-4 flex-col gap-2">
          <p className="sticky top-0 bg-surface-canvas py-1 text-xs font-semibold uppercase tracking-wide text-ink-400">
            {formatDayHeading(group.date, t)}
          </p>
          <div className="flex flex-col gap-2 border-l-2 border-border-default pl-4">
            {group.items.map((entry) => (
              <TimelineEntryCard
                key={entry.id}
                entry={entry}
                childrenById={childrenById}
                correctedBy={correctionOf[entry.id]}
                authorName={authorName(entry)}
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
