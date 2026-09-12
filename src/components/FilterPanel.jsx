import React from "react";
import { Filter, X, RotateCcw } from "lucide-react";
import { CATEGORIES, LOCATIONS } from "../data/mockItems.js";

const COMMON_COLORS = [
  "All", "Black", "Blue", "Silver", "White", "Grey", "Red", "Green", "Brown", "Yellow", "Purple"
];

export default function FilterPanel({ filters, onFilterChange, onResetFilters }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Filter className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          Filter Campus Catalog
        </h3>
        <button
          type="button"
          onClick={onResetFilters}
          className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 font-semibold flex items-center gap-1 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset All
        </button>
      </div>

      {/* 1. Report Type */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Report Type
        </label>
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
          {["all", "lost", "found"].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => onFilterChange("type", type)}
              className={`py-1.5 text-xs font-bold rounded-lg capitalize transition ${
                filters.type === type
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {type === "all" ? "All Items" : type}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Category */}
      <div className="space-y-2">
        <label htmlFor="filter-category" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Category
        </label>
        <select
          id="filter-category"
          value={filters.category}
          onChange={(e) => onFilterChange("category", e.target.value)}
          className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 px-3 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* 3. Location */}
      <div className="space-y-2">
        <label htmlFor="filter-location" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Campus Location
        </label>
        <select
          id="filter-location"
          value={filters.location}
          onChange={(e) => onFilterChange("location", e.target.value)}
          className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 px-3 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Locations</option>
          {LOCATIONS.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>
      </div>

      {/* 4. Color */}
      <div className="space-y-2">
        <label htmlFor="filter-color" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Primary Color
        </label>
        <select
          id="filter-color"
          value={filters.color}
          onChange={(e) => onFilterChange("color", e.target.value)}
          className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 px-3 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
        >
          {COMMON_COLORS.map((c) => (
            <option key={c} value={c === "All" ? "all" : c.toLowerCase()}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* 5. Brand */}
      <div className="space-y-2">
        <label htmlFor="filter-brand" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Brand / Manufacturer
        </label>
        <input
          type="text"
          id="filter-brand"
          value={filters.brand || ""}
          onChange={(e) => onFilterChange("brand", e.target.value)}
          placeholder="e.g., Apple, HP, Casio"
          className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 px-3 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* 6. Sort By */}
      <div className="space-y-2">
        <label htmlFor="filter-sort" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Sort Order
        </label>
        <select
          id="filter-sort"
          value={filters.sortBy || "newest"}
          onChange={(e) => onFilterChange("sortBy", e.target.value)}
          className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 px-3 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>
    </div>
  );
}
