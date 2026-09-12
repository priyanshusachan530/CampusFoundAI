import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Calendar, ArrowRight, Sparkles, Tag, ShieldCheck } from "lucide-react";

export default function ItemCard({ item, matchScore, matchLabel, matchBadgeColor, showQuickActions = true }) {
  if (!item) return null;

  const isLost = item.type === "lost";
  const isResolved = item.status === "resolved";

  return (
    <div
      id={`item-card-${item.id}`}
      className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
    >
      <div>
        {/* Card Image Banner */}
        <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          {item.image ? (
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80";
              }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 p-4">
              <Tag className="w-10 h-10 mb-2 opacity-50" />
              <span className="text-xs uppercase font-medium tracking-wider">No Photo Provided</span>
            </div>
          )}

          {/* Status Badge */}
          <div className="absolute top-3 left-3 flex gap-2">
            {isResolved ? (
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-800 text-white shadow-xs">
                RESOLVED
              </span>
            ) : isLost ? (
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-600 text-white shadow-xs">
                LOST
              </span>
            ) : (
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-600 text-white shadow-xs">
                FOUND
              </span>
            )}

            <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 backdrop-blur-xs shadow-xs">
              {item.category}
            </span>
          </div>

          {/* AI Match Badge if available */}
          {matchScore !== undefined && (
            <div className="absolute top-3 right-3">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full border backdrop-blur-xs shadow-sm ${
                  matchBadgeColor || "bg-indigo-600 text-white border-indigo-500"
                }`}
              >
                <Sparkles className="w-3 h-3" />
                {matchScore}% Match
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
              {item.title}
            </h3>
          </div>

          <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {item.description}
          </p>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span className="truncate">{item.location}</span>
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span className="truncate">{item.date}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="px-5 pb-5 pt-1">
        <Link
          id={`view-item-btn-${item.id}`}
          to={`/item/${item.id}`}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white text-slate-700 dark:text-slate-200 transition duration-150"
        >
          View Details
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
