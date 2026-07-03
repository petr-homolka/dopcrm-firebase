/**
 * orgService.js — barel pro CRUD nad novým B2B SaaS schématem
 * (organizations / users / foster_families / children).
 *
 * Implementace je rozdělená po doménách v `src/services/org/` — tento soubor
 * jen re-exportuje veřejné API, aby všechny existující importy
 * `from '.../services/orgService.js'` fungovaly beze změny.
 *
 * Viz firestore.rules "SEKCE B" pro přesná oprávnění. Shrnutí:
 *   superadmin    — vše, napříč organizacemi
 *   org_admin     — vše ve VLASTNÍ organizaci (users, foster_families, children)
 *   klicova_osoba — čte celou organizaci, ale zapisuje/maže jen "své" rodiny/děti
 *                   (assignedTo == její uid)
 */

export * from './org/organizations.js';
export * from './org/employees.js';
export * from './org/fosterFamilies.js';
export * from './org/respit.js';
export * from './org/children.js';
export * from './org/events.js';
