import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileQuestion,
  PackageCheck,
  Sparkles,
  ShieldCheck,
  Archive,
  Users,
  Bell,
  BarChart3,
  Settings,
  ArrowLeft,
  ShieldAlert
} from "lucide-react";
import { getClaims, getItems, getMatches } from "../../utils/storage.js";
import { useAuth } from "../../context/AuthContext.jsx";

export default function AdminLayout({ children, activeTab = "dashboard" }) {
  const location = useLocation();
  const { user } = useAuth();

  const claims = getClaims();
  const pendingClaimsCount = claims.filter(
    (c) => c.status === "CLAIM_PENDING_ADMIN_REVIEW" || c.status === "Pending"
  ).length;

  const matches = getMatches();
  const pendingMatchesCount = matches.filter((m) => m.status === "PENDING").length;

  const items = getItems();
  const lostCount = items.filter((i) => i.type === "lost").length;
  const foundCount = items.filter((i) => i.type === "found").length;
  const receivedCount = items.filter(
    (i) => i.status === "SUCCESSFULLY_RECEIVED" || i.status === "resolved"
  ).length;

  const adminNavItems = [
    {
      id: "dashboard",
      name: "Dashboard Overview",
      path: "/admin",
      icon: LayoutDashboard
    },
    {
      id: "lost-items",
      name: "Lost Items",
      path: "/admin/lost-items",
      icon: FileQuestion,
      badge: lostCount
    },
    {
      id: "found-items",
      name: "Found Items",
      path: "/admin/found-items",
      icon: PackageCheck,
      badge: foundCount
    },
    {
      id: "matches",
      name: "AI Matching Engine",
      path: "/admin/matches",
      icon: Sparkles,
      badge: pendingMatchesCount > 0 ? `${pendingMatchesCount}` : null,
      badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
    },
    {
      id: "claims",
      name: "Claims & Verification",
      path: "/admin/claims",
      icon: ShieldCheck,
      badge: pendingClaimsCount > 0 ? `${pendingClaimsCount}` : null,
      badgeColor: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
    },
    {
      id: "received",
      name: "Reunited / Received",
      path: "/admin/received-items",
      icon: Archive,
      badge: receivedCount
    },
    {
      id: "users",
      name: "Campus Users",
      path: "/admin/users",
      icon: Users
    },
    {
      id: "notifications",
      name: "Broadcast Alerts",
      path: "/admin/notifications",
      icon: Bell
    },
    {
      id: "analytics",
      name: "Security Analytics",
      path: "/admin/analytics",
      icon: BarChart3
    },
    {
      id: "settings",
      name: "System Settings",
      path: "/admin/settings",
      icon: Settings
    }
  ];

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-100 dark:bg-slate-950">
      {/* Dedicated Admin Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Admin Console
              </h2>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Security Staff & Admins
              </span>
            </div>
          </div>
        </div>

        {/* Links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto text-xs">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isCurrent =
              item.path === "/admin"
                ? location.pathname === "/admin"
                : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.id}
                to={item.path}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition ${
                  isCurrent
                    ? "bg-indigo-600 text-white font-bold shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </div>
                {item.badge !== undefined && item.badge !== null && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isCurrent
                        ? "bg-white/20 text-white"
                        : item.badgeColor || "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Return to Student View */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to User Portal</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto w-full">
        {children}
      </main>
    </div>
  );
}
