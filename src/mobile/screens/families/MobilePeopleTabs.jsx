/**
 * MobilePeopleTabs.jsx — záložky „Pěstouni" a „Děti" na obrazovce Rodiny
 * (Lidl v4, 2026-07-06, bod 5: „Rodiny by mohla být titulní a další by bylo
 * Pěstouni a Děti"). Pěstouni se odvozují z `fosters[]` už načtených rodin
 * (žádný další dotaz), děti jedním org dotazem (listChildrenByOrg) —
 * u klíčové osoby se na klientu zúží na její rodiny (≤ 25 rodin, malé n).
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { User, ChevronRight, Baby } from 'lucide-react';
import Avatar from '../../../components/ui/Avatar.jsx';
import { cn } from '../../../components/ui/cn.js';
import { NativeEmptyState } from '../../ui/NativeBits.jsx';

function PersonRow({ title, subtitle, right, onClick, isLast }) {
  return (
    <button type="button" onClick={onClick} className="flex w-full items-center gap-3 pl-4 text-left active:bg-native-bg">
      <Avatar name={title} size="lg" tone="native" />
      <div className={cn('flex min-w-0 flex-1 items-center gap-2 py-3 pr-4', !isLast && 'border-b border-native-separator')}>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[17px] font-semibold text-native-text">{title}</p>
          {subtitle && <p className="truncate text-[13px] text-native-textMuted">{subtitle}</p>}
        </div>
        {right}
        <ChevronRight size={18} strokeWidth={2} className="shrink-0 text-native-textMuted" />
      </div>
    </button>
  );
}

export function FostersList({ fosters, onOpenFamily }) {
  const { t } = useTranslation();
  if (fosters.length === 0) {
    return (
      <div className="mx-4 mt-2">
        <NativeEmptyState icon={User} title={t('m.families.noFostersTitle', 'Žádní pěstouni')} description={t('m.families.noFostersDesc', 'Pěstouni se přidávají v detailu rodiny na záložce Pěstouni.')} />
      </div>
    );
  }
  return (
    <div className="mx-4 overflow-hidden rounded-native-card bg-native-surface">
      {fosters.map((p, i) => (
        <PersonRow
          key={`${p.familyId}-${p.id ?? p.name}`}
          title={p.name}
          subtitle={[p.familyName, p.phone].filter(Boolean).join(' · ')}
          onClick={() => onOpenFamily(p.familyId)}
          isLast={i === fosters.length - 1}
        />
      ))}
    </div>
  );
}

export function ChildrenList({ childrenList, familiesById, onOpenChild }) {
  const { t } = useTranslation();
  if (childrenList.length === 0) {
    return (
      <div className="mx-4 mt-2">
        <NativeEmptyState icon={Baby} title={t('m.families.noChildrenTitle', 'Žádné děti')} description={t('m.families.noChildrenDesc', 'Děti se přidávají v detailu rodiny na záložce Děti.')} />
      </div>
    );
  }
  return (
    <div className="mx-4 overflow-hidden rounded-native-card bg-native-surface">
      {childrenList.map((ch, i) => {
        const name = [ch.firstName, ch.lastName].filter(Boolean).join(' ') || t('m.families.noName', '(bez jména)');
        return (
          <PersonRow
            key={ch.id}
            title={name}
            subtitle={familiesById[ch.fosterFamilyId]?.name ?? ''}
            onClick={() => onOpenChild(ch)}
            isLast={i === childrenList.length - 1}
          />
        );
      })}
    </div>
  );
}
