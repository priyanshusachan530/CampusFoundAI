import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Search,
  Filter,
  Sparkles,
  MapPin,
  Calendar,
  AlertCircle,
  X,
  Layers,
  ArrowUpDown
} from "lucide-react";
import { getItems } from "../utils/storage.js";
import { CATEGORIES, LOCATIONS } from "../data/mockItems.js";
import { parseNaturalLanguageQuery } from "../utils/aiMatcher.js";
import ItemCard from "../components/ItemCard.jsx";
import SearchBar from "../components/SearchBar.jsx";

export default function SearchItems() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);

  // Filter states
  const initialType = searchParams.get("type") || "all";
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [typeFilter, setTypeFilter] = useState(initialType);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [colorFilter, setColorFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest

  useEffect(() => {
    setItems(getItems());

    const handleUpdate = () => {
      setItems(getItems());
    };
    window.addEventListener("campuslink_data_updated", handleUpdate);
    return () => window.removeEventListener("campuslink_data_updated", handleUpdate);
  }, []);

  // Update query state if URL params change
  useEffect(() => {
    const urlType = searchParams.get("type");
    const urlQ = searchParams.get("q");
    if (urlType) setTypeFilter(urlType);
    if (urlQ !== null && urlQ !== undefined) setQuery(urlQ);
  }, [searchParams]);

  // Handle NLP parsing if user typed query
  const nlpExtracted = useMemo(() => {
    if (!query.trim()) return null;
    return parseNaturalLanguageQuery(query);
  }, [query]);

  // Apply NLP suggestions automatically if user hasn't manually selected filters
  const effectiveCategory = categoryFilter || (nlpExtracted?.category && !categoryFilter ? nlpExtracted.category : "");
  const effectiveLocation = locationFilter || (nlpExtracted?.location && !locationFilter ? nlpExtracted.location : "");
  const effectiveColor = colorFilter || (nlpExtracted?.color && !colorFilter ? nlpExtracted.color : "");
  const effectiveType = typeFilter !== "all" ? typeFilter : (nlpExtracted?.type || "all");

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // 1. Type filter
      if (effectiveType !== "all" && item.type !== effectiveType) {
        return false;
      }

      // 2. Category filter
      if (effectiveCategory && item.category.toLowerCase() !== effectiveCategory.toLowerCase()) {
        return false;
      }

      // 3. Location filter
      if (effectiveLocation && item.location.toLowerCase() !== effectiveLocation.toLowerCase()) {
        return false;
      }

      // 4. Color filter
      if (effectiveColor && !item.color.toLowerCase().includes(effectiveColor.toLowerCase())) {
        return false;
      }

      // 5. Text Search (keyword match across title, description, brand, location details)
      if (query.trim()) {
        const textToSearch = `${item.title} ${item.description} ${item.brand || ""} ${item.locationDetails || ""} ${item.category}`.toLowerCase();
        
        // If NLP extracted structured traits, also check if any query words match
        const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
        if (queryWords.length > 0) {
          const matchesAnyWord = queryWords.some((word) => textToSearch.includes(word));
          if (!matchesAnyWord) return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "oldest") {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [items, effectiveType, effectiveCategory, effectiveLocation, effectiveColor, query, sortBy]);

  const handleResetFilters = () => {
    setQuery("");
    setTypeFilter("all");
    setCategoryFilter("");
    setLocationFilter("");
    setColorFilter("");
    setSearchParams({});
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[lightblue] dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                CAMPUS CATALOG
              </span>
              <span className="text-xs text-slate-400">Natural Language & Keyword Search</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
              Search Lost & Found Belongings
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Explore reported lost and recovered items across all campus departments.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/report-lost"
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition"
            >
              + Report Lost
            </Link>
            <Link
              to="/report-found"
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition"
            >
              + Report Found
            </Link>
          </div>
        </div>

        {/* Smart Search Bar Component */}
        <SearchBar
          query={query}
          setQuery={setQuery}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          locationFilter={locationFilter}
          setLocationFilter={setLocationFilter}
          onSearch={(q) => {
            setSearchParams({ q, type: typeFilter });
          }}
        />

        {/* NLP Extraction feedback banner if NLP detected traits */}
        {nlpExtracted && (nlpExtracted.category || nlpExtracted.location || nlpExtracted.color) && (
          <div className="p-3 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>
                <strong>Smart Query Recognition:</strong>{" "}
                {nlpExtracted.category && <span className="underline mr-2">Category: {nlpExtracted.category}</span>}
                {nlpExtracted.location && <span className="underline mr-2">Location: {nlpExtracted.location}</span>}
                {nlpExtracted.color && <span className="underline mr-2">Color: {nlpExtracted.color}</span>}
              </span>
            </div>
            <button
              onClick={handleResetFilters}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Clear NLP interpretation
            </button>
          </div>
        )}

        {/* Active Filters Summary & Count Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-slate-100">
              {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"} found
            </span>
            {(query || typeFilter !== "all" || categoryFilter || locationFilter || colorFilter) && (
              <button
                id="clear-all-filters-btn"
                onClick={handleResetFilters}
                className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1 ml-2"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span>Sort by:</span>
            <select
              id="sort-by-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="py-1 px-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-hidden font-medium"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Results Grid */}
        {filteredItems.length === 0 ? (
          <div className="py-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-xs">
            <AlertCircle className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No matching items found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              We couldn't find any campus records matching your search criteria. Try loosening your keywords or reset active filters.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-xl text-xs transition"
              >
                Reset All Filters
              </button>
              <Link
                to="/report-lost"
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-xs transition shadow-xs"
              >
                Report Missing Item
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
