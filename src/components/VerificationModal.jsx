import React, { useState } from "react";
import { ShieldCheck, Lock, AlertCircle, CheckCircle2, X } from "lucide-react";
import { saveClaim, updateItem, saveNotification } from "../utils/storage.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { generateClaimId } from "../utils/helpers.js";

export default function VerificationModal({
  isOpen,
  onClose,
  targetItem,
  userLostItem = null,
  onClaimSubmitted
}) {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [verificationPassword, setVerificationPassword] = useState("");
  const [identifyingAnswers, setIdentifyingAnswers] = useState("");
  const [evidenceNotes, setEvidenceNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !targetItem) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!verificationPassword.trim()) {
      setError("Please enter your Private Verification Password.");
      return;
    }

    if (!identifyingAnswers.trim()) {
      setError("Please describe unique identifying contents or features to prove ownership.");
      return;
    }

    // Check if matching against user's lost item private verification password
    let isPasswordCorrect = true;
    if (userLostItem && userLostItem.privateVerificationPassword) {
      if (userLostItem.privateVerificationPassword.trim() !== verificationPassword.trim()) {
        isPasswordCorrect = false;
      }
    }

    setSubmitting(true);

    setTimeout(() => {
      setSubmitting(false);

      if (!isPasswordCorrect) {
        setError("Verification Failed: The private verification password does not match the password stored in your Lost Report.");
        return;
      }

      const claimId = generateClaimId();
      const newClaim = {
        id: claimId,
        lostItemId: userLostItem?.id || "N/A",
        foundItemId: targetItem.id,
        claimantId: user?.id || "user-student-1",
        claimantName: user?.name || "Student Claimant",
        claimantEmail: user?.email || "student@smartfind.com",
        claimantPhone: user?.phone || "+91 98765 43210",
        itemTitle: targetItem.itemName || targetItem.title,
        itemCategory: targetItem.category,
        itemLocation: targetItem.locationFound || targetItem.location,
        identifyingAnswers: identifyingAnswers.trim(),
        evidenceNotes: evidenceNotes.trim(),
        verificationStatus: isPasswordCorrect ? "VERIFIED_MATCH" : "MANUAL_REVIEW",
        status: "CLAIM_PENDING_ADMIN_REVIEW",
        createdAt: new Date().toISOString()
      };

      saveClaim(newClaim);

      // Update target item status
      updateItem(targetItem.id, {
        status: "CLAIM_PENDING_ADMIN_REVIEW"
      });

      if (userLostItem) {
        updateItem(userLostItem.id, {
          status: "CLAIM_PENDING_ADMIN_REVIEW"
        });
      }

      // Notify administration and user
      saveNotification({
        userId: user?.id,
        title: "Ownership Claim Submitted",
        message: `Your ownership claim #${claimId} for "${targetItem.itemName || targetItem.title}" has been submitted for campus security review.`,
        type: "claim",
        link: "/claims"
      });

      addToast("Your ownership verification has been submitted. An administrator will review your claim.", "success");

      if (onClaimSubmitted) onClaimSubmitted(newClaim);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in duration-200">
        <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Anti-Fraud Ownership Verification
              </h3>
              <p className="text-xs text-slate-500">
                Claiming: <span className="font-semibold text-slate-700 dark:text-slate-300">{targetItem.itemName || targetItem.title}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* 1. Private Verification Password */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-indigo-500" />
              <span>Private Verification Password *</span>
            </label>
            <input
              type="password"
              value={verificationPassword}
              onChange={(e) => setVerificationPassword(e.target.value)}
              placeholder="Enter the password created when filing your report"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 px-3.5 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              required
            />
            <p className="text-[11px] text-slate-400">
              This secret prevents fraudulent claims and confirms you are the legitimate reporter.
            </p>
          </div>

          {/* 2. Specific Identifying Contents or Marks */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 dark:text-slate-200">
              Private Identifying Details *
            </label>
            <textarea
              rows={3}
              value={identifyingAnswers}
              onChange={(e) => setIdentifyingAnswers(e.target.value)}
              placeholder="e.g. Inside contents, card initials, unique scratches, serial number, lock screen wallpaper..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 p-3 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 leading-relaxed"
              required
            />
            <p className="text-[11px] text-slate-400">
              Only campus administrators will review this during physical handover verification.
            </p>
          </div>

          {/* 3. Additional Evidence Notes */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Additional Notes or Preferred Pickup Time (Optional)
            </label>
            <input
              type="text"
              value={evidenceNotes}
              onChange={(e) => setEvidenceNotes(e.target.value)}
              placeholder="e.g. Available between 2pm - 4pm at Main Gate Security"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 px-3.5 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              {submitting ? "Verifying..." : "Submit Claim for Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
