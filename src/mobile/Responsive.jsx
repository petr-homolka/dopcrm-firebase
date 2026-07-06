/**
 * Responsive.jsx — jediné místo v `router.jsx`, kde se pro danou routu
 * vybírá mobilní vs. desktop KOMPONENTA (STRICT UI/UX DESIGN MANDATE,
 * 2026-07-05). `AdminLayout.jsx` sama řeší layout (tab bar vs. sidebar) —
 * tohle řeší OBSAH. Routy bez vlastní mobilní obrazovky (ještě
 * nepřepsané, viz docs/INVENTAR.md) prop `mobile` prostě nepředají a
 * dostanou stejnou komponentu jako desktop, jen v novém mobilním layoutu.
 */

import React from 'react';
import useIsMobile from './useIsMobile.js';

export default function Responsive({ mobile: MobileComp, desktop: DesktopComp }) {
  const isMobile = useIsMobile();
  const Comp = isMobile && MobileComp ? MobileComp : DesktopComp;
  return <Comp />;
}
