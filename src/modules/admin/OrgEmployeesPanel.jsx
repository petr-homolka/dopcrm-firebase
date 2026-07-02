/**
 * OrgEmployeesPanel.jsx — sdílený pohled na zaměstnance jedné organizace
 * (2026-07-02, plná hierarchie: zástupce → vedoucí pobočky → teamleader →
 * klíčová osoba → asistent KO; + zaměstnanec bez řídicí role)
 *
 * Vytaženo z OrgAdminDashboard.jsx, aby stejný pohled mohl superadmin otevřít
 * i pro CIZÍ organizaci (klik na řádek v SuperAdminDashboard tabulce →
 * OrganizationDetailPage). Oprávnění řeší firestore.rules (superadmin má
 * vždy plný přístup, org_admin jen ke své organizaci).
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Loader2, UserPlus, Users, UserCheck, UserX } from 'lucide-react';

import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { EMPLOYEE_ROLES, employeeRoleLabel } from '../../shared/domainConstants.js';
import { listUsersByOrg, createEmployee, setUserActive } from '../../services/orgService.js';
import EmployeeFormModal from './EmployeeFormModal.jsx';

const CREATABLE_ROLES = EMPLOYEE_ROLES; // org_admin smí založit kohokoli až po sebe, viz firestore.rules

function StatCard({ icon, label, value }) {
  return (
    <Card>
      <div className="flex flex-col gap-1">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
          {icon}
        </div>
        <p className="mt-1 text-3xl font-semibold leading-tight text-stone-800 tabular-nums">{value}</p>
        <p className="text-xs font-medium uppercase tracking-wide text-stone-400">{label}</p>
      </div>
    </Card>
  );
}

const emptyForm = { name: '', email: '', password: '', role: 'klicova_osoba', rc: '', funkce: '', phone: '', nadrizeny: '' };

export default function OrgEmployeesPanel({ organizationId }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const load = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    setError('');
    try {
      setUsers(await listUsersByOrg(organizationId));
    } catch (err) {
      console.error('[OrgEmployeesPanel] listUsersByOrg selhalo:', err);
      setError(err.message ?? 'Zaměstnance se nepodařilo načíst.');
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => { load(); }, [load]);

  function updateForm(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleCreateEmployee(e) {
    e.preventDefault();
    setSubmitError('');
    if (!form.name.trim() || !form.email.trim() || form.password.length < 6) {
      setSubmitError('Vyplňte všechna pole. Heslo musí mít alespoň 6 znaků.');
      return;
    }
    setSubmitting(true);
    try {
      await createEmployee({
        email: form.email.trim(),
        password: form.password,
        displayName: form.name.trim(),
        role: form.role,
        organizationId,
        rc: form.rc.trim(),
        funkce: form.funkce.trim(),
        phone: form.phone.trim(),
        nadrizeny: form.nadrizeny || null,
      });
      setDialogOpen(false);
      setForm(emptyForm);
      await load();
    } catch (err) {
      console.error('[OrgEmployeesPanel] Přidání zaměstnance selhalo:', err);
      setSubmitError(err.message ?? 'Přidání se nezdařilo.');
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(u) {
    try {
      await setUserActive(u.id, !u.active);
      setUsers((list) => list.map((x) => (x.id === u.id ? { ...x, active: !u.active } : x)));
    } catch (err) {
      console.error('[OrgEmployeesPanel] setUserActive selhalo:', err);
    }
  }

  function nadrizenyName(uid) {
    return users.find((u) => u.id === uid)?.displayName ?? '—';
  }

  const koCount = users.filter((u) => u.role === 'klicova_osoba').length;

  return (
    <div>
      <div className="mb-5 flex justify-end">
        <Button variant="primary" onClick={() => setDialogOpen(true)}>
          <UserPlus size={16} strokeWidth={1.75} />
          Přidat zaměstnance
        </Button>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-14 text-stone-500">
          <Loader2 size={20} strokeWidth={1.75} className="animate-spin" />
          <span className="text-sm">Načítám zaměstnance…</span>
        </div>
      )}

      {!loading && error && (
        <div className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {!loading && !error && (
        <>
          <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <StatCard icon={<Users size={20} strokeWidth={1.75} />} label="Zaměstnanců celkem" value={users.length} />
            <StatCard icon={<Users size={20} strokeWidth={1.75} />} label="Klíčových osob" value={koCount} />
          </div>

          <Card>
            <h2 className="mb-3 text-base font-semibold text-stone-800">Zaměstnanci</h2>

            {users.length === 0 ? (
              <p className="py-8 text-center text-sm text-stone-500">
                Zatím žádní zaměstnanci — přidejte prvního přes tlačítko výše.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-xs uppercase tracking-wide text-stone-400">
                      <th className="px-3 py-2 font-medium">Jméno</th>
                      <th className="px-3 py-2 font-medium">Funkce / Role</th>
                      <th className="px-3 py-2 font-medium">Nadřízený</th>
                      <th className="px-3 py-2 font-medium">Kontakt</th>
                      <th className="px-3 py-2 text-center font-medium">Aktivní</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-stone-50">
                        <td className="px-3 py-3 font-semibold text-stone-800">{u.displayName}</td>
                        <td className="px-3 py-3">
                          <div className="flex flex-col items-start gap-1">
                            {u.funkce && <span className="text-sm text-stone-700">{u.funkce}</span>}
                            <Badge tone="neutral">{employeeRoleLabel(u.role)}</Badge>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-stone-500">
                          {u.nadrizeny ? nadrizenyName(u.nadrizeny) : '—'}
                        </td>
                        <td className="px-3 py-3 text-stone-500">
                          <div className="flex flex-col">
                            <span>{u.email}</span>
                            {u.phone && <span className="text-xs text-stone-400">{u.phone}</span>}
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex justify-center">
                            <button
                              type="button"
                              onClick={() => toggleActive(u)}
                              aria-label={u.active ? 'Deaktivovat' : 'Aktivovat'}
                              className={
                                'rounded-lg p-1.5 transition hover:bg-stone-100 ' +
                                (u.active ? 'text-primary-600' : 'text-stone-400')
                              }
                            >
                              {u.active
                                ? <UserCheck size={18} strokeWidth={1.75} />
                                : <UserX size={18} strokeWidth={1.75} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}

      {dialogOpen && (
        <EmployeeFormModal
          form={form}
          updateForm={updateForm}
          users={users}
          creatableRoles={CREATABLE_ROLES}
          submitting={submitting}
          submitError={submitError}
          onClose={() => setDialogOpen(false)}
          onSubmit={handleCreateEmployee}
        />
      )}
    </div>
  );
}
