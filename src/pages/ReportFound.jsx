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
import { findMatchesForFoundItem } from "../utils/aiMatcher.js";
import { compressImageFile } from "../utils/helpers.js";
import Sidebar from "../components/Sidebar.jsx";
import Modal from "../components/Modal.jsx";

export default function ReportFound() {
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
  const [contactPreference, setContactPreference] = useState("Security Desk");
  const [imagePreview, setImagePreview] = useState("");
  const [error, setError] = useState("");

  // AI Matching States
  const [isSubmitting, setIsSubmitting] = useState(false);
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

    if (description.trim().length < 10) {
      setError("Please provide a more descriptive summary (at least 10 characters).");
      return;
    }

    setIsSubmitting(true);

    const saved = saveItem({
      type: "found",
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
      image: imagePreview || "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80",
      reporterName: user?.name || "Campus Community Member",
      reporterEmail: user?.email || "finder@smartfind.com",
      reporterPhone: user?.phone || "+91 98000 00000",
      userId: user?.id || "user-guest",
      status: "active"
    });

    setNewlyCreatedItem(saved);

    setTimeout(() => {
      const allItems = getItems();
      const matches = findMatchesForFoundItem(saved, allItems);
      setMatchedResults(matches);
      setIsSubmitting(false);

      addToast("Your found item report has been logged. Thank you!", "success");

      // Notify potential lost item owners
      matches.forEach((m) => {
        if (m.lostItem.userId) {
          saveNotification({
            userId: m.lostItem.userId,
            title: "Possible Match for Your Lost Item!",
            message: `A "${saved.title}" was just turned in at ${saved.location} (${m.score}% match).`,
            type: "match",
            link: "/matches"
          });
        }
      });

      if (matches.length > 0) {
        setMatchModalOpen(true);
      } else {
        navigate("/my-reports");
      }
    }, 600);
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-[lightblue] dark:bg-slate-950">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                FOUND ITEM REGISTRATION
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
              Report a Found Item
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Turn in an item or catalog it so our AI can notify the student who lost it.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

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
                  id="found-item-title-input"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Black Leather Wallet, Student ID Card, Casio Watch"
                  className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category *
                </label>
                <select
                  id="found-category-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
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
                  id="found-color-input"
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="e.g. Black, Grey, Blue"
                  className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Brand / Manufacturer
                </label>
                <input
                  id="found-brand-input"
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. Wildhorn, Milton, Sony, Apple"
                  className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Custody / Turn-in Location
                </label>
                <select
                  id="found-custody-select"
                  value={contactPreference}
                  onChange={(e) => setContactPreference(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Security Desk">Security Desk (Main Gate)</option>
                  <option value="Library Helpdesk">Library Helpdesk</option>
                  <option value="Department Office">Department Office</option>
                  <option value="Canteen Manager">Canteen Manager</option>
                  <option value="Finder in Possession">Finder in Possession</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Detailed Description *
                </label>
                <textarea
                  id="found-desc-textarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Provide general features, condition, where it was picked up, etc. Avoid revealing confidential serial numbers or private ID info here."
                  className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 2: Location and Timing */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
              2. Where & When Found
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Campus Location Found *
                </label>
                <select
                  id="found-location-select"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
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
                  Specific Area Found
                </label>
                <input
                  id="found-location-details-input"
                  type="text"
                  value={locationDetails}
                  onChange={(e) => setLocationDetails(e.target.value)}
                  placeholder="e.g. Under chair row 4, front entrance lawn"
                  className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Date Found *
                </label>
                <input
                  id="found-date-input"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Time Found
                </label>
                <input
                  id="found-time-input"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Photo Upload */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
              3. Item Photograph
            </h3>

            <div>
              {imagePreview ? (
                <div className="relative w-full sm:w-72 h-48 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group">
                  <img src={imagePreview} alt="Found item" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                    <button
                      type="button"
                      id="remove-found-image-btn"
                      onClick={() => setImagePreview("")}
                      className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <label
                  htmlFor="found-image-upload"
                  className="flex flex-col items-center justify-center w-full sm:w-80 h-40 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition p-4 text-center"
                >
                  <Upload className="w-8 h-8 text-slate-400 mb-2" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Upload found item photo
                  </span>
                  <span className="text-[11px] text-slate-400 mt-1">
                    Accepts JPG, PNG, WEBP (Max 2MB)
                  </span>
                  <input
                    id="found-image-upload"
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-400">
              The AI matching engine will search open lost reports immediately.
            </p>

            <button
              type="submit"
              id="submit-found-report-btn"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>Submit Found Report & Check Matches</span>
            </button>
          </div>
        </form>
      </main>

      {/* Matching Lost Reports Found Modal */}
      <Modal
        isOpen={matchModalOpen}
        onClose={() => {
          setMatchModalOpen(false);
          navigate("/my-reports");
        }}
        title={`🔍 ${matchedResults.length} Matching Lost Item(s) Found!`}
        maxWidth="max-w-xl"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600 dark:text-slate-300">
            Great news! Students have previously reported missing items matching what you found:
          </p>

          <div className="space-y-3">
            {matchedResults.slice(0, 3).map((m, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-emerald-100 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${m.badgeColor}`}>
                      {m.score}% AI Match
                    </span>
                    <span className="text-[11px] text-slate-500 font-semibold">{m.lostItem.location}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white mt-1">{m.lostItem.title}</h4>
                  <p className="text-[11px] text-slate-500">Reported by: {m.lostItem.reporterName}</p>
                </div>

                <button
                  onClick={() => {
                    setMatchModalOpen(false);
                    navigate(`/item/${m.lostItem.id}`);
                  }}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shrink-0 shadow-xs"
                >
                  View Details
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
                navigate("/search");
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold shadow-xs"
            >
              View All Items
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
