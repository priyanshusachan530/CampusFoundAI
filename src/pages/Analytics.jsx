import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  BarChart3,
  MapPin,
  Tag,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  Building,
  Eye,
  ChevronRight,
  ArrowRight,
  ExternalLink
} from "lucide-react";
import { getItems, getClaims } from "../utils/storage.js";
import Sidebar from "../components/Sidebar.jsx";
import StatCard from "../components/StatCard.jsx";
import Modal from "../components/Modal.jsx";

export default function Analytics() {
  const [items, setItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  useEffect(() => {
    setItems(getItems());
    setClaims(getClaims());

    const handleUpdate = () => {
      setItems(getItems());
      setClaims(getClaims());
    };
    window.addEventListener("campuslink_data_updated", handleUpdate);
    return () => window.removeEventListener("campuslink_data_updated", handleUpdate);
  }, []);

  const totalReports = items.length;
  const totalLost = items.filter((i) => i.type === "lost").length;
  const totalFound = items.filter((i) => i.type === "found").length;
  const totalResolved = items.filter(
    (i) => i.status === "resolved" || i.status === "SUCCESSFULLY_RECEIVED"
  ).length;
  const recoveryRate = totalReports > 0 ? Math.round((totalResolved / totalReports) * 100) : 0;

  // Breakdown by category
  const categoryCounts = {};
  items.forEach((item) => {
    categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
  });
  const sortedCategories = Object.entries(categoryCounts)
    .map(([name, count]) => ({
      name,
      count,
      pct: Math.round((count / (totalReports || 1)) * 100)
    }))
    .sort((a, b) => b.count - a.count);

  // Breakdown by location
  const locationCounts = {};
  items.forEach((item) => {
    const loc = item.location || item.locationLost || item.locationFound || "Main Campus";
    locationCounts[loc] = (locationCounts[loc] || 0) + 1;
  });
  const sortedLocations = Object.entries(locationCounts)
    .map(([name, count]) => ({
      name,
      count,
      pct: Math.round((count / (totalReports || 1)) * 100)
    }))
    .sort((a, b) => b.count - a.count);

  const handleLocationClick = (locName) => {
    const matchedItems = items.filter(
      (i) => (i.location || i.locationLost || i.locationFound) === locName
    );
    const lostCount = matchedItems.filter((i) => i.type === "lost").length;
    const foundCount = matchedItems.filter((i) => i.type === "found").length;
    const resolvedCount = matchedItems.filter(
      (i) => i.status === "resolved" || i.status === "SUCCESSFULLY_RECEIVED"
    ).length;
    const rate = matchedItems.length > 0 ? Math.round((resolvedCount / matchedItems.length) * 100) : 0;

    setSelectedDetail({
      type: "location",
      title: `Campus Zone: ${locName}`,
      subtitle: `Analysis of all reports filed in or around ${locName}`,
      stats: [
        { label: "Total Reports", value: matchedItems.length, color: "text-indigo-600" },
        { label: "Lost Items", value: lostCount, color: "text-rose-600" },
        { label: "Found Items", value: foundCount, color: "text-emerald-600" },
        { label: "Recovery Rate", value: `${rate}%`, color: "text-amber-600" }
      ],
      items: matchedItems
    });
    setDetailModalOpen(true);
  };

  const handleCategoryClick = (catName) => {
    const matchedItems = items.filter((i) => i.category === catName);
    const lostCount = matchedItems.filter((i) => i.type === "lost").length;
    const foundCount = matchedItems.filter((i) => i.type === "found").length;
    const resolvedCount = matchedItems.filter(
      (i) => i.status === "resolved" || i.status === "SUCCESSFULLY_RECEIVED"
    ).length;
    const rate = matchedItems.length > 0 ? Math.round((resolvedCount / matchedItems.length) * 100) : 0;

    setSelectedDetail({
      type: "category",
      title: `Category Details: ${catName}`,
      subtitle: `Overview of cataloged belongings classified as ${catName}`,
      stats: [
        { label: "Total Belongings", value: matchedItems.length, color: "text-indigo-600" },
        { label: "Reported Lost", value: lostCount, color: "text-rose-600" },
        { label: "Turned In", value: foundCount, color: "text-emerald-600" },
        { label: "Reunited / Resolved", value: `${rate}%`, color: "text-emerald-600" }
      ],
      items: matchedItems
    });
    setDetailModalOpen(true);
  };

  const handleMetricClick = (metricType) => {
    if (metricType === "catalog") {
      setSelectedDetail({
        type: "metric",
        title: "All Cataloged Items",
        subtitle: "Full inventory of currently tracked campus items",
        stats: [
          { label: "Total", value: items.length, color: "text-indigo-600" },
          { label: "Lost", value: totalLost, color: "text-rose-600" },
          { label: "Found", value: totalFound, color: "text-emerald-600" },
          { label: "Resolved", value: totalResolved, color: "text-emerald-600" }
        ],
        items: items
      });
      setDetailModalOpen(true);
    } else if (metricType === "recovery") {
      const resolvedItems = items.filter(
        (i) => i.status === "resolved" || i.status === "SUCCESSFULLY_RECEIVED"
      );
      setSelectedDetail({
        type: "metric",
        title: "Reunited & Recovered Belongings",
        subtitle: "Items successfully returned to verified campus owners",
        stats: [
          { label: "Total Reunited", value: resolvedItems.length, color: "text-emerald-600" },
          { label: "Recovery Rate", value: `${recoveryRate}%`, color: "text-emerald-600" }
        ],
        items: resolvedItems
      });
      setDetailModalOpen(true);
    } else if (metricType === "claims") {
      const approvedClaims = claims.filter(
        (c) =>
          c.status === "Approved" ||
          c.status === "APPROVED_FOR_RETURN" ||
          c.status === "SUCCESSFULLY_RECEIVED"
      );
      setSelectedDetail({
        type: "metric",
        title: "Verified Ownership Claims",
        subtitle: "Handovers officially confirmed by campus security staff",
        stats: [
          { label: "Verified Claims", value: approvedClaims.length, color: "text-amber-600" },
          { label: "Total Submissions", value: claims.length, color: "text-slate-600" }
        ],
        claims: approvedClaims
      });
      setDetailModalOpen(true);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 flex items-center gap-1">
                <BarChart3 className="w-3.5 h-3.5" />
                CAMPUS INTELLIGENCE
              </span>
              <span className="text-xs text-slate-400">Interactive Analytics</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
              Campus Recovery & Loss Analytics
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Click any zone, category, or metric below to open the complete item details drill-down.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/search"
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition"
            >
              Browse Catalog
            </Link>
          </div>
        </div>

        {/* 4 Stat Cards with Clickable Detail Triggers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => handleMetricClick("catalog")}
            className="cursor-pointer group transition transform active:scale-[0.98]"
            title="Click to view all cataloged items"
          >
            <StatCard
              title="Total Cataloged Items"
              value={totalReports}
              subtitle="Click for detailed inventory →"
              icon={Tag}
              color="indigo"
            />
          </div>
          <div
            onClick={() => handleMetricClick("recovery")}
            className="cursor-pointer group transition transform active:scale-[0.98]"
            title="Click to view recovered items"
          >
            <StatCard
              title="Campus Recovery Rate"
              value={`${recoveryRate}%`}
              subtitle="Click to view reunited list →"
              icon={TrendingUp}
              color="emerald"
            />
          </div>
          <div className="group">
            <StatCard
              title="Average Resolution Time"
              value="1.8 Days"
              subtitle="From report to handover"
              icon={Clock}
              color="sky"
            />
          </div>
          <div
            onClick={() => handleMetricClick("claims")}
            className="cursor-pointer group transition transform active:scale-[0.98]"
            title="Click to view verified claims"
          >
            <StatCard
              title="Verified Claims"
              value={
                claims.filter(
                  (c) =>
                    c.status === "Approved" ||
                    c.status === "APPROVED_FOR_RETURN" ||
                    c.status === "SUCCESSFULLY_RECEIVED"
                ).length
              }
              subtitle="Click to inspect approvals →"
              icon={ShieldCheck}
              color="amber"
            />
          </div>
        </div>

        {/* Dual Visual Analytics Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Panel 1: High-Loss Campus Locations */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-indigo-500" />
                  High-Loss Campus Locations
                </h3>
                <p className="text-xs text-slate-500">
                  Click any zone below to view all items reported in that building
                </p>
              </div>
              <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-1 rounded-lg">
                Click to details
              </span>
            </div>

            <div className="space-y-3 pt-2">
              {sortedLocations.slice(0, 6).map((loc, idx) => (
                <div
                  key={idx}
                  onClick={() => handleLocationClick(loc.name)}
                  className="space-y-1.5 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition cursor-pointer group"
                >
                  <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                      <span className="w-4 text-slate-400 text-[10px]">#{idx + 1}</span>
                      <span>{loc.name}</span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition text-indigo-500" />
                    </span>
                    <span className="text-slate-500 font-mono">
                      {loc.count} reports ({loc.pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(loc.pct, 5)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Panel 2: Most Frequently Lost Categories */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Tag className="w-4 h-4 text-emerald-500" />
                  Most Common Belonging Categories
                </h3>
                <p className="text-xs text-slate-500">
                  Click any category to inspect all cataloged belongings in that class
                </p>
              </div>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-1 rounded-lg">
                Click to details
              </span>
            </div>

            <div className="space-y-3 pt-2">
              {sortedCategories.slice(0, 6).map((cat, idx) => (
                <div
                  key={idx}
                  onClick={() => handleCategoryClick(cat.name)}
                  className="space-y-1.5 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition cursor-pointer group"
                >
                  <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                      <span>{cat.name}</span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition text-emerald-500" />
                    </span>
                    <span className="text-slate-500 font-mono">
                      {cat.count} items ({cat.pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(cat.pct, 5)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Safety & Prevention Advice */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <Lightbulb className="w-5 h-5" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Campus Security Recommendations
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1">
              <h4 className="font-bold text-slate-900 dark:text-white">Label Expensive Electronics</h4>
              <p className="text-slate-500 leading-relaxed">
                Add an engraving or discreet label with your campus email on laptops, scientific calculators, and headphones.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1">
              <h4 className="font-bold text-slate-900 dark:text-white">Central Library Caution</h4>
              <p className="text-slate-500 leading-relaxed">
                38% of missing belongings occur during peak study hours in reading halls. Always use assigned student lockers.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1">
              <h4 className="font-bold text-slate-900 dark:text-white">Prompt Turn-in Protocol</h4>
              <p className="text-slate-500 leading-relaxed">
                If you locate unattended wallets or ID cards, submit a found report immediately and surrender custody to the Main Gate Guard.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Interactive Analytics Click-to-Details Modal */}
      {selectedDetail && (
        <Modal
          isOpen={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          title={selectedDetail.title}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-5 text-xs">
            <p className="text-slate-500 dark:text-slate-400">
              {selectedDetail.subtitle}
            </p>

            {/* Quick Stat Highlights */}
            {selectedDetail.stats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {selectedDetail.stats.map((st, i) => (
                  <div
                    key={i}
                    className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700"
                  >
                    <span className="text-[11px] text-slate-400 block">{st.label}</span>
                    <span className={`text-lg font-black ${st.color}`}>{st.value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Items List View */}
            {selectedDetail.items && (
              <div className="space-y-2">
                <div className="flex items-center justify-between pb-1">
                  <span className="font-bold text-slate-900 dark:text-white">
                    Cataloged Belongings ({selectedDetail.items.length})
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Click "View Details" to open item report
                  </span>
                </div>

                {selectedDetail.items.length === 0 ? (
                  <p className="py-6 text-center text-slate-400">No items recorded in this segment.</p>
                ) : (
                  <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                    {selectedDetail.items.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3 hover:border-indigo-300 dark:hover:border-indigo-700 transition"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-12 h-12 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 text-[9px] font-bold rounded-md uppercase ${
                                  item.type === "lost"
                                    ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                                    : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                }`}
                              >
                                {item.type}
                              </span>
                              <span className="text-[11px] text-slate-400">{item.date}</span>
                            </div>
                            <h5 className="font-bold text-slate-900 dark:text-white truncate text-xs mt-0.5">
                              {item.title}
                            </h5>
                            <p className="text-[11px] text-slate-500 truncate">
                              {item.location || item.locationLost || item.locationFound} • {item.category}
                            </p>
                          </div>
                        </div>

                        <Link
                          to={`/item/${item.id}`}
                          onClick={() => setDetailModalOpen(false)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 text-xs font-semibold shrink-0 flex items-center gap-1 border border-indigo-200 dark:border-indigo-900"
                        >
                          <span>View Details</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Claims List View */}
            {selectedDetail.claims && (
              <div className="space-y-2">
                <span className="font-bold text-slate-900 dark:text-white block pb-1">
                  Verified Claims List ({selectedDetail.claims.length})
                </span>

                <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                  {selectedDetail.claims.map((claim) => (
                    <div
                      key={claim.id}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 text-[9px] font-bold rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            VERIFIED & APPROVED
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {new Date(claim.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h5 className="font-bold text-slate-900 dark:text-white text-xs truncate">
                          {claim.itemTitle}
                        </h5>
                        <p className="text-[11px] text-slate-500">
                          Claimant: {claim.claimantName} ({claim.claimantEmail})
                        </p>
                      </div>

                      <Link
                        to={`/claims`}
                        onClick={() => setDetailModalOpen(false)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 text-xs font-semibold shrink-0"
                      >
                        Inspect Claim →
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
