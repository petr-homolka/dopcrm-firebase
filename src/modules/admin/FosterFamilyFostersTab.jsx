/**
 * FosterFamilyFostersTab.jsx — záložka "Pěstouni" vytažená z FosterFamilyDetailPage.jsx,
 * aby hlavní soubor zůstal pod 300 řádky (viz CLAUDE.md). Čistě prezentační, veškerý
 * state a Firebase volání drží rodič a předává přes props.
 */

import React from 'react';
import { UserPlus, User, Plus, GraduationCap } from 'lucide-react';

import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';

export default function FosterFamilyFostersTab({ fosters, requiredHours, onAddFoster, onAddCourse }) {
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-stone-800">Pěstouni v domácnosti</h2>
        <Button size="sm" variant="secondary" onClick={onAddFoster}>
          <UserPlus size={16} strokeWidth={1.75} />
          Přidat pěstouna
        </Button>
      </div>

      {fosters.length === 0 && (
        <p className="py-4 text-sm text-stone-500">Zatím žádný pěstoun v evidenci.</p>
      )}

      <div className="flex flex-col divide-y divide-stone-100">
        {fosters.map((foster, idx) => {
          const hours = (foster.courses ?? []).reduce((sum, c) => sum + (Number(c.hodiny) || 0), 0);
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
                    {[foster.rc && `RČ ${foster.rc}`, foster.phone, foster.email].filter(Boolean).join(' · ') || '—'}
                  </p>
                  {(foster.addressPermanentText || foster.addressResidenceText) && (
                    <p className="mt-0.5 text-sm text-stone-500">
                      {foster.addressPermanentText && <>Trvalé bydliště: {foster.addressPermanentText}. </>}
                      {foster.addressResidenceText && <>Adresa pobytu: {foster.addressResidenceText}.</>}
                    </p>
                  )}

                  <div className="mt-2.5 flex items-center gap-1.5">
                    <GraduationCap
                      size={16}
                      strokeWidth={1.75}
                      className={meetsHours ? 'text-green-700' : 'text-amber-700'}
                    />
                    <p className="text-sm text-stone-700">
                      Vzdělávání: <b>{hours} h</b> / {requiredHours} h za posledních 12 měsíců
                      {meetsHours ? ' — splněno' : ' — pod plánem'}
                    </p>
                  </div>

                  {(foster.courses ?? []).length > 0 && (
                    <ul className="mt-1.5 flex flex-col gap-1">
                      {(foster.courses ?? []).map((c) => (
                        <li key={c.id} className="text-sm text-stone-600">
                          <span className="font-medium text-stone-700">{c.kod}</span>
                          {[c.kde, c.kdy, c.forma, c.poradatel, `${c.hodiny || 0} h`, c.certifikat ? 'certifikát ✓' : null]
                            .filter(Boolean)
                            .map((part) => ` · ${part}`)}
                        </li>
                      ))}
                    </ul>
                  )}

                  <button
                    type="button"
                    onClick={() => onAddCourse(foster.id)}
                    disabled={!foster.id}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-medium text-primary-700 hover:bg-primary-50 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <Plus size={16} strokeWidth={1.75} />
                    Zapsat kurz
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
