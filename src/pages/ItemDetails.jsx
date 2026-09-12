import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  Tag,
  ShieldCheck,
  Sparkles,
  Phone,
  Mail,
  Share2,
  AlertCircle,
  CheckCircle2,
  Lock,
  Upload,
  User
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import {
  getItemById,
  getItems,
  updateItem,
  saveClaim,
  saveNotification,
  getClaims,
  deleteItem
} from "../utils/storage.js";
import { calculateMatchScore, findMatchesForLostItem, findMatchesForFoundItem } from "../utils/aiMatcher.js";
import Modal from "../components/Modal.jsx";
import ItemCard from "../components/ItemCard.jsx";
import OwnershipVerifyModal from "../components/OwnershipVerifyModal.jsx";
import DeleteConfirmModal from "../components/DeleteConfirmModal.jsx";
import { Trash2 } from "lucide-react";

export default function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { addToast } = useToast();

  const [item, setItem] = useState(null);
  const [matchingCandidates, setMatchingCandidates] = useState([]);
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  // Claim Form State
  const [claimProof, setClaimProof] = useState("");
  const [identifyingMarks, setIdentifyingMarks] = useState("");
  const [isSubmittingClaim, setIsSubmittingClaim] = useState(false);
  const [existingClaim, setExistingClaim] = useState(null);

  useEffect(() => {
    const found = getItemById(id);
    if (!found) {
      setItem(null);
      return;
    }
    setItem(found);

    // Compute matches
    const allItems = getItems();
    if (found.type === "lost") {
      setMatchingCandidates(findMatchesForLostItem(found, allItems));
    } else {
      setMatchingCandidates(findMatchesForFoundItem(found, allItems));
    }

    // Check if user already claimed this item
    const allClaims = getClaims();
    const userClaim = allClaims.find(
      (c) => String(c.itemId) === String(id) && c.claimantId === user?.id
    );
    setExistingClaim(userClaim || null);
  }, [id, user]);

  if (!item) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Item Not Found</h2>
          <p className="text-xs text-slate-500">
            The item report you are looking for may have been removed or resolved by campus administration.
          </p>
          <Link
            to="/search"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Search</span>
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = user && user.id === item.userId;
  const isLost = item.type === "lost";
  const isResolved = item.status === "resolved";

  const handleClaimSubmit = (e) => {
    e.preventDefault();
    if (!claimProof.trim()) {
      addToast("Please provide details proving your ownership.", "error");
      return;
    }
    setIsSubmittingClaim(true);
    try {
      const createdClaim = saveClaim({
        itemId: item.id,
        itemTitle: item.title,
        itemCategory: item.category,
        itemLocation: item.location,
        claimantId: user?.id || "user-student-1",
        claimantName: user?.name || "Campus Student",
        claimantEmail: user?.email || "student@campuslink.edu",
        claimantRole: user?.role || "Student",
        proofDescription: claimProof.trim(),
        identifyingMarks: identifyingMarks.trim() || "Not specified",
        status: "CLAIM_PENDING_ADMIN_REVIEW",
        adminNotes: ""
      });

      if (item.userId && item.userId !== user?.id) {
        saveNotification({
          userId: item.userId,
          title: "New Ownership Claim Submitted",
          message: `${user?.name || "A student"} submitted a claim for "${item.title}". Campus staff will review.`,
          type: "claim",
          link: "/claims"
        });
      }

      setExistingClaim(createdClaim);
      setClaimModalOpen(false);
      setClaimProof("");
      setIdentifyingMarks("");
      addToast("Ownership claim submitted successfully. Campus staff will review it.", "success");
    } catch (err) {
      console.error(err);
      addToast("Failed to submit claim. Please try again.", "error");
    } finally {
      setIsSubmittingClaim(false);
    }
  };

  const handleMarkResolved = () => {
    updateItem(item.id, { status: "resolved" });
    setItem((prev) => ({ ...prev, status: "resolved" }));
    addToast("Item status updated to RESOLVED.", "success");
  };

  const handleVerificationSuccess = (claimData) => {
    const createdClaim = saveClaim({
      itemId: item.id,
      itemTitle: item.title,
      itemCategory: item.category,
      itemLocation: item.location,
      claimantId: user?.id || "user-student-1",
      claimantName: user?.name || "Campus Student",
      claimantEmail: user?.email || "student@smartfind.com",
      claimantRole: user?.role || "Student",
      proofDescription: claimData.notes || "Private verification password matched successfully.",
      identifyingMarks: "Password verified",
      status: "CLAIM_PENDING_ADMIN_REVIEW",
      adminNotes: "Private password verified by claimant."
    });

    if (item.userId && item.userId !== user?.id) {
      saveNotification({
        userId: item.userId,
        title: "New Ownership Claim Submitted",
        message: `${user?.name || "A student"} submitted an authenticated claim for "${item.title}". Campus staff is reviewing.`,
        type: "claim",
        link: "/claims"
      });
    }

    setExistingClaim(createdClaim);
    addToast("Ownership verified successfully. Claim submitted for admin review.", "success");
  };

  const handleDeleteItem = () => {
    if (!item) return;
    const isLost = item.type === "lost";
    deleteItem(item.id);
    setDeleteModalOpen(false);
    addToast(
      isLost ? "Lost report deleted successfully." : "Found report deleted successfully.",
      "success"
    );
    navigate(-1);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            id="back-to-search-btn"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2">
            {isResolved ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-white shadow-xs">
                RESOLVED & RETURNED
              </span>
            ) : isLost ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-600 text-white shadow-xs">
                LOST ITEM
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-xs">
                FOUND ITEM
              </span>
            )}
          </div>
        </div>

        {/* Main Details Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-12">
            {/* Left Image Section */}
            <div className="md:col-span-5 bg-slate-100 dark:bg-slate-800 relative min-h-[300px] md:min-h-full">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80";
                }}
              />
              <div className="absolute bottom-3 left-3">
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-slate-900/80 text-white backdrop-blur-xs">
                  {item.category}
                </span>
              </div>
            </div>

            {/* Right Information Section */}
            <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Item ID: {item.id}
                  </span>
                  <span className="text-xs text-slate-500">
                    Reported on {new Date(item.createdAt || item.date).toLocaleDateString()}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
                  {item.title}
                </h1>

                <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {item.description}
                </p>

                {/* Attributes Grid */}
                <div className="mt-6 grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium">Campus Location</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      {item.location}
                    </span>
                    {item.locationDetails && (
                      <span className="text-[11px] text-slate-500 block truncate mt-0.5">
                        {item.locationDetails}
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-slate-400 block font-medium">Date & Time</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      {item.date} {item.time ? `• ${item.time}` : ""}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-medium">Color</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block mt-0.5">
                      {item.color || "Not specified"}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-medium">Brand</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block mt-0.5">
                      {item.brand || "Not specified"}
                    </span>
                  </div>
                </div>

                {/* Reporter / Custody badge */}
                <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <span>
                      Logged by <strong>{item.reporterName}</strong> ({item.contactPreference || "Campus Desk"})
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Cluster */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3">
                {/* Submit Claim button (if found item and not user's own) */}
                {!isLost && !isOwner && !isResolved && (
                  <>
                    {existingClaim ? (
                      <Link
                        to="/claims"
                        className="px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800 text-xs font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1.5 transition shadow-xs"
                      >
                        <ShieldCheck className="w-4 h-4 text-amber-600" />
                        <span>Claim Status: {existingClaim.status} (Click to View)</span>
                      </Link>
                    ) : (
                      <button
                        id="submit-claim-btn"
                        type="button"
                        onClick={() => setClaimModalOpen(true)}
                        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 transition cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Claim This Item</span>
                      </button>
                    )}
                  </>
                )}

                {/* Contact Reporter */}
                <button
                  id="contact-reporter-btn"
                  type="button"
                  onClick={() => setContactModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Contact Reporter</span>
                </button>

                {/* Owner / Admin Mark Resolved */}
                {(isOwner || isAdmin) && !isResolved && (
                  <button
                    id="mark-resolved-btn"
                    type="button"
                    onClick={handleMarkResolved}
                    className="px-4 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-semibold text-xs hover:bg-indigo-100 transition cursor-pointer"
                  >
                    Mark as Resolved / Returned
                  </button>
                )}

                {/* Owner / Admin Delete Item */}
                {(isOwner || isAdmin) && (
                  <button
                    id="delete-item-btn"
                    type="button"
                    onClick={() => setDeleteModalOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-semibold text-xs hover:bg-rose-100 dark:hover:bg-rose-900/60 flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Report</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* AI Suggested Matches Cross-Reference Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  AI-Assisted Matching Candidates
                </h3>
                <p className="text-xs text-slate-500">
                  {isLost
                    ? "Found items in the campus database that closely match this report"
                    : "Lost items reported by students that may correspond to this item"}
                </p>
              </div>
            </div>

            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              {matchingCandidates.length} candidate(s)
            </span>
          </div>

          {matchingCandidates.length === 0 ? (
            <div className="p-6 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
              <p className="text-xs text-slate-500">
                No high-confidence AI pairings found in the system right now.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {matchingCandidates.slice(0, 3).map((match, idx) => (
                <ItemCard
                  key={idx}
                  item={match.targetItem}
                  matchScore={match.score}
                  matchLabel={match.label}
                  matchBadgeColor={match.badgeColor}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Claim Submission Modal */}
      <Modal
        isOpen={claimModalOpen}
        onClose={() => setClaimModalOpen(false)}
        title="Submit Ownership Claim & Verification"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleClaimSubmit} className="space-y-4 text-xs">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl flex items-start gap-2.5 text-amber-900 dark:text-amber-200">
            <Lock className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="font-bold">Ownership Verification Required</p>
              <p className="text-[11px] mt-0.5">
                To prevent theft and wrongful claims, only share confidential information (such as internal wallet contents, PIN/serial, or specific scratches) that only the true owner would know.
              </p>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Why do you believe this item belongs to you? *
            </label>
            <textarea
              id="claim-proof-textarea"
              value={claimProof}
              onChange={(e) => setClaimProof(e.target.value)}
              rows={3}
              placeholder="e.g. Inside the wallet is my student RFID card with roll number CS-2023-048 and a metro pass with my signature on the back..."
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Additional Identifying Information / Unique Marks
            </label>
            <textarea
              id="claim-marks-textarea"
              value={identifyingMarks}
              onChange={(e) => setIdentifyingMarks(e.target.value)}
              rows={2}
              placeholder="e.g. Serial number, purchase invoice date, specific custom stickers..."
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setClaimModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="confirm-submit-claim-btn"
              disabled={isSubmittingClaim}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold shadow-xs"
            >
              {isSubmittingClaim ? "Submitting Claim..." : "Submit Claim for Staff Review"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Contact Reporter Modal */}
      <Modal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        title="Contact Reporter / Campus Custody"
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-3">
            <div>
              <span className="text-slate-400 block">Reported By</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                {item.reporterName}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block">Contact Preference</span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                {item.contactPreference || "Campus Desk"}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block">Official Campus Email</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {item.reporterEmail}
              </span>
            </div>

            {item.reporterPhone && (
              <div>
                <span className="text-slate-400 block">Phone / Extension</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {item.reporterPhone}
                </span>
              </div>
            )}
          </div>

          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 text-indigo-900 dark:text-indigo-200 text-[11px] leading-relaxed">
            <p className="font-bold mb-1">Campus Safety Recommendation:</p>
            For safety and accountability, we recommend arranging handovers in public campus areas (such as the Central Library Helpdesk or Security Guard Post).
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setContactModalOpen(false)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold shadow-xs"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* Ownership Password Verification Modal */}
      <OwnershipVerifyModal
        isOpen={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
        lostItemId={item.id}
        foundItemId={item.id}
        itemTitle={item.title}
        userId={user?.id}
        onSuccess={handleVerificationSuccess}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteItem}
        title="Delete Report Confirmation"
        message="Are you sure you want to delete this report?"
      />
    </div>
  );
}
