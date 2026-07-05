/**
 * useFamilyTimeline.js — stav a mutace pro FosterFamilyTimelineTab.jsx
 * (docs/domain/timeline.md). Optimistické UI pro NOVÉ záznamy: objeví se
 * okamžitě (`_status: 'saving'`), při selhání přejde do `'error'` a ZŮSTANE
 * v seznamu s textem zachovaným (§3/§4 specky) — žádné tiché zmizení.
 *
 * Editace EXISTUJÍCÍHO záznamu (immutability pozastavena 2026-07-05, do
 * odvolání) jde jinou cestou — žádný optimistický pending klon, jen
 * `editSubmitting` na formuláři a po úspěchu reload seznamu, protože
 * upravujeme řádek, který už na obrazovce existuje.
 */

import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  listTimelineEntries, listPinnedTimelineEntries, createTimelineEntry,
  updateTimelineEntry, setTimelinePinned,
} from '../../services/orgService.js';
import { toast } from '../../store/toastStore.js';
import { toDate, emptyEntryForm } from './timelineShared.js';

export default function useFamilyTimeline(familyId) {
  const { t } = useTranslation();
  const [entries, setEntries] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [pinned, setPinned] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState(null);
  const [childFilter, setChildFilter] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyEntryForm);
  const [editingEntry, setEditingEntry] = useState(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [pinError, setPinError] = useState('');
  const [loadError, setLoadError] = useState('');

  // Dvě NEZÁVISLÉ chybové domény (hlavní seznam vs. připnuté) — selhání
  // jedné (např. chybějící composite index) nesmí ztichlé zablokovat druhou.
  const loadFirstPage = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const page = await listTimelineEntries(familyId, { type: typeFilter, childId: childFilter });
      setEntries(page.items);
      setCursor(page.lastDoc);
      setHasMore(!!page.lastDoc);
    } catch (err) {
      setLoadError(err.message ?? t('timeline.errors.loadFailed'));
    } finally {
      setLoading(false);
    }

    try {
      setPinned(await listPinnedTimelineEntries(familyId));
    } catch (err) {
      console.error('[useFamilyTimeline] Připnuté záznamy se nepodařilo načíst:', err);
      setPinned([]);
    }
  }, [familyId, typeFilter, childFilter, t]);

  useEffect(() => { loadFirstPage(); }, [loadFirstPage]);

  const loadMore = useCallback(async () => {
    const page = await listTimelineEntries(familyId, { type: typeFilter, childId: childFilter }, cursor);
    setEntries((prev) => [...prev, ...page.items]);
    setCursor(page.lastDoc);
    setHasMore(!!page.lastDoc);
  }, [familyId, typeFilter, childFilter, cursor]);

  function openAdd() {
    setEditingEntry(null);
    setForm(emptyEntryForm);
    setDialogOpen(true);
  }

  /** Rozkliknutí existujícího záznamu — formulář se předvyplní AKTUÁLNÍM obsahem (§ tap-to-edit, 2026-07-05). */
  function openEdit(entry) {
    setEditingEntry(entry);
    setForm({
      title: entry.title ?? '',
      body: entry.body ?? '',
      occurredAt: toDate(entry.occurredAt)?.toISOString().slice(0, 10) ?? emptyEntryForm.occurredAt,
      childIds: (entry.subjectRefs ?? []).map((r) => r.id),
    });
    setDialogOpen(true);
  }

  const performSubmit = useCallback(async (localId, payload) => {
    const subjectRefs = payload.childIds.map((id) => ({ kind: 'child', id }));
    try {
      await createTimelineEntry(familyId, {
        type: 'note', title: payload.title.trim() || t('timeline.defaultTitle'), body: payload.body,
        subjectRefs, occurredAt: new Date(payload.occurredAt), source: 'web',
      });
      setPending((prev) => prev.filter((p) => p.id !== localId));
      await loadFirstPage();
    } catch (err) {
      setPending((prev) => prev.map((p) => (p.id === localId ? { ...p, _status: 'error', _error: err.message } : p)));
    }
  }, [familyId, loadFirstPage, t]);

  async function submitEntry(payload) {
    if (editingEntry) {
      setEditSubmitting(true);
      try {
        const subjectRefs = payload.childIds.map((id) => ({ kind: 'child', id }));
        await updateTimelineEntry(familyId, editingEntry.id, {
          title: payload.title.trim() || t('timeline.defaultTitle'),
          body: payload.body,
          occurredAt: new Date(payload.occurredAt),
          subjectRefs,
        });
        setDialogOpen(false);
        await loadFirstPage();
      } catch (err) {
        toast.error(err.message ?? t('timeline.errors.updateFailed'));
      } finally {
        setEditSubmitting(false);
      }
      return;
    }

    const localId = `pending-${Date.now()}`;
    const optimistic = {
      id: localId,
      _pending: true,
      _status: 'saving',
      _payload: payload,
      type: 'note',
      title: payload.title.trim() || t('timeline.defaultTitle'),
      body: payload.body,
      occurredAt: new Date(payload.occurredAt),
      subjectRefs: payload.childIds.map((id) => ({ kind: 'child', id })),
      pinned: false,
    };
    setPending((prev) => [...prev, optimistic]);
    setDialogOpen(false);
    performSubmit(localId, payload);
  }

  function retryPending(localId) {
    const item = pending.find((p) => p.id === localId);
    if (!item) return;
    setPending((prev) => prev.map((p) => (p.id === localId ? { ...p, _status: 'saving' } : p)));
    performSubmit(localId, item._payload);
  }

  function discardPending(localId) {
    setPending((prev) => prev.filter((p) => p.id !== localId));
  }

  async function togglePin(entry) {
    setPinError('');
    try {
      await setTimelinePinned(familyId, entry.id, !entry.pinned);
      await loadFirstPage();
    } catch (err) {
      setPinError(err.message ?? t('timeline.errors.pinFailed'));
    }
  }

  return {
    entries, pinned, pending, loading, hasMore, loadMore,
    typeFilter, setTypeFilter, childFilter, setChildFilter,
    dialogOpen, setDialogOpen, form, setForm, editingEntry, editSubmitting,
    openAdd, openEdit, submitEntry, retryPending, discardPending, togglePin, pinError, loadError,
  };
}
