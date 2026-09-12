import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ShieldAlert,
  FileText,
  CheckCircle2,
  XCircle,
  Trash2,
  Eye,
  Search,
  Filter,
  Users,
  MapPin,
  TrendingUp,
  AlertTriangle,
  FolderCheck,
  Check
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import {
  getItems,
  deleteItem,
  updateItem,
  getClaims,
  updateClaim,
  getUsers,
  saveNotification
} from "../utils/storage.js";
import Sidebar from "../components/Sidebar.jsx";
import StatCard from "../components/StatCard.jsx";
import Modal from "../components/Modal.jsx";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [items, setItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("claims"); // claims, reports, users
  const [searchTerm, setSearchTerm] = useState("");
  const [reportTypeFilter, setReportTypeFilter] = useState("all");

  // Claim review modal
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [claimReviewModalOpen, setClaimReviewModalOpen] = useState(false);
  const [adminNote, setAdminNote] = useState("");

  const loadData = () => {
    setItems(getItems());
    setClaims(getClaims());
    setUsers(getUsers());
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalLost = items.filter((i) => i.type === "lost").length;
  const totalFound = items.filter((i) => i.type === "found").length;
  const totalResolved = items.filter((i) => i.status === "resolved").length;
  const pendingClaims = claims.filter((c) => c.status === "Pending");

  // Delete item handler
  const handleDeleteItem = (id, title) => {
    if (window.confirm(`Are you sure you want to remove report "${title}"?`)) {
      deleteItem(id);
      loadData();
      addToast(`Report "${title}" removed from database.`, "info");
    }
  };

  // Mark item resolved handler
  const handleMarkItemResolved = (id, title) => {
    updateItem(id, { status: "resolved" });
    loadData();
    addToast(`Item "${title}" marked as resolved/returned.`, "success");
  };

  // Claim approval
  const handleApproveClaim = (claim) => {
    updateClaim(claim.id, {
      status: "Approved",
      adminNotes: adminNote || "Ownership verified by administration. Item released to claimant."
    });

    // Also mark the target item resolved
    if (claim.itemId) {
      updateItem(claim.itemId, { status: "resolved" });
    }

    // Notify the student
    saveNotification({
      userId: claim.claimantId,
      title: "Claim Approved! 🎉",
      message: `Your ownership claim for "${claim.itemTitle}" has been APPROVED. Please present your campus ID at the Security Desk to collect your item.`,
      type: "claim",
      link: "/claims"
    });

    loadData();
    setClaimReviewModalOpen(false);
    addToast(`Claim for "${claim.itemTitle}" approved successfully.`, "success");
  };

  // Claim rejection
  const handleRejectClaim = (claim) => {
    updateClaim(claim.id, {
      status: "Rejected",
      adminNotes: adminNote || "Proof details insufficient or contradictory. Please contact security desk."
    });

    saveNotification({
      userId: claim.claimantId,
      title: "Claim Update: Additional Verification Required",
      message: `Your claim for "${claim.itemTitle}" could not be verified automatically. Please visit the Security Office in person with proof of purchase or serial records.`,
      type: "claim",
      link: "/claims"
    });

    loadData();
    setClaimReviewModalOpen(false);
    addToast(`Claim for "${claim.itemTitle}" marked as rejected.`, "info");
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = reportTypeFilter === "all" || item.type === reportTypeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                Staff & Admin Portal
              </span>
              <span className="text-xs text-slate-400">Campus Oversight</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
              Central Administration Console
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Review ownership claims, moderate campus listings, and manage high-loss campus zones.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              id="admin-view-analytics-btn"
              to="/analytics"
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition"
            >
              View Analytics Dashboard
            </Link>
          </div>
        </div>

        {/* Top 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Total Reports"
            value={items.length}
            subtitle="Campus submissions"
            icon={FileText}
            color="indigo"
          />
          <StatCard
            title="Active Lost"
            value={totalLost}
            subtitle="Seeking recovery"
            icon={AlertTriangle}
            color="rose"
          />
          <StatCard
            title="Turned In"
            value={totalFound}
            subtitle="Held in custody"
            icon={CheckCircle2}
            color="emerald"
          />
          <StatCard
            title="Pending Claims"
            value={pendingClaims.length}
            subtitle="Awaiting staff review"
            icon={ShieldAlert}
            color="amber"
          />
          <StatCard
            title="Resolved Items"
            value={totalResolved}
            subtitle="Successfully returned"
            icon={FolderCheck}
            color="sky"
          />
        </div>

        {/* Tab Navigation */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 pt-4 gap-4 text-xs font-semibold">
            <button
              id="admin-tab-claims"
              onClick={() => setActiveTab("claims")}
              className={`pb-3 border-b-2 flex items-center gap-2 transition ${
                activeTab === "claims"
                  ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Pending Ownership Claims ({pendingClaims.length})</span>
            </button>
            <button
              id="admin-tab-reports"
              onClick={() => setActiveTab("reports")}
              className={`pb-3 border-b-2 flex items-center gap-2 transition ${
                activeTab === "reports"
                  ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Manage All Reports ({items.length})</span>
            </button>
            <button
              id="admin-tab-users"
              onClick={() => setActiveTab("users")}
              className={`pb-3 border-b-2 flex items-center gap-2 transition ${
                activeTab === "users"
                  ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Campus Users ({users.length})</span>
            </button>
          </div>

          {/* TAB 1: PENDING CLAIMS */}
          {activeTab === "claims" && (
            <div className="p-6">
              {pendingClaims.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-500 opacity-60" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    All claims have been reviewed!
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    No pending ownership claims are currently waiting for staff decision.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingClaims.map((claim) => (
                    <div
                      key={claim.id}
                      id={`admin-claim-row-${claim.id}`}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                            PENDING VERIFICATION
                          </span>
                          <span className="text-xs text-slate-400">
                            Submitted: {new Date(claim.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          Claim for: <span className="text-indigo-600 dark:text-indigo-400">{claim.itemTitle}</span>
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          <span className="font-semibold">Claimant:</span> {claim.claimantName} ({claim.claimantRole}) • {claim.claimantEmail}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 italic line-clamp-2">
                          "{claim.proofDescription}"
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          id={`review-claim-btn-${claim.id}`}
                          onClick={() => {
                            setSelectedClaim(claim);
                            setAdminNote(claim.adminNotes || "");
                            setClaimReviewModalOpen(true);
                          }}
                          className="px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition"
                        >
                          Review & Decide
                        </button>
                        <button
                          id={`quick-approve-btn-${claim.id}`}
                          onClick={() => handleApproveClaim(claim)}
                          className="px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition"
                          title="Quick approve"
                        >
                          Approve
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MANAGE ALL REPORTS */}
          {activeTab === "reports" && (
            <div className="p-6 space-y-4">
              {/* Search & Filter bar inside table */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Filter by title, location, category..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-medium">
                  <button
                    onClick={() => setReportTypeFilter("all")}
                    className={`px-3 py-1 rounded-lg ${reportTypeFilter === "all" ? "bg-white dark:bg-slate-700 shadow-xs font-semibold" : ""}`}
                  >
                    All ({items.length})
                  </button>
                  <button
                    onClick={() => setReportTypeFilter("lost")}
                    className={`px-3 py-1 rounded-lg ${reportTypeFilter === "lost" ? "bg-rose-600 text-white shadow-xs font-semibold" : ""}`}
                  >
                    Lost ({totalLost})
                  </button>
                  <button
                    onClick={() => setReportTypeFilter("found")}
                    className={`px-3 py-1 rounded-lg ${reportTypeFilter === "found" ? "bg-emerald-600 text-white shadow-xs font-semibold" : ""}`}
                  >
                    Found ({totalFound})
                  </button>
                </div>
              </div>

              {/* Reports Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-semibold">
                      <th className="py-3 px-3">Item</th>
                      <th className="py-3 px-3">Type</th>
                      <th className="py-3 px-3">Category</th>
                      <th className="py-3 px-3">Location</th>
                      <th className="py-3 px-3">Date</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {filteredItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                        <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white max-w-[200px] truncate">
                          {item.title}
                        </td>
                        <td className="py-3 px-3">
                          {item.type === "lost" ? (
                            <span className="px-2 py-0.5 font-bold rounded-md bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                              LOST
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 font-bold rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                              FOUND
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3">{item.category}</td>
                        <td className="py-3 px-3">{item.location}</td>
                        <td className="py-3 px-3">{item.date}</td>
                        <td className="py-3 px-3">
                          {item.status === "resolved" ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                              Resolved
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right space-x-1">
                          <Link
                            to={`/item/${item.id}`}
                            className="p-1.5 inline-block text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          {item.status !== "resolved" && (
                            <button
                              onClick={() => handleMarkItemResolved(item.id, item.title)}
                              className="p-1.5 text-slate-500 hover:text-emerald-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                              title="Mark as Returned / Resolved"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteItem(item.id, item.title)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Remove Inappropriate Listing"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: CAMPUS USERS */}
          {activeTab === "users" && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {users.map((u) => (
                  <div
                    key={u.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3 bg-slate-50/50 dark:bg-slate-800/40"
                  >
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{u.name}</h4>
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                          {u.role}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">{u.email}</p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        ID: {u.studentId || "N/A"} • Recovered {u.recoveredCount || 0} items
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Claim Decision Modal */}
      {selectedClaim && (
        <Modal
          isOpen={claimReviewModalOpen}
          onClose={() => setClaimReviewModalOpen(false)}
          title={`Review Claim: ${selectedClaim.itemTitle}`}
          maxWidth="max-w-xl"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl space-y-1">
              <p className="font-bold text-slate-900 dark:text-white">Claimant Information:</p>
              <p className="text-slate-600 dark:text-slate-300">
                {selectedClaim.claimantName} ({selectedClaim.claimantRole}) • {selectedClaim.claimantEmail}
              </p>
              <p className="text-[11px] text-slate-400">
                Claim Reference ID: {selectedClaim.id} • Item: {selectedClaim.itemTitle}
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                Claimant's Proof of Ownership:
              </label>
              <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60 text-slate-700 dark:text-slate-200 leading-relaxed">
                {selectedClaim.proofDescription}
              </div>
            </div>

            {selectedClaim.identifyingMarks && (
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Private Identifying Marks / Serial:
                </label>
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {selectedClaim.identifyingMarks}
                </div>
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                Administrative Notes & Next Steps:
              </label>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Add verification notes, pickup instructions, or reasons for rejection..."
                rows={3}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => handleRejectClaim(selectedClaim)}
                className="px-4 py-2 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-semibold hover:bg-rose-200 transition"
              >
                Reject Claim
              </button>
              <button
                type="button"
                onClick={() => handleApproveClaim(selectedClaim)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs transition"
              >
                Approve Ownership & Issue Release
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
