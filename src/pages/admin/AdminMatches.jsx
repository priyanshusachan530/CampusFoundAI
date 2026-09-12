import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  RefreshCw,
  Sliders,
  CheckCircle2,
  XCircle,
  Eye,
  Trash2,
  SlidersHorizontal,
  ArrowRight
} from "lucide-react";
import AdminLayout from "./AdminLayout.jsx";
import { getMatches, getItems, updateMatch, deleteMatch, saveNotification, updateItem } from "../../utils/storage.js";
import { executeAutomaticMatching, calculateMatchScore } from "../../utils/aiMatcher.js";
import { useToast } from "../../context/ToastContext.jsx";
import { getScoreBadge, formatDate } from "../../utils/helpers.js";

export default function AdminMatches() {
  const { addToast } = useToast();
  const [matches, setMatches] = useState([]);
  const [items, setItems] = useState([]);
  const [threshold, setThreshold] = useState(60);
  const [scanning, setScanning] = useState(false);

  const loadData = () => {
    setMatches(getMatches());
    setItems(getItems());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRunBatchMatch = () => {
    setScanning(true);
    setTimeout(() => {
      const all = getItems();
      const lost = all.filter((i) => i.type === "lost");
      let added = 0;
      lost.forEach((l) => {
        const found = executeAutomaticMatching(l, all);
        added += found.length;
      });
      setScanning(false);
      loadData();
      addToast(`Matching scan completed across ${all.length} items. Active matches updated.`, "success");
    }, 750);
  };

  const handleApproveMatch = (matchId) => {
    updateMatch(matchId, { status: "APPROVED" });
    const match = matches.find((m) => m.id === matchId);
    if (match) {
      updateItem(match.lostItemId, { status: "MATCHED" });
      updateItem(match.foundItemId, { status: "MATCHED" });
    }
    loadData();
    addToast(`Match #${matchId} confirmed by administration.`, "success");
  };

  const handleRejectMatch = (matchId) => {
    updateMatch(matchId, { status: "REJECTED" });
    loadData();
    addToast(`Match #${matchId} marked as rejected.`, "info");
  };

  const handleDeleteMatch = (matchId) => {
    deleteMatch(matchId);
    loadData();
    addToast(`Match record removed.`, "info");
  };

  const filteredMatches = matches.filter((m) => (m.score || 0) >= threshold);

  return (
    <AdminLayout activeTab="matches">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-amber-500" />
              AI Similarity Matching Engine ({matches.length})
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Multi-attribute similarity algorithms comparing lost reports against turned-in property.
            </p>
          </div>

          <button
            onClick={handleRunBatchMatch}
            disabled={scanning}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 shadow-xs transition disabled:opacity-50 self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${scanning ? "animate-spin" : ""}`} />
            <span>{scanning ? "Evaluating Database..." : "Run Batch Matching Scan"}</span>
          </button>
        </div>

        {/* Algorithm Weights Banner */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-indigo-600" />
                Algorithm Attribute Weights (100 pts total)
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Category (25) + Item Name (20) + Color (15) + Brand (15) + Location (15) + Description (10)
              </p>
            </div>

            {/* Threshold Slider */}
            <div className="flex items-center gap-3 text-xs">
              <span className="font-semibold text-slate-600 dark:text-slate-300">
                Min Confidence Filter:
              </span>
              <input
                type="range"
                min="40"
                max="90"
                step="5"
                value={threshold}
                onChange={(e) => setThreshold(parseInt(e.target.value, 10))}
                className="w-32 accent-indigo-600"
              />
              <span className="font-mono font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs">
                &ge; {threshold}%
              </span>
            </div>
          </div>
        </div>

        {/* Matches Grid */}
        <div className="space-y-4">
          {filteredMatches.length > 0 ? (
            filteredMatches.map((match) => {
              const lostItem = items.find((i) => String(i.id) === String(match.lostItemId));
              const foundItem = items.find((i) => String(i.id) === String(match.foundItemId));
              const scoreBadge = getScoreBadge(match.score);

              return (
                <div
                  key={match.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${scoreBadge.classes}`}>
                        {match.score}% MATCH
                      </span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {match.matchLevel || scoreBadge.level}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        • ID: {match.id}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        Status: {match.status || "PENDING"}
                      </span>
                      <button
                        onClick={() => handleDeleteMatch(match.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded"
                        title="Delete Match"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Comparison Side by Side */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 rounded-xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 space-y-1.5">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200">
                        Lost Item #{match.lostItemId}
                      </span>
                      <h4 className="font-bold text-slate-900 dark:text-white">
                        {lostItem?.itemName || lostItem?.title || "Lost Item"}
                      </h4>
                      <p className="text-slate-500">
                        Category: <strong>{lostItem?.category}</strong> • Loc: <strong>{lostItem?.locationLost || lostItem?.location}</strong>
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Color: {lostItem?.color} • Brand: {lostItem?.brand || "None"}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 space-y-1.5">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                        Found Item #{match.foundItemId}
                      </span>
                      <h4 className="font-bold text-slate-900 dark:text-white">
                        {foundItem?.itemName || foundItem?.title || "Found Item"}
                      </h4>
                      <p className="text-slate-500">
                        Category: <strong>{foundItem?.category}</strong> • Loc: <strong>{foundItem?.locationFound || foundItem?.location}</strong>
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Color: {foundItem?.color} • Brand: {foundItem?.brand || "None"}
                      </p>
                    </div>
                  </div>

                  {/* Factor reasons */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-600 dark:text-slate-300">
                    <span className="font-bold block mb-1">Matching Factors:</span>
                    <div className="flex flex-wrap gap-2">
                      {(match.reasons || ["Direct category and color similarities detected."]).map((r, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApproveMatch(match.id)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs"
                      >
                        Confirm Match
                      </button>
                      <button
                        onClick={() => handleRejectMatch(match.id)}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold text-xs border border-rose-200 dark:border-rose-900 transition"
                      >
                        Reject Match
                      </button>
                    </div>

                    <Link
                      to={`/item/${match.foundItemId}`}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <span>Inspect Found Item</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
              No matches found with confidence score &ge; {threshold}%.
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
