/**
 * TeamDashboard.jsx — dashboard pro vedouci_pobocky/teamleader (2026-07-03),
 * Krok 3e redesignu (DESIGN.md §6.6). Analogický KlicovaOsobaDashboard, ale
 * seskupený podle KLÍČOVÝCH OSOB ve své podřízenosti (řetěz `nadrizeny`, viz
 * useTeamDashboard.js) — NE celá organizace. Čistě ke čtení: žádné zápisové
 * akce (firestore.rules to vynucují, karta rodiny/dítěte pak sama skrývá
 * zápisové tlačítko podle `isReadOnlyManager(role)`).
 *
 * DESIGN.md §6.6 popisuje plný 3×2 KPI grid (trendy, průměrná doba do
 * reportu, nevydané dokumenty, vzdělávání progress ring, krizové intervence)
 * + bar chart vytížení koordinátorek + activity feed milníků. Nic z toho
 * nemá oporu v datovém modelu (žádné trendy/časové metriky/krizové
 * intervence se nikde neukládají) — VĚDOMĚ NEIMPLEMENTOVÁNO, viz
 * docs/INVENTAR.md. Místo fiktivních čísel jen dva reálné, z už načtených
 * dat odvozené souhrny (žádný extra dotaz).
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Loader2, ChevronRight, Home } from 'lucide-react';

import Card from '../../components/ui/Card.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { careLabel } from '../../shared/domainConstants.js';
import useTeamDashboard from './useTeamDashboard.js';

const STATUS_LABEL = { active: 'Aktivní', paused: 'Pozastaveno', exited: 'Ukončeno' };
const STATUS_TONE = { active: 'success', paused: 'warning', exited: 'neutral' };

function familyCountLabel(n) {
  if (n === 1) return '1 rodina';
  if (n >= 2 && n <= 4) return `${n} rodiny`;
  return `${n} rodin`;
}

function lastUpdated(families) {
  const dates = families.map((f) => f.updatedAt?.toDate?.()).filter(Boolean);
  if (dates.length === 0) return null;
  return new Date(Math.max(...dates.map((d) => d.getTime())));
}

function TeamStatCard({ icon: Icon, label, value }) {
  return (
    <Card className="flex items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
        <Icon size={20} strokeWidth={1.75} />
      </span>
      <div className="min-w-0">
        <p className="text-2xl font-semibold leading-tight text-ink-900">{value}</p>
        <p className="text-xs text-ink-500">{label}</p>
      </div>
    </Card>
  );
}

export default function TeamDashboard() {
  const navigate = useNavigate();
  const { loading, error, groups } = useTeamDashboard();
  const totalFamilies = groups.reduce((sum, g) => sum + g.families.length, 0);

  return (
    <div>
      <h1 className="mb-1 text-[28px] font-bold leading-tight text-ink-900">Můj tým</h1>
      <p className="mb-6 text-sm text-ink-500">
        Rodiny klíčových osob ve vaší podřízenosti — jen ke čtení.
      </p>

      {!loading && !error && groups.length > 0 && (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TeamStatCard icon={Users} label="Klíčové osoby v podřízenosti" value={groups.length} />
          <TeamStatCard icon={Home} label="Rodiny v týmu" value={totalFamilies} />
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center gap-2 py-12 text-ink-500">
          <Loader2 size={20} strokeWidth={1.75} className="animate-spin" />
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl bg-danger-50 px-4 py-3 text-sm text-danger-700">{error}</div>
      )}

      {!loading && !error && groups.length === 0 && (
        <Card>
          <EmptyState
            icon={<Users size={28} strokeWidth={1.75} />}
            title="Nemáte žádné podřízené klíčové osoby"
            description="Přiřazení klíčové osoby do vaší podřízenosti (pole „nadřízený“ na kartě zaměstnance) řeší Org. Admin v sekci Zaměstnanci."
          />
        </Card>
      )}

      {!loading && !error && groups.map(({ ko, families }) => {
        const last = lastUpdated(families);
        return (
          <div key={ko.id} className="mb-6">
            <div className="mb-2 flex items-center gap-3">
              <Avatar name={ko.displayName} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink-800">{ko.displayName}</p>
                <p className="text-xs text-ink-500">
                  {familyCountLabel(families.length)}
                  {last && ` · poslední aktivita ${last.toLocaleDateString('cs-CZ')}`}
                </p>
              </div>
            </div>

            {families.length === 0 ? (
              <p className="pl-11 text-sm text-ink-400">Zatím nemá přiřazené žádné rodiny.</p>
            ) : (
              <div className="space-y-2 sm:pl-11">
                {families.map((family) => (
                  <Card
                    key={family.id}
                    onClick={() => navigate(`/admin/terenni/${family.id}`)}
                    className="flex cursor-pointer items-center gap-3 transition hover:bg-surface-muted active:scale-[0.99]"
                  >
                    <Avatar name={family.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink-800">{family.name}</p>
                      <p className="truncate text-xs text-ink-500">{careLabel(family.careType)}</p>
                    </div>
                    <Badge tone={STATUS_TONE[family.status] ?? 'neutral'}>
                      {STATUS_LABEL[family.status] ?? family.status}
                    </Badge>
                    <ChevronRight size={16} strokeWidth={1.75} className="shrink-0 text-ink-400" />
                  </Card>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
