/**
 * FosterChildScreen.jsx — OMEZENÝ profil dítěte pro pěstouna (2026-07-06,
 * docs/domain/chat-a-pestounska-appka.md). Pěstoun vidí jen základ (jméno,
 * datum narození, škola) — NE spis, OSPOD, soud, historii ani biologickou
 * rodinu. Firestore.rules navíc pustí jen děti vlastní rodiny.
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getChild } from '../../../services/orgService.js';
import MobileTopNav from '../../ui/MobileTopNav.jsx';
import NativeHero, { HeroBody } from '../../ui/NativeHero.jsx';
import { NativeInfoRow } from '../../ui/NativeFormRow.jsx';
import { SectionLabel } from '../../ui/NativeBits.jsx';

function formatDate(v) {
  if (!v) return '';
  const d = typeof v.toDate === 'function' ? v.toDate() : new Date(v);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('cs-CZ');
}

export default function FosterChildScreen() {
  const { childId } = useParams();
  const navigate = useNavigate();
  const [child, setChild] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getChild(childId)
      .then(setChild)
      .catch((err) => console.error('[FosterChildScreen] Načtení dítěte selhalo:', err))
      .finally(() => setLoading(false));
  }, [childId]);

  const name = child ? [child.firstName, child.lastName].filter(Boolean).join(' ') : 'Dítě';

  return (
    <div>
      <MobileTopNav variant="hero" title="Dítě" onBack={() => navigate(-1)} />
      <NativeHero title={loading ? 'Načítám…' : name} />

      <HeroBody>
        <div className="p-4">
          <SectionLabel>Základní údaje</SectionLabel>
          <div className="rounded-native-card bg-native-surface px-4">
            <NativeInfoRow label="Jméno" value={name} />
            <NativeInfoRow label="Datum narození" value={formatDate(child?.birthDate)} />
            <NativeInfoRow label="Škola" value={child?.school?.nazev ?? child?.school} isLast />
          </div>
          <p className="mt-3 px-1 text-[13px] text-native-textMuted">
            Podrobnou dokumentaci vede klíčová osoba. Potřebujete-li něco doplnit, napište jí
            v chatu.
          </p>
        </div>
      </HeroBody>
    </div>
  );
}
