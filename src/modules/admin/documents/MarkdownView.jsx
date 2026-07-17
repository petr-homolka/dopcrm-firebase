/**
 * MarkdownView.jsx (desktop) — bezpečné vykreslení jednoduchého markdownu bez
 * externí závislosti (2026-07-13, desktop varianta mobilního MarkdownView).
 * Vstup se NEinjektuje jako HTML — renderuje se přes strukturu Reactu. Omezená
 * sada značek: nadpisy #/##/###, **tučně**, *kurzíva*, - odrážky, prázdný
 * řádek = odstavec. Desktopové `ink` tokeny místo mobilních `native`.
 */

import React from 'react';

function renderInline(text, keyPrefix) {
  const parts = [];
  let rest = text;
  let i = 0;
  const re = /(\*\*([^*]+)\*\*|\*([^*]+)\*)/;
  let m = re.exec(rest);
  while (m) {
    if (m.index > 0) parts.push(rest.slice(0, m.index));
    if (m[2] != null) parts.push(<strong key={`${keyPrefix}-b${i}`}>{m[2]}</strong>);
    else parts.push(<em key={`${keyPrefix}-i${i}`}>{m[3]}</em>);
    rest = rest.slice(m.index + m[0].length);
    i += 1;
    m = re.exec(rest);
  }
  if (rest) parts.push(rest);
  return parts;
}

export default function MarkdownView({ text, className }) {
  const lines = (text ?? '').replace(/\r\n/g, '\n').split('\n');
  const blocks = [];
  let list = null;

  lines.forEach((line, idx) => {
    const key = `l${idx}`;
    const bullet = line.match(/^\s*[-*]\s+(.*)$/);
    if (bullet) {
      if (!list) list = [];
      list.push(<li key={key} className="ml-5 list-disc text-sm leading-relaxed text-ink-700">{renderInline(bullet[1], key)}</li>);
      return;
    }
    if (list) { blocks.push(<ul key={`ul${idx}`} className="my-1 flex flex-col gap-0.5">{list}</ul>); list = null; }

    const h = line.match(/^(#{1,3})\s+(.*)$/);
    if (h) {
      const size = h[1].length === 1 ? 'text-xl' : h[1].length === 2 ? 'text-base' : 'text-sm';
      blocks.push(<p key={key} className={`mt-3 font-bold text-ink-900 ${size}`}>{renderInline(h[2], key)}</p>);
      return;
    }
    if (line.trim() === '') { blocks.push(<div key={key} className="h-2" />); return; }
    blocks.push(<p key={key} className="text-sm leading-relaxed text-ink-700">{renderInline(line, key)}</p>);
  });
  if (list) blocks.push(<ul key="ul-last" className="my-1 flex flex-col gap-0.5">{list}</ul>);

  return <div className={className}>{blocks}</div>;
}
