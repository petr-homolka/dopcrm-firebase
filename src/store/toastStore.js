/**
 * toastStore.js — globální fronta toastů (Zustand), DESIGN.md §5.11/§7.7.
 * Vizuál v `components/ui/Toast.jsx`. Import `toast` a volat odkudkoli
 * (services, event handlery) — bez nutnosti prop-drillingu.
 */

import { create } from 'zustand';

let idCounter = 0;
const MAX_STACK = 3;

export const useToastStore = create((set) => ({
  toasts: [],
  add(entry) {
    const id = `toast-${++idCounter}`;
    set((s) => ({ toasts: [...s.toasts, { id, type: 'info', duration: 4500, ...entry }].slice(-MAX_STACK) }));
    return id;
  },
  remove(id) {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  },
}));

/** @param {string} message @param {{duration?: number, undo?: () => void}} [opts] */
export const toast = {
  success: (message, opts) => useToastStore.getState().add({ type: 'success', message, ...opts }),
  info: (message, opts) => useToastStore.getState().add({ type: 'info', message, ...opts }),
  warning: (message, opts) => useToastStore.getState().add({ type: 'warning', message, ...opts }),
  error: (message, opts) => useToastStore.getState().add({ type: 'error', message, ...opts }),
};
