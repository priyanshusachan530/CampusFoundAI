import React from "react";
import { Link } from "react-router-dom";
import {
  Shield,
  Heart,
  Target,
  Users,
  MapPin,
  Phone,
  Mail,
  Clock,
  Award,
  Sparkles,
  ArrowRight
} from "lucide-react";

export default function About() {
  const stats = [
    { value: "87.4%", label: "Item Recovery Rate", desc: "Highest across university systems" },
    { value: "< 24 Hrs", label: "Average Reunited Time", desc: "From report to verification" },
    { value: "2,400+", label: "Items Reunited", desc: "Since system launch" },
    { value: "100%", label: "Verified Custody", desc: "Campus security authenticated" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-16">
        {/* Mission Banner */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
            About Smart Lost & Found Assistant
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Connecting Our Campus Community Through Intelligent Recovery
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Every semester, thousands of valuable personal items—laptops, student IDs, keys, calculators, and backpacks—go missing across academic lecture halls, research labs, libraries, and student unions.
          </p>
        </div>

        {/* Impact Numbers */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-center shadow-xs space-y-1"
            >
              <span className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">
                {s.value}
              </span>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {s.label}
              </h4>
              <p className="text-[11px] text-slate-400">
                {s.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Problem vs Solution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
              The Campus Problem
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Fragmented, Disorganized Notice Boards
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Traditional lost-and-found boxes in individual departments create isolated silos. A wallet lost in the library and turned in at the student union often takes weeks to find—or gets lost forever due to lack of communication.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Our AI Solution
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Instant Multi-Attribute Matching & Security Handover
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              SmartFind bridges the gap with a centralized real-time catalog, instant AI matching across 6 weighted attributes, anti-fraud password protection, and security custody tracking.
            </p>
          </div>
        </div>

        {/* Campus Security Contact Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-600" />
                Central Campus Security & Lost-Property Desk
              </h3>
              <p className="text-xs text-slate-500">
                Official custodian of all turned-in personal items on campus grounds
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 w-fit">
              Open 24/7
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                <MapPin className="w-4 h-4 text-indigo-500" />
                <span>Physical Office</span>
              </div>
              <p className="text-slate-500 leading-relaxed">
                Administration Building, Ground Floor, Room 102
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                <Phone className="w-4 h-4 text-indigo-500" />
                <span>Phone Inquiry</span>
              </div>
              <p className="text-slate-500 leading-relaxed">
                Direct: (555) 019-2834<br />Campus Ext: 404
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                <Mail className="w-4 h-4 text-indigo-500" />
                <span>Email Inquiries</span>
              </div>
              <p className="text-slate-500 leading-relaxed">
                lostfound@campus.edu<br />security@campus.edu
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                <Clock className="w-4 h-4 text-indigo-500" />
                <span>Operating Hours</span>
              </div>
              <p className="text-slate-500 leading-relaxed">
                Desk Open: 24/7 Daily<br />Pickup Hours: 8 AM – 8 PM
              </p>
            </div>
          </div>
        </div>

        {/* CTA Footer */}
        <div className="text-center space-y-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Lost something on campus today?
          </h3>
          <div className="flex items-center justify-center gap-3">
            <Link
              to="/search"
              className="px-5 py-2.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition flex items-center gap-1.5"
            >
              <span>Search Campus Items</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/report-lost"
              className="px-5 py-2.5 text-xs font-bold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Report Lost Item
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
