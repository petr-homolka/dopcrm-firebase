/**
 * PublishModal.jsx — potvrzení publikace konceptů týdne (Krok 4c, DESIGN.md
 * §6.4 publish workflow). Skutečně publikuje (`useCalendarWeek.publish()` →
 * batch zápis `published: true`). Checkbox „Odeslat oznámení" je vizuální
 * stub — appka nemá push/e-mail infrastrukturu pro koordinátorky, viz
 * docs/INVENTAR.md; při zaškrtnutí jen upozorní přes toast, nic neodešle.
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';

import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { toast } from '../../store/toastStore.js';

export default function PublishModal({ count, publishing, onClose, onConfirm }) {
  const { t } = useTranslation();
  const [notify, setNotify] = useState(false);

  async function handleConfirm() {
    if (notify) toast.info(t('calendar.publish.notifyNotAvailable'));
    await onConfirm();
    toast.success(t('calendar.publish.success'));
  }

  return (
    <Modal
      title={t('calendar.publish.modalTitle')}
      onClose={() => !publishing && onClose()}
      footer={(
        <>
          <Button variant="secondary" onClick={onClose} disabled={publishing}>
            {t('calendar.publish.cancel')}
          </Button>
          <Button variant="primary" onClick={handleConfirm} disabled={publishing}>
            {publishing && <Loader2 size={16} strokeWidth={1.75} className="animate-spin" />}
            {publishing ? t('calendar.publish.publishing') : t('calendar.publish.confirm')}
          </Button>
        </>
      )}
    >
      <p className="text-sm text-ink-700">{t('calendar.publish.summary', { count })}</p>
      <label className="mt-4 flex items-center gap-2.5 text-sm text-ink-700">
        <input
          type="checkbox"
          checked={notify}
          onChange={(e) => setNotify(e.target.checked)}
          className="h-4 w-4 rounded border-border-strong text-brand-600 focus:ring-2 focus:ring-brand-100"
        />
        {t('calendar.publish.notifyLabel')}
      </label>
    </Modal>
  );
}
