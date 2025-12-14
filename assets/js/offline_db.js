const OFFLINE_DB_NAME = "portal_eventos_offline";
const OFFLINE_DB_VERSION = 2; 

function openOfflineDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(OFFLINE_DB_NAME, OFFLINE_DB_VERSION);

    req.onupgradeneeded = () => {
      const db = req.result;

      if (!db.objectStoreNames.contains("participantes")) {
        const s = db.createObjectStore("participantes", { keyPath: "localId" });
        s.createIndex("email", "email", { unique: true });
        s.createIndex("servidorId", "servidorId", { unique: false });
      } else {
        const s = req.transaction.objectStore("participantes");
        if (!s.indexNames.contains("email")) s.createIndex("email", "email", { unique: true });
        if (!s.indexNames.contains("servidorId")) s.createIndex("servidorId", "servidorId", { unique: false });
      }

      if (!db.objectStoreNames.contains("eventos_cache")) {
        db.createObjectStore("eventos_cache", { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains("pendencias")) {
        const p = db.createObjectStore("pendencias", { keyPath: "id" });
        p.createIndex("tipo", "tipo", { unique: false });
      } else {
        const p = req.transaction.objectStore("pendencias");
        if (!p.indexNames.contains("tipo")) p.createIndex("tipo", "tipo", { unique: false });
      }

      if (!db.objectStoreNames.contains("inscricoes_cache")) {
        const s = db.createObjectStore("inscricoes_cache", { keyPath: "id" });
        s.createIndex("usuarioId", "usuarioId", { unique: false });
        s.createIndex("eventoId", "eventoId", { unique: false });
        s.createIndex("status", "status", { unique: false });
      }

      if (!db.objectStoreNames.contains("presencas_cache")) {
        const s = db.createObjectStore("presencas_cache", { keyPath: "id" });
        s.createIndex("usuarioId", "usuarioId", { unique: false });
        s.createIndex("eventoId", "eventoId", { unique: false });
        s.createIndex("status", "status", { unique: false });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function dbPut(store, value) {
  const db = await openOfflineDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readwrite");
    tx.objectStore(store).put(value);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

async function dbGetAll(store) {
  const db = await openOfflineDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readonly");
    const req = tx.objectStore(store).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

async function dbDelete(store, key) {
  const db = await openOfflineDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readwrite");
    tx.objectStore(store).delete(key);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

async function dbGetByIndex(store, indexName, value) {
  const db = await openOfflineDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readonly");
    const idx = tx.objectStore(store).index(indexName);
    const req = idx.get(value);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

async function dbGetAllByIndex(store, indexName, value) {
  const db = await openOfflineDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readonly");
    const idx = tx.objectStore(store).index(indexName);
    const req = idx.getAll(value);
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

function uuidv4() {
  if (crypto?.randomUUID) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
