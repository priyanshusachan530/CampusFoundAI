import React, { useState } from "react";
import { Shield, ShieldAlert, CheckCircle2, Lock, X } from "lucide-react";
import Modal from "./Modal.jsx";
import { verifyItemPassword } from "../utils/storage.js";

export default function OwnershipVerifyModal({
  isOpen,
  onClose,
  lostItemId,
  foundItemId,
  itemTitle,
  userId,
  onSuccess
}) {
  const [passwordInput, setPasswordInput] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [showWrongOwnerModal, setShowWrongOwnerModal] = useState(false);
  const [claimNotes, setClaimNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const targetId = lostItemId || foundItemId;

  const handleVerify = (e) => {
    e.preventDefault();
    if (!passwordInput.trim()) return;

    const isValid = verifyItemPassword(targetId, passwordInput.trim(), userId);

    if (isValid) {
      setIsVerified(true);
    } else {
      setShowWrongOwnerModal(true);
    }
  };

  const handleCloseAll = () => {
    setPasswordInput("");
    setIsVerified(false);
    setShowWrongOwnerModal(false);
    setClaimNotes("");
    onClose();
  };

  const handleSubmitClaim = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (onSuccess) {
      onSuccess({
        notes: claimNotes,
        status: "CLAIM_PENDING_ADMIN_REVIEW",
        verifiedPassword: passwordInput
      });
    }
    handleCloseAll();
  };

  return (
    <>
      {/* Verification / Claim Form Modal */}
      <Modal
        isOpen={isOpen && !showWrongOwnerModal}
        onClose={handleCloseAll}
        title="Enter Private Verification Password"
        maxWidth="max-w-md"
      >
        {!isVerified ? (
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 text-xs text-indigo-900 dark:text-indigo-200">
              <div className="flex items-center gap-2 font-semibold">
                <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>Security Verification Required</span>
              </div>
              <p className="mt-1 text-slate-600 dark:text-slate-300">
                To claim <strong>{itemTitle || "this item"}</strong>, please enter the private verification password set when reporting the item.
              </p>
            </div>

            <div>
              <label
                htmlFor="verify-password-input"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Enter Private Verification Password:
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="verify-password-input"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter private password"
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                id="cancel-verify-btn"
                onClick={handleCloseAll}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="submit-verify-btn"
                className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/20"
              >
                Verify Password
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="font-bold text-sm">Ownership verified successfully.</span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Your password has been authenticated. You can now submit your ownership claim with status: <strong className="text-emerald-700 dark:text-emerald-300">CLAIM_PENDING_ADMIN_REVIEW</strong>.
            </p>

            <div>
              <label
                htmlFor="claim-notes-input"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                Optional Identification Notes / Pickup Details:
              </label>
              <textarea
                id="claim-notes-input"
                rows={2}
                value={claimNotes}
                onChange={(e) => setClaimNotes(e.target.value)}
                placeholder="e.g., Any additional markings or pickup preference..."
                className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                id="cancel-claim-btn"
                onClick={handleCloseAll}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                id="submit-claim-btn"
                disabled={isSubmitting}
                onClick={handleSubmitClaim}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20"
              >
                Submit Claim for Admin Review
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Wrong Owner of Item Modal */}
      <Modal
        isOpen={showWrongOwnerModal}
        onClose={handleCloseAll}
        title="Wrong Owner of Item"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-sm text-rose-900 dark:text-rose-100">Wrong Owner of Item</p>
              <p className="leading-relaxed">
                The verification password you entered is incorrect. You cannot claim this item unless you provide the correct ownership password.
              </p>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            For campus security, private verification records remain protected. If you believe this is an error, please contact campus security with valid student identification.
          </p>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              id="close-wrong-owner-btn"
              onClick={handleCloseAll}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white transition"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
