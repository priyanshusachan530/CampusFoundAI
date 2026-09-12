import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  PlusCircle,
  CheckCircle2,
  Trash2,
  Eye,
  Sparkles,
  MapPin,
  Calendar,
  AlertCircle
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { getItems, updateItem, deleteItem } from "../utils/storage.js";
import Sidebar from "../components/Sidebar.jsx";
import DeleteConfirmModal from "../components/DeleteConfirmModal.jsx";

export default function MyReports() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [items, setItems] = useState([]);
  const [filterType, setFilterType] = useState("all"); // all, lost, found, resolved
  const [itemToDelete, setItemToDelete] = useState(null);

  const loadUserItems = () => {
    const all = getItems();
    // In demo environment, match user id or show items if user is guest/demo
    const myItems = all.filter((i) => !user || i.userId === user.id || i.reporterEmail === user.email);
    setItems(myItems);
  };

  useEffect(() => {
    loadUserItems();

    const handleDataUpdate = () => {
      loadUserItems();
    };
    window.addEventListener("campuslink_data_updated", handleDataUpdate);
    return () => window.removeEventListener("campuslink_data_updated", handleDataUpdate);
  }, [user]);

  const handleMarkResolved = (id, title) => {
    updateItem(id, { status: "resolved" });
    loadUserItems();
    addToast(`"${title}" marked as resolved/returned.`, "success");
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    const isLost = itemToDelete.type === "lost";
    deleteItem(itemToDelete.id);
    setItemToDelete(null);
    loadUserItems();
    addToast(
      isLost ? "Lost report deleted successfully." : "Found report deleted successfully.",
      "success"
    );
  };

  const filteredItems = items.filter((item) => {
    if (filterType === "lost") return item.type === "lost" && item.status !== "resolved";
    if (filterType === "found") return item.type === "found" && item.status !== "resolved";
    if (filterType === "resolved") return item.status === "resolved";
    return true;
  });

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-[lightblue] dark:bg-slate-950">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                USER REPOSITORY
              </span>
              <span className="text-xs text-slate-400">Manage Your Submissions</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
              My Campus Reports
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Review and update the status of belongings you have reported lost or found.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              id="my-reports-new-lost-btn"
              to="/report-lost"
              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-xs transition flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Report Lost Item</span>
            </Link>
            <Link
              id="my-reports-new-found-btn"
              to="/report-found"
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Report Found Item</span>
            </Link>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="inline-flex p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium shadow-xs">
          <button
            onClick={() => setFilterType("all")}
            className={`px-3 py-1.5 rounded-lg transition ${
              filterType === "all"
                ? "bg-indigo-600 text-white font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            All Reports ({items.length})
          </button>
          <button
            onClick={() => setFilterType("lost")}
            className={`px-3 py-1.5 rounded-lg transition ${
              filterType === "lost"
                ? "bg-rose-600 text-white font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            Active Lost
          </button>
          <button
            onClick={() => setFilterType("found")}
            className={`px-3 py-1.5 rounded-lg transition ${
              filterType === "found"
                ? "bg-emerald-600 text-white font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            Active Found
          </button>
          <button
            onClick={() => setFilterType("resolved")}
            className={`px-3 py-1.5 rounded-lg transition ${
              filterType === "resolved"
                ? "bg-slate-800 text-white font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            Resolved Cases
          </button>
        </div>

        {/* Reports List */}
        {filteredItems.length === 0 ? (
          <div className="py-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-xs">
            <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No reports found in this category
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              If you misplaced an item or found someone's belonging on campus, report it to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                id={`report-item-${item.id}`}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-2.5 py-0.5 text-[10px] font-bold rounded-md ${
                        item.status === "resolved"
                          ? "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
                          : item.type === "lost"
                          ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                          : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      }`}
                    >
                      {item.status === "resolved"
                        ? "RESOLVED / RETURNED"
                        : item.type === "lost"
                        ? "ACTIVE LOST"
                        : "ACTIVE FOUND"}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      ID: {item.id} • {item.date}
                    </span>
                  </div>

                  <div className="flex gap-3.5 mt-3">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-16 h-16 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-indigo-500 shrink-0" />
                        <span>{item.location}</span>
                      </p>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/item/${item.id}`}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-200 transition"
                    >
                      View Report
                    </Link>
                    {item.status !== "resolved" && (
                      <button
                        onClick={() => handleMarkResolved(item.id, item.title)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-semibold hover:bg-indigo-100 transition"
                      >
                        Mark Returned
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => setItemToDelete(item)}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                    title="Delete Report"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <DeleteConfirmModal
          isOpen={!!itemToDelete}
          onClose={() => setItemToDelete(null)}
          onConfirm={handleConfirmDelete}
          title="Delete Report Confirmation"
          message="Are you sure you want to delete this report?"
        />
      </main>
    </div>
  );
}
