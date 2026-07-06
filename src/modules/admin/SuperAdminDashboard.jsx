/**
 * SuperAdminDashboard.jsx — Krok 3 zadání (2026-07-01), redesign 2026-07-02
 *
 * Pohled SaaS poskytovatele: seznam všech organizací (tenantů) + formulář
 * pro založení nové organizace SPOLU s jejím prvním org_admin uživatelem
 * (typický onboarding nového platícího zákazníka).
 *
 * Bezpečnost: firestore.rules povolují organizations/users write jen roli
 * superadmin — chráněno i na klientovi přes RequireOrgRole (router.jsx).
 *
 * Testovací data (seed/wipe) VĚDOMĚ NEJSOU v této appce — viz
 * scripts/dev-seed.mjs. Dřívější pokus je zabalit do UI přes
 * `{import.meta.env.DEV && ...}` byl zrušen: ověřilo se, že Vite/Rollup
 * dynamický import() i tak zabalí do samostatného chunku v produkčním
 * `dist/`, i když se tlačítko nikdy nevykreslí — nesplňuje to zadání
 * "v ostrém provozu tam být nesmí". Skript mimo src/ je strukturálně
 * bezpečný: appka ho nikdy neimportuje, nemůže se dostat do buildu.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Landmark, ChevronRight } from 'lucide-react';

import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { listOrganizations, createOrganization, createEmployee } from '../../services/orgService.js';
import NewOrganizationModal from './NewOrganizationModal.jsx';

const STATUS_TONE = { trial: 'warning', active: 'success', suspended: 'neutral', cancelled: 'error' };
const STATUS_LABEL = { trial: 'Zkušební doba', active: 'Aktivní', suspended: 'Pozastaveno', cancelled: 'Zrušeno' };

function StatCard({ icon, label, value }) {
  return (
    <Card>
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        {icon}
      </div>
      <p className="mt-3 text-3xl font-semibold leading-none text-ink-800 tabular-nums">{value}</p>
      <p className="mt-1.5 text-xs font-semibold uppercase tracking-wide text-ink-400">{label}</p>
    </Card>
  );
}

const emptyForm = {
  orgName: '',
  orgIco: '',
  adminName: '',
  adminEmail: '',
  adminPassword: '',
};

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orgs, setOrgs] = useState([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setOrgs(await listOrganizations());
    } catch (err) {
      console.error('[SuperAdminDashboard] listOrganizations selhalo:', err);
      setError(err.message ?? 'Organizace se nepodařilo načíst.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function updateForm(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleCreateOrg(e) {
    e.preventDefault();
    setSubmitError('');
    if (!form.orgName.trim() || !form.adminName.trim() || !form.adminEmail.trim() || form.adminPassword.length < 6) {
      setSubmitError('Vyplňte všechna pole. Heslo musí mít alespoň 6 znaků.');
      return;
    }
    setSubmitting(true);
    try {
      // 1) Založí organizaci (tenant), 2) v ní prvního org_admina — atomicita
      // řešena jen na úrovni UX (obě operace navazují), rules to hlídají odděleně.
      const orgId = await createOrganization({ name: form.orgName.trim(), ico: form.orgIco.trim(), status: 'trial' });
      await createEmployee({
        email: form.adminEmail.trim(),
        password: form.adminPassword,
        displayName: form.adminName.trim(),
        role: 'org_admin',
        organizationId: orgId,
        department: 'management',
      });
      setDialogOpen(false);
      setForm(emptyForm);
      await load();
    } catch (err) {
      console.error('[SuperAdminDashboard] Založení organizace selhalo:', err);
      setSubmitError(err.message ?? 'Založení se nezdařilo.');
    } finally {
      setSubmitting(false);
    }
  }

  const activeCount = orgs.filter((o) => o.status === 'active').length;
  const trialCount = orgs.filter((o) => o.status === 'trial').length;
  const hasOrgs = orgs.length > 0;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-ink-800 sm:text-xl">SuperAdmin</h1>
          <p className="mt-0.5 text-sm text-ink-500">Správa doprovázejících organizací (tenantů) a jejich předplatného.</p>
        </div>
        {hasOrgs && (
          <Button size="lg" onClick={() => setDialogOpen(true)}>
            <Building2 size={18} strokeWidth={1.75} />
            Nová organizace
          </Button>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-3 py-16 text-sm text-ink-500">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-border-default border-t-brand-600" />
          Načítám organizace…
        </div>
      )}

      {!loading && error && (
        <div className="mb-6 rounded-xl bg-danger-50 px-4 py-3 text-sm text-danger-700">{error}</div>
      )}

      {!loading && !error && !hasOrgs && (
        <Card>
          <EmptyState
            icon={<Landmark size={28} strokeWidth={1.75} />}
            title="Zatím žádné organizace"
            description="Doprovázející organizace (tenanti) jsou platící zákazníci systému. Založte první a rovnou i jejího administrátora — ten si pak sám přidá zaměstnance."
            action={
              <Button size="lg" onClick={() => setDialogOpen(true)}>
                <Building2 size={18} strokeWidth={1.75} />
                Založit první organizaci
              </Button>
            }
          />
        </Card>
      )}

      {!loading && !error && hasOrgs && (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard icon={<Building2 size={20} strokeWidth={1.75} />} label="Organizací celkem" value={orgs.length} />
            <StatCard icon={<Building2 size={20} strokeWidth={1.75} />} label="Aktivní předplatné" value={activeCount} />
            <StatCard icon={<Building2 size={20} strokeWidth={1.75} />} label="Ve zkušební době" value={trialCount} />
          </div>

          <Card>
            <h2 className="text-base font-semibold text-ink-800">Organizace</h2>
            <p className="mb-3 mt-0.5 text-sm text-ink-500">
              Klikněte na řádek pro pěstounské rodiny a zaměstnance dané organizace.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                    <th className="py-2 pr-3 font-semibold">Název</th>
                    <th className="py-2 pr-3 font-semibold">IČO</th>
                    <th className="py-2 pr-3 font-semibold">Plán</th>
                    <th className="py-2 pr-3 font-semibold">Stav předplatného</th>
                    <th className="py-2 pr-3 font-semibold">ID</th>
                    <th className="py-2" />
                  </tr>
                </thead>
                <tbody>
                  {orgs.map((org) => (
                    <tr
                      key={org.id}
                      onClick={() => navigate(`/admin/superadmin/organizace/${org.id}`)}
                      className="cursor-pointer border-t border-border-subtle transition duration-150 hover:bg-surface-muted"
                    >
                      <td className="py-3 pr-3 font-medium text-ink-800">{org.name}</td>
                      <td className="py-3 pr-3 text-ink-500">{org.ico || '—'}</td>
                      <td className="py-3 pr-3 capitalize text-ink-600">{org.plan ?? '—'}</td>
                      <td className="py-3 pr-3">
                        <Badge tone={STATUS_TONE[org.status] ?? 'neutral'}>{STATUS_LABEL[org.status] ?? org.status}</Badge>
                      </td>
                      <td className="py-3 pr-3 font-mono text-xs text-ink-400">{org.id}</td>
                      <td className="py-3 text-right text-ink-300">
                        <ChevronRight size={18} strokeWidth={1.75} className="ml-auto" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {dialogOpen && (
        <NewOrganizationModal
          form={form}
          submitting={submitting}
          submitError={submitError}
          onChange={updateForm}
          onClose={() => !submitting && setDialogOpen(false)}
          onSubmit={handleCreateOrg}
        />
      )}
    </div>
  );
}
