/**
 * OrganizationDetailPage.jsx — Krok 3 zadání, doplněno 2026-07-02
 *
 * SuperAdmin klikne na řádek organizace a dostane plný pohled na ni:
 * zaměstnance i pěstounské rodiny (a odtud dál na děti) — hierarchická
 * viditelnost "nadřazený vidí vše podřízené" dotažená až do UI, ne jen
 * v Firestore rules.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';

import { getOrganization } from '../../services/orgService.js';
import Badge from '../../components/ui/Badge.jsx';
import { cn } from '../../components/ui/cn.js';
import OrgEmployeesPanel from './OrgEmployeesPanel.jsx';
import FosterFamiliesPanel from './FosterFamiliesPanel.jsx';

const STATUS_TONE = { trial: 'warning', active: 'success', suspended: 'neutral', cancelled: 'error' };
const STATUS_LABEL = { trial: 'Zkušební doba', active: 'Aktivní', suspended: 'Pozastaveno', cancelled: 'Zrušeno' };

const TABS = [
  { value: 'rodiny', label: 'Pěstounské rodiny' },
  { value: 'zamestnanci', label: 'Zaměstnanci' },
];

export default function OrganizationDetailPage() {
  const { orgId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [org, setOrg] = useState(null);
  const [tab, setTab] = useState('rodiny');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getOrganization(orgId);
      if (!data) throw new Error('Organizace nenalezena.');
      setOrg(data);
    } catch (err) {
      console.error('[OrganizationDetailPage] getOrganization selhalo:', err);
      setError(err.message ?? 'Organizaci se nepodařilo načíst.');
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-start gap-3">
        <button
          type="button"
          onClick={() => navigate('/admin/superadmin')}
          aria-label="Zpět na organizace"
          className="mt-0.5 rounded-lg p-1.5 text-ink-500 hover:bg-surface-muted"
        >
          <ArrowLeft size={20} strokeWidth={1.75} />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="break-words text-xl font-semibold text-ink-800">
            {loading ? 'Načítám…' : (org?.name ?? 'Organizace')}
          </h1>
          {org?.ico && <p className="text-sm text-ink-500">IČO {org.ico}</p>}
        </div>
        {org && (
          <Badge tone={STATUS_TONE[org.status] ?? 'neutral'} className="mt-0.5">
            {STATUS_LABEL[org.status] ?? org.status}
          </Badge>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-16 text-ink-400">
          <Loader2 size={22} strokeWidth={1.75} className="animate-spin" />
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl bg-danger-50 px-4 py-3 text-sm text-danger-700">{error}</div>
      )}

      {!loading && !error && org && (
        <>
          <div className="mb-5 flex gap-1 overflow-x-auto border-b border-border-subtle">
            {TABS.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setTab(t.value)}
                className={cn(
                  'shrink-0 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition',
                  tab === t.value
                    ? 'border-brand-600 text-brand-700'
                    : 'border-transparent text-ink-500 hover:text-ink-700'
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
          {tab === 'rodiny' && <FosterFamiliesPanel organizationId={orgId} basePath="/admin/terenni" />}
          {tab === 'zamestnanci' && <OrgEmployeesPanel organizationId={orgId} />}
        </>
      )}
    </div>
  );
}
