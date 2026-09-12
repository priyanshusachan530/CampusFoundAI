import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FileQuestion,
  PackageCheck,
  Sparkles,
  ShieldCheck,
  Archive,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCw,
  Search,
  Users
} from "lucide-react";
import AdminLayout from "./AdminLayout.jsx";
import {
  getItems,
  getClaims,
  getMatches,
  getUsers,
  updateClaim,
  updateItem,
  saveNotification
} from "../../utils/storage.js";
import { executeAutomaticMatching } from "../../utils/aiMatcher.js";
import { useToast } from "../../context/ToastContext.jsx";
import { formatDate, getStatusBadge } from "../../utils/helpers.js";

export default function AdminDashboard() {
  const { addToast } = useToast();
  const [items, setItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [matches, setMatches] = useState([]);
  const [users, setUsers] = useState([]);
  const [runningMatcher, setRunningMatcher] = useState(false);

  const loadData = () => {
    setItems(getItems());
    setClaims(getClaims());
    setMatches(getMatches());
    setUsers(getUsers());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("campuslink_data_updated", handleUpdate);
    return () => window.removeEventListener("campuslink_data_updated", handleUpdate);
  }, []);

  const totalLost = items.filter((i) => i.type === "lost").length;
  const totalFound = items.filter((i) => i.type === "found").length;
  const totalReceived = items.filter(
    (i) => i.status === "SUCCESSFULLY_RECEIVED" || i.status === "resolved"
  ).length;
  const pendingClaims = claims.filter(
    (c) => c.status === "CLAIM_PENDING_ADMIN_REVIEW" || c.status === "Pending"
  );

  const handleRunMatcher = () => {
    setRunningMatcher(true);
    setTimeout(() => {
      let created = 0;
      const all = getItems();
      const lost = all.filter((i) => i.type === "lost");
      lost.forEach((l) => {
        const found = executeAutomaticMatching(l, all);
        created += found.length;
      });
      setRunningMatcher(false);
      loadData();
      addToast(`AI Match Engine executed. Scanned ${all.length} items. Total active matches: ${getMatches().length}.`, "success");
    }, 800);
  };

  const handleQuickApproveClaim = (claim) => {
    updateClaim(claim.id, {
      status: "APPROVED_FOR_RETURN",
      adminNotes: "Quick approved by administrator on duty."
    });

    if (claim.foundItemId) {
      updateItem(claim.foundItemId, { status: "APPROVED_FOR_RETURN" });
    }

    saveNotification({
      userId: claim.claimantId,
      title: "Claim Approved for Handover!",
      message: `Your claim #${claim.id} for "${claim.itemTitle}" is approved. Please visit the Campus Security Desk with your student ID to receive your item.`,
      type: "claim",
      link: "/claims"
    });

    loadData();
    addToast(`Claim #${claim.id} approved for return. Claimant notified.`, "success");
  };

  return (
    <AdminLayout activeTab="dashboard">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Campus Security & Property Operations
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Central management of campus lost-and-found custody, AI similarity matching, and verified claims.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleRunMatcher}
              disabled={runningMatcher}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 shadow-xs transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${runningMatcher ? "animate-spin" : ""}`} />
              <span>{runningMatcher ? "Scanning Database..." : "Run AI Match Engine"}</span>
            </button>
          </div>
        </div>

        {/* Stats 6-Card Fully Functional Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 1. Lost Items Card */}
          <Link
            to="/admin/lost-items"
            id="admin-card-lost-items"
            className="clickable-card group relative text-left rounded-2xl p-5 shadow-xs transition-all duration-200 cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-rose-400 dark:hover:border-rose-600 hover:shadow-md hover:-translate-y-0.5 block no-underline"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 group-hover:text-black transition-colors uppercase tracking-wider">
                  Lost Items
                </span>
                <div className="text-3xl font-extrabold text-rose-600 mt-2 group-hover:text-black transition-colors">
                  {totalLost}
                </div>
                <span className="text-[11px] text-slate-400 group-hover:text-black transition-colors mt-1 block">
                  Active lost reports submitted
                </span>
              </div>
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900">
                <FileQuestion className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-semibold text-rose-600 group-hover:text-black transition-colors">
              <span>View Lost Items Catalog</span>
              <span>→</span>
            </div>
          </Link>

          {/* 2. Found Items Card */}
          <Link
            to="/admin/found-items"
            id="admin-card-found-items"
            className="clickable-card group relative text-left rounded-2xl p-5 shadow-xs transition-all duration-200 cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-md hover:-translate-y-0.5 block no-underline"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 group-hover:text-black transition-colors uppercase tracking-wider">
                  Found Items
                </span>
                <div className="text-3xl font-extrabold text-emerald-600 mt-2 group-hover:text-black transition-colors">
                  {totalFound}
                </div>
                <span className="text-[11px] text-slate-400 group-hover:text-black transition-colors mt-1 block">
                  Stored at security desk custody
                </span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900">
                <PackageCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-semibold text-emerald-600 group-hover:text-black transition-colors">
              <span>View Found Items Inventory</span>
              <span>→</span>
            </div>
          </Link>

          {/* 3. Successfully Received Card */}
          <Link
            to="/admin/received-items"
            id="admin-card-received-items"
            className="clickable-card group relative text-left rounded-2xl p-5 shadow-xs transition-all duration-200 cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-600 hover:shadow-md hover:-translate-y-0.5 block no-underline"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 group-hover:text-black transition-colors uppercase tracking-wider">
                  Successfully Received
                </span>
                <div className="text-3xl font-extrabold text-teal-600 mt-2 group-hover:text-black transition-colors">
                  {totalReceived}
                </div>
                <span className="text-[11px] text-slate-400 group-hover:text-black transition-colors mt-1 block">
                  Items handed over to rightful owners
                </span>
              </div>
              <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border border-teal-100 dark:border-teal-900">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-semibold text-teal-600 group-hover:text-black transition-colors">
              <span>View Successfully Received</span>
              <span>→</span>
            </div>
          </Link>

          {/* 4. Pending Claims Card */}
          <Link
            to="/admin/claims"
            id="admin-card-pending-claims"
            className="clickable-card group relative text-left rounded-2xl p-5 shadow-xs transition-all duration-200 cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-md hover:-translate-y-0.5 block no-underline"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 group-hover:text-black transition-colors uppercase tracking-wider">
                  Pending Claims
                </span>
                <div className="text-3xl font-extrabold text-amber-600 mt-2 group-hover:text-black transition-colors">
                  {pendingClaims.length}
                </div>
                <span className="text-[11px] text-slate-400 group-hover:text-black transition-colors mt-1 block">
                  Verified claims awaiting staff review
                </span>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-semibold text-amber-600 group-hover:text-black transition-colors">
              <span>Review Pending Claims</span>
              <span>→</span>
            </div>
          </Link>

          {/* 5. Matches Card */}
          <Link
            to="/admin/matches"
            id="admin-card-matches"
            className="clickable-card group relative text-left rounded-2xl p-5 shadow-xs transition-all duration-200 cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-md hover:-translate-y-0.5 block no-underline"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 group-hover:text-black transition-colors uppercase tracking-wider">
                  Matches
                </span>
                <div className="text-3xl font-extrabold text-indigo-600 mt-2 group-hover:text-black transition-colors">
                  {matches.length}
                </div>
                <span className="text-[11px] text-slate-400 group-hover:text-black transition-colors mt-1 block">
                  AI-detected similarity pairings
                </span>
              </div>
              <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-semibold text-indigo-600 group-hover:text-black transition-colors">
              <span>Inspect All Matches</span>
              <span>→</span>
            </div>
          </Link>

          {/* 6. Users Card */}
          <Link
            to="/admin/users"
            id="admin-card-users"
            className="clickable-card group relative text-left rounded-2xl p-5 shadow-xs transition-all duration-200 cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-sky-400 dark:hover:border-sky-600 hover:shadow-md hover:-translate-y-0.5 block no-underline"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 group-hover:text-black transition-colors uppercase tracking-wider">
                  Users
                </span>
                <div className="text-3xl font-extrabold text-sky-600 mt-2 group-hover:text-black transition-colors">
                  {users.length}
                </div>
                <span className="text-[11px] text-slate-400 group-hover:text-black transition-colors mt-1 block">
                  Registered students & staff directory
                </span>
              </div>
              <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-900">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-semibold text-sky-600 group-hover:text-black transition-colors">
              <span>Manage Campus Users</span>
              <span>→</span>
            </div>
          </Link>
        </div>

        {/* Action Needed: Pending Claims */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Claims Awaiting Security Verification ({pendingClaims.length})
                </h3>
                <p className="text-[11px] text-slate-400">
                  Verify anti-fraud student credentials and secret question responses before handover
                </p>
              </div>
            </div>

            <Link
              to="/admin/claims"
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>Manage All Claims</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {pendingClaims.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold">
                    <th className="pb-2.5">Claim ID</th>
                    <th className="pb-2.5">Item</th>
                    <th className="pb-2.5">Claimant</th>
                    <th className="pb-2.5">Student ID</th>
                    <th className="pb-2.5">Date</th>
                    <th className="pb-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {pendingClaims.slice(0, 5).map((claim) => (
                    <tr key={claim.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 font-bold text-slate-900 dark:text-white">
                        {claim.id}
                      </td>
                      <td className="py-3 text-slate-700 dark:text-slate-300">
                        {claim.itemTitle}
                      </td>
                      <td className="py-3 text-slate-600 dark:text-slate-400">
                        {claim.claimantName}
                      </td>
                      <td className="py-3 font-mono text-[11px] text-slate-500">
                        {claim.claimantStudentId || "STU-AUTH"}
                      </td>
                      <td className="py-3 text-slate-500">
                        {formatDate(claim.createdAt)}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleQuickApproveClaim(claim)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition shadow-xs"
                          >
                            Approve
                          </button>
                          <Link
                            to="/admin/claims"
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-[11px] transition"
                          >
                            Review
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-slate-400">
              No pending claims currently awaiting review.
            </div>
          )}
        </div>

        {/* Recent Items Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Lost Reports */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileQuestion className="w-4 h-4 text-rose-500" />
                Recent Lost Reports
              </h3>
              <Link to="/admin/lost-items" className="text-[11px] font-bold text-indigo-600 hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-2">
              {items
                .filter((i) => i.type === "lost")
                .slice(0, 4)
                .map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-200">
                        {item.itemName || item.title}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {item.locationLost || item.location} • {formatDate(item.createdAt)}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                      {item.status || "ACTIVE"}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Recent Found Items */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <PackageCheck className="w-4 h-4 text-emerald-500" />
                Recent Found Items in Custody
              </h3>
              <Link to="/admin/found-items" className="text-[11px] font-bold text-indigo-600 hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-2">
              {items
                .filter((i) => i.type === "found")
                .slice(0, 4)
                .map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-200">
                        {item.itemName || item.title}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {item.locationFound || item.location} • {formatDate(item.createdAt)}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {item.status || "FOUND"}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
