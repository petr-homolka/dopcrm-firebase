/**
 * RecentFamiliesTable.jsx — tabulka nejnovějších rodin pro DashboardPage.
 *
 * Extrahováno z DashboardPage.jsx, aby hlavní soubor zůstal pod 300 řádků
 * (CLAUDE.md — tvrdý limit velikosti souborů). Tabulka dle DESIGN.md §9:
 * bez svislých čar, řádky oddělené jen paddingem a hover pozadím.
 */

import React from 'react';
import Card from '../../components/ui/Card.jsx';
import Badge from '../../components/ui/Badge.jsx';

function formatDate(value) {
  if (!value) return '—';
  // Firestore Timestamp má metodu toDate(); jinak zkusíme rovnou Date/string.
  const date = typeof value.toDate === 'function' ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('cs-CZ');
}

export default function RecentFamiliesTable({ families }) {
  return (
    <Card className="col-span-1 sm:col-span-2">
      <h2 className="mb-4 text-base font-semibold text-stone-800">Nejnovější rodiny</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-stone-400">
              <th className="py-2 font-medium">Jméno</th>
              <th className="py-2 font-medium">Stav</th>
              <th className="py-2 font-medium">Vytvořeno</th>
            </tr>
          </thead>
          <tbody>
            {families.length === 0 && (
              <tr>
                <td colSpan={3} className="py-8 text-center text-stone-500">
                  Žádné rodiny k zobrazení.
                </td>
              </tr>
            )}
            {families.map((family) => (
              <tr key={family.id} className="hover:bg-stone-50">
                <td className="py-3 text-stone-800">{family.name ?? '(bez jména)'}</td>
                <td className="py-3">
                  <Badge tone={family.status === 'active' ? 'success' : 'neutral'}>
                    {family.status ?? 'neznámý'}
                  </Badge>
                </td>
                <td className="py-3 tabular-nums text-stone-500">{formatDate(family.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
