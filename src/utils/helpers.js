/**
 * Utility helper functions for Smart Lost & Found Assistant
 */

import { getItems, getClaims, getMatches } from "./storage.js";

/**
 * Generates an incremented Lost Report ID: LR-10001, LR-10002...
 */
export function generateLostReportId() {
  const items = getItems();
  const lostIds = items
    .filter((i) => i.type === "lost" && typeof i.id === "string" && i.id.startsWith("LR-"))
    .map((i) => parseInt(i.id.replace("LR-", ""), 10))
    .filter((n) => !isNaN(n));

  const maxNum = lostIds.length > 0 ? Math.max(...lostIds) : 10000;
  return `LR-${maxNum + 1}`;
}

/**
 * Generates an incremented Found Report ID: FR-10001, FR-10002...
 */
export function generateFoundReportId() {
  const items = getItems();
  const foundIds = items
    .filter((i) => i.type === "found" && typeof i.id === "string" && i.id.startsWith("FR-"))
    .map((i) => parseInt(i.id.replace("FR-", ""), 10))
    .filter((n) => !isNaN(n));

  const maxNum = foundIds.length > 0 ? Math.max(...foundIds) : 10000;
  return `FR-${maxNum + 1}`;
}

/**
 * Generates an incremented Claim ID: CLM-10001, CLM-10002...
 */
export function generateClaimId() {
  const claims = getClaims();
  const claimNums = claims
    .map((c) => {
      const match = String(c.id).match(/\d+/);
      return match ? parseInt(match[0], 10) : 10000;
    })
    .filter((n) => !isNaN(n));

  const maxNum = claimNums.length > 0 ? Math.max(...claimNums) : 10000;
  return `CLM-${maxNum + 1}`;
}

/**
 * Formats a Date object or string
 */
export function formatDate(dateStr) {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr) {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return dateStr;
  }
}

/**
 * Compresses an image File to a safe Base64 JPEG data URL (max dimension 800px)
 * ensuring it stays well within Firestore's 1MB document limit.
 */
export function compressImageFile(file, maxDimension = 800, quality = 0.75) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve("");
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(compressedDataUrl);
      };
      img.onerror = () => resolve(readerEvent.target.result);
      img.src = readerEvent.target.result;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Converts uploaded File to Base64 data URL
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Helper to get status badge CSS classes and readable label
 */
export function getStatusBadge(status) {
  const s = String(status || "").toUpperCase();

  switch (s) {
    case "ACTIVE":
    case "LOST":
      return {
        label: "ACTIVE",
        classes: "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900"
      };
    case "FOUND":
      return {
        label: "FOUND",
        classes: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900"
      };
    case "MATCHED":
      return {
        label: "MATCHED",
        classes: "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-900"
      };
    case "CLAIM_PENDING_ADMIN_REVIEW":
    case "UNDER_REVIEW":
    case "PENDING":
      return {
        label: "CLAIM PENDING",
        classes: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900"
      };
    case "APPROVED_FOR_RETURN":
    case "APPROVED":
      return {
        label: "APPROVED FOR RETURN",
        classes: "bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-900"
      };
    case "SUCCESSFULLY_RECEIVED":
    case "RESOLVED":
    case "COMPLETED":
      return {
        label: "SUCCESSFULLY RECEIVED",
        classes: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900"
      };
    case "REJECTED":
      return {
        label: "REJECTED",
        classes: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
      };
    default:
      return {
        label: status || "UNKNOWN",
        classes: "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700"
      };
  }
}

/**
 * Returns color classes for match percentage
 */
export function getScoreBadge(score) {
  const num = parseInt(score, 10) || 0;
  if (num >= 90) {
    return {
      level: "Very Strong Match",
      classes: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800"
    };
  }
  if (num >= 75) {
    return {
      level: "Strong Match",
      classes: "bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800"
    };
  }
  if (num >= 60) {
    return {
      level: "Possible Match",
      classes: "bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800"
    };
  }
  return {
    level: "Low Confidence Match",
    classes: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800"
  };
}
