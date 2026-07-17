/**
 * WorkspaceHome.jsx — pravý panel workspace, když není vybraná žádná rodina
 * (index route /admin/terenni na desktopu, 2026-07-13). Klidný uvítací stav,
 * který navádí k výběru rodiny ze středového seznamu; drží stejný vizuální
 * jazyk jako zbytek case-management workspace.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Users, MessageSquare, FileText, ShieldCheck } from 'lucide-react';

export default function WorkspaceHome() {
  const { t } = useTranslation();
  const hints = [
    { icon: MessageSquare, title: t('dsk.ws.hintChat', 'Chat'), text: t('dsk.ws.hintChatText', 'Poznámky sobě, interní tým, komunikace s pěstounem i pro OSPOD.') },
    { icon: FileText, title: t('dsk.ws.hintDocs', 'Dokumenty'), text: t('dsk.ws.hintDocsText', 'Koncept → schválení pěstounem → vedení → uzavření a odeslání.') },
    { icon: ShieldCheck, title: t('dsk.ws.hintEp', 'Účastníci'), text: t('dsk.ws.hintEpText', 'Externí účastníci případu s přesně přidělenými oprávněními.') },
  ];

  return (
    <div className="flex h-full flex-col items-center justify-center px-8 py-10">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
          <Users size={30} strokeWidth={1.5} />
        </div>
        <h1 className="text-xl font-semibold text-ink-900">{t('dsk.ws.selectTitle', 'Vyberte rodinu')}</h1>
        <p className="mt-2 text-sm text-ink-500">
          {t('dsk.ws.selectDesc', 'V seznamu vlevo klikněte na rodinu a otevřete její kartu — profil, časovou osu, chat, dokumenty i externí účastníky případu na jednom místě.')}
        </p>

        <div className="mt-8 grid gap-2.5 text-left">
          {hints.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-start gap-3 rounded-xl border border-border-subtle bg-white p-4 shadow-sm">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-tint text-brand-600">
                <Icon size={18} strokeWidth={1.75} />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink-800">{title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-ink-500">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
