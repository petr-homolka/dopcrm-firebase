/**
 * KlicovaOsobaDashboard.jsx — Krok 3 zadání (2026-07-01), obohaceno 2026-07-02
 *
 * Terénní pohled klíčové osoby: výchozí záložka "Moje rodiny" (Bento Grid
 * karty rodin přidělených jí, assignedTo == její uid — jediné, do čeho smí
 * zapisovat). Záložka "Celá organizace" navíc ukazuje hierarchickou
 * viditelnost — čtení všech rodin organizace (zastupitelnost, přehled),
 * firestore.rules to KO povolují, jen zápis mají omezený na svoje.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Phone, MapPin, Loader2 } from 'lucide-react';

import { useAuthStore } from '../../store/authStore.js';
import { listFostersAssignedTo } from '../../services/orgService.js';
import Card from '../../components/ui/Card.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { cn } from '../../components/ui/cn.js';
import FosterFamiliesPanel from './FosterFamiliesPanel.jsx';

const STATUS_LABELS = { active: 'Aktivní', paused: 'Pozastaveno', exited: 'Ukončeno' };
const STATUS_TONE = { active: 'success', paused: 'warning', exited: 'neutral' };

const TABS = [
  { value: 'moje', label: 'Moje rodiny' },
  { value: 'organizace', label: 'Celá organizace' },
];

function FamilyCard({ family, onClick }) {
  return (
    <button type="button" onClick={onClick} className="text-left">
      <Card className="flex h-full flex-col gap-3 transition duration-150 hover:shadow-lg active:scale-[0.98]">
        <div className="flex items-center gap-3">
          <Avatar name={family.name} size="md" />
          <div className="min-w-0">
            <p className="truncate font-semibold text-stone-800">{family.name || '(bez jména)'}</p>
            <Badge tone={STATUS_TONE[family.status] ?? 'neutral'} className="mt-1">
              {STATUS_LABELS[family.status] ?? family.status}
            </Badge>
          </div>
        </div>
        {family.address && (
          <div className="flex items-center gap-2 text-stone-500">
            <MapPin size={16} strokeWidth={1.75} className="shrink-0" />
            <span className="truncate text-sm">{family.address}</span>
          </div>
        )}
        {family.contactPhone && (
          <div className="flex items-center gap-2 text-stone-500">
            <Phone size={16} strokeWidth={1.75} className="shrink-0" />
            <span className="text-sm">{family.contactPhone}</span>
          </div>
        )}
      </Card>
    </button>
  );
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
        <Loader2 size={24} strokeWidth={1.75} className="animate-spin text-primary-600" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
    );
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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
      {families.map((family) => (
        <FamilyCard key={family.id} family={family} onClick={() => navigate(`/admin/terenni/${family.id}`)} />
      ))}
    </div>
  );
}

export default function KlicovaOsobaDashboard() {
  const { organizationId } = useAuthStore();
  const [tab, setTab] = useState('moje');

  return (
    <div>
      <h1 className="mb-6 text-lg font-semibold text-stone-800 sm:text-xl">Terén</h1>

      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-stone-100">
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTab(t.value)}
            className={cn(
              'shrink-0 border-b-2 px-3 py-2.5 text-sm font-medium transition',
              tab === t.value
                ? 'border-primary-600 text-primary-700'
                : 'border-transparent text-stone-500 hover:text-stone-700'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'moje' && <MyFamilies />}
      {tab === 'organizace' && <FosterFamiliesPanel organizationId={organizationId} basePath="/admin/terenni" canCreate={false} />}
    </div>
  );
}
