/**
 * useTeamDashboard.js — data pro TeamDashboard.jsx (vedouci_pobocky/
 * teamleader): klíčové osoby VE SVÉ PODŘÍZENOSTI (ne celá organizace,
 * rozhodnutí 2026-07-03) a rodiny přidělené každé z nich.
 */

import { useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore.js';
import { listSubordinateKlicoveOsoby, listFostersAssignedTo } from '../../services/orgService.js';

export default function useTeamDashboard() {
  const { currentUser, organizationId } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [groups, setGroups] = useState([]); // [{ ko, families }]

  const load = useCallback(async () => {
    if (!organizationId || !currentUser?.uid) return;
    setLoading(true);
    setError('');
    try {
      const kos = await listSubordinateKlicoveOsoby(organizationId, currentUser.uid);
      const groupsData = await Promise.all(
        kos.map(async (ko) => ({ ko, families: await listFostersAssignedTo(ko.id, organizationId) }))
      );
      setGroups(groupsData);
    } catch (err) {
      console.error('[useTeamDashboard] Načtení selhalo:', err);
      setError(err.message ?? 'Tým se nepodařilo načíst.');
    } finally {
      setLoading(false);
    }
  }, [organizationId, currentUser?.uid]);

  useEffect(() => { load(); }, [load]);

  return { loading, error, groups };
}
