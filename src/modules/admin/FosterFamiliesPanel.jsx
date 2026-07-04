/**
 * FosterFamiliesPanel.jsx — pěstounské rodiny organizace jako datová tabulka
 * (Krok 3b redesignu, DESIGN.md §5.6/§6.2 — Connecteam Users vzor).
 *
 * Sdílený panel pro plnou hierarchickou viditelnost: nadřazená role vidí
 * VŠECHNY rodiny své organizace. Použito v OrganizationDetailPage
 * (superadmin), OrgAdminDashboard (vlastní org) i KlicovaOsobaDashboard
 * ("Celá organizace").
 *
 * Vědomě MIMO rozsah (viz docs/INVENTAR.md): onboarding cards carousel
 * (žádný stavový onboarding tracking zatím neexistuje), checkbox
 * hromadné akce, sloupec "N dětí" (vyžadovalo by denormalizaci nebo N+1
 * dotaz — CLAUDE.md to nedoporučuje), ⚙ column customization, "Návrhy" tab
 * (rodiny nemají draft stav) a reálná stránkovací "1–50 z N" (žádný cursor
 * pro tenhle list zatím není). Taby Aktivní/Archivované mapované na SKUTEČNÝ
 * `status` pole (active vs. paused+exited), ne na fiktivní kategorie.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Loader2, Search } from 'lucide-react';

import { listFostersByOrg, listKlicoveOsobyByOrg, createFoster } from '../../services/orgService.js';
import { careLabel } from '../../shared/domainConstants.js';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Input from '../../components/ui/Input.jsx';
import Tabs from '../../components/ui/Tabs.jsx';
import { Table, TableHead, Th, TableBody, Tr, Td } from '../../components/ui/Table.jsx';
import NewFamilyModal from './NewFamilyModal.jsx';
import FamilyListRow from './FamilyListRow.jsx';

const STATUS_LABEL = { active: 'Aktivní', paused: 'Pozastaveno', exited: 'Ukončeno' };
const STATUS_TONE = { active: 'success', paused: 'warning', exited: 'neutral' };
const TABS = [
  { value: 'active', label: 'Aktivní' },
  { value: 'archived', label: 'Archivované' },
];

function toDate(value) {
  if (!value) return null;
  if (typeof value.toDate === 'function') return value.toDate();
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function lastVisitLabel(family) {
  const date = toDate(family.lastVisitAt);
  return date ? date.toLocaleDateString('cs-CZ') : '—';
}

const emptyForm = { name: '', address: '', contactPhone: '', careType: 'long', assignedTo: '' };

export default function FosterFamiliesPanel({ organizationId, basePath, canCreate = true }) {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [families, setFamilies] = useState([]);
  const [kos, setKos] = useState([]);
  const [tab, setTab] = useState('active');
  const [search, setSearch] = useState('');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const load = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    setError('');
    try {
      const [familiesData, kosData] = await Promise.all([
        listFostersByOrg(organizationId),
        listKlicoveOsobyByOrg(organizationId),
      ]);
      setFamilies(familiesData);
      setKos(kosData);
    } catch (err) {
      console.error('[FosterFamiliesPanel] načtení selhalo:', err);
      setError(err.message ?? 'Rodiny se nepodařilo načíst.');
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => { load(); }, [load]);

  function updateForm(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleCreate(e) {
    e.preventDefault();
    setSubmitError('');
    if (!form.name.trim()) {
      setSubmitError('Zadejte název rodiny.');
      return;
    }
    setSubmitting(true);
    try {
      await createFoster({
        organizationId,
        name: form.name.trim(),
        address: form.address.trim(),
        contactPhone: form.contactPhone.trim(),
        careType: form.careType,
        assignedTo: form.assignedTo || null,
      });
      setDialogOpen(false);
      setForm(emptyForm);
      await load();
    } catch (err) {
      console.error('[FosterFamiliesPanel] Založení rodiny selhalo:', err);
      setSubmitError(err.message ?? 'Založení se nezdařilo.');
    } finally {
      setSubmitting(false);
    }
  }

  function koName(uid) {
    return kos.find((k) => k.id === uid)?.displayName ?? '—';
  }

  const filtered = useMemo(() => {
    const byTab = families.filter((f) => (tab === 'active' ? f.status === 'active' : f.status !== 'active'));
    const needle = search.trim().toLowerCase();
    return needle ? byTab.filter((f) => f.name?.toLowerCase().includes(needle)) : byTab;
  }, [families, tab, search]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Tabs items={TABS} value={tab} onChange={setTab} />
        {canCreate && (
          <Button onClick={() => setDialogOpen(true)}>
            <UserPlus size={16} strokeWidth={1.75} />
            Přidat rodinu
          </Button>
        )}
      </div>

      <div className="mb-4 max-w-xs">
        <Input
          icon={<Search size={16} strokeWidth={1.75} />}
          placeholder="Hledat rodinu…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border-none bg-surface-canvas"
        />
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-12 text-ink-500">
          <Loader2 size={20} strokeWidth={1.75} className="animate-spin" />
          <span className="text-sm">Načítám rodiny…</span>
        </div>
      )}

      {!loading && error && (
        <div className="mb-4 rounded-xl bg-danger-50 px-4 py-3 text-sm text-danger-700">{error}</div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <Card>
          <EmptyState
            icon={<UserPlus size={28} strokeWidth={1.75} />}
            title={families.length === 0 ? 'Zatím žádné pěstounské rodiny' : 'Žádné rodiny neodpovídají filtru'}
            description={
              families.length > 0
                ? 'Zkuste jiné hledání nebo přepněte záložku.'
                : canCreate
                  ? 'Přidejte první rodinu a přiřaďte ji klíčové osobě, která se o ni bude starat.'
                  : 'V organizaci zatím nejsou žádné pěstounské rodiny.'
            }
            action={families.length === 0 && canCreate && (
              <Button onClick={() => setDialogOpen(true)}>
                <UserPlus size={16} strokeWidth={1.75} />
                Přidat první rodinu
              </Button>
            )}
          />
        </Card>
      )}

      {!loading && !error && filtered.length > 0 && (
        <>
          <div className="hidden lg:block">
            <Table>
              <TableHead>
                <Th>Rodina</Th>
                <Th>Typ</Th>
                <Th>Koordinátorka</Th>
                <Th>Poslední návštěva</Th>
                <Th>Status</Th>
              </TableHead>
              <TableBody>
                {filtered.map((family) => (
                  <Tr key={family.id} onClick={() => navigate(`${basePath}/${family.id}`)} className="cursor-pointer">
                    <Td>
                      <div className="flex items-center gap-3">
                        <Avatar name={family.name} size="md" />
                        <span className="font-medium text-ink-800">{family.name}</span>
                      </div>
                    </Td>
                    <Td><Badge tone="family">{careLabel(family.careType)}</Badge></Td>
                    <Td>{koName(family.assignedTo)}</Td>
                    <Td className="text-ink-500">{lastVisitLabel(family)}</Td>
                    <Td><Badge tone={STATUS_TONE[family.status] ?? 'neutral'}>{STATUS_LABEL[family.status] ?? family.status}</Badge></Td>
                  </Tr>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="rounded-2xl border border-border-subtle bg-white px-4 lg:hidden">
            {filtered.map((family) => (
              <FamilyListRow
                key={family.id}
                family={family}
                careLabel={`${careLabel(family.careType)} · ${lastVisitLabel(family)}`}
                statusLabel={STATUS_LABEL[family.status] ?? family.status}
                statusTone={STATUS_TONE[family.status] ?? 'neutral'}
                onClick={() => navigate(`${basePath}/${family.id}`)}
              />
            ))}
          </div>
        </>
      )}

      {dialogOpen && (
        <NewFamilyModal
          form={form}
          kos={kos}
          submitting={submitting}
          submitError={submitError}
          onChange={updateForm}
          onSubmit={handleCreate}
          onClose={() => !submitting && setDialogOpen(false)}
        />
      )}
    </div>
  );
}
