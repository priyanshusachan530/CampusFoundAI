import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info", duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast Notification Container */}
      <div
        id="toast-container"
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((toast) => {
          let bg = "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100";
          let icon = <Info className="w-5 h-5 text-sky-500 shrink-0" />;

          if (toast.type === "success") {
            bg = "bg-emerald-50 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100";
            icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />;
          } else if (toast.type === "error") {
            bg = "bg-rose-50 dark:bg-rose-950/80 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-100";
            icon = <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />;
          } else if (toast.type === "warning") {
            bg = "bg-amber-50 dark:bg-amber-950/80 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-100";
            icon = <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />;
          }

          return (
            <div
              key={toast.id}
              id={`toast-item-${toast.id}`}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-lg transition-all animate-in fade-in slide-in-from-bottom-3 duration-200 ${bg}`}
            >
              {icon}
              <div className="flex-1 text-sm font-medium leading-snug">{toast.message}</div>
              <button
                id={`toast-close-${toast.id}`}
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-0.5 rounded transition"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
