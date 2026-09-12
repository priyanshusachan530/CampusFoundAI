import React from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  MapPin,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Eye,
  Trash2,
  Tag
} from "lucide-react";
import { getScoreBadge, formatDate } from "../utils/helpers.js";

export default function MatchCard({
  match,
  lostItem,
  foundItem,
  onVerifyOwnership,
  onDismiss,
  isAdmin = false,
  onApproveMatch,
  onRejectMatch
}) {
  const scoreInfo = getScoreBadge(match.score);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:shadow-md transition space-y-4">
      {/* Header with Match Percentage Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${scoreInfo.classes}`}>
                {match.score}% MATCH
              </span>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {match.matchLevel || scoreInfo.level}
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              Matched on {formatDate(match.createdAt)}
            </span>
          </div>
        </div>

        {match.status && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            Status: {match.status}
          </span>
        )}
      </div>

      {/* Comparison Grid: Lost vs Found */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Lost Item Details */}
        <div className="p-3.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200">
              Lost Report ({lostItem?.id || match.lostItemId})
            </span>
            <Link
              to={`/item/${lostItem?.id || match.lostItemId}`}
              className="text-xs text-rose-700 dark:text-rose-400 hover:underline flex items-center gap-1 font-medium"
            >
              <Eye className="w-3.5 h-3.5" /> View
            </Link>
          </div>

          <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
            {lostItem?.itemName || lostItem?.title || "Lost Item"}
          </h4>

          <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Category: <strong>{lostItem?.category || "Unknown"}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Location: <strong>{lostItem?.locationLost || lostItem?.location || "Campus"}</strong></span>
            </div>
            {lostItem?.color && (
              <div className="text-[11px] text-slate-500">
                Color: {lostItem.color} {lostItem.brand ? `• Brand: ${lostItem.brand}` : ""}
              </div>
            )}
          </div>
        </div>

        {/* Found Item Details */}
        <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200">
              Found Report ({foundItem?.id || match.foundItemId})
            </span>
            <Link
              to={`/item/${foundItem?.id || match.foundItemId}`}
              className="text-xs text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 font-medium"
            >
              <Eye className="w-3.5 h-3.5" /> View
            </Link>
          </div>

          <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
            {foundItem?.itemName || foundItem?.title || "Found Item"}
          </h4>

          <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Category: <strong>{foundItem?.category || "Unknown"}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Location: <strong>{foundItem?.locationFound || foundItem?.location || "Campus"}</strong></span>
            </div>
            {foundItem?.color && (
              <div className="text-[11px] text-slate-500">
                Color: {foundItem.color} {foundItem.brand ? `• Brand: ${foundItem.brand}` : ""}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Reasons Checklist */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 space-y-1.5">
        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
          Matching Factors:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-slate-600 dark:text-slate-300">
          {(match.reasons || []).map((reason, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{reason}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {isAdmin ? (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => onApproveMatch && onApproveMatch(match.id)}
              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition"
            >
              Approve Match
            </button>
            <button
              type="button"
              onClick={() => onRejectMatch && onRejectMatch(match.id)}
              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 dark:bg-rose-950 dark:text-rose-200 transition"
            >
              Reject Match
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onVerifyOwnership && onVerifyOwnership(match, lostItem, foundItem)}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 shadow-xs transition"
            >
              <ShieldCheck className="w-4 h-4" />
              Verify Ownership & Claim
            </button>

            <Link
              to={`/item/${foundItem?.id || match.foundItemId}`}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
            >
              Inspect Details
            </Link>
          </div>
        )}

        {onDismiss && (
          <button
            type="button"
            onClick={() => onDismiss(match.id)}
            className="text-xs text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-1 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
}
