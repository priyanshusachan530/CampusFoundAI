/**
 * Campus Search Engine with Natural Language Query Parsing & Multi-attribute Filtering
 */

import { CATEGORIES, LOCATIONS } from "../data/mockItems.js";

/**
 * Parses natural language input (e.g., "black wallet near library")
 * Extracts: color, category, location, type, keywords
 */
export function parseNaturalLanguageQuery(query = "") {
  const lower = query.toLowerCase().trim();
  const parsed = {
    category: "",
    location: "",
    color: "",
    type: "",
    keywords: query
  };

  if (!lower) return parsed;

  // Detect type
  if (lower.includes("lost")) parsed.type = "lost";
  else if (lower.includes("found")) parsed.type = "found";

  // Detect category
  for (const cat of CATEGORIES) {
    const catLower = cat.toLowerCase();
    if (lower.includes(catLower)) {
      parsed.category = cat;
      break;
    }
  }

  // Common aliases for categories
  if (!parsed.category) {
    if (lower.includes("phone") || lower.includes("mobile") || lower.includes("iphone") || lower.includes("samsung")) {
      parsed.category = "Mobile Phone";
    } else if (lower.includes("bottle") || lower.includes("flask") || lower.includes("sipper")) {
      parsed.category = "Water Bottle";
    } else if (lower.includes("headphone") || lower.includes("earphone") || lower.includes("airpod") || lower.includes("earbud")) {
      parsed.category = "Earphones / Headphones";
    } else if (lower.includes("id card") || lower.includes("campus card") || lower.includes("rfid") || lower.includes("identity card")) {
      parsed.category = "ID Card";
    } else if (lower.includes("calculator") || lower.includes("casio") || lower.includes("scientific")) {
      parsed.category = "Calculator";
    } else if (lower.includes("laptop") || lower.includes("notebook") || lower.includes("macbook")) {
      parsed.category = "Laptop";
    } else if (lower.includes("key") || lower.includes("keychain") || lower.includes("fob")) {
      parsed.category = "Keys";
    } else if (lower.includes("bag") || lower.includes("backpack") || lower.includes("pouch")) {
      parsed.category = "Bag";
    }
  }

  // Detect location
  for (const loc of LOCATIONS) {
    const locLower = loc.toLowerCase();
    if (lower.includes(locLower)) {
      parsed.location = loc;
      break;
    }
  }

  // Detect colors
  const colorList = [
    "black", "blue", "silver", "white", "grey", "gray", "red", "green", 
    "brown", "yellow", "purple", "pink", "gold", "orange"
  ];
  for (const c of colorList) {
    if (lower.includes(c)) {
      parsed.color = c;
      break;
    }
  }

  return parsed;
}

/**
 * Filters items based on search parameters:
 * query, type, category, location, color, brand, date, status
 */
export function filterItems(items = [], filters = {}) {
  const {
    query = "",
    type = "all",
    category = "all",
    location = "all",
    color = "all",
    brand = "",
    status = "all",
    sortBy = "newest"
  } = filters;

  const searchTokens = query
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter((t) => t.length > 0 && !["near", "at", "in", "on", "the", "a", "an", "i", "lost", "found"].includes(t));

  return items
    .filter((item) => {
      // 1. Type filter
      if (type !== "all" && item.type !== type) return false;

      // 2. Category filter
      if (category !== "all" && item.category !== category) return false;

      // 3. Location filter
      if (location !== "all" && item.location !== location) return false;

      // 4. Color filter
      if (color !== "all") {
        const itemColor = (item.color || "").toLowerCase();
        if (!itemColor.includes(color.toLowerCase())) return false;
      }

      // 5. Brand filter
      if (brand && brand.trim()) {
        const itemBrand = (item.brand || "").toLowerCase();
        if (!itemBrand.includes(brand.toLowerCase().trim())) return false;
      }

      // 6. Status filter
      if (status !== "all" && item.status !== status) return false;

      // 7. Text Query Match (Search across name, category, description, location, color, brand)
      if (searchTokens.length > 0) {
        const searchableText = [
          item.itemName || item.title || "",
          item.category || "",
          item.description || "",
          item.location || "",
          item.locationDetails || "",
          item.color || "",
          item.brand || ""
        ].join(" ").toLowerCase();

        // Must match at least one significant token
        const hasMatch = searchTokens.some((token) => searchableText.includes(token));
        if (!hasMatch) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "oldest") {
        return new Date(a.createdAt || a.date) - new Date(b.createdAt || b.date);
      }
      // default: newest
      return new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date);
    });
}
