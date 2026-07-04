/**
 * KlicovaOsobaDashboard.jsx — Krok 3 zadání (2026-07-01), redesign Krok 3b
 * (DESIGN.md §5.6/§6.2, 2026-07-04).
 *
 * Terénní pohled klíčové osoby: výchozí záložka "Moje rodiny" (tabulka rodin
 * přidělených jí, assignedTo == její uid — jediné, do čeho smí zapisovat).
 * Záložka "Celá organizace" navíc ukazuje hierarchickou viditelnost — čtení
 * všech rodin organizace (zastupitelnost, přehled), firestore.rules to KO
 * povolují, jen zápis mají omezený na svoje.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Loader2 } from 'lucide-react';

import { useAuthStore } from '../../store/authStore.js';
import { listFostersAssignedTo } from '../../services/orgService.js';
import { careLabel } from '../../shared/domainConstants.js';
import Card from '../../components/ui/Card.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Tabs from '../../components/ui/Tabs.jsx';
import { Table, TableHead, Th, TableBody, Tr, Td } from '../../components/ui/Table.jsx';
import FosterFamiliesPanel from './FosterFamiliesPanel.jsx';
import FamilyListRow from './FamilyListRow.jsx';

const STATUS_LABELS = { active: 'Aktivní', paused: 'Pozastaveno', exited: 'Ukončeno' };
const STATUS_TONE = { active: 'success', paused: 'warning', exited: 'neutral' };

const TABS = [
  { value: 'moje', label: 'Moje rodiny' },
  { value: 'organizace', label: 'Celá organizace' },
];

function toDate(value) {
  if (!value) return null;
  if (typeof value.toDate === 'function') return value.toDate();
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function MyFamilies() {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [families, setFamilies] = useState([]);

  const load = useCallback(async () => {
    if (!currentUser?.uid) return;
    setLoading(true);
    setError('');
    try {
      setFamilies(await listFostersAssignedTo(currentUser.uid));
    } catch (err) {
      console.error('[KlicovaOsobaDashboard] listFostersAssignedTo selhalo:', err);
      setError(err.message ?? 'Rodiny se nepodařilo načíst.');
    } finally {
      setLoading(false);
    }
  }, [currentUser?.uid]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-12">
        <Loader2 size={24} strokeWidth={1.75} className="animate-spin text-brand-600" />
      </div>
    );
  }
  if (error) {
    return <div className="rounded-xl bg-danger-50 px-4 py-3 text-sm text-danger-700">{error}</div>;
  }
  if (families.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={<Home size={28} strokeWidth={1.75} />}
          title="Zatím nemáte přidělené žádné rodiny"
          description="Přiřazení pěstounských rodin ke klíčovým osobám řeší Org. Admin vaší organizace."
        />
      </Card>
    );
  }
  return (
    <>
      <div className="hidden lg:block">
        <Table>
          <TableHead>
            <Th>Rodina</Th>
            <Th>Typ</Th>
            <Th>Poslední návštěva</Th>
            <Th>Status</Th>
          </TableHead>
          <TableBody>
            {families.map((family) => (
              <Tr key={family.id} onClick={() => navigate(`/admin/terenni/${family.id}`)} className="cursor-pointer">
                <Td>
                  <div className="flex items-center gap-3">
                    <Avatar name={family.name} size="md" />
                    <span className="font-medium text-ink-800">{family.name || '(bez jména)'}</span>
                  </div>
                </Td>
                <Td><Badge tone="family">{careLabel(family.careType)}</Badge></Td>
                <Td className="text-ink-500">{toDate(family.lastVisitAt)?.toLocaleDateString('cs-CZ') ?? '—'}</Td>
                <Td><Badge tone={STATUS_TONE[family.status] ?? 'neutral'}>{STATUS_LABELS[family.status] ?? family.status}</Badge></Td>
              </Tr>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="rounded-2xl border border-border-subtle bg-white px-4 lg:hidden">
        {families.map((family) => (
          <FamilyListRow
            key={family.id}
            family={family}
            careLabel={`${careLabel(family.careType)} · ${toDate(family.lastVisitAt)?.toLocaleDateString('cs-CZ') ?? '—'}`}
            statusLabel={STATUS_LABELS[family.status] ?? family.status}
            statusTone={STATUS_TONE[family.status] ?? 'neutral'}
            onClick={() => navigate(`/admin/terenni/${family.id}`)}
          />
        ))}
      </div>
    </>
  );
}

export default function KlicovaOsobaDashboard() {
  const { organizationId } = useAuthStore();
  const [tab, setTab] = useState('moje');

  return (
    <div>
      <h1 className="mb-6 text-[28px] font-bold text-ink-900">Terén</h1>

      <div className="mb-6">
        <Tabs items={TABS} value={tab} onChange={setTab} />
      </div>

      {tab === 'moje' && <MyFamilies />}
      {tab === 'organizace' && <FosterFamiliesPanel organizationId={organizationId} basePath="/admin/terenni" canCreate={false} />}
    </div>
  );
}
