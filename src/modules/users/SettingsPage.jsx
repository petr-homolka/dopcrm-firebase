/**
 * SettingsPage.jsx — Nastavení organizace (Krok 1, 2026-07-03).
 *
 * Dřív 8řádkový stub s inline styly. První reálný obsah: editace slugu
 * organizace (org_admin). Další sekce (branding, systémové texty…) — viz
 * docs/INVENTAR.md — přibudou postupně, ne najednou v tomto kroku.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Loader2, Settings as SettingsIcon } from 'lucide-react';

import { useAuthStore } from '../../store/authStore.js';
import { getOrganization, isSlugAvailable, changeOrganizationSlug } from '../../services/orgService.js';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import SlugField from '../../components/ui/SlugField.jsx';

export default function SettingsPage() {
  const { role, organizationId } = useAuthStore();
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [slug, setSlug] = useState('');
  const [slugStatus, setSlugStatus] = useState('idle');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const canManage = role === 'org_admin';

  const load = useCallback(async () => {
    if (!organizationId) { setLoading(false); return; }
    setLoading(true);
    setError('');
    try {
      const data = await getOrganization(organizationId);
      setOrg(data);
      setSlug(data?.slug ?? '');
    } catch (err) {
      console.error('[SettingsPage] Načtení organizace selhalo:', err);
      setError(err.message ?? 'Data se nepodařilo načíst.');
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => { load(); }, [load]);

  async function handleSaveSlug(e) {
    e.preventDefault();
    setSaveMessage('');
    if (slugStatus !== 'ok') return;
    setSaving(true);
    try {
      await changeOrganizationSlug(organizationId, slug);
      setSaveMessage('Adresa organizace byla uložena.');
      await load();
    } catch (err) {
      console.error('[SettingsPage] Uložení slugu selhalo:', err);
      setSaveMessage(err.message ?? 'Uložení se nezdařilo.');
    } finally {
      setSaving(false);
    }
  }

  if (!canManage) {
    return (
      <EmptyState
        icon={<SettingsIcon size={26} strokeWidth={1.75} />}
        title="Nastavení organizace"
        description="Tuto sekci může upravovat pouze administrátor organizace (org_admin)."
      />
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-stone-800">Nastavení organizace</h1>
        <p className="text-sm text-stone-500">{org?.name}</p>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-14 text-stone-500">
          <Loader2 size={22} strokeWidth={1.75} className="animate-spin" />
        </div>
      )}

      {!loading && error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {!loading && !error && (
        <Card className="max-w-md">
          <h2 className="mb-1 text-sm font-semibold text-stone-800">Adresa organizace</h2>
          <p className="mb-4 text-xs text-stone-500">
            Unikátní adresa se v budoucnu použije pro veřejný profil organizace.
          </p>
          <form onSubmit={handleSaveSlug} className="flex flex-col gap-3">
            <SlugField
              value={slug}
              onChange={setSlug}
              onStatusChange={setSlugStatus}
              checkAvailable={isSlugAvailable}
              currentSlug={org?.slug ?? ''}
              disabled={saving}
            />
            {saveMessage && <p className="text-xs text-stone-600">{saveMessage}</p>}
            <Button type="submit" disabled={saving || slugStatus !== 'ok' || slug === org?.slug} className="self-start">
              {saving && <Loader2 size={16} className="animate-spin" />}
              {saving ? 'Ukládám…' : 'Uložit adresu'}
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
