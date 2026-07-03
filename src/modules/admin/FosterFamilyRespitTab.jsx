/**
 * FosterFamilyRespitTab.jsx — záložka "Respit a SPVPP" vytažená z
 * FosterFamilyDetailPage.jsx, aby hlavní soubor zůstal pod 300 řádky (viz
 * CLAUDE.md). Čistě prezentační, veškerý state a Firebase volání drží rodič.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';

import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import LoadMoreButton from '../../components/ui/LoadMoreButton.jsx';
import { respitTypeLabel, respitEventDays } from '../../shared/domainConstants.js';

function StatCard({ label, value, sub, tone = 'primary' }) {
  const toneClass = {
    primary: 'text-primary-600',
    success: 'text-green-700',
    warning: 'text-amber-700',
    error: 'text-red-700',
    neutral: 'text-stone-600',
  }[tone];
  return (
    <Card>
      <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">{label}</p>
      <p className={`mt-1 text-2xl font-semibold leading-tight ${toneClass}`}>{value}</p>
      {sub && <p className="mt-0.5 text-sm text-stone-500">{sub}</p>}
    </Card>
  );
}

export default function FosterFamilyRespitTab({
  vykazano,
  limit,
  realny,
  eligible,
  odmenaStatus,
  nadstandardInput,
  onNadstandardChange,
  onSaveNadstandard,
  respitEvents,
  hasMoreRespit,
  onLoadMoreRespit,
  childrenList,
  onAddRespit,
  canManage = true,
}) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label={t('family.detail.respit.stats.reportedLabel')}
          value={t('family.detail.respit.stats.reportedValue', { vykazano, limit })}
          sub={t('family.detail.respit.stats.reportedSub')}
          tone={vykazano > limit ? 'error' : 'primary'}
        />
        <StatCard
          label={t('family.detail.respit.stats.realLabel')}
          value={t('family.detail.respit.stats.realValue', { realny })}
          sub={t('family.detail.respit.stats.realSub')}
          tone={realny < vykazano ? 'warning' : 'success'}
        />
        <StatCard
          label={t('family.detail.respit.stats.rewardLabel')}
          value={eligible ? t('family.detail.respit.stats.eligible') : t('family.detail.respit.stats.notEligible')}
          sub={odmenaStatus}
          tone={eligible ? 'success' : 'neutral'}
        />
      </div>

      <Card>
        <p className="mb-4 text-sm text-stone-500">
          {t('family.detail.respit.legalNote')}
        </p>

        {canManage && (
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-stone-700">
                {t('family.detail.respit.nadstandardLabel')}
              </label>
              <input
                type="number"
                value={nadstandardInput}
                onChange={(e) => onNadstandardChange(e.target.value)}
                className="w-40 rounded-xl bg-stone-100 px-3.5 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>
            <Button variant="secondary" size="sm" onClick={onSaveNadstandard} className="mt-6">
              {t('common.save')}
            </Button>
            <div className="flex-1" />
            <Button variant="primary" size="sm" onClick={onAddRespit} className="mt-6">
              <Sparkles size={16} strokeWidth={1.75} />
              {t('family.detail.respit.recordUsage')}
            </Button>
          </div>
        )}

        <div className="flex flex-col divide-y divide-stone-100">
          {respitEvents.length === 0 && (
            <p className="py-3 text-sm text-stone-500">{t('family.detail.respit.empty')}</p>
          )}
          {respitEvents.map((ev) => {
            const days = respitEventDays(ev);
            return (
              <div key={ev.id} className="py-2.5">
                <p className="text-sm font-medium text-stone-800">
                  {respitTypeLabel(ev.typ)} — {t('family.detail.respit.daysCount', { count: days })}
                </p>
                <p className="text-sm text-stone-500">
                  {[
                    ev.from === ev.to ? ev.from : `${ev.from} – ${ev.to}`,
                    ev.childIds?.length ? t('family.detail.respit.childrenCount', { count: ev.childIds.length }) : null,
                    ev.kc ? t('family.detail.respit.amountKc', { amount: ev.kc }) : null,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </div>
            );
          })}
        </div>
        {hasMoreRespit && <LoadMoreButton onClick={onLoadMoreRespit} />}
      </Card>

      <Card>
        <h2 className="mb-4 text-base font-semibold text-stone-800">
          {t('family.detail.respit.spvppTitle')}
        </h2>
        {childrenList.length === 0 && (
          <p className="text-sm text-stone-500">{t('family.detail.respit.spvppEmpty')}</p>
        )}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {childrenList.map((child) => {
            const wallet = child.spvpp ?? { rozpocet: 48000, vycerpano: 0 };
            const zustatek = wallet.rozpocet - wallet.vycerpano;
            return (
              <div key={child.id} className="rounded-xl bg-stone-50 p-4">
                <p className="font-semibold text-stone-800">
                  {child.firstName} {child.lastName}
                </p>
                <p className="text-sm text-stone-500">
                  {t('family.detail.respit.spvppSpent', {
                    spent: wallet.vycerpano.toLocaleString('cs-CZ'),
                    total: wallet.rozpocet.toLocaleString('cs-CZ'),
                  })}
                </p>
                <p className={`text-sm font-semibold ${zustatek < 0 ? 'text-red-700' : 'text-green-700'}`}>
                  {t('family.detail.respit.spvppBalance', { balance: zustatek.toLocaleString('cs-CZ') })}
                </p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
