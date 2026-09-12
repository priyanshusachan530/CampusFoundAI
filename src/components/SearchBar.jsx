import React, { useState } from "react";
import { Search, Sparkles, X, Filter } from "lucide-react";
import { CATEGORIES, LOCATIONS } from "../data/mockItems.js";

export default function SearchBar({
  query,
  setQuery,
  typeFilter,
  setTypeFilter,
  categoryFilter,
  setCategoryFilter,
  locationFilter,
  setLocationFilter,
  onSearch,
  showFilters = true
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const samplePrompts = [
    "black wallet near library",
    "blue water bottle lab",
    "student ID card canteen",
    "TI-84 calculator classroom"
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(query);
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {/* Main Search Input */}
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-slate-400 pointer-events-none" />
          <input
            id="smart-search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Try natural search: "black wallet near library" or "blue bottle"...'
            className="w-full pl-11 pr-24 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition"
          />
          <div className="absolute right-2.5 flex items-center gap-1.5">
            {query && (
              <button
                type="button"
                id="search-clear-btn"
                onClick={() => setQuery("")}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              id="search-submit-btn"
              className="px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition shadow-xs flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Search</span>
            </button>
          </div>
        </div>

        {/* Natural Language Prompt Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 pt-1">
          <span className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300 mr-1">
            <Sparkles className="w-3 h-3 text-indigo-500" />
            AI suggestions:
          </span>
          {samplePrompts.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              id={`suggested-prompt-${idx}`}
              onClick={() => {
                setQuery(prompt);
                if (onSearch) onSearch(prompt);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-400 border border-slate-200/60 dark:border-slate-700/60 transition"
            >
              "{prompt}"
            </button>
          ))}
        </div>

        {/* Toggle Filters & Filter Bars */}
        {showFilters && (
          <div className="mt-1 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Type Switcher Pills */}
              <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300">
                <button
                  type="button"
                  id="filter-type-all"
                  onClick={() => setTypeFilter("all")}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    typeFilter === "all"
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold"
                      : "hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  All Items
                </button>
                <button
                  type="button"
                  id="filter-type-lost"
                  onClick={() => setTypeFilter("lost")}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    typeFilter === "lost"
                      ? "bg-rose-600 text-white shadow-xs font-semibold"
                      : "hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Lost
                </button>
                <button
                  type="button"
                  id="filter-type-found"
                  onClick={() => setTypeFilter("found")}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    typeFilter === "found"
                      ? "bg-emerald-600 text-white shadow-xs font-semibold"
                      : "hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Found
                </button>
              </div>

              {/* Advanced Filters Button */}
              <button
                type="button"
                id="toggle-filters-btn"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              >
                <Filter className="w-3.5 h-3.5 text-indigo-500" />
                <span>Filters {categoryFilter || locationFilter ? "(Active)" : ""}</span>
              </button>
            </div>

            {/* Dropdown Filters */}
            {showAdvanced && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    id="filter-select-category"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">All Categories</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Location
                  </label>
                  <select
                    id="filter-select-location"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">All Campus Locations</option>
                    {LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    id="reset-filters-btn"
                    onClick={() => {
                      setCategoryFilter("");
                      setLocationFilter("");
                      setTypeFilter("all");
                      setQuery("");
                    }}
                    className="w-full py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium transition text-center"
                  >
                    Reset All Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
