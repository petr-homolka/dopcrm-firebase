/**
 * MobileChildrenTab.jsx — záložka "Svěřené děti" v mobilním Detailu rodiny
 * (STRICT UI/UX DESIGN MANDATE, 2026-07-05). iOS grouped-list vzor, tap →
 * detail dítěte. Žádná sdílená JSX s desktop verzí.
 */

import React from 'react';
import { Baby } from 'lucide-react';
import { NativeGroupedList, NativeListRow } from '../../ui/NativeListRow.jsx';
import NativeButton from '../../ui/NativeButton.jsx';

function formatBirthDate(value) {
  if (!value) return '—';
  const date = typeof value.toDate === 'function' ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('cs-CZ');
}

export default function MobileChildrenTab({ childrenList, onOpenChild, onAddChild, canManage }) {
  return (
    <div className="flex flex-col gap-3 px-4 pb-6 pt-3">
      {childrenList.length === 0 && (
        <p className="py-6 text-center text-[15px] text-native-textMuted">Zatím žádné svěřené děti.</p>
      )}

      {childrenList.length > 0 && (
        <NativeGroupedList>
          {childrenList.map((child, i) => (
            <NativeListRow
              key={child.id}
              icon={Baby}
              iconBg="bg-native-primary"
              label={`${child.firstName ?? ''} ${child.lastName ?? ''}`.trim() || 'Bez jména'}
              trailing={<span className="text-[13px] text-native-textMuted">{formatBirthDate(child.birthDate)}</span>}
              onClick={() => onOpenChild(child.id)}
              isLast={i === childrenList.length - 1}
            />
          ))}
        </NativeGroupedList>
      )}

      {canManage && (
        <NativeButton variant="secondary" className="h-12" onClick={onAddChild}>
          Přidat dítě
        </NativeButton>
      )}
    </div>
  );
}
