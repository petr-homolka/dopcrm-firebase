/**
 * org/tasks.js — úkoly a termíny organizace (2026-07-13). Top-level kolekce
 * `tasks/{id}` (org-scoped). Úkol nese `dueDate` (termín), `assignedTo` (KO),
 * `subjectRefs` (navázání na rodinu/dítě), `status` ('open'|'done'). List
 * dotazy VŽDY filtrují `organizationId` (firestore.rules „list vs pole").
 * Bez `orderBy` v dotazu → řazení na klientovi (žádný composite index).
 */

import {
  collection, doc, addDoc, getDocs, updateDoc, deleteDoc, query, where, limit,
} from 'firebase/firestore';
import { db } from '../firebase.js';
import { createMeta, meta, TOP_LEVEL_PAGE_SIZE } from './shared.js';

const tasksCol = () => collection(db, 'tasks');

function toDate(v) {
  if (!v) return null;
  if (typeof v.toDate === 'function') return v.toDate();
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

function sortByDue(items) {
  return [...items].sort((a, b) => {
    const da = toDate(a.dueDate); const dbb = toDate(b.dueDate);
    if (!da && !dbb) return 0;
    if (!da) return 1; // bez termínu na konec
    if (!dbb) return -1;
    return da - dbb;
  });
}

export async function createTask({ organizationId, title, note = '', dueDate = null, assignedTo = null, subjectRefs = [] }) {
  const ref = await addDoc(tasksCol(), {
    organizationId,
    title: title.trim(),
    note: note.trim(),
    dueDate: dueDate ?? null,
    assignedTo: assignedTo || null,
    subjectRefs,
    status: 'open',
    ...createMeta(),
  });
  return ref.id;
}

export async function listTasksByOrg(organizationId) {
  const snap = await getDocs(query(tasksCol(), where('organizationId', '==', organizationId), limit(TOP_LEVEL_PAGE_SIZE)));
  return sortByDue(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
}

export async function listTasksForAssignee(uid, organizationId) {
  const snap = await getDocs(query(
    tasksCol(),
    where('organizationId', '==', organizationId),
    where('assignedTo', '==', uid),
    limit(TOP_LEVEL_PAGE_SIZE),
  ));
  return sortByDue(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
}

export async function setTaskStatus(taskId, status) {
  await updateDoc(doc(db, 'tasks', taskId), { status, ...meta() });
}

export async function updateTask(taskId, patch) {
  await updateDoc(doc(db, 'tasks', taskId), { ...patch, ...meta() });
}

export async function deleteTask(taskId) {
  await deleteDoc(doc(db, 'tasks', taskId));
}
