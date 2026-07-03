/**
 * useFamilyTimeline.js — stav a mutace pro FosterFamilyTimelineTab.jsx
 * (docs/domain/timeline.md). Optimistické UI: nový záznam se objeví okamžitě
 * (`_status: 'saving'`), při selhání přejde do `'error'` a ZŮSTANE v seznamu
 * s textem zachovaným (§3/§4 specky) — žádné tiché zmizení.
 */

import { useCallback, useEffect, useState } from 'react';
import {
  listTimelineEntries, listPinnedTimelineEntries, createTimelineEntry,
  createTimelineCorrection, setTimelinePinned,
} from '../../services/orgService.js';
import { emptyEntryForm } from './timelineShared.js';

export default function useFamilyTimeline(familyId) {
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
  const [correctingEntry, setCorrectingEntry] = useState(null);
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
      setLoadError(err.message ?? 'Záznamy se nepodařilo načíst.');
    } finally {
      setLoading(false);
    }

    try {
      setPinned(await listPinnedTimelineEntries(familyId));
    } catch (err) {
      console.error('[useFamilyTimeline] Připnuté záznamy se nepodařilo načíst:', err);
      setPinned([]);
    }
  }, [familyId, typeFilter, childFilter]);

  useEffect(() => { loadFirstPage(); }, [loadFirstPage]);

  const loadMore = useCallback(async () => {
    const page = await listTimelineEntries(familyId, { type: typeFilter, childId: childFilter }, cursor);
    setEntries((prev) => [...prev, ...page.items]);
    setCursor(page.lastDoc);
    setHasMore(!!page.lastDoc);
  }, [familyId, typeFilter, childFilter, cursor]);

  function openAdd() {
    setCorrectingEntry(null);
    setForm(emptyEntryForm);
    setDialogOpen(true);
  }

  function openCorrection(entry) {
    setCorrectingEntry(entry);
    setForm({ ...emptyEntryForm, childIds: (entry.subjectRefs ?? []).map((r) => r.id) });
    setDialogOpen(true);
  }

  const performSubmit = useCallback(async (localId, correcting, payload) => {
    const subjectRefs = payload.childIds.map((id) => ({ kind: 'child', id }));
    try {
      if (correcting) {
        await createTimelineCorrection(familyId, correcting, {
          body: payload.body, occurredAt: new Date(payload.occurredAt), subjectRefs,
        });
      } else {
        await createTimelineEntry(familyId, {
          type: 'note', title: payload.title.trim() || 'Poznámka', body: payload.body,
          subjectRefs, occurredAt: new Date(payload.occurredAt), source: 'web',
        });
      }
      setPending((prev) => prev.filter((p) => p.id !== localId));
      await loadFirstPage();
    } catch (err) {
      setPending((prev) => prev.map((p) => (p.id === localId ? { ...p, _status: 'error', _error: err.message } : p)));
    }
  }, [familyId, loadFirstPage]);

  function submitEntry(payload) {
    const localId = `pending-${Date.now()}`;
    const optimistic = {
      id: localId,
      _pending: true,
      _status: 'saving',
      _correctingEntry: correctingEntry,
      _payload: payload,
      type: 'note',
      title: correctingEntry ? `Oprava: ${correctingEntry.title}` : (payload.title.trim() || 'Poznámka'),
      body: payload.body,
      occurredAt: new Date(payload.occurredAt),
      subjectRefs: payload.childIds.map((id) => ({ kind: 'child', id })),
      pinned: false,
    };
    setPending((prev) => [...prev, optimistic]);
    setDialogOpen(false);
    performSubmit(localId, correctingEntry, payload);
  }

  function retryPending(localId) {
    const item = pending.find((p) => p.id === localId);
    if (!item) return;
    setPending((prev) => prev.map((p) => (p.id === localId ? { ...p, _status: 'saving' } : p)));
    performSubmit(localId, item._correctingEntry, item._payload);
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
      setPinError(err.message ?? 'Připnutí se nezdařilo.');
    }
  }

  return {
    entries, pinned, pending, loading, hasMore, loadMore,
    typeFilter, setTypeFilter, childFilter, setChildFilter,
    dialogOpen, setDialogOpen, form, setForm, correctingEntry,
    openAdd, openCorrection, submitEntry, retryPending, discardPending, togglePin, pinError, loadError,
  };
}
