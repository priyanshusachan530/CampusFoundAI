import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Filter,
  MapPin,
  Calendar,
  AlertCircle,
  Tag,
  Eye,
  ChevronRight,
  ExternalLink,
  Info
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { getItems, saveClaim } from "../utils/storage.js";
import { findMatchesForLostItem } from "../utils/aiMatcher.js";
import Sidebar from "../components/Sidebar.jsx";
import Modal from "../components/Modal.jsx";

export default function Matches() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [filterConfidence, setFilterConfidence] = useState("all"); // all, high, medium, low
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Quick claim state
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [claimProof, setClaimProof] = useState("");
  const [identifyingMarks, setIdentifyingMarks] = useState("");
  const [isSubmittingClaim, setIsSubmittingClaim] = useState(false);

  const loadMatches = () => {
    const allItems = getItems();

    // Collect lost items: if student logged in, prioritize user's lost items; also allow viewing all campus pairings
    const lostItems = allItems.filter((i) => i.type === "lost" && i.status !== "resolved");

    let allPairs = [];
    lostItems.forEach((lost) => {
      const candidates = findMatchesForLostItem(lost, allItems);
      allPairs.push(...candidates);
    });

    // Sort by match score descending
    allPairs.sort((a, b) => b.score - a.score);
    setMatches(allPairs);
  };

  useEffect(() => {
    loadMatches();

    const handleUpdate = () => {
      loadMatches();
    };
    window.addEventListener("campuslink_data_updated", handleUpdate);
    return () => window.removeEventListener("campuslink_data_updated", handleUpdate);
  }, [user]);

  const filteredMatches = matches.filter((m) => {
    if (filterConfidence === "high") return m.score >= 80;
    if (filterConfidence === "medium") return m.score >= 60 && m.score < 80;
    if (filterConfidence === "low") return m.score < 60;
    return true;
  });

  const handleOpenDetails = (match) => {
    setSelectedMatch(match);
    setDetailModalOpen(true);
  };

  const handleOpenClaimModal = (match) => {
    setSelectedMatch(match);
    setClaimProof("");
    setIdentifyingMarks("");
    setDetailModalOpen(false);
    setClaimModalOpen(true);
  };

  const handleClaimSubmit = (e) => {
    e.preventDefault();
    if (!claimProof.trim()) {
      addToast("Please provide details proving your ownership.", "error");
      return;
    }
    setIsSubmittingClaim(true);
    try {
      const found = selectedMatch.foundItem;
      saveClaim({
        itemId: found.id,
        itemTitle: found.title,
        itemCategory: found.category,
        itemLocation: found.location,
        claimantId: user?.id || "user-student-1",
        claimantName: user?.name || "Campus Student",
        claimantEmail: user?.email || "student@campus.edu",
        claimantRole: user?.role || "Student",
        proofDescription: claimProof.trim(),
        identifyingMarks: identifyingMarks.trim() || undefined,
        status: "Pending",
        createdAt: new Date().toISOString()
      });

      addToast("Claim submitted successfully! Security desk will review it.", "success");
      setClaimModalOpen(false);
      setClaimProof("");
      setIdentifyingMarks("");
    } catch (err) {
      addToast("Failed submitting claim. Please try again.", "error");
    } finally {
      setIsSubmittingClaim(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                AI MATCH ENGINE
              </span>
              <span className="text-xs text-slate-400">Automated Cross-Referencing</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
              AI-Detected Match Center
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              High-confidence pairings between lost item reports and turned-in campus belongings. Click any card to inspect full match details.
            </p>
          </div>

          {/* Confidence Filter */}
          <div className="inline-flex p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium shadow-xs">
            <button
              onClick={() => setFilterConfidence("all")}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterConfidence === "all"
                  ? "bg-indigo-600 text-white font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              All ({matches.length})
            </button>
            <button
              onClick={() => setFilterConfidence("high")}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterConfidence === "high"
                  ? "bg-emerald-600 text-white font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              High ≥80%
            </button>
            <button
              onClick={() => setFilterConfidence("medium")}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterConfidence === "medium"
                  ? "bg-indigo-600 text-white font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Medium 60-79%
            </button>
            <button
              onClick={() => setFilterConfidence("low")}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterConfidence === "low"
                  ? "bg-amber-600 text-white font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Low &lt;60%
            </button>
          </div>
        </div>

        {/* Matches List */}
        {filteredMatches.length === 0 ? (
          <div className="py-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-xs">
            <Sparkles className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No matches found in this tier
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Switch filter to "All" or check back once new found belongings are logged.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredMatches.map((match, idx) => (
              <div
                key={idx}
                id={`match-card-${idx}`}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs overflow-hidden transition hover:border-indigo-300 dark:hover:border-indigo-700"
              >
                {/* Match Score Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-2">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 text-xs font-bold rounded-full border ${
                        match.badgeColor ||
                        (match.score >= 80
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300"
                          : match.score >= 60
                          ? "bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-300"
                          : "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300")
                      }`}
                    >
                      {match.score}% Match Confidence • {match.label}
                    </span>
                    <span className="text-xs text-slate-400">
                      Evaluated on category, location proximity, color, and description tokens.
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenDetails(match)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Click to Details</span>
                    </button>
                    <button
                      onClick={() => handleOpenClaimModal(match)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition flex items-center gap-1 cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Claim Found Item</span>
                    </button>
                  </div>
                </div>

                {/* Side-by-side comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-5">
                  {/* Left: Lost Item */}
                  <div className="p-4 rounded-xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                        REPORTED LOST
                      </span>
                      <span className="text-[11px] text-slate-400">{match.lostItem.date}</span>
                    </div>

                    <div className="flex gap-3">
                      <img
                        src={match.lostItem.image}
                        alt={match.lostItem.title}
                        className="w-16 h-16 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {match.lostItem.title}
                        </h4>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                          <span>{match.lostItem.location || match.lostItem.locationLost}</span>
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                          {match.lostItem.description}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-rose-100 dark:border-rose-900/40 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Reported by: {match.lostItem.reporterName}</span>
                      <Link
                        to={`/item/${match.lostItem.id}`}
                        className="font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
                      >
                        <span>Inspect Report</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>

                  {/* Right: Found Item */}
                  <div className="p-4 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        TURNED IN (FOUND)
                      </span>
                      <span className="text-[11px] text-slate-400">{match.foundItem.date}</span>
                    </div>

                    <div className="flex gap-3">
                      <img
                        src={match.foundItem.image}
                        alt={match.foundItem.title}
                        className="w-16 h-16 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {match.foundItem.title}
                        </h4>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
                          <span>{match.foundItem.location || match.foundItem.locationFound}</span>
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                          {match.foundItem.description}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-emerald-100 dark:border-emerald-900/40 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">
                        Custody: {match.foundItem.contactPreference || "Security Desk"}
                      </span>
                      <Link
                        to={`/item/${match.foundItem.id}`}
                        className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        <span>Inspect &amp; Claim</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Match reasoning pill breakdown */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">Matching Attributes:</span>
                  {match.reasons.map((r, rIdx) => (
                    <span
                      key={rIdx}
                      className="px-2.5 py-0.5 text-xs rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                    >
                      ✓ {r}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Match Details Inspection Modal */}
      {selectedMatch && (
        <Modal
          isOpen={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          title={`AI Match Details: ${selectedMatch.score}% Confidence`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-6 text-xs">
            {/* Score & Evaluation Banner */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider block">
                  Similarity Rating
                </span>
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {selectedMatch.score}% Match
                </span>
                <p className="text-xs text-slate-500 mt-0.5">{selectedMatch.label}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenClaimModal(selectedMatch)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs transition"
                >
                  Proceed with Claim Verification →
                </button>
              </div>
            </div>

            {/* Side-by-side Attribute Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Lost Item */}
              <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-700 dark:text-rose-300 text-xs">
                    Lost Report Specification
                  </span>
                  <span className="text-[10px] text-slate-400">{selectedMatch.lostItem.date}</span>
                </div>
                <img
                  src={selectedMatch.lostItem.image}
                  alt={selectedMatch.lostItem.title}
                  className="w-full h-36 object-cover rounded-xl"
                />
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    {selectedMatch.lostItem.title}
                  </h4>
                  <p className="text-slate-500">
                    Category: <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedMatch.lostItem.category}</span>
                  </p>
                  <p className="text-slate-500">
                    Location: <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedMatch.lostItem.location || selectedMatch.lostItem.locationLost}</span>
                  </p>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                    {selectedMatch.lostItem.description}
                  </p>
                </div>
              </div>

              {/* Found Item */}
              <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-700 dark:text-emerald-300 text-xs">
                    Found Item in Custody
                  </span>
                  <span className="text-[10px] text-slate-400">{selectedMatch.foundItem.date}</span>
                </div>
                <img
                  src={selectedMatch.foundItem.image}
                  alt={selectedMatch.foundItem.title}
                  className="w-full h-36 object-cover rounded-xl"
                />
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    {selectedMatch.foundItem.title}
                  </h4>
                  <p className="text-slate-500">
                    Category: <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedMatch.foundItem.category}</span>
                  </p>
                  <p className="text-slate-500">
                    Location: <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedMatch.foundItem.location || selectedMatch.foundItem.locationFound}</span>
                  </p>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                    {selectedMatch.foundItem.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Evaluation Factors */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
              <h5 className="font-bold text-slate-900 dark:text-white">
                Detected Attribute Matches:
              </h5>
              <div className="flex flex-wrap gap-2">
                {selectedMatch.reasons.map((r, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-indigo-600 dark:text-indigo-400 font-semibold"
                  >
                    ✓ {r}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Claim Modal for Found Item */}
      {selectedMatch && (
        <Modal
          isOpen={claimModalOpen}
          onClose={() => setClaimModalOpen(false)}
          title={`Claim Item: ${selectedMatch.foundItem.title}`}
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleClaimSubmit} className="space-y-4 text-xs">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-1 text-emerald-900 dark:text-emerald-200">
              <p className="font-bold">Match Verification Protocol</p>
              <p className="text-[11px] leading-relaxed">
                This item is currently held at{" "}
                <span className="font-bold">{selectedMatch.foundItem.location || "Campus Security Desk"}</span>.
                Provide specific proof of ownership to initiate the release review.
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                Proof of Ownership / Identifiers *
              </label>
              <textarea
                value={claimProof}
                onChange={(e) => setClaimProof(e.target.value)}
                required
                rows={3}
                placeholder="E.g., device passcode, lock screen wallpaper, invoice, serial number, or exact contents inside bag..."
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                Private Identifying Marks (Optional)
              </label>
              <input
                type="text"
                value={identifyingMarks}
                onChange={(e) => setIdentifyingMarks(e.target.value)}
                placeholder="E.g., scratch on back right corner, sticker inside casing..."
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setClaimModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingClaim}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs disabled:opacity-50"
              >
                {isSubmittingClaim ? "Submitting Claim..." : "Submit Claim for Verification"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
