/**
 * documentConstants.js — stavy a workflow dokumentů (2026-07-06 §C/§D,
 * docs/domain/dokumenty-workflow-a-prihlaseni.md). Stavový automat:
 *   draft → foster_review → (commented | approved_foster) → final
 *         → mgmt_review → closed(* varianty) → sent | filed
 */

export const DOC_STATUS = {
  draft: { label: 'Koncept', tone: 'muted' },
  foster_review: { label: 'U pěstouna ke schválení', tone: 'warning' },
  commented: { label: 'Komentováno pěstounem', tone: 'warning' },
  approved_foster: { label: 'Schváleno pěstounem', tone: 'primary' },
  final: { label: 'Konečný', tone: 'primary' },
  mgmt_review: { label: 'U vedení ke schválení', tone: 'warning' },
  closed: { label: 'Uzavřeno', tone: 'primary' },
  closed_foster_unapproved: { label: 'Uzavřeno (pěstoun neschválil)', tone: 'warning' },
  closed_ko_unapproved: { label: 'Uzavřeno (KO neschválila)', tone: 'warning' },
  closed_both_unapproved: { label: 'Uzavřeno (KO i pěstoun neschválili)', tone: 'warning' },
  sent: { label: 'Odesláno (soud/OSPOD)', tone: 'primary' },
  filed: { label: 'Uloženo', tone: 'muted' },
};

export function docStatusLabel(s) {
  return DOC_STATUS[s]?.label ?? s;
}
export function docStatusTone(s) {
  return DOC_STATUS[s]?.tone ?? 'muted';
}

/** Uzavřené stavy (řádně i s výhradou) — teprve odtud lze odeslat nebo uložit. */
export function isClosedStatus(s) {
  return s === 'closed' || (typeof s === 'string' && s.startsWith('closed_'));
}

/** Konečné/archivní stavy (dokument opustil živý workflow). */
export function isTerminalStatus(s) {
  return s === 'sent' || s === 'filed';
}

export const DOC_KINDS = {
  md: 'Interní dokument',
  pdf: 'PDF',
  image: 'Obrázek',
  docx: 'Wordový dokument',
};

/** Typy auditních akcí — pro čitelný výpis stopy. */
export const DOC_AUDIT_ACTION = {
  created: 'Vytvořeno',
  version: 'Nová verze',
  sent_foster: 'Posláno pěstounovi ke schválení',
  foster_approved: 'Pěstoun schválil',
  foster_commented: 'Pěstoun okomentoval',
  marked_final: 'Označeno jako Konečný',
  sent_mgmt: 'Posláno vedení ke schválení',
  mgmt_approved: 'Vedení schválilo',
  mgmt_rejected: 'Vedení neschválilo',
  closed: 'Uzavřeno',
  sent_authority: 'Odesláno na úřad',
  filed: 'Uloženo do spisu',
};
