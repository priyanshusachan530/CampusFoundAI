import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sparkles,
  PlusCircle,
  Search,
  FileText,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Clock,
  MapPin,
  CheckCircle2,
  Trash2,
  Eye,
  Tag,
  Calendar,
  Lock,
  ExternalLink
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { getItems, getClaims, getNotifications, deleteItem } from "../utils/storage.js";
import { findMatchesForLostItem } from "../utils/aiMatcher.js";
import Sidebar from "../components/Sidebar.jsx";
import StatCard from "../components/StatCard.jsx";
import ItemCard from "../components/ItemCard.jsx";
import DeleteConfirmModal from "../components/DeleteConfirmModal.jsx";
import OwnershipVerifyModal from "../components/OwnershipVerifyModal.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [matches, setMatches] = useState([]);
  const [activeCategory, setActiveCategory] = useState("lost"); // 'lost' | 'found' | 'matches' | 'received' | 'claims' | 'active'

  // Modal States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [verifyTarget, setVerifyTarget] = useState(null);

  const loadDashboardData = () => {
    const allItems = getItems();
    const allClaims = getClaims();
    const allNotifs = getNotifications(user?.id);

    setItems(allItems);
    setClaims(allClaims);
    setNotifications(allNotifs);

    // Compute AI matches for items reported by the current user
    const userLostItems = allItems.filter(
      (i) => (i.userId === user?.id || i.reporterEmail === user?.email) && i.type === "lost" && i.status !== "resolved" && i.status !== "SUCCESSFULLY_RECEIVED"
    );

    let calculatedMatches = [];
    userLostItems.forEach((lostItem) => {
      const itemMatches = findMatchesForLostItem(lostItem, allItems);
      calculatedMatches.push(...itemMatches);
    });

    setMatches(calculatedMatches);
  };

  useEffect(() => {
    loadDashboardData();
    const handleUpdate = () => loadDashboardData();
    window.addEventListener("campuslink_data_updated", handleUpdate);
    return () => window.removeEventListener("campuslink_data_updated", handleUpdate);
  }, [user]);

  // Greeting helper
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Student specific data
  const isUserItem = (i) => !user || i.userId === user?.id || i.reporterEmail === user?.email;
  const isUserClaim = (c) => !user || c.claimantId === user?.id || c.claimantEmail === user?.email;

  const myLostItems = items.filter((i) => isUserItem(i) && i.type === "lost");
  const myFoundItems = items.filter((i) => isUserItem(i) && i.type === "found");
  const myReceivedItems = items.filter(
    (i) => isUserItem(i) && (i.status === "SUCCESSFULLY_RECEIVED" || i.status === "resolved")
  );
  const myPendingClaims = claims.filter(
    (c) => isUserClaim(c) && (c.status === "CLAIM_PENDING_ADMIN_REVIEW" || c.status === "Pending")
  );
  const myActiveReports = items.filter(
    (i) => isUserItem(i) && i.status !== "SUCCESSFULLY_RECEIVED" && i.status !== "resolved"
  );

  const confirmDeleteItem = (item) => {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  };

  const handlePerformDelete = () => {
    if (!itemToDelete) return;
    const isLost = itemToDelete.type === "lost";
    deleteItem(itemToDelete.id);
    setDeleteModalOpen(false);
    setItemToDelete(null);
    loadDashboardData();
    addToast(
      isLost ? "Lost report deleted successfully." : "Found report deleted successfully.",
      "success"
    );
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-[lightblue] dark:bg-slate-950">
      {/* Structural Sidebar */}
      <Sidebar />

      {/* Main Dashboard Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {getGreeting()}, {user?.name ? user.name.split(" ")[0] : "Student"} 👋
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Campus recovery portal • ID: {user?.studentId || "STU-001"} • {user?.department || "Campus Student"}
            </p>
          </div>

          {/* Quick Action Buttons Header */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              id="dash-quick-report-lost"
              to="/report-lost"
              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-xs flex items-center gap-1.5 transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Report Lost</span>
            </Link>

            <Link
              id="dash-quick-report-found"
              to="/report-found"
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs flex items-center gap-1.5 transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Report Found</span>
            </Link>

            <Link
              id="dash-quick-search"
              to="/search"
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition"
            >
              <Search className="w-3.5 h-3.5 text-indigo-500" />
              <span>Search</span>
            </Link>

            <Link
              id="dash-quick-matches"
              to="/matches"
              className="px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-semibold text-xs border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Matches ({matches.length})</span>
            </Link>
          </div>
        </div>

        {/* 6 Fully Clickable & Functional Student Stat Cards */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Interactive Dashboard Overview (Click any card to filter data below)
            </h2>
            <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
              Currently viewing: <strong className="capitalize">{activeCategory}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
            <StatCard
              id="student-card-lost-items"
              title="Lost Items"
              value={myLostItems.length}
              subtitle="Reported lost"
              icon={FileText}
              color="rose"
              trend="View your lost"
              isActive={activeCategory === "lost"}
              onClick={() => setActiveCategory("lost")}
            />
            <StatCard
              id="student-card-found-items"
              title="Found Items"
              value={myFoundItems.length}
              subtitle="Turned in by you"
              icon={PlusCircle}
              color="emerald"
              trend="View your found"
              isActive={activeCategory === "found"}
              onClick={() => setActiveCategory("found")}
            />
            <StatCard
              id="student-card-matches"
              title="Possible Matches"
              value={matches.length}
              subtitle="AI pairings"
              icon={Sparkles}
              color="indigo"
              trend="Inspect matches"
              isActive={activeCategory === "matches"}
              onClick={() => setActiveCategory("matches")}
            />
            <StatCard
              id="student-card-received-items"
              title="Successfully Received"
              value={myReceivedItems.length}
              subtitle="Reunited items"
              icon={CheckCircle2}
              color="teal"
              trend="View received"
              isActive={activeCategory === "received"}
              onClick={() => setActiveCategory("received")}
            />
            <StatCard
              id="student-card-pending-claims"
              title="Pending Claims"
              value={myPendingClaims.length}
              subtitle="Under review"
              icon={ShieldCheck}
              color="amber"
              trend="Track claims"
              isActive={activeCategory === "claims"}
              onClick={() => setActiveCategory("claims")}
            />
            <StatCard
              id="student-card-active-reports"
              title="Active Reports"
              value={myActiveReports.length}
              subtitle="Open reports"
              icon={Clock}
              color="sky"
              trend="View active"
              isActive={activeCategory === "active"}
              onClick={() => setActiveCategory("active")}
            />
          </div>
        </div>

        {/* Dynamic Interactive Display Section based on Selected Dashboard Box */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6">
          {/* Header of Active View */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 text-[11px] font-black uppercase rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  Dashboard View
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {activeCategory === "lost" && `Your Reported Lost Items (${myLostItems.length})`}
                  {activeCategory === "found" && `Your Reported Found Items (${myFoundItems.length})`}
                  {activeCategory === "matches" && `AI-Generated Matches For Your Lost Items (${matches.length})`}
                  {activeCategory === "received" && `Items Successfully Received & Reunited (${myReceivedItems.length})`}
                  {activeCategory === "claims" && `Your Pending Ownership Claims (${myPendingClaims.length})`}
                  {activeCategory === "active" && `All Your Active Reports (${myActiveReports.length})`}
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {activeCategory === "lost" && "Items you have reported missing on campus. You can view, verify, or delete reports."}
                {activeCategory === "found" && "Items you have found and logged into campus custody. You can manage or withdraw reports."}
                {activeCategory === "matches" && "AI-detected pairings between your lost items and items found by the community."}
                {activeCategory === "received" && "Items that have completed verification and were successfully returned to you."}
                {activeCategory === "claims" && "Claims you submitted with private verification password awaiting admin review."}
                {activeCategory === "active" && "All active lost and found submissions currently under campus tracking."}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {activeCategory === "lost" && (
                <Link
                  to="/report-lost"
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Report New Lost</span>
                </Link>
              )}
              {activeCategory === "found" && (
                <Link
                  to="/report-found"
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Report New Found</span>
                </Link>
              )}
              {activeCategory === "matches" && (
                <Link
                  to="/matches"
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1"
                >
                  <span>Open Matches Page</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              )}
              {activeCategory === "claims" && (
                <Link
                  to="/claims"
                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1"
                >
                  <span>Open Claims Page</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              )}
              {(activeCategory === "received" || activeCategory === "active") && (
                <Link
                  to="/my-reports"
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-white text-xs font-semibold shadow-xs flex items-center gap-1"
                >
                  <span>Manage All in My Reports</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>

          {/* List Content */}
          {/* VIEW: LOST ITEMS */}
          {activeCategory === "lost" && (
            <div>
              {myLostItems.length === 0 ? (
                <div className="py-12 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-6">
                  <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No lost items reported</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">You have not submitted any lost item reports yet.</p>
                  <Link
                    to="/report-lost"
                    className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Report Lost Item</span>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myLostItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-100 dark:border-slate-800"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                              LOST
                            </span>
                            <span className="text-[10px] text-slate-400">{item.date}</span>
                          </div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate mt-1">
                            {item.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {item.location}
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                        <Link
                          to={`/item/${item.id}`}
                          className="text-indigo-600 hover:underline font-semibold text-xs flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => confirmDeleteItem(item)}
                          className="text-rose-600 hover:text-rose-800 font-semibold text-xs flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Report</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VIEW: FOUND ITEMS */}
          {activeCategory === "found" && (
            <div>
              {myFoundItems.length === 0 ? (
                <div className="py-12 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-6">
                  <PlusCircle className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No found items reported</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">You have not logged any turned-in items yet.</p>
                  <Link
                    to="/report-found"
                    className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Report Found Item</span>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myFoundItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-100 dark:border-slate-800"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                              FOUND
                            </span>
                            <span className="text-[10px] text-slate-400">{item.date}</span>
                          </div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate mt-1">
                            {item.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {item.location}
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                        <Link
                          to={`/item/${item.id}`}
                          className="text-indigo-600 hover:underline font-semibold text-xs flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => confirmDeleteItem(item)}
                          className="text-rose-600 hover:text-rose-800 font-semibold text-xs flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Report</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VIEW: POSSIBLE MATCHES */}
          {activeCategory === "matches" && (
            <div>
              {matches.length === 0 ? (
                <div className="py-12 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-6">
                  <Sparkles className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No active matches found</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">The AI engine continuously scans newly turned-in items.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {matches.map((m, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl border border-indigo-100 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/50 to-violet-50/30 dark:from-indigo-950/30 dark:to-violet-950/20 flex flex-col justify-between space-y-4"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${m.badgeColor}`}>
                            {m.score}% AI Match • {m.label}
                          </span>
                          <span className="text-[11px] text-slate-400">Found {m.foundItem.date}</span>
                        </div>

                        <div className="mt-3 space-y-1">
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            Your lost report: <span className="text-rose-600 dark:text-rose-400">{m.lostItem.title}</span>
                          </p>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            Matched found item: <span className="text-emerald-600 dark:text-emerald-400">{m.foundItem.title}</span>
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Location: {m.foundItem.location} ({m.foundItem.locationDetails || "Custody Desk"})
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between">
                        <Link
                          to={`/item/${m.foundItem.id}`}
                          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Review Details</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            setVerifyTarget(m);
                            setVerifyModalOpen(true);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Verify Ownership & Claim</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VIEW: SUCCESSFULLY RECEIVED */}
          {activeCategory === "received" && (
            <div>
              {myReceivedItems.length === 0 ? (
                <div className="py-12 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-6">
                  <CheckCircle2 className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No received items yet</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">When an approved claim is completed and handed over, it appears here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myReceivedItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white dark:bg-slate-900 border border-teal-200 dark:border-teal-900/60 rounded-2xl p-4 shadow-xs space-y-3"
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-100 dark:border-slate-800"
                        />
                        <div className="min-w-0 flex-1">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                            SUCCESSFULLY RECEIVED
                          </span>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate mt-1">
                            {item.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Reunited at {item.location}
                          </p>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                        <Link
                          to={`/item/${item.id}`}
                          className="text-teal-700 dark:text-teal-400 hover:underline font-semibold text-xs flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Item Record</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VIEW: PENDING CLAIMS */}
          {activeCategory === "claims" && (
            <div>
              {myPendingClaims.length === 0 ? (
                <div className="py-12 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-6">
                  <ShieldCheck className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No pending claims</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">You currently have no claims awaiting administrative review.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myPendingClaims.map((claim) => (
                    <div
                      key={claim.id}
                      className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-5 shadow-xs space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          CLAIM PENDING ADMIN REVIEW
                        </span>
                        <span className="text-[11px] text-slate-400">Claim #{claim.id}</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {claim.itemTitle}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">
                          {claim.proofDescription || "Private password verified."}
                        </p>
                      </div>
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                        <span>Submitted on {claim.date || "Today"}</span>
                        <Link
                          to="/claims"
                          className="font-semibold text-amber-600 hover:underline flex items-center gap-1"
                        >
                          <span>Track in Claims</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VIEW: ACTIVE REPORTS */}
          {activeCategory === "active" && (
            <div>
              {myActiveReports.length === 0 ? (
                <div className="py-12 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-6">
                  <Clock className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No active reports</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">You have no open reports in the system.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myActiveReports.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-100 dark:border-slate-800"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                item.type === "lost"
                                  ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                                  : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                              }`}
                            >
                              {item.type.toUpperCase()}
                            </span>
                            <span className="text-[10px] text-slate-400">{item.date}</span>
                          </div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate mt-1">
                            {item.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {item.location}
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                        <Link
                          to={`/item/${item.id}`}
                          className="text-indigo-600 hover:underline font-semibold text-xs flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => confirmDeleteItem(item)}
                          className="text-rose-600 hover:text-rose-800 font-semibold text-xs flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        <DeleteConfirmModal
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setItemToDelete(null);
          }}
          onConfirm={handlePerformDelete}
          title="Delete Report Confirmation"
          message="Are you sure you want to delete this report?"
        />

        {/* Ownership Verification Modal for Matches */}
        {verifyTarget && (
          <OwnershipVerifyModal
            isOpen={verifyModalOpen}
            onClose={() => {
              setVerifyModalOpen(false);
              setVerifyTarget(null);
            }}
            lostItemId={verifyTarget.lostItem.id}
            foundItemId={verifyTarget.foundItem.id}
            itemTitle={verifyTarget.foundItem.title}
            onSuccess={(claimData) => {
              loadDashboardData();
              addToast("Claim submitted successfully with status: CLAIM_PENDING_ADMIN_REVIEW", "success");
            }}
          />
        )}
      </main>
    </div>
  );
}
