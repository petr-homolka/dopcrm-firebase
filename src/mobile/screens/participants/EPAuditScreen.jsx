/**
 * EPAuditScreen.jsx — vlastní auditní historie externího účastníka (2026-07-06,
 * docs/domain/externi-ucastnici.md §5): „Externí uživatel může zobrazit vlastní
 * auditní historii." Neměnný výpis; čte přes firestore.rules (externalOfEp).
 */

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore.js';
import { listEpAudit } from '../../../services/orgService.js';
import { toDate } from '../../../modules/admin/useTodayPage.js';
import { cn } from '../../../components/ui/cn.js';
import MobileTopNav from '../../ui/MobileTopNav.jsx';
import { NativeEmptyState } from '../../ui/NativeBits.jsx';

function ts(v) {
  const d = toDate(v);
  return d ? d.toLocaleString('cs-CZ', { day: 'numeric', month: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
}

export default function EPAuditScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const epId = profile?.externalParticipantId;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!epId) { setLoading(false); return; }
    listEpAudit(epId, 200).then(setItems).catch((err) => console.error('[EPAudit]', err)).finally(() => setLoading(false));
  }, [epId]);

  return (
    <div>
      <MobileTopNav title={t('m.ep.auditTitle', 'Moje historie')} onBack={() => navigate('/ucastnik')} />
      {loading && <p className="py-16 text-center text-[15px] text-native-textMuted">{t('m.common.loading', 'Načítám…')}</p>}
      {!loading && items.length === 0 && (
        <div className="mx-4 mt-6"><NativeEmptyState icon={ShieldCheck} title={t('m.ep.auditEmptyTitle', 'Zatím žádné záznamy')} description={t('m.ep.auditEmptyDesc', 'Zde uvidíte historii svých akcí v aplikaci.')} /></div>
      )}
      {!loading && items.length > 0 && (
        <div className="mx-4 mt-3 overflow-hidden rounded-native-card bg-native-surface">
          {items.map((a, i) => (
            <div key={a.id} className={cn('px-4 py-3', i < items.length - 1 && 'border-b border-native-separator')}>
              <p className="text-[15px] text-native-text">{a.action}{a.note ? `: ${a.note}` : ''}</p>
              <p className="text-[13px] text-native-textMuted">{ts(a.ts)}{a.result && a.result !== 'ok' ? ` · ${a.result}` : ''}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
