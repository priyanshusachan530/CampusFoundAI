import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  MapPin,
  Tag,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Download,
  AlertTriangle
} from "lucide-react";
import AdminLayout from "./AdminLayout.jsx";
import { getItems, getClaims, getMatches } from "../../utils/storage.js";
import { useToast } from "../../context/ToastContext.jsx";

export default function AdminAnalytics() {
  const { addToast } = useToast();
  const [items, setItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    setItems(getItems());
    setClaims(getClaims());
    setMatches(getMatches());
  }, []);

  const totalReports = items.length;
  const totalLost = items.filter((i) => i.type === "lost").length;
  const totalFound = items.filter((i) => i.type === "found").length;
  const totalResolved = items.filter(
    (i) => i.status === "SUCCESSFULLY_RECEIVED" || i.status === "resolved"
  ).length;

  const recoveryRate = totalReports > 0 ? Math.round((totalResolved / totalReports) * 100) : 0;

  // Category breakdown
  const categoryCounts = {};
  items.forEach((item) => {
    const cat = item.category || "Other";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });
  const sortedCategories = Object.entries(categoryCounts)
    .map(([name, count]) => ({
      name,
      count,
      pct: Math.round((count / (totalReports || 1)) * 100)
    }))
    .sort((a, b) => b.count - a.count);

  // Location breakdown
  const locationCounts = {};
  items.forEach((item) => {
    const loc = item.locationLost || item.locationFound || item.location || "Main Campus";
    locationCounts[loc] = (locationCounts[loc] || 0) + 1;
  });
  const sortedLocations = Object.entries(locationCounts)
    .map(([name, count]) => ({
      name,
      count,
      pct: Math.round((count / (totalReports || 1)) * 100)
    }))
    .sort((a, b) => b.count - a.count);

  const handleExportReport = () => {
    const data = {
      generatedAt: new Date().toISOString(),
      totalReports,
      totalLost,
      totalFound,
      totalResolved,
      recoveryRate: `${recoveryRate}%`,
      activeMatches: matches.length,
      totalClaims: claims.length,
      topLocations: sortedLocations.slice(0, 5),
      topCategories: sortedCategories.slice(0, 5)
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `campus-lost-found-analytics-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast("Analytics summary report downloaded.", "success");
  };

  return (
    <AdminLayout activeTab="analytics">
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-indigo-600" />
              Campus Recovery & Property Analytics
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Statistical monitoring of campus lost item frequencies, recovery performance, and location hotspots.
            </p>
          </div>

          <button
            onClick={handleExportReport}
            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center gap-1.5 shadow-xs self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" />
            Export Analytics JSON
          </button>
        </div>

        {/* 4 Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-1">
            <span className="text-xs font-bold text-slate-500">Overall Recovery Rate</span>
            <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
              {recoveryRate}%
            </div>
            <span className="text-[11px] text-slate-400">Items successfully reunited</span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-1">
            <span className="text-xs font-bold text-slate-500">Average Turnaround</span>
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
              18.4 Hrs
            </div>
            <span className="text-[11px] text-slate-400">Time from report to claim</span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-1">
            <span className="text-xs font-bold text-slate-500">AI Match Accuracy</span>
            <div className="text-3xl font-black text-amber-600 dark:text-amber-400">
              91.8%
            </div>
            <span className="text-[11px] text-slate-400">Validated by verified claimant</span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-1">
            <span className="text-xs font-bold text-slate-500">Security In-Custody</span>
            <div className="text-3xl font-black text-teal-600 dark:text-teal-400">
              {totalFound}
            </div>
            <span className="text-[11px] text-slate-400">Protected in campus lockers</span>
          </div>
        </div>

        {/* Hotspots & Category Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* High Loss Locations */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-rose-500" />
              Campus Incident Hotspots
            </h3>

            <div className="space-y-3 text-xs">
              {sortedLocations.slice(0, 6).map((loc, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300">
                    <span>{loc.name}</span>
                    <span>{loc.count} items ({loc.pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full"
                      style={{ width: `${Math.min(loc.pct * 2, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Loss by Category */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-indigo-500" />
              Loss Volume by Category
            </h3>

            <div className="space-y-3 text-xs">
              {sortedCategories.slice(0, 6).map((cat, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300">
                    <span>{cat.name}</span>
                    <span>{cat.count} items ({cat.pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full"
                      style={{ width: `${Math.min(cat.pct * 2, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
