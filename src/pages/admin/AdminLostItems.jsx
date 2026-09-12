import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FileQuestion,
  Search,
  Filter,
  Trash2,
  Eye,
  Download,
  CheckCircle2,
  Tag,
  MapPin,
  Calendar
} from "lucide-react";
import AdminLayout from "./AdminLayout.jsx";
import { getItems, deleteItem, updateItem } from "../../utils/storage.js";
import { useToast } from "../../context/ToastContext.jsx";
import { formatDate, getStatusBadge } from "../../utils/helpers.js";
import { CATEGORIES, LOCATIONS } from "../../data/mockItems.js";
import DeleteConfirmModal from "../../components/DeleteConfirmModal.jsx";

export default function AdminLostItems() {
  const { addToast } = useToast();
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [location, setLocation] = useState("all");
  const [status, setStatus] = useState("all");
  const [itemToDelete, setItemToDelete] = useState(null);

  const loadData = () => {
    const all = getItems();
    setItems(all.filter((i) => i.type === "lost"));
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => {
      loadData();
    };
    window.addEventListener("campuslink_data_updated", handleUpdate);
    return () => window.removeEventListener("campuslink_data_updated", handleUpdate);
  }, []);

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    deleteItem(itemToDelete.id);
    setItemToDelete(null);
    loadData();
    addToast("Lost report deleted successfully.", "success");
  };

  const handleStatusChange = (id, newStatus) => {
    updateItem(id, { status: newStatus });
    loadData();
    addToast(`Status updated to ${newStatus}.`, "success");
  };

  const handleExportCSV = () => {
    const rows = [
      ["ID", "Item Name", "Category", "Location Lost", "Date", "Status", "Reporter Email"]
    ];
    items.forEach((item) => {
      rows.push([
        item.id,
        item.itemName || item.title,
        item.category,
        item.locationLost || item.location,
        formatDate(item.createdAt),
        item.status,
        item.contactEmail || item.reporterEmail || ""
      ]);
    });

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.map(x => `"${x}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `campus-lost-items-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast("Exported Lost Items CSV successfully.", "success");
  };

  const filtered = items.filter((item) => {
    const title = (item.itemName || item.title || "").toLowerCase();
    const matchesSearch = title.includes(search.toLowerCase()) || String(item.id).toLowerCase().includes(search.toLowerCase());
    const matchesCat = category === "all" || item.category === category;
    const matchesLoc = location === "all" || (item.locationLost || item.location) === location;
    const matchesStatus = status === "all" || item.status === status;
    return matchesSearch && matchesCat && matchesLoc && matchesStatus;
  });

  return (
    <AdminLayout activeTab="lost-items">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <FileQuestion className="w-6 h-6 text-rose-500" />
              Lost Belongings Catalog ({items.length})
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Active student and faculty lost reports logged across university facilities.
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center gap-1.5 shadow-xs self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" />
            Export CSV
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, ID..."
              className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>

          <div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden"
            >
              <option value="all">All Locations</option>
              {LOCATIONS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden"
            >
              <option value="all">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="MATCHED">MATCHED</option>
              <option value="CLAIM_PENDING_ADMIN_REVIEW">CLAIM PENDING</option>
              <option value="SUCCESSFULLY_RECEIVED">SUCCESSFULLY RECEIVED</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Report ID</th>
                  <th className="py-3 px-4">Item Details</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Location Lost</th>
                  <th className="py-3 px-4">Date Reported</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((item) => {
                  const badge = getStatusBadge(item.status);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        {item.id}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {item.itemName || item.title}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {item.color} {item.brand ? `• ${item.brand}` : ""}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                        {item.category}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                        {item.locationLost || item.location}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {formatDate(item.createdAt)}
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          value={item.status || "ACTIVE"}
                          onChange={(e) => handleStatusChange(item.id, e.target.value)}
                          className={`text-[11px] font-bold px-2 py-1 rounded-lg border focus:outline-hidden ${badge.classes}`}
                        >
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="MATCHED">MATCHED</option>
                          <option value="CLAIM_PENDING_ADMIN_REVIEW">CLAIM PENDING</option>
                          <option value="APPROVED_FOR_RETURN">APPROVED FOR RETURN</option>
                          <option value="SUCCESSFULLY_RECEIVED">SUCCESSFULLY RECEIVED</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/item/${item.id}`}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg transition"
                            title="View Public Item Page"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setItemToDelete(item)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition cursor-pointer"
                            title="Delete Report"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-10 text-xs text-slate-400">
              No lost items found matching the selected filters.
            </div>
          )}
        </div>

        <DeleteConfirmModal
          isOpen={!!itemToDelete}
          onClose={() => setItemToDelete(null)}
          onConfirm={handleConfirmDelete}
          title="Delete Report Confirmation"
          message="Are you sure you want to delete this report?"
        />
      </div>
    </AdminLayout>
  );
}
