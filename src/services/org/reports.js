/**
 * org/reports.js — generátor reportů pro OSPOD (2026-07-13). Report =
 * „Zpráva o průběhu náhradní rodinné péče" sestavená z časové osy rodiny
 * (návštěvy, poznámky), identity a vzdělávání za zvolené období. Výstup je
 * markdown, který se založí jako běžný DOKUMENT (createMarkdownDocument) a dál
 * projde stávajícím schvalovacím workflow (koncept → pěstoun → vedení →
 * uzavření → odeslání na OSPOD). Report se tak needěje mimo systém — je to
 * dokument se stavem, verzemi i auditní stopou.
 */

import { listTimelineEntries, createMarkdownDocument } from '../orgService.js';
import { careLabel } from '../../shared/domainConstants.js';

function toDate(v) {
  if (!v) return null;
  if (typeof v.toDate === 'function') return v.toDate();
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

function fmt(d) {
  return d ? d.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric', year: 'numeric' }) : '';
}

/**
 * Načte záznamy časové osy s `occurredAt` v intervalu [from, to]. Osa je
 * řazená sestupně, takže stránkujeme, dokud nenarazíme na starší než `from`
 * (nebo nedojdou stránky). Strop `maxPages` chrání před runaway u velkých os.
 */
export async function fetchTimelineForPeriod(familyId, from, to, maxPages = 12) {
  const out = [];
  let cursor = null;
  for (let i = 0; i < maxPages; i += 1) {
    const page = await listTimelineEntries(familyId, {}, cursor);
    let reachedOlder = false;
    for (const e of page.items) {
      const d = toDate(e.occurredAt);
      if (!d) continue;
      if (d < from) { reachedOlder = true; continue; }
      if (d > to) continue;
      out.push({ ...e, _date: d });
    }
    if (reachedOlder || !page.lastDoc) break;
    cursor = page.lastDoc;
  }
  return out.sort((a, b) => a._date - b._date);
}

/** Čistý builder markdownu reportu z už načtených dat (testovatelný bez Firestore). */
export function buildOspodReportMarkdown({ family, children = [], courses = [], entries = [], from, to, requiredHours = 24 }) {
  const childNames = children.map((c) => `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim()).filter(Boolean);
  const visits = entries.filter((e) => e.type === 'visit');
  const notes = entries.filter((e) => e.type === 'note');
  const totalCourseHours = courses.reduce((s, c) => s + (Number(c.hodiny) || 0), 0);

  const lines = [];
  lines.push('# Zpráva o průběhu náhradní rodinné péče', '');
  lines.push(`**Rodina:** ${family?.name ?? '—'}`);
  lines.push(`**Období:** ${fmt(from)} – ${fmt(to)}`);
  if (family?.careType) lines.push(`**Typ péče:** ${careLabel(family.careType)}`);
  if (childNames.length) lines.push(`**Svěřené děti:** ${childNames.join(', ')}`);
  lines.push(`**Zpracováno:** ${fmt(to)}`, '');

  lines.push('## Průběh péče', '');
  if (notes.length === 0) {
    lines.push('*V daném období nejsou v časové ose žádné poznámky.*', '');
  } else {
    notes.forEach((n) => {
      lines.push(`- **${fmt(n._date)}** — ${n.title ?? 'Poznámka'}${n.body ? `: ${n.body}` : ''}`);
    });
    lines.push('');
  }

  lines.push('## Návštěvy', '');
  if (visits.length === 0) {
    lines.push('*V daném období nejsou zaznamenané návštěvy.*', '');
  } else {
    visits.forEach((v) => {
      const dur = v.durationSeconds ? ` (${Math.max(1, Math.round(v.durationSeconds / 60))} min)` : '';
      lines.push(`- **${fmt(v._date)}** — ${v.title ?? 'Návštěva'}${dur}${v.body ? `: ${v.body}` : ''}`);
    });
    lines.push('');
  }

  lines.push('## Vzdělávání pěstounů', '');
  lines.push(`Absolvováno celkem **${totalCourseHours} h** z požadovaných **${requiredHours} h** ročně.`);
  if (courses.length) {
    courses.slice(0, 20).forEach((c) => {
      lines.push(`- ${c.kod ?? 'Kurz'}${c.hodiny ? ` — ${c.hodiny} h` : ''}${c.kdy ? ` (${c.kdy})` : ''}`);
    });
  }
  lines.push('');

  lines.push('## Shrnutí a doporučení', '');
  lines.push('*(Doplňte zhodnocení průběhu péče, spolupráce s rodinou a doporučení pro další období.)*', '');

  return lines.join('\n');
}

/**
 * Sestaví report za období a založí ho jako DOKUMENT (koncept). Vrací docId,
 * na který lze rovnou přejít (detail → workflow → tisk/PDF → odeslání OSPOD).
 * `family`, `children`, `courses` předává volající (detail rodiny je má načtené).
 */
export async function generateOspodReport(familyId, {
  from, to, family, children = [], courses = [], organizationId, assignedTo, requiredHours = 24,
}) {
  const entries = await fetchTimelineForPeriod(familyId, from, to);
  const content = buildOspodReportMarkdown({ family, children, courses, entries, from, to, requiredHours });
  const title = `Zpráva o průběhu NRP — ${family?.name ?? 'rodina'} (${fmt(from)}–${fmt(to)})`;
  return createMarkdownDocument(familyId, {
    title, content, organizationId, assignedTo,
    subjectRefs: children.map((c) => ({ kind: 'child', id: c.id })),
  });
}
