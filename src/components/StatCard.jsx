import React from "react";
import { Link } from "react-router-dom";

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = "indigo",
  onClick,
  to,
  isActive = false,
  id
}) {
  const colorMap = {
    indigo: "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900",
    amber: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900",
    emerald: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900",
    sky: "bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border-sky-100 dark:border-sky-900",
    purple: "bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900",
    rose: "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900",
    teal: "bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border-teal-100 dark:border-teal-900"
  };

  const badgeStyle = colorMap[color] || colorMap.indigo;

  const cardContent = (
    <div
      id={id}
      onClick={onClick}
      className={`clickable-card group relative text-left w-full rounded-2xl p-5 shadow-xs transition-all duration-200 cursor-pointer ${
        isActive
          ? "bg-white dark:bg-slate-900 ring-2 ring-indigo-500 border-transparent shadow-md transform -translate-y-0.5"
          : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md hover:-translate-y-0.5"
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase group-hover:text-black transition-colors">
            {title}
          </p>
          <h4 className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight group-hover:text-black transition-colors">
            {value}
          </h4>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 group-hover:text-black transition-colors">
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl border ${badgeStyle} group-hover:border-slate-400 transition-colors`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 group-hover:text-black transition-colors">
        <span>{trend || "Click to view details"}</span>
        <span className="text-xs opacity-80 group-hover:translate-x-0.5 transition-transform">→</span>
      </div>
    </div>
  );

  if (to && !onClick) {
    return (
      <Link to={to} className="block no-underline">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}

