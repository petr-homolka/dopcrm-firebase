/**
 * MobileEventDetailSheet.jsx — detail události po klepnutí na kartu v týdenní
 * agendě (2026-07-06, Connecteam vzor „ťuk na směnu → sheet s detailem a
 * akcemi"). Souhrn (typ, čas, místo, rodina) + akce: Zahájit návštěvu
 * (návštěva s rodinou), Otevřít kartu rodiny, Upravit (předá řízení
 * MobileEventSheet přes onEdit), Smazat (dvoukrokové potvrzení přímo na
 * tlačítku — žádný window.confirm). Upravit/Smazat jen dle canEditEvent
 * (zrcadlí firestore.rules: KO svoje, management vše).
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Timer, Users, Pencil, Trash2 } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore.js';
import { getFoster, deleteEvent } from '../../../services/orgService.js';
import { eventTypeLabel } from '../../../shared/domainConstants.js';
import { formatTime, toJsDate, canEditEvent } from '../../../modules/calendar/calendarShared.js';
import { toast } from '../../../store/toastStore.js';
import NativeSheet from '../../ui/NativeSheet.jsx';
import NativeButton from '../../ui/NativeButton.jsx';
import { NativeChip } from '../../ui/NativeBits.jsx';

export default function MobileEventDetailSheet({ event, onClose, onEdit, onChanged }) {
  const navigate = useNavigate();
  const { role, currentUser, organizationId } = useAuthStore();
  const [familyName, setFamilyName] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!event.fosterFamilyId) return;
    getFoster(event.fosterFamilyId).then((f) => f && setFamilyName(f.name)).catch(() => {});
  }, [event.fosterFamilyId]);

  const start = toJsDate(event.start);
  const editable = canEditEvent(role, currentUser?.uid, event);
  // Jen první písmeno velké — Tailwind `capitalize` by zvedl i měsíc
  // („Úterý 7. Července"), což je v češtině špatně.
  const rawDate = start.toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long' });
  const dateLabel = rawDate.charAt(0).toUpperCase() + rawDate.slice(1);
  const timeLabel = event.allDay ? 'Celý den' : `${formatTime(event.start)} – ${formatTime(event.end ?? event.start)}`;

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    try {
      await deleteEvent(organizationId, event.id);
      toast.info('Událost smazána.');
      onChanged();
    } catch (err) {
      console.error('[MobileEventDetailSheet] Smazání selhalo:', err);
      toast.error(err.message ?? 'Smazání se nezdařilo.');
      setDeleting(false);
    }
  }

  return (
    <NativeSheet title="Událost" onClose={() => !deleting && onClose()} submitting={deleting}>
      <div className="rounded-native-card bg-native-bg p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[13px] font-semibold uppercase tracking-wide text-native-textMuted">
            {event.typeLabel ?? eventTypeLabel(event.type)}
          </p>
          {event.published === false && <NativeChip tone="warning">Koncept</NativeChip>}
        </div>
        <p className="mt-1 text-[17px] font-semibold text-native-text">{event.title}</p>
        <p className="mt-0.5 text-[15px] text-native-text">{dateLabel}</p>
        <p className="text-[15px] text-native-text">{timeLabel}</p>
        {event.location && (
          <p className="mt-1 flex items-center gap-1.5 text-[13px] text-native-textMuted">
            <MapPin size={13} strokeWidth={2} className="shrink-0" />
            <span className="truncate">{event.location}</span>
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-2.5">
        {event.type === 'visit' && event.fosterFamilyId && (
          <NativeButton
            onClick={() => navigate(`/admin/terenni/${event.fosterFamilyId}/navsteva`, { state: { familyName } })}
          >
            <Timer size={18} strokeWidth={2.25} /> Zahájit návštěvu
          </NativeButton>
        )}
        {event.fosterFamilyId && (
          <NativeButton variant="secondary" onClick={() => navigate(`/admin/terenni/${event.fosterFamilyId}`)}>
            <Users size={18} strokeWidth={2.25} /> Otevřít kartu rodiny
          </NativeButton>
        )}
        {editable && (
          <NativeButton variant="secondary" onClick={onEdit}>
            <Pencil size={18} strokeWidth={2.25} /> Upravit
          </NativeButton>
        )}
        {editable && (
          <NativeButton variant="danger" onClick={handleDelete} disabled={deleting}>
            <Trash2 size={18} strokeWidth={2.25} />
            {deleting ? 'Mažu…' : confirmDelete ? 'Opravdu smazat?' : 'Smazat'}
          </NativeButton>
        )}
      </div>
    </NativeSheet>
  );
}
