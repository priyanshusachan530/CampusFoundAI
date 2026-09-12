import React from "react";
import { Link } from "react-router-dom";
import { Compass, Shield, Mail, Phone, MapPin, Heart, Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer
      id="main-footer"
      className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-xs">
                <Compass className="w-4 h-4" />
              </div>
              <span className="text-base font-bold text-slate-900 dark:text-white">
                CampusLink<span className="text-indigo-600 dark:text-indigo-400">AI</span>
              </span>
            </Link>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              Find what you lost. Return what you found. CampusLinkAI is an intelligent campus platform
              empowering students, faculty, and campus security with AI-assisted item matching and verified recovery.
            </p>
            <div className="pt-2 flex items-center gap-4 text-[11px] text-slate-400 dark:text-slate-500">
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                Verified Campus Portal
              </span>
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                AI Smart Match
              </span>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h5 className="font-semibold text-slate-900 dark:text-slate-200 uppercase tracking-wider text-[11px] mb-3">
              Product
            </h5>
            <ul className="space-y-2">
              <li>
                <Link id="footer-link-home" to="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link id="footer-link-search" to="/search" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  Search Items
                </Link>
              </li>
              <li>
                <Link id="footer-link-report-lost" to="/report-lost" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  Report Lost
                </Link>
              </li>
              <li>
                <Link id="footer-link-report-found" to="/report-found" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  Report Found
                </Link>
              </li>
              <li>
                <Link id="footer-link-matches" to="/matches" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  AI Matches
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h5 className="font-semibold text-slate-900 dark:text-slate-200 uppercase tracking-wider text-[11px] mb-3">
              Support & Info
            </h5>
            <ul className="space-y-2">
              <li>
                <Link id="footer-link-how-it-works" to="/how-it-works" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  How It Works
                </Link>
              </li>
              <li>
                <Link id="footer-link-about" to="/about" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  About SmartFind
                </Link>
              </li>
              <li>
                <Link id="footer-link-assistant" to="/assistant" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  AI Chat Assistant
                </Link>
              </li>
              <li>
                <Link id="footer-link-analytics" to="/analytics" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  Campus Analytics
                </Link>
              </li>
            </ul>
          </div>

          {/* Account Links */}
          <div>
            <h5 className="font-semibold text-slate-900 dark:text-slate-200 uppercase tracking-wider text-[11px] mb-3">
              Account
            </h5>
            <ul className="space-y-2">
              <li>
                <Link id="footer-link-login" to="/login" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  Sign In
                </Link>
              </li>
              <li>
                <Link id="footer-link-register" to="/register" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  Register Account
                </Link>
              </li>
              <li>
                <Link id="footer-link-dashboard" to="/dashboard" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  Student Dashboard
                </Link>
              </li>
              <li>
                <Link id="footer-link-claims" to="/claims" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  Claims Verification
                </Link>
              </li>
              <li>
                <Link id="footer-link-settings" to="/settings" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  Settings & Preferences
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400 dark:text-slate-500">
          <p>© {new Date().getFullYear()} CampusLinkAI. Campus Security & Student Welfare Department.</p>
          <div className="flex items-center gap-4">
            <Link to="/about" className="hover:underline">Privacy Policy</Link>
            <Link to="/how-it-works" className="hover:underline">Terms of Service</Link>
            <Link to="/about" className="hover:underline">Campus Security Desk: Ext 404</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
