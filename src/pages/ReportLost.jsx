import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Upload,
  X,
  MapPin,
  Calendar,
  Clock,
  Tag,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Shield
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { saveItem, getItems, saveNotification } from "../utils/storage.js";
import { CATEGORIES, LOCATIONS } from "../data/mockItems.js";
import { findMatchesForLostItem } from "../utils/aiMatcher.js";
import { compressImageFile } from "../utils/helpers.js";
import Sidebar from "../components/Sidebar.jsx";
import Modal from "../components/Modal.jsx";

export default function ReportLost() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Form states
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("");
  const [brand, setBrand] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState("12:00");
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [locationDetails, setLocationDetails] = useState("");
  const [contactEmail, setContactEmail] = useState(user?.email || "");
  const [contactPhone, setContactPhone] = useState(user?.phone || "");
  const [contactPreference, setContactPreference] = useState("Email & Phone");
  const [verificationPassword, setVerificationPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [error, setError] = useState("");

  // AI Matching States after submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0); // 0 = idle, 1 = analyzing, 2 = searching, 3 = finished
  const [matchedResults, setMatchedResults] = useState([]);
  const [matchModalOpen, setMatchModalOpen] = useState(false);
  const [newlyCreatedItem, setNewlyCreatedItem] = useState(null);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(file.type)) {
      setError("Please upload a valid image (.jpg, .jpeg, .png, or .webp).");
      return;
    }

    try {
      const compressed = await compressImageFile(file, 800, 0.75);
      setImagePreview(compressed);
      setError("");
    } catch (err) {
      setError("Could not process image. Please try another.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !description.trim() || !location) {
      setError("Please fill out all required fields marked with *.");
      return;
    }

    if (!contactEmail.trim() || !contactPhone.trim()) {
      setError("Contact Email and Contact Phone are required.");
      return;
    }

    if (!verificationPassword.trim()) {
      setError("Private Verification Password is required.");
      return;
    }

    if (!confirmPassword.trim()) {
      setError("Please confirm your private verification password.");
      return;
    }

    if (verificationPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (description.trim().length < 10) {
      setError("Please provide a more descriptive summary (at least 10 characters).");
      return;
    }

    setIsSubmitting(true);
    setAnalysisStep(1); // "Analyzing item..."

    const saved = saveItem({
      type: "lost",
      title: title.trim(),
      category,
      description: description.trim(),
      color: color.trim() || "Unspecified",
      brand: brand.trim() || "Unspecified",
      date,
      time,
      location,
      locationDetails: locationDetails.trim(),
      contactPreference,
      verificationPassword: verificationPassword.trim(),
      image: imagePreview || "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80",
      reporterName: user?.name || "Campus Student",
      reporterEmail: contactEmail.trim(),
      reporterPhone: contactPhone.trim(),
      userId: user?.id || "user-guest",
      status: "active"
    });

    setNewlyCreatedItem(saved);

    // Simulated multi-step AI matching lifecycle
    setTimeout(() => {
      setAnalysisStep(2); // "Searching for possible matches..."
      setTimeout(() => {
        const allItems = getItems();
        const matches = findMatchesForLostItem(saved, allItems);
        setMatchedResults(matches);
        setAnalysisStep(3);
        setIsSubmitting(false);

        addToast("Your lost item has been successfully reported.", "success");

        if (matches.length > 0) {
          // Save notification
          saveNotification({
            userId: user?.id,
            title: `AI Match Alert: ${matches.length} Candidates Found!`,
            message: `Our smart matching detected ${matches.length} potential found item(s) for your "${saved.title}".`,
            type: "match",
            link: "/matches"
          });
          setMatchModalOpen(true);
        } else {
          // Navigate to My Reports
          navigate("/my-reports");
        }
      }, 700);
    }, 600);
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-[lightblue] dark:bg-slate-950">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-6">
        {/* Page Title */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                LOST ITEM REGISTRATION
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
              Report a Lost Item
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Submit details so our AI matching engine can immediately compare campus found-item logs.
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Multi-step loading progress bar when submitting */}
        {isSubmitting && (
          <div className="bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-2xl p-6 shadow-md text-center space-y-3 animate-in fade-in duration-150">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              {analysisStep === 1 && "Analyzing item attributes..."}
              {analysisStep === 2 && "Searching campus database for possible matches..."}
            </h4>
            <p className="text-xs text-slate-500">
              Cross-referencing category, colors, brand, and location tokens...
            </p>
          </div>
        )}

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6"
        >
          {/* Section 1: Item Identity */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
              1. Item Identity & Category
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Item Name *
                </label>
                <input
                  id="lost-item-title-input"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Black Leather Wildhorn Wallet, Blue Milton Flask, TI-84 Calculator"
                  className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category *
                </label>
                <select
                  id="lost-category-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Primary Color
                </label>
                <input
                  id="lost-color-input"
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="e.g. Black, Navy Blue, Silver"
                  className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Brand / Manufacturer
                </label>
                <input
                  id="lost-brand-input"
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. Apple, Milton, Wildhorn, Casio, Dell"
                  className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Contact Preference
                </label>
                <select
                  id="lost-contact-pref-select"
                  value={contactPreference}
                  onChange={(e) => setContactPreference(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Email & Phone">Email & Phone</option>
                  <option value="Email Only">Email Only</option>
                  <option value="Security Desk Relay">Security Desk Relay (Private)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Detailed Description *
                </label>
                <textarea
                  id="lost-desc-textarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Describe unique characteristics: stickers, engravings, contents, scratches, RFID lanyard, etc."
                  className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 2: When & Where */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
              2. When & Where Lost
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Campus Location *
                </label>
                <select
                  id="lost-location-select"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  {LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Specific Area / Room Details
                </label>
                <input
                  id="lost-location-details-input"
                  type="text"
                  value={locationDetails}
                  onChange={(e) => setLocationDetails(e.target.value)}
                  placeholder="e.g. 2nd Floor reading desk #14, Lab 3 PC-22"
                  className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Date Lost *
                </label>
                <input
                  id="lost-date-input"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Approximate Time Lost
                </label>
                <input
                  id="lost-time-input"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Contact Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
              3. Contact Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Contact Email *
                </label>
                <input
                  id="lost-contact-email-input"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="student@university.edu"
                  className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Contact Phone *
                </label>
                <input
                  id="lost-contact-phone-input"
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 4: Security & Private Verification Password */}
          <div className="space-y-4 p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/60">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-200">
                4. Private Verification Password (Mandatory)
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Create a secret verification password for this lost item. This password is kept strictly private, never displayed publicly or to finders, and will be required to authenticate your ownership when claiming a matched item.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Private Verification Password *
                </label>
                <input
                  id="lost-private-password-input"
                  type="password"
                  value={verificationPassword}
                  onChange={(e) => setVerificationPassword(e.target.value)}
                  placeholder="Enter secret password"
                  className="w-full py-2.5 px-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Confirm Private Verification Password *
                </label>
                <input
                  id="lost-confirm-password-input"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter secret password"
                  className="w-full py-2.5 px-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 5: Image Upload */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
              5. Image / Reference Photo
            </h3>

            <div>
              {imagePreview ? (
                <div className="relative w-full sm:w-72 h-48 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group">
                  <img
                    src={imagePreview}
                    alt="Upload preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                    <button
                      type="button"
                      id="remove-lost-image-btn"
                      onClick={() => setImagePreview("")}
                      className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <label
                  htmlFor="lost-image-upload"
                  className="flex flex-col items-center justify-center w-full sm:w-80 h-40 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition p-4 text-center"
                >
                  <Upload className="w-8 h-8 text-slate-400 mb-2" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Upload item photo (Optional)
                  </span>
                  <span className="text-[11px] text-slate-400 mt-1">
                    Accepts JPG, PNG, WEBP (Max 2MB)
                  </span>
                  <input
                    id="lost-image-upload"
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-400">
              Submitting triggers automated AI matching across all active campus logs.
            </p>

            <button
              type="submit"
              id="submit-lost-report-btn"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-semibold text-xs shadow-md shadow-rose-600/20 flex items-center justify-center gap-2 transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>Submit Lost Report & Run AI Match</span>
            </button>
          </div>
        </form>
      </main>

      {/* Immediate AI Matches Result Modal */}
      <Modal
        isOpen={matchModalOpen}
        onClose={() => {
          setMatchModalOpen(false);
          navigate("/matches");
        }}
        title={`🎉 ${matchedResults.length} Possible Match(es) Found!`}
        maxWidth="max-w-xl"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600 dark:text-slate-300">
            Our AI has matched your newly reported <strong>{newlyCreatedItem?.title}</strong> with existing items
            already logged by campus security and faculty:
          </p>

          <div className="space-y-3">
            {matchedResults.slice(0, 3).map((m, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-900 bg-indigo-50/40 dark:bg-indigo-950/20 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${m.badgeColor}`}>
                      {m.score}% AI Match
                    </span>
                    <span className="text-[11px] text-slate-500 font-semibold">{m.foundItem.location}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white mt-1">{m.foundItem.title}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{m.foundItem.description}</p>
                </div>

                <button
                  onClick={() => {
                    setMatchModalOpen(false);
                    navigate(`/item/${m.foundItem.id}`);
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shrink-0 shadow-xs"
                >
                  View & Claim
                </button>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <button
              onClick={() => {
                setMatchModalOpen(false);
                navigate("/my-reports");
              }}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300"
            >
              Go to My Reports
            </button>
            <button
              onClick={() => {
                setMatchModalOpen(false);
                navigate("/matches");
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold shadow-xs"
            >
              Open Match Center
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
