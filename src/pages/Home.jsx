import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Compass,
  Sparkles,
  Search,
  PlusCircle,
  ShieldCheck,
  Bell,
  BarChart3,
  Camera,
  Layers,
  ArrowRight,
  CheckCircle2,
  MapPin,
  Clock,
  HelpCircle,
  Lock
} from "lucide-react";
import { getItems } from "../utils/storage.js";
import ItemCard from "../components/ItemCard.jsx";

export default function Home() {
  const items = getItems();
  const [activeTab, setActiveTab] = useState("all");

  const recentItems = items
    .filter((item) => {
      if (activeTab === "lost") return item.type === "lost";
      if (activeTab === "found") return item.type === "found";
      return true;
    })
    .slice(0, 6);

  const features = [
    {
      icon: Sparkles,
      title: "AI Item Matching",
      description:
        "Multi-attribute scoring evaluates category, brand, color, location proximity, and descriptive tokens to recommend high-confidence pairings.",
      color: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800"
    },
    {
      icon: Camera,
      title: "Image Recognition",
      description:
        "Upload photos of lost or found belongings. Prepared for automated visual feature embeddings and OCR badge extraction.",
      color: "bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400 border-sky-200 dark:border-sky-800"
    },
    {
      icon: Search,
      title: "Smart Search",
      description:
        "Type naturally like 'black wallet near library'. Our NLP parser extracts colors, campus zones, and categories instantaneously.",
      color: "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200 dark:border-amber-800"
    },
    {
      icon: Bell,
      title: "Instant Notifications",
      description:
        "Receive real-time match alerts and status progress whenever another student or security staff logs a potential match.",
      color: "bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 border-rose-200 dark:border-rose-800"
    },
    {
      icon: ShieldCheck,
      title: "Secure Claim Verification",
      description:
        "Protect valuable property through structured proof submission, private serial verification, and campus staff approval.",
      color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
    },
    {
      icon: BarChart3,
      title: "Campus Analytics",
      description:
        "Identify high-loss hotspots like the central library or cafeteria to help campus administration safeguard student belongings.",
      color: "bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400 border-purple-200 dark:border-purple-800"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-200/80 dark:border-slate-800 bg-gradient-to-b from-indigo-50/50 via-white to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI-Powered Campus Recovery Portal</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15]">
                Lost Something on <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
                  Campus?
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                CampusLinkAI uses intelligent matching to help students and staff reconnect
                with their belongings faster. Report items in seconds, discover AI-suggested matches, and claim
                verified belongings securely.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  id="hero-report-lost-btn"
                  to="/report-lost"
                  className="px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm shadow-md shadow-rose-600/20 flex items-center gap-2 transition"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Report Lost Item</span>
                </Link>

                <Link
                  id="hero-report-found-btn"
                  to="/report-found"
                  className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-600/20 flex items-center gap-2 transition"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Report Found Item</span>
                </Link>

                <Link
                  id="hero-search-btn"
                  to="/search"
                  className="px-5 py-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 font-semibold text-sm flex items-center gap-2 transition shadow-xs"
                >
                  <Search className="w-4 h-4 text-indigo-500" />
                  <span>Search Items</span>
                </Link>
              </div>

              {/* Key Trust Signals */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Zero-effort AI matching</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Campus-wide security desk integration</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Private ownership verification</span>
                </div>
              </div>
            </div>

            {/* Right Hero Graphic (Pure CSS & Icons as specified) */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md">
                {/* Decorative glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl blur-xl opacity-20 dark:opacity-30"></div>

                <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                  {/* Top Header Badge */}
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                      <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                      <span className="ml-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        SmartFind Matching Core
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      Live
                    </span>
                  </div>

                  {/* Visual Match Comparison simulation */}
                  <div className="space-y-3">
                    {/* Lost Item Sample */}
                    <div className="p-3.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                          Lost Report
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          Black Leather Wallet
                        </h4>
                        <p className="text-[11px] text-slate-500">Library 2nd Floor • 2:30 PM</p>
                      </div>
                      <span className="px-2 py-1 text-[10px] font-semibold bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200 rounded-lg">
                        Wallet
                      </span>
                    </div>

                    {/* AI Connector Line */}
                    <div className="flex items-center justify-center gap-2 py-1">
                      <div className="h-px w-12 bg-indigo-200 dark:bg-indigo-800"></div>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white shadow-xs flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-300" />
                        94% Match
                      </span>
                      <div className="h-px w-12 bg-indigo-200 dark:bg-indigo-800"></div>
                    </div>

                    {/* Found Item Sample */}
                    <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                          Found Report
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          Black Wallet with Cards
                        </h4>
                        <p className="text-[11px] text-slate-500">Library Desk • Handed in</p>
                      </div>
                      <span className="px-2 py-1 text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 rounded-lg">
                        Turned In
                      </span>
                    </div>
                  </div>

                  {/* Verification Notice */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2.5">
                    <Lock className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span>Claim ownership with security pin & ID verification</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="py-16 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Campus Intelligence
            </h2>
            <h3 className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Engineered specifically for college campuses
            </h3>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              Transforming chaotic campus Lost & Found boxes into a smart, accountable, and transparent recovery network.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  id={`feature-card-${idx}`}
                  className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition duration-200"
                >
                  <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-4 ${feature.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Live Campus Feed / Recent Items */}
      <section className="py-16 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Live Feed
              </span>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">
                Recent Campus Activity
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Check recent items reported across the library, labs, cafeterias, and hostels.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold">
              <button
                id="tab-recent-all"
                onClick={() => setActiveTab("all")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeTab === "all"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                All Activity
              </button>
              <button
                id="tab-recent-lost"
                onClick={() => setActiveTab("lost")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeTab === "lost"
                    ? "bg-rose-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Lost Only
              </button>
              <button
                id="tab-recent-found"
                onClick={() => setActiveTab("found")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeTab === "found"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Found Only
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              id="view-full-catalog-btn"
              to="/search"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs transition shadow-xs"
            >
              <span>Explore Full Campus Catalog</span>
              <ArrowRight className="w-4 h-4 text-indigo-500" />
            </Link>
          </div>
        </div>
      </section>

      {/* Campus Statistics Banner */}
      <section className="py-14 bg-indigo-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-white">89%</p>
              <p className="mt-1 text-xs text-indigo-200 font-medium">Recovery Success Rate</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-white">&lt; 4 hrs</p>
              <p className="mt-1 text-xs text-indigo-200 font-medium">Average AI Match Speed</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-white">1,400+</p>
              <p className="mt-1 text-xs text-indigo-200 font-medium">Campus Belongings Reclaimed</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-white">100%</p>
              <p className="mt-1 text-xs text-indigo-200 font-medium">Security Verified Claims</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
