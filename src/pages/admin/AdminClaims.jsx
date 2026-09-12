import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Phone,
  Mail,
  GraduationCap,
  PackageCheck,
  AlertCircle,
  FileText
} from "lucide-react";
import AdminLayout from "./AdminLayout.jsx";
import { getClaims, updateClaim, updateItem, saveNotification } from "../../utils/storage.js";
import { useToast } from "../../context/ToastContext.jsx";
import { formatDate, getStatusBadge } from "../../utils/helpers.js";

export default function AdminClaims() {
  const { addToast } = useToast();
  const [claims, setClaims] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Review modal state
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [actionType, setActionType] = useState(null); // 'approve', 'reject', 'handover'
  const [adminNotes, setAdminNotes] = useState("");

  const loadData = () => {
    setClaims(getClaims());
  };

  useEffect(() => {
    loadData();
  }, []);

  const openActionModal = (claim, type) => {
    setSelectedClaim(claim);
    setActionType(type);
    setAdminNotes(
      type === "approve"
        ? "Ownership verified. Please bring your student ID to Central Campus Security Desk (Room 102) between 8 AM - 8 PM."
        : type === "handover"
        ? "Physical student ID verified. Item officially handed over to claimant."
        : ""
    );
  };

  const handleConfirmAction = (e) => {
    e.preventDefault();
    if (!selectedClaim || !actionType) return;

    if (actionType === "approve") {
      updateClaim(selectedClaim.id, {
        status: "APPROVED_FOR_RETURN",
        adminNotes: adminNotes.trim(),
        approvedAt: new Date().toISOString()
      });

      if (selectedClaim.foundItemId) {
        updateItem(selectedClaim.foundItemId, { status: "APPROVED_FOR_RETURN" });
      }

      saveNotification({
        userId: selectedClaim.claimantId,
        title: "Claim Approved for Handover! 🎉",
        message: `Your ownership claim #${selectedClaim.id} for "${selectedClaim.itemTitle}" was approved by Campus Security. Notes: ${adminNotes.trim()}`,
        type: "claim",
        link: "/claims"
      });

      addToast(`Claim #${selectedClaim.id} approved for return.`, "success");
    } else if (actionType === "reject") {
      if (!adminNotes.trim()) {
        addToast("Please provide a reason for rejecting the claim.", "error");
        return;
      }

      updateClaim(selectedClaim.id, {
        status: "REJECTED",
        adminNotes: adminNotes.trim(),
        rejectedAt: new Date().toISOString()
      });

      saveNotification({
        userId: selectedClaim.claimantId,
        title: "Claim Verification Notice",
        message: `Your claim #${selectedClaim.id} for "${selectedClaim.itemTitle}" could not be verified. Reason: ${adminNotes.trim()}`,
        type: "claim",
        link: "/claims"
      });

      addToast(`Claim #${selectedClaim.id} rejected.`, "info");
    } else if (actionType === "handover") {
      // Complete handover
      updateClaim(selectedClaim.id, {
        status: "SUCCESSFULLY_RECEIVED",
        adminNotes: adminNotes.trim(),
        handedOverAt: new Date().toISOString()
      });

      if (selectedClaim.foundItemId) {
        updateItem(selectedClaim.foundItemId, { status: "SUCCESSFULLY_RECEIVED" });
      }
      if (selectedClaim.lostItemId) {
        updateItem(selectedClaim.lostItemId, { status: "SUCCESSFULLY_RECEIVED" });
      }

      saveNotification({
        userId: selectedClaim.claimantId,
        title: "Item Returned Successfully!",
        message: `Your item "${selectedClaim.itemTitle}" was successfully received and closed in campus records. Thank you for using SmartFind!`,
        type: "status",
        link: "/claims"
      });

      addToast(`Item handed over and report marked as Successfully Received!`, "success");
    }

    setSelectedClaim(null);
    setActionType(null);
    loadData();
  };

  const filtered = claims.filter((claim) => {
    const matchesSearch =
      String(claim.id).toLowerCase().includes(search.toLowerCase()) ||
      String(claim.itemTitle || "").toLowerCase().includes(search.toLowerCase()) ||
      String(claim.claimantName || "").toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || claim.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout activeTab="claims">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-indigo-600" />
              Claims & Ownership Verification ({claims.length})
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Review anti-fraud verification questions, student identification, and authorize physical item return.
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center gap-3 text-xs">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search claims by ID, item, claimant name..."
              className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>

          <div className="w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden"
            >
              <option value="all">All Claims</option>
              <option value="CLAIM_PENDING_ADMIN_REVIEW">Awaiting Review</option>
              <option value="APPROVED_FOR_RETURN">Approved for Return</option>
              <option value="SUCCESSFULLY_RECEIVED">Successfully Received</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {/* Claims Cards */}
        <div className="space-y-4">
          {filtered.length > 0 ? (
            filtered.map((claim) => {
              const badge = getStatusBadge(claim.status);
              return (
                <div
                  key={claim.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                        {claim.id}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {claim.itemTitle}
                      </h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase border ${badge.classes}`}>
                        {badge.label}
                      </span>
                    </div>

                    <span className="text-[11px] text-slate-400">
                      Filed on {formatDate(claim.createdAt)}
                    </span>
                  </div>

                  {/* Claimant Profile & Answers Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* Left: Claimant Info */}
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-2">
                      <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-indigo-500" />
                        Claimant Credentials
                      </h4>
                      <div className="space-y-1 text-slate-600 dark:text-slate-300">
                        <div>Name: <strong>{claim.claimantName}</strong></div>
                        <div className="flex items-center gap-1">
                          <GraduationCap className="w-3 h-3 text-slate-400" />
                          <span>Student/Emp ID: {claim.claimantStudentId || "STU-VERIFIED"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{claim.claimantEmail}</span>
                        </div>
                        {claim.claimantPhone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{claim.claimantPhone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Anti-Fraud Verification Answer */}
                    <div className="p-3.5 rounded-xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 space-y-2">
                      <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-indigo-500" />
                        Private Identifying Details Provided
                      </h4>
                      <p className="text-slate-700 dark:text-slate-300 italic bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-indigo-100 dark:border-indigo-900/60 leading-relaxed">
                        "{claim.identifyingAnswers || "Detailed description submitted during verification."}"
                      </p>
                      {claim.evidenceNotes && (
                        <p className="text-[11px] text-slate-500">
                          Pickup notes: {claim.evidenceNotes}
                        </p>
                      )}
                    </div>
                  </div>

                  {claim.adminNotes && (
                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200">
                      <strong>Security Review Notes:</strong> {claim.adminNotes}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <div className="flex items-center gap-2">
                      {claim.status !== "APPROVED_FOR_RETURN" && claim.status !== "SUCCESSFULLY_RECEIVED" && (
                        <button
                          onClick={() => openActionModal(claim, "approve")}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Approve for Return
                        </button>
                      )}

                      {claim.status === "APPROVED_FOR_RETURN" && (
                        <button
                          onClick={() => openActionModal(claim, "handover")}
                          className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition shadow-xs flex items-center gap-1"
                        >
                          <PackageCheck className="w-3.5 h-3.5" />
                          Confirm Physical Handover (Reunited)
                        </button>
                      )}

                      {claim.status !== "REJECTED" && claim.status !== "SUCCESSFULLY_RECEIVED" && (
                        <button
                          onClick={() => openActionModal(claim, "reject")}
                          className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold text-xs border border-rose-200 dark:border-rose-900 transition flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Reject Claim
                        </button>
                      )}
                    </div>

                    <span className="text-[11px] text-slate-400">
                      Target Item: {claim.foundItemId || "FR-10001"}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
              No claims match your search query or filter.
            </div>
          )}
        </div>

        {/* Action Dialog Modal */}
        {selectedClaim && actionType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
              <h3 className="text-base font-bold text-slate-900 dark:text-white capitalize">
                {actionType === "approve"
                  ? "Approve Claim for Return"
                  : actionType === "handover"
                  ? "Confirm Physical Handover"
                  : "Reject Claim"}
              </h3>
              <p className="text-xs text-slate-500">
                Claim #{selectedClaim.id} • {selectedClaim.itemTitle} ({selectedClaim.claimantName})
              </p>

              <form onSubmit={handleConfirmAction} className="space-y-3 text-xs">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Administrator Notes & Instructions to Claimant
                  </label>
                  <textarea
                    rows={4}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 p-3 focus:outline-hidden"
                    placeholder="Enter pickup window, required documents, or rejection reasoning..."
                    required={actionType === "reject"}
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedClaim(null);
                      setActionType(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-4 py-2 rounded-xl text-white font-bold shadow-xs ${
                      actionType === "reject"
                        ? "bg-rose-600 hover:bg-rose-700"
                        : "bg-indigo-600 hover:bg-indigo-700"
                    }`}
                  >
                    Confirm Action
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
