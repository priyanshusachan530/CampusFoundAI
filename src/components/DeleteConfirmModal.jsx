import React from "react";
import { AlertTriangle } from "lucide-react";
import Modal from "./Modal.jsx";

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Report Confirmation",
  message = "Are you sure you want to delete this report?"
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-200 text-xs">
          <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
          <p className="leading-relaxed font-medium">{message}</p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            id="cancel-delete-btn"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            id="confirm-delete-btn"
            onClick={onConfirm}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-600/20 transition cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </Modal>
  );
}
