import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  PlusCircle,
  Search,
  Sparkles,
  FileText,
  ShieldCheck,
  Bot,
  BarChart3,
  Bell,
  User,
  Settings,
  LogOut,
  ShieldAlert,
  ChevronRight
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { getNotifications, getClaims, getItems } from "../utils/storage.js";

export default function Sidebar({ isCollapsed = false, onToggleCollapse }) {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const notifications = getNotifications(user?.id);
  const unreadNotifs = notifications.filter((n) => !n.read).length;

  const claims = getClaims();
  const pendingClaims = claims.filter((c) => c.status === "Pending").length;

  const items = getItems();
  const myReportsCount = items.filter((i) => i.userId === user?.id).length;

  const navLinks = [
    {
      title: "Overview",
      items: [
        {
          name: isAdmin ? "Admin Dashboard" : "Student Dashboard",
          path: isAdmin ? "/admin" : "/dashboard",
          icon: LayoutDashboard,
          badge: null
        },
        {
          name: "Search Catalog",
          path: "/search",
          icon: Search,
          badge: null
        },
        {
          name: "AI Matches",
          path: "/matches",
          icon: Sparkles,
          badge: "AI",
          badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
        }
      ]
    },
    {
      title: "Reporting & Tracking",
      items: [
        {
          name: "Report Lost Item",
          path: "/report-lost",
          icon: PlusCircle,
          color: "text-rose-500"
        },
        {
          name: "Report Found Item",
          path: "/report-found",
          icon: PlusCircle,
          color: "text-emerald-500"
        },
        {
          name: "My Reports",
          path: "/my-reports",
          icon: FileText,
          badge: myReportsCount > 0 ? `${myReportsCount}` : null
        },
        {
          name: "Claims Center",
          path: "/claims",
          icon: ShieldCheck,
          badge: pendingClaims > 0 && (isAdmin || user?.role === "Security Staff") ? `${pendingClaims}` : null,
          badgeColor: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
        }
      ]
    },
    {
      title: "Intelligence & Insights",
      items: [
        {
          name: "AI Assistant",
          path: "/assistant",
          icon: Bot,
          badge: "New",
          badgeColor: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300"
        },
        {
          name: "Campus Analytics",
          path: "/analytics",
          icon: BarChart3,
          badge: null
        },
        {
          name: "Notifications",
          path: "/notifications",
          icon: Bell,
          badge: unreadNotifs > 0 ? `${unreadNotifs}` : null,
          badgeColor: "bg-rose-500 text-white"
        }
      ]
    },
    {
      title: "Account",
      items: [
        {
          name: "Profile",
          path: "/profile",
          icon: User,
          badge: null
        },
        {
          name: "Settings",
          path: "/settings",
          icon: Settings,
          badge: null
        }
      ]
    }
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside
      id="dashboard-sidebar"
      className="hidden lg:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 select-none min-h-[calc(100vh-4rem)] sticky top-16"
    >
      {/* User Header Mini Card */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
        <img
          src={user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80"}
          alt={user?.name || "User"}
          className="w-10 h-10 rounded-xl object-cover ring-2 ring-indigo-500/20"
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
            {user?.name || "Guest Student"}
          </p>
          <span className="inline-block mt-0.5 px-2 py-0.5 text-[10px] font-semibold rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300">
            {user?.role || "Student"}
          </span>
        </div>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navLinks.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            <h5 className="px-3 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {group.title}
            </h5>
            <div className="mt-1 space-y-0.5">
              {group.items.map((item, iIdx) => {
                const active = location.pathname === item.path;
                const Icon = item.icon;

                return (
                  <Link
                    key={iIdx}
                    id={`sidebar-link-${item.path.replace("/", "") || "home"}`}
                    to={item.path}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                      active
                        ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-4 h-4 ${item.color || (active ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400")}`} />
                      <span className="truncate">{item.name}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          item.badgeColor || "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* AI Assistant Quick Callout */}
      <div className="p-3 mx-3 mb-3 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/40 dark:to-violet-950/40 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <p className="text-xs font-semibold text-indigo-900 dark:text-indigo-200">Lost item advice?</p>
        </div>
        <p className="text-[11px] text-indigo-700/80 dark:text-indigo-300/80 mt-1">
          Chat with the AI Bot for instant matching tips.
        </p>
        <Link
          id="sidebar-chat-ai-cta"
          to="/assistant"
          className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          <span>Ask Assistant</span>
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Sign Out Footer */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800">
        <button
          id="sidebar-logout-btn"
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
