/**
 * FosterFamilyChildrenTab.jsx — záložka "Svěřené děti" vytažená z
 * FosterFamilyDetailPage.jsx, aby hlavní soubor zůstal pod 300 řádky (viz
 * CLAUDE.md). Čistě prezentační, veškerý state a Firebase volání drží rodič.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Baby, ChevronRight } from 'lucide-react';

import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';

function formatBirthDate(value) {
  if (!value) return '—';
  const date = typeof value.toDate === 'function' ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('cs-CZ');
}

export default function FosterFamilyChildrenTab({ childrenList, onAddChild, onOpenChild, canManage = true }) {
  const { t } = useTranslation();
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-ink-800">
          {t('family.detail.children.title', { count: childrenList.length })}
        </h2>
        {canManage && (
          <Button size="sm" variant="secondary" onClick={onAddChild}>
            <Baby size={16} strokeWidth={1.75} />
            {t('family.detail.children.addChild')}
          </Button>
        )}
      </div>

      {childrenList.length === 0 && (
        <p className="py-4 text-sm text-ink-500">{t('family.detail.children.empty')}</p>
      )}

      <div className="flex flex-col divide-y divide-border-subtle">
        {childrenList.map((child) => (
          <button
            key={child.id}
            type="button"
            onClick={() => onOpenChild(child.id)}
            className="flex items-center gap-3 py-3 text-left transition hover:bg-surface-muted active:scale-[0.99]"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-entity-family-bg text-entity-family-text">
              <Baby size={20} strokeWidth={1.75} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-ink-800">
                {`${child.firstName ?? ''} ${child.lastName ?? ''}`.trim() || t('family.detail.children.noName')}
              </p>
              <p className="truncate text-sm text-ink-500">
                {[child.rc && t('family.detail.children.rcPrefix', { rc: child.rc }), t('family.detail.children.birthDate', { date: formatBirthDate(child.birthDate) })]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </div>
            <Badge tone="neutral">{child.status ?? 'active'}</Badge>
            <ChevronRight size={18} strokeWidth={1.75} className="shrink-0 text-ink-400" />
          </button>
        ))}
      </div>
    </Card>
  );
}
