/**
 * useChildDetailLists.js — stránkované podkolekce karty dítěte (historie,
 * trvalé poznámky, předchozí pěstouni, rozsudky). Vytaženo z ChildDetailPage.jsx,
 * aby zůstalo pod 300 řádky (CLAUDE.md). Audit nálezu #7 (docs/INVENTAR.md §11):
 * každý seznam čte po stránkách (SUBCOLLECTION_PAGE_SIZE), `cursor` = poslední
 * načtený dokument, `null` = žádná další stránka.
 */

import { useCallback, useState } from 'react';
import {
  listChildHistory, listPermanentNotes, listPreviousFosters, listCourtVerdicts,
} from '../../services/orgService.js';

const FETCHERS = {
  history: listChildHistory,
  notes: listPermanentNotes,
  previousFosters: listPreviousFosters,
  courtVerdicts: listCourtVerdicts,
};

const EMPTY_LISTS = {
  history: { items: [], cursor: null },
  notes: { items: [], cursor: null },
  previousFosters: { items: [], cursor: null },
  courtVerdicts: { items: [], cursor: null },
};

export function useChildDetailLists(childId) {
  const [lists, setLists] = useState(EMPTY_LISTS);

  const loadAll = useCallback(async () => {
    const entries = await Promise.all(
      Object.entries(FETCHERS).map(async ([key, fetcher]) => [key, await fetcher(childId)])
    );
    const next = {};
    entries.forEach(([key, { items, lastDoc }]) => { next[key] = { items, cursor: lastDoc }; });
    setLists(next);
  }, [childId]);

  const loadMore = useCallback(async (key) => {
    const current = lists[key];
    if (!current?.cursor) return;
    const { items, lastDoc } = await FETCHERS[key](childId, current.cursor);
    setLists((prev) => ({ ...prev, [key]: { items: [...prev[key].items, ...items], cursor: lastDoc } }));
  }, [childId, lists]);

  return { lists, loadAll, loadMore };
}
