/**
 * FosterFamilyFostersTab.jsx — záložka "Pěstouni" vytažená z FosterFamilyDetailPage.jsx,
 * aby hlavní soubor zůstal pod 300 řádky (viz CLAUDE.md). Čistě prezentační, veškerý
 * state a Firebase volání drží rodič a předává přes props.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { UserPlus, User, Plus, GraduationCap } from 'lucide-react';

import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import LoadMoreButton from '../../components/ui/LoadMoreButton.jsx';

export default function FosterFamilyFostersTab({
  fosters,
  fosterCourses,
  hasMoreCourses,
  onLoadMoreCourses,
  requiredHours,
  onAddFoster,
  onAddCourse,
  canManage = true,
}) {
  const { t } = useTranslation();
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-stone-800">{t('family.detail.fosters.title')}</h2>
        {canManage && (
          <Button size="sm" variant="secondary" onClick={onAddFoster}>
            <UserPlus size={16} strokeWidth={1.75} />
            {t('family.detail.fosters.addFoster')}
          </Button>
        )}
      </div>

      {fosters.length === 0 && (
        <p className="py-4 text-sm text-stone-500">{t('family.detail.fosters.empty')}</p>
      )}

      <div className="flex flex-col divide-y divide-stone-100">
        {fosters.map((foster, idx) => {
          const courses = (fosterCourses ?? []).filter((c) => c.personId === foster.id);
          const hours = courses.reduce((sum, c) => sum + (Number(c.hodiny) || 0), 0);
          const meetsHours = hours >= requiredHours;
          return (
            <div key={foster.id ?? idx} className={idx > 0 ? 'pt-4' : ''}>
              <div className="flex items-start gap-3 pb-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                  <User size={20} strokeWidth={1.75} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-stone-800">{foster.name}</p>
                  <p className="text-sm text-stone-500">
                    {[foster.rc && t('family.detail.fosters.rcPrefix', { rc: foster.rc }), foster.phone, foster.email].filter(Boolean).join(' · ') || '—'}
                  </p>
                  {(foster.addressPermanentText || foster.addressResidenceText) && (
                    <p className="mt-0.5 text-sm text-stone-500">
                      {foster.addressPermanentText && <>{t('family.detail.fosters.permanentAddress', { address: foster.addressPermanentText })} </>}
                      {foster.addressResidenceText && <>{t('family.detail.fosters.residenceAddress', { address: foster.addressResidenceText })}</>}
                    </p>
                  )}

                  <div className="mt-2.5 flex items-center gap-1.5">
                    <GraduationCap
                      size={16}
                      strokeWidth={1.75}
                      className={meetsHours ? 'text-green-700' : 'text-amber-700'}
                    />
                    <p className="text-sm text-stone-700">
                      {t('family.detail.fosters.educationLabel')} <b>{t('family.detail.fosters.hoursValue', { hours })}</b> / {t('family.detail.fosters.hoursOf12Months', { hours: requiredHours })}
                      {meetsHours ? t('family.detail.fosters.educationMet') : t('family.detail.fosters.educationBelowPlan')}
                    </p>
                  </div>

                  {courses.length > 0 && (
                    <ul className="mt-1.5 flex flex-col gap-1">
                      {courses.map((c) => (
                        <li key={c.id} className="text-sm text-stone-600">
                          <span className="font-medium text-stone-700">{c.kod}</span>
                          {[c.kde, c.kdy, c.forma, c.poradatel, t('family.detail.fosters.hoursValue', { hours: c.hodiny || 0 }), c.certifikat ? t('family.detail.fosters.certificateMark') : null]
                            .filter(Boolean)
                            .map((part) => ` · ${part}`)}
                        </li>
                      ))}
                    </ul>
                  )}

                  {canManage && (
                    <button
                      type="button"
                      onClick={() => onAddCourse(foster.id)}
                      disabled={!foster.id}
                      className="mt-2 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-medium text-primary-700 hover:bg-primary-50 disabled:opacity-50 disabled:pointer-events-none"
                    >
                      <Plus size={16} strokeWidth={1.75} />
                      {t('family.detail.fosters.addCourse')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {hasMoreCourses && (
        <div className="mt-2 border-t border-stone-100 pt-2">
          <LoadMoreButton onClick={onLoadMoreCourses} />
        </div>
      )}
    </Card>
  );
}
