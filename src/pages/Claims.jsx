import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  FileText,
  Building,
  User,
  ExternalLink,
  ChevronRight,
  Eye,
  Info,
  PackageCheck
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { getClaims, updateClaim, deleteClaim, updateItem, saveNotification } from "../utils/storage.js";
import Sidebar from "../components/Sidebar.jsx";
import Modal from "../components/Modal.jsx";

export default function Claims() {
  const { user, isAdmin, isStaff } = useAuth();
  const { addToast } = useToast();

  const [claims, setClaims] = useState([]);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailClaim, setDetailClaim] = useState(null);
  const [notesInput, setNotesInput] = useState("");

  const loadClaimsData = () => {
    setClaims(getClaims());
  };

  useEffect(() => {
    loadClaimsData();

    const handleUpdate = () => {
      loadClaimsData();
    };
    window.addEventListener("campuslink_data_updated", handleUpdate);
    return () => window.removeEventListener("campuslink_data_updated", handleUpdate);
  }, []);

  const myClaims = claims.filter(
    (c) => !user || c.claimantId === user?.id || c.claimantEmail === user?.email
  );

  const getStatusDetails = (status) => {
    const s = String(status || "").toUpperCase();
    if (s.includes("APPROV") || s.includes("RETURN") || s.includes("SUCCESS")) {
      return {
        label: s.includes("SUCCESS") ? "Handed Over" : "Approved",
        badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
        icon: CheckCircle2
      };
    }
    if (s.includes("REJECT")) {
      return {
        label: "Rejected",
        badge: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-200 dark:border-rose-800",
        icon: XCircle
      };
    }
    return {
      label: "Pending Review",
      badge: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800",
      icon: Clock
    };
  };

  const handleOpenDetails = (claim) => {
    setDetailClaim(claim);
    setDetailModalOpen(true);
  };

  const handleWithdrawClaim = (id, title) => {
    if (window.confirm(`Are you sure you want to withdraw your claim for "${title}"?`)) {
      deleteClaim(id);
      loadClaimsData();
      if (detailModalOpen) setDetailModalOpen(false);
      addToast("Your claim has been withdrawn.", "info");
    }
  };

  const handleApprove = (claim) => {
    updateClaim(claim.id, {
      status: "Approved",
      adminNotes: notesInput || "Ownership verified. Item released to claimant."
    });

    if (claim.itemId) {
      updateItem(claim.itemId, { status: "resolved" });
    }

    saveNotification({
      userId: claim.claimantId,
      title: "Claim Approved! 🎉",
      message: `Your ownership claim for "${claim.itemTitle}" was approved by security staff. You may pick it up at the security desk.`,
      type: "claim",
      link: "/claims"
    });

    loadClaimsData();
    setDecisionModalOpen(false);
    if (detailModalOpen) setDetailModalOpen(false);
    addToast(`Claim for "${claim.itemTitle}" has been APPROVED.`, "success");
  };

  const handleReject = (claim) => {
    updateClaim(claim.id, {
      status: "Rejected",
      adminNotes: notesInput || "Proof details insufficient or contradictory."
    });

    saveNotification({
      userId: claim.claimantId,
      title: "Claim Status: Additional Verification Required",
      message: `Your claim for "${claim.itemTitle}" could not be confirmed automatically. Please visit Central Security in person.`,
      type: "claim",
      link: "/claims"
    });

    loadClaimsData();
    setDecisionModalOpen(false);
    if (detailModalOpen) setDetailModalOpen(false);
    addToast(`Claim for "${claim.itemTitle}" marked as REJECTED.`, "info");
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                VERIFICATION & CLAIMS
              </span>
              <span className="text-xs text-slate-400">Ownership Custody</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
              Claims Management Center
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Review and inspect ownership claims, verification proofs, and security release handovers.
            </p>
          </div>

          <Link
            to="/search?type=found"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition"
          >
            Browse Found Items to Claim
          </Link>
        </div>

        {/* SECTION 1: MY SUBMITTED CLAIMS */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              My Submitted Claims ({myClaims.length})
            </h3>
            <span className="text-xs text-slate-400">Security-verified requests</span>
          </div>

          {myClaims.length === 0 ? (
            <div className="py-10 text-center text-slate-400">
              <ShieldCheck className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                You haven't submitted any ownership claims yet
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                If you locate a turned-in belonging in our campus catalog, click "Claim This Item" to submit proof.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {myClaims.map((claim) => {
                const statusMeta = getStatusDetails(claim.status);
                const StatusIcon = statusMeta.icon;
                return (
                  <div
                    key={claim.id}
                    id={`my-claim-${claim.id}`}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-indigo-300 dark:hover:border-indigo-700 flex flex-col md:flex-row md:items-center justify-between gap-4 transition"
                  >
                    <div className="space-y-1.5 flex-1 cursor-pointer" onClick={() => handleOpenDetails(claim)}>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 text-[10px] font-bold rounded-md flex items-center gap-1 border ${statusMeta.badge}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {statusMeta.label.toUpperCase()}
                        </span>
                        <span className="text-xs text-slate-400">
                          Submitted on {new Date(claim.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          ID: #{claim.id}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                        Item: <span>{claim.itemTitle}</span>
                      </h4>

                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1">
                        <strong>Submitted Proof:</strong> "{claim.proofDescription}"
                      </p>

                      {claim.adminNotes && (
                        <div className="mt-2 p-2.5 rounded-lg bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 text-[11px] text-indigo-950 dark:text-indigo-200">
                          <span className="font-bold">Staff Instructions: </span>
                          {claim.adminNotes}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleOpenDetails(claim)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 text-xs font-semibold flex items-center gap-1 border border-indigo-200 dark:border-indigo-900 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Click to Details</span>
                      </button>

                      <Link
                        to={`/item/${claim.itemId}`}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200"
                      >
                        View Item
                      </Link>

                      {(!claim.status || claim.status === "Pending" || claim.status === "CLAIM_PENDING_ADMIN_REVIEW") && (
                        <button
                          onClick={() => handleWithdrawClaim(claim.id, claim.itemTitle)}
                          className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-100 cursor-pointer"
                        >
                          Withdraw
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SECTION 2: ALL CAMPUS CLAIMS (Accessible by Admin, Security, or staff review) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Campus Claims Log & Review Console
              </h3>
              <p className="text-xs text-slate-500">
                Click any row or "Click to Details" to inspect proof and process handovers.
              </p>
            </div>

            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              Total: {claims.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-semibold">
                  <th className="py-3 px-3">Item Title</th>
                  <th className="py-3 px-3">Claimant</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {claims.map((c) => {
                  const statusMeta = getStatusDetails(c.status);
                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition cursor-pointer"
                      onClick={() => handleOpenDetails(c)}
                    >
                      <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                        {c.itemTitle}
                      </td>
                      <td className="py-3 px-3">{c.claimantName}</td>
                      <td className="py-3 px-3">{c.claimantRole || "Student"}</td>
                      <td className="py-3 px-3">{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusMeta.badge}`}
                        >
                          {statusMeta.label}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleOpenDetails(c)}
                          className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold shadow-xs transition"
                        >
                          Click to Details
                        </button>
                        {(isAdmin || isStaff) && (
                          <button
                            onClick={() => {
                              setSelectedClaim(c);
                              setNotesInput(c.adminNotes || "");
                              setDecisionModalOpen(true);
                            }}
                            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                          >
                            Review
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Comprehensive Claim Details Modal */}
      {detailClaim && (
        <Modal
          isOpen={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          title={`Claim Details: ${detailClaim.itemTitle}`}
          maxWidth="max-w-xl"
        >
          <div className="space-y-4 text-xs">
            {/* Status & ID banner */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-[11px] text-slate-400 block">Claim Reference</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">#{detailClaim.id}</span>
              </div>
              <div>
                {(() => {
                  const sm = getStatusDetails(detailClaim.status);
                  return (
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${sm.badge}`}>
                      {sm.label}
                    </span>
                  );
                })()}
              </div>
            </div>

            {/* Claimant Information */}
            <div className="p-3.5 bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60 rounded-xl space-y-1">
              <span className="font-bold text-indigo-900 dark:text-indigo-300 block mb-1">
                Claimant Information
              </span>
              <p className="text-slate-800 dark:text-slate-200">
                <strong>Name:</strong> {detailClaim.claimantName} ({detailClaim.claimantRole || "Student"})
              </p>
              <p className="text-slate-800 dark:text-slate-200">
                <strong>Email:</strong> {detailClaim.claimantEmail}
              </p>
              <p className="text-slate-500 dark:text-slate-400">
                <strong>Submitted On:</strong> {new Date(detailClaim.createdAt).toLocaleString()}
              </p>
            </div>

            {/* Ownership Proof */}
            <div className="space-y-1">
              <label className="block font-bold text-slate-800 dark:text-slate-200">
                Submitted Proof of Ownership:
              </label>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                {detailClaim.proofDescription || "No detailed description provided."}
              </div>
            </div>

            {/* Private Identifying Marks */}
            {detailClaim.identifyingMarks && (
              <div className="space-y-1">
                <label className="block font-bold text-slate-800 dark:text-slate-200">
                  Private Identifying Marks / Serial:
                </label>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">
                  {detailClaim.identifyingMarks}
                </div>
              </div>
            )}

            {/* Admin Notes & Handover Instructions */}
            {detailClaim.adminNotes && (
              <div className="space-y-1">
                <label className="block font-bold text-slate-800 dark:text-slate-200">
                  Campus Security / Admin Instructions:
                </label>
                <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-900 dark:text-emerald-200">
                  {detailClaim.adminNotes}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Link
                  to={`/item/${detailClaim.itemId}`}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  View Catalog Item →
                </Link>
                {(!detailClaim.status || detailClaim.status === "Pending" || detailClaim.status === "CLAIM_PENDING_ADMIN_REVIEW") && (
                  <button
                    onClick={() => handleWithdrawClaim(detailClaim.id, detailClaim.itemTitle)}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-semibold hover:bg-rose-100"
                  >
                    Withdraw Claim
                  </button>
                )}
              </div>

              {(isAdmin || isStaff) && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedClaim(detailClaim);
                      setNotesInput(detailClaim.adminNotes || "");
                      setDecisionModalOpen(true);
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-xs"
                  >
                    Process Review / Decision
                  </button>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Review & Decision Modal */}
      {selectedClaim && (
        <Modal
          isOpen={decisionModalOpen}
          onClose={() => setDecisionModalOpen(false)}
          title={`Review Claim: ${selectedClaim.itemTitle}`}
          maxWidth="max-w-lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl space-y-1">
              <p className="font-bold text-slate-900 dark:text-white">Claimant:</p>
              <p className="text-slate-600 dark:text-slate-300">
                {selectedClaim.claimantName} ({selectedClaim.claimantRole || "Student"}) • {selectedClaim.claimantEmail}
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                Proof of Ownership Provided:
              </label>
              <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60 rounded-xl text-slate-800 dark:text-slate-200">
                {selectedClaim.proofDescription}
              </div>
            </div>

            {selectedClaim.identifyingMarks && (
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Private Identifying Marks:
                </label>
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-300">
                  {selectedClaim.identifyingMarks}
                </div>
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                Staff Decision Notes / Pickup Instructions:
              </label>
              <textarea
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                rows={3}
                placeholder="Enter desk pickup instructions, room number, or rejection justification..."
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => handleReject(selectedClaim)}
                className="px-4 py-2 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-semibold"
              >
                Reject Claim
              </button>
              <button
                onClick={() => handleApprove(selectedClaim)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs"
              >
                Approve & Release Item
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
