/**
 * FamilyListRow.jsx — mobilní list-row pro seznam rodin (DESIGN.md §11.3),
 * náhrada horizontálně scrollovatelné `Table` na mobilu (<lg). Sdíleno mezi
 * `FosterFamiliesPanel.jsx` a `KlicovaOsobaDashboard.jsx`, aby oba seznamy
 * rodin vypadaly na mobilu stejně. Status label/tone si počítá volající —
 * obě místa mají vlastní (drobně odlišný) STATUS_LABEL/STATUS_TONE mapping.
 */

import React from 'react';
import Avatar from '../../components/ui/Avatar.jsx';
import Badge from '../../components/ui/Badge.jsx';

export default function FamilyListRow({ family, careLabel, statusLabel, statusTone, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 border-b border-border-subtle py-3 text-left last:border-b-0"
    >
      <Avatar name={family.name} size="lg" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink-800">{family.name || '(bez jména)'}</p>
        <p className="truncate text-xs text-ink-500">{careLabel}</p>
      </div>
      <Badge tone={statusTone}>{statusLabel}</Badge>
    </button>
  );
}
