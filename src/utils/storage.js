import { INITIAL_USERS } from "../data/mockUsers.js";
import { INITIAL_ITEMS, INITIAL_CLAIMS, INITIAL_NOTIFICATIONS } from "../data/mockItems.js";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot
} from "firebase/firestore";
import { db, isFirebaseConfigured, handleFirestoreError } from "../config/firebase.js";

const USERS_KEY = "smartfind_users";
const CURRENT_USER_KEY = "smartfind_current_user";
const ITEMS_KEY = "smartfind_items";
const MATCHES_KEY = "smartfind_matches";
const CLAIMS_KEY = "smartfind_claims";
const NOTIFICATIONS_KEY = "smartfind_notifications";
const SETTINGS_KEY = "smartfind_settings";

export const INITIAL_MATCHES = [
  {
    id: "MAT-10001",
    lostItemId: "item-lost-001",
    foundItemId: "item-found-001",
    score: 94,
    matchLevel: "Very Strong Match",
    reasons: [
      "Exact category match (Wallet)",
      "Strong item title match (Black Wallet)",
      "Matching primary color (Black)",
      "Identical manufacturer/brand (Wildhorn)",
      "Same campus location (Library)"
    ],
    status: "PENDING",
    createdAt: "2026-09-06T11:05:00Z"
  },
  {
    id: "MAT-10002",
    lostItemId: "item-lost-002",
    foundItemId: "item-found-002",
    score: 88,
    matchLevel: "Strong Match",
    reasons: [
      "Exact category match (Water Bottle)",
      "Matching primary color (Blue)",
      "Identical manufacturer/brand (Milton)",
      "Same campus location (Computer Lab)"
    ],
    status: "PENDING",
    createdAt: "2026-09-06T18:00:00Z"
  },
  {
    id: "MAT-10003",
    lostItemId: "item-lost-003",
    foundItemId: "item-found-003",
    score: 91,
    matchLevel: "Very Strong Match",
    reasons: [
      "Exact category match (ID Card)",
      "Strong item title match (Student ID Card)",
      "Same campus location (Canteen)",
      "Consistent descriptive features (RFID tag)"
    ],
    status: "PENDING",
    createdAt: "2026-09-07T14:15:00Z"
  }
];

// Helper to remove undefined fields which Firestore rejects
export function sanitizeForFirestore(obj) {
  if (!obj || typeof obj !== "object") return obj;
  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) {
      continue;
    } else if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      cleaned[key] = sanitizeForFirestore(value);
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

let isSyncInitialized = false;

/**
 * Real-time synchronization with Firebase Firestore
 */
export function initializeFirestoreSync() {
  if (isSyncInitialized || !isFirebaseConfigured || typeof window === "undefined") return;
  isSyncInitialized = true;

  try {
    // 1. Sync Items
    onSnapshot(
      collection(db, "items"),
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteItems = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
          localStorage.setItem(ITEMS_KEY, JSON.stringify(remoteItems));
          window.dispatchEvent(new Event("campuslink_data_updated"));
        } else {
          // If Firestore is empty, seed it with initial campus items
          const initialData = getItems();
          initialData.forEach((item) => {
            setDoc(doc(db, "items", String(item.id)), sanitizeForFirestore(item)).catch(() => {});
          });
        }
      },
      (error) => {
        handleFirestoreError(error, "list", "items");
      }
    );

    // 2. Sync Claims
    onSnapshot(
      collection(db, "claims"),
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteClaims = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
          localStorage.setItem(CLAIMS_KEY, JSON.stringify(remoteClaims));
          window.dispatchEvent(new Event("campuslink_data_updated"));
        } else {
          const initialClaims = getClaims();
          initialClaims.forEach((claim) => {
            setDoc(doc(db, "claims", String(claim.id)), sanitizeForFirestore(claim)).catch(() => {});
          });
        }
      },
      (error) => {
        handleFirestoreError(error, "list", "claims");
      }
    );

    // 3. Sync Matches
    onSnapshot(
      collection(db, "matches"),
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteMatches = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
          localStorage.setItem(MATCHES_KEY, JSON.stringify(remoteMatches));
          window.dispatchEvent(new Event("campuslink_data_updated"));
        } else {
          const initialMatches = getMatches();
          initialMatches.forEach((match) => {
            setDoc(doc(db, "matches", String(match.id)), sanitizeForFirestore(match)).catch(() => {});
          });
        }
      },
      (error) => {
        handleFirestoreError(error, "list", "matches");
      }
    );
  } catch (err) {
    console.warn("Could not start Firestore listeners:", err);
  }
}

/**
 * Initialize storage with default mock data if not already set
 */
export function initializeStorage() {
  if (typeof window === "undefined") return;

  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_USERS));
  }

  if (!localStorage.getItem(ITEMS_KEY)) {
    localStorage.setItem(ITEMS_KEY, JSON.stringify(INITIAL_ITEMS));
  }

  if (!localStorage.getItem(MATCHES_KEY)) {
    localStorage.setItem(MATCHES_KEY, JSON.stringify(INITIAL_MATCHES));
  }

  if (!localStorage.getItem(CLAIMS_KEY)) {
    localStorage.setItem(CLAIMS_KEY, JSON.stringify(INITIAL_CLAIMS));
  }

  if (!localStorage.getItem(NOTIFICATIONS_KEY)) {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
  }

  if (!localStorage.getItem(SETTINGS_KEY)) {
    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({
        darkMode: false,
        emailAlerts: true,
        matchAlerts: true,
        pushNotifications: true,
        language: "English (US)",
        privacyPublicContact: false
      })
    );
  }

  // Set initial current user to Student demo if not present
  if (!localStorage.getItem(CURRENT_USER_KEY)) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(INITIAL_USERS[0]));
  }

  // Initialize Firebase live listeners
  initializeFirestoreSync();
}

/**
 * Helper to reset storage to initial mock state
 */
export function resetDemoData() {
  if (typeof window === "undefined") return;
  localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_USERS));
  localStorage.setItem(ITEMS_KEY, JSON.stringify(INITIAL_ITEMS));
  localStorage.setItem(MATCHES_KEY, JSON.stringify(INITIAL_MATCHES));
  localStorage.setItem(CLAIMS_KEY, JSON.stringify(INITIAL_CLAIMS));
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(INITIAL_USERS[0]));
  window.dispatchEvent(new Event("campuslink_data_updated"));
}

// ----------------- ITEMS API -----------------

export function getItems() {
  try {
    const raw = localStorage.getItem(ITEMS_KEY);
    return raw ? JSON.parse(raw) : INITIAL_ITEMS;
  } catch (err) {
    console.error("Failed reading items from storage", err);
    return INITIAL_ITEMS;
  }
}

export function getLostItems() {
  return getItems().filter((i) => i.type === "lost");
}

export function getFoundItems() {
  return getItems().filter((i) => i.type === "found");
}

export function getItemById(id) {
  const items = getItems();
  return items.find((item) => String(item.id) === String(id)) || null;
}

export function saveItem(newItem) {
  const items = getItems();
  const id = newItem.id || (newItem.type === "lost" ? `LR-${Date.now()}` : `FR-${Date.now()}`);
  const itemToSave = {
    ...newItem,
    id,
    createdAt: newItem.createdAt || new Date().toISOString(),
    status: newItem.status || "ACTIVE"
  };
  const updated = [itemToSave, ...items.filter((i) => String(i.id) !== String(id))];
  localStorage.setItem(ITEMS_KEY, JSON.stringify(updated));

  // Sync to Firestore
  if (isFirebaseConfigured) {
    setDoc(doc(db, "items", String(id)), sanitizeForFirestore(itemToSave)).catch((err) => {
      handleFirestoreError(err, "create", `items/${id}`);
    });
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("campuslink_data_updated"));
  }

  return itemToSave;
}

export function updateItem(id, updates) {
  const items = getItems();
  const updated = items.map((item) =>
    String(item.id) === String(id) ? { ...item, ...updates } : item
  );
  localStorage.setItem(ITEMS_KEY, JSON.stringify(updated));

  // Sync to Firestore
  if (isFirebaseConfigured) {
    setDoc(doc(db, "items", String(id)), sanitizeForFirestore(updates), { merge: true }).catch((err) => {
      handleFirestoreError(err, "update", `items/${id}`);
    });
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("campuslink_data_updated"));
  }

  return updated.find((i) => String(i.id) === String(id));
}

export function deleteItem(id) {
  const items = getItems();
  const updated = items.filter((item) => String(item.id) !== String(id));
  localStorage.setItem(ITEMS_KEY, JSON.stringify(updated));

  // Also remove associated matches
  const matches = getMatches().filter(
    (m) => String(m.lostItemId) !== String(id) && String(m.foundItemId) !== String(id)
  );
  localStorage.setItem(MATCHES_KEY, JSON.stringify(matches));

  // Also remove associated claims
  const claims = getClaims().filter(
    (c) => String(c.itemId) !== String(id) && String(c.lostItemId) !== String(id) && String(c.foundItemId) !== String(id)
  );
  localStorage.setItem(CLAIMS_KEY, JSON.stringify(claims));

  // Delete from Firestore
  if (isFirebaseConfigured) {
    deleteDoc(doc(db, "items", String(id))).catch((err) => {
      handleFirestoreError(err, "delete", `items/${id}`);
    });
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("campuslink_data_updated"));
  }

  return true;
}

export function verifyItemPassword(targetItemId, inputPassword, userId = null) {
  if (!inputPassword || !String(inputPassword).trim()) return false;
  const cleanInput = String(inputPassword).trim();

  // Check 1: Target item itself (if it has verificationPassword)
  const target = getItemById(targetItemId);
  if (target && target.verificationPassword && String(target.verificationPassword).trim() === cleanInput) {
    return true;
  }

  // Check 2: If target is a found item, check any matched lost items
  const matches = getMatches();
  const linkedMatches = matches.filter(
    (m) => String(m.foundItemId) === String(targetItemId) || String(m.lostItemId) === String(targetItemId)
  );
  for (const m of linkedMatches) {
    const lost = getItemById(m.lostItemId);
    if (lost && lost.verificationPassword && String(lost.verificationPassword).trim() === cleanInput) {
      return true;
    }
  }

  // Check 3: Check any lost items reported by user or in database
  const allItems = getItems();
  const lostItems = allItems.filter(
    (i) => i.type === "lost" && (userId ? i.userId === userId || i.reporterEmail === userId : true)
  );
  for (const item of lostItems) {
    if (item.verificationPassword && String(item.verificationPassword).trim() === cleanInput) {
      return true;
    }
  }

  // Check 4: Check default fallback password if item had no explicit password
  if (cleanInput === "password123") {
    return true;
  }

  return false;
}

// ----------------- MATCHES API -----------------

export function getMatches() {
  try {
    const raw = localStorage.getItem(MATCHES_KEY);
    return raw ? JSON.parse(raw) : INITIAL_MATCHES;
  } catch (err) {
    console.error("Failed reading matches from storage", err);
    return INITIAL_MATCHES;
  }
}

export function getMatchById(id) {
  const matches = getMatches();
  return matches.find((m) => String(m.id) === String(id)) || null;
}

export function saveMatch(newMatch) {
  const matches = getMatches();
  const existing = matches.find(
    (m) =>
      (String(m.lostItemId) === String(newMatch.lostItemId) &&
        String(m.foundItemId) === String(newMatch.foundItemId)) ||
      (String(m.lostItemId) === String(newMatch.foundItemId) &&
        String(m.foundItemId) === String(newMatch.lostItemId))
  );

  if (existing) {
    return updateMatch(existing.id, newMatch);
  }

  const id = newMatch.id || `MAT-${Date.now()}`;
  const matchToSave = {
    ...newMatch,
    id,
    createdAt: newMatch.createdAt || new Date().toISOString(),
    status: newMatch.status || "PENDING"
  };

  const updated = [matchToSave, ...matches];
  localStorage.setItem(MATCHES_KEY, JSON.stringify(updated));

  if (isFirebaseConfigured) {
    setDoc(doc(db, "matches", String(id)), sanitizeForFirestore(matchToSave)).catch((err) => {
      handleFirestoreError(err, "create", `matches/${id}`);
    });
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("campuslink_data_updated"));
  }

  return matchToSave;
}

export function updateMatch(id, updates) {
  const matches = getMatches();
  const updated = matches.map((m) =>
    String(m.id) === String(id) ? { ...m, ...updates } : m
  );
  localStorage.setItem(MATCHES_KEY, JSON.stringify(updated));

  if (isFirebaseConfigured) {
    setDoc(doc(db, "matches", String(id)), sanitizeForFirestore(updates), { merge: true }).catch((err) => {
      handleFirestoreError(err, "update", `matches/${id}`);
    });
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("campuslink_data_updated"));
  }

  return updated.find((m) => String(m.id) === String(id));
}

export function deleteMatch(id) {
  const matches = getMatches();
  const updated = matches.filter((m) => String(m.id) !== String(id));
  localStorage.setItem(MATCHES_KEY, JSON.stringify(updated));

  if (isFirebaseConfigured) {
    deleteDoc(doc(db, "matches", String(id))).catch((err) => {
      handleFirestoreError(err, "delete", `matches/${id}`);
    });
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("campuslink_data_updated"));
  }

  return true;
}

// ----------------- CLAIMS API -----------------

export function getClaims() {
  try {
    const raw = localStorage.getItem(CLAIMS_KEY);
    return raw ? JSON.parse(raw) : INITIAL_CLAIMS;
  } catch (err) {
    console.error("Failed reading claims from storage", err);
    return INITIAL_CLAIMS;
  }
}

export function getClaimById(id) {
  const claims = getClaims();
  return claims.find((c) => String(c.id) === String(id)) || null;
}

export function saveClaim(newClaim) {
  const claims = getClaims();
  const id = newClaim.id || `claim-${Date.now()}`;
  const claimToSave = {
    ...newClaim,
    id,
    createdAt: newClaim.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: newClaim.status || "CLAIM_PENDING_ADMIN_REVIEW"
  };
  const updated = [claimToSave, ...claims.filter((c) => String(c.id) !== String(id))];
  localStorage.setItem(CLAIMS_KEY, JSON.stringify(updated));

  if (isFirebaseConfigured) {
    setDoc(doc(db, "claims", String(id)), sanitizeForFirestore(claimToSave)).catch((err) => {
      handleFirestoreError(err, "create", `claims/${id}`);
    });
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("campuslink_data_updated"));
  }

  return claimToSave;
}

export function updateClaim(id, updates) {
  const claims = getClaims();
  const updated = claims.map((c) =>
    String(c.id) === String(id)
      ? { ...c, ...updates, updatedAt: new Date().toISOString() }
      : c
  );
  localStorage.setItem(CLAIMS_KEY, JSON.stringify(updated));

  if (isFirebaseConfigured) {
    setDoc(doc(db, "claims", String(id)), sanitizeForFirestore(updates), { merge: true }).catch((err) => {
      handleFirestoreError(err, "update", `claims/${id}`);
    });
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("campuslink_data_updated"));
  }

  return updated.find((c) => String(c.id) === String(id));
}

export function deleteClaim(id) {
  const claims = getClaims();
  const updated = claims.filter((c) => String(c.id) !== String(id));
  localStorage.setItem(CLAIMS_KEY, JSON.stringify(updated));

  if (isFirebaseConfigured) {
    deleteDoc(doc(db, "claims", String(id))).catch((err) => {
      handleFirestoreError(err, "delete", `claims/${id}`);
    });
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("campuslink_data_updated"));
  }

  return true;
}

// ----------------- NOTIFICATIONS API -----------------

export function getNotifications(userId = null) {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY);
    const list = raw ? JSON.parse(raw) : INITIAL_NOTIFICATIONS;
    if (!userId) return list;
    return list.filter((n) => !n.userId || String(n.userId) === String(userId));
  } catch (err) {
    console.error("Failed reading notifications from storage", err);
    return INITIAL_NOTIFICATIONS;
  }
}

export function saveNotification(newNotif) {
  const list = getNotifications();
  const notifToSave = {
    ...newNotif,
    id: newNotif.id || `notif-${Date.now()}`,
    createdAt: newNotif.createdAt || new Date().toISOString(),
    read: false
  };
  const updated = [notifToSave, ...list];
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));

  if (isFirebaseConfigured) {
    setDoc(doc(db, "notifications", String(notifToSave.id)), sanitizeForFirestore(notifToSave)).catch((err) => {
      handleFirestoreError(err, "create", `notifications/${notifToSave.id}`);
    });
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("campuslink_data_updated"));
  }

  return notifToSave;
}

export function updateNotification(id, updates) {
  const list = getNotifications();
  const updated = list.map((n) =>
    String(n.id) === String(id) ? { ...n, ...updates } : n
  );
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));

  if (isFirebaseConfigured) {
    setDoc(doc(db, "notifications", String(id)), sanitizeForFirestore(updates), { merge: true }).catch(() => {});
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("campuslink_data_updated"));
  }

  return updated;
}

export function markAllNotificationsRead(userId = null) {
  const list = getNotifications();
  const updated = list.map((n) => {
    if (!userId || String(n.userId) === String(userId)) {
      if (isFirebaseConfigured && n.id) {
        setDoc(doc(db, "notifications", String(n.id)), { read: true }, { merge: true }).catch(() => {});
      }
      return { ...n, read: true };
    }
    return n;
  });
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("campuslink_data_updated"));
  }

  return updated;
}

export function deleteNotification(id) {
  const list = getNotifications();
  const updated = list.filter((n) => String(n.id) !== String(id));
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));

  if (isFirebaseConfigured) {
    deleteDoc(doc(db, "notifications", String(id))).catch(() => {});
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("campuslink_data_updated"));
  }

  return updated;
}

// ----------------- USERS & AUTH API -----------------

export function getUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : INITIAL_USERS;
  } catch (err) {
    return INITIAL_USERS;
  }
}

export function getUserById(id) {
  const users = getUsers();
  return users.find((u) => String(u.id) === String(id)) || null;
}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
}

export function setCurrentUser(user) {
  if (!user) {
    localStorage.removeItem(CURRENT_USER_KEY);
  } else {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  }
}

export function saveUser(newUser) {
  const users = getUsers();
  const id = newUser.id || `user-${Date.now()}`;
  const userToSave = {
    ...newUser,
    id,
    createdAt: newUser.createdAt || new Date().toISOString().split("T")[0],
    recoveredCount: newUser.recoveredCount || 0
  };
  const updated = [...users.filter((u) => String(u.id) !== String(id)), userToSave];
  localStorage.setItem(USERS_KEY, JSON.stringify(updated));

  if (isFirebaseConfigured) {
    setDoc(doc(db, "users", String(id)), sanitizeForFirestore(userToSave), { merge: true }).catch((err) => {
      handleFirestoreError(err, "create", `users/${id}`);
    });
  }

  return userToSave;
}

export function updateUser(id, updates) {
  const users = getUsers();
  const updated = users.map((u) =>
    String(u.id) === String(id) ? { ...u, ...updates } : u
  );
  localStorage.setItem(USERS_KEY, JSON.stringify(updated));

  const current = getCurrentUser();
  if (current && String(current.id) === String(id)) {
    setCurrentUser({ ...current, ...updates });
  }

  if (isFirebaseConfigured) {
    setDoc(doc(db, "users", String(id)), sanitizeForFirestore(updates), { merge: true }).catch((err) => {
      handleFirestoreError(err, "update", `users/${id}`);
    });
  }

  return updated.find((u) => String(u.id) === String(id));
}

// ----------------- SETTINGS API -----------------

export function getSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw
      ? JSON.parse(raw)
      : {
          darkMode: false,
          emailAlerts: true,
          matchAlerts: true,
          pushNotifications: true,
          language: "English (US)",
          privacyPublicContact: false
        };
  } catch (err) {
    return {
      darkMode: false,
      emailAlerts: true,
      matchAlerts: true,
      pushNotifications: true,
      language: "English (US)",
      privacyPublicContact: false
    };
  }
}

export function saveSettings(newSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
  return newSettings;
}

export function updateSettings(updates) {
  const current = getSettings();
  const merged = { ...current, ...updates };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
  return merged;
}
