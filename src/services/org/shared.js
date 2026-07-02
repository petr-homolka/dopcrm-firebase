/**
 * org/shared.js — sdílené helpery pro doménové služby v src/services/org/*.
 * Nic z tohoto souboru se neexportuje z barelu orgService.js — jde o interní
 * pomocníky (meta/createMeta/genId), ne o veřejné API.
 */

import { serverTimestamp } from 'firebase/firestore';
import { useAuthStore } from '../../store/authStore.js';

export function meta(extra = {}) {
  const uid = useAuthStore.getState().currentUser?.uid ?? 'system';
  return { updatedAt: serverTimestamp(), updatedBy: uid, ...extra };
}

export function createMeta(extra = {}) {
  const uid = useAuthStore.getState().currentUser?.uid ?? 'system';
  return {
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: uid,
    updatedBy: uid,
    ...extra,
  };
}

export function genId(prefix = '') {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

/** Výchozí roční rozpočet SPVPP peněženky dítěte (Kč) — sdíleno mezi respit.js a children.js. */
export const SPVPP_DEFAULT_ROZPOCET = 48000;
