import React from "react";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

export default function Toast({ message, type = "info", onClose }) {
  let bg = "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100";
  let icon = <Info className="w-5 h-5 text-sky-500 shrink-0" />;

  if (type === "success") {
    bg = "bg-emerald-50 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100";
    icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />;
  } else if (type === "error") {
    bg = "bg-rose-50 dark:bg-rose-950/80 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-100";
    icon = <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />;
  } else if (type === "warning") {
    bg = "bg-amber-50 dark:bg-amber-950/80 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-100";
    icon = <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />;
  }

  return (
    <div className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-lg transition-all animate-in fade-in duration-200 ${bg}`}>
      {icon}
      <div className="flex-1 text-sm font-medium leading-snug">{message}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-0.5 rounded transition"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
