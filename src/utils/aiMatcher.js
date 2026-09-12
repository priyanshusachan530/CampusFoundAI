/**
 * AI-Assisted Smart Matching Engine
 * 
 * Implements rule-based multi-attribute similarity matching (0-100%):
 * 1. Category: 25 points
 * 2. Item Name: 20 points
 * 3. Color: 15 points
 * 4. Brand: 15 points
 * 5. Location: 15 points
 * 6. Description: 10 points
 * Total: 100 points
 * 
 * Confidence Labels:
 * 90-100: Very Strong Match
 * 75-89: Strong Match
 * 60-74: Possible Match
 * Below 60: Low Confidence Match
 *
 * Supports bi-directional matching:
 * - Lost -> Found (new Lost report compared against existing Found reports)
 * - Found -> Lost (new Found report compared against existing Lost reports)
 */

import { CATEGORIES, LOCATIONS } from "../data/mockItems.js";
import { saveMatch, updateItem } from "./storage.js";
import { notifyOwnerOfMatch } from "./notificationService.js";

// Basic string token overlap helper
function getWordTokens(text = "") {
  return String(text)
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

function calculateTokenSimilarity(textA = "", textB = "") {
  const tokensA = new Set(getWordTokens(textA));
  const tokensB = new Set(getWordTokens(textB));
  if (tokensA.size === 0 || tokensB.size === 0) return 0;

  let common = 0;
  tokensA.forEach((token) => {
    if (tokensB.has(token)) common++;
  });

  const union = new Set([...tokensA, ...tokensB]).size;
  return union > 0 ? common / union : 0;
}

/**
 * Calculates a match score between a lost item and a found item.
 * Maximum score = 100
 */
export function calculateMatchScore(lostItem, foundItem) {
  if (!lostItem || !foundItem) {
    return { score: 0, label: "Low Confidence Match", matchLevel: "Low Confidence Match", reasons: [] };
  }

  let score = 0;
  const reasons = [];

  const lostName = lostItem.itemName || lostItem.title || "";
  const foundName = foundItem.itemName || foundItem.title || "";

  // 1. Category Match (25 pts)
  if (lostItem.category && foundItem.category) {
    if (lostItem.category.toLowerCase().trim() === foundItem.category.toLowerCase().trim()) {
      score += 25;
      reasons.push(`Exact category match (${lostItem.category})`);
    } else {
      const catA = lostItem.category.toLowerCase();
      const catB = foundItem.category.toLowerCase();
      if (catA.includes(catB) || catB.includes(catA)) {
        score += 15;
        reasons.push(`Related category match (${lostItem.category})`);
      }
    }
  }

  // 2. Name Similarity (20 pts)
  const nameSim = calculateTokenSimilarity(lostName, foundName);
  if (nameSim >= 0.5) {
    score += 20;
    reasons.push("Strong item title match");
  } else if (nameSim > 0.2) {
    const pts = Math.round(20 * nameSim);
    score += Math.max(pts, 12);
    reasons.push("Partial title keywords match");
  } else if (
    lostName &&
    foundName &&
    (lostName.toLowerCase().includes(foundName.toLowerCase()) ||
      foundName.toLowerCase().includes(lostName.toLowerCase()))
  ) {
    score += 18;
    reasons.push("Item title phrase overlap");
  }

  // 3. Color Match (15 pts)
  if (lostItem.color && foundItem.color) {
    const colorA = lostItem.color.toLowerCase().trim();
    const colorB = foundItem.color.toLowerCase().trim();
    const colorList = ["black", "blue", "white", "grey", "gray", "silver", "red", "green", "brown", "yellow", "purple", "pink", "gold", "orange"];

    const matchedColor = colorList.find((c) => colorA.includes(c) && colorB.includes(c));
    if (matchedColor) {
      score += 15;
      reasons.push(`Matching primary color (${matchedColor})`);
    } else if (colorA === colorB && colorA !== "other") {
      score += 15;
      reasons.push(`Exact color match (${lostItem.color})`);
    } else if (colorA.includes(colorB) || colorB.includes(colorA)) {
      score += 10;
      reasons.push("Similar color tones");
    }
  }

  // 4. Brand Match (15 pts)
  if (lostItem.brand && foundItem.brand) {
    const brandA = lostItem.brand.trim().toLowerCase();
    const brandB = foundItem.brand.trim().toLowerCase();
    const ignoreList = ["other", "unknown", "none", "n/a", ""];
    if (!ignoreList.includes(brandA) && !ignoreList.includes(brandB)) {
      if (brandA === brandB) {
        score += 15;
        reasons.push(`Identical manufacturer/brand (${lostItem.brand})`);
      } else if (brandA.includes(brandB) || brandB.includes(brandA)) {
        score += 10;
        reasons.push(`Compatible brand keywords (${lostItem.brand})`);
      }
    }
  }

  // 5. Location Match (15 pts)
  const lostLoc = lostItem.locationLost || lostItem.location || "";
  const foundLoc = foundItem.locationFound || foundItem.location || "";

  if (lostLoc && foundLoc) {
    if (lostLoc.toLowerCase().trim() === foundLoc.toLowerCase().trim()) {
      score += 15;
      reasons.push(`Same campus location (${lostLoc})`);
    } else {
      const locDetailsSim = calculateTokenSimilarity(
        `${lostLoc} ${lostItem.locationDetails || ""}`,
        `${foundLoc} ${foundItem.locationDetails || ""}`
      );
      if (locDetailsSim > 0.2) {
        score += 8;
        reasons.push("Adjacent campus building / area");
      }
    }
  }

  // 6. Description Similarity (10 pts)
  const descSim = calculateTokenSimilarity(lostItem.description || "", foundItem.description || "");
  if (descSim > 0.25) {
    score += 10;
    reasons.push("Consistent descriptive features");
  } else if (descSim > 0.1) {
    score += 6;
    reasons.push("Shared descriptive keywords");
  }

  // Cap score between 0 and 100
  const finalScore = Math.min(Math.max(score, 15), 98);

  let matchLevel = "Low Confidence Match";
  let badgeColor = "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800";
  if (finalScore >= 80) {
    matchLevel = "Very Strong Match";
    badgeColor = "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800";
  } else if (finalScore >= 65) {
    matchLevel = "Strong Match";
    badgeColor = "bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800";
  } else if (finalScore >= 50) {
    matchLevel = "Possible Match";
    badgeColor = "bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800";
  }

  return {
    score: finalScore,
    matchLevel,
    label: matchLevel,
    badgeColor,
    reasons: reasons.length > 0 ? reasons : ["General category similarities detected"]
  };
}

/**
 * Searches across found items to find matches for a given lost item
 */
export function findMatchesForLostItem(lostItem, allItems) {
  const foundItems = allItems.filter(
    (item) =>
      item.type === "found" &&
      item.status !== "SUCCESSFULLY_RECEIVED" &&
      item.status !== "resolved" &&
      String(item.id) !== String(lostItem.id)
  );

  return foundItems
    .map((foundItem) => {
      const match = calculateMatchScore(lostItem, foundItem);
      return {
        lostItem,
        foundItem,
        targetItem: foundItem,
        ...match
      };
    })
    .filter((m) => m.score >= 35)
    .sort((a, b) => b.score - a.score);
}

/**
 * Searches across lost items to find matches for a newly reported found item
 */
export function findMatchesForFoundItem(foundItem, allItems) {
  const lostItems = allItems.filter(
    (item) =>
      item.type === "lost" &&
      item.status !== "SUCCESSFULLY_RECEIVED" &&
      item.status !== "resolved" &&
      String(item.id) !== String(foundItem.id)
  );

  return lostItems
    .map((lostItem) => {
      const match = calculateMatchScore(lostItem, foundItem);
      return {
        lostItem,
        foundItem,
        targetItem: lostItem,
        ...match
      };
    })
    .filter((m) => m.score >= 35)
    .sort((a, b) => b.score - a.score);
}

/**
 * Core automatic matching engine:
 * Runs bi-directional match checks, writes Match records, notifies owner if score is high,
 * and updates item status to MATCHED if confidence >= 60.
 */
export function executeAutomaticMatching(newItem, allItems) {
  const isLost = newItem.type === "lost";
  const potentialMatches = isLost
    ? findMatchesForLostItem(newItem, allItems)
    : findMatchesForFoundItem(newItem, allItems);

  const createdMatches = [];

  for (const match of potentialMatches) {
    if (match.score >= 60) {
      const lostItem = isLost ? newItem : match.targetItem;
      const foundItem = isLost ? match.targetItem : newItem;

      const matchRecord = saveMatch({
        lostItemId: lostItem.id,
        foundItemId: foundItem.id,
        score: match.score,
        matchLevel: match.matchLevel,
        reasons: match.reasons,
        status: "PENDING",
        createdAt: new Date().toISOString()
      });

      createdMatches.push(matchRecord);

      // Notify the owner of the lost item
      notifyOwnerOfMatch({
        lostItem,
        foundItem,
        matchScore: match.score,
        matchReasons: match.reasons
      });

      // Update statuses if currently active
      if (lostItem.status === "ACTIVE" || lostItem.status === "active") {
        updateItem(lostItem.id, { status: "MATCHED" });
      }
      if (foundItem.status === "ACTIVE" || foundItem.status === "active") {
        updateItem(foundItem.id, { status: "MATCHED" });
      }
    }
  }

  return createdMatches;
}

export { parseNaturalLanguageQuery } from "./searchEngine.js";
