/**
 * Firebase Functions — Doprovázení CRM (MVP)
 *
 * DEAKTIVOVÁNO (non-MVP / nákladné operace):
 *
 *   1. onFinalize triggery pro Vertex AI / OCR
 *      → Spouštěly se při každém nahrání souboru do Cloud Storage.
 *      → Volaly Vertex AI vision (drahé, latentní, V8 feature).
 *      → Trvale vypnuto: export komentován, trigger neregistrován.
 *
 *   2. Marketplace transakce (db.runTransaction)
 *      → Marketplace modul není součástí MVP.
 *      → Transakční logika je odstraněna — žádný partial commit risk.
 *
 *   3. Běžné auditní logy do Firestore
 *      → Každá CRUD operace generovala audit záznam → nákladné čtení/zápis.
 *      → Zachován POUZE zápis kritických chyb (severity=critical).
 *      → Standardní operace: Cloud Logging (nevyžaduje Firestore write).
 *
 * AKTIVNÍ (MVP):
 *   - cleanupExpiredDocs: denní TTL cleanup jako záloha (Firestore TTL je primární)
 *   - onUserRoleWrite:    synchronizace role cache při změně user_roles/{uid}
 */

const { onRequest, onCall }     = require('firebase-functions/v2/https');
const { onDocumentWritten }     = require('firebase-functions/v2/firestore');
// const { onObjectFinalized }  = require('firebase-functions/v2/storage'); // DEAKTIVOVÁNO
const { initializeApp }         = require('firebase-admin/app');
const { getFirestore, FieldValue, Timestamp } = require('firebase-admin/firestore');
const logger                    = require('firebase-functions/logger');

initializeApp();
const db = getFirestore();

// ════════════════════════════════════════════════════════════
// DEAKTIVOVÁNO: onFinalize Vertex AI / OCR trigger
// ════════════════════════════════════════════════════════════
//
// exports.processUploadedDocument = onObjectFinalized(
//   { region: 'europe-west3', memory: '512MiB' },
//   async (event) => {
//     // DEAKTIVOVÁNO — Vertex AI OCR je non-MVP, příliš nákladné.
//     // V8: implementovat až po MVP release s explicitním souhlasem uživatele.
//     // const result = await callVertexVision(event.data.bucket, event.data.name);
//   }
// );

// ════════════════════════════════════════════════════════════
// DEAKTIVOVÁNO: Marketplace transakce
// ════════════════════════════════════════════════════════════
//
// exports.executeMarketplaceTransaction = onCall(async (request) => {
//   // DEAKTIVOVÁNO — Marketplace není MVP modul.
//   // db.runTransaction zde způsoboval deadlocky při souběžných operacích.
//   // throw new Error('Marketplace není dostupný v MVP verzi.');
// });

// ════════════════════════════════════════════════════════════
// DEAKTIVOVÁNO: Běžné auditní logy (nahrazeno Cloud Logging)
// ════════════════════════════════════════════════════════════
//
// Původní pattern (odstraněn):
//   async function writeAuditLog(tenantId, entry) {
//     await db.collection('tenants').doc(tenantId)
//       .collection('audit_log').add({ ...entry, timestamp: FieldValue.serverTimestamp() });
//   }
//
// Náhrada: logger.info() → Cloud Logging (žádné Firestore write, nulové náklady).

function logAudit(level, message, payload) {
  if (level === 'critical') {
    // Kritické chyby: Cloud Logging + zápis do Firestore (viditelné ve správě)
    logger.error(message, payload);
    return payload.tenantId
      ? db.collection('tenants').doc(payload.tenantId)
          .collection('audit_log')
          .add({ ...payload, severity: 'critical', timestamp: FieldValue.serverTimestamp() })
      : Promise.resolve();
  }
  // Běžné operace: POUZE Cloud Logging — žádný Firestore write
  logger.info(message, payload);
  return Promise.resolve();
}

// ════════════════════════════════════════════════════════════
// AKTIVNÍ: Role change listener
// Invaliduje client-side cache při změně user_roles/{uid}.
// ════════════════════════════════════════════════════════════

exports.onUserRoleWrite = onDocumentWritten(
  { document: 'user_roles/{uid}', region: 'europe-west3' },
  async (event) => {
    const uid     = event.params.uid;
    const newData = event.data?.after?.data();
    const oldData = event.data?.before?.data();

    if (!newData) {
      await logAudit('critical', `user_roles/${uid} smazán`, { uid, severity: 'critical', tenantId: oldData?.tenantId });
      return;
    }

    // Logovat změnu role jako kritickou událost (ne běžný audit)
    if (oldData?.role !== newData.role) {
      await logAudit('critical', `Role změněna: ${uid}`, {
        uid,
        tenantId: newData.tenantId,
        oldRole:  oldData?.role ?? 'none',
        newRole:  newData.role,
        severity: 'critical',
      });
    } else {
      // Standardní update (caps, assignedFamilies) → jen Cloud Logging
      logAudit('info', `user_roles/${uid} aktualizován`, { uid, tenantId: newData.tenantId });
    }
  }
);

// ════════════════════════════════════════════════════════════
// AKTIVNÍ: TTL cleanup (záloha za Firestore nativní TTL)
// Firestore TTL je primární mechanismus — tato funkce je záloha.
// Spouštěna ručně nebo schedule (viz firebase.json).
// ════════════════════════════════════════════════════════════

exports.cleanupExpiredDocs = onCall(
  { region: 'europe-west3', invoker: 'service-account' },
  async (request) => {
    const now = Timestamp.now();
    const subcollections = ['shared_links', 'gdpr_requests', 'ephemeral_assignments'];
    let totalDeleted = 0;

    // Iteruje jen přes tenantId z requestu (nikdy cross-tenant cleanup)
    const tenantId = request.data?.tenantId;
    if (!tenantId) throw new Error('tenantId je povinný');

    for (const subcol of subcollections) {
      const expired = await db
        .collection('tenants').doc(tenantId)
        .collection(subcol)
        .where('expiresAt', '<', now)
        .limit(500)  // dávkové mazání, max 500 per volání
        .get();

      const batch = db.batch();
      expired.docs.forEach(d => batch.delete(d.ref));
      if (!expired.empty) {
        await batch.commit();
        totalDeleted += expired.size;
        logAudit('info', `TTL cleanup: ${subcol} (${expired.size} docs)`, { tenantId, subcol });
      }
    }

    return { deleted: totalDeleted };
  }
);
