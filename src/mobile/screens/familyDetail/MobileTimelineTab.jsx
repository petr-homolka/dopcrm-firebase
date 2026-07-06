/**
 * MobileTimelineTab.jsx — Osa v Detailu rodiny, čistě mobilní (DESIGN.md §12).
 * Reuse `useFamilyTimeline` hook (data), žádná sdílená JSX s desktopem.
 * Immutabilita pozastavena do odvolání (docs/domain/timeline.md) — karty
 * (mimo systémové) jsou klikací a otevírají editaci; zámek polí ODSTRANĚN
 * 2026-07-05 na žádost uživatele („jen to zdržuje").
 *
 * Filtry NEJSOU druhá řada pillů pod hlavními taby (vizuální šum) — jedna
 * kompaktní pilulka vpravo otevírá sheet s typem záznamu a dítětem. Akce
 * „Nový záznam" / „Zahájit návštěvu" sdílí jediné NativeFab speed-dial menu.
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Pin, Timer, MapPin, StickyNote, SlidersHorizontal } from 'lucide-react';
import { cn } from '../../../components/ui/cn.js';
import useFamilyTimeline from '../../../modules/admin/useFamilyTimeline.js';
import { TIMELINE_TYPE_META, TIMELINE_FILTERS, groupByDay, formatDayHeading, formatTime, toDate } from '../../../modules/admin/timelineShared.js';
import { formatDuration } from '../../../shared/visitTimerStorage.js';
import { mapLink } from '../../../shared/geoUtils.js';
import NativeSheet from '../../ui/NativeSheet.jsx';
import NativeButton from '../../ui/NativeButton.jsx';
import NativeFab from '../../ui/NativeFab.jsx';
import { NativeFormGroup, NativeFormRow, RowInput, RowTextarea } from '../../ui/NativeFormRow.jsx';
import { SectionLabel, NativeEmptyState } from '../../ui/NativeBits.jsx';

function TimelineCard({ entry, childrenList, onEdit, onTogglePin, canEdit }) {
  const meta = TIMELINE_TYPE_META[entry.type] ?? TIMELINE_TYPE_META.note;
  const Icon = meta.icon;
  const isSystem = entry.type === 'system';
  const childNames = (entry.subjectRefs ?? [])
    .map((ref) => childrenList.find((c) => c.id === ref.id)?.firstName)
    .filter(Boolean);

  return (
    <button
      type="button"
      disabled={!canEdit}
      onClick={() => canEdit && onEdit(entry)}
      className={cn(
        'w-full rounded-native-card bg-native-surface px-4 py-3 text-left',
        canEdit && 'transition-transform duration-100 active:scale-[0.98]',
        isSystem && 'bg-native-bg'
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Icon size={16} strokeWidth={1.75} className="shrink-0 text-native-textMuted" />
          <span className="truncate text-[15px] font-medium text-native-text">{entry.title}</span>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="text-[13px] text-native-textMuted">{formatTime(toDate(entry.occurredAt))}</span>
          {!isSystem && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onTogglePin(entry); }}
              className="p-1 text-native-textMuted"
              aria-label={entry.pinned ? 'Odepnout' : 'Připnout'}
            >
              <Pin size={14} strokeWidth={2} className={entry.pinned ? 'fill-native-primary text-native-primary' : undefined} />
            </button>
          )}
        </div>
      </div>
      {entry.body && <p className="mt-1 whitespace-pre-wrap text-[15px] text-native-textMuted">{entry.body}</p>}
      {entry.type === 'visit' && (entry.durationSeconds != null || entry.location) && (
        <div className="mt-2 flex items-center gap-3">
          {entry.durationSeconds != null && (
            <span className="flex items-center gap-1 text-[12px] font-medium text-native-primary">
              <Timer size={13} strokeWidth={2} /> {formatDuration(entry.durationSeconds)}
            </span>
          )}
          {entry.location && (
            <a
              href={mapLink(entry.location)}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-[12px] font-medium text-native-primary"
            >
              <MapPin size={13} strokeWidth={2} /> Mapa
            </a>
          )}
        </div>
      )}
      {childNames.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {childNames.map((n) => (
            <span key={n} className="rounded-full bg-native-bg px-2.5 py-0.5 text-[12px] text-native-textMuted">{n}</span>
          ))}
        </div>
      )}
    </button>
  );
}

function FilterChip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full px-3 py-1.5 text-[14px] font-medium transition-transform duration-100 active:scale-[0.96]',
        active ? 'bg-native-primary text-white' : 'bg-native-bg text-native-textMuted'
      )}
    >
      {children}
    </button>
  );
}

export default function MobileTimelineTab({ familyId, familyName, childrenList, canManage }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    entries, pinned, pending, loading, hasMore, loadMore,
    typeFilter, setTypeFilter, childFilter, setChildFilter,
    dialogOpen, setDialogOpen, form, setForm, editingEntry, editSubmitting,
    openAdd, openEdit, submitEntry, togglePin,
  } = useFamilyTimeline(familyId);
  const [filterOpen, setFilterOpen] = useState(false);

  const allItems = [...pending, ...entries];
  const dayGroups = groupByDay(allItems);

  const typeLabel = typeFilter ? t(TIMELINE_FILTERS.find((f) => f.key === typeFilter)?.labelKey) : null;
  const childName = childFilter ? childrenList.find((c) => c.id === childFilter)?.firstName : null;
  const filterActive = !!(typeFilter || childFilter);
  const filterLabel = [typeLabel, childName].filter(Boolean).join(' · ') || 'Filtr';

  function canEdit(entry) {
    return canManage && entry.type !== 'system' && !entry._pending;
  }

  return (
    <div>
      <div className="flex justify-end px-4 pt-3">
        <button
          type="button"
          onClick={() => setFilterOpen(true)}
          className={cn(
            'flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-transform duration-100 active:scale-[0.96]',
            filterActive ? 'bg-native-primary/15 text-native-primary' : 'bg-native-surface text-native-textMuted'
          )}
        >
          <SlidersHorizontal size={14} strokeWidth={2} />
          {filterLabel}
        </button>
      </div>

      <div className="flex flex-col gap-2 px-4 pb-28 pt-1">
        {pinned.length > 0 && (
          <>
            <SectionLabel>Připnuté</SectionLabel>
            {pinned.map((entry) => (
              <TimelineCard key={entry.id} entry={entry} childrenList={childrenList} onEdit={openEdit} onTogglePin={togglePin} canEdit={canEdit(entry)} />
            ))}
          </>
        )}

        {loading && <p className="py-8 text-center text-[15px] text-native-textMuted">Načítám…</p>}

        {!loading && dayGroups.length === 0 && (
          <div className="mt-2">
            <NativeEmptyState
              icon={StickyNote}
              title="Zatím žádné záznamy"
              description="Klepněte na + a zapište poznámku, nebo rovnou spusťte návštěvu."
            />
          </div>
        )}

        {!loading && dayGroups.map((group) => (
          <div key={group.key} className="flex flex-col gap-2">
            <SectionLabel>{formatDayHeading(group.date, t)}</SectionLabel>
            {group.items.map((entry) => (
              <TimelineCard key={entry.id} entry={entry} childrenList={childrenList} onEdit={openEdit} onTogglePin={togglePin} canEdit={canEdit(entry)} />
            ))}
          </div>
        ))}

        {!loading && hasMore && (
          <NativeButton variant="secondary" className="mt-2 h-11" onClick={loadMore}>
            Načíst další
          </NativeButton>
        )}
      </div>

      {canManage && (
        <NativeFab
          actions={[
            { icon: Timer, label: 'Zahájit návštěvu', onClick: () => navigate(`/admin/terenni/${familyId}/navsteva`, { state: { familyName } }) },
            { icon: StickyNote, label: 'Nový záznam', onClick: openAdd },
          ]}
        />
      )}

      {filterOpen && (
        <NativeSheet
          title="Filtr záznamů"
          onClose={() => setFilterOpen(false)}
          footer={<NativeButton onClick={() => setFilterOpen(false)}>Hotovo</NativeButton>}
        >
          <div>
            <p className="mb-1.5 text-[12px] font-medium text-native-textMuted">Typ záznamu</p>
            <div className="flex flex-wrap gap-1.5">
              {TIMELINE_FILTERS.map((f) => (
                <FilterChip key={f.labelKey} active={typeFilter === f.key} onClick={() => setTypeFilter(f.key)}>
                  {t(f.labelKey)}
                </FilterChip>
              ))}
            </div>
          </div>
          {childrenList.length > 0 && (
            <div>
              <p className="mb-1.5 text-[12px] font-medium text-native-textMuted">Dítě</p>
              <div className="flex flex-wrap gap-1.5">
                <FilterChip active={!childFilter} onClick={() => setChildFilter(null)}>Všechny</FilterChip>
                {childrenList.map((child) => (
                  <FilterChip key={child.id} active={childFilter === child.id} onClick={() => setChildFilter(child.id)}>
                    {child.firstName}
                  </FilterChip>
                ))}
              </div>
            </div>
          )}
        </NativeSheet>
      )}

      {dialogOpen && (
        <NativeSheet
          title={editingEntry ? 'Upravit záznam' : 'Nový záznam'}
          onClose={() => setDialogOpen(false)}
          submitting={editSubmitting}
          footer={
            <NativeButton onClick={() => submitEntry(form)} disabled={editSubmitting || !form.body.trim()}>
              {editSubmitting ? 'Ukládám…' : 'Uložit'}
            </NativeButton>
          }
        >
          <NativeFormGroup>
            <NativeFormRow label="Nadpis">
              <RowInput value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Poznámka" />
            </NativeFormRow>
            {/* Textarea se do horizontálního řádku (v4) nevejde → stacked */}
            <NativeFormRow label="Text" stacked>
              <RowTextarea value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} autoFocus />
            </NativeFormRow>
            <NativeFormRow label="Datum" isLast>
              <RowInput type="date" value={form.occurredAt} onChange={(e) => setForm((f) => ({ ...f, occurredAt: e.target.value }))} />
            </NativeFormRow>
          </NativeFormGroup>
          {childrenList.length > 0 && (
            <div>
              <p className="mb-1.5 text-[12px] font-medium text-native-textMuted">Týká se</p>
              <div className="flex flex-wrap gap-1.5">
                {childrenList.map((child) => {
                  const active = form.childIds.includes(child.id);
                  return (
                    <FilterChip
                      key={child.id}
                      active={active}
                      onClick={() => setForm((f) => ({
                        ...f,
                        childIds: active ? f.childIds.filter((id) => id !== child.id) : [...f.childIds, child.id],
                      }))}
                    >
                      {child.firstName}
                    </FilterChip>
                  );
                })}
              </div>
            </div>
          )}
        </NativeSheet>
      )}
    </div>
  );
}
