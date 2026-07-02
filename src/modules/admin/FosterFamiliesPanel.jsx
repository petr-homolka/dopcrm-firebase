/**
 * FosterFamiliesPanel.jsx — pěstounské rodiny jedné organizace (2026-07-02)
 *
 * Sdílený panel pro plnou hierarchickou viditelnost: nadřazená role vidí
 * VŠECHNY rodiny (a jejich děti, o úroveň níž) své organizace — ne jen
 * zaměstnance. Použito v OrganizationDetailPage (superadmin, cizí org) i
 * OrgAdminDashboard (vlastní org). Klíčová osoba má vlastní dashboard
 * (KlicovaOsobaDashboard) scoped na "moje rodiny", ale i ta smí tenhle
 * panel použít pro pohled na "celou organizaci" (viz firestore.rules —
 * čtení má povolené celá organizace, jen zápis je omezený na přidělené).
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, ChevronRight, Loader2 } from 'lucide-react';

import { listFostersByOrg, listKlicoveOsobyByOrg, createFoster } from '../../services/orgService.js';
import { careLabel } from '../../shared/domainConstants.js';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import NewFamilyModal from './NewFamilyModal.jsx';

const STATUS_LABEL = { active: 'Aktivní', paused: 'Pozastaveno', exited: 'Ukončeno' };
const STATUS_TONE = { active: 'success', paused: 'warning', exited: 'neutral' };

const emptyForm = { name: '', address: '', contactPhone: '', careType: 'long', assignedTo: '' };

export default function FosterFamiliesPanel({ organizationId, basePath, canCreate = true }) {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [families, setFamilies] = useState([]);
  const [kos, setKos] = useState([]);

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

  return (
    <div>
      {canCreate && (
        <div className="mb-4 flex justify-end">
          <Button onClick={() => setDialogOpen(true)}>
            <UserPlus size={16} strokeWidth={1.75} />
            Přidat rodinu
          </Button>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center gap-2 py-12 text-stone-500">
          <Loader2 size={20} strokeWidth={1.75} className="animate-spin" />
          <span className="text-sm">Načítám rodiny…</span>
        </div>
      )}

      {!loading && error && (
        <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {!loading && !error && families.length === 0 && (
        <Card>
          <EmptyState
            icon={<UserPlus size={28} strokeWidth={1.75} />}
            title="Zatím žádné pěstounské rodiny"
            description={canCreate
              ? 'Přidejte první rodinu a přiřaďte ji klíčové osobě, která se o ni bude starat.'
              : 'V organizaci zatím nejsou žádné pěstounské rodiny.'}
            action={canCreate && (
              <Button onClick={() => setDialogOpen(true)}>
                <UserPlus size={16} strokeWidth={1.75} />
                Přidat první rodinu
              </Button>
            )}
          />
        </Card>
      )}

      {!loading && !error && families.length > 0 && (
        <div>
          <h2 className="mb-0.5 text-base font-semibold text-stone-800">Pěstounské rodiny</h2>
          <p className="mb-3 text-sm text-stone-500">
            Klikněte na rodinu pro detail — svěřené děti a jejich příbuzné.
          </p>
          <div className="space-y-2.5">
            {families.map((family) => (
              <Card
                key={family.id}
                onClick={() => navigate(`${basePath}/${family.id}`)}
                className="flex cursor-pointer items-center gap-3 transition hover:bg-stone-50 active:scale-[0.99]"
              >
                <Avatar name={family.name} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-stone-800">{family.name}</p>
                  <p className="truncate text-xs text-stone-500">
                    {careLabel(family.careType)} · {koName(family.assignedTo)}
                  </p>
                </div>
                <Badge tone={STATUS_TONE[family.status] ?? 'neutral'}>
                  {STATUS_LABEL[family.status] ?? family.status}
                </Badge>
                <ChevronRight size={18} strokeWidth={1.75} className="shrink-0 text-stone-400" />
              </Card>
            ))}
          </div>
        </div>
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
