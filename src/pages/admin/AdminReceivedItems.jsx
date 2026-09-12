import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Archive,
  Search,
  CheckCircle2,
  Calendar,
  User,
  ShieldCheck,
  Download,
  Eye,
  Award
} from "lucide-react";
import AdminLayout from "./AdminLayout.jsx";
import { getItems, getClaims } from "../../utils/storage.js";
import { formatDate } from "../../utils/helpers.js";

export default function AdminReceivedItems() {
  const [items, setItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const allItems = getItems();
    const allClaims = getClaims();
    // Filter items where status is successfully received or resolved
    const received = allItems.filter(
      (i) => i.status === "SUCCESSFULLY_RECEIVED" || i.status === "resolved"
    );
    setItems(received);
    setClaims(allClaims);
  }, []);

  const filtered = items.filter((item) => {
    const title = (item.itemName || item.title || "").toLowerCase();
    return title.includes(search.toLowerCase()) || String(item.id).toLowerCase().includes(search.toLowerCase());
  });

  return (
    <AdminLayout activeTab="received">
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Archive className="w-6 h-6 text-teal-600" />
              Reunited & Returned Property Archive ({items.length})
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Historical ledger of belongings successfully claimed and returned to campus owners.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search returned archive by item title, ID, category..."
              className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Item ID</th>
                  <th className="py-3 px-4">Belonging</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Original Location</th>
                  <th className="py-3 px-4">Returned Date</th>
                  <th className="py-3 px-4">Verification Proof</th>
                  <th className="py-3 px-4 text-right">Ledger Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((item) => (
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
                      {item.locationFound || item.locationLost || item.location}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {formatDate(item.updatedAt || item.createdAt)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        ID Verified
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        SUCCESSFULLY RETURNED
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-10 text-xs text-slate-400">
              No returned archive records match the query.
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
